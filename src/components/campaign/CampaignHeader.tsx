import { useState } from "react";
import { Menu, X } from "lucide-react";

export interface HeaderConfig {
  enabled: boolean;
  logo?: string;
  logoSize?: number; // en px
  logoPosition?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  style?: 'solid' | 'transparent' | 'gradient';
  sticky?: boolean;
  showNavigation?: boolean;
  navigationLinks?: Array<{
    id: string;
    label: string;
    url: string;
  }>;
  height?: number; // en px
  borderBottom?: boolean;
  borderColor?: string;
}

export const defaultHeaderConfig: HeaderConfig = {
  enabled: true,
  logoPosition: 'center',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  style: 'solid',
  sticky: false,
  showNavigation: false,
  navigationLinks: [],
  height: 64,
  borderBottom: true,
  borderColor: '#e5e7eb',
  logoSize: 120,
};

interface CampaignHeaderProps {
  config: HeaderConfig;
  isPreview?: boolean;
  onConfigChange?: (config: Partial<HeaderConfig>) => void;
}

export const CampaignHeader = ({ config, isPreview = false, onConfigChange }: CampaignHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  if (!config.enabled) return null;

  const getBackgroundStyle = () => {
    switch (config.style) {
      case 'transparent':
        return { backgroundColor: 'transparent' };
      case 'gradient':
        return { 
          background: `linear-gradient(135deg, ${config.backgroundColor} 0%, ${config.backgroundColor}dd 100%)` 
        };
      default:
        return { backgroundColor: config.backgroundColor };
    }
  };

  const logoPositionClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[config.logoPosition || 'center'];

  return (
    <header
      className={`w-full transition-all ${config.style === 'transparent' && config.sticky ? 'absolute top-0 left-0 right-0 z-50' : ''} ${config.sticky ? 'sticky top-0 z-50' : ''}`}
      style={{
        ...getBackgroundStyle(),
        height: config.height || 64,
        borderBottom: config.borderBottom ? `1px solid ${config.borderColor || '#e5e7eb'}` : 'none',
      }}
    >
      <div className="h-full w-full px-4 flex items-center">
        {/* Logo à gauche */}
        {(config.logoPosition === 'left' || !config.logoPosition) && (
          <div className="flex items-center shrink-0">
            {config.logo ? (
              <img
                src={config.logo}
                alt="Logo"
                style={{ 
                  height: config.logoSize || 120,
                  width: 'auto',
                  objectFit: 'contain'
                }}
                className="cursor-pointer"
              />
            ) : (
              <div 
                className="flex items-center justify-center rounded-lg border-2 border-dashed"
                style={{ 
                  width: config.logoSize || 120,
                  height: Math.min(config.logoSize || 40, (config.height || 64) - 24),
                  borderColor: config.textColor + '40',
                  color: config.textColor + '80',
                }}
              >
                <span className="text-xs">Logo</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation gauche (si logo centré) */}
        {config.showNavigation && config.logoPosition === 'center' && (
          <nav className="hidden md:flex items-center gap-6 flex-1">
            {config.navigationLinks?.slice(0, Math.ceil((config.navigationLinks?.length || 0) / 2)).map(link => (
              <a
                key={link.id}
                href={link.url}
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: config.textColor }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Logo au centre */}
        {config.logoPosition === 'center' && (
          <div className="flex items-center justify-center flex-1">
            {config.logo ? (
              <img
                src={config.logo}
                alt="Logo"
                style={{ 
                  height: config.logoSize || 120,
                  width: 'auto',
                  objectFit: 'contain'
                }}
                className="cursor-pointer"
              />
            ) : (
              <div 
                className="flex items-center justify-center rounded-lg border-2 border-dashed"
                style={{ 
                  width: config.logoSize || 120,
                  height: Math.min(config.logoSize || 40, (config.height || 64) - 24),
                  borderColor: config.textColor + '40',
                  color: config.textColor + '80',
                }}
              >
                <span className="text-xs">Logo</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {config.showNavigation && (
          <>
            <nav className={`hidden md:flex items-center gap-6 ${config.logoPosition !== 'center' ? 'flex-1' : ''} ${config.logoPosition === 'right' ? '' : 'justify-end'}`}>
              {(config.logoPosition === 'center' 
                ? config.navigationLinks?.slice(Math.ceil((config.navigationLinks?.length || 0) / 2))
                : config.navigationLinks
              )?.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  className="text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ color: config.textColor }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Menu mobile */}
            <button
              className="md:hidden ml-auto p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: config.textColor }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </>
        )}

        {/* Logo à droite */}
        {config.logoPosition === 'right' && (
          <div className="flex items-center justify-end flex-1 shrink-0">
            {config.logo ? (
              <img
                src={config.logo}
                alt="Logo"
                style={{ 
                  height: config.logoSize || 120,
                  width: 'auto',
                  objectFit: 'contain'
                }}
                className="cursor-pointer"
              />
            ) : (
              <div 
                className="flex items-center justify-center rounded-lg border-2 border-dashed"
                style={{ 
                  width: config.logoSize || 120,
                  height: Math.min(config.logoSize || 40, (config.height || 64) - 24),
                  borderColor: config.textColor + '40',
                  color: config.textColor + '80',
                }}
              >
                <span className="text-xs">Logo</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Menu mobile ouvert */}
      {mobileMenuOpen && config.showNavigation && (
        <div 
          className="md:hidden absolute top-full left-0 right-0 py-4 px-4 shadow-lg"
          style={{ backgroundColor: config.backgroundColor }}
        >
          {config.navigationLinks?.map(link => (
            <a
              key={link.id}
              href={link.url}
              className="block py-2 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: config.textColor }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
