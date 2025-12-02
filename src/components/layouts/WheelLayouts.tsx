import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import SmartWheel from "@/components/SmartWheel/SmartWheel";
import { WheelSegment } from "@/components/WheelBuilder";
import { useTheme, getButtonStyles } from "@/contexts/ThemeContext";

interface WheelLayoutProps {
  layout: DesktopLayoutType | MobileLayoutType;
  viewMode: 'desktop' | 'mobile';
  title: string;
  subtitle: string;
  segments: WheelSegment[];
  isSpinning: boolean;
  onSpin: () => void;
  onResult: (segment: any) => void;
  onComplete: (prize: string) => void;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  logoPosition?: 'left' | 'center' | 'right';
}

export const WheelLayouts = ({
  layout,
  viewMode,
  title,
  subtitle,
  segments,
  isSpinning,
  onSpin,
  onResult,
  onComplete,
  backgroundColor,
  textColor,
  buttonColor,
  logoPosition = 'left'
}: WheelLayoutProps) => {

  const { theme } = useTheme();
  const unifiedButtonStyles = getButtonStyles(theme);

  // Inverser le layout si le logo est positionné à droite
  const effectiveLayout = (() => {
    if (viewMode === 'desktop' && logoPosition === 'right') {
      if (layout === 'desktop-left-right') return 'desktop-right-left';
      if (layout === 'desktop-right-left') return 'desktop-left-right';
    }
    return layout;
  })();

  const resolveBorderStyle = (style: typeof theme.wheelBorderStyle) => {
    if (style === 'gold') return 'goldRing';
    if (style === 'silver') return 'silverRing';
    return style;
  };

  const getWheelSize = () => {
    if (viewMode === 'mobile') {
      return theme.wheelSizeMobile || 320;
    }
    return theme.wheelSizeDesktop || 400;
  };

  const renderContent = () => (
    <div className="text-center w-full max-w-[700px]">
      <h1 
        className="text-4xl md:text-5xl font-bold mb-4 cursor-text hover:opacity-80 transition-opacity"
        style={{ 
          color: textColor,
          padding: '4px',
          marginTop: '-4px',
          marginLeft: '-4px',
          marginRight: '-4px',
          borderRadius: '4px'
        }}
      >
        {title}
      </h1>
      
      <p 
        className="text-lg md:text-xl mb-8 cursor-text hover:opacity-80 transition-opacity"
        style={{ 
          color: textColor, 
          opacity: 0.9,
          padding: '4px',
          marginTop: '-4px',
          marginLeft: '-4px',
          marginRight: '-4px',
          borderRadius: '4px'
        }}
      >
        {subtitle}
      </p>
    </div>
  );

  const renderWheel = () => (
    <div className="flex items-center justify-center">
      <SmartWheel
        segments={segments.map(seg => ({
          id: seg.id,
          label: seg.label,
          value: seg.label,
          color: seg.color,
          probability: seg.probability,
          textColor: '#ffffff'
        }))}
        theme="modern"
        size={getWheelSize()}
        brandColors={{
          primary: theme.primaryColor,
          secondary: '#ffffff',
          accent: theme.primaryColor
        }}
        customButton={{
          text: 'TOURNER',
          color: theme.buttonColor,
          textColor: theme.buttonTextColor
        }}
        borderStyle={resolveBorderStyle(theme.wheelBorderStyle as any) as any}
        customBorderColor={
          theme.wheelBorderStyle === 'custom'
            ? theme.wheelBorderCustomColor
            : undefined
        }
        showBulbs={true}
        buttonPosition="center"
        onSpin={onSpin}
        onResult={onResult}
        onComplete={onComplete}
        spinMode="probability"
        speed="medium"
      />
    </div>
  );


  if (viewMode === 'desktop') {
    switch (effectiveLayout as DesktopLayoutType) {
      case 'desktop-left-right':
        return (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center space-y-8">
              {renderContent()}
              {renderWheel()}
            </div>
          </div>
        );

      case 'desktop-right-left':
        return (
          <>
            <div className="flex items-center justify-center p-12">
              {renderWheel()}
            </div>
            <div className="flex items-center justify-center p-12">
              {renderContent()}
            </div>
          </>
        );

      case 'desktop-centered':
        return (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center space-y-8">
              {renderContent()}
              {renderWheel()}
            </div>
          </div>
        );

      case 'desktop-card':
        return (
          <div 
            className="max-w-2xl w-full rounded-3xl shadow-2xl p-12"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            <div className="flex flex-col items-center space-y-8">
              {renderContent()}
              {renderWheel()}
            </div>
          </div>
        );

      case 'desktop-panel':
        return (
          <>
            <div 
              className="flex items-center justify-center p-12"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            >
              {renderContent()}
            </div>
            <div className="flex items-center justify-center p-12">
              {renderWheel()}
            </div>
          </>
        );

      case 'desktop-split':
        return (
          <>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" />
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center space-y-8">
                {renderContent()}
                {renderWheel()}
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="flex flex-col items-center space-y-8">
            {renderContent()}
            {renderWheel()}
          </div>
        );
    }
  } else {
    switch (effectiveLayout as MobileLayoutType) {
      case 'mobile-vertical':
        return (
          <div className="flex flex-col gap-6 w-full max-w-[700px]" style={{ padding: '35px' }}>
            {renderContent()}
            {renderWheel()}
          </div>
        );

      case 'mobile-centered':
        return (
          <div className="flex flex-col items-center justify-center py-6 space-y-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            {renderContent()}
            {renderWheel()}
          </div>
        );

      case 'mobile-minimal':
        return (
          <div className="flex flex-col items-center justify-center py-6 space-y-6" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            {renderContent()}
            {renderWheel()}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center space-y-8">
            {renderContent()}
            {renderWheel()}
          </div>
        );
    }
  }
};
