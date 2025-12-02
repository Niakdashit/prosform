import { useState, useEffect, useRef, useCallback } from "react";
import { Bold, Italic, Underline, Palette, ChevronDown, AlignLeft, AlignCenter, AlignRight, Paintbrush } from "lucide-react";
import { HexColorPicker } from "react-colorful";

// Interface pour les styles copiés
interface CopiedStyle {
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
}

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#F5B800', '#FF6B6B', '#4ECDC4', 
  '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
];

const FONT_FAMILIES = [
  'Inter', 'Open Sans', 'Roboto', 'Poppins', 'Montserrat', 
  'Lato', 'Playfair Display', 'Merriweather', 'Raleway', 'Oswald',
  'Source Sans Pro', 'Nunito', 'Quicksand', 'Work Sans', 'Rubik',
  'Libre Baskerville', 'Crimson Text', 'Cormorant Garamond',
  'Dancing Script', 'Pacifico', 'Lobster', 'Caveat', 'Satisfy',
  'Bebas Neue', 'Anton', 'Archivo Black', 'Righteous',
  'Space Grotesk', 'DM Sans', 'Manrope', 'Outfit'
];

// Load Google Font dynamically
const loadGoogleFont = (fontFamily: string) => {
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;
  
  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
};

// Preload all fonts
FONT_FAMILIES.forEach(font => loadGoogleFont(font));

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64];

interface FloatingToolbarProps {
  containerRef?: React.RefObject<HTMLElement>;
  onUpdateStyle?: (field: string, updates: Record<string, any>) => void;
}

export const FloatingToolbar = ({ containerRef }: FloatingToolbarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [currentAlign, setCurrentAlign] = useState<'left' | 'center' | 'right'>('left');
  const [customColor, setCustomColor] = useState<string>('#98D8C8');
  const [customColorInput, setCustomColorInput] = useState<string>('#98D8C8');
  const [colorTab, setColorTab] = useState<'palette' | 'custom'>('palette');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const activeEditableRef = useRef<HTMLElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const customColorInputRef = useRef<HTMLInputElement | null>(null);
  const [copiedStyle, setCopiedStyle] = useState<CopiedStyle | null>(null);
  const [isPasteMode, setIsPasteMode] = useState(false);

  const AlignIcon = currentAlign === 'left' ? AlignLeft : currentAlign === 'center' ? AlignCenter : AlignRight;

  // Save current selection
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  // Restore saved selection
  const restoreSelection = useCallback(() => {
    const selection = window.getSelection();
    if (savedSelectionRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
  }, []);

  // Select all content in element
  const selectAllContent = useCallback((element: HTMLElement) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection?.removeAllRanges();
    selection?.addRange(range);
    savedSelectionRef.current = range.cloneRange();
  }, []);
  
  const cycleAlignment = () => {
    const next = currentAlign === 'left' ? 'center' : currentAlign === 'center' ? 'right' : 'left';
    setCurrentAlign(next);
    applyStyle(next === 'left' ? 'justifyLeft' : next === 'center' ? 'justifyCenter' : 'justifyRight');
  };

  // Convertir RGB en HEX
  const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  // Copier le style du texte sélectionné ou de l'élément actif
  const copyStyle = useCallback(() => {
    const editableElement = activeEditableRef.current;
    if (!editableElement) return;

    const selection = window.getSelection();
    let styleSource: HTMLElement | null = null;

    // Si on a une sélection, récupérer les styles du premier noeud sélectionné
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.startContainer;
      styleSource = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container as HTMLElement;
      
      // Remonter pour trouver l'élément avec les styles (span, b, i, etc.)
      while (styleSource && styleSource !== editableElement && !styleSource.style.cssText) {
        const parent = styleSource.parentElement;
        if (parent && parent !== editableElement) {
          styleSource = parent;
        } else {
          break;
        }
      }
    } else {
      // Sinon, utiliser l'élément éditable lui-même
      styleSource = editableElement;
    }

    if (!styleSource) return;

    // Récupérer les styles computés
    const computedStyle = window.getComputedStyle(styleSource);
    
    // Convertir la couleur RGB en HEX pour une meilleure compatibilité
    const textColor = rgbToHex(computedStyle.color);
    
    // Extraire la police proprement
    let fontFamily = computedStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    // Si c'est une police système, utiliser Inter par défaut
    if (fontFamily === '-apple-system' || fontFamily === 'BlinkMacSystemFont' || fontFamily === 'system-ui') {
      fontFamily = 'Inter';
    }
    
    const style: CopiedStyle = {
      isBold: computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 600,
      isItalic: computedStyle.fontStyle === 'italic',
      isUnderline: computedStyle.textDecoration.includes('underline'),
      textColor: textColor,
      fontFamily: fontFamily,
      fontSize: Math.round(parseFloat(computedStyle.fontSize)),
      textAlign: (computedStyle.textAlign === 'start' ? 'left' : computedStyle.textAlign) as 'left' | 'center' | 'right',
    };

    setCopiedStyle(style);
    setIsPasteMode(true);
    
    // Mettre à jour les états de la toolbar pour refléter les styles copiés
    setSelectedFont(style.fontFamily || 'Inter');
    setCurrentFontSize(style.fontSize || 16);
    setCurrentAlign(style.textAlign || 'left');
    
    console.log('Style copié:', style);
  }, []);

  // Appliquer un style inline à la sélection avec un span
  const wrapSelectionWithStyle = (styleProps: React.CSSProperties) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText.trim()) return false;
    
    // Créer un span avec les styles
    const span = document.createElement('span');
    Object.assign(span.style, styleProps);
    
    // Extraire le contenu et l'envelopper
    range.surroundContents(span);
    
    // Sélectionner le nouveau contenu
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);
    
    return true;
  };

  // Coller le style sur le texte sélectionné ou l'élément actif
  const pasteStyle = useCallback(() => {
    if (!copiedStyle) return;
    
    const editableElement = activeEditableRef.current;
    if (!editableElement) return;

    const fieldType = editableElement.getAttribute('data-text-editable');
    if (!fieldType) return;

    // Restaurer la sélection si nécessaire
    restoreSelection();
    
    const selection = window.getSelection();
    const hasSelection = selection && !selection.isCollapsed && selection.toString().trim() !== '';

    if (hasSelection) {
      // Appliquer les styles inline à la sélection avec un span
      const styleProps: React.CSSProperties = {
        fontWeight: copiedStyle.isBold ? 'bold' : 'normal',
        fontStyle: copiedStyle.isItalic ? 'italic' : 'normal',
        textDecoration: copiedStyle.isUnderline ? 'underline' : 'none',
        color: copiedStyle.textColor,
        fontFamily: copiedStyle.fontFamily ? `'${copiedStyle.fontFamily}', sans-serif` : undefined,
        fontSize: copiedStyle.fontSize ? `${copiedStyle.fontSize}px` : undefined,
      };
      
      wrapSelectionWithStyle(styleProps);
    }
    
    // Toujours appliquer les styles globaux via l'événement custom
    // Cela met à jour le state React pour la persistance
    const event = new CustomEvent('floatingToolbarStyle', {
      detail: { 
        field: fieldType, 
        updates: {
          isBold: copiedStyle.isBold,
          isItalic: copiedStyle.isItalic,
          isUnderline: copiedStyle.isUnderline,
          textColor: copiedStyle.textColor,
          fontFamily: copiedStyle.fontFamily,
          fontSize: copiedStyle.fontSize,
          textAlign: copiedStyle.textAlign,
        }
      }
    });
    document.dispatchEvent(event);

    // Mettre à jour les états de la toolbar
    if (copiedStyle.fontFamily) setSelectedFont(copiedStyle.fontFamily);
    if (copiedStyle.fontSize) setCurrentFontSize(copiedStyle.fontSize);
    if (copiedStyle.textAlign) setCurrentAlign(copiedStyle.textAlign);

    // Désactiver le mode coller après utilisation
    setIsPasteMode(false);
  }, [copiedStyle, restoreSelection]);

  // Gérer le clic sur le bouton pinceau
  const handlePaintbrushClick = useCallback(() => {
    if (isPasteMode && copiedStyle) {
      // Si on est en mode coller, coller le style
      pasteStyle();
    } else {
      // Sinon, copier le style
      copyStyle();
    }
  }, [isPasteMode, copiedStyle, copyStyle, pasteStyle]);

  useEffect(() => {
    const showToolbarForElement = (editableElement: HTMLElement) => {
      const editableRect = editableElement.getBoundingClientRect();
      const toolbarHeight = 44;
      
      setPosition({
        top: editableRect.top + window.scrollY - toolbarHeight - 8,
        left: editableRect.left + window.scrollX,
      });
      
      // Lire les styles actuels de l'élément pour les afficher dans la toolbar
      const computedStyle = window.getComputedStyle(editableElement);
      
      // Extraire la police
      let fontFamily = computedStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      if (fontFamily === '-apple-system' || fontFamily === 'BlinkMacSystemFont' || fontFamily === 'system-ui' || fontFamily === 'inherit') {
        fontFamily = 'Inter';
      }
      setSelectedFont(fontFamily);
      
      // Extraire la taille de police
      const fontSize = Math.round(parseFloat(computedStyle.fontSize));
      setCurrentFontSize(fontSize);
      
      // Extraire l'alignement
      const textAlign = computedStyle.textAlign;
      if (textAlign === 'left' || textAlign === 'start') {
        setCurrentAlign('left');
      } else if (textAlign === 'center') {
        setCurrentAlign('center');
      } else if (textAlign === 'right' || textAlign === 'end') {
        setCurrentAlign('right');
      }
      
      setIsVisible(true);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicking on toolbar - save selection before toolbar interaction
      if (target.closest('.floating-toolbar') || target.closest('.text-toolbar')) {
        saveSelection();
        return;
      }
      
      // Check if clicking on editable element
      let editableParent: HTMLElement | null = null;
      let current: HTMLElement | null = target;
      
      while (current && !editableParent) {
        if (current.getAttribute('contenteditable') === 'true' || 
            current.hasAttribute('data-text-editable')) {
          editableParent = current;
        }
        current = current.parentElement;
      }
      
      if (editableParent) {
        if (containerRef?.current && !containerRef.current.contains(editableParent)) {
          return;
        }
        activeEditableRef.current = editableParent;
        showToolbarForElement(editableParent);
      } else {
        activeEditableRef.current = null;
        savedSelectionRef.current = null;
        setIsVisible(false);
        setShowColorPicker(false);
        setShowMoreOptions(false);
        setShowFontMenu(false);
        setShowSizeMenu(false);
      }
    };

    // Track selection changes
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const editableParent = (container.nodeType === Node.TEXT_NODE ? container.parentElement : container as HTMLElement)?.closest('[contenteditable="true"]');
        
        if (editableParent && editableParent === activeEditableRef.current) {
          savedSelectionRef.current = range.cloneRange();
        }
      }
    };

    // Escape key to cancel paste mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPasteMode) {
        setIsPasteMode(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, saveSelection, isPasteMode]);

  const applyStyle = useCallback((command: string, value?: string) => {
    const editableElement = activeEditableRef.current;
    if (!editableElement) return;

    // Get the field type from data attribute
    const fieldType = editableElement.getAttribute('data-text-editable');
    if (!fieldType) return;

    // Check if we have a selection
    const selection = window.getSelection();
    let hasSelection = savedSelectionRef.current && !savedSelectionRef.current.collapsed;
    
    if (hasSelection && savedSelectionRef.current) {
      editableElement.focus();
      selection?.removeAllRanges();
      selection?.addRange(savedSelectionRef.current);
    }

    hasSelection = selection && !selection.isCollapsed && selection.toString().trim() !== '';

    if (hasSelection) {
      // Apply to selection using execCommand
      document.execCommand(command, false, value);
      if (selection && selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
      }
    } else {
      // No selection - dispatch custom event to update React state
      // Use 'toggle' for boolean styles, the listener will handle the toggle logic
      const styleUpdate: Record<string, any> = {};
      
      switch (command) {
        case 'bold':
          styleUpdate.isBold = 'toggle';
          break;
        case 'italic':
          styleUpdate.isItalic = 'toggle';
          break;
        case 'underline':
          styleUpdate.isUnderline = 'toggle';
          break;
        case 'foreColor':
          if (value) styleUpdate.textColor = value;
          break;
        case 'fontName':
          if (value) styleUpdate.fontFamily = value;
          break;
        case 'justifyLeft':
          styleUpdate.textAlign = 'left';
          break;
        case 'justifyCenter':
          styleUpdate.textAlign = 'center';
          break;
        case 'justifyRight':
          styleUpdate.textAlign = 'right';
          break;
      }

      // Dispatch custom event
      const event = new CustomEvent('floatingToolbarStyle', {
        detail: { field: fieldType, updates: styleUpdate }
      });
      document.dispatchEvent(event);
    }
    
    setIsVisible(true);
  }, []);

  const applyColor = (color: string) => {
    // Applique simplement la couleur sur le texte, sans fermer le popover
    applyStyle('foreColor', color);
  };

  if (!isVisible) return null;

  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Toujours sauvegarder la sélection AVANT toute interaction avec la toolbar
    // (même si on clique dans un input) pour pouvoir réappliquer les styles
    saveSelection();

    // Ne pas bloquer le focus sur les champs de saisie (hex, etc.)
    if (target.closest('input, textarea')) {
      return;
    }

    // Pour le reste de la toolbar, empêcher la perte de focus sur le contenu éditable
    e.preventDefault();
  };

  return (
    <div
      ref={toolbarRef}
      className="floating-toolbar fixed z-[9999] animate-fade-in"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseDown={handleToolbarMouseDown}
    >
      <div 
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg shadow-xl"
        style={{ 
          backgroundColor: '#3D3731',
          border: '1px solid rgba(245, 184, 0, 0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}
      >
        {/* Bold */}
        <button
          type="button"
          onMouseUp={() => applyStyle('bold')}
          className="p-1.5 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          title="Gras"
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseUp={() => applyStyle('italic')}
          className="p-1.5 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          title="Italique"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onMouseUp={() => applyStyle('underline')}
          className="p-1.5 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          title="Souligné"
        >
          <Underline className="w-4 h-4" />
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-white/20 mx-0.5" />

        {/* Color Picker */}
        <div className="relative">
          <button
            type="button"
            onMouseUp={() => setShowColorPicker(!showColorPicker)}
            className="p-1.5 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            title="Couleur"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showColorPicker && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 p-3 rounded-lg shadow-xl"
              style={{ 
                backgroundColor: '#3D3731',
                border: '1px solid rgba(245, 184, 0, 0.3)',
                bottom: '100%',
                marginBottom: '8px',
                minWidth: '180px',
              }}
            >
              {/* Tabs Palette / Picker */}
              <div className="flex items-center gap-1 mb-2 text-[10px] font-medium">
                <button
                  type="button"
                  onMouseUp={() => setColorTab('palette')}
                  className={`px-2 py-1 rounded-full transition-colors ${
                    colorTab === 'palette'
                      ? 'bg-[#F5B800] text-[#3D3731]'
                      : 'bg-black/20 text-white/70 hover:bg-black/30'
                  }`}
                >
                  Palette
                </button>
                <button
                  type="button"
                  onMouseUp={() => setColorTab('custom')}
                  className={`px-2 py-1 rounded-full transition-colors ${
                    colorTab === 'custom'
                      ? 'bg-[#F5B800] text-[#3D3731]'
                      : 'bg-black/20 text-white/70 hover:bg-black/30'
                  }`}
                >
                  Color picker
                </button>
              </div>

              {colorTab === 'palette' && (
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onMouseUp={() => applyColor(color)}
                      className="w-5 h-5 rounded border border-white/20 hover:scale-110 transition-transform flex-shrink-0"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}

              {colorTab === 'custom' && (
                <div
                  className="rounded-lg p-2 mt-1 flex flex-col gap-2"
                  style={{
                    backgroundColor: '#2E2823',
                    border: '1px solid rgba(245,184,0,0.25)',
                    maxWidth: '210px',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-white/60">Custom</span>
                    <input
                      type="text"
                      value={customColorInput.toUpperCase()}
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        // Autoriser avec ou sans # au début
                        const withHash = raw.startsWith('#') ? raw : `#${raw}`;
                        // Garder seulement les caractères valides (# + hex)
                        const sanitized = withHash.toUpperCase().replace(/[^#0-9A-F]/g, '');
                        // Limiter à # + 6 chars
                        const limited = sanitized.slice(0, 7);
                        setCustomColorInput(limited);
                      }}
                      onBlur={() => {
                        // Validation simple sur blur
                        const hex = customColorInput.toUpperCase();
                        const isValid = /^#[0-9A-F]{6}$/.test(hex);
                        if (isValid) {
                          setCustomColor(hex);
                          applyColor(hex);
                        } else {
                          // Revenir à la dernière couleur valide
                          setCustomColorInput(customColor.toUpperCase());
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const hex = customColorInput.toUpperCase();
                          const isValid = /^#[0-9A-F]{6}$/.test(hex);
                          if (isValid) {
                            setCustomColor(hex);
                            applyColor(hex);
                          } else {
                            setCustomColorInput(customColor.toUpperCase());
                          }
                        }
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono text-white/80 bg-black/30 border border-white/10 w-[72px] focus:outline-none focus:ring-1 focus:ring-[#F5B800] focus:border-[#F5B800] bg-transparent"
                    />
                  </div>
                  <div
                    className="mx-auto"
                    style={{ width: '180px', height: '140px' }}
                  >
                    <HexColorPicker
                      color={customColor}
                      onChange={(value) => {
                        setCustomColor(value);
                        setCustomColorInput(value.toUpperCase());
                        applyColor(value);
                      }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Copy/Paste Style Button */}
        <div className="relative">
          <button
            type="button"
            onMouseUp={handlePaintbrushClick}
            className={`p-1.5 rounded-md transition-all relative ${
              isPasteMode 
                ? 'bg-[#F5B800] text-[#3D3731] ring-2 ring-[#F5B800]/50' 
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            title={isPasteMode 
              ? `Coller: ${copiedStyle?.fontFamily || 'Inter'} ${copiedStyle?.fontSize || 16}px${copiedStyle?.isBold ? ' Gras' : ''}${copiedStyle?.isItalic ? ' Italique' : ''}` 
              : "Copier le style"
            }
          >
            <Paintbrush className="w-4 h-4" />
            {isPasteMode && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse border border-white/50" />
            )}
          </button>
          
          {/* Tooltip showing copied style preview */}
          {isPasteMode && copiedStyle && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none"
              style={{ 
                backgroundColor: '#3D3731',
                border: '1px solid rgba(245, 184, 0, 0.5)',
                bottom: '100%',
                marginBottom: '4px',
                color: copiedStyle.textColor || '#fff',
                fontFamily: copiedStyle.fontFamily ? `'${copiedStyle.fontFamily}', sans-serif` : 'inherit',
                fontWeight: copiedStyle.isBold ? 'bold' : 'normal',
                fontStyle: copiedStyle.isItalic ? 'italic' : 'normal',
                textDecoration: copiedStyle.isUnderline ? 'underline' : 'none',
              }}
            >
              Aa {copiedStyle.fontSize}px
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-white/20 mx-0.5" />

        {/* More Options Toggle */}
        <button
          type="button"
          onMouseUp={() => {
            setShowMoreOptions(!showMoreOptions);
            setShowColorPicker(false);
          }}
          className={`p-1.5 rounded-md transition-colors ${
            showMoreOptions ? 'bg-[#F5B800]/20 text-[#F5B800]' : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
          title="Plus d'options"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showMoreOptions ? 'rotate-90' : '-rotate-90'}`} />
        </button>

        {/* Extended Options (inline) */}
        {showMoreOptions && (
          <>
            {/* Separator */}
            <div className="w-px h-5 bg-white/20 mx-0.5" />

            {/* Font Family Dropdown */}
            <div className="relative">
              <button
                type="button"
                onMouseUp={() => setShowFontMenu(!showFontMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span className="text-xs max-w-[70px] truncate">{selectedFont}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showFontMenu && (
                <div 
                  className="absolute left-0 p-1.5 rounded-lg shadow-xl overflow-y-auto scrollbar-thin scrollbar-thumb-white/20"
                  style={{ 
                    backgroundColor: '#3D3731',
                    border: '1px solid rgba(245, 184, 0, 0.3)',
                    bottom: '100%',
                    marginBottom: '8px',
                    minWidth: '160px',
                    maxHeight: '200px',
                  }}
                >
                  {FONT_FAMILIES.map((font) => (
                    <button
                      key={font}
                      type="button"
                      onMouseUp={() => {
                        applyStyle('fontName', font);
                        setSelectedFont(font);
                        setShowFontMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10 rounded transition-colors"
                      style={{ fontFamily: `'${font}', sans-serif` }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="w-px h-5 bg-white/20 mx-0.5" />

            {/* Font Size Dropdown */}
            <div className="relative">
              <button
                type="button"
                onMouseUp={() => {
                  setShowSizeMenu(!showSizeMenu);
                  setShowFontMenu(false);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span className="text-xs">{currentFontSize}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showSizeMenu && (
                <div 
                  className="absolute left-0 p-1 rounded-lg shadow-xl max-h-40 overflow-y-auto scrollbar-hide"
                  style={{ 
                    backgroundColor: '#3D3731',
                    border: '1px solid rgba(245, 184, 0, 0.3)',
                    bottom: '100%',
                    marginBottom: '8px',
                    minWidth: '60px',
                  }}
                >
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onMouseUp={() => {
                        setCurrentFontSize(size);
                        // Dispatch event to update React state
                        const editableElement = activeEditableRef.current;
                        const fieldType = editableElement?.getAttribute('data-text-editable');
                        if (fieldType) {
                          const event = new CustomEvent('floatingToolbarStyle', {
                            detail: { field: fieldType, updates: { fontSize: size } }
                          });
                          document.dispatchEvent(event);
                        }
                        setShowSizeMenu(false);
                      }}
                      className={`w-full text-center px-2 py-1.5 text-xs rounded transition-colors ${
                        currentFontSize === size ? 'bg-[#F5B800]/20 text-[#F5B800]' : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="w-px h-5 bg-white/20 mx-0.5" />

            {/* Alignment (single button, cycles on click) */}
            <button
              type="button"
              onMouseUp={cycleAlignment}
              className="p-1.5 rounded text-white/80 hover:bg-white/10"
              title="Alignement (cliquer pour changer)"
            >
              <AlignIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FloatingToolbar;
