import { useState } from "react";
import { 
  Search, 
  MoreVertical, 
  LayoutGrid,
  List,
  Calendar,
  Users,
  Gift,
  HelpCircle,
  Dices,
  CircleDot
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";

// Types
type CampaignType = 'form' | 'wheel' | 'quiz' | 'jackpot' | 'scratch';
type CampaignStatus = 'online' | 'draft' | 'ended';
type CampaignMode = 'fullscreen' | 'embed' | 'popup';

interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  mode: CampaignMode;
  status: CampaignStatus;
  daysRemaining: number | null;
  participants: number;
  createdAt: string;
}

// Mock data
const mockCampaigns: Campaign[] = [
  { id: '1', name: 'Jeu concours été 2024', type: 'wheel', mode: 'fullscreen', status: 'online', daysRemaining: 45, participants: 1247, createdAt: '2024-06-15' },
  { id: '2', name: 'Quiz produits', type: 'quiz', mode: 'embed', status: 'online', daysRemaining: 12, participants: 856, createdAt: '2024-07-01' },
  { id: '3', name: 'Formulaire inscription', type: 'form', mode: 'popup', status: 'draft', daysRemaining: null, participants: 0, createdAt: '2024-07-10' },
  { id: '4', name: 'Jackpot anniversaire', type: 'jackpot', mode: 'fullscreen', status: 'online', daysRemaining: 30, participants: 2341, createdAt: '2024-05-20' },
  { id: '5', name: 'Scratch & Win', type: 'scratch', mode: 'fullscreen', status: 'ended', daysRemaining: 0, participants: 5621, createdAt: '2024-04-01' },
  { id: '6', name: 'Sondage satisfaction', type: 'form', mode: 'embed', status: 'draft', daysRemaining: null, participants: 0, createdAt: '2024-07-12' },
];

// Couleurs DA - harmonisées avec /form
const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  background: '#f3f4f6', // Fond gris clair comme /form
  card: '#ffffff',
  border: '#e5e7eb',
  white: '#ffffff',
  success: '#22c55e',
  warning: '#f59e0b',
  muted: '#6b7280',
  text: '#374151',
};

const typeIcons: Record<CampaignType, React.ReactNode> = {
  form: <List className="w-4 h-4" />,
  wheel: <CircleDot className="w-4 h-4" />,
  quiz: <HelpCircle className="w-4 h-4" />,
  jackpot: <Dices className="w-4 h-4" />,
  scratch: <Gift className="w-4 h-4" />,
};

const typeLabels: Record<CampaignType, string> = {
  form: 'Formulaire',
  wheel: 'Roue',
  quiz: 'Quiz',
  jackpot: 'Jackpot',
  scratch: 'Scratch',
};

const modeLabels: Record<CampaignMode, string> = {
  fullscreen: 'Plein écran',
  embed: 'Intégré',
  popup: 'Popup',
};

const StatusBadge = ({ status }: { status: CampaignStatus }) => {
  const styles: Record<CampaignStatus, { bg: string; text: string; label: string }> = {
    online: { bg: 'rgba(34, 197, 94, 0.15)', text: colors.success, label: 'En ligne' },
    draft: { bg: 'rgba(156, 163, 175, 0.15)', text: colors.muted, label: 'Brouillon' },
    ended: { bg: 'rgba(245, 158, 11, 0.15)', text: colors.warning, label: 'Terminé' },
  };
  
  const style = styles[status];
  
  return (
    <span 
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
      style={{ 
        backgroundColor: style.bg, 
        color: style.text,
        borderRadius: '4px',
      }}
    >
      {status === 'online' && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {style.label}
    </span>
  );
};

const Campaigns = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CampaignStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateCampaign = (type: CampaignType) => {
    const routes: Record<CampaignType, string> = {
      form: '/form',
      wheel: '/wheel',
      quiz: '/quiz',
      jackpot: '/jackpot',
      scratch: '/scratch',
    };
    navigate(routes[type]);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    const routes: Record<CampaignType, string> = {
      form: '/form',
      wheel: '/wheel',
      quiz: '/quiz',
      jackpot: '/jackpot',
      scratch: '/scratch',
    };
    navigate(routes[campaign.type]);
  };

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold" style={{ color: colors.dark }}>
            Campagnes
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.muted }}>
            {filteredCampaigns.length} campagne{filteredCampaigns.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total campagnes', value: mockCampaigns.length, icon: LayoutGrid },
            { label: 'En ligne', value: mockCampaigns.filter(c => c.status === 'online').length, icon: CircleDot },
            { label: 'Participants', value: mockCampaigns.reduce((acc, c) => acc + c.participants, 0).toLocaleString(), icon: Users },
            { label: 'Ce mois', value: mockCampaigns.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: Calendar },
          ].map((stat, i) => (
            <div 
              key={i}
              className="p-4"
              style={{ 
                backgroundColor: colors.white, 
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: colors.muted }}>
                  {stat.label}
                </span>
                <stat.icon className="w-4 h-4" style={{ color: colors.gold }} />
              </div>
              <p className="text-2xl font-semibold" style={{ color: colors.dark }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters bar */}
        <div 
          className="flex items-center justify-between p-4 mb-4"
          style={{ 
            backgroundColor: colors.white, 
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-3">
            {/* Search */}
            <div 
              className="flex items-center gap-2 px-3 h-9"
              style={{ 
                backgroundColor: colors.border, 
                borderRadius: '6px',
                width: '280px',
              }}
            >
              <Search className="w-4 h-4" style={{ color: colors.muted }} />
              <input
                type="text"
                placeholder="Rechercher une campagne..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm flex-1"
                style={{ color: colors.dark }}
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 p-1" style={{ backgroundColor: colors.border, borderRadius: '6px' }}>
              {(['all', 'online', 'draft', 'ended'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{ 
                    backgroundColor: statusFilter === status ? colors.white : 'transparent',
                    color: statusFilter === status ? colors.dark : colors.muted,
                    borderRadius: '4px',
                  }}
                >
                  {status === 'all' ? 'Tous' : status === 'online' ? 'En ligne' : status === 'draft' ? 'Brouillons' : 'Terminés'}
                </button>
              ))}
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1" style={{ backgroundColor: colors.border, borderRadius: '6px' }}>
            <button
              onClick={() => setViewMode('list')}
              className="p-1.5 transition-colors"
              style={{ 
                backgroundColor: viewMode === 'list' ? colors.white : 'transparent',
                borderRadius: '4px',
              }}
            >
              <List className="w-4 h-4" style={{ color: viewMode === 'list' ? colors.dark : colors.muted }} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className="p-1.5 transition-colors"
              style={{ 
                backgroundColor: viewMode === 'grid' ? colors.white : 'transparent',
                borderRadius: '4px',
              }}
            >
              <LayoutGrid className="w-4 h-4" style={{ color: viewMode === 'grid' ? colors.dark : colors.muted }} />
            </button>
          </div>
        </div>

        {/* Campaigns - List or Grid view */}
        {viewMode === 'list' ? (
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
                gridTemplateColumns: '40px 1fr 120px 200px 120px 140px 60px',
                backgroundColor: colors.background,
                color: colors.muted,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: colors.gold }}
                />
              </div>
              <div>CAMPAGNE</div>
              <div>TYPE</div>
              <div>MODE</div>
              <div>STATUT</div>
              <div>PÉRIODE</div>
              <div></div>
            </div>

            {/* Table body */}
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="grid items-center px-4 h-14 text-sm transition-colors cursor-pointer"
                style={{ 
                  gridTemplateColumns: '40px 1fr 120px 200px 120px 140px 60px',
                  borderBottom: `1px solid ${colors.border}`,
                  color: colors.dark,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.background}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => handleEditCampaign(campaign)}
              >
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.includes(campaign.id)}
                    onChange={() => toggleSelect(campaign.id)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: colors.gold }}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ 
                      backgroundColor: `${colors.gold}20`,
                      borderRadius: '6px',
                      color: colors.gold,
                    }}
                  >
                    {typeIcons[campaign.type]}
                  </div>
                  <span className="font-medium">{campaign.name}</span>
                </div>
                
                <div className="text-xs" style={{ color: colors.muted }}>
                  {typeLabels[campaign.type]}
                </div>
                
                <div className="text-xs" style={{ color: colors.muted }}>
                  {modeLabels[campaign.mode]}
                </div>
                
                <div>
                  <StatusBadge status={campaign.status} />
                </div>
                
                <div className="text-xs" style={{ color: campaign.daysRemaining ? colors.dark : colors.muted }}>
                  {campaign.daysRemaining !== null 
                    ? campaign.daysRemaining > 0 
                      ? `${campaign.daysRemaining} jours restants`
                      : 'Terminé'
                    : 'Non défini'
                  }
                </div>
                
                <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="p-1.5 rounded transition-colors hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" style={{ color: colors.muted }} />
                  </button>
                </div>
              </div>
            ))}

            {filteredCampaigns.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div 
                  className="w-12 h-12 flex items-center justify-center mb-4"
                  style={{ backgroundColor: colors.border, borderRadius: '8px' }}
                >
                  <Search className="w-6 h-6" style={{ color: colors.muted }} />
                </div>
                <p className="font-medium" style={{ color: colors.dark }}>Aucune campagne trouvée</p>
                <p className="text-sm mt-1" style={{ color: colors.muted }}>
                  Essayez de modifier vos filtres
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Grid view */
          <div className="grid grid-cols-4 gap-4">
            {filteredCampaigns.map((campaign) => {
              // Gradient colors based on campaign type - using DA colors
              const gradients: Record<CampaignType, string> = {
                quiz: 'linear-gradient(135deg, #3d3731 0%, #5a524a 50%, #7a7068 100%)',
                form: 'linear-gradient(135deg, #4a4540 0%, #6a6358 50%, #8a8070 100%)',
                wheel: 'linear-gradient(135deg, #3d3731 0%, #5a524a 50%, #7a7068 100%)',
                jackpot: 'linear-gradient(135deg, #4a4540 0%, #6a6358 50%, #8a8070 100%)',
                scratch: 'linear-gradient(135deg, #3d3731 0%, #5a524a 50%, #7a7068 100%)',
              };

              return (
                <div
                  key={campaign.id}
                  className="relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                  style={{ 
                    background: gradients[campaign.type],
                    borderRadius: '16px',
                    minHeight: '180px',
                  }}
                  onClick={() => handleEditCampaign(campaign)}
                >
                  {/* Header with type badge and status */}
                  <div className="flex items-center justify-between p-4">
                    <div 
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: '20px',
                        color: colors.dark,
                      }}
                    >
                      {typeIcons[campaign.type]}
                      {typeLabels[campaign.type]}
                    </div>
                    <div 
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
                      style={{ 
                        backgroundColor: campaign.status === 'online' 
                          ? colors.success 
                          : campaign.status === 'draft' 
                            ? 'rgba(255,255,255,0.9)' 
                            : colors.warning,
                        borderRadius: '20px',
                        color: campaign.status === 'draft' ? colors.muted : colors.white,
                      }}
                    >
                      {campaign.status === 'online' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      {campaign.status === 'online' ? 'Active' : campaign.status === 'draft' ? 'Brouillon' : 'Terminé'}
                    </div>
                  </div>

                  {/* Campaign name and info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 
                      className="font-semibold text-base mb-2 truncate"
                      style={{ color: colors.white }}
                    >
                      {campaign.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        <Calendar className="w-3.5 h-3.5" />
                        Créé le {new Date(campaign.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-0.5 text-xs font-medium"
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '10px',
                            color: colors.white,
                          }}
                        >
                          {campaign.participants} participant{campaign.participants > 1 ? 's' : ''}
                        </span>
                        <button 
                          className="p-1 rounded transition-colors"
                          style={{ color: 'rgba(255,255,255,0.8)' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredCampaigns.length === 0 && (
              <div className="col-span-4 flex flex-col items-center justify-center py-16">
                <div 
                  className="w-12 h-12 flex items-center justify-center mb-4"
                  style={{ backgroundColor: colors.border, borderRadius: '8px' }}
                >
                  <Search className="w-6 h-6" style={{ color: colors.muted }} />
                </div>
                <p className="font-medium" style={{ color: colors.dark }}>Aucune campagne trouvée</p>
                <p className="text-sm mt-1" style={{ color: colors.muted }}>
                  Essayez de modifier vos filtres
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Campaigns;
