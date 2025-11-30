import { Shield, Lock, CreditCard, Truck, Award, CheckCircle, Users, ThumbsUp } from "lucide-react";

export interface TrustBadge {
  id: string;
  icon: 'shield' | 'lock' | 'card' | 'truck' | 'award' | 'check' | 'users' | 'thumbsup' | 'custom';
  customIcon?: string;
  label: string;
}

export interface TrustBadgesSectionConfig {
  enabled: boolean;
  badges: TrustBadge[];
  layout: 'inline' | 'grid' | 'minimal';
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const defaultTrustBadgesConfig: TrustBadgesSectionConfig = {
  enabled: false,
  badges: [
    { id: 'b1', icon: 'shield', label: '100% Sécurisé' },
    { id: 'b2', icon: 'lock', label: 'Données protégées' },
    { id: 'b3', icon: 'check', label: 'Sans engagement' },
  ],
  layout: 'inline',
  showLabels: true,
  size: 'medium',
};

const IconComponent = ({ icon, customIcon, className, style }: { 
  icon: TrustBadge['icon']; 
  customIcon?: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  if (icon === 'custom' && customIcon) {
    return <img src={customIcon} alt="" className={className} />;
  }

  const icons = {
    shield: Shield,
    lock: Lock,
    card: CreditCard,
    truck: Truck,
    award: Award,
    check: CheckCircle,
    users: Users,
    thumbsup: ThumbsUp,
    custom: Shield,
  };

  const Icon = icons[icon];
  return <Icon className={className} style={style} />;
};

interface TrustBadgesSectionProps {
  config: TrustBadgesSectionConfig;
  isPreview?: boolean;
}

export const TrustBadgesSection = ({ config, isPreview }: TrustBadgesSectionProps) => {
  if (!config.enabled || config.badges.length === 0) return null;

  const sizeClasses = {
    small: { icon: 'w-4 h-4', text: 'text-xs', gap: 'gap-1', padding: 'py-2' },
    medium: { icon: 'w-5 h-5', text: 'text-sm', gap: 'gap-2', padding: 'py-3' },
    large: { icon: 'w-6 h-6', text: 'text-base', gap: 'gap-3', padding: 'py-4' },
  }[config.size || 'medium'];

  const layoutClass = {
    inline: 'flex flex-wrap items-center justify-center gap-6',
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-4',
    minimal: 'flex items-center justify-center gap-4',
  }[config.layout];

  return (
    <section 
      className={`w-full px-4 ${sizeClasses.padding}`}
      style={{ backgroundColor: config.backgroundColor }}
    >
      <div className={`max-w-4xl mx-auto ${layoutClass}`}>
        {config.badges.map((badge, index) => (
          <div 
            key={badge.id}
            className={`flex items-center ${sizeClasses.gap}`}
          >
            <IconComponent 
              icon={badge.icon}
              customIcon={badge.customIcon}
              className={sizeClasses.icon}
              style={{ color: config.iconColor }}
            />
            {config.showLabels && (
              <span 
                className={`${sizeClasses.text} font-medium`}
                style={{ color: config.textColor }}
              >
                {badge.label}
              </span>
            )}
            
            {/* Séparateur pour layout inline */}
            {config.layout === 'inline' && index < config.badges.length - 1 && (
              <span 
                className="hidden md:inline mx-2"
                style={{ color: config.textColor + '30' }}
              >
                •
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
