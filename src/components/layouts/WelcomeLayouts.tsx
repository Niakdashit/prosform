import { ReactNode } from "react";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { Button } from "@/components/ui/button";

interface WelcomeLayoutProps {
  layout: DesktopLayoutType | MobileLayoutType;
  viewMode: 'desktop' | 'mobile';
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick: () => void;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  backgroundImage?: string;
  onEditTitle?: () => void;
  onEditSubtitle?: () => void;
  editingField?: string | null;
  onTitleChange?: (value: string) => void;
  onSubtitleChange?: (value: string) => void;
  onBlur?: () => void;
}

export const WelcomeLayouts = ({
  layout,
  viewMode,
  title,
  subtitle,
  buttonText,
  onButtonClick,
  backgroundColor,
  textColor,
  buttonColor,
  backgroundImage,
  onEditTitle,
  onEditSubtitle,
  editingField,
  onTitleChange,
  onSubtitleChange,
  onBlur
}: WelcomeLayoutProps) => {

  const renderContent = () => (
    <div className="text-center max-w-2xl px-8">
      {editingField === 'welcome-title' ? (
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
      
      {editingField === 'welcome-subtitle' ? (
        <textarea
          autoFocus
          className="text-lg md:text-xl mb-8 w-full bg-transparent border-b border-primary outline-none text-center resize-none"
          style={{ color: textColor }}
          value={subtitle}
          onChange={(e) => onSubtitleChange?.(e.target.value)}
          onBlur={onBlur}
          rows={2}
        />
      ) : (
        <p 
          className="text-lg md:text-xl mb-8 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: textColor, opacity: 0.9 }}
          onClick={onEditSubtitle}
        >
          {subtitle}
        </p>
      )}
      
      <Button 
        onClick={onButtonClick}
        className="h-12 px-8 text-lg"
        style={{ backgroundColor: buttonColor, color: textColor }}
      >
        {buttonText}
      </Button>
    </div>
  );

  const renderVisual = () => (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <div className="text-6xl">🎡</div>
      </div>
    </div>
  );

  if (viewMode === 'desktop') {
    switch (layout as DesktopLayoutType) {
      case 'desktop-left-right':
        return (
          <>
            <div className="flex items-center justify-center p-12">
              {renderContent()}
            </div>
            {renderVisual()}
          </>
        );

      case 'desktop-right-left':
        return (
          <>
            {renderVisual()}
            <div className="flex items-center justify-center p-12">
              {renderContent()}
            </div>
          </>
        );

      case 'desktop-centered':
        return (
          <div className="flex items-center justify-center p-12">
            {renderContent()}
          </div>
        );

      case 'desktop-card':
        return (
          <div 
            className="max-w-2xl w-full rounded-3xl shadow-2xl p-12"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            {renderContent()}
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
            {renderVisual()}
          </>
        );

      case 'desktop-split':
        return (
          <>
            <div className="flex items-center justify-center p-12 border-r border-gray-200">
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
          <div className="flex flex-col h-full">
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
            <div className="min-w-full flex items-center justify-center snap-center p-6">
              {renderContent()}
            </div>
          </div>
        );

      case 'mobile-centered':
        return (
          <div className="flex items-center justify-center p-6">
            {renderContent()}
          </div>
        );

      case 'mobile-minimal':
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-8">
            <div className="text-5xl">🎡</div>
            {renderContent()}
          </div>
        );

      default:
        return renderContent();
    }
  }
};
