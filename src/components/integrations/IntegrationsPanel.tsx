import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Check,
  X,
  ExternalLink,
  Settings2,
  RefreshCw,
  AlertCircle,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { integrationsService } from "@/services/integrations";
import { useOrganization } from "@/contexts/OrganizationContext";

// Types
export type IntegrationProvider =
  | "hubspot"
  | "salesforce"
  | "pipedrive"
  | "zoho_crm"
  | "zoho" // Alias for zoho_crm
  | "freshsales"
  | "copper"
  | "close"
  | "insightly"
  | "mailchimp"
  | "klaviyo"
  | "activecampaign"
  | "sendinblue"
  | "brevo" // New - ex Sendinblue
  | "convertkit"
  | "drip"
  | "shopify"
  | "woocommerce"
  | "bigcommerce"
  | "magento"
  | "intercom"
  | "zendesk"
  | "freshdesk"
  | "crisp"
  | "segment"
  | "mixpanel"
  | "amplitude"
  | "google_analytics"
  | "zapier"
  | "make"
  | "n8n"
  | "webhook"
  | "api";

export type IntegrationStatus = "pending" | "connected" | "disconnected" | "error" | "expired";

export interface Integration {
  id: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  connectedAt?: string;
  lastSyncAt?: string;
  lastError?: string;
}

interface IntegrationCategory {
  id: string;
  label: string;
  description: string;
  integrations: IntegrationConfig[];
}

interface AuthField {
  key: string;
  label: string;
  type: "text" | "password" | "email" | "url";
  placeholder: string;
  required: boolean;
}

interface AuthMethod {
  id: string;
  label: string;
  description: string;
  fields: AuthField[];
}

interface IntegrationConfig {
  id: IntegrationProvider;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  // New format
  authMethods?: AuthMethod[];
  // Legacy format (for backward compatibility)
  authType?: "oauth" | "api_key" | "credentials";
  authFields?: AuthField[];
  docsUrl?: string;
  marketplaceUrl?: string;
  zapierUrl?: string;
}

// Helper to get auth methods from integration config
const getAuthMethods = (integration: IntegrationConfig): AuthMethod[] => {
  if (integration.authMethods) {
    return integration.authMethods;
  }
  // Convert legacy format
  if (integration.authType === "api_key") {
    return [{
      id: "api_key",
      label: "Clé API",
      description: `Connectez avec votre clé API ${integration.name}`,
      fields: integration.authFields || [
        { key: "api_key", label: "Clé API", type: "password", placeholder: "Votre clé API", required: true }
      ],
    }];
  }
  if (integration.authType === "oauth") {
    return [{
      id: "oauth",
      label: "OAuth",
      description: `Connectez via OAuth ${integration.name}`,
      fields: integration.authFields || [],
    }];
  }
  if (integration.authType === "credentials") {
    return [{
      id: "credentials",
      label: "Identifiants",
      description: `Connectez avec vos identifiants ${integration.name}`,
      fields: integration.authFields || [],
    }];
  }
  return [];
};

// Configuration des intégrations disponibles
const integrationCategories: IntegrationCategory[] = [
  {
    id: "crm",
    label: "CRM",
    description: "Synchronisez vos contacts et deals",
    integrations: [
      {
        id: "hubspot",
        name: "HubSpot",
        description: "CRM, Marketing, Sales & Service Hub",
        icon: "https://cdn.simpleicons.org/hubspot/FF7A59",
        color: "#FF7A59",
        features: ["Contacts", "Deals", "Lists", "Workflows"],
        authMethods: [
          {
            id: "api_key",
            label: "Clé API privée",
            description: "Connectez via une Private App HubSpot (recommandé)",
            fields: [
              { key: "api_key", label: "Access Token", type: "password", placeholder: "pat-xxx-xxxxxxxx-xxxx", required: true },
            ],
          },
        ],
        docsUrl: "https://developers.hubspot.com/docs/api/private-apps",
      },
      {
        id: "salesforce",
        name: "Salesforce",
        description: "CRM leader mondial",
        icon: "https://cdn.simpleicons.org/salesforce/00A1E0",
        color: "#00A1E0",
        features: ["Leads", "Contacts", "Opportunities", "Campaigns"],
        authMethods: [
          {
            id: "connected_app",
            label: "Connected App",
            description: "Connectez via une Connected App Salesforce",
            fields: [
              { key: "instance_url", label: "URL de l'instance", type: "url", placeholder: "https://votre-instance.salesforce.com", required: true },
              { key: "client_id", label: "Consumer Key", type: "text", placeholder: "Votre Consumer Key", required: true },
              { key: "client_secret", label: "Consumer Secret", type: "password", placeholder: "Votre Consumer Secret", required: true },
            ],
          },
        ],
        docsUrl: "https://developer.salesforce.com/docs",
      },
      {
        id: "pipedrive",
        name: "Pipedrive",
        description: "CRM orienté ventes",
        icon: "https://cdn.simpleicons.org/pipedrive/1A1A1A",
        color: "#1A1A1A",
        features: ["Persons", "Deals", "Organizations", "Activities"],
        authMethods: [
          {
            id: "api_token",
            label: "Token API",
            description: "Connectez avec votre token API Pipedrive",
            fields: [
              { key: "api_token", label: "Token API", type: "password", placeholder: "Votre token API Pipedrive", required: true },
            ],
          },
        ],
        docsUrl: "https://developers.pipedrive.com/docs/api/v1",
      },
      {
        id: "zoho_crm",
        name: "Zoho CRM",
        description: "Suite CRM complète",
        icon: "https://cdn.simpleicons.org/zoho/C8202B",
        color: "#C8202B",
        features: ["Leads", "Contacts", "Deals", "Campaigns"],
        authMethods: [
          {
            id: "oauth",
            label: "OAuth / Self Client",
            description: "Connectez via l'API Zoho CRM",
            fields: [
              { key: "client_id", label: "Client ID", type: "text", placeholder: "Votre Client ID Zoho", required: true },
              { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Votre Client Secret", required: true },
              { key: "refresh_token", label: "Refresh Token", type: "password", placeholder: "Votre Refresh Token", required: true },
            ],
          },
        ],
        docsUrl: "https://www.zoho.com/crm/developer/docs/api/v2/",
      },
      {
        id: "freshsales",
        name: "Freshsales",
        description: "CRM par Freshworks",
        icon: "https://cdn.simpleicons.org/freshworks/F26722",
        color: "#F26722",
        features: ["Contacts", "Deals", "Accounts", "Tasks"],
        authMethods: [
          {
            id: "api_key",
            label: "Clé API",
            description: "Connectez avec votre clé API Freshsales",
            fields: [
              { key: "domain", label: "Domaine", type: "text", placeholder: "votre-domaine.freshsales.io", required: true },
              { key: "api_key", label: "Clé API", type: "password", placeholder: "Votre clé API Freshsales", required: true },
            ],
          },
        ],
        docsUrl: "https://developers.freshworks.com/crm/api/",
      },
      {
        id: "copper",
        name: "Copper",
        description: "CRM pour Google Workspace",
        icon: "https://cdn.simpleicons.org/copper/F8A01A",
        color: "#F8A01A",
        features: ["People", "Companies", "Opportunities", "Tasks"],
        authMethods: [
          {
            id: "api_key",
            label: "Clé API",
            description: "Connectez avec votre clé API Copper",
            fields: [
              { key: "api_key", label: "Clé API", type: "password", placeholder: "Votre clé API Copper", required: true },
              { key: "email", label: "Email du compte", type: "email", placeholder: "votre@email.com", required: true },
            ],
          },
        ],
        docsUrl: "https://developer.copper.com/",
      },
      {
        id: "close",
        name: "Close",
        description: "CRM pour équipes de vente",
        icon: "https://cdn.simpleicons.org/close/1A1A1A",
        color: "#1A1A1A",
        features: ["Leads", "Contacts", "Opportunities", "Activities"],
        authMethods: [
          {
            id: "api_key",
            label: "Clé API",
            description: "Connectez avec votre clé API Close",
            fields: [
              { key: "api_key", label: "Clé API", type: "password", placeholder: "api_xxxxx", required: true },
            ],
          },
        ],
        docsUrl: "https://developer.close.com/",
      },
      {
        id: "insightly",
        name: "Insightly",
        description: "CRM et gestion de projets",
        icon: "https://cdn.simpleicons.org/insightly/5C2D91",
        color: "#5C2D91",
        features: ["Contacts", "Organizations", "Opportunities", "Projects"],
        authMethods: [
          {
            id: "api_key",
            label: "Clé API",
            description: "Connectez avec votre clé API Insightly",
            fields: [
              { key: "api_key", label: "Clé API", type: "password", placeholder: "Votre clé API Insightly", required: true },
            ],
          },
        ],
        docsUrl: "https://api.insightly.com/v3.1/Help",
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing Automation",
    description: "Automatisez vos campagnes email",
    integrations: [
      {
        id: "mailchimp",
        name: "Mailchimp",
        description: "Email marketing & automation",
        icon: "https://cdn.simpleicons.org/mailchimp/FFE01B",
        color: "#FFE01B",
        features: ["Lists", "Campaigns", "Automations", "Tags"],
        authMethods: [
          {
            id: "api_key",
            label: "Clé API",
            description: "Connectez avec votre clé API Mailchimp",
            fields: [
              { key: "api_key", label: "Clé API", type: "password", placeholder: "xxxxxxxx-us1", required: true },
              { key: "list_id", label: "ID de la liste (Audience)", type: "text", placeholder: "abc123def4", required: true },
              { key: "server_prefix", label: "Préfixe serveur", type: "text", placeholder: "us1 (extrait de la clé API)", required: false },
            ],
          },
        ],
        docsUrl: "https://mailchimp.com/developer/",
      },
      {
        id: "klaviyo",
        name: "Klaviyo",
        description: "Marketing automation e-commerce",
        icon: "https://cdn.simpleicons.org/klaviyo/000000",
        color: "#000000",
        features: ["Profiles", "Lists", "Flows", "Campaigns"],
        authMethods: [
          {
            id: "api_key",
            label: "Clé API",
            description: "Connectez avec votre clé API Klaviyo",
            fields: [
              { key: "api_key", label: "Clé API privée", type: "password", placeholder: "pk_xxxxxxxx", required: true },
            ],
          },
        ],
        docsUrl: "https://developers.klaviyo.com/",
      },
      {
        id: "activecampaign",
        name: "ActiveCampaign",
        description: "Email marketing & CRM",
        icon: "https://cdn.simpleicons.org/activecampaign/356AE6",
        color: "#356AE6",
        features: ["Contacts", "Lists", "Automations", "Deals"],
        authMethods: [
          {
            id: "api_key",
            label: "Clé API",
            description: "Connectez avec votre clé API ActiveCampaign",
            fields: [
              { key: "api_url", label: "URL de l'API", type: "url", placeholder: "https://votre-compte.api-us1.com", required: true },
              { key: "api_key", label: "Clé API", type: "password", placeholder: "Votre clé API ActiveCampaign", required: true },
            ],
          },
        ],
        docsUrl: "https://developers.activecampaign.com/",
      },
      {
        id: "brevo",
        name: "Brevo (ex-Sendinblue)",
        description: "Marketing digital tout-en-un",
        icon: "https://cdn.simpleicons.org/brevo/0B996E",
        color: "#0B996E",
        features: ["Contacts", "Lists", "Campaigns", "Automations", "SMS"],
        authMethods: [
          {
            id: "api_key",
            label: "Clé API",
            description: "Connectez avec votre clé API Brevo",
            fields: [
              { key: "api_key", label: "Clé API", type: "password", placeholder: "xkeysib-xxxxxxxx", required: true },
            ],
          },
        ],
        docsUrl: "https://developers.brevo.com/",
      },
      {
        id: "convertkit",
        name: "ConvertKit",
        description: "Email marketing pour créateurs",
        icon: "https://cdn.simpleicons.org/convertkit/FB6970",
        color: "#FB6970",
        features: ["Subscribers", "Tags", "Sequences", "Forms"],
        authMethods: [
          {
            id: "api_key",
            label: "Clé API",
            description: "Connectez avec votre clé API ConvertKit",
            fields: [
              { key: "api_key", label: "Clé API", type: "password", placeholder: "Votre clé API ConvertKit", required: true },
              { key: "api_secret", label: "API Secret", type: "password", placeholder: "Votre API Secret (optionnel)", required: false },
            ],
          },
        ],
        docsUrl: "https://developers.convertkit.com/",
      },
      {
        id: "drip",
        name: "Drip",
        description: "ECRM pour e-commerce",
        icon: "https://cdn.simpleicons.org/drip/EA5F8B",
        color: "#EA5F8B",
        features: ["Subscribers", "Tags", "Workflows", "Campaigns"],
        authMethods: [
          {
            id: "api_key",
            label: "Clé API",
            description: "Connectez avec votre clé API Drip",
            fields: [
              { key: "api_key", label: "Clé API", type: "password", placeholder: "Votre clé API Drip", required: true },
              { key: "account_id", label: "Account ID", type: "text", placeholder: "Votre Account ID", required: true },
            ],
          },
        ],
        docsUrl: "https://developer.drip.com/",
      },
    ],
  },
  // Les catégories suivantes sont masquées car non implémentées
  // E-commerce, Communication, Analytics, Automation seront ajoutées ultérieurement
];

interface IntegrationsPanelProps {
  connectedIntegrations?: Integration[];
  onConnect?: (provider: IntegrationProvider) => void;
  onDisconnect?: (integrationId: string) => void;
  onConfigure?: (integration: Integration) => void;
  onSync?: (integrationId: string) => void;
}

export const IntegrationsPanel = ({
  connectedIntegrations = [],
  onConnect,
  onDisconnect,
  onConfigure,
  onSync,
}: IntegrationsPanelProps) => {
  const { currentOrganization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [credentialsError, setCredentialsError] = useState("");
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  // Filtrer les intégrations
  const filteredCategories = integrationCategories
    .map((category) => ({
      ...category,
      integrations: category.integrations.filter(
        (integration) =>
          integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          integration.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.integrations.length > 0);

  // Vérifier si une intégration est connectée
  const getConnectionStatus = (provider: IntegrationProvider): Integration | undefined => {
    return connectedIntegrations.find((i) => i.provider === provider);
  };

  const handleConnectClick = (integration: IntegrationConfig) => {
    setSelectedIntegration(integration);
    setShowConnectModal(true);
    setCredentials({});
    setCredentialsError("");
    const methods = getAuthMethods(integration);
    setSelectedAuthMethod(methods.length > 0 ? methods[0].id : "");
    setConnectionSuccess(false);
  };

  const handleConnect = async () => {
    if (!selectedIntegration) return;
    if (!currentOrganization?.id) {
      setCredentialsError("Aucune organisation sélectionnée");
      return;
    }
    
    const authMethods = getAuthMethods(selectedIntegration);
    const currentMethod = authMethods.find(m => m.id === selectedAuthMethod);
    
    // Si c'est Zapier, ouvrir le lien
    if (selectedAuthMethod === "zapier" && selectedIntegration.zapierUrl) {
      window.open(selectedIntegration.zapierUrl, "_blank");
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Vérifier que tous les champs requis sont remplis
      const fields = currentMethod?.fields || [];
      const missingFields = fields.filter(
        (field) => field.required && !credentials[field.key]?.trim()
      );
      
      if (missingFields.length > 0) {
        setCredentialsError(`Veuillez remplir : ${missingFields.map(f => f.label).join(", ")}`);
        setIsConnecting(false);
        return;
      }
      
      // Vérifier si l'intégration existe déjà
      const existingIntegration = await integrationsService.getIntegrationByProvider(
        currentOrganization.id,
        selectedIntegration.id as any
      );
      
      if (existingIntegration) {
        // Mettre à jour l'intégration existante
        await integrationsService.connectIntegration(
          existingIntegration.id,
          credentials,
          { auth_method: selectedAuthMethod }
        );
      } else {
        // Créer une nouvelle intégration
        const newIntegration = await integrationsService.createIntegration(
          currentOrganization.id,
          selectedIntegration.id as any,
          selectedIntegration.name,
          credentials,
          { auth_method: selectedAuthMethod }
        );
        
        // Mettre à jour le statut à "connected"
        await integrationsService.connectIntegration(
          newIntegration.id,
          credentials,
          { auth_method: selectedAuthMethod }
        );
      }
      
      setConnectionSuccess(true);
      
      if (onConnect) {
        onConnect(selectedIntegration.id);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setCredentialsError("Erreur lors de la connexion: " + (error as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleCloseModal = () => {
    setShowConnectModal(false);
    setSelectedIntegration(null);
    setCredentials({});
    setCredentialsError("");
    setConnectionSuccess(false);
  };
  
  const updateCredential = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
    setCredentialsError("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header avec recherche */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Intégrations</h2>
          <Badge variant="secondary" className="text-xs">
            {connectedIntegrations.filter((i) => i.status === "connected").length} connectées
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une intégration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Liste des intégrations */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-3">
              {/* Category header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{category.label}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </div>

              {/* Integrations grid */}
              <div className="grid grid-cols-1 gap-2">
                {category.integrations.map((integration) => {
                  const connection = getConnectionStatus(integration.id);
                  const isConnected = connection?.status === "connected";
                  const hasError = connection?.status === "error";

                  return (
                    <div
                      key={integration.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        isConnected
                          ? "border-green-500/30 bg-green-500/5"
                          : hasError
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-border hover:border-primary/30 hover:bg-accent/50"
                      )}
                    >
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${integration.color}15` }}
                      >
                        <img
                          src={integration.icon}
                          alt={integration.name}
                          className="w-6 h-6"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {integration.name}
                          </span>
                          {isConnected && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 px-1.5 border-green-500/50 text-green-600"
                            >
                              <Check className="w-2.5 h-2.5 mr-0.5" />
                              Connecté
                            </Badge>
                          )}
                          {hasError && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 px-1.5 border-red-500/50 text-red-600"
                            >
                              <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                              Erreur
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {integration.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {isConnected ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => onSync?.(connection.id)}
                              title="Synchroniser"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => onConfigure?.(connection)}
                              title="Configurer"
                            >
                              <Settings2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                              onClick={() => onDisconnect?.(connection.id)}
                              title="Déconnecter"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleConnectClick(integration)}
                          >
                            <Zap className="h-3 w-3" />
                            Connecter
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Modal de connexion */}
      <Dialog open={showConnectModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedIntegration && (
                <>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${selectedIntegration.color}15` }}
                  >
                    <img
                      src={selectedIntegration.icon}
                      alt={selectedIntegration.name}
                      className="w-6 h-6"
                    />
                  </div>
                  <span>
                    {connectionSuccess ? `${selectedIntegration.name} connecté !` : `Connecter ${selectedIntegration.name}`}
                  </span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedIntegration && (
            <div className="space-y-4 py-4">
              {/* Success state */}
              {connectionSuccess ? (
                <div className="flex flex-col items-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Connexion réussie !</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedIntegration.name} est maintenant connecté à votre compte.
                    </p>
                  </div>
                  <Button onClick={handleCloseModal} className="mt-2">
                    Fermer
                  </Button>
                </div>
              ) : (
                <>
                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Fonctionnalités disponibles :</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedIntegration.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Auth method selection */}
                  {(() => {
                    const authMethods = getAuthMethods(selectedIntegration);
                    const currentMethod = authMethods.find(m => m.id === selectedAuthMethod);
                    
                    return (
                      <div className="space-y-4">
                        {/* Method tabs if multiple methods */}
                        {authMethods.length > 1 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Méthode de connexion :</p>
                            <div className="flex gap-2">
                              {authMethods.map((method) => (
                                <button
                                  key={method.id}
                                  onClick={() => {
                                    setSelectedAuthMethod(method.id);
                                    setCredentials({});
                                    setCredentialsError("");
                                  }}
                                  className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                                    selectedAuthMethod === method.id
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  <p className="text-sm font-medium">{method.label}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Fields for current method */}
                        {currentMethod && currentMethod.fields.length > 0 && (
                          <div className="space-y-3">
                            {currentMethod.fields.map((field) => (
                              <div key={field.key} className="space-y-2">
                                <label className="text-sm font-medium">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <Input
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  value={credentials[field.key] || ""}
                                  onChange={(e) => updateCredential(field.key, e.target.value)}
                                  className={credentialsError && field.required && !credentials[field.key] ? "border-red-500" : ""}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Zapier redirect message */}
                        {selectedAuthMethod === "zapier" && (
                          <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                            <p className="text-sm text-orange-800">
                              Vous serez redirigé vers Zapier pour configurer l'intégration avec {selectedIntegration.name}.
                            </p>
                          </div>
                        )}

                        {credentialsError && (
                          <p className="text-xs text-red-500">{credentialsError}</p>
                        )}

                        {/* Documentation link */}
                        {selectedIntegration.docsUrl && selectedAuthMethod !== "zapier" && (
                          <a
                            href={selectedIntegration.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Comment obtenir ces informations sur {selectedIntegration.name} ?
                          </a>
                        )}
                      </div>
                    );
                  })()}

                  {/* Info message */}
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    <p className="text-muted-foreground">
                      Vos informations de connexion seront stockées de manière sécurisée et chiffrée.
                    </p>
                  </div>

                  {/* Connect button */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={handleCloseModal} disabled={isConnecting}>
                      Annuler
                    </Button>
                    <Button onClick={handleConnect} disabled={isConnecting} className="gap-1.5">
                      {isConnecting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Connexion...
                        </>
                      ) : selectedAuthMethod === "zapier" ? (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Ouvrir Zapier
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Connecter
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsPanel;
