import { AppLayout } from "@/components/AppLayout";
import { BarChart3, TrendingUp, Users, Eye, MousePointer, Trophy } from "lucide-react";

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  background: '#f3f4f6',
  border: '#e5e7eb',
  white: '#ffffff',
  muted: '#6b7280',
  success: '#22c55e',
};

const Stats = () => {
  const stats = [
    { label: 'Vues totales', value: '24,521', change: '+12%', icon: Eye },
    { label: 'Participations', value: '10,065', change: '+8%', icon: MousePointer },
    { label: 'Taux de conversion', value: '41%', change: '+3%', icon: TrendingUp },
    { label: 'Gagnants', value: '2,341', change: '+15%', icon: Trophy },
  ];

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold" style={{ color: colors.dark }}>
            Statistiques
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.muted }}>
            Vue d'ensemble de vos performances
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <div 
              key={i}
              className="p-4"
              style={{ 
                backgroundColor: colors.white, 
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
              }}
            >
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
          ))}
        </div>

        {/* Chart placeholder */}
        <div 
          className="p-6 flex items-center justify-center"
          style={{ 
            backgroundColor: colors.white, 
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            minHeight: '400px',
          }}
        >
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-3" style={{ color: colors.border }} />
            <p className="font-medium" style={{ color: colors.dark }}>Graphiques à venir</p>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>
              Les analytics détaillées seront affichées ici
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Stats;
