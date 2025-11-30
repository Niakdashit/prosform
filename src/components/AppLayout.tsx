import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutGrid, 
  BarChart3, 
  Users, 
  Image, 
  Settings,
  Bell,
  ChevronDown,
  Plus,
  Trophy
} from "lucide-react";

// Couleurs DA
const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  background: '#f3f4f6',
  card: '#ffffff',
  border: '#e5e7eb',
  white: '#ffffff',
  muted: '#6b7280',
  text: '#374151',
};

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'campaigns', label: 'Campagnes', icon: <LayoutGrid className="w-5 h-5" />, path: '/campaigns' },
  { id: 'stats', label: 'Statistiques', icon: <BarChart3 className="w-5 h-5" />, path: '/stats' },
  { id: 'contacts', label: 'Participants', icon: <Users className="w-5 h-5" />, path: '/contacts' },
  { id: 'prizes', label: 'Gains & Tirages', icon: <Trophy className="w-5 h-5" />, path: '/prizes' },
  { id: 'media', label: 'Médias', icon: <Image className="w-5 h-5" />, path: '/media' },
  { id: 'settings', label: 'Paramètres', icon: <Settings className="w-5 h-5" />, path: '/settings' },
];

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className="min-h-screen flex"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        // Palette 1++ : Blanc cassé / Gris perle (encore un peu plus foncé)
        background:
          "radial-gradient(circle at 0% 0%, #fafafa 0%, transparent 55%), radial-gradient(circle at 100% 100%, #f5f5f4 0%, transparent 55%), linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
      }}
    >
      {/* Feuille de style qui recouvre tout sauf sidebar et header */}
      <div
        style={{
          position: "fixed",
          top: "56px",
          left: "64px",
          right: "-20%",
          bottom: 0,
          zIndex: 1,
          pointerEvents: "none",
          borderTopLeftRadius: "12px",
          background: `
            radial-gradient(ellipse at 5% 15%, rgba(88, 28, 135, 0.04) 0%, transparent 35%),
            radial-gradient(ellipse at 95% 85%, rgba(245, 202, 60, 0.05) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 10%, rgba(88, 28, 135, 0.03) 0%, transparent 30%),
            radial-gradient(ellipse at 15% 90%, rgba(245, 202, 60, 0.04) 0%, transparent 35%),
            radial-gradient(circle at 0% 0%, #fafafa 0%, transparent 55%),
            radial-gradient(circle at 100% 100%, #f5f5f4 0%, transparent 55%),
            linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)
          `,
        }}
      />
      
      {/* Sidebar */}
      <aside
        className="w-24 flex flex-col items-start py-4 fixed left-0 top-0 bottom-0 backdrop-blur-4xl pl-2"
        style={{
          background: "linear-gradient(180deg, rgba(39, 7, 54, 0.98) 0%, rgba(30, 15, 60, 0.98) 50%, rgba(25, 20, 70, 0.98) 100%)",
          borderRight: "none",
        }}
      >
        {/* Logo */}
        <div 
          className="w-9 h-9 flex items-center justify-center font-bold text-sm mb-6 cursor-pointer ml-1"
          style={{ backgroundColor: colors.gold, color: colors.dark, borderRadius: '8px' }}
          onClick={() => navigate('/campaigns')}
        >
          P
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              className="w-9 h-9 flex items-center justify-center font-medium text-xs transition-colors rounded-md ml-1"
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{ 
                backgroundColor: isActive(item.path) ? 'rgba(245, 202, 60, 0.15)' : 'transparent',
                color: isActive(item.path) ? colors.gold : 'rgba(255,255,255,0.6)',
              }}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </nav>

        {/* User avatar */}
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer ml-1"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: colors.white }}
        >
          JN
        </div>
      </aside>

      {/* Main content area */}
      <div
        className="flex-1 ml-24 flex flex-col backdrop-blur-4xl relative"
        style={{
          backgroundColor: "rgba(226, 232, 240, 0.12)",
          zIndex: 2,
        }}
      >
        {/* Top header */}
        <header
          className="h-[56px] flex items-center justify-between px-6 sticky top-0 z-20 backdrop-blur-4xl"
          style={{
            background:
              "linear-gradient(90deg, rgba(39, 7, 54, 0.98) 0%, rgba(30, 15, 60, 0.98) 40%, rgba(25, 20, 70, 0.98) 100%)",
            borderBottom: "none",
          }}
        >
          <div />

          <div className="flex items-center gap-3">
            <button
              className="h-8 px-3 flex items-center gap-2 font-medium text-xs transition-colors rounded-md"
              style={{ 
                backgroundColor: colors.gold, 
                color: colors.dark,
              }}
              onClick={() => {}}
            >
              <Plus className="w-3.5 h-3.5" />
              Nouvelle campagne
            </button>

            <div className="w-px h-6" style={{ backgroundColor: colors.border }} />

            <button 
              className="h-8 w-8 flex items-center justify-center rounded-md transition-colors hover:bg-gray-100 relative"
            >
              <Bell className="w-4 h-4" style={{ color: colors.muted }} />
              <span 
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.gold }}
              />
            </button>

            <button 
              className="h-8 flex items-center gap-2 px-2 rounded-md transition-colors hover:bg-gray-100"
            >
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                style={{ backgroundColor: colors.dark, color: colors.white }}
              >
                JN
              </div>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: colors.muted }} />
            </button>
          </div>
        </header>

        {/* Page content with rounded liquid glass frame */}
        <main className="flex-1 p-4">
          <div
            className="h-full rounded-[28px] p-6 overflow-auto relative"
            style={{
              background: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.08),
                0 4px 16px rgba(0, 0, 0, 0.05),
                inset 0 1px 1px rgba(255, 255, 255, 0.9),
                inset 0 -1px 1px rgba(0, 0, 0, 0.02)
              `,
              zIndex: 3,
              marginLeft: "-2%",
            }}
          >
            {/* Top highlight line - liquid glass signature */}
            <div 
              className="absolute top-0 left-4 right-4 h-[1px] pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 20%, rgba(255,255,255,0.95) 80%, transparent 100%)',
              }}
            />
            {/* Inner glow */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-[28px]"
              style={{
                background: 'radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.6) 0%, transparent 60%)',
              }}
            />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
