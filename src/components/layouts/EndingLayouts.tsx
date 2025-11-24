import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { Button } from "@/components/ui/button";
import { Check, Gift, PartyPopper, Sparkles } from "lucide-react";

interface EndingLayoutProps {
  layout: DesktopLayoutType | MobileLayoutType;
  viewMode: 'desktop' | 'mobile';
  title: string;
  subtitle: string;
  wonPrize: string | null;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  editingField?: string | null;
  onEditTitle?: () => void;
  onEditSubtitle?: () => void;
  onTitleChange?: (value: string) => void;
  onSubtitleChange?: (value: string) => void;
  onBlur?: () => void;
  onRestart?: () => void;
}

export const EndingLayouts = ({
  layout,
  viewMode,
  title,
  subtitle,
  wonPrize,
  backgroundColor,
  textColor,
  buttonColor,
  editingField,
  onEditTitle,
  onEditSubtitle,
  onTitleChange,
  onSubtitleChange,
  onBlur,
  onRestart
}: EndingLayoutProps) => {

  const renderContent = () => (
    <div className="text-center max-w-2xl px-8">
      <div className="mb-6 flex justify-center">
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: buttonColor + '20' }}
        >
          <PartyPopper className="w-12 h-12" style={{ color: buttonColor }} />
        </div>
      </div>
      
      {editingField === 'ending-title' ? (
        <input
          autoFocus
          className="text-4xl md:text-5xl font-bold mb-4 w-full bg-transparent border-b-2 border-primary outline-none text-center"
          style={{ color: textColor }}
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          onBlur={onBlur}
        />
      ) : (
        <h1 
          className="text-4xl md:text-5xl font-bold mb-4 cursor-pointer hover:opacity-80 transition-opacity" 
          style={{ color: textColor }}
          onClick={onEditTitle}
        >
          {title}
        </h1>
      )}
      
      <div 
        className="text-xl md:text-2xl font-semibold mb-6 p-6 rounded-2xl"
        style={{ 
          backgroundColor: buttonColor + '15',
          color: buttonColor 
        }}
      >
        {subtitle.replace('{{prize}}', wonPrize || '')}
      </div>
      
      <p className="text-lg md:text-xl mb-8 opacity-80" style={{ color: textColor }}>
        Votre gain vous sera envoyé par email dans les plus brefs délais
      </p>

      {onRestart && (
        <Button 
          onClick={onRestart}
          variant="outline"
          className="h-12 px-8 text-lg"
        >
          Rejouer
        </Button>
      )}
    </div>
  );

  const renderConfetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        >
          <Sparkles 
            className="w-4 h-4"
            style={{ color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][i % 4] }}
          />
        </div>
      ))}
    </div>
  );

  const renderVisual = () => (
    <div className="flex items-center justify-center p-8 relative">
      <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
        <Gift className="w-32 h-32" style={{ color: buttonColor }} />
        {renderConfetti()}
      </div>
    </div>
  );

  if (viewMode === 'desktop') {
    switch (layout as DesktopLayoutType) {
      case 'desktop-left-right':
        return (
          <>
            <div className="flex items-center justify-center p-12 relative">
              {renderContent()}
            </div>
            {renderVisual()}
          </>
        );

      case 'desktop-right-left':
        return (
          <>
            {renderVisual()}
            <div className="flex items-center justify-center p-12 relative">
              {renderContent()}
            </div>
          </>
        );

      case 'desktop-centered':
        return (
          <div className="flex items-center justify-center p-12 relative">
            {renderConfetti()}
            {renderContent()}
          </div>
        );

      case 'desktop-card':
        return (
          <div 
            className="max-w-2xl w-full rounded-3xl shadow-2xl p-12 relative overflow-hidden"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            {renderConfetti()}
            {renderContent()}
          </div>
        );

      case 'desktop-panel':
        return (
          <>
            <div 
              className="flex items-center justify-center p-12 relative"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            >
              {renderContent()}
            </div>
            {renderVisual()}
          </>
        );

      case 'desktop-split':
        return (
          <>
            <div className="flex items-center justify-center p-12 border-r border-gray-200 relative">
              {renderContent()}
            </div>
            {renderVisual()}
          </>
        );

      case 'desktop-wallpaper':
        return (
          <>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" />
            <div className="flex items-center justify-center p-12">
              {renderConfetti()}
              {renderContent()}
            </div>
          </>
        );

      default:
        return renderContent();
    }
  } else {
    switch (layout as MobileLayoutType) {
      case 'mobile-vertical':
        return (
          <div className="flex flex-col h-full relative">
            {renderConfetti()}
            <div className="flex-1 flex items-center justify-center p-6">
              {renderVisual()}
            </div>
            <div className="flex-1 flex items-center justify-center p-6">
              {renderContent()}
            </div>
          </div>
        );

      case 'mobile-horizontal':
        return (
          <div className="flex h-full">
            <div className="min-w-full flex items-center justify-center snap-center p-6">
              {renderVisual()}
            </div>
            <div className="min-w-full flex items-center justify-center snap-center p-6 relative">
              {renderConfetti()}
              {renderContent()}
            </div>
          </div>
        );

      case 'mobile-centered':
        return (
          <div className="flex items-center justify-center p-6 relative">
            {renderConfetti()}
            {renderContent()}
          </div>
        );

      case 'mobile-minimal':
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-8 relative">
            {renderConfetti()}
            <Gift className="w-20 h-20" style={{ color: buttonColor }} />
            {renderContent()}
          </div>
        );

      default:
        return renderContent();
    }
  }
};
