import { ReactNode } from "react";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactField } from "@/components/WheelBuilder";
import { Sparkles } from "lucide-react";

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
  onFocusTitle?: () => void;
  onFocusSubtitle?: () => void;
  onBlurTitle?: (value: string) => void;
  onBlurSubtitle?: (value: string) => void;
  showVariableMenu?: boolean;
  variableTarget?: 'title' | 'subtitle' | null;
  menuView?: 'main' | 'variables';
  onToggleVariableMenu?: (target: 'title' | 'subtitle') => void;
  onSetMenuView?: (view: 'main' | 'variables') => void;
  availableVariables?: Array<{ key: string; label: string; description: string }>;
  onInsertVariable?: (variableKey: string) => void;
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
  onFocusTitle,
  onFocusSubtitle,
  onBlurTitle,
  onBlurSubtitle,
  showVariableMenu,
  variableTarget,
  menuView,
  onToggleVariableMenu,
  onSetMenuView,
  availableVariables = [],
  onInsertVariable
}: ContactLayoutProps) => {

  const renderForm = () => (
    <div className="w-full max-w-md">
      <div className="relative">
        {editingField === 'contact-title' && (
          <>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onToggleVariableMenu?.('title')}
              className="absolute -top-3 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50 animate-fade-in"
              style={{ 
                backgroundColor: 'rgba(245, 184, 0, 0.15)',
                color: '#F5B800',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {showVariableMenu && variableTarget === 'title' && (
              <div
                className="absolute z-50 w-72 p-2 rounded-md shadow-xl animate-fade-in"
                style={{
                  top: '32px',
                  right: 0,
                  backgroundColor: '#4A4138',
                  border: '1px solid rgba(245, 184, 0, 0.3)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}
              >
                {menuView === 'main' ? (
                  <div className="space-y-1">
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => console.log('Réécriture AI')}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                    >
                      <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Réécriture</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Améliorer le texte avec l&apos;IA</div>
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSetMenuView?.('variables')}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                    >
                      <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Variable</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Insérer une variable dynamique</div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSetMenuView?.('main')}
                      className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/10 mb-2"
                    >
                      <div className="text-xs" style={{ color: '#A89A8A' }}>← Retour</div>
                    </button>
                    {availableVariables.map((variable) => (
                      <button
                        key={variable.key}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onInsertVariable?.(variable.key)}
                        className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                      >
                        <div className="font-medium text-sm" style={{ color: '#F5B800' }}>{variable.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>{variable.description} • {`{{${variable.key}}}`}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <h2 
          className="text-4xl md:text-5xl font-bold mb-4 text-center cursor-text hover:opacity-80 transition-opacity"
          style={{ 
            color: textColor,
            outline: editingField === 'contact-title' ? '2px solid rgba(245, 202, 60, 0.5)' : 'none',
            padding: '4px',
            marginTop: '-4px',
            marginLeft: '-4px',
            marginRight: '-4px',
            borderRadius: '4px'
          }}
          contentEditable
          suppressContentEditableWarning
          onFocus={onFocusTitle}
          onBlur={(e) => onBlurTitle?.(e.currentTarget.textContent || '')}
        >
          {title}
        </h2>
      </div>

      <div className="relative">
        {editingField === 'contact-subtitle' && (
          <>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onToggleVariableMenu?.('subtitle')}
              className="absolute -top-3 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50 animate-fade-in"
              style={{ 
                backgroundColor: 'rgba(245, 184, 0, 0.15)',
                color: '#F5B800',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {showVariableMenu && variableTarget === 'subtitle' && (
              <div
                className="absolute z-50 w-72 p-2 rounded-md shadow-xl animate-fade-in"
                style={{
                  top: '32px',
                  right: 0,
                  backgroundColor: '#4A4138',
                  border: '1px solid rgba(245, 184, 0, 0.3)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}
              >
                {menuView === 'main' ? (
                  <div className="space-y-1">
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => console.log('Réécriture AI')}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                    >
                      <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Réécriture</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Améliorer le texte avec l&apos;IA</div>
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSetMenuView?.('variables')}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                    >
                      <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Variable</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Insérer une variable dynamique</div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSetMenuView?.('main')}
                      className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/10 mb-2"
                    >
                      <div className="text-xs" style={{ color: '#A89A8A' }}>← Retour</div>
                    </button>
                    {availableVariables.map((variable) => (
                      <button
                        key={variable.key}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onInsertVariable?.(variable.key)}
                        className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                      >
                        <div className="font-medium text-sm" style={{ color: '#F5B800' }}>{variable.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>{variable.description} • {`{{${variable.key}}}`}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <p 
          className="text-lg md:text-xl text-center mb-8 cursor-text hover:opacity-100 transition-opacity"
          style={{ 
            color: textColor, 
            opacity: 0.8,
            outline: editingField === 'contact-subtitle' ? '2px solid rgba(184, 168, 146, 0.5)' : 'none',
            padding: '4px',
            marginTop: '-4px',
            marginLeft: '-4px',
            marginRight: '-4px',
            borderRadius: '4px'
          }}
          contentEditable
          suppressContentEditableWarning
          onFocus={onFocusSubtitle}
          onBlur={(e) => onBlurSubtitle?.(e.currentTarget.textContent || '')}
        >
          {subtitle}
        </p>
      </div>
      
      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.type}>
            <Input
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              placeholder={field.label}
              value={contactData[field.type as keyof typeof contactData]}
              onChange={(e) => onFieldChange(field.type, e.target.value)}
              required={field.required}
              className="h-12 text-base"
            />
          </div>
        ))}
        
        <Button 
          onClick={onSubmit}
          className="w-full h-12 text-lg"
          style={{ backgroundColor: buttonColor, color: textColor }}
        >
          Continuer
        </Button>
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
            <div className="flex items-center justify-center p-12">
              {renderForm()}
            </div>
            {renderVisual()}
          </>
        );

      case 'desktop-right-left':
        return (
          <>
            {renderVisual()}
            <div className="flex items-center justify-center p-12">
              {renderForm()}
            </div>
          </>
        );

      case 'desktop-centered':
        return (
          <div className="flex items-center justify-center p-12">
            {renderForm()}
          </div>
        );

      case 'desktop-card':
        return (
          <div 
            className="max-w-2xl w-full rounded-3xl shadow-2xl p-12"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            {renderForm()}
          </div>
        );

      case 'desktop-panel':
        return (
          <>
            <div 
              className="flex items-center justify-center p-12"
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
            <div className="flex items-center justify-center p-12">
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
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center p-6">
              {renderVisual()}
            </div>
            <div className="flex-1 flex items-center justify-center py-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
              {renderForm()}
            </div>
          </div>
        );

      case 'mobile-centered':
        return (
          <div className="flex items-center justify-center py-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            {renderForm()}
          </div>
        );

      case 'mobile-minimal':
        return (
          <div className="flex flex-col items-center justify-center py-6 space-y-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            <div className="text-6xl">📝</div>
            {renderForm()}
          </div>
        );

      default:
        return renderForm();
    }
  }
};