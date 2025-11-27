import { ReactNode } from "react";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useTheme, getButtonStyles } from "@/contexts/ThemeContext";
import { EditableTextBlock } from "../EditableTextBlock";

interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

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
  editingField?: string | null;
  onFocusTitle?: () => void;
  onFocusSubtitle?: () => void;
  onBlurTitle?: (value: string) => void;
  onBlurSubtitle?: (value: string) => void;
  onChangeTitle?: (value: string, html?: string) => void;
  onChangeSubtitle?: (value: string, html?: string) => void;
  onClearTitle?: () => void;
  onClearSubtitle?: () => void;
  showVariableMenu?: boolean;
  variableTarget?: 'title' | 'subtitle' | null;
  menuView?: 'main' | 'variables';
  onToggleVariableMenu?: (target: 'title' | 'subtitle') => void;
  onSetMenuView?: (view: 'main' | 'variables') => void;
  availableVariables?: Array<{ key: string; label: string; description: string }>;
  onInsertVariable?: (variableKey: string) => void;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
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
  editingField,
  onFocusTitle,
  onFocusSubtitle,
  onBlurTitle,
  onBlurSubtitle,
  onChangeTitle,
  onChangeSubtitle,
  onClearTitle,
  onClearSubtitle,
  showVariableMenu,
  variableTarget,
  menuView,
  onToggleVariableMenu,
  onSetMenuView,
  availableVariables = [],
  onInsertVariable,
  titleStyle,
  subtitleStyle
}: WelcomeLayoutProps) => {
  const { theme } = useTheme();
  const unifiedButtonStyles = getButtonStyles(theme);

  // Build style objects from titleStyle/subtitleStyle
  const getTitleStyles = (): React.CSSProperties => ({
    color: titleStyle?.textColor || textColor,
    fontFamily: titleStyle?.fontFamily || 'inherit',
    fontSize: titleStyle?.fontSize ? `${titleStyle.fontSize}px` : undefined,
    fontWeight: titleStyle?.isBold ? 'bold' : undefined,
    fontStyle: titleStyle?.isItalic ? 'italic' : undefined,
    textDecoration: titleStyle?.isUnderline ? 'underline' : undefined,
    textAlign: titleStyle?.textAlign || 'center',
  });

  const getSubtitleStyles = (): React.CSSProperties => ({
    color: subtitleStyle?.textColor || textColor,
    fontFamily: subtitleStyle?.fontFamily || 'inherit',
    fontSize: subtitleStyle?.fontSize ? `${subtitleStyle.fontSize}px` : undefined,
    fontWeight: subtitleStyle?.isBold ? 'bold' : undefined,
    fontStyle: subtitleStyle?.isItalic ? 'italic' : undefined,
    textDecoration: subtitleStyle?.isUnderline ? 'underline' : undefined,
    textAlign: subtitleStyle?.textAlign || 'center',
    opacity: 0.9,
  });

  const renderContent = () => (
    <div className="text-center w-full max-w-[700px]">
      <EditableTextBlock
        value={title}
        onChange={(value, html) => onChangeTitle?.(value, html)}
        onClear={() => onClearTitle?.()}
        onSparklesClick={() => onToggleVariableMenu?.('title')}
        className="text-4xl md:text-5xl font-bold mb-4"
        style={getTitleStyles()}
        isEditing={editingField === 'welcome-title'}
        onFocus={onFocusTitle}
        onBlur={() => onBlurTitle?.(title)}
        showSparkles={true}
        showClear={true}
        fieldType="title"
      />
      
      <EditableTextBlock
        value={subtitle}
        onChange={(value, html) => onChangeSubtitle?.(value, html)}
        onClear={() => onClearSubtitle?.()}
        onSparklesClick={() => onToggleVariableMenu?.('subtitle')}
        className="text-lg md:text-xl mb-8"
        style={getSubtitleStyles()}
        isEditing={editingField === 'welcome-subtitle'}
        onFocus={onFocusSubtitle}
        onBlur={() => onBlurSubtitle?.(subtitle)}
        showSparkles={true}
        showClear={true}
        fieldType="subtitle"
      />
      
      <button 
        onClick={onButtonClick}
        className="flex items-center justify-center font-medium transition-all hover:opacity-90"
        style={unifiedButtonStyles}
      >
        {buttonText}
      </button>
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
            <div className="flex-1 flex items-center justify-center py-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
              {renderContent()}
            </div>
          </div>
        );

      case 'mobile-centered':
        return (
          <div className="flex items-center justify-center py-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            {renderContent()}
          </div>
        );

      case 'mobile-minimal':
        return (
          <div className="flex flex-col items-center justify-center py-6 space-y-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            <div className="text-5xl">🎡</div>
            {renderContent()}
          </div>
        );

      default:
        return renderContent();
    }
  }
};
