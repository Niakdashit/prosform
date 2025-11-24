import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { Button } from "@/components/ui/button";
import { Check, Gift, PartyPopper, Sparkles, Facebook, Twitter, Instagram, Linkedin, Share2 } from "lucide-react";

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
  showVariableMenu,
  variableTarget,
  menuView,
  onToggleVariableMenu,
  onSetMenuView,
  availableVariables = [],
  onInsertVariable,
  onRestart,
  socialLinks
}: EndingLayoutProps) => {

  const renderContent = () => (
    <div className="text-center w-full max-w-2xl px-8">
      <div className="relative mb-6">
        {editingField === 'ending-title' && (
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

        <h1 
          className="text-3xl md:text-4xl font-bold cursor-text hover:opacity-80 transition-opacity"
          style={{ 
            color: textColor,
            outline: editingField === 'ending-title' ? '2px solid rgba(245, 202, 60, 0.5)' : 'none',
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
        </h1>
      </div>
      
      <div className="relative mb-8">
        {editingField === 'ending-subtitle' && (
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
          className="text-xl md:text-2xl mb-8 cursor-text hover:opacity-80 transition-opacity"
          style={{ 
            color: textColor,
            opacity: 0.9,
            outline: editingField === 'ending-subtitle' ? '2px solid rgba(245, 202, 60, 0.5)' : 'none',
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
          {subtitle.replace('{{prize}}', wonPrize || '')}
        </p>
      </div>
      
      {socialLinks && (Object.values(socialLinks).some(link => link)) && (
        <div className="mb-8">
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

      {onRestart && (
        <Button 
          onClick={onRestart}
          className="h-11 px-8 text-base font-medium rounded-full hover-scale"
          style={{ backgroundColor: buttonColor, color: '#3D3731' }}
        >
          Rejouer
        </Button>
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