/**
 * HubSpot Integration Service
 * 
 * Gère la synchronisation des données Prosplay → HubSpot
 * - Upsert de contacts
 * - Sync batch et temps réel
 * - Gestion des tokens et erreurs
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface HubSpotCredentials {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
}

export interface HubSpotContactProperties {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  // Propriétés custom Prosplay
  prosplay_user_id?: string;
  prosplay_total_participations?: number;
  prosplay_total_points?: number;
  prosplay_last_participation_date?: string;
  prosplay_favorite_campaign_type?: string;
  prosplay_subscription_status?: string;
  prosplay_created_at?: string;
  prosplay_organization_id?: string;
}

export interface HubSpotSyncResult {
  success: boolean;
  contactId?: string;
  error?: string;
}

export interface SyncStats {
  total: number;
  synced: number;
  failed: number;
  errors: Array<{ participantId: string; error: string }>;
}

// ============================================
// HUBSPOT API CLIENT
// ============================================

class HubSpotClient {
  private baseUrl = "https://api.hubapi.com";

  /**
   * Récupère le token d'accès pour une organisation
   */
  async getAccessToken(organizationId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("organization_integrations")
      .select("credentials, token_expires_at")
      .eq("organization_id", organizationId)
      .eq("provider", "hubspot")
      .eq("status", "connected")
      .single();

    if (error || !data) {
      console.error("HubSpot credentials not found:", error);
      return null;
    }

    const credentials = data.credentials as HubSpotCredentials;
    
    // Vérifier si le token est expiré
    if (data.token_expires_at && new Date(data.token_expires_at) < new Date()) {
      // TODO: Refresh le token si on a un refresh_token
      console.warn("HubSpot token expired, needs refresh");
      return null;
    }

    return credentials.access_token;
  }

  /**
   * Requête générique vers l'API HubSpot
   */
  async request<T>(
    organizationId: string,
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body?: unknown
  ): Promise<T> {
    const token = await this.getAccessToken(organizationId);
    
    if (!token) {
      throw new Error("HubSpot not connected or token expired");
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HubSpot API error: ${response.status} - ${errorData.message || response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Crée ou met à jour un contact par email (upsert)
   */
  async upsertContact(
    organizationId: string,
    properties: HubSpotContactProperties
  ): Promise<HubSpotSyncResult> {
    try {
      // Utiliser l'endpoint batch upsert pour un seul contact
      const response = await this.request<{ results: Array<{ id: string }> }>(
        organizationId,
        "POST",
        "/crm/v3/objects/contacts/batch/upsert",
        {
          inputs: [
            {
              idProperty: "email",
              id: properties.email,
              properties: this.formatProperties(properties),
            },
          ],
        }
      );

      return {
        success: true,
        contactId: response.results?.[0]?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Upsert batch de plusieurs contacts
   */
  async upsertContactsBatch(
    organizationId: string,
    contacts: HubSpotContactProperties[]
  ): Promise<SyncStats> {
    const stats: SyncStats = {
      total: contacts.length,
      synced: 0,
      failed: 0,
      errors: [],
    };

    // HubSpot limite à 100 contacts par batch
    const batches = this.chunkArray(contacts, 100);

    for (const batch of batches) {
      try {
        const response = await this.request<{ results: Array<{ id: string }> }>(
          organizationId,
          "POST",
          "/crm/v3/objects/contacts/batch/upsert",
          {
            inputs: batch.map((contact) => ({
              idProperty: "email",
              id: contact.email,
              properties: this.formatProperties(contact),
            })),
          }
        );

        stats.synced += response.results?.length || 0;
      } catch (error) {
        stats.failed += batch.length;
        batch.forEach((contact) => {
          stats.errors.push({
            participantId: contact.prosplay_user_id || contact.email,
            error: error instanceof Error ? error.message : "Batch error",
          });
        });
      }
    }

    return stats;
  }

  /**
   * Formate les propriétés pour l'API HubSpot
   */
  private formatProperties(
    properties: HubSpotContactProperties
  ): Record<string, string | number> {
    const formatted: Record<string, string | number> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value !== undefined && value !== null) {
        // HubSpot attend des strings pour la plupart des propriétés
        if (value instanceof Date) {
          // Format YYYY-MM-DD pour les dates
          formatted[key] = value.toISOString().split("T")[0];
        } else if (typeof value === "number") {
          formatted[key] = value;
        } else {
          formatted[key] = String(value);
        }
      }
    }

    return formatted;
  }

  /**
   * Divise un tableau en chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Vérifie la connexion HubSpot
   */
  async testConnection(organizationId: string): Promise<boolean> {
    try {
      await this.request(organizationId, "GET", "/crm/v3/objects/contacts?limit=1");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Récupère les propriétés custom disponibles
   */
  async getContactProperties(organizationId: string): Promise<string[]> {
    try {
      const response = await this.request<{ results: Array<{ name: string }> }>(
        organizationId,
        "GET",
        "/crm/v3/properties/contacts"
      );
      return response.results.map((p) => p.name);
    } catch {
      return [];
    }
  }

  /**
   * Crée les propriétés custom Prosplay dans HubSpot
   */
  async createProsplayProperties(organizationId: string): Promise<void> {
    const properties = [
      {
        name: "prosplay_user_id",
        label: "Prosplay User ID",
        type: "string",
        fieldType: "text",
        groupName: "contactinformation",
        description: "ID unique du participant dans Prosplay",
      },
      {
        name: "prosplay_total_participations",
        label: "Total Participations",
        type: "number",
        fieldType: "number",
        groupName: "contactinformation",
        description: "Nombre total de participations aux campagnes",
      },
      {
        name: "prosplay_total_points",
        label: "Total Points",
        type: "number",
        fieldType: "number",
        groupName: "contactinformation",
        description: "Points totaux accumulés",
      },
      {
        name: "prosplay_last_participation_date",
        label: "Dernière Participation",
        type: "date",
        fieldType: "date",
        groupName: "contactinformation",
        description: "Date de la dernière participation",
      },
      {
        name: "prosplay_favorite_campaign_type",
        label: "Type de Campagne Favori",
        type: "string",
        fieldType: "text",
        groupName: "contactinformation",
        description: "Type de campagne le plus joué (wheel, scratch, quiz...)",
      },
      {
        name: "prosplay_subscription_status",
        label: "Statut Abonnement",
        type: "enumeration",
        fieldType: "select",
        groupName: "contactinformation",
        description: "Statut de l'abonnement Prosplay",
        options: [
          { label: "Actif", value: "active" },
          { label: "Inactif", value: "inactive" },
          { label: "Essai", value: "trial" },
          { label: "Annulé", value: "canceled" },
        ],
      },
      {
        name: "prosplay_organization_id",
        label: "Prosplay Organization ID",
        type: "string",
        fieldType: "text",
        groupName: "contactinformation",
        description: "ID de l'organisation Prosplay",
      },
      {
        name: "prosplay_created_at",
        label: "Date Création Prosplay",
        type: "date",
        fieldType: "date",
        groupName: "contactinformation",
        description: "Date de création du compte dans Prosplay",
      },
    ];

    for (const prop of properties) {
      try {
        await this.request(
          organizationId,
          "POST",
          "/crm/v3/properties/contacts",
          prop
        );
        console.log(`Created HubSpot property: ${prop.name}`);
      } catch (error) {
        // La propriété existe peut-être déjà
        console.warn(`Could not create property ${prop.name}:`, error);
      }
    }
  }
}

// ============================================
// SYNC SERVICE
// ============================================

export class HubSpotSyncService {
  private client = new HubSpotClient();

  /**
   * Synchronise un participant vers HubSpot
   */
  async syncParticipant(
    organizationId: string,
    participant: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      createdAt?: string;
      stats?: {
        totalParticipations: number;
        totalPoints: number;
        lastParticipationAt?: string;
        favoriteCampaignType?: string;
      };
    }
  ): Promise<HubSpotSyncResult> {
    const properties: HubSpotContactProperties = {
      email: participant.email,
      firstname: participant.firstName,
      lastname: participant.lastName,
      phone: participant.phone,
      prosplay_user_id: participant.id,
      prosplay_organization_id: organizationId,
      prosplay_created_at: participant.createdAt,
      prosplay_total_participations: participant.stats?.totalParticipations,
      prosplay_total_points: participant.stats?.totalPoints,
      prosplay_last_participation_date: participant.stats?.lastParticipationAt,
      prosplay_favorite_campaign_type: participant.stats?.favoriteCampaignType,
    };

    const result = await this.client.upsertContact(organizationId, properties);

    // Log le résultat de la sync
    await this.logSyncResult(organizationId, participant.id, result);

    return result;
  }

  /**
   * Synchronisation batch de tous les participants modifiés
   */
  async syncAllParticipants(
    organizationId: string,
    since?: Date
  ): Promise<SyncStats> {
    // Récupérer les participants à synchroniser
    let query = supabase
      .from("campaign_participations")
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        created_at,
        updated_at,
        campaign_id
      `)
      .eq("organization_id", organizationId);

    if (since) {
      query = query.gte("updated_at", since.toISOString());
    }

    const { data: participations, error } = await query;

    if (error || !participations) {
      return {
        total: 0,
        synced: 0,
        failed: 0,
        errors: [{ participantId: "query", error: error?.message || "No data" }],
      };
    }

    // Agréger les stats par email
    const participantMap = new Map<string, HubSpotContactProperties>();

    for (const p of participations) {
      const existing = participantMap.get(p.email);
      
      if (existing) {
        // Incrémenter les stats
        existing.prosplay_total_participations = 
          (existing.prosplay_total_participations || 0) + 1;
        
        // Mettre à jour la dernière participation
        if (p.created_at > (existing.prosplay_last_participation_date || "")) {
          existing.prosplay_last_participation_date = p.created_at.split("T")[0];
        }
      } else {
        participantMap.set(p.email, {
          email: p.email,
          firstname: p.first_name,
          lastname: p.last_name,
          phone: p.phone,
          prosplay_user_id: p.id,
          prosplay_organization_id: organizationId,
          prosplay_created_at: p.created_at?.split("T")[0],
          prosplay_total_participations: 1,
          prosplay_last_participation_date: p.created_at?.split("T")[0],
        });
      }
    }

    const contacts = Array.from(participantMap.values());
    const stats = await this.client.upsertContactsBatch(organizationId, contacts);

    // Mettre à jour le timestamp de dernière sync
    await this.updateLastSyncTime(organizationId);

    return stats;
  }

  /**
   * Récupère le statut de synchronisation
   */
  async getSyncStatus(organizationId: string): Promise<{
    isConnected: boolean;
    lastSyncAt?: string;
    totalSynced?: number;
    lastError?: string;
  }> {
    const { data } = await supabase
      .from("organization_integrations")
      .select("status, last_sync_at, sync_stats, last_error")
      .eq("organization_id", organizationId)
      .eq("provider", "hubspot")
      .single();

    if (!data) {
      return { isConnected: false };
    }

    const syncStats = data.sync_stats as { totalSynced?: number } | null;

    return {
      isConnected: data.status === "connected",
      lastSyncAt: data.last_sync_at,
      totalSynced: syncStats?.totalSynced,
      lastError: data.last_error,
    };
  }

  /**
   * Met à jour le timestamp de dernière sync
   */
  private async updateLastSyncTime(organizationId: string): Promise<void> {
    await supabase
      .from("organization_integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("organization_id", organizationId)
      .eq("provider", "hubspot");
  }

  /**
   * Log le résultat d'une sync
   */
  private async logSyncResult(
    organizationId: string,
    participantId: string,
    result: HubSpotSyncResult
  ): Promise<void> {
    await supabase.from("integration_sync_logs").insert({
      organization_id: organizationId,
      provider: "hubspot",
      sync_type: "contact",
      record_id: participantId,
      status: result.success ? "success" : "error",
      error_message: result.error,
      synced_at: new Date().toISOString(),
    });
  }

  /**
   * Teste la connexion et crée les propriétés custom
   */
  async setupIntegration(organizationId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Tester la connexion
      const isConnected = await this.client.testConnection(organizationId);
      if (!isConnected) {
        return { success: false, error: "Connection test failed" };
      }

      // Créer les propriétés custom
      await this.client.createProsplayProperties(organizationId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Setup failed",
      };
    }
  }
}

// Export singleton
export const hubspotSync = new HubSpotSyncService();
export const hubspotClient = new HubSpotClient();
