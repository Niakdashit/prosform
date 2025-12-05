/**
 * HubSpot Integration Component
 * 
 * Affiche le statut de connexion HubSpot et permet de :
 * - Connecter/déconnecter HubSpot
 * - Lancer une synchronisation manuelle
 * - Voir les stats et erreurs de sync
 */

import { useState, useEffect } from "react";
import { 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle, 
  ExternalLink,
  Settings,
  Users,
  Clock,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";

interface SyncStats {
  total: number;
  synced: number;
  failed: number;
  errors?: Array<{ email: string; error: string }>;
}

interface IntegrationStatus {
  isConnected: boolean;
  lastSyncAt?: string;
  syncStats?: SyncStats;
  lastError?: string;
  realtimeEnabled?: boolean;
}

export const HubSpotIntegration = () => {
  const { currentOrganization } = useOrganization();
  const [status, setStatus] = useState<IntegrationStatus>({ isConnected: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Charger le statut de l'intégration
  useEffect(() => {
    if (currentOrganization?.id) {
      loadStatus();
    }
  }, [currentOrganization?.id]);

  const loadStatus = async () => {
    if (!currentOrganization?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("organization_integrations")
        .select("status, last_sync_at, sync_stats, last_error, realtime_sync_enabled")
        .eq("organization_id", currentOrganization.id)
        .eq("provider", "hubspot")
        .single();

      if (data) {
        setStatus({
          isConnected: data.status === "connected",
          lastSyncAt: data.last_sync_at,
          syncStats: data.sync_stats as SyncStats,
          lastError: data.last_error,
          realtimeEnabled: data.realtime_sync_enabled,
        });
      }
    } catch (error) {
      console.error("Failed to load HubSpot status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      setTokenError("Veuillez entrer votre Access Token HubSpot");
      return;
    }

    if (!currentOrganization?.id) return;

    setIsConnecting(true);
    setTokenError("");

    try {
      // Tester le token
      const testResponse = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts?limit=1",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!testResponse.ok) {
        throw new Error("Token invalide ou expiré");
      }

      // Sauvegarder l'intégration
      const { error } = await supabase
        .from("organization_integrations")
        .upsert({
          organization_id: currentOrganization.id,
          provider: "hubspot",
          status: "connected",
          credentials: { access_token: accessToken },
          connected_at: new Date().toISOString(),
        });

      if (error) throw error;

      setStatus({ isConnected: true });
      setShowConnectModal(false);
      setAccessToken("");

      // Lancer une première sync
      handleSync();

    } catch (error) {
      setTokenError(error instanceof Error ? error.message : "Erreur de connexion");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!currentOrganization?.id) return;

    try {
      await supabase
        .from("organization_integrations")
        .update({ status: "disconnected", credentials: null })
        .eq("organization_id", currentOrganization.id)
        .eq("provider", "hubspot");

      setStatus({ isConnected: false });
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const handleSync = async () => {
    if (!currentOrganization?.id) return;

    setIsSyncing(true);
    try {
      const response = await supabase.functions.invoke("sync-hubspot", {
        body: { organization_id: currentOrganization.id },
      });

      if (response.error) throw response.error;

      // Recharger le statut
      await loadStatus();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Jamais";
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF7A59]/10 flex items-center justify-center">
                <img 
                  src="https://cdn.simpleicons.org/hubspot/FF7A59" 
                  alt="HubSpot" 
                  className="w-6 h-6"
                />
              </div>
              <div>
                <CardTitle className="text-lg">HubSpot</CardTitle>
                <CardDescription>CRM, Marketing, Sales & Service Hub</CardDescription>
              </div>
            </div>
            <Badge variant={status.isConnected ? "default" : "secondary"}>
              {status.isConnected ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Connecté
                </>
              ) : (
                "Non connecté"
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {status.isConnected ? (
            <>
              {/* Stats de sync */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Users className="h-4 w-4" />
                    Contacts synchronisés
                  </div>
                  <p className="text-2xl font-semibold">
                    {status.syncStats?.synced || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Clock className="h-4 w-4" />
                    Dernière sync
                  </div>
                  <p className="text-sm font-medium">
                    {formatDate(status.lastSyncAt)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Zap className="h-4 w-4" />
                    Statut
                  </div>
                  <p className="text-sm font-medium text-green-600">
                    Actif
                  </p>
                </div>
              </div>

              {/* Mode de synchronisation */}
              <div className="p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Synchronisation temps réel</p>
                    <p className="text-xs text-muted-foreground">
                      Sync automatique à chaque participation
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={status.realtimeEnabled}
                      onChange={async (e) => {
                        if (!currentOrganization?.id) return;
                        await supabase
                          .from("organization_integrations")
                          .update({ realtime_sync_enabled: e.target.checked })
                          .eq("organization_id", currentOrganization.id)
                          .eq("provider", "hubspot");
                        loadStatus();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              {/* Erreur éventuelle */}
              {status.lastError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Erreur lors de la dernière sync</p>
                    <p className="text-xs text-red-600">{status.lastError}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleSync} 
                  disabled={isSyncing}
                  className="flex-1"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Synchronisation...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Synchroniser maintenant
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleDisconnect}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Lien vers HubSpot */}
              <a
                href="https://app.hubspot.com/contacts"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Voir les contacts dans HubSpot
              </a>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Connectez HubSpot pour synchroniser automatiquement vos participants 
                et enrichir votre CRM avec les données de vos campagnes.
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Contacts</Badge>
                <Badge variant="outline">Deals</Badge>
                <Badge variant="outline">Lists</Badge>
                <Badge variant="outline">Workflows</Badge>
              </div>

              <Button onClick={() => setShowConnectModal(true)} className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Connecter HubSpot
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de connexion */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img 
                src="https://cdn.simpleicons.org/hubspot/FF7A59" 
                alt="HubSpot" 
                className="w-6 h-6"
              />
              Connecter HubSpot
            </DialogTitle>
            <DialogDescription>
              Entrez votre Access Token HubSpot pour connecter votre compte.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Access Token <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="pat-xxx-xxxxxxxx-xxxx"
                value={accessToken}
                onChange={(e) => {
                  setAccessToken(e.target.value);
                  setTokenError("");
                }}
                className={tokenError ? "border-red-500" : ""}
              />
              {tokenError ? (
                <p className="text-xs text-red-500">{tokenError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Créez une Private App dans HubSpot pour obtenir un Access Token.
                </p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Comment obtenir un Access Token ?
              </p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Allez dans Settings → Integrations → Private Apps</li>
                <li>Cliquez sur "Create a private app"</li>
                <li>Donnez un nom (ex: "Prosplay Integration")</li>
                <li>Dans Scopes, activez : crm.objects.contacts (read/write)</li>
                <li>Créez l'app et copiez l'Access Token</li>
              </ol>
            </div>

            <a
              href="https://developers.hubspot.com/docs/api/private-apps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Documentation HubSpot Private Apps
            </a>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConnectModal(false)}
                disabled={isConnecting}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Connecter"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HubSpotIntegration;
