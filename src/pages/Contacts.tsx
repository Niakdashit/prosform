import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Search, MoreVertical, Mail, Download, Filter, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RateLimitSettings } from "@/components/RateLimitSettings";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  date: string;
  status: 'winner' | 'participant';
}

const mockContacts: Contact[] = [
  { id: '1', name: 'Marie Dupont', email: 'marie.dupont@email.com', phone: '+33 6 12 34 56 78', campaign: 'Jeu concours été 2024', date: '2024-07-15', status: 'winner' },
  { id: '2', name: 'Jean Martin', email: 'jean.martin@email.com', phone: '+33 6 98 76 54 32', campaign: 'Quiz produits', date: '2024-07-14', status: 'participant' },
  { id: '3', name: 'Sophie Bernard', email: 'sophie.b@email.com', phone: '+33 6 11 22 33 44', campaign: 'Jeu concours été 2024', date: '2024-07-14', status: 'winner' },
  { id: '4', name: 'Pierre Durand', email: 'p.durand@email.com', phone: '+33 6 55 66 77 88', campaign: 'Jackpot anniversaire', date: '2024-07-13', status: 'participant' },
  { id: '5', name: 'Claire Moreau', email: 'claire.moreau@email.com', phone: '+33 6 99 88 77 66', campaign: 'Scratch & Win', date: '2024-07-12', status: 'winner' },
];

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const { campaigns, isLoading: campaignsLoading } = useCampaigns();

  const filteredContacts = mockContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              {mockContacts.length} contacts collectés
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
                className="h-8 px-3 flex items-center gap-2 font-medium text-xs transition-colors rounded-md"
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
          <button 
            className="h-9 px-3 flex items-center gap-2 text-xs font-medium rounded-md transition-colors hover:bg-gray-100"
            style={{ border: `1px solid ${colors.border}`, color: colors.dark }}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtres
          </button>
        </div>

            {/* Contacts table */}
            <div 
              style={{ 
                backgroundColor: colors.white, 
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                overflow: 'hidden',
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

              {/* Table body */}
              {filteredContacts.map((contact) => (
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
                  
                  <div className="flex items-center justify-end">
                    <button className="p-1.5 rounded transition-colors hover:bg-gray-100">
                      <MoreVertical className="w-4 h-4" style={{ color: colors.muted }} />
                    </button>
                  </div>
                </div>
              ))}
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
