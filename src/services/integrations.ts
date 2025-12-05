import { supabase } from "@/integrations/supabase/client";

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
  organization_id: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  credentials: Record<string, any>;
  config: Record<string, any>;
  connected_by?: string;
  connected_at?: string;
  last_sync_at?: string;
  last_error?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FieldMapping {
  id: string;
  integration_id: string;
  source_field: string;
  source_type: "form_field" | "participant" | "campaign" | "prize";
  destination_field: string;
  destination_object: string;
  transform_type?: string;
  transform_config?: Record<string, any>;
  is_active: boolean;
  priority: number;
}

export interface CampaignIntegration {
  id: string;
  campaign_id: string;
  integration_id: string;
  action_type: string;
  trigger_event: string;
  action_config: Record<string, any>;
  conditions: any[];
  is_active: boolean;
}

export interface CustomWebhook {
  id: string;
  organization_id: string;
  campaign_id?: string;
  name: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  auth_type?: string;
  auth_config?: Record<string, any>;
  payload_template?: Record<string, any>;
  trigger_events: string[];
  retry_count: number;
  retry_delay_seconds: number;
  is_active: boolean;
  last_triggered_at?: string;
  last_status?: string;
}

export interface SyncLog {
  id: string;
  integration_id: string;
  campaign_id?: string;
  action_type: string;
  status: "success" | "error" | "partial";
  request_data?: Record<string, any>;
  response_data?: Record<string, any>;
  error_message?: string;
  records_processed: number;
  records_success: number;
  records_failed: number;
  duration_ms?: number;
  created_at: string;
}

// Service d'intégrations
class IntegrationsService {
  // ============================================
  // GESTION DES INTÉGRATIONS
  // ============================================

  async getOrganizationIntegrations(organizationId: string): Promise<Integration[]> {
    const { data, error } = await supabase
      .from("organization_integrations")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getIntegration(integrationId: string): Promise<Integration | null> {
    const { data, error } = await supabase
      .from("organization_integrations")
      .select("*")
      .eq("id", integrationId)
      .single();

    if (error) throw error;
    return data;
  }

  async getIntegrationByProvider(
    organizationId: string,
    provider: IntegrationProvider
  ): Promise<Integration | null> {
    const { data, error } = await supabase
      .from("organization_integrations")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("provider", provider)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async createIntegration(
    organizationId: string,
    provider: IntegrationProvider,
    name: string,
    credentials: Record<string, any> = {},
    config: Record<string, any> = {}
  ): Promise<Integration> {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("organization_integrations")
      .insert({
        organization_id: organizationId,
        provider,
        name,
        credentials,
        config,
        status: "pending",
        connected_by: user?.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateIntegration(
    integrationId: string,
    updates: Partial<Pick<Integration, "name" | "credentials" | "config" | "status" | "last_error">>
  ): Promise<Integration> {
    const { data, error } = await supabase
      .from("organization_integrations")
      .update(updates)
      .eq("id", integrationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async connectIntegration(
    integrationId: string,
    credentials: Record<string, any>,
    config: Record<string, any> = {}
  ): Promise<Integration> {
    const { data, error } = await supabase
      .from("organization_integrations")
      .update({
        credentials,
        config,
        status: "connected",
        connected_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", integrationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async disconnectIntegration(integrationId: string): Promise<void> {
    const { error } = await supabase
      .from("organization_integrations")
      .update({
        status: "disconnected",
        credentials: {},
      })
      .eq("id", integrationId);

    if (error) throw error;
  }

  async deleteIntegration(integrationId: string): Promise<void> {
    const { error } = await supabase
      .from("organization_integrations")
      .delete()
      .eq("id", integrationId);

    if (error) throw error;
  }

  // ============================================
  // GESTION DES MAPPINGS DE CHAMPS
  // ============================================

  async getFieldMappings(integrationId: string): Promise<FieldMapping[]> {
    const { data, error } = await supabase
      .from("integration_field_mappings")
      .select("*")
      .eq("integration_id", integrationId)
      .order("priority", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createFieldMapping(mapping: Omit<FieldMapping, "id">): Promise<FieldMapping> {
    const { data, error } = await supabase
      .from("integration_field_mappings")
      .insert(mapping)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateFieldMapping(
    mappingId: string,
    updates: Partial<FieldMapping>
  ): Promise<FieldMapping> {
    const { data, error } = await supabase
      .from("integration_field_mappings")
      .update(updates)
      .eq("id", mappingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFieldMapping(mappingId: string): Promise<void> {
    const { error } = await supabase
      .from("integration_field_mappings")
      .delete()
      .eq("id", mappingId);

    if (error) throw error;
  }

  async bulkUpdateFieldMappings(
    integrationId: string,
    mappings: Array<Omit<FieldMapping, "id" | "integration_id">>
  ): Promise<FieldMapping[]> {
    // Supprimer les anciens mappings
    await supabase
      .from("integration_field_mappings")
      .delete()
      .eq("integration_id", integrationId);

    // Créer les nouveaux
    const { data, error } = await supabase
      .from("integration_field_mappings")
      .insert(mappings.map((m) => ({ ...m, integration_id: integrationId })))
      .select();

    if (error) throw error;
    return data || [];
  }

  // ============================================
  // GESTION DES ACTIONS DE CAMPAGNE
  // ============================================

  async getCampaignIntegrations(campaignId: string): Promise<CampaignIntegration[]> {
    const { data, error } = await supabase
      .from("campaign_integrations")
      .select("*, organization_integrations(*)")
      .eq("campaign_id", campaignId);

    if (error) throw error;
    return data || [];
  }

  async createCampaignIntegration(
    integration: Omit<CampaignIntegration, "id">
  ): Promise<CampaignIntegration> {
    const { data, error } = await supabase
      .from("campaign_integrations")
      .insert(integration)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCampaignIntegration(
    id: string,
    updates: Partial<CampaignIntegration>
  ): Promise<CampaignIntegration> {
    const { data, error } = await supabase
      .from("campaign_integrations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCampaignIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from("campaign_integrations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // ============================================
  // GESTION DES WEBHOOKS
  // ============================================

  async getWebhooks(organizationId: string, campaignId?: string): Promise<CustomWebhook[]> {
    let query = supabase
      .from("custom_webhooks")
      .select("*")
      .eq("organization_id", organizationId);

    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createWebhook(webhook: Omit<CustomWebhook, "id">): Promise<CustomWebhook> {
    const { data, error } = await supabase
      .from("custom_webhooks")
      .insert(webhook)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWebhook(id: string, updates: Partial<CustomWebhook>): Promise<CustomWebhook> {
    const { data, error } = await supabase
      .from("custom_webhooks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWebhook(id: string): Promise<void> {
    const { error } = await supabase.from("custom_webhooks").delete().eq("id", id);

    if (error) throw error;
  }

  async testWebhook(webhookId: string, testData: Record<string, any>): Promise<{
    success: boolean;
    statusCode?: number;
    response?: any;
    error?: string;
  }> {
    // Appeler une edge function pour tester le webhook
    const { data, error } = await supabase.functions.invoke("test-webhook", {
      body: { webhookId, testData },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data;
  }

  // ============================================
  // LOGS DE SYNCHRONISATION
  // ============================================

  async getSyncLogs(
    integrationId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<SyncLog[]> {
    const { limit = 50, offset = 0 } = options;

    const { data, error } = await supabase
      .from("integration_sync_logs")
      .select("*")
      .eq("integration_id", integrationId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  async createSyncLog(log: Omit<SyncLog, "id" | "created_at">): Promise<SyncLog> {
    const { data, error } = await supabase
      .from("integration_sync_logs")
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================
  // OAUTH HELPERS
  // ============================================

  async createOAuthState(
    organizationId: string,
    provider: IntegrationProvider,
    redirectUrl?: string
  ): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    const state = crypto.randomUUID();

    const { error } = await supabase.from("oauth_states").insert({
      organization_id: organizationId,
      user_id: user?.user?.id,
      provider,
      state,
      redirect_url: redirectUrl,
    });

    if (error) throw error;
    return state;
  }

  async validateOAuthState(state: string): Promise<{
    organizationId: string;
    provider: IntegrationProvider;
    redirectUrl?: string;
  } | null> {
    const { data, error } = await supabase
      .from("oauth_states")
      .select("*")
      .eq("state", state)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !data) return null;

    // Supprimer le state utilisé
    await supabase.from("oauth_states").delete().eq("id", data.id);

    return {
      organizationId: data.organization_id,
      provider: data.provider,
      redirectUrl: data.redirect_url,
    };
  }

  // ============================================
  // DÉCLENCHEMENT DES INTÉGRATIONS
  // ============================================

  async triggerIntegrations(
    campaignId: string,
    event: string,
    data: Record<string, any>
  ): Promise<void> {
    // Récupérer les intégrations actives pour cette campagne et cet événement
    const { data: integrations, error } = await supabase
      .from("campaign_integrations")
      .select("*, organization_integrations(*)")
      .eq("campaign_id", campaignId)
      .eq("trigger_event", event)
      .eq("is_active", true);

    if (error) throw error;

    // Déclencher chaque intégration
    for (const integration of integrations || []) {
      try {
        await this.executeIntegrationAction(integration, data);
      } catch (err) {
        console.error(`Error triggering integration ${integration.id}:`, err);
        // Log l'erreur mais continue avec les autres intégrations
        await this.createSyncLog({
          integration_id: integration.integration_id,
          campaign_id: campaignId,
          action_type: integration.action_type,
          status: "error",
          request_data: data,
          error_message: err instanceof Error ? err.message : "Unknown error",
          records_processed: 1,
          records_success: 0,
          records_failed: 1,
        });
      }
    }

    // Déclencher les webhooks
    await this.triggerWebhooks(campaignId, event, data);
  }

  private async executeIntegrationAction(
    integration: CampaignIntegration & { organization_integrations: Integration },
    data: Record<string, any>
  ): Promise<void> {
    const startTime = Date.now();
    const provider = integration.organization_integrations.provider;

    // Appeler l'edge function appropriée
    const { data: result, error } = await supabase.functions.invoke(
      `integration-${provider}`,
      {
        body: {
          action: integration.action_type,
          credentials: integration.organization_integrations.credentials,
          config: integration.action_config,
          data,
        },
      }
    );

    const duration = Date.now() - startTime;

    // Logger le résultat
    await this.createSyncLog({
      integration_id: integration.integration_id,
      campaign_id: integration.campaign_id,
      action_type: integration.action_type,
      status: error ? "error" : "success",
      request_data: data,
      response_data: result,
      error_message: error?.message,
      records_processed: 1,
      records_success: error ? 0 : 1,
      records_failed: error ? 1 : 0,
      duration_ms: duration,
    });

    if (error) throw error;
  }

  private async triggerWebhooks(
    campaignId: string,
    event: string,
    data: Record<string, any>
  ): Promise<void> {
    const { data: webhooks, error } = await supabase
      .from("custom_webhooks")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("is_active", true)
      .contains("trigger_events", [event]);

    if (error) throw error;

    for (const webhook of webhooks || []) {
      try {
        await supabase.functions.invoke("send-webhook", {
          body: {
            webhookId: webhook.id,
            data,
          },
        });
      } catch (err) {
        console.error(`Error triggering webhook ${webhook.id}:`, err);
      }
    }
  }

  // ============================================
  // HELPERS POUR LES PROVIDERS SPÉCIFIQUES
  // ============================================

  getOAuthUrl(provider: IntegrationProvider, state: string): string {
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/api/integrations/oauth/callback`;

    const oauthConfigs: Partial<Record<IntegrationProvider, { authUrl: string; scopes: string[] }>> = {
      hubspot: {
        authUrl: "https://app.hubspot.com/oauth/authorize",
        scopes: ["crm.objects.contacts.read", "crm.objects.contacts.write", "crm.objects.deals.read", "crm.objects.deals.write"],
      },
      salesforce: {
        authUrl: "https://login.salesforce.com/services/oauth2/authorize",
        scopes: ["api", "refresh_token"],
      },
      pipedrive: {
        authUrl: "https://oauth.pipedrive.com/oauth/authorize",
        scopes: ["deals:read", "deals:write", "persons:read", "persons:write"],
      },
      mailchimp: {
        authUrl: "https://login.mailchimp.com/oauth2/authorize",
        scopes: [],
      },
      shopify: {
        authUrl: "", // Dynamique selon le shop
        scopes: ["read_customers", "write_customers", "read_orders"],
      },
      intercom: {
        authUrl: "https://app.intercom.com/oauth",
        scopes: [],
      },
      google_analytics: {
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
      },
    };

    const config = oauthConfigs[provider];
    if (!config) {
      throw new Error(`OAuth not supported for provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: import.meta.env[`VITE_${provider.toUpperCase()}_CLIENT_ID`] || "",
      redirect_uri: redirectUri,
      response_type: "code",
      state,
      scope: config.scopes.join(" "),
    });

    return `${config.authUrl}?${params.toString()}`;
  }
}

export const integrationsService = new IntegrationsService();
export default integrationsService;
