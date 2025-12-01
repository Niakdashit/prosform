import { ReactNode } from "react";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactField } from "@/components/WheelBuilder";
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

interface ContactLayoutProps {
  layout: DesktopLayoutType | MobileLayoutType;
  viewMode: 'desktop' | 'mobile';
  title: string;
  subtitle: string;
  fields: ContactField[];
  contactData: { name: string; email: string; phone: string };
  onFieldChange: (type: string, value: string) => void;
  onSubmit: () => void;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  editingField?: string | null;
  isReadOnly?: boolean;
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

export const ContactLayouts = ({
  layout,
  viewMode,
  title,
  subtitle,
  fields,
  contactData,
  onFieldChange,
  onSubmit,
  backgroundColor,
  textColor,
  buttonColor,
  editingField,
  isReadOnly = false,
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
}: ContactLayoutProps) => {
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
    opacity: 0.8,
  });

  const renderForm = () => (
    <div className="w-full max-w-md text-center px-4">
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
        isEditing={!isReadOnly && editingField === 'contact-title'}
        isReadOnly={isReadOnly}
        onFocus={onFocusTitle}
        onBlur={() => onBlurTitle?.(title)}
        fieldType="title"
        marginBottom="16px"
      />
      
      <EditableTextBlock
        value={subtitle}
        onChange={(value, html) => onChangeSubtitle?.(value, html)}
        onClear={() => onClearSubtitle?.()}
        onSparklesClick={() => onToggleVariableMenu?.('subtitle')}
        className=""
        style={{
          ...getSubtitleStyles(),
          fontSize: viewMode === 'mobile' ? '14px' : '18px',
          lineHeight: '1.4',
        }}
        isEditing={!isReadOnly && editingField === 'contact-subtitle'}
        isReadOnly={isReadOnly}
        onFocus={onFocusSubtitle}
        onBlur={() => onBlurSubtitle?.(subtitle)}
        fieldType="subtitle"
        marginBottom="32px"
      />
      
      <div className="space-y-4">
        {fields.map((field, index) => {
          // Checkbox type
          if (field.type === 'checkbox') {
            return (
              <label key={index} className="flex items-start gap-3 cursor-pointer text-left">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-2 transition-colors flex-shrink-0"
                  style={{ 
                    accentColor: buttonColor,
                    borderColor: textColor
                  }}
                  onChange={(e) => onFieldChange(field.id || field.type, e.target.checked ? 'true' : 'false')}
                  required={field.required}
                />
                <span className="text-sm" style={{ color: textColor }}>
                  {field.label}
                  {field.helpText && (
                    <span className="block text-xs opacity-70 mt-1">{field.helpText}</span>
                  )}
                </span>
              </label>
            );
          }

          // Select type
          if (field.type === 'select' && field.options) {
            return (
              <div key={index} className="text-left">
                <label 
                  className="block mb-2 text-sm font-normal"
                  style={{ color: textColor }}
                >
                  {field.label}
                </label>
                <Select
                  onValueChange={(value) => onFieldChange(field.id || field.type, value)}
                >
                  <SelectTrigger 
                    className="h-10 text-sm pointer-events-auto"
                    style={{
                      backgroundColor: backgroundColor,
                      borderColor: textColor,
                      borderWidth: '1px',
                      color: textColor,
                      borderRadius: theme.buttonStyle === 'square' ? '0px' : '8px',
                    }}
                  >
                    <SelectValue placeholder="Sélectionnez une option" />
                  </SelectTrigger>
                  <SelectContent 
                    className="pointer-events-auto z-[100]"
                    style={{
                      backgroundColor: backgroundColor,
                      borderColor: textColor,
                    }}
                  >
                    {field.options.map((opt, i) => (
                      <SelectItem 
                        key={i} 
                        value={opt}
                        style={{ color: textColor }}
                      >
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }

          // Textarea type
          if (field.type === 'textarea') {
            return (
              <div key={index} className="text-left">
                <label 
                  className="block mb-2 text-sm font-normal"
                  style={{ color: textColor }}
                >
                  {field.label}
                </label>
                <textarea
                  className="w-full text-sm px-3 py-2 min-h-[80px] resize-none"
                  style={{
                    backgroundColor: backgroundColor,
                    borderColor: textColor,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: textColor,
                    borderRadius: theme.buttonStyle === 'square' ? '0px' : '8px',
                  }}
                  onChange={(e) => onFieldChange(field.id || field.type, e.target.value)}
                  required={field.required}
                />
              </div>
            );
          }

          // Default: text, email, tel inputs
          return (
            <div key={index} className="text-left">
              <label 
                className="block mb-2 text-sm font-normal"
                style={{ color: textColor }}
              >
                {field.label}
              </label>
              <Input
                type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                value={contactData[field.type as keyof typeof contactData]}
                onChange={(e) => onFieldChange(field.type, e.target.value)}
                required={field.required}
                className="h-10 text-sm"
                style={{
                  backgroundColor: backgroundColor,
                  borderColor: textColor,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  color: textColor,
                  borderRadius: theme.buttonStyle === 'square' ? '0px' : '8px',
                }}
              />
            </div>
          );
        })}
        
        <button 
          onClick={onSubmit}
          className="w-full flex items-center justify-center font-medium transition-all hover:opacity-90"
          style={unifiedButtonStyles}
        >
          Continuer
        </button>
      </div>
    </div>
  );

  const renderVisual = () => (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <div className="text-6xl">📝</div>
      </div>
    </div>
  );

  if (viewMode === 'desktop') {
    switch (layout as DesktopLayoutType) {
      case 'desktop-left-right':
        return (
          <>
            <div className="flex items-center justify-start p-12 overflow-y-auto">
              {renderForm()}
            </div>
            {renderVisual()}
          </>
        );

      case 'desktop-right-left':
        return (
          <>
            {renderVisual()}
            <div className="flex items-center justify-start p-12 overflow-y-auto">
              {renderForm()}
            </div>
          </>
        );

      case 'desktop-centered':
        return (
          <div className="flex items-center justify-start p-12 overflow-y-auto">
            {renderForm()}
          </div>
        );

      case 'desktop-card':
        return (
          <div 
            className="max-w-2xl w-full rounded-3xl shadow-2xl p-12 overflow-y-auto"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            {renderForm()}
          </div>
        );

      case 'desktop-panel':
        return (
          <>
            <div 
              className="flex items-center justify-start p-12 overflow-y-auto"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            >
              {renderForm()}
            </div>
            {renderVisual()}
          </>
        );

      case 'desktop-split':
        return (
          <>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" />
            <div className="flex items-center justify-start p-12 overflow-y-auto">
              {renderForm()}
            </div>
          </>
        );

      default:
        return renderForm();
    }
  } else {
    switch (layout as MobileLayoutType) {
      case 'mobile-vertical':
        return (
          <div className="flex flex-col h-full items-center justify-start py-8 overflow-y-auto" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            {renderForm()}
          </div>
        );

      case 'mobile-centered':
        return (
          <div className="flex items-center justify-start py-8 overflow-y-auto" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            {renderForm()}
          </div>
        );

      case 'mobile-minimal':
        return (
          <div className="flex flex-col items-center justify-start py-6 overflow-y-auto" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            {renderForm()}
          </div>
        );

      default:
        return renderForm();
    }
  }
};