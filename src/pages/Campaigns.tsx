import { useState, useEffect } from "react";
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
  CircleDot,
  Loader2,
  Trash2,
  Copy,
  BarChart2,
  TrendingUp,
  Activity,
  Megaphone,
  UserPlus,
  Eye,
  Filter,
  Mail,
  Scale,
  Handshake,
  FileDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useCampaigns } from "@/hooks/useCampaigns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CampaignType, CampaignStatus, CampaignMode } from "@/types/campaign";
import { AnalyticsService } from "@/services/AnalyticsService";
import { AdvancedAnalyticsService } from "@/services/AdvancedAnalyticsService";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

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
  article: 'Article',
  embed: 'Intégré',
  popup: 'Popup',
};

type DisplayStatus = 'online' | 'draft' | 'ended';

const StatusBadge = ({ status }: { status: DisplayStatus }) => {
  const styles: Record<DisplayStatus, { bg: string; text: string; label: string }> = {
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
  const { campaigns: rawCampaigns, isLoading, error, deleteCampaign, duplicateCampaign, refetch } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CampaignStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedCampaignForStats, setSelectedCampaignForStats] = useState<string | null>(null);
  const [campaignStats, setCampaignStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Transform campaigns for display
  const campaigns = rawCampaigns.map(c => {
    // Map paused to draft for display
    let displayStatus: DisplayStatus = 'draft';
    if (c.status === 'online') displayStatus = 'online';
    else if (c.status === 'ended') displayStatus = 'ended';
    
    return {
      id: c.id,
      name: c.name,
      type: c.type,
      mode: c.mode,
      status: displayStatus,
      daysRemaining: c.ends_at ? Math.max(0, Math.ceil((new Date(c.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null,
      participants: 0,
      createdAt: c.created_at,
    };
  });

  const filteredCampaigns = campaigns.filter(campaign => {
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

  const handleDeleteClick = (id: string) => {
    setCampaignToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (campaignToDelete) {
      const success = await deleteCampaign(campaignToDelete);
      if (success) {
        toast.success('Campagne supprimée');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    }
    setDeleteDialogOpen(false);
    setCampaignToDelete(null);
  };

  const handleDuplicate = async (id: string) => {
    const duplicated = await duplicateCampaign(id);
    if (duplicated) {
      toast.success('Campagne dupliquée');
    } else {
      toast.error('Erreur lors de la duplication');
    }
  };

  const handleEditCampaign = (campaign: { id: string; type: CampaignType }) => {
    const routes: Record<CampaignType, string> = {
      form: '/form',
      wheel: '/wheel',
      quiz: '/quiz',
      jackpot: '/jackpot',
      scratch: '/scratch',
    };
    navigate(`${routes[campaign.type]}?id=${campaign.id}`);
  };

  const handleViewStats = async (campaignId: string) => {
    setSelectedCampaignForStats(campaignId);
    setStatsModalOpen(true);
    setLoadingStats(true);
    
    try {
      const [stats, timeSeries, uniqueParticipants, newParticipants, emailStats] = await Promise.all([
        AnalyticsService.getCampaignAnalyticsById(campaignId),
        AnalyticsService.getTimeSeriesDataByCampaign(campaignId, 7),
        AdvancedAnalyticsService.getUniqueParticipationsByIP(campaignId),
        AdvancedAnalyticsService.getNewParticipantsCount(campaignId),
        AdvancedAnalyticsService.getEmailCollectionStats(campaignId),
      ]);
      
      setCampaignStats({ 
        ...stats, 
        timeSeries,
        uniqueParticipants,
        newParticipants,
        emailStats
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!statsModalOpen) {
      setCampaignStats(null);
      setSelectedCampaignForStats(null);
    }
  }, [statsModalOpen]);

  // Afficher un spinner plein page pendant le chargement initial
  if (isLoading) {
    return (
      <AppLayout>
        <div 
          className="flex flex-col items-center justify-center"
          style={{ 
            fontFamily: "'DM Sans', sans-serif",
            minHeight: 'calc(100vh - 120px)',
          }}
        >
          <Loader2 
            className="w-10 h-10 animate-spin mb-4" 
            style={{ color: colors.gold }} 
          />
          <p className="text-sm" style={{ color: colors.muted }}>
            Chargement des campagnes...
          </p>
        </div>
      </AppLayout>
    );
  }

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

        {/* Stats cards - Liquid Glass Effect */}
        <div 
          className="grid grid-cols-4 gap-4 mb-6 p-5 relative overflow-hidden"
          style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)',
          }}
        >
          {/* Animated gradient overlay for depth */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.3) 0%, transparent 40%)',
            }}
          />
          {[
            { label: 'Total campagnes', value: campaigns.length, icon: LayoutGrid },
            { label: 'En ligne', value: campaigns.filter(c => c.status === 'online').length, icon: CircleDot },
            { label: 'Participants', value: campaigns.reduce((acc, c) => acc + c.participants, 0).toLocaleString(), icon: Users },
            { label: 'Ce mois', value: campaigns.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: Calendar },
          ].map((stat, i) => (
            <div 
              key={i}
              className="p-4 relative overflow-hidden group"
              style={{ 
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: `
                  0 4px 24px rgba(0, 0, 0, 0.06),
                  0 1px 2px rgba(0, 0, 0, 0.04),
                  inset 0 1px 1px rgba(255, 255, 255, 0.8),
                  inset 0 -1px 1px rgba(0, 0, 0, 0.02)
                `,
              }}
            >
              {/* Top highlight line - liquid glass signature */}
              <div 
                className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
                }}
              />
              {/* Inner glow */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% -20%, rgba(255, 255, 255, 0.5) 0%, transparent 70%)',
                  borderRadius: '18px',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'rgba(60, 60, 67, 0.7)' }}>
                    {stat.label}
                  </span>
                  <stat.icon className="w-4 h-4" style={{ color: colors.gold }} />
                </div>
                <p className="text-2xl font-semibold" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main content container - Liquid Glass Effect */}
        <div 
          className="relative overflow-hidden p-5"
          style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)',
          }}
        >
          {/* Gradient overlay for depth */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.3) 0%, transparent 40%)',
            }}
          />

        {/* Filters bar */}
        <div 
          className="flex items-center justify-between p-4 mb-4 relative overflow-hidden"
          style={{ 
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: `
              0 4px 24px rgba(0, 0, 0, 0.06),
              0 1px 2px rgba(0, 0, 0, 0.04),
              inset 0 1px 1px rgba(255, 255, 255, 0.8),
              inset 0 -1px 1px rgba(0, 0, 0, 0.02)
            `,
          }}
        >
          {/* Top highlight line */}
          <div 
            className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
            }}
          />
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
            className="relative overflow-hidden"
            style={{ 
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: `
                0 4px 24px rgba(0, 0, 0, 0.06),
                0 1px 2px rgba(0, 0, 0, 0.04),
                inset 0 1px 1px rgba(255, 255, 255, 0.8),
                inset 0 -1px 1px rgba(0, 0, 0, 0.02)
              `,
            }}
          >
            {/* Top highlight line */}
            <div 
              className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none z-10"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
              }}
            />
            {/* Table header */}
            <div 
              className="grid items-center px-4 h-11 text-xs font-medium"
              style={{ 
                gridTemplateColumns: '40px 1fr 120px 200px 120px 140px 60px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: 'rgba(60, 60, 67, 0.7)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
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
                  borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'rgba(0, 0, 0, 0.85)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded transition-colors hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4" style={{ color: colors.muted }} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCampaign(campaign)}>
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewStats(campaign.id)}>
                        <BarChart2 className="w-4 h-4 mr-2" />
                        Statistiques
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(campaign.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Dupliquer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(campaign.id)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    minHeight: '180px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.12),
                      0 4px 16px rgba(0, 0, 0, 0.08),
                      inset 0 1px 1px rgba(255, 255, 255, 0.3),
                      inset 0 -1px 1px rgba(0, 0, 0, 0.1)
                    `,
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

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: colors.gold, color: colors.dark }}
            >
              Réessayer
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la campagne ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La campagne et toutes ses données seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Campaign Statistics Modal */}
      <Dialog open={statsModalOpen} onOpenChange={setStatsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Statistiques de la campagne
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={async () => {
                  if (selectedCampaignForStats) {
                    try {
                      const csvData = await AdvancedAnalyticsService.exportToCSV(selectedCampaignForStats);
                      const blob = new Blob([csvData], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `campaign-stats-${selectedCampaignForStats}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                      toast.success('Données exportées');
                    } catch (error) {
                      toast.error('Erreur lors de l\'export');
                    }
                  }
                }}
              >
                <FileDown className="w-4 h-4" />
                Export to PDF
              </Button>
            </div>
          </DialogHeader>

          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.gold }} />
            </div>
          ) : campaignStats ? (
            <div className="space-y-6 py-4">
              {/* Main Stats Grid - 4 columns */}
              <div className="grid grid-cols-4 gap-4">
                {/* Participations */}
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.white }}>
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${colors.gold}15` }}
                    >
                      <Megaphone className="w-8 h-8" style={{ color: colors.gold }} />
                    </div>
                    <p className="text-4xl font-bold mb-2" style={{ color: colors.dark }}>
                      {(campaignStats.total_participations || 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                      PARTICIPATIONS
                    </p>
                  </div>
                </div>

                {/* Unique Participants */}
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.white }}>
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${colors.gold}15` }}
                    >
                      <Users className="w-8 h-8" style={{ color: colors.gold }} />
                    </div>
                    <p className="text-4xl font-bold mb-2" style={{ color: colors.dark }}>
                      {(campaignStats.uniqueParticipants || 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                      UNIQUE PARTICIPANTS
                    </p>
                  </div>
                </div>

                {/* New Participants */}
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.white }}>
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${colors.gold}15` }}
                    >
                      <UserPlus className="w-8 h-8" style={{ color: colors.gold }} />
                    </div>
                    <p className="text-4xl font-bold mb-2" style={{ color: colors.dark }}>
                      {(campaignStats.newParticipants || 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                      NEW PARTICIPANTS
                    </p>
                  </div>
                </div>

                {/* Total Page Views */}
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.white }}>
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${colors.gold}15` }}
                    >
                      <Eye className="w-8 h-8" style={{ color: colors.gold }} />
                    </div>
                    <p className="text-4xl font-bold mb-2" style={{ color: colors.dark }}>
                      {(campaignStats.total_views || 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                      TOTAL PAGE VIEWS
                    </p>
                  </div>
                </div>

                {/* Completion Rate */}
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.white }}>
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${colors.success}15` }}
                    >
                      <Filter className="w-8 h-8" style={{ color: colors.success }} />
                    </div>
                    <p className="text-4xl font-bold mb-2" style={{ color: colors.dark }}>
                      {campaignStats.total_views > 0 
                        ? `${((campaignStats.total_completions || 0) / campaignStats.total_views * 100).toFixed(2)}%`
                        : '0%'
                      }
                    </p>
                    <p className="text-sm mb-1" style={{ color: colors.muted }}>
                      {(campaignStats.total_completions || 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                      COMPLETION RATE
                    </p>
                  </div>
                </div>

                {/* Newsletter & Marketing Opt-ins */}
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.white }}>
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${colors.gold}15` }}
                    >
                      <Mail className="w-8 h-8" style={{ color: colors.gold }} />
                    </div>
                    <p className="text-4xl font-bold mb-2" style={{ color: colors.dark }}>
                      {(campaignStats.emailStats?.marketing_opt_ins || 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wide text-center" style={{ color: colors.muted }}>
                      NEWSLETTER & MARKETING OPT-INS
                    </p>
                  </div>
                </div>

                {/* Legal & Rules Opt-ins */}
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.white }}>
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${colors.gold}15` }}
                    >
                      <Scale className="w-8 h-8" style={{ color: colors.gold }} />
                    </div>
                    <p className="text-4xl font-bold mb-2" style={{ color: colors.dark }}>
                      {(campaignStats.emailStats?.legal_opt_ins || 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wide text-center" style={{ color: colors.muted }}>
                      LEGAL & RULES OPT-INS
                    </p>
                  </div>
                </div>

                {/* Partner Opt-ins */}
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.white }}>
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${colors.gold}15` }}
                    >
                      <Handshake className="w-8 h-8" style={{ color: colors.gold }} />
                    </div>
                    <p className="text-4xl font-bold mb-2" style={{ color: colors.dark }}>
                      {(campaignStats.emailStats?.partner_opt_ins || 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                      PARTNER OPT-INS
                    </p>
                  </div>
                </div>
              </div>

              {/* Time series chart */}
              {campaignStats.timeSeries && campaignStats.timeSeries.length > 0 && (
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.white }}>
                  <h3 className="text-sm font-medium mb-4" style={{ color: colors.dark }}>
                    Évolution sur 7 jours
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={campaignStats.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis 
                        dataKey="date" 
                        stroke={colors.muted}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke={colors.muted}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: colors.white,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="views" 
                        stroke={colors.gold}
                        fill={`${colors.gold}40`}
                        name="Vues"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="participations" 
                        stroke={colors.success}
                        fill={`${colors.success}40`}
                        name="Participations"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Bottom stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.white }}>
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                    Temps moyen passé
                  </span>
                  <p className="text-2xl font-semibold mt-2" style={{ color: colors.dark }}>
                    {campaignStats.avg_time_spent 
                      ? `${Math.round(campaignStats.avg_time_spent)}s`
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="p-6 rounded-lg border" style={{ backgroundColor: colors.white }}>
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                    Dernière participation
                  </span>
                  <p className="text-2xl font-semibold mt-2" style={{ color: colors.dark }}>
                    {campaignStats.last_participation_at 
                      ? new Date(campaignStats.last_participation_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      : 'Aucune'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p style={{ color: colors.muted }}>Aucune donnée disponible</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Campaigns;
