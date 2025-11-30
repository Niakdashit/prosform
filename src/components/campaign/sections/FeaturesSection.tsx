import { Gift, Star, Shield, Zap, Heart, Trophy, Clock, Percent } from "lucide-react";

export interface FeatureItem {
  id: string;
  icon: 'gift' | 'star' | 'shield' | 'zap' | 'heart' | 'trophy' | 'clock' | 'percent' | 'custom';
  customIcon?: string; // URL pour icône custom
  title: string;
  description?: string;
}

export interface FeaturesSectionConfig {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  layout: 'grid-3' | 'grid-4' | 'horizontal' | 'vertical' | 'cards';
  features: FeatureItem[];
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  iconStyle?: 'filled' | 'outline' | 'minimal';
  showDividers?: boolean;
}

export const defaultFeaturesConfig: FeaturesSectionConfig = {
  enabled: false,
  title: 'Pourquoi participer ?',
  layout: 'grid-3',
  features: [
    { id: 'f1', icon: 'gift', title: 'Des cadeaux exclusifs', description: 'Gagnez des réductions et des surprises' },
    { id: 'f2', icon: 'zap', title: 'Instantané', description: 'Résultat immédiat, pas d\'attente' },
    { id: 'f3', icon: 'shield', title: '100% gratuit', description: 'Aucun engagement, aucun frais' },
  ],
  iconStyle: 'filled',
  showDividers: false,
};

const IconComponent = ({ icon, customIcon, className, style }: { 
  icon: FeatureItem['icon']; 
  customIcon?: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  if (icon === 'custom' && customIcon) {
    return <img src={customIcon} alt="" className={className} style={style} />;
  }

  const icons = {
    gift: Gift,
    star: Star,
    shield: Shield,
    zap: Zap,
    heart: Heart,
    trophy: Trophy,
    clock: Clock,
    percent: Percent,
    custom: Gift, // fallback
  };

  const Icon = icons[icon];
  return <Icon className={className} style={style} />;
};

interface FeaturesSectionProps {
  config: FeaturesSectionConfig;
  isPreview?: boolean;
}

export const FeaturesSection = ({ config, isPreview }: FeaturesSectionProps) => {
  if (!config.enabled || config.features.length === 0) return null;

  const gridClass = {
    'grid-3': 'grid grid-cols-1 md:grid-cols-3 gap-6',
    'grid-4': 'grid grid-cols-2 md:grid-cols-4 gap-4',
    'horizontal': 'flex flex-wrap justify-center gap-8',
    'vertical': 'flex flex-col gap-4 max-w-xl mx-auto',
    'cards': 'grid grid-cols-1 md:grid-cols-3 gap-6',
  }[config.layout];

  const renderFeature = (feature: FeatureItem, index: number) => {
    const iconBgClass = config.iconStyle === 'filled' 
      ? 'p-3 rounded-full' 
      : config.iconStyle === 'outline'
        ? 'p-3 rounded-full border-2'
        : 'p-2';

    const isCard = config.layout === 'cards';
    const isHorizontal = config.layout === 'horizontal';

    return (
      <div 
        key={feature.id}
        className={`flex ${isHorizontal ? 'flex-col items-center text-center max-w-[150px]' : isCard ? 'flex-col items-center text-center p-6 rounded-xl' : 'items-start gap-4'}`}
        style={isCard ? { 
          backgroundColor: config.accentColor + '10',
          border: `1px solid ${config.accentColor}20`,
        } : undefined}
      >
        {/* Icône */}
        <div 
          className={iconBgClass}
          style={{ 
            backgroundColor: config.iconStyle === 'filled' ? config.accentColor + '20' : 'transparent',
            borderColor: config.iconStyle === 'outline' ? config.accentColor : undefined,
          }}
        >
          <IconComponent 
            icon={feature.icon} 
            customIcon={feature.customIcon}
            className="w-6 h-6"
            style={{ color: config.accentColor }}
          />
        </div>

        {/* Texte */}
        <div className={isHorizontal || isCard ? 'mt-3' : ''}>
          <h3 
            className="font-semibold text-base"
            style={{ color: config.textColor }}
          >
            {feature.title}
          </h3>
          {feature.description && (
            <p 
              className="text-sm mt-1"
              style={{ color: config.textColor + 'aa' }}
            >
              {feature.description}
            </p>
          )}
        </div>

        {/* Divider pour layout vertical */}
        {config.showDividers && config.layout === 'vertical' && index < config.features.length - 1 && (
          <div 
            className="w-full h-px mt-4"
            style={{ backgroundColor: config.textColor + '20' }}
          />
        )}
      </div>
    );
  };

  return (
    <section 
      className="w-full px-4 py-12"
      style={{ backgroundColor: config.backgroundColor }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Titre de section */}
        {config.title && (
          <div className="text-center mb-8">
            <h2 
              className="text-2xl md:text-3xl font-bold"
              style={{ color: config.textColor }}
            >
              {config.title}
            </h2>
            {config.subtitle && (
              <p 
                className="mt-2 text-lg"
                style={{ color: config.textColor + 'aa' }}
              >
                {config.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Features */}
        <div className={gridClass}>
          {config.features.map((feature, index) => renderFeature(feature, index))}
        </div>
      </div>
    </section>
  );
};
