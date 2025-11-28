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
  Plus
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
    <div className="min-h-screen flex" style={{ backgroundColor: colors.background, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside 
        className="w-16 flex flex-col items-center py-4 fixed left-0 top-0 bottom-0"
        style={{ backgroundColor: colors.dark }}
      >
        {/* Logo */}
        <div 
          className="w-9 h-9 flex items-center justify-center font-bold text-sm mb-6 cursor-pointer"
          style={{ backgroundColor: colors.gold, color: colors.dark, borderRadius: '8px' }}
          onClick={() => navigate('/campaigns')}
        >
          P
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="w-10 h-10 flex items-center justify-center rounded-lg transition-all"
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

        {/* User avatar at bottom */}
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: colors.white }}
        >
          JN
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 ml-16 flex flex-col" style={{ backgroundColor: colors.white }}>
        {/* Top header */}
        <header 
          className="h-14 flex items-center justify-between px-6 sticky top-0 z-10"
          style={{ backgroundColor: colors.white }}
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

        {/* Page content with rounded gray frame */}
        <main className="flex-1 p-4">
          <div 
            className="h-full rounded-xl p-6 overflow-auto"
            style={{ 
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`,
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
