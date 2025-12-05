import { useState, useEffect, useRef, useCallback } from "react";
import { Bold, Italic, Underline, Palette, ChevronDown, AlignLeft, AlignCenter, AlignRight, Paintbrush, Sparkles, Check } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { TEXT_EFFECTS, TextEffect, TextEffectOptions } from "@/data/textEffects";

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
  const [showEffectsMenu, setShowEffectsMenu] = useState(false);
  const [activeEffectTab, setActiveEffectTab] = useState<'effects' | 'animations'>('effects');
  const [selectedEffect, setSelectedEffect] = useState<TextEffect | null>(null);
  const [effectTextColor, setEffectTextColor] = useState('#ffffff');
  const [effectBgColor, setEffectBgColor] = useState('#a3e635');
  const [effectBorderRadius, setEffectBorderRadius] = useState('0');
  const [effectShadowColor, setEffectShadowColor] = useState('#ff00de');
  const [effectSecondaryColor, setEffectSecondaryColor] = useState('#8b5cf6');
  const [effectGradientAngle, setEffectGradientAngle] = useState<'horizontal' | 'vertical'>('horizontal');
  const [effectShadowType, setEffectShadowType] = useState<'soft' | 'hard' | 'glow' | 'neon'>('glow');
  const [effectStrokeWidth, setEffectStrokeWidth] = useState('2');
  const [effectRotation, setEffectRotation] = useState('0');

  const AlignIcon = currentAlign === 'left' ? AlignLeft : currentAlign === 'center' ? AlignCenter : AlignRight;

  // Detect existing effect styles from selection
  const detectExistingEffect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);
    let element: HTMLElement | null = range.startContainer.nodeType === Node.TEXT_NODE 
      ? range.startContainer.parentElement 
      : range.startContainer as HTMLElement;

    // Look for styled span/div
    while (element && element !== activeEditableRef.current) {
      const style = element.style;
      const computedStyle = window.getComputedStyle(element);

      // Check for shadow/neon first
      const textShadow = style.textShadow || computedStyle.textShadow;
      if (textShadow && textShadow !== 'none') {
        const textColor = style.color || computedStyle.color;
        // Extract first color from text-shadow string
        const shadowMatch = textShadow.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/);
        const shadowColor = shadowMatch ? rgbToHex(shadowMatch[0]) : '#ff00de';
        return {
          type: 'shadow',
          textColor: rgbToHex(textColor),
          bgColor: 'transparent',
          borderRadius: 0,
          shadowColor,
        };
      }
      
      // Check for highlight/badge effect (has background)
      const bgColor = style.background || style.backgroundColor || computedStyle.backgroundColor;
      if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
        const textColor = style.color || computedStyle.color;
        const borderRadius = style.borderRadius || computedStyle.borderRadius;
        
        return {
          type: 'highlight',
          textColor: rgbToHex(textColor),
          bgColor: rgbToHex(bgColor),
          borderRadius: parseInt(borderRadius) || 0,
        };
      }
      
      // Check for outline effect (has text-stroke)
      const textStroke = style.webkitTextStroke || (element as any).style['-webkit-text-stroke'];
      if (textStroke || computedStyle.getPropertyValue('-webkit-text-stroke')) {
        const strokeValue = textStroke || computedStyle.getPropertyValue('-webkit-text-stroke');
        const strokeColor = strokeValue?.split(' ').pop() || '#ffffff';
        return {
          type: 'outline',
          textColor: rgbToHex(strokeColor),
          bgColor: 'transparent',
          borderRadius: 0,
        };
      }

      element = element.parentElement;
    }
    
    return null;
  }, []);

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
        setShowEffectsMenu(false);
        setSelectedEffect(null);
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
            onMouseUp={() => {
              setShowColorPicker(!showColorPicker);
              setShowEffectsMenu(false);
              setShowFontMenu(false);
              setShowSizeMenu(false);
              setShowMoreOptions(false);
            }}
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

        {/* Text Effects Button */}
        <div className="relative">
          <button
            type="button"
            onMouseUp={() => {
              // Save selection before opening menu
              if (!showEffectsMenu) {
                saveSelection();
                // Detect existing effect and pre-fill values
                const existingEffect = detectExistingEffect();
                if (existingEffect) {
                  setEffectTextColor(existingEffect.textColor);
                  setEffectBgColor(existingEffect.bgColor);
                  setEffectBorderRadius(String(existingEffect.borderRadius));
                  if (existingEffect.shadowColor) {
                    setEffectShadowColor(existingEffect.shadowColor);
                  }
                  // Auto-select matching effect type
                  const matchingEffect = TEXT_EFFECTS.find(e => 
                    (existingEffect.type === 'highlight' && ['highlight', 'badge'].includes(e.category)) ||
                    (existingEffect.type === 'outline' && e.category === 'outline') ||
                    (existingEffect.type === 'shadow' && e.id === 'neon') ||
                    (existingEffect.type === 'shadow' && e.category === 'shadow')
                  );
                  if (matchingEffect) {
                    setSelectedEffect(matchingEffect);
                  }
                }
              }
              setShowEffectsMenu(!showEffectsMenu);
              setShowColorPicker(false);
              setShowFontMenu(false);
              setShowSizeMenu(false);
              setShowMoreOptions(false);
            }}
            className={`p-1.5 rounded-md transition-colors ${
              showEffectsMenu ? 'bg-[#F5B800]/20 text-[#F5B800]' : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            title="Effets de texte"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {showEffectsMenu && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 rounded-lg shadow-xl overflow-hidden"
              style={{ 
                backgroundColor: '#3D3731',
                border: '1px solid rgba(245, 184, 0, 0.3)',
                bottom: '100%',
                marginBottom: '8px',
                width: selectedEffect ? '320px' : '280px',
              }}
            >
              {/* Header */}
              <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                <h4 className="text-xs font-medium text-white">
                  {selectedEffect ? selectedEffect.name : 'Effets de texte'}
                </h4>
                {selectedEffect && (
                  <button
                    type="button"
                    onMouseUp={() => setSelectedEffect(null)}
                    className="text-[10px] text-white/50 hover:text-white"
                  >
                    ← Retour
                  </button>
                )}
              </div>

              {!selectedEffect ? (
                <>
                  {/* Main tabs: Effets / Animations */}
                  <div className="flex border-b border-white/10">
                    <button
                      type="button"
                      onMouseUp={() => setActiveEffectTab('effects')}
                      className={`flex-1 px-3 py-2 text-[11px] font-medium transition-colors ${
                        activeEffectTab === 'effects' 
                          ? 'text-[#F5B800] border-b-2 border-[#F5B800]' 
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      ✨ Effets
                    </button>
                    <button
                      type="button"
                      onMouseUp={() => setActiveEffectTab('animations')}
                      className={`flex-1 px-3 py-2 text-[11px] font-medium transition-colors ${
                        activeEffectTab === 'animations' 
                          ? 'text-[#F5B800] border-b-2 border-[#F5B800]' 
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      🎬 Animations
                    </button>
                  </div>

                  {/* Effects tab content */}
                  {activeEffectTab === 'effects' && (
                    <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
                      {TEXT_EFFECTS.filter(e => !e.disabled).map(effect => (
                        <button
                          key={effect.id}
                          type="button"
                          onMouseUp={() => {
                            setSelectedEffect(effect);
                            setEffectTextColor(effect.defaultOptions.primaryColor || '#ffffff');
                            setEffectBgColor(effect.defaultOptions.backgroundColor || '#a3e635');
                            setEffectBorderRadius(effect.defaultOptions.borderRadius?.replace('px', '') || '0');
                            if (effect.defaultOptions.shadowColor) {
                              setEffectShadowColor(effect.defaultOptions.shadowColor);
                            } else if (effect.id === 'neon' || effect.category === 'shadow') {
                              setEffectShadowColor('#ff00de');
                            }
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-left group"
                        >
                          <div className="w-8 h-6 rounded bg-white flex items-center justify-center text-[8px] font-bold overflow-hidden flex-shrink-0 border border-black/10">
                            <span style={{ ...parsePreviewStyle(effect.preview), fontSize: '8px' }}>Aa</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-white font-medium truncate">{effect.name}</div>
                            <div className="text-[9px] text-white/50 truncate">{effect.description}</div>
                          </div>
                          <ChevronDown className="w-3 h-3 text-white/30 -rotate-90 group-hover:text-white/60 transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Animations tab content */}
                  {activeEffectTab === 'animations' && (
                    <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
                      {[
                        { id: 'typewriter', name: 'Machine à écrire', description: 'Lettres apparaissent une à une' },
                        { id: 'ascension', name: 'Ascension', description: 'Le texte monte' },
                        { id: 'decalage', name: 'Décalage', description: 'Lettres décalées' },
                        { id: 'fusion', name: 'Fusion', description: 'Texte se fusionne' },
                        { id: 'bloc', name: 'Bloc', description: 'Apparition en bloc' },
                        { id: 'explosion', name: 'Explosion', description: 'Lettres explosent' },
                        { id: 'rebond', name: 'Rebond', description: 'Le texte rebondit' },
                        { id: 'deroule', name: 'Déroulé', description: 'Texte se déroule' },
                        { id: 'patinage', name: 'Patinage', description: 'Effet de glisse' },
                        { id: 'ecart', name: 'Écart', description: 'Lettres s\'écartent' },
                        { id: 'clarifier', name: 'Clarifier', description: 'Flou vers net' },
                        { id: 'lever', name: 'Lever', description: 'Monte depuis le bas' },
                        { id: 'balayage', name: 'Balayage', description: 'Balaye horizontalement' },
                        { id: 'fondu', name: 'Fondu', description: 'Apparition en fondu' },
                        { id: 'pop', name: 'Pop', description: 'Effet pop' },
                        { id: 'eponge', name: 'Coup d\'éponge', description: 'Effet éponge' },
                        { id: 'flou', name: 'Flou', description: 'Effet de flou' },
                        { id: 'successions', name: 'Successions', description: 'Apparitions successives' },
                        { id: 'zoom', name: 'Zoom', description: 'Effet de zoom' },
                        { id: 'apparition', name: 'Apparition', description: 'Apparition simple' },
                        { id: 'derive', name: 'Dérive', description: 'Glisse doucement' },
                        { id: 'tectonique', name: 'Tectonique', description: 'Mouvement tectonique' },
                        { id: 'roulade', name: 'Roulade', description: 'Effet de roulade' },
                        { id: 'neon', name: 'Néon', description: 'Lueur néon pulsante' },
                        { id: 'deplacement', name: 'Déplacement', description: 'Se déplace' },
                        { id: 'chute', name: 'Chute', description: 'Tombe depuis le haut' },
                      ].map(anim => (
                        <button
                          key={anim.id}
                          type="button"
                          onMouseUp={() => {
                            restoreSelection();
                            setTimeout(() => {
                              const selection = window.getSelection();
                              const selectedText = selection?.toString() || 'Texte';
                              const html = `<span class="animate-${anim.id}" style="display: inline-block;">${selectedText}</span>`;
                              if (savedSelectionRef.current) {
                                const sel = window.getSelection();
                                sel?.removeAllRanges();
                                sel?.addRange(savedSelectionRef.current);
                                document.execCommand('insertHTML', false, html);
                              }
                              setShowEffectsMenu(false);
                            }, 10);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-left group"
                        >
                          {/* SVG Icon based on animation type */}
                          <div className="w-8 h-6 rounded bg-white text-black border border-black/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <svg width="28" height="18" viewBox="0 0 28 18" className="text-black">
                              {anim.id === 'typewriter' && <>
                                <text x="4" y="13" fontSize="10" fill="currentColor" fontWeight="bold">AB</text>
                                <line x1="18" y1="4" x2="18" y2="14" stroke="currentColor" strokeWidth="1.5"/>
                                <text x="20" y="13" fontSize="10" fill="currentColor" fontWeight="bold" opacity="0.4">C</text>
                              </>}
                              {anim.id === 'ascension' && <>
                                <text x="4" y="14" fontSize="9" fill="currentColor" fontWeight="bold">AB</text>
                                <path d="M20 14 L20 6 L17 9 M20 6 L23 9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                              </>}
                              {anim.id === 'decalage' && <>
                                <text x="3" y="10" fontSize="8" fill="currentColor" fontWeight="bold">A</text>
                                <text x="10" y="13" fontSize="8" fill="currentColor" fontWeight="bold">B</text>
                                <text x="17" y="8" fontSize="8" fill="currentColor" fontWeight="bold" opacity="0.6">C</text>
                              </>}
                              {anim.id === 'fusion' && <>
                                <text x="2" y="12" fontSize="8" fill="currentColor" fontWeight="bold">ABC</text>
                                <path d="M18 6 L22 9 M18 12 L22 9" stroke="currentColor" strokeWidth="1" fill="none"/>
                                <text x="2" y="12" fontSize="8" fill="currentColor" fontWeight="bold" opacity="0.3" transform="translate(2,1)">ABC</text>
                              </>}
                              {anim.id === 'bloc' && <>
                                <rect x="4" y="4" width="14" height="10" fill="currentColor" opacity="0.3" rx="1"/>
                                <text x="6" y="12" fontSize="8" fill="currentColor" fontWeight="bold">ABC</text>
                              </>}
                              {anim.id === 'explosion' && <>
                                <text x="8" y="12" fontSize="8" fill="currentColor" fontWeight="bold">AB</text>
                                <circle cx="22" cy="6" r="2" fill="currentColor" opacity="0.6"/>
                                <path d="M20 4 L18 2 M24 4 L26 2 M20 8 L18 10 M24 8 L26 10" stroke="currentColor" strokeWidth="0.8"/>
                              </>}
                              {anim.id === 'rebond' && <>
                                <path d="M4 14 Q10 4 16 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="2"/>
                                <text x="6" y="12" fontSize="8" fill="currentColor" fontWeight="bold">ABC</text>
                              </>}
                              {anim.id === 'deroule' && <>
                                <text x="4" y="12" fontSize="8" fill="currentColor" fontWeight="bold">A</text>
                                <text x="10" y="12" fontSize="8" fill="currentColor" fontWeight="bold">B</text>
                                <path d="M18 8 Q20 6 22 8 Q24 10 22 12" stroke="currentColor" strokeWidth="1" fill="none"/>
                              </>}
                              {anim.id === 'patinage' && <>
                                <text x="6" y="12" fontSize="8" fill="currentColor" fontWeight="bold">ABC</text>
                                <path d="M4 14 L24 14" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
                              </>}
                              {anim.id === 'ecart' && <>
                                <text x="2" y="12" fontSize="8" fill="currentColor" fontWeight="bold">A</text>
                                <text x="11" y="12" fontSize="8" fill="currentColor" fontWeight="bold">B</text>
                                <text x="20" y="12" fontSize="8" fill="currentColor" fontWeight="bold">C</text>
                              </>}
                              {anim.id === 'clarifier' && <>
                                <text x="6" y="12" fontSize="8" fill="currentColor" fontWeight="bold" opacity="0.3">ABC</text>
                                <text x="6" y="12" fontSize="8" fill="currentColor" fontWeight="bold" filter="url(#blur)">ABC</text>
                              </>}
                              {anim.id === 'lever' && <>
                                <rect x="6" y="6" width="10" height="8" fill="currentColor" rx="1"/>
                                <path d="M20 12 L20 4 L17 7 M20 4 L23 7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                              </>}
                              {anim.id === 'balayage' && <>
                                <rect x="4" y="5" width="8" height="8" fill="currentColor" rx="1"/>
                                <rect x="14" y="5" width="8" height="8" fill="currentColor" rx="1" opacity="0.4"/>
                                <path d="M16 14 L22 14 L20 12 M22 14 L20 16" stroke="currentColor" strokeWidth="1" fill="none"/>
                              </>}
                              {anim.id === 'fondu' && <>
                                <rect x="4" y="4" width="6" height="10" fill="currentColor" rx="1"/>
                                <rect x="11" y="4" width="6" height="10" fill="currentColor" rx="1" opacity="0.6"/>
                                <rect x="18" y="4" width="6" height="10" fill="currentColor" rx="1" opacity="0.3"/>
                              </>}
                              {anim.id === 'pop' && <>
                                <circle cx="10" cy="9" r="5" fill="currentColor" opacity="0.3"/>
                                <rect x="7" y="6" width="6" height="6" fill="currentColor" rx="1"/>
                                <path d="M18 5 L20 3 M22 5 L24 3 M18 13 L20 15 M22 13 L24 15" stroke="currentColor" strokeWidth="0.8"/>
                              </>}
                              {anim.id === 'eponge' && <>
                                <rect x="8" y="6" width="8" height="8" fill="currentColor" rx="1"/>
                                <rect x="6" y="4" width="12" height="12" stroke="currentColor" strokeWidth="1" fill="none" rx="2" opacity="0.3"/>
                              </>}
                              {anim.id === 'flou' && <>
                                <rect x="6" y="4" width="10" height="10" fill="currentColor" rx="1" opacity="0.5"/>
                                <rect x="8" y="6" width="10" height="10" fill="currentColor" rx="1" opacity="0.3"/>
                              </>}
                              {anim.id === 'successions' && <>
                                <rect x="6" y="6" width="8" height="8" fill="currentColor" rx="1" opacity="0.8"/>
                                <path d="M4 4 L2 2 M16 4 L18 2 M4 16 L2 18 M16 16 L18 18" stroke="currentColor" strokeWidth="1"/>
                              </>}
                              {anim.id === 'zoom' && <>
                                <rect x="10" y="7" width="4" height="4" fill="currentColor" rx="0.5" opacity="0.4"/>
                                <rect x="8" y="5" width="8" height="8" stroke="currentColor" strokeWidth="1" fill="none" rx="1"/>
                                <path d="M4 4 L6 6 M20 4 L18 6 M4 14 L6 12 M20 14 L18 12" stroke="currentColor" strokeWidth="1"/>
                              </>}
                              {anim.id === 'apparition' && <>
                                <rect x="8" y="4" width="8" height="6" fill="currentColor" rx="1" opacity="0.4"/>
                                <rect x="8" y="10" width="8" height="6" fill="currentColor" rx="1"/>
                              </>}
                              {anim.id === 'derive' && <>
                                <rect x="6" y="6" width="8" height="6" fill="currentColor" rx="1"/>
                                <path d="M16 12 L22 12 L20 10 M22 12 L20 14" stroke="currentColor" strokeWidth="1" fill="none"/>
                              </>}
                              {anim.id === 'tectonique' && <>
                                <rect x="4" y="6" width="8" height="6" fill="currentColor" rx="1"/>
                                <path d="M14 12 L22 12 L20 10 M22 12 L20 14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                              </>}
                              {anim.id === 'roulade' && <>
                                <rect x="8" y="6" width="8" height="6" fill="currentColor" rx="1"/>
                                <path d="M20 6 Q24 9 20 12 Q16 15 20 6" stroke="currentColor" strokeWidth="1" fill="none"/>
                              </>}
                              {anim.id === 'neon' && <>
                                <rect x="8" y="6" width="8" height="6" fill="currentColor" rx="1"/>
                                <line x1="4" y1="6" x2="4" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2"/>
                                <line x1="20" y1="6" x2="20" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2"/>
                              </>}
                              {anim.id === 'deplacement' && <>
                                <rect x="6" y="6" width="8" height="6" fill="currentColor" rx="1" opacity="0.4"/>
                                <rect x="10" y="8" width="8" height="6" fill="currentColor" rx="1"/>
                              </>}
                              {anim.id === 'chute' && <>
                                <rect x="8" y="8" width="8" height="6" fill="currentColor" rx="1"/>
                                <path d="M4 4 L6 6 M20 4 L18 6 M4 16 L6 14 M20 16 L18 14" stroke="currentColor" strokeWidth="1"/>
                              </>}
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-white font-medium truncate">{anim.name}</div>
                            <div className="text-[9px] text-white/50 truncate">{anim.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Effect customization panel */
                <div className="p-3 space-y-3">
                  {/* Live Preview */}
                  <div className="p-3 rounded-lg bg-black/20 flex items-center justify-center min-h-[50px]">
                    <div
                      className="text-center"
                      dangerouslySetInnerHTML={{
                        __html: (() => {
                          const opts: Record<string, any> = { ...selectedEffect.defaultOptions };
                          if (selectedEffect.id === 'outline') {
                            opts.strokeColor = effectTextColor;
                            opts.strokeWidth = `${effectStrokeWidth}px`;
                          } else if (selectedEffect.id === 'highlight') {
                            opts.primaryColor = effectTextColor;
                            opts.backgroundColor = effectBgColor;
                            opts.borderRadius = `${effectBorderRadius}px`;
                            opts.rotation = parseInt(effectRotation);
                          } else if (selectedEffect.id === 'shadow') {
                            opts.primaryColor = effectTextColor;
                            opts.shadowColor = effectShadowColor;
                            opts.shadowType = effectShadowType;
                          } else if (selectedEffect.id === 'gradient') {
                            opts.primaryColor = effectTextColor;
                            opts.secondaryColor = effectSecondaryColor;
                            opts.gradientAngle = effectGradientAngle === 'horizontal' ? 90 : 180;
                          } else if (selectedEffect.id === '3d-extrude') {
                            opts.primaryColor = effectTextColor;
                            opts.shadowColor = effectShadowColor;
                          }
                          return selectedEffect.generateHtml('Aperçu', opts);
                        })(),
                      }}
                    />
                  </div>

                  {/* Dynamic controls based on effect type */}
                  <div className="space-y-3">
                    
                    {/* === CONTOUR === */}
                    {selectedEffect.id === 'outline' && (
                      <>
                        <div>
                          <label className="text-[10px] text-white/60 mb-1 block">Couleur contour</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={effectTextColor} onChange={(e) => setEffectTextColor(e.target.value)} className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent" />
                            <input type="text" value={effectTextColor.toUpperCase()} onChange={(e) => setEffectTextColor(e.target.value)} className="w-16 px-1.5 py-1 text-[9px] font-mono bg-black/20 border border-white/10 rounded text-white" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-white/60 mb-1 block">Épaisseur: {effectStrokeWidth}px</label>
                          <input type="range" min="1" max="6" value={effectStrokeWidth} onChange={(e) => setEffectStrokeWidth(e.target.value)} className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F5B800]" />
                        </div>
                      </>
                    )}

                    {/* === SURLIGNÉ === */}
                    {selectedEffect.id === 'highlight' && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-white/60 mb-1 block">Couleur texte</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={effectTextColor} onChange={(e) => setEffectTextColor(e.target.value)} className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent" />
                              <input type="text" value={effectTextColor.toUpperCase()} onChange={(e) => setEffectTextColor(e.target.value)} className="w-16 px-1.5 py-1 text-[9px] font-mono bg-black/20 border border-white/10 rounded text-white" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-white/60 mb-1 block">Couleur fond</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={effectBgColor} onChange={(e) => setEffectBgColor(e.target.value)} className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent" />
                              <input type="text" value={effectBgColor.toUpperCase()} onChange={(e) => setEffectBgColor(e.target.value)} className="w-16 px-1.5 py-1 text-[9px] font-mono bg-black/20 border border-white/10 rounded text-white" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-white/60 mb-1 block">Arrondi: {effectBorderRadius}px</label>
                          <input type="range" min="0" max="24" value={effectBorderRadius} onChange={(e) => setEffectBorderRadius(e.target.value)} className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F5B800]" />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/60 mb-1 block">Rotation: {effectRotation}°</label>
                          <input type="range" min="-15" max="15" value={effectRotation} onChange={(e) => setEffectRotation(e.target.value)} className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F5B800]" />
                        </div>
                      </>
                    )}

                    {/* === OMBRE / NÉON === */}
                    {selectedEffect.id === 'shadow' && (
                      <>
                        <div>
                          <label className="text-[10px] text-white/60 mb-1 block">Type d'ombre</label>
                          <div className="grid grid-cols-4 gap-1">
                            {(['soft', 'hard', 'glow', 'neon'] as const).map(type => (
                              <button
                                key={type}
                                type="button"
                                onMouseUp={() => setEffectShadowType(type)}
                                className={`px-2 py-1 text-[9px] rounded transition-colors ${effectShadowType === type ? 'bg-[#F5B800] text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                              >
                                {type === 'soft' ? 'Douce' : type === 'hard' ? 'Dure' : type === 'glow' ? 'Glow' : 'Néon'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-white/60 mb-1 block">Couleur texte</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={effectTextColor} onChange={(e) => setEffectTextColor(e.target.value)} className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent" />
                              <input type="text" value={effectTextColor.toUpperCase()} onChange={(e) => setEffectTextColor(e.target.value)} className="w-16 px-1.5 py-1 text-[9px] font-mono bg-black/20 border border-white/10 rounded text-white" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-white/60 mb-1 block">Couleur ombre</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={effectShadowColor} onChange={(e) => setEffectShadowColor(e.target.value)} className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent" />
                              <input type="text" value={effectShadowColor.toUpperCase()} onChange={(e) => setEffectShadowColor(e.target.value)} className="w-16 px-1.5 py-1 text-[9px] font-mono bg-black/20 border border-white/10 rounded text-white" />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* === DÉGRADÉ === */}
                    {selectedEffect.id === 'gradient' && (
                      <>
                        <div>
                          <label className="text-[10px] text-white/60 mb-1 block">Direction</label>
                          <div className="grid grid-cols-2 gap-1">
                            <button type="button" onMouseUp={() => setEffectGradientAngle('horizontal')} className={`px-2 py-1.5 text-[10px] rounded transition-colors ${effectGradientAngle === 'horizontal' ? 'bg-[#F5B800] text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                              ↔ Horizontal
                            </button>
                            <button type="button" onMouseUp={() => setEffectGradientAngle('vertical')} className={`px-2 py-1.5 text-[10px] rounded transition-colors ${effectGradientAngle === 'vertical' ? 'bg-[#F5B800] text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                              ↕ Vertical
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-white/60 mb-1 block">Couleur 1</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={effectTextColor} onChange={(e) => setEffectTextColor(e.target.value)} className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent" />
                              <input type="text" value={effectTextColor.toUpperCase()} onChange={(e) => setEffectTextColor(e.target.value)} className="w-16 px-1.5 py-1 text-[9px] font-mono bg-black/20 border border-white/10 rounded text-white" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-white/60 mb-1 block">Couleur 2</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={effectSecondaryColor} onChange={(e) => setEffectSecondaryColor(e.target.value)} className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent" />
                              <input type="text" value={effectSecondaryColor.toUpperCase()} onChange={(e) => setEffectSecondaryColor(e.target.value)} className="w-16 px-1.5 py-1 text-[9px] font-mono bg-black/20 border border-white/10 rounded text-white" />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* === 3D EXTRUSION === */}
                    {selectedEffect.id === '3d-extrude' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-white/60 mb-1 block">Couleur texte</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={effectTextColor} onChange={(e) => setEffectTextColor(e.target.value)} className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent" />
                            <input type="text" value={effectTextColor.toUpperCase()} onChange={(e) => setEffectTextColor(e.target.value)} className="w-16 px-1.5 py-1 text-[9px] font-mono bg-black/20 border border-white/10 rounded text-white" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-white/60 mb-1 block">Couleur ombre</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={effectShadowColor} onChange={(e) => setEffectShadowColor(e.target.value)} className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent" />
                            <input type="text" value={effectShadowColor.toUpperCase()} onChange={(e) => setEffectShadowColor(e.target.value)} className="w-16 px-1.5 py-1 text-[9px] font-mono bg-black/20 border border-white/10 rounded text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Apply button */}
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Restore selection first
                      restoreSelection();
                      
                      // Small delay to ensure selection is restored
                      setTimeout(() => {
                        const selection = window.getSelection();
                        const selectedText = selection?.toString() || 'Texte';
                        
                        // Build options based on effect type
                        const options: Record<string, any> = {
                          ...selectedEffect.defaultOptions,
                        };
                        
                        if (selectedEffect.id === 'outline') {
                          options.strokeColor = effectTextColor;
                          options.strokeWidth = `${effectStrokeWidth}px`;
                        } else if (selectedEffect.id === 'highlight') {
                          options.primaryColor = effectTextColor;
                          options.backgroundColor = effectBgColor;
                          options.borderRadius = `${effectBorderRadius}px`;
                          options.rotation = parseInt(effectRotation);
                        } else if (selectedEffect.id === 'shadow') {
                          options.primaryColor = effectTextColor;
                          options.shadowColor = effectShadowColor;
                          options.shadowType = effectShadowType;
                        } else if (selectedEffect.id === 'gradient') {
                          options.primaryColor = effectTextColor;
                          options.secondaryColor = effectSecondaryColor;
                          options.gradientAngle = effectGradientAngle === 'horizontal' ? 90 : 180;
                        } else if (selectedEffect.id === '3d-extrude') {
                          options.primaryColor = effectTextColor;
                          options.shadowColor = effectShadowColor;
                        }
                        
                        // Apply effect with custom options
                        const html = selectedEffect.generateHtml(selectedText, options);
                        
                        // Insert HTML using insertHTML command
                        if (savedSelectionRef.current) {
                          const sel = window.getSelection();
                          sel?.removeAllRanges();
                          sel?.addRange(savedSelectionRef.current);
                          document.execCommand('insertHTML', false, html);
                        }
                        
                        setShowEffectsMenu(false);
                        setSelectedEffect(null);
                      }, 10);
                    }}
                    className="w-full py-2 rounded-lg bg-[#F5B800] text-black text-xs font-medium hover:bg-[#F5B800]/90 transition-colors"
                  >
                    Appliquer l'effet
                  </button>
                </div>
              )}
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
            setShowEffectsMenu(false);
            setShowFontMenu(false);
            setShowSizeMenu(false);
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
            onMouseDown={() => {
              setShowEffectsMenu(false);
              setShowColorPicker(false);
              setShowSizeMenu(false);
            }}
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
                  setShowEffectsMenu(false);
                  setShowColorPicker(false);
                  setShowMoreOptions(true);
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

export default FloatingToolbar;
