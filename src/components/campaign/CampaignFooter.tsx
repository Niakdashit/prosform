import { Facebook, Instagram, Twitter, Linkedin, Youtube, Globe } from "lucide-react";

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'website';
  url: string;
}

export interface LegalLink {
  id: string;
  label: string;
  url: string;
}

export interface FooterConfig {
  enabled: boolean;
  companyName?: string;
  copyrightText?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  showSocialLinks?: boolean;
  socialLinks?: SocialLink[];
  showLegalLinks?: boolean;
  legalLinks?: LegalLink[];
  layout?: 'simple' | 'centered' | 'columns';
  showPoweredBy?: boolean;
  poweredByText?: string;
  poweredByUrl?: string;
  padding?: 'small' | 'medium' | 'large';
}

export const defaultFooterConfig: FooterConfig = {
  enabled: true,
  companyName: '',
  copyrightText: `© ${new Date().getFullYear()} Tous droits réservés`,
  backgroundColor: '#1f2937',
  textColor: '#9ca3af',
  accentColor: '#ffffff',
  showSocialLinks: false,
  socialLinks: [],
  showLegalLinks: true,
  legalLinks: [
    { id: 'legal-1', label: 'Mentions légales', url: '#' },
    { id: 'legal-2', label: 'Politique de confidentialité', url: '#' },
  ],
  layout: 'centered',
  showPoweredBy: false,
  poweredByText: 'Propulsé par',
  poweredByUrl: '#',
  padding: 'medium',
};

const SocialIcon = ({ platform, className }: { platform: SocialLink['platform']; className?: string }) => {
  const icons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    website: Globe,
  };
  const Icon = icons[platform];
  return <Icon className={className} />;
};

interface CampaignFooterProps {
  config: FooterConfig;
  isPreview?: boolean;
  onConfigChange?: (config: Partial<FooterConfig>) => void;
}

export const CampaignFooter = ({ config, isPreview = false }: CampaignFooterProps) => {
  if (!config.enabled) return null;

  const paddingClass = {
    small: 'py-4',
    medium: 'py-8',
    large: 'py-12',
  }[config.padding || 'medium'];

  const renderSimpleLayout = () => (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Copyright */}
      <div className="text-sm" style={{ color: config.textColor }}>
        {config.copyrightText} {config.companyName && `- ${config.companyName}`}
      </div>

      {/* Liens légaux */}
      {config.showLegalLinks && config.legalLinks && config.legalLinks.length > 0 && (
        <div className="flex items-center gap-4">
          {config.legalLinks.map((link, i) => (
            <span key={link.id} className="flex items-center gap-4">
              <a
                href={link.url}
                className="text-sm hover:underline transition-all"
                style={{ color: config.textColor }}
              >
                {link.label}
              </a>
              {i < (config.legalLinks?.length || 0) - 1 && (
                <span style={{ color: config.textColor + '40' }}>|</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Réseaux sociaux */}
      {config.showSocialLinks && config.socialLinks && config.socialLinks.length > 0 && (
        <div className="flex items-center gap-3">
          {config.socialLinks.map(social => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: config.accentColor }}
            >
              <SocialIcon platform={social.platform} className="w-5 h-5" />
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const renderCenteredLayout = () => (
    <div className="flex flex-col items-center gap-4">
      {/* Réseaux sociaux */}
      {config.showSocialLinks && config.socialLinks && config.socialLinks.length > 0 && (
        <div className="flex items-center gap-4">
          {config.socialLinks.map(social => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: config.accentColor }}
            >
              <SocialIcon platform={social.platform} className="w-5 h-5" />
            </a>
          ))}
        </div>
      )}

      {/* Liens légaux */}
      {config.showLegalLinks && config.legalLinks && config.legalLinks.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {config.legalLinks.map((link, i) => (
            <span key={link.id} className="flex items-center gap-4">
              <a
                href={link.url}
                className="text-sm hover:underline transition-all"
                style={{ color: config.textColor }}
              >
                {link.label}
              </a>
              {i < (config.legalLinks?.length || 0) - 1 && (
                <span className="hidden md:inline" style={{ color: config.textColor + '40' }}>|</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Copyright */}
      <div className="text-sm text-center" style={{ color: config.textColor }}>
        {config.copyrightText} {config.companyName && `- ${config.companyName}`}
      </div>

      {/* Powered by */}
      {config.showPoweredBy && (
        <div className="text-xs" style={{ color: config.textColor + '80' }}>
          {config.poweredByText}{' '}
          <a 
            href={config.poweredByUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: config.accentColor }}
          >
            Prosform
          </a>
        </div>
      )}
    </div>
  );

  const renderColumnsLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Colonne 1 : Marque */}
      <div className="flex flex-col items-center md:items-start gap-2">
        {config.companyName && (
          <h3 className="font-semibold text-lg" style={{ color: config.accentColor }}>
            {config.companyName}
          </h3>
        )}
        <p className="text-sm" style={{ color: config.textColor }}>
          {config.copyrightText}
        </p>
      </div>

      {/* Colonne 2 : Liens légaux */}
      {config.showLegalLinks && config.legalLinks && config.legalLinks.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <h4 className="font-medium text-sm mb-1" style={{ color: config.accentColor }}>
            Informations
          </h4>
          {config.legalLinks.map(link => (
            <a
              key={link.id}
              href={link.url}
              className="text-sm hover:underline transition-all"
              style={{ color: config.textColor }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Colonne 3 : Réseaux sociaux */}
      {config.showSocialLinks && config.socialLinks && config.socialLinks.length > 0 && (
        <div className="flex flex-col items-center md:items-end gap-2">
          <h4 className="font-medium text-sm mb-1" style={{ color: config.accentColor }}>
            Suivez-nous
          </h4>
          <div className="flex items-center gap-3">
            {config.socialLinks.map(social => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                style={{ color: config.accentColor }}
              >
                <SocialIcon platform={social.platform} className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <footer
      className={`w-full ${paddingClass} relative`}
      style={{ 
        backgroundColor: config.backgroundColor,
        marginTop: 'auto'
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {config.layout === 'simple' && renderSimpleLayout()}
        {config.layout === 'centered' && renderCenteredLayout()}
        {config.layout === 'columns' && renderColumnsLayout()}
      </div>
    </footer>
  );
};
