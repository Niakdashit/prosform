import { useState } from 'react';
import { Sparkles, ChevronDown, Check } from 'lucide-react';
import { TEXT_EFFECTS, EFFECT_CATEGORIES, TextEffect, TextEffectOptions, applyEffect } from '@/data/textEffects';

interface TextEffectSelectorProps {
  onApplyEffect: (html: string) => void;
  selectedText: string;
  currentColor?: string;
  secondaryColor?: string;
}

export const TextEffectSelector = ({ 
  onApplyEffect, 
  selectedText,
  currentColor = '#ffffff',
  secondaryColor = '#a3e635',
}: TextEffectSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredEffects = activeCategory === 'all' 
    ? TEXT_EFFECTS 
    : TEXT_EFFECTS.filter(e => e.category === activeCategory);

  const handleApplyEffect = (effect: TextEffect) => {
    const customOptions: Partial<TextEffectOptions> = {
      primaryColor: currentColor,
      strokeColor: currentColor,
      backgroundColor: secondaryColor,
    };
    
    const html = effect.generateHtml(selectedText || 'Texte', customOptions);
    onApplyEffect(html);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-white/10 transition-colors text-white/80 hover:text-white"
        title="Effets de texte"
      >
        <Sparkles className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-[#2a2a2a] rounded-lg shadow-xl border border-white/10 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b border-white/10">
              <h4 className="text-sm font-medium text-white">Effets de texte</h4>
              <p className="text-xs text-white/50 mt-0.5">
                {selectedText ? `Appliquer à "${selectedText.slice(0, 20)}${selectedText.length > 20 ? '...' : ''}"` : 'Sélectionnez du texte'}
              </p>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 px-2 py-2 border-b border-white/10 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${
                  activeCategory === 'all' 
                    ? 'bg-[#F5B800] text-black' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Tous
              </button>
              {EFFECT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeCategory === cat.id 
                      ? 'bg-[#F5B800] text-black' 
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Effects list */}
            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
              {filteredEffects.map(effect => (
                <button
                  key={effect.id}
                  onClick={() => handleApplyEffect(effect)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  {/* Preview */}
                  <div 
                    className="w-12 h-8 rounded bg-white/5 flex items-center justify-center text-xs font-bold overflow-hidden"
                    style={{ fontSize: '10px' }}
                  >
                    <span 
                      style={{ 
                        ...parsePreviewStyle(effect.preview),
                        fontSize: '10px',
                      }}
                    >
                      Aa
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">
                      {effect.name}
                    </div>
                    <div className="text-xs text-white/50 truncate">
                      {effect.description}
                    </div>
                  </div>

                  {/* Apply indicator */}
                  <Check className="w-4 h-4 text-[#F5B800] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-2 border-t border-white/10 bg-white/5">
              <p className="text-xs text-white/40 text-center">
                Cliquez pour appliquer l'effet
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper to parse preview style string to object
function parsePreviewStyle(styleString: string): React.CSSProperties {
  const style: Record<string, string> = {};
  styleString.split(';').forEach(rule => {
    const [prop, value] = rule.split(':').map(s => s.trim());
    if (prop && value) {
      // Convert kebab-case to camelCase
      const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      style[camelProp] = value;
    }
  });
  return style as React.CSSProperties;
}

export default TextEffectSelector;
