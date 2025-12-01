import { ReactNode } from "react";
import { CampaignHeader, HeaderConfig, defaultHeaderConfig } from "./CampaignHeader";
import { CampaignFooter, FooterConfig, defaultFooterConfig } from "./CampaignFooter";

export interface CampaignLayoutConfig {
  header: HeaderConfig;
  footer: FooterConfig;
  // Options globales de layout
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOverlay?: number; // 0-100
  minHeight?: 'screen' | 'auto';
  contentPadding?: 'none' | 'small' | 'medium' | 'large';
}

export const defaultCampaignLayoutConfig: CampaignLayoutConfig = {
  header: defaultHeaderConfig,
  footer: defaultFooterConfig,
  maxWidth: 'xl',
  backgroundColor: '#ffffff',
  minHeight: 'screen',
  contentPadding: 'medium',
};

interface CampaignLayoutProps {
  config: CampaignLayoutConfig;
  children: ReactNode;
  isPreview?: boolean;
  onHeaderChange?: (config: Partial<HeaderConfig>) => void;
  onFooterChange?: (config: Partial<FooterConfig>) => void;
}

export const CampaignLayout = ({ 
  config, 
  children, 
  isPreview = false,
  onHeaderChange,
  onFooterChange,
}: CampaignLayoutProps) => {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }[config.maxWidth || 'xl'];

  const paddingClass = {
    none: '',
    small: 'px-2 py-4',
    medium: 'px-4 py-8',
    large: 'px-6 py-12',
  }[config.contentPadding || 'medium'];

  return (
    <div 
      className={`flex flex-col ${config.minHeight === 'screen' ? 'min-h-screen' : ''}`}
      style={{ 
        backgroundColor: config.backgroundColor,
        backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay si image de fond */}
      {config.backgroundImage && config.backgroundOverlay && config.backgroundOverlay > 0 && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            backgroundColor: `rgba(0,0,0,${config.backgroundOverlay / 100})` 
          }}
        />
      )}

      {/* Header */}
      <CampaignHeader 
        config={config.header} 
        isPreview={isPreview}
        onConfigChange={onHeaderChange}
      />

      {/* Contenu principal */}
      <main className={`flex flex-col items-center ${paddingClass} relative z-10`}>
        <div className={`w-full ${maxWidthClass}`}>
          {children}
        </div>
      </main>

      {/* Footer - ne sera jamais compressé */}
      <CampaignFooter 
        config={config.footer} 
        isPreview={isPreview}
        onConfigChange={onFooterChange}
      />
    </div>
  );
};

// Export des types et defaults
export { defaultHeaderConfig, defaultFooterConfig };
export type { HeaderConfig, FooterConfig };
