import { ReactNode, useState, useCallback } from "react";
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
  User,
  LogOut,
  CreditCard,
  Shield,
  CircleDot,
  HelpCircle,
  Dices,
  Ticket,
  ShoppingBag,
  FileText,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { InactivityWarningModal } from "@/components/InactivityWarningModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Types de campagnes disponibles
const campaignTypes = [
  { 
    id: 'wheel', 
    name: 'Roue', 
    icon: CircleDot,
    color: '#f59e0b',
    modes: [
      { id: 'fullscreen', name: 'Plein écran', path: '/wheel' },
      { id: 'article', name: 'Article', path: '/article-wheel' },
    ]
  },
  { 
    id: 'quiz', 
    name: 'Quiz', 
    icon: HelpCircle,
    color: '#8b5cf6',
    modes: [
      { id: 'fullscreen', name: 'Plein écran', path: '/quiz' },
      { id: 'article', name: 'Article', path: '/article-quiz' },
    ]
  },
  { 
    id: 'jackpot', 
    name: 'Jackpot', 
    icon: Dices,
    color: '#ef4444',
    modes: [
      { id: 'fullscreen', name: 'Plein écran', path: '/jackpot' },
      { id: 'article', name: 'Article', path: '/article-jackpot' },
    ]
  },
  { 
    id: 'scratch', 
    name: 'Scratch', 
    icon: Ticket,
    color: '#10b981',
    modes: [
      { id: 'fullscreen', name: 'Plein écran', path: '/scratch' },
      { id: 'article', name: 'Article', path: '/article-scratch' },
    ]
  },
  { 
    id: 'catalog', 
    name: 'Catalogue', 
    icon: ShoppingBag,
    color: '#3b82f6',
    modes: [
      { id: 'fullscreen', name: 'Plein écran', path: '/catalog' },
    ]
  },
  { 
    id: 'form', 
    name: 'Formulaire', 
    icon: FileText,
    color: '#6b7280',
    modes: [
      { id: 'fullscreen', name: 'Plein écran', path: '/form' },
    ]
  },
];

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
  const { user, signOut } = useAuth();
  const { isSuperAdmin } = useOrganization();
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaignType, setSelectedCampaignType] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleBubbleClick = (type: typeof campaignTypes[0]) => {
    if (type.modes.length === 1) {
      setShowCampaignModal(false);
      setSelectedCampaignType(null);
      navigate(type.modes[0].path);
    } else {
      setSelectedCampaignType(selectedCampaignType === type.id ? null : type.id);
    }
  };

  const handleModeSelect = (path: string) => {
    setShowCampaignModal(false);
    setSelectedCampaignType(null);
    navigate(path);
  };

  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name) {
      return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem('prosform_last_activity');
    navigate('/login');
    toast.success('Déconnexion réussie');
  };

  // Gestion de l'inactivité
  const handleInactivityLogout = useCallback(() => {
    signOut();
    localStorage.removeItem('prosform_last_activity');
    navigate('/login');
    toast.warning('Vous avez été déconnecté pour inactivité');
  }, [signOut, navigate]);

  const handleInactivityWarning = useCallback(() => {
    // Le modal s'affiche automatiquement via showWarning
  }, []);

  const { showWarning, resetTimer } = useInactivityTimeout({
    onWarning: handleInactivityWarning,
    onLogout: handleInactivityLogout,
    enabled: !!user, // Actif seulement si connecté
  });

  const userInitials = getInitials(user?.user_metadata?.full_name, user?.email);

  return (
    <div
      className="min-h-screen flex overflow-x-hidden"
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

        {/* User avatar - Sidebar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer ml-1 hover:ring-2 hover:ring-gold/50 transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: colors.white }}
            >
              {userInitials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.user_metadata?.full_name || 'Utilisateur'}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Mon compte
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <CreditCard className="mr-2 h-4 w-4" />
              Abonnement
            </DropdownMenuItem>
            {isSuperAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin')} className="text-primary">
                  <Shield className="mr-2 h-4 w-4" />
                  Administration
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      {/* Top header - Fixed */}
      <header
        className="h-[56px] flex items-center justify-between px-6 fixed top-0 left-24 right-0 z-20 backdrop-blur-4xl"
        style={{
          background:
            "linear-gradient(90deg, rgba(39, 7, 54, 0.98) 0%, rgba(30, 15, 60, 0.98) 40%, rgba(25, 20, 70, 0.98) 100%)",
          borderBottom: "none",
          overflow: "visible",
        }}
      >
          <div />

          <div className="flex items-center gap-3">
            {/* Bulles de sélection de campagne */}
            <div className="flex items-center gap-2">
              {showCampaignModal && campaignTypes.map((type, index) => {
                const Icon = type.icon;
                const reverseIndex = campaignTypes.length - 1 - index;
                const isSelected = selectedCampaignType === type.id;
                return (
                  <div key={type.id} className="relative">
                    <button
                      onClick={() => handleBubbleClick(type)}
                      className={`group relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${isSelected ? 'ring-2 ring-white scale-110' : ''}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: `
                          0 8px 32px rgba(0, 0, 0, 0.1),
                          inset 0 1px 1px rgba(255, 255, 255, 0.3),
                          inset 0 -1px 1px rgba(0, 0, 0, 0.1)
                        `,
                        animation: `bubbleIn 0.3s ease-out ${reverseIndex * 0.05}s both`,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: type.color }} />
                      {/* Tooltip */}
                      {!isSelected && (
                        <div 
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap pointer-events-none hidden group-hover:block"
                          style={{
                            background: 'rgba(0, 0, 0, 0.9)',
                            color: 'white',
                            zIndex: 99999,
                          }}
                        >
                          {type.name}
                        </div>
                      )}
                    </button>
                    {/* Mini modale de sélection de mode */}
                    {isSelected && type.modes.length > 1 && (
                      <div 
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-1 rounded-lg flex gap-1"
                        style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                          zIndex: 99999,
                        }}
                      >
                        {type.modes.map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => handleModeSelect(mode.path)}
                            className="px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors hover:bg-gray-100"
                            style={{ color: colors.dark }}
                          >
                            {mode.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              className="h-8 px-3 flex items-center gap-2 font-medium text-xs transition-colors rounded-md hover:opacity-90"
              style={{ 
                backgroundColor: colors.gold, 
                color: colors.dark,
              }}
              onClick={() => {
                setShowCampaignModal(!showCampaignModal);
                setSelectedCampaignType(null);
              }}
            >
              <Plus 
                className="w-3.5 h-3.5 transition-transform duration-300" 
                style={{ transform: showCampaignModal ? 'rotate(45deg)' : 'rotate(0deg)' }}
              />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="h-8 flex items-center gap-2 px-2 rounded-md transition-colors hover:bg-white/10"
                >
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: colors.gold, color: colors.dark }}
                  >
                    {userInitials}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.user_metadata?.full_name || 'Utilisateur'}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Mon compte
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Abonnement
                </DropdownMenuItem>
                {isSuperAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="text-primary">
                      <Shield className="mr-2 h-4 w-4" />
                      Administration
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

      {/* Main content area */}
      <div
        className="flex-1 ml-24 pt-[56px] backdrop-blur-4xl relative overflow-x-hidden"
        style={{
          backgroundColor: "rgba(226, 232, 240, 0.12)",
          zIndex: 2,
        }}
      >
        {/* Page content with rounded liquid glass frame */}
        <main className="h-full p-4 overflow-y-auto overflow-x-hidden">
          <div
            className="min-h-full rounded-[28px] p-6 relative overflow-x-auto"
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

      {/* Modal d'avertissement d'inactivité */}
      <InactivityWarningModal
        open={showWarning}
        onStayConnected={resetTimer}
        onLogout={handleInactivityLogout}
      />

    </div>
  );
};
