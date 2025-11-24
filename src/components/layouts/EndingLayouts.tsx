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
  onRestart
}: EndingLayoutProps) => {

  const renderContent = () => (
    <div className="text-center w-full max-w-2xl">
      <div className="mb-6 flex justify-center">
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: buttonColor + '20' }}
        >
          <PartyPopper className="w-12 h-12" style={{ color: buttonColor }} />
        </div>
      </div>
      
      <div className="relative">
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
          className="text-4xl md:text-5xl font-bold mb-4 cursor-text hover:opacity-80 transition-opacity"
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
            <div className="flex-1 flex items-center justify-center py-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
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
          <div className="flex items-center justify-center py-8 relative" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
            {renderConfetti()}
            {renderContent()}
          </div>
        );

      case 'mobile-minimal':
        return (
          <div className="flex flex-col items-center justify-center py-6 space-y-8 relative" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
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