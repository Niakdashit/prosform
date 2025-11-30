import { AIAction } from "@/services/AIService";
import { BRAND_STYLES, BrandStyle } from "@/utils/brandStyles";

interface ScreenMapping {
  welcome?: string;
  contact?: string;
  wheel?: string;
  scratch?: string;
  jackpot?: string;
  question?: string;
  result?: string;
  'ending-win'?: string;
  'ending-lose'?: string;
}

// Palettes de couleurs par template
const TEMPLATE_COLORS: Record<string, any> = {
  modern: { primary: "#6366f1", secondary: "#8b5cf6", accent: "#f59e0b", background: "#ffffff", text: "#1f2937" },
  elegant: { primary: "#d4af37", secondary: "#1a1a1a", accent: "#ffffff", background: "#0a0a0a", text: "#ffffff" },
  playful: { primary: "#f472b6", secondary: "#a78bfa", accent: "#34d399", background: "#fef3c7", text: "#1f2937" },
  christmas: { primary: "#dc2626", secondary: "#15803d", accent: "#fbbf24", background: "#fef2f2", text: "#1f2937" },
  blackfriday: { primary: "#000000", secondary: "#fbbf24", accent: "#ef4444", background: "#18181b", text: "#ffffff" },
  halloween: { primary: "#f97316", secondary: "#7c3aed", accent: "#000000", background: "#1c1917", text: "#ffffff" },
  summer: { primary: "#f59e0b", secondary: "#3b82f6", accent: "#f97316", background: "#fef3c7", text: "#1f2937" },
  spring: { primary: "#ec4899", secondary: "#22c55e", accent: "#fbbf24", background: "#fdf2f8", text: "#1f2937" },
  valentine: { primary: "#ec4899", secondary: "#f43f5e", accent: "#ffffff", background: "#fdf2f8", text: "#1f2937" },
  newyear: { primary: "#fbbf24", secondary: "#000000", accent: "#c0c0c0", background: "#0a0a0a", text: "#ffffff" },
  corporate: { primary: "#3b82f6", secondary: "#6b7280", accent: "#1f2937", background: "#f9fafb", text: "#1f2937" },
  minimal: { primary: "#000000", secondary: "#6b7280", accent: "#000000", background: "#ffffff", text: "#000000" },
  bold: { primary: "#ef4444", secondary: "#f59e0b", accent: "#22c55e", background: "#1f2937", text: "#ffffff" },
  festive: { primary: "#ec4899", secondary: "#8b5cf6", accent: "#fbbf24", background: "#fef3c7", text: "#1f2937" },
};

/**
 * Crée un handler pour appliquer les actions de l'IA sur une config de campagne
 */
export function createAIActionHandler<T extends Record<string, any>>(
  config: T,
  updateConfig: (updates: Partial<T>) => void,
  screenMapping: ScreenMapping,
  extraHandlers?: {
    onUpdateSegments?: (segments: any[]) => void;
    onUpdatePrizes?: (prizes: any[]) => void;
    onUpdateQuestions?: (questions: any[]) => void;
    onUpdateCards?: (cards: any[]) => void;
    onUpdateSymbols?: (symbols: any[]) => void;
    onApplyTemplate?: (template: string, colors: any) => void;
  }
) {
  return (actions: AIAction[]) => {
    actions.forEach(action => {
      const view = action.view || 'welcome';
      const value = action.value;
      
      // Configuration complète de campagne
      if (action.type === 'full_config' && typeof value === 'object') {
        const fullConfig = value as any;
        const updates: any = {};
        
        const welcomeKey = screenMapping.welcome;
        const contactKey = screenMapping.contact;
        const endingWinKey = screenMapping['ending-win'];
        const endingLoseKey = screenMapping['ending-lose'];
        const wheelKey = screenMapping.wheel;
        const scratchKey = screenMapping.scratch;
        const jackpotKey = screenMapping.jackpot;
        
        // Appliquer le template si spécifié
        if (fullConfig.template && extraHandlers?.onApplyTemplate) {
          const templateColors = TEMPLATE_COLORS[fullConfig.template] || fullConfig.themeColors;
          extraHandlers.onApplyTemplate(fullConfig.template, templateColors);
        }
        
        // Écrans de texte
        if (fullConfig.welcomeScreen && welcomeKey && config[welcomeKey]) {
          updates[welcomeKey] = { ...config[welcomeKey], ...fullConfig.welcomeScreen };
        }
        if (fullConfig.contactForm && contactKey && config[contactKey]) {
          const currentContact = config[contactKey] as any;
          const fields = fullConfig.contactForm.fields?.map((f: any, i: number) => ({
            id: f.id || `field_${i}`,
            type: f.type || 'text',
            label: f.label,
            placeholder: f.placeholder || '',
            required: f.required ?? false,
            options: f.options || []
          })) || currentContact.fields;
          updates[contactKey] = { ...currentContact, ...fullConfig.contactForm, fields };
        }
        if (fullConfig.endingWin && endingWinKey && config[endingWinKey]) {
          updates[endingWinKey] = { ...config[endingWinKey], ...fullConfig.endingWin };
        }
        if (fullConfig.endingLose && endingLoseKey && config[endingLoseKey]) {
          updates[endingLoseKey] = { ...config[endingLoseKey], ...fullConfig.endingLose };
        }
        
        // Écrans de jeu
        if (fullConfig.wheelScreen && wheelKey && config[wheelKey]) {
          updates[wheelKey] = { ...config[wheelKey], ...fullConfig.wheelScreen };
        }
        if (fullConfig.scratchScreen && scratchKey && config[scratchKey]) {
          updates[scratchKey] = { ...config[scratchKey], ...fullConfig.scratchScreen };
        }
        if (fullConfig.jackpotScreen && jackpotKey && config[jackpotKey]) {
          updates[jackpotKey] = { ...config[jackpotKey], ...fullConfig.jackpotScreen };
        }
        
        // Logo et background
        if (fullConfig.logo && welcomeKey && config[welcomeKey]) {
          updates[welcomeKey] = { ...(updates[welcomeKey] || config[welcomeKey]), image: fullConfig.logo, showImage: true };
        }
        if (fullConfig.backgroundImage && welcomeKey && config[welcomeKey]) {
          updates[welcomeKey] = { ...(updates[welcomeKey] || config[welcomeKey]), backgroundImage: fullConfig.backgroundImage };
        }
        
        // Appliquer le background à tous les écrans si demandé
        const applyToAll = fullConfig.welcomeScreen?.applyBackgroundToAll || fullConfig.applyBackgroundToAll;
        const bgImage = fullConfig.backgroundImage || fullConfig.welcomeScreen?.backgroundImage || (updates[welcomeKey] as any)?.backgroundImage;
        
        if (applyToAll && bgImage) {
          if (contactKey && config[contactKey]) {
            updates[contactKey] = { ...(updates[contactKey] || config[contactKey]), backgroundImage: bgImage };
          }
          if (wheelKey && config[wheelKey]) {
            updates[wheelKey] = { ...(updates[wheelKey] || config[wheelKey]), backgroundImage: bgImage };
          }
          if (scratchKey && config[scratchKey]) {
            updates[scratchKey] = { ...(updates[scratchKey] || config[scratchKey]), backgroundImage: bgImage };
          }
          if (jackpotKey && config[jackpotKey]) {
            updates[jackpotKey] = { ...(updates[jackpotKey] || config[jackpotKey]), backgroundImage: bgImage };
          }
          if (endingWinKey && config[endingWinKey]) {
            updates[endingWinKey] = { ...(updates[endingWinKey] || config[endingWinKey]), backgroundImage: bgImage };
          }
          if (endingLoseKey && config[endingLoseKey]) {
            updates[endingLoseKey] = { ...(updates[endingLoseKey] || config[endingLoseKey]), backgroundImage: bgImage };
          }
        }
        
        updateConfig(updates);
        
        // Segments de roue
        if (fullConfig.segments && extraHandlers?.onUpdateSegments) {
          const segments = fullConfig.segments.map((s: any, i: number) => ({
            id: s.id || `seg_${i}`,
            label: s.label,
            color: s.color || '#6366f1',
            textColor: s.textColor || '#ffffff',
            probability: s.probability ?? 10,
            isWinning: s.isWinning ?? true,
          }));
          extraHandlers.onUpdateSegments(segments);
        }
        
        // Prix
        if (fullConfig.prizes && extraHandlers?.onUpdatePrizes) {
          const prizes = fullConfig.prizes.map((p: any, i: number) => ({
            id: p.id || `prize_${i}`,
            name: p.name,
            description: p.description || '',
            code: p.code || '',
            quantity: p.quantity ?? 100,
            image: p.image || '',
          }));
          extraHandlers.onUpdatePrizes(prizes);
        }
        
        // Questions quiz
        if (fullConfig.questions && extraHandlers?.onUpdateQuestions) {
          extraHandlers.onUpdateQuestions(fullConfig.questions);
        }
        
        // Cartes scratch
        if (fullConfig.scratchCards && extraHandlers?.onUpdateCards) {
          extraHandlers.onUpdateCards(fullConfig.scratchCards);
        }
        
        // Symboles jackpot
        if (fullConfig.jackpotSymbols && extraHandlers?.onUpdateSymbols) {
          extraHandlers.onUpdateSymbols(fullConfig.jackpotSymbols);
        }
        
        return;
      }
      
      // Appliquer un template
      if (action.type === 'apply_template' && typeof value === 'string') {
        // D'abord chercher dans BRAND_STYLES (plus complet)
        const brandStyle = BRAND_STYLES[value];
        if (brandStyle && extraHandlers?.onApplyTemplate) {
          extraHandlers.onApplyTemplate(value, {
            primary: brandStyle.colors.primary,
            secondary: brandStyle.colors.secondary,
            accent: brandStyle.colors.accent,
            background: brandStyle.colors.background,
            text: brandStyle.colors.text,
            segmentColors: brandStyle.segmentColors,
            segmentTextColor: brandStyle.segmentTextColor,
            typography: brandStyle.typography,
            borderRadius: brandStyle.borderRadius,
          });
          return;
        }
        // Fallback sur TEMPLATE_COLORS
        const templateColors = TEMPLATE_COLORS[value];
        if (templateColors && extraHandlers?.onApplyTemplate) {
          extraHandlers.onApplyTemplate(value, templateColors);
        }
        return;
      }
      
      // Mettre à jour les couleurs du thème
      if (action.type === 'update_theme_colors' && typeof value === 'object') {
        if (extraHandlers?.onApplyTemplate) {
          extraHandlers.onApplyTemplate('custom', value);
        }
        return;
      }
      
      // Mettre à jour les segments
      if (action.type === 'update_segments' && Array.isArray(value)) {
        if (extraHandlers?.onUpdateSegments) {
          const segments = value.map((s: any, i: number) => ({
            id: s.id || `seg_${i}`,
            label: s.label,
            color: s.color || '#6366f1',
            textColor: s.textColor || '#ffffff',
            probability: s.probability ?? 10,
            isWinning: s.isWinning ?? true,
          }));
          extraHandlers.onUpdateSegments(segments);
        }
        return;
      }
      
      // Mettre à jour les prix
      if (action.type === 'update_prizes' && Array.isArray(value)) {
        if (extraHandlers?.onUpdatePrizes) {
          const prizes = value.map((p: any, i: number) => ({
            id: p.id || `prize_${i}`,
            name: p.name,
            description: p.description || '',
            code: p.code || '',
            quantity: p.quantity ?? 100,
            image: p.image || '',
          }));
          extraHandlers.onUpdatePrizes(prizes);
        }
        return;
      }
      
      // Mettre à jour les questions quiz
      if (action.type === 'update_quiz_questions' && Array.isArray(value)) {
        if (extraHandlers?.onUpdateQuestions) {
          extraHandlers.onUpdateQuestions(value);
        }
        return;
      }
      
      // Mettre à jour les cartes scratch
      if (action.type === 'update_scratch_cards' && Array.isArray(value)) {
        if (extraHandlers?.onUpdateCards) {
          extraHandlers.onUpdateCards(value);
        }
        return;
      }
      
      // Mettre à jour les symboles jackpot
      if (action.type === 'update_jackpot_symbols' && Array.isArray(value)) {
        if (extraHandlers?.onUpdateSymbols) {
          extraHandlers.onUpdateSymbols(value);
        }
        return;
      }
      
      // Logo
      if (action.type === 'set_logo' && typeof value === 'string') {
        const welcomeKey = screenMapping.welcome;
        if (welcomeKey && config[welcomeKey]) {
          updateConfig({ [welcomeKey]: { ...config[welcomeKey], image: value, showImage: true } } as Partial<T>);
        }
        return;
      }
      
      // Image de fond
      if (action.type === 'set_background_image' && typeof value === 'string') {
        const targetKey = screenMapping[view as keyof ScreenMapping] || screenMapping.welcome;
        if (targetKey && config[targetKey]) {
          updateConfig({ [targetKey]: { ...config[targetKey], backgroundImage: value } } as Partial<T>);
        }
        return;
      }
      
      // Image de jeu
      if (action.type === 'set_game_image' && typeof value === 'string') {
        const targetKey = screenMapping[view as keyof ScreenMapping] || screenMapping.welcome;
        if (targetKey && config[targetKey]) {
          updateConfig({ [targetKey]: { ...config[targetKey], image: value, showImage: true } } as Partial<T>);
        }
        return;
      }
      
      // Gestion des champs de contact
      const contactKey = screenMapping.contact;
      if (view === 'contact' && contactKey && config[contactKey]) {
        const currentContact = config[contactKey] as any;
        
        if (action.type === 'add_field' && typeof value === 'object' && 'label' in value) {
          const newField = {
            id: (value as any).id || `field_${Date.now()}`,
            type: (value as any).type || 'text',
            label: (value as any).label,
            placeholder: (value as any).placeholder || '',
            required: (value as any).required ?? false,
            options: (value as any).options || []
          };
          updateConfig({ [contactKey]: { ...currentContact, fields: [...(currentContact.fields || []), newField] } } as Partial<T>);
          return;
        }
        if (action.type === 'remove_field' && typeof value === 'string') {
          const newFields = (currentContact.fields || []).filter((f: any) => f.label.toLowerCase() !== value.toLowerCase());
          updateConfig({ [contactKey]: { ...currentContact, fields: newFields } } as Partial<T>);
          return;
        }
        if (action.type === 'update_fields' && Array.isArray(value)) {
          const newFields = value.map((f: any, i: number) => ({
            id: f.id || `field_${i}`,
            type: f.type || 'text',
            label: f.label,
            placeholder: f.placeholder || '',
            required: f.required ?? false,
            options: f.options || []
          }));
          updateConfig({ [contactKey]: { ...currentContact, fields: newFields } } as Partial<T>);
          return;
        }
        if ((action.field === 'title' || action.field === 'subtitle') && typeof value === 'string') {
          updateConfig({ [contactKey]: { ...currentContact, [action.field]: value } } as Partial<T>);
          return;
        }
      }
      
      // Modifications de texte standard
      if (typeof value !== 'string') return;
      
      const screenKey = screenMapping[view as keyof ScreenMapping];
      if (screenKey && config[screenKey]) {
        const currentScreen = config[screenKey] as Record<string, any>;
        updateConfig({ [screenKey]: { ...currentScreen, [action.field]: value } } as Partial<T>);
      }
    });
  };
}
