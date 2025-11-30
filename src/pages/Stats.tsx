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

        {/* Chart placeholder - Liquid Glass Effect */}
        <div 
          className="p-6 flex items-center justify-center relative overflow-hidden"
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
            minHeight: '400px',
          }}
        >
          {/* Top highlight line */}
          <div 
            className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
            }}
          />
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
