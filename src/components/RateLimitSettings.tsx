import { useState, useEffect } from 'react';
import { Shield, Save, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ExternalBackendAnalyticsService, CampaignSettings } from '@/services/ExternalBackendAnalyticsService';

interface RateLimitSettingsProps {
  campaignId: string;
}

const defaultSettings: Omit<CampaignSettings, 'id' | 'campaign_id' | 'created_at' | 'updated_at'> = {
  ip_max_attempts: 5,
  ip_window_minutes: 60,
  email_max_attempts: 3,
  email_window_minutes: 60,
  device_max_attempts: 5,
  device_window_minutes: 60,
  auto_block_enabled: true,
  block_duration_hours: 24,
};

export function RateLimitSettings({ campaignId }: RateLimitSettingsProps) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isDefaultSettings = campaignId === 'default';

  useEffect(() => {
    loadSettings();
  }, [campaignId]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Si 'default', passer null pour obtenir les paramètres globaux
      const effectiveCampaignId = isDefaultSettings ? null : campaignId;
      const data = await ExternalBackendAnalyticsService.getCampaignSettings(effectiveCampaignId as string);
      if (data) {
        setSettings({
          ip_max_attempts: data.ip_max_attempts,
          ip_window_minutes: data.ip_window_minutes,
          email_max_attempts: data.email_max_attempts,
          email_window_minutes: data.email_window_minutes,
          device_max_attempts: data.device_max_attempts,
          device_window_minutes: data.device_window_minutes,
          auto_block_enabled: data.auto_block_enabled,
          block_duration_hours: data.block_duration_hours,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Si 'default', passer null pour sauvegarder les paramètres globaux
      const effectiveCampaignId = isDefaultSettings ? null : campaignId;
      const result = await ExternalBackendAnalyticsService.updateCampaignSettings(
        effectiveCampaignId as string,
        settings
      );

      if (result) {
        toast.success('Paramètres enregistrés avec succès');
      } else {
        toast.error('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    toast.info('Paramètres réinitialisés aux valeurs par défaut');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {isDefaultSettings ? 'Paramètres par défaut' : 'Configuration Rate Limiting'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isDefaultSettings 
                ? 'Ces limites s\'appliqueront à toutes les campagnes sans configuration spécifique'
                : 'Personnalisez les limites anti-fraude pour cette campagne'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* IP Rate Limiting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Limite par IP</CardTitle>
            <CardDescription>
              Contrôlez les tentatives par adresse IP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ip_max">Tentatives maximales</Label>
              <Input
                id="ip_max"
                type="number"
                min="1"
                max="100"
                value={settings.ip_max_attempts}
                onChange={(e) =>
                  setSettings({ ...settings, ip_max_attempts: parseInt(e.target.value) || 1 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip_window">Fenêtre temporelle (minutes)</Label>
              <Input
                id="ip_window"
                type="number"
                min="1"
                max="1440"
                value={settings.ip_window_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, ip_window_minutes: parseInt(e.target.value) || 1 })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Rate Limiting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Limite par Email</CardTitle>
            <CardDescription>
              Contrôlez les tentatives par adresse email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email_max">Tentatives maximales</Label>
              <Input
                id="email_max"
                type="number"
                min="1"
                max="100"
                value={settings.email_max_attempts}
                onChange={(e) =>
                  setSettings({ ...settings, email_max_attempts: parseInt(e.target.value) || 1 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_window">Fenêtre temporelle (minutes)</Label>
              <Input
                id="email_window"
                type="number"
                min="1"
                max="1440"
                value={settings.email_window_minutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email_window_minutes: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Device Rate Limiting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Limite par Appareil</CardTitle>
            <CardDescription>
              Contrôlez les tentatives par empreinte d'appareil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="device_max">Tentatives maximales</Label>
              <Input
                id="device_max"
                type="number"
                min="1"
                max="100"
                value={settings.device_max_attempts}
                onChange={(e) =>
                  setSettings({ ...settings, device_max_attempts: parseInt(e.target.value) || 1 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device_window">Fenêtre temporelle (minutes)</Label>
              <Input
                id="device_window"
                type="number"
                min="1"
                max="1440"
                value={settings.device_window_minutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    device_window_minutes: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Blocage automatique */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blocage Automatique</CardTitle>
            <CardDescription>
              Configuration du système de blocage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto_block">Blocage automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Bloquer automatiquement après dépassement
                </p>
              </div>
              <Switch
                id="auto_block"
                checked={settings.auto_block_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, auto_block_enabled: checked })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="block_duration">Durée du blocage (heures)</Label>
              <Input
                id="block_duration"
                type="number"
                min="1"
                max="720"
                value={settings.block_duration_hours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    block_duration_hours: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-foreground">📌 Presets recommandés</h3>
            <div className="grid gap-2 sm:grid-cols-3 text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSettings({
                    ip_max_attempts: 10,
                    ip_window_minutes: 60,
                    email_max_attempts: 5,
                    email_window_minutes: 60,
                    device_max_attempts: 10,
                    device_window_minutes: 60,
                    auto_block_enabled: false,
                    block_duration_hours: 24,
                  })
                }
              >
                🟢 Permissif
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSettings({
                    ip_max_attempts: 5,
                    ip_window_minutes: 60,
                    email_max_attempts: 3,
                    email_window_minutes: 60,
                    device_max_attempts: 5,
                    device_window_minutes: 60,
                    auto_block_enabled: true,
                    block_duration_hours: 24,
                  })
                }
              >
                🟡 Standard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSettings({
                    ip_max_attempts: 3,
                    ip_window_minutes: 30,
                    email_max_attempts: 2,
                    email_window_minutes: 30,
                    device_max_attempts: 3,
                    device_window_minutes: 30,
                    auto_block_enabled: true,
                    block_duration_hours: 48,
                  })
                }
              >
                🔴 Strict
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
