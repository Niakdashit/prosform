import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Search, MoreVertical, Mail, Download, Filter, Settings, Loader2, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RateLimitSettings } from "@/components/RateLimitSettings";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  background: '#f3f4f6',
  border: '#e5e7eb',
  white: '#ffffff',
  muted: '#6b7280',
};

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  campaign: string;
  campaignId: string;
  date: string;
  status: 'winner' | 'participant';
}

const ITEMS_PER_PAGE = 20;

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [filterCampaignId, setFilterCampaignId] = useState<string>('all');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { campaigns, isLoading: campaignsLoading } = useCampaigns();

  // Charger les participants depuis la base de données
  const loadParticipants = async (page: number = 1) => {
    setIsLoading(true);
    try {
      // D'abord, compter le total
      const { count } = await supabase
        .from('campaign_participants')
        .select('*', { count: 'exact', head: true });
      
      setTotalCount(count || 0);

      // Ensuite, charger la page
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          email,
          participation_data,
          prize_won,
          created_at,
          campaign_id,
          campaigns:campaign_id (name)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

        if (error) {
          console.error('Error loading participants:', error);
          return;
        }

        const formattedContacts: Contact[] = (data || []).map((p: any) => {
          const participationData = p.participation_data as any;
          const contactData = participationData?.contactData || {};
          
          // Extraire le nom depuis contactData
          const name = contactData.name || contactData.nom || 
            (contactData.prenom && contactData.nom ? `${contactData.prenom} ${contactData.nom}` : '') ||
            contactData.prenom || 'Anonyme';
          
          // Extraire l'email
          const email = p.email || contactData.email || '-';
          
          // Extraire le téléphone
          const phone = contactData.phone || contactData.telephone || contactData.tel || '-';
          
          // Déterminer si gagnant
          const isWinner = p.prize_won !== null && p.prize_won !== undefined;
          
          return {
            id: p.id,
            name,
            email,
            phone,
            campaign: p.campaigns?.name || 'Campagne inconnue',
            campaignId: p.campaign_id,
            date: p.created_at,
            status: isWinner ? 'winner' : 'participant',
          };
        });

      setContacts(formattedContacts);
    } catch (err) {
      console.error('Failed to load participants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants(currentPage);
  }, [currentPage]);

  // Supprimer un participant
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) return;
    
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('campaign_participants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.filter(c => c.id !== id));
      setTotalCount(prev => prev - 1);
      toast.success('Participant supprimé');
    } catch (err) {
      console.error('Failed to delete participant:', err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Filtrer les contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCampaign = filterCampaignId === 'all' || contact.campaignId === filterCampaignId;
    
    return matchesSearch && matchesCampaign;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Nom', 'Email', 'Téléphone', 'Campagne', 'Date', 'Statut'];
    const rows = filteredContacts.map(c => [
      c.name,
      c.email,
      c.phone,
      c.campaign,
      new Date(c.date).toLocaleDateString('fr-FR'),
      c.status === 'winner' ? 'Gagnant' : 'Participant'
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `participants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: colors.dark }}>
              Participants
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>
              {totalCount} contacts collectés
            </p>
          </div>
        </div>

        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration Rate Limiting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <div className="flex items-center justify-end mb-4">
              <button
                onClick={handleExportCSV}
                disabled={filteredContacts.length === 0}
                className="h-8 px-3 flex items-center gap-2 font-medium text-xs transition-colors rounded-md disabled:opacity-50"
                style={{ 
                  backgroundColor: colors.gold, 
                  color: colors.dark,
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Exporter CSV
              </button>
            </div>

        {/* Filters bar */}
        <div 
          className="flex items-center gap-3 p-4 mb-4"
          style={{ 
            backgroundColor: colors.white, 
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div 
            className="flex items-center gap-2 px-3 h-9 flex-1 max-w-md"
            style={{ 
              backgroundColor: colors.background, 
              borderRadius: '6px',
            }}
          >
            <Search className="w-4 h-4" style={{ color: colors.muted }} />
            <input
              type="text"
              placeholder="Rechercher un participant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm flex-1"
              style={{ color: colors.dark }}
            />
          </div>
          
          {/* Filtre par campagne */}
          <Select value={filterCampaignId} onValueChange={setFilterCampaignId}>
            <SelectTrigger className="h-9 w-48 text-xs">
              <SelectValue placeholder="Toutes les campagnes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les campagnes</SelectItem>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

            {/* Contacts table */}
            <div 
              className="overflow-x-auto"
              style={{ 
                backgroundColor: colors.white, 
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
              }}
            >
              {/* Table header */}
              <div 
                className="grid items-center px-4 h-11 text-xs font-medium"
                style={{ 
                  gridTemplateColumns: '1fr 1.5fr 140px 1fr 100px 60px',
                  backgroundColor: colors.background,
                  color: colors.muted,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <div>NOM</div>
                <div>EMAIL</div>
                <div>TÉLÉPHONE</div>
                <div>CAMPAGNE</div>
                <div>DATE</div>
                <div></div>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.gold }} />
                </div>
              )}

              {/* Empty state */}
              {!isLoading && filteredContacts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Mail className="w-10 h-10 mb-3" style={{ color: colors.muted }} />
                  <p className="text-sm" style={{ color: colors.muted }}>
                    {contacts.length === 0 
                      ? "Aucun participant pour le moment"
                      : "Aucun résultat pour cette recherche"}
                  </p>
                </div>
              )}

              {/* Table body */}
              {!isLoading && filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="grid items-center px-4 h-14 text-sm transition-colors"
                  style={{ 
                    gridTemplateColumns: '1fr 1.5fr 140px 1fr 100px 60px',
                    borderBottom: `1px solid ${colors.border}`,
                    color: colors.dark,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: `${colors.gold}20`, color: colors.dark }}
                    >
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="font-medium">{contact.name}</span>
                      {contact.status === 'winner' && (
                        <span 
                          className="ml-2 text-xs px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${colors.gold}20`, color: colors.dark }}
                        >
                          Gagnant
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs" style={{ color: colors.muted }}>
                    <Mail className="w-3.5 h-3.5" />
                    {contact.email}
                  </div>
                  
                  <div className="text-xs" style={{ color: colors.muted }}>
                    {contact.phone}
                  </div>
                  
                  <div className="text-xs truncate" style={{ color: colors.muted }}>
                    {contact.campaign}
                  </div>
                  
                  <div className="text-xs" style={{ color: colors.muted }}>
                    {new Date(contact.date).toLocaleDateString('fr-FR')}
                  </div>
                  
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => handleDelete(contact.id)}
                      disabled={deletingId === contact.id}
                      className="p-1.5 rounded transition-colors hover:bg-red-50 disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deletingId === contact.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: colors.muted }} />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div 
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderTop: `1px solid ${colors.border}` }}
                >
                  <p className="text-xs" style={{ color: colors.muted }}>
                    Page {currentPage} sur {totalPages} ({totalCount} résultats)
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => p - 1)}
                      disabled={!canGoPrev || isLoading}
                      className="p-1.5 rounded transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ border: `1px solid ${colors.border}` }}
                    >
                      <ChevronLeft className="w-4 h-4" style={{ color: colors.dark }} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!canGoNext || isLoading}
                      className="p-1.5 rounded transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ border: `1px solid ${colors.border}` }}
                    >
                      <ChevronRight className="w-4 h-4" style={{ color: colors.dark }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Sélectionner une campagne</Label>
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Choisissez une campagne..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    🌐 Paramètres par défaut (toutes les campagnes)
                  </SelectItem>
                  {campaignsLoading ? (
                    <SelectItem value="loading" disabled>
                      Chargement...
                    </SelectItem>
                  ) : campaigns.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Aucune campagne disponible
                    </SelectItem>
                  ) : (
                    campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedCampaignId ? (
              <RateLimitSettings campaignId={selectedCampaignId} />
            ) : (
              <div 
                className="flex flex-col items-center justify-center p-12 rounded-lg"
                style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
              >
                <Settings className="w-12 h-12 mb-4" style={{ color: colors.muted }} />
                <p className="text-sm" style={{ color: colors.muted }}>
                  Sélectionnez une campagne pour configurer les limites de rate limiting
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Contacts;
