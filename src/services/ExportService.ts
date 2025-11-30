import { externalSupabase } from '@/integrations/supabase/externalClient';

/**
 * Service pour exporter les données des participants
 */

export interface ParticipantExport {
  participant_id: string;
  campaign_id: string;
  campaign_title: string;
  email: string | null;
  created_at: string;
  completed_at: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  participation_data: any;
}

export const ExportService = {
  /**
   * Récupère les données d'export pour une campagne
   */
  async getParticipantsForExport(campaignId: string): Promise<ParticipantExport[]> {
    try {
      const { data, error } = await externalSupabase
        .from('participant_export_view')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching participants for export:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getParticipantsForExport:', error);
      return [];
    }
  },

  /**
   * Convertit les données en CSV
   */
  convertToCSV(data: ParticipantExport[]): string {
    if (data.length === 0) return '';

    // Headers
    const headers = [
      'ID Participant',
      'ID Campagne',
      'Titre Campagne',
      'Email',
      'Date Participation',
      'Date Complétion',
      'Appareil',
      'Navigateur',
      'OS',
      'Pays',
      'Ville',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'Referrer',
      'Données Participation',
    ];

    // Rows
    const rows = data.map((row) => [
      row.participant_id,
      row.campaign_id,
      row.campaign_title || '',
      row.email || '',
      row.created_at ? new Date(row.created_at).toLocaleString('fr-FR') : '',
      row.completed_at ? new Date(row.completed_at).toLocaleString('fr-FR') : '',
      row.device_type || '',
      row.browser || '',
      row.os || '',
      row.country || '',
      row.city || '',
      row.utm_source || '',
      row.utm_medium || '',
      row.utm_campaign || '',
      row.referrer || '',
      row.participation_data ? JSON.stringify(row.participation_data) : '',
    ]);

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Build CSV
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(String).map(escapeCSV).join(',')),
    ].join('\n');

    return csvContent;
  },

  /**
   * Télécharge un fichier CSV
   */
  downloadCSV(filename: string, csvContent: string): void {
    const blob = new Blob(['\uFEFF' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Exporte les participants d'une campagne en CSV
   */
  async exportCampaignParticipants(
    campaignId: string,
    campaignTitle: string
  ): Promise<boolean> {
    try {
      const participants = await this.getParticipantsForExport(campaignId);

      if (participants.length === 0) {
        console.warn('No participants to export');
        return false;
      }

      const csvContent = this.convertToCSV(participants);
      const filename = `${campaignTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_participants_${new Date().toISOString().split('T')[0]}.csv`;

      this.downloadCSV(filename, csvContent);
      return true;
    } catch (error) {
      console.error('Error exporting participants:', error);
      return false;
    }
  },

  /**
   * Exporte toutes les campagnes d'un utilisateur
   */
  async exportAllCampaigns(): Promise<boolean> {
    try {
      const { data, error } = await externalSupabase
        .from('participant_export_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all participants:', error);
        return false;
      }

      if (!data || data.length === 0) {
        console.warn('No participants to export');
        return false;
      }

      const csvContent = this.convertToCSV(data);
      const filename = `all_campaigns_participants_${new Date().toISOString().split('T')[0]}.csv`;

      this.downloadCSV(filename, csvContent);
      return true;
    } catch (error) {
      console.error('Error exporting all campaigns:', error);
      return false;
    }
  },
};
