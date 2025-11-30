import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { BarChart3, TrendingUp, Users, Eye, MousePointer, Trophy, Activity, Clock, Globe, Smartphone, Mail, AlertTriangle, Download, Target } from "lucide-react";
import { AnalyticsService, GlobalStats, TimeSeriesData, CampaignAnalytics, TypeDistribution } from "@/services/AnalyticsService";
import { AdvancedAnalyticsService, GeoStats, DeviceStats, TrafficSource, PeakHour, EmailCollectionStats, FraudStats } from "@/services/AdvancedAnalyticsService";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LiveFeed } from "@/components/stats/LiveFeed";
import { StatsFilters } from "@/components/stats/StatsFilters";
import { useCampaigns } from "@/hooks/useCampaigns";

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
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtres
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
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
      label: 'Participations', 
      value: globalStats?.total_participations.toLocaleString() || '0', 
      change: '+8%', 
      icon: MousePointer 
    },
    { 
      label: 'Taux de conversion', 
      value: `${globalStats?.conversion_rate || 0}%`, 
      change: '+3%', 
      icon: TrendingUp 
    },
    { 
      label: 'Gagnants', 
      value: globalStats?.total_winners.toLocaleString() || '0', 
      change: '+15%', 
      icon: Trophy 
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
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
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
          className="grid grid-cols-4 gap-4 mb-6 p-5 relative overflow-hidden"
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
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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
        </div>

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
