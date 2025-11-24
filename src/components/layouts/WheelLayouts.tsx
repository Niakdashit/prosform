import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import SmartWheel from "@/components/SmartWheel/SmartWheel";
import { WheelSegment } from "@/components/WheelBuilder";
import { useTheme } from "@/contexts/ThemeContext";

interface WheelLayoutProps {
  layout: DesktopLayoutType | MobileLayoutType;
  viewMode: 'desktop' | 'mobile';
  segments: WheelSegment[];
  isSpinning: boolean;
  onSpin: () => void;
  onResult: (segment: any) => void;
  onComplete: (prize: string) => void;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
}

export const WheelLayouts = ({
  layout,
  viewMode,
  segments,
  isSpinning,
  onSpin,
  onResult,
  onComplete,
  backgroundColor,
  textColor,
  buttonColor
}: WheelLayoutProps) => {

  const { theme } = useTheme();

  const resolveBorderStyle = (style: typeof theme.wheelBorderStyle) => {
    if (style === 'gold') return 'goldRing';
    if (style === 'silver') return 'silverRing';
    return style;
  };

  const getWheelSize = () => {
    if (viewMode === 'mobile') {
      return layout === 'mobile-minimal' ? 280 : 320;
    }
    return layout === 'desktop-panel' ? 350 : 400;
  };

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
          primary: buttonColor,
          secondary: '#ffffff',
          accent: buttonColor
        }}
        customButton={{
          text: 'TOURNER',
          color: buttonColor,
          textColor: textColor
        }}
        borderStyle={resolveBorderStyle(theme.wheelBorderStyle as any) as any}
        customBorderColor={
          theme.wheelBorderStyle === 'classic'
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

  const renderInfo = () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-6">
      <div className="text-center max-w-md">
        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>
          Tournez la roue !
        </h2>
        <p className="text-lg md:text-xl opacity-80" style={{ color: textColor }}>
          Tentez votre chance et découvrez ce que vous avez gagné
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {segments.slice(0, 4).map((seg, idx) => (
          <div 
            key={idx}
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: seg.color, color: '#ffffff' }}
          >
            <div className="font-semibold text-sm">{seg.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (viewMode === 'desktop') {
    switch (layout as DesktopLayoutType) {
      case 'desktop-left-right':
        return (
          <>
            {renderInfo()}
            <div className="flex items-center justify-center p-12">
              {renderWheel()}
            </div>
          </>
        );

      case 'desktop-right-left':
        return (
          <>
            <div className="flex items-center justify-center p-12">
              {renderWheel()}
            </div>
            {renderInfo()}
          </>
        );

      case 'desktop-centered':
        return (
          <div className="flex items-center justify-center p-12">
            {renderWheel()}
          </div>
        );

      case 'desktop-card':
        return (
          <div 
            className="max-w-2xl w-full rounded-3xl shadow-2xl p-12"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            <div className="flex flex-col items-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold" style={{ color: textColor }}>
                Tournez la roue !
              </h2>
              {renderWheel()}
            </div>
          </div>
        );

      case 'desktop-panel':
        return (
          <>
            <div 
              className="flex items-center justify-center p-8"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            >
              {renderWheel()}
            </div>
            {renderInfo()}
          </>
        );

      case 'desktop-split':
        return (
          <>
            {renderInfo()}
            <div className="flex items-center justify-center p-12 border-l border-gray-200">
              {renderWheel()}
            </div>
          </>
        );

      case 'desktop-wallpaper':
        return (
          <>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" />
            <div className="flex items-center justify-center p-12">
              {renderWheel()}
            </div>
          </>
        );

      default:
        return renderWheel();
    }
  } else {
    switch (layout as MobileLayoutType) {
      case 'mobile-vertical':
        return (
          <div className="flex flex-col h-full justify-center items-center py-8 space-y-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-center" style={{ color: textColor }}>
              Tournez la roue !
            </h2>
            {renderWheel()}
          </div>
        );

      case 'mobile-horizontal':
        return (
          <div className="flex h-full">
            <div className="min-w-full flex items-center justify-center snap-center p-6">
              {renderInfo()}
            </div>
            <div className="min-w-full flex items-center justify-center snap-center p-6">
              {renderWheel()}
            </div>
          </div>
        );

      case 'mobile-centered':
        return (
          <div className="flex items-center justify-center py-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            {renderWheel()}
          </div>
        );

      case 'mobile-minimal':
        return (
          <div className="flex flex-col items-center justify-center py-4 space-y-6" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            {renderWheel()}
          </div>
        );

      default:
        return renderWheel();
    }
  }
};
