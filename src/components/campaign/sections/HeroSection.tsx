import { ReactNode } from "react";

export interface HeroSectionConfig {
  enabled: boolean;
  layout: 'centered' | 'left-content' | 'right-content' | 'split' | 'fullscreen';
  title: string;
  titleHtml?: string;
  subtitle?: string;
  subtitleHtml?: string;
  buttonText?: string;
  buttonStyle?: 'solid' | 'outline' | 'ghost';
  showImage?: boolean;
  image?: string;
  imagePosition?: 'left' | 'right' | 'background' | 'overlay';
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOverlay?: number;
  textColor?: string;
  accentColor?: string;
  minHeight?: 'auto' | 'half' | 'full';
  verticalAlign?: 'top' | 'center' | 'bottom';
  animation?: 'none' | 'fade-in' | 'slide-up' | 'zoom-in';
}

export const defaultHeroConfig: HeroSectionConfig = {
  enabled: true,
  layout: 'centered',
  title: 'Bienvenue',
  subtitle: 'Découvrez notre offre exclusive',
  buttonText: 'Commencer',
  buttonStyle: 'solid',
  showImage: false,
  imagePosition: 'right',
  minHeight: 'auto',
  verticalAlign: 'center',
  animation: 'fade-in',
};

interface HeroSectionProps {
  config: HeroSectionConfig;
  onButtonClick?: () => void;
  children?: ReactNode;
  isPreview?: boolean;
}

export const HeroSection = ({ config, onButtonClick, children, isPreview }: HeroSectionProps) => {
  if (!config.enabled) return null;

  const minHeightClass = {
    auto: '',
    half: 'min-h-[50vh]',
    full: 'min-h-screen',
  }[config.minHeight || 'auto'];

  const alignClass = {
    top: 'justify-start pt-12',
    center: 'justify-center',
    bottom: 'justify-end pb-12',
  }[config.verticalAlign || 'center'];

  const animationClass = {
    none: '',
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'zoom-in': 'animate-zoom-in',
  }[config.animation || 'none'];

  const renderContent = () => (
    <div className={`flex flex-col ${config.layout === 'centered' ? 'items-center text-center' : 'items-start text-left'} gap-4`}>
      {/* Titre */}
      {config.titleHtml ? (
        <div 
          dangerouslySetInnerHTML={{ __html: config.titleHtml }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold"
          style={{ color: config.textColor }}
        />
      ) : (
        <h1 
          className="text-3xl md:text-4xl lg:text-5xl font-bold"
          style={{ color: config.textColor }}
        >
          {config.title}
        </h1>
      )}

      {/* Sous-titre */}
      {config.subtitle && (
        config.subtitleHtml ? (
          <div 
            dangerouslySetInnerHTML={{ __html: config.subtitleHtml }}
            className="text-lg md:text-xl max-w-2xl"
            style={{ color: config.textColor + 'cc' }}
          />
        ) : (
          <p 
            className="text-lg md:text-xl max-w-2xl"
            style={{ color: config.textColor + 'cc' }}
          >
            {config.subtitle}
          </p>
        )
      )}

      {/* Bouton CTA */}
      {config.buttonText && (
        <button
          onClick={onButtonClick}
          className={`mt-4 px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105 ${
            config.buttonStyle === 'outline' 
              ? 'border-2 bg-transparent' 
              : config.buttonStyle === 'ghost'
                ? 'bg-transparent hover:bg-white/10'
                : 'shadow-lg'
          }`}
          style={{
            backgroundColor: config.buttonStyle === 'solid' ? config.accentColor : 'transparent',
            color: config.buttonStyle === 'solid' ? '#ffffff' : config.accentColor,
            borderColor: config.accentColor,
          }}
        >
          {config.buttonText}
        </button>
      )}

      {/* Contenu additionnel */}
      {children}
    </div>
  );

  const renderImage = () => {
    if (!config.showImage || !config.image) return null;
    
    return (
      <div className="flex-1 flex items-center justify-center">
        <img 
          src={config.image} 
          alt="" 
          className="max-w-full max-h-[400px] object-contain rounded-lg shadow-xl"
        />
      </div>
    );
  };

  // Layout centré
  if (config.layout === 'centered') {
    return (
      <section 
        className={`w-full ${minHeightClass} flex flex-col ${alignClass} items-center px-4 py-12 ${animationClass}`}
        style={{ 
          backgroundColor: config.backgroundColor,
          backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {config.backgroundImage && config.backgroundOverlay && (
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${config.backgroundOverlay / 100})` }}
          />
        )}
        <div className="relative z-10 max-w-4xl mx-auto">
          {config.showImage && config.image && (
            <img 
              src={config.image} 
              alt="" 
              className="max-w-[200px] max-h-[120px] object-contain mx-auto mb-6"
            />
          )}
          {renderContent()}
        </div>
      </section>
    );
  }

  // Layout split (image à gauche ou droite)
  if (config.layout === 'split' || config.layout === 'left-content' || config.layout === 'right-content') {
    const imageFirst = config.layout === 'right-content' || config.imagePosition === 'left';
    
    return (
      <section 
        className={`w-full ${minHeightClass} flex flex-col md:flex-row ${alignClass} px-4 py-12 gap-8 ${animationClass}`}
        style={{ backgroundColor: config.backgroundColor }}
      >
        {imageFirst && renderImage()}
        <div className="flex-1 flex flex-col justify-center">
          {renderContent()}
        </div>
        {!imageFirst && renderImage()}
      </section>
    );
  }

  // Layout fullscreen
  if (config.layout === 'fullscreen') {
    return (
      <section 
        className={`w-full min-h-screen flex flex-col ${alignClass} items-center justify-center px-4 relative ${animationClass}`}
        style={{ 
          backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: config.backgroundColor,
            opacity: config.backgroundImage ? (config.backgroundOverlay || 50) / 100 : 1,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {renderContent()}
        </div>
      </section>
    );
  }

  return null;
};
