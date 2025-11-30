import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { BarChart3, TrendingUp, Users, Eye, MousePointer, Trophy, Activity, Clock, Globe, Smartphone, Mail, AlertTriangle, Download, Target, UserPlus, Zap } from "lucide-react";
import { AnalyticsService, GlobalStats, TimeSeriesData, CampaignAnalytics, TypeDistribution } from "@/services/AnalyticsService";
import { AdvancedAnalyticsService, GeoStats, DeviceStats, TrafficSource, PeakHour, EmailCollectionStats, FraudStats } from "@/services/AdvancedAnalyticsService";
import { useCampaignAdvancedStats } from "@/hooks/useCampaignAdvancedStats";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { LiveFeed } from "@/components/stats/LiveFeed";
import { StatsFilters } from "@/components/stats/StatsFilters";
import { useCampaigns } from "@/hooks/useCampaigns";
import { ExportParticipantsButton } from "@/components/ExportParticipantsButton";

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  background: '#f3f4f6',
  border: '#e5e7eb',
  white: '#ffffff',
  muted: '#6b7280',
  success: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  rose: '#f43f5e',
  orange: '#f59e0b',
  emerald: '#10b981',
};

const CHART_COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#10b981', '#f43f5e'];

const typeLabels: Record<string, string> = {
  wheel: 'Roue',
  quiz: 'Quiz',
  jackpot: 'Jackpot',
  scratch: 'Grattage',
  form: 'Formulaire',
};

const Stats = () => {
  const { campaigns } = useCampaigns();
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [campaignAnalytics, setCampaignAnalytics] = useState<CampaignAnalytics[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([]);
  const [geoStats, setGeoStats] = useState<GeoStats[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [emailStats, setEmailStats] = useState<EmailCollectionStats | null>(null);
  const [fraudStats, setFraudStats] = useState<FraudStats | null>(null);
  const [newParticipants, setNewParticipants] = useState<number>(0);
  const [topCampaignsByParticipations, setTopCampaignsByParticipations] = useState<any[]>([]);
  const [topCampaignsByParticipants, setTopCampaignsByParticipants] = useState<any[]>([]);
  const [topCampaignsByOptIns, setTopCampaignsByOptIns] = useState<any[]>([]);
  const [timeSeriesOptIns, setTimeSeriesOptIns] = useState<any>(null);
  const [uniqueParticipationsByIP, setUniqueParticipationsByIP] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtres
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Hook pour les stats avancées du backend externe
  const {
    stats: advancedStats,
    participationsByDay: advancedParticipations,
    conversionFunnel,
    isLoading: isLoadingAdvanced,
  } = useCampaignAdvancedStats({
    campaignId: selectedCampaign,
    days: 30,
    enabled: !!selectedCampaign,
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [
          stats, 
          timeSeries, 
          campaignsData, 
          types,
          geo,
          devices,
          traffic,
          hours,
          email,
          fraud,
        ] = await Promise.all([
          AnalyticsService.getGlobalStats(),
          AnalyticsService.getTimeSeriesData(7),
          AnalyticsService.getCampaignAnalytics(),
          AnalyticsService.getTypeDistribution(),
          AdvancedAnalyticsService.getGeoStats(selectedCampaign || undefined),
          AdvancedAnalyticsService.getDeviceStats(selectedCampaign || undefined),
          AdvancedAnalyticsService.getTrafficSources(selectedCampaign || undefined),
          AdvancedAnalyticsService.getPeakHours(selectedCampaign || undefined),
          AdvancedAnalyticsService.getEmailCollectionStats(selectedCampaign || undefined),
          AdvancedAnalyticsService.getFraudStats(selectedCampaign || undefined),
        ]);
        
        const newParticipantsCount = await AdvancedAnalyticsService.getNewParticipantsCount(selectedCampaign || undefined, dateRange);
        const topByParticipations = await AdvancedAnalyticsService.getTopCampaigns('participations', 10, dateRange);
        const topByParticipants = await AdvancedAnalyticsService.getTopCampaigns('participants', 10, dateRange);
        const topByOptIns = await AdvancedAnalyticsService.getTopCampaigns('opt_ins', 10, dateRange);
        const optInsTimeSeries = await AdvancedAnalyticsService.getTimeSeriesOptIns(dateRange, selectedCampaign || undefined);
        const uniqueIPCount = await AdvancedAnalyticsService.getUniqueParticipationsByIP(selectedCampaign || undefined, dateRange);
        
        setGlobalStats(stats);
        setTimeSeriesData(timeSeries);
        setCampaignAnalytics(campaignsData);
        setTypeDistribution(types);
        setGeoStats(geo);
        setDeviceStats(devices);
        setTrafficSources(traffic);
        setPeakHours(hours);
        setEmailStats(email);
        setFraudStats(fraud);
        setNewParticipants(newParticipantsCount);
        setTopCampaignsByParticipations(topByParticipations);
        setTopCampaignsByParticipants(topByParticipants);
        setTopCampaignsByOptIns(topByOptIns);
        setTimeSeriesOptIns(optInsTimeSeries);
        setUniqueParticipationsByIP(uniqueIPCount);
      } catch (error) {
        console.error('Erreur chargement analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalytics();
  }, [selectedCampaign, dateRange]);

  const handleExportCSV = async () => {
    try {
      const csv = await AdvancedAnalyticsService.exportToCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Export réussi !');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const stats = [
    { 
      label: 'Vues totales', 
      value: globalStats?.total_views.toLocaleString() || '0', 
      change: '+12%', 
      icon: Eye 
    },
    { 
      label: 'Participations totales', 
      value: globalStats?.total_participations.toLocaleString() || '0', 
      change: '+8%', 
      icon: MousePointer 
    },
    { 
      label: 'Participations uniques (IP)', 
      value: uniqueParticipationsByIP.toLocaleString(), 
      change: `${globalStats?.total_participations ? Math.round((uniqueParticipationsByIP / globalStats.total_participations) * 100) : 0}%`, 
      icon: Users 
    },
    { 
      label: 'Taux de conversion', 
      value: `${globalStats?.conversion_rate || 0}%`, 
      change: '+3%', 
      icon: TrendingUp 
    },
  ];

  const secondaryStats = [
    {
      label: 'Collecte email',
      value: `${emailStats?.collection_rate.toFixed(1) || 0}%`,
      subtext: `${emailStats?.emails_collected || 0} emails`,
      icon: Mail,
      color: colors.emerald,
    },
    {
      label: 'Taux de fraude',
      value: `${fraudStats?.fraud_rate.toFixed(1) || 0}%`,
      subtext: `${fraudStats?.duplicate_ips || 0} doublons`,
      icon: AlertTriangle,
      color: fraudStats && fraudStats.fraud_rate > 10 ? colors.rose : colors.orange,
    },
  ];

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Page title with export button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: colors.dark }}>
              Statistiques Avancées
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>
              Vue complète de vos performances et analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Global CSV
            </Button>
            {selectedCampaign && campaigns.find(c => c.id === selectedCampaign) && (
              <ExportParticipantsButton
                campaignId={selectedCampaign}
                campaignTitle={campaigns.find(c => c.id === selectedCampaign)?.title || 'Campagne'}
                variant="default"
              />
            )}
          </div>
        </div>

        {/* Filtres */}
        <StatsFilters
          campaigns={campaigns}
          selectedCampaign={selectedCampaign}
          dateRange={dateRange}
          onCampaignChange={setSelectedCampaign}
          onDateRangeChange={setDateRange}
        />

        {/* Stats cards - Liquid Glass Effect */}
        <div 
          className="grid grid-cols-5 gap-4 mb-6 p-5 relative overflow-hidden"
          style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)',
          }}
        >
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.3) 0%, transparent 40%)',
            }}
          />
          {stats.map((stat, i) => (
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
              <div 
                className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
                }}
              />
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% -20%, rgba(255, 255, 255, 0.5) 0%, transparent 70%)',
                  borderRadius: '18px',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-5 h-5" style={{ color: colors.gold }} />
                  <span 
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: colors.success }}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-semibold mb-1" style={{ color: colors.dark }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: colors.muted }}>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
          
          {/* New Participants Card */}
          <div 
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
            <div 
              className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
              }}
            />
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% -20%, rgba(255, 255, 255, 0.5) 0%, transparent 70%)',
                borderRadius: '18px',
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <UserPlus className="w-5 h-5" style={{ color: colors.emerald }} />
              </div>
              <p className="text-2xl font-semibold mb-1" style={{ color: colors.dark }}>
                {newParticipants}
              </p>
              <p className="text-xs" style={{ color: colors.muted }}>
                Nouveaux participants
              </p>
            </div>
          </div>
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {secondaryStats.map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border"
              style={{ 
                background: colors.white,
                borderColor: colors.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-semibold" style={{ color: colors.dark }}>
                    {stat.value}
                  </p>
                  <p className="text-xs" style={{ color: colors.muted }}>
                    {stat.label}
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.muted }}>
                    {stat.subtext}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Identified vs Anonymous Card */}
          {emailStats && (
            <div
              className="p-4 rounded-2xl border"
              style={{ 
                background: colors.white,
                borderColor: colors.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${colors.blue}15` }}
                >
                  <Users className="w-5 h-5" style={{ color: colors.blue }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-semibold" style={{ color: colors.dark }}>
                      {emailStats.emails_collected}
                    </p>
                    <span className="text-sm" style={{ color: colors.muted }}>/ {emailStats.total_participations - emailStats.emails_collected}</span>
                  </div>
                  <p className="text-xs" style={{ color: colors.muted }}>
                    Identifiés / Anonymes
                  </p>
                  <p className="text-xs mt-1 font-medium" style={{ color: colors.blue }}>
                    {emailStats.collection_rate.toFixed(1)}% identifiés
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Backend Externe Stats - Affiché si une campagne est sélectionnée */}
        {selectedCampaign && advancedStats && (
          <div className="mb-6 p-6 rounded-2xl border" style={{ background: colors.white, borderColor: colors.border }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5" style={{ color: colors.gold }} />
              <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>
                Stats Avancées (Backend Externe)
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl" style={{ background: colors.background }}>
                <p className="text-sm mb-1" style={{ color: colors.muted }}>Participants uniques</p>
                <p className="text-2xl font-semibold" style={{ color: colors.dark }}>
                  {advancedStats.unique_participants}
                </p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: colors.background }}>
                <p className="text-sm mb-1" style={{ color: colors.muted }}>Taux conversion</p>
                <p className="text-2xl font-semibold" style={{ color: colors.dark }}>
                  {advancedStats.conversion_rate.toFixed(1)}%
                </p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: colors.background }}>
                <p className="text-sm mb-1" style={{ color: colors.muted }}>Taux complétion</p>
                <p className="text-2xl font-semibold" style={{ color: colors.dark }}>
                  {advancedStats.completion_rate.toFixed(1)}%
                </p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: colors.background }}>
                <p className="text-sm mb-1" style={{ color: colors.muted }}>Temps moyen</p>
                <p className="text-2xl font-semibold" style={{ color: colors.dark }}>
                  {Math.round(advancedStats.avg_time_spent)}s
                </p>
              </div>
            </div>

            {/* Funnel de conversion */}
            {conversionFunnel && (
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-3" style={{ color: colors.dark }}>
                  Funnel de Conversion
                </h4>
                <div className="space-y-3">
                  {conversionFunnel.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-32 text-sm" style={{ color: colors.muted }}>{step.label}</div>
                      <div className="flex-1 h-8 rounded-lg overflow-hidden" style={{ background: colors.background }}>
                        <div
                          className="h-full flex items-center px-3 text-sm font-medium text-white"
                          style={{
                            width: `${step.percent}%`,
                            background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})`,
                          }}
                        >
                          {step.percent.toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-20 text-right font-semibold" style={{ color: colors.dark }}>
                        {step.value.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participations par jour (backend externe) */}
            {advancedParticipations.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-3" style={{ color: colors.dark }}>
                  Participations par Jour (30 derniers jours)
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={advancedParticipations}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="date" stroke={colors.muted} />
                    <YAxis stroke={colors.muted} />
                    <Tooltip
                      contentStyle={{
                        background: colors.white,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="participations" fill={colors.blue} name="Participations" />
                    <Bar dataKey="completions" fill={colors.emerald} name="Complétions" />
                    <Bar dataKey="unique_emails" fill={colors.purple} name="Emails uniques" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Charts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Activity className="w-8 h-8 animate-spin" style={{ color: colors.gold }} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Évolution temporelle */}
            <div 
              className="p-6 relative overflow-hidden"
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
              <div className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
                }}
              />
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.dark }}>
                Évolution sur 7 jours
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.blue} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={colors.blue} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorParticipations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.gold} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={colors.gold} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis 
                    dataKey="date" 
                    stroke={colors.muted}
                    tick={{ fill: colors.muted }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis stroke={colors.muted} tick={{ fill: colors.muted }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: colors.white, 
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke={colors.blue} 
                    fill="url(#colorViews)" 
                    name="Vues"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="participations" 
                    stroke={colors.gold} 
                    fill="url(#colorParticipations)" 
                    name="Participations"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 4 colonnes - Geo, Device, Traffic, Heures */}
            <div className="grid grid-cols-4 gap-4">
              {/* Géolocalisation */}
              <div className="p-4 rounded-2xl border" style={{ background: colors.white, borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4" style={{ color: colors.blue }} />
                  <h4 className="text-sm font-semibold" style={{ color: colors.dark }}>Top Pays</h4>
                </div>
                <div className="space-y-2">
                  {geoStats.slice(0, 5).map((geo, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span style={{ color: colors.muted }}>{geo.country}</span>
                      <span className="font-medium" style={{ color: colors.dark }}>{geo.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div className="p-4 rounded-2xl border" style={{ background: colors.white, borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-4 h-4" style={{ color: colors.purple }} />
                  <h4 className="text-sm font-semibold" style={{ color: colors.dark }}>Devices</h4>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={deviceStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      dataKey="count"
                      label={({ device_type, percentage }) => `${device_type}: ${percentage.toFixed(0)}%`}
                    >
                      {deviceStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Traffic Sources */}
              <div className="p-4 rounded-2xl border" style={{ background: colors.white, borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4" style={{ color: colors.emerald }} />
                  <h4 className="text-sm font-semibold" style={{ color: colors.dark }}>Sources</h4>
                </div>
                <div className="space-y-2">
                  {trafficSources.slice(0, 5).map((source, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span style={{ color: colors.muted }} className="truncate">{source.source}</span>
                      <span className="font-medium" style={{ color: colors.dark }}>{source.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Heures de pic */}
              <div className="p-4 rounded-2xl border" style={{ background: colors.white, borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" style={{ color: colors.orange }} />
                  <h4 className="text-sm font-semibold" style={{ color: colors.dark }}>Heures de pic</h4>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={peakHours}>
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(h) => `${h}h`}
                    />
                    <Bar dataKey="count" fill={colors.orange} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Most Popular Campaigns */}
            <div 
              className="p-6 relative overflow-hidden"
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
              <div className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
                }}
              />
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5" style={{ color: colors.gold }} />
                <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>
                  Campagnes les plus populaires
                </h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Par Participations */}
                <div>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: colors.dark }}>Par Participations</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Campagne</TableHead>
                        <TableHead className="text-xs text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCampaignsByParticipations.slice(0, 5).map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium text-xs truncate max-w-[150px]">{campaign.title}</TableCell>
                          <TableCell className="text-xs text-right">{campaign.participations.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Par Participants */}
                <div>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: colors.dark }}>Par Participants</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Campagne</TableHead>
                        <TableHead className="text-xs text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCampaignsByParticipants.slice(0, 5).map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium text-xs truncate max-w-[150px]">{campaign.title}</TableCell>
                          <TableCell className="text-xs text-right">{campaign.participants.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Par Opt-ins */}
                <div>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: colors.dark }}>Par Newsletter & Marketing Opt-ins</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Campagne</TableHead>
                        <TableHead className="text-xs text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCampaignsByOptIns.slice(0, 5).map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium text-xs truncate max-w-[150px]">{campaign.title}</TableCell>
                          <TableCell className="text-xs text-right">{campaign.opt_ins.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Opt-in Conversions Over Time */}
            {timeSeriesOptIns && timeSeriesOptIns.dates.length > 0 && (
              <div 
                className="p-6 relative overflow-hidden"
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
                <div className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
                  }}
                />
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.dark }}>
                  Conversions Opt-in dans le temps
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={timeSeriesOptIns.dates.map((date: string, i: number) => ({
                    date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                    'Newsletter & Marketing': timeSeriesOptIns.newsletter[i],
                    'Autres': timeSeriesOptIns.others[i],
                    'Partenaires': timeSeriesOptIns.partners[i],
                  }))}>
                    <defs>
                      <linearGradient id="colorNewsletter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.orange} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={colors.orange} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPartners" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.blue} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={colors.blue} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOthers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.emerald} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={colors.emerald} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis 
                      dataKey="date" 
                      stroke={colors.muted}
                      tick={{ fill: colors.muted }}
                    />
                    <YAxis stroke={colors.muted} tick={{ fill: colors.muted }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: colors.white, 
                        borderRadius: '8px',
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="Newsletter & Marketing" 
                      stackId="1"
                      stroke={colors.orange} 
                      fill="url(#colorNewsletter)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Partenaires" 
                      stackId="1"
                      stroke={colors.blue} 
                      fill="url(#colorPartners)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Autres" 
                      stackId="1"
                      stroke={colors.emerald} 
                      fill="url(#colorOthers)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Live Feed */}
            <LiveFeed />

            {/* Grille 2 colonnes - Top campagnes & Types */}
            <div className="grid grid-cols-2 gap-6">
              {/* Top campagnes */}
              <div 
                className="p-6 relative overflow-hidden"
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
                <div className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
                  }}
                />
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.dark }}>
                  Top Campagnes
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignAnalytics.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis 
                      dataKey="campaign_name" 
                      stroke={colors.muted}
                      tick={{ fill: colors.muted, fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke={colors.muted} tick={{ fill: colors.muted }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: colors.white, 
                        borderRadius: '8px',
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                    <Bar dataKey="total_participations" fill={colors.gold} name="Participations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Distribution par type */}
              <div 
                className="p-6 relative overflow-hidden"
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
                <div className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
                  }}
                />
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.dark }}>
                  Répartition par type
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeDistribution.map(item => ({
                        name: typeLabels[item.type] || item.type,
                        value: item.count,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: colors.white, 
                        borderRadius: '8px',
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Stats;
