import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { Button } from "@/components/ui/button";
import { Check, Gift, PartyPopper, Sparkles, Facebook, Twitter, Instagram, Linkedin, Share2 } from "lucide-react";
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
  onRestart?: () => void;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
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
  onRestart,
  socialLinks,
  titleStyle,
  subtitleStyle
}: EndingLayoutProps) => {
  const { theme } = useTheme();
  const unifiedButtonStyles = getButtonStyles(theme);

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
    <div className="text-center w-full max-w-2xl px-6">
      <EditableTextBlock
        value={title}
        onChange={(value, html) => onChangeTitle?.(value, html)}
        onClear={() => onClearTitle?.()}
        onSparklesClick={() => onToggleVariableMenu?.('title')}
        className="font-bold"
        style={{
          ...getTitleStyles(),
          fontSize: viewMode === 'mobile' ? '28px' : '42px',
          lineHeight: '1.2',
        }}
        isEditing={editingField === 'ending-title'}
        onFocus={onFocusTitle}
        onBlur={() => onBlurTitle?.(title)}
        fieldType="title"
        marginBottom="16px"
      />
      
      <EditableTextBlock
        value={subtitle.replace('{{prize}}', wonPrize || '')}
        onChange={(value, html) => onChangeSubtitle?.(value, html)}
        onClear={() => onClearSubtitle?.()}
        onSparklesClick={() => onToggleVariableMenu?.('subtitle')}
        className=""
        style={{
          ...getSubtitleStyles(),
          fontSize: viewMode === 'mobile' ? '14px' : '18px',
          lineHeight: '1.4',
        }}
        isEditing={editingField === 'ending-subtitle'}
        onFocus={onFocusSubtitle}
        onBlur={() => onBlurSubtitle?.(subtitle)}
        fieldType="subtitle"
        marginBottom="32px"
      />
      
      {onRestart && (
        <div className="flex justify-center">
          <button 
            onClick={onRestart}
            className="inline-flex items-center justify-center font-medium transition-all hover:opacity-90"
            style={unifiedButtonStyles}
          >
            Rejouer
          </button>
        </div>
      )}

      {socialLinks && (Object.values(socialLinks).some(link => link)) && (
        <div>
          <p className="text-sm mb-4 opacity-70" style={{ color: textColor }}>
            Partagez votre victoire
          </p>
          <div className="flex justify-center gap-3">
            {socialLinks.facebook && (
              <a 
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: '#1877F2', color: '#FFFFFF' }}
              >
                <Facebook className="w-5 h-5" fill="currentColor" />
              </a>
            )}
            {socialLinks.twitter && (
              <a 
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: '#1DA1F2', color: '#FFFFFF' }}
              >
                <Twitter className="w-5 h-5" fill="currentColor" />
              </a>
            )}
            {socialLinks.instagram && (
              <a 
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', color: '#FFFFFF' }}
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {socialLinks.linkedin && (
              <a 
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: '#0A66C2', color: '#FFFFFF' }}
              >
                <Linkedin className="w-5 h-5" fill="currentColor" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderVisual = () => null;

  if (viewMode === 'desktop') {
    return (
      <div className="flex items-center justify-center h-full p-12">
        {renderContent()}
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center h-full py-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
        {renderContent()}
      </div>
    );
  }
};