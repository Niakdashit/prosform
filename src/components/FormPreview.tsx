import { motion, AnimatePresence } from "framer-motion";
import { Question } from "./FormBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, Star, Smile, Frown, Meh, Heart, ThumbsUp,
  Mail, Phone, Hash, Calendar, Video, FileText, Type,
  CheckSquare, List, CheckCircle, Image as ImageIcon,
  Paperclip, BarChart3, Upload, ChevronDown, Sparkles,
  Monitor, Smartphone, ImagePlus, Edit3, X, GitBranch,
  ChevronUp, Check
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ImageUploadModal } from "./ImageUploadModal";
import { ImageEditorModal, ImageSettings, defaultSettings } from "./ImageEditorModal";
import { BranchingModal } from "./BranchingModal";
import { EditableTextBlock } from "./EditableTextBlock";
import { useTheme, getButtonStyles, getFontFamily } from "@/contexts/ThemeContext";

// Load Google Font dynamically
const loadGoogleFont = (fontFamily: string) => {
  if (typeof document === 'undefined' || !fontFamily) return;
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;
  
  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
};

const PHONE_COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
];

interface FormPreviewProps {
  question?: Question;
  onNext: () => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: () => void;
  isMobileResponsive?: boolean;
  isReadOnly?: boolean;
  allQuestions?: Question[];
  // Optional: controlled editing state from parent (for TextToolbar integration)
  editingField?: string | null;
  setEditingField?: (field: string | null) => void;
  templateMeta?: {
    layoutStyle?: string;
    brandName?: string;
    backgroundImages?: string[];
    backgroundColor?: string;
    gradientStart?: string;
    gradientEnd?: string;
    gradientAngle?: number;
    buttonStyle?: string;
    fontStyle?: string;
    accentColor?: string;
    pictureChoiceImages?: string[];
    desktopLayout?: string;
    mobileLayout?: string;
    // NEW: Color Palette (3 tints)
    colorPalette?: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    // NEW: Typography (Google Fonts)
    typography?: {
      heading: string;
      body: string;
    };
  } | null;
}

export const FormPreview = ({ 
  question, 
  onNext, 
  onUpdateQuestion, 
  viewMode, 
  onToggleViewMode, 
  isMobileResponsive = false, 
  isReadOnly = false, 
  allQuestions = [], 
  editingField: externalEditingField,
  setEditingField: externalSetEditingField,
  templateMeta = null 
}: FormPreviewProps) => {
  const [inputValue, setInputValue] = useState("");
  // Use external state if provided, otherwise use local state
  const [localEditingField, setLocalEditingField] = useState<string | null>(null);
  const editingField = externalEditingField !== undefined ? externalEditingField : localEditingField;
  const setEditingField = externalSetEditingField || setLocalEditingField;
  const [editingChoiceIndex, setEditingChoiceIndex] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(question?.phoneCountry || 'US');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [formResponses, setFormResponses] = useState<Record<string, string>>({});
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [variableTarget, setVariableTarget] = useState<'title' | 'subtitle' | null>(null);
  const [menuView, setMenuView] = useState<'main' | 'variables'>('main');
  // Utiliser l'image de la question si disponible
  const [uploadedImage, setUploadedImage] = useState<string | null>(question?.image || null);
  const [imageRotation, setImageRotation] = useState(question?.imageSettings?.rotation || 0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [hardcodedImageHidden, setHardcodedImageHidden] = useState(false);
  const [hoveredChoiceIndex, setHoveredChoiceIndex] = useState<number | null>(null);
  const [hoveredRatingIndex, setHoveredRatingIndex] = useState<number | null>(null);
  const [showBranchingModal, setShowBranchingModal] = useState(false);
  const [branchingChoiceIndex, setBranchingChoiceIndex] = useState<number | null>(null);
  const [imageSettings, setImageSettings] = useState<ImageSettings>(
    question?.imageSettings ? {
      ...defaultSettings,
      size: question.imageSettings.size ?? defaultSettings.size,
      borderRadius: question.imageSettings.borderRadius ?? defaultSettings.borderRadius,
      borderWidth: question.imageSettings.borderWidth ?? defaultSettings.borderWidth,
      borderColor: question.imageSettings.borderColor ?? defaultSettings.borderColor,
      rotation: question.imageSettings.rotation ?? defaultSettings.rotation,
      flipH: question.imageSettings.flipH ?? defaultSettings.flipH,
      flipV: question.imageSettings.flipV ?? defaultSettings.flipV,
    } : defaultSettings
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const subtitleContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Template layout state
  const [templateSelectedChoices, setTemplateSelectedChoices] = useState<string[]>([]);
  
  // Resizing state
  const [isResizingTitle, setIsResizingTitle] = useState(false);
  const [isResizingSubtitle, setIsResizingSubtitle] = useState(false);

  // Load Google Fonts when template changes
  useEffect(() => {
    if (templateMeta?.typography?.heading) {
      loadGoogleFont(templateMeta.typography.heading);
    }
    if (templateMeta?.typography?.body) {
      loadGoogleFont(templateMeta.typography.body);
    }
  }, [templateMeta?.typography]);

  // Listen for FloatingToolbar style updates
  useEffect(() => {
    const handleStyleUpdate = (e: CustomEvent) => {
      if (!question) return;
      
      const { field, updates } = e.detail;
      
      // Determine which style property to update based on field
      let styleKey: 'titleStyle' | 'subtitleStyle' | 'buttonStyle' | null = null;
      
      if (field === 'title') {
        styleKey = 'titleStyle';
      } else if (field === 'subtitle') {
        styleKey = 'subtitleStyle';
      } else if (field === 'button') {
        styleKey = 'buttonStyle';
      }
      
      if (styleKey) {
        const currentStyle = question[styleKey] || {};
        const newStyle = { ...currentStyle };
        
        // Handle toggle values
        for (const [key, value] of Object.entries(updates)) {
          if (value === 'toggle') {
            // Toggle the boolean value
            newStyle[key] = !currentStyle[key];
          } else {
            newStyle[key] = value;
          }
        }
        
        onUpdateQuestion(question.id, { [styleKey]: newStyle });
      }
    };

    document.addEventListener('floatingToolbarStyle', handleStyleUpdate as EventListener);
    
    return () => {
      document.removeEventListener('floatingToolbarStyle', handleStyleUpdate as EventListener);
    };
  }, [question, onUpdateQuestion]);

  // Mettre à jour l'image quand la question change
  useEffect(() => {
    setUploadedImage(question?.image || null);
    setImageRotation(question?.imageSettings?.rotation || 0);
    if (question?.imageSettings) {
      setImageSettings({
        ...defaultSettings,
        borderRadius: question.imageSettings.borderRadius,
        borderWidth: question.imageSettings.borderWidth,
        borderColor: question.imageSettings.borderColor,
      });
    } else {
      setImageSettings(defaultSettings);
    }
    setHardcodedImageHidden(false);
  }, [question?.id]);

  // Helper function for container dimensions
  const getContainerDimensions = () => ({
    width: isMobileResponsive ? '100%' : (viewMode === 'desktop' ? '1100px' : '375px'),
    height: isMobileResponsive ? '100%' : (viewMode === 'desktop' ? '620px' : '667px')
  });

  // Close editing and variable menu when clicking outside
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Check if click is on an editable element or menu
    const isEditableElement = target.closest('[contenteditable="true"]') || 
                              target.closest('.variable-menu') ||
                              target.closest('button');
    if (!isEditableElement) {
      setEditingField(null);
      setShowVariableMenu(false);
      setMenuView('main');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && question) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setUploadedImage(imageData);
        setImageRotation(0);
        // Sauvegarder dans la question
        onUpdateQuestion(question.id, { 
          image: imageData,
          imageSettings: { ...imageSettings, rotation: 0 }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (imageData: string) => {
    setUploadedImage(imageData);
    setImageRotation(0);
    // Sauvegarder dans la question
    if (question) {
      onUpdateQuestion(question.id, { 
        image: imageData,
        imageSettings: { ...imageSettings, rotation: 0 }
      });
    }
  };

  const handleImageEdit = (settings: ImageSettings) => {
    setImageSettings(settings);
    setImageRotation(settings.rotation);
    // Always copy template image to uploadedImage when editing so settings apply immediately
    if (!uploadedImage && getBackgroundImage()) {
      setUploadedImage(getBackgroundImage());
    }
    // Sauvegarder TOUTES les propriétés dans la question
    if (question) {
      onUpdateQuestion(question.id, { 
        imageSettings: {
          size: settings.size,
          borderRadius: settings.borderRadius,
          borderWidth: settings.borderWidth,
          borderColor: settings.borderColor,
          rotation: settings.rotation,
          flipH: settings.flipH,
          flipV: settings.flipV
        }
      });
    }
  };

  const handleDeleteChoice = (index: number) => {
    if (!question || !question.choices) return;
    const newChoices = question.choices.filter((_, i) => i !== index);
    if (newChoices.length > 0) {
      onUpdateQuestion(question.id, { choices: newChoices });
    }
  };

  const handleDeleteRating = (ratingValue: number) => {
    if (!question) return;
    const currentCount = question.ratingCount || 5;
    if (currentCount > 1) {
      onUpdateQuestion(question.id, { ratingCount: currentCount - 1 });
    }
  };

  const availableVariables = [
    { key: 'first_name', label: 'First name', description: "User's first name" },
    { key: 'email', label: 'Email', description: "User's email address" },
    { key: 'ville', label: 'Ville', description: "Ville de l'utilisateur" },
  ];

  const insertVariable = (variableKey: string) => {
    if (!question) return;

    if (variableTarget === 'title') {
      const newTitle = (question.title || '') + `{{${variableKey}}}`;
      onUpdateQuestion(question.id, { title: newTitle });
    } else if (variableTarget === 'subtitle') {
      const newSubtitle = (question.subtitle || '') + `{{${variableKey}}}`;
      onUpdateQuestion(question.id, { subtitle: newSubtitle });
    }

    setShowVariableMenu(false);
    setMenuView('main');
  };

  const replaceVariables = (text: string): string => {
    if (!text) return text;
    let result = text;
    Object.entries(formResponses).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    });
    return result;
  };

  if (!question) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store response for variable replacement
    if (question && inputValue.trim()) {
      const responseKey = question.title.toLowerCase().includes('name') ? 'first_name' : 
                          question.title.toLowerCase().includes('email') ? 'email' :
                          question.id;
      setFormResponses(prev => ({
        ...prev,
        [responseKey]: inputValue.trim()
      }));
    }
    
    onNext();
  };

  const handleTitleBlur = (value: string) => {
    if (question && value.trim() !== question.title) {
      onUpdateQuestion(question.id, { title: value.trim() });
    }
    setEditingField(null);
  };

  const handleSubtitleBlur = (value: string) => {
    if (question && value.trim() !== question.subtitle) {
      onUpdateQuestion(question.id, { subtitle: value.trim() });
    }
    setEditingField(null);
  };

  const handleChoiceBlur = (index: number, value: string) => {
    if (question && question.choices) {
      const newChoices = [...question.choices];
      newChoices[index] = value.trim() || question.choices[index];
      onUpdateQuestion(question.id, { choices: newChoices });
    }
    setEditingChoiceIndex(null);
  };

  // Template layout rendering
  const currentQuestionIndex = allQuestions.findIndex(q => q.id === question?.id);

  const handleTemplateChoiceSelect = (choice: string) => {
    if (question?.variant === "checkbox") {
      setTemplateSelectedChoices(prev => 
        prev.includes(choice) ? prev.filter(c => c !== choice) : [...prev, choice]
      );
    } else {
      setTemplateSelectedChoices([choice]);
    }
  };

  const handleTemplateNext = () => {
    setTemplateSelectedChoices([]);
    onNext();
  };

  const getBackgroundImage = () => {
    if (!templateMeta?.backgroundImages?.length) return "";
    return templateMeta.backgroundImages[currentQuestionIndex % templateMeta.backgroundImages.length];
  };

  const getPictureChoiceImages = () => {
    return templateMeta?.pictureChoiceImages || [
      "https://images.unsplash.com/photo-1606813902913-8a53b050f82d?w=400&q=80",
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&q=80",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&q=80",
    ];
  };

  const getGradientBackground = () => {
    if (templateMeta?.gradientStart && templateMeta?.gradientEnd) {
      return `linear-gradient(${templateMeta.gradientAngle || 135}deg, ${templateMeta.gradientStart} 0%, ${templateMeta.gradientEnd} 100%)`;
    }
    return templateMeta?.backgroundColor || "#000";
  };

  const getButtonStyle = () => {
    const style = templateMeta?.buttonStyle || "soft";
    const primary = templateMeta?.accentColor || templateMeta?.backgroundColor || "#000";
    
    switch (style) {
      case "rounded": return { borderRadius: "9999px", padding: "12px 24px" };
      case "soft": return { borderRadius: "12px", padding: "12px 24px" };
      case "sharp": return { borderRadius: "0px", padding: "14px 28px" };
      case "gradient": return { 
        borderRadius: "12px", 
        padding: "12px 24px",
        background: templateMeta?.gradientStart ? `linear-gradient(135deg, ${templateMeta.gradientStart} 0%, ${templateMeta.gradientEnd} 100%)` : primary
      };
      default: return { borderRadius: "8px", padding: "12px 24px" };
    }
  };

  const getFontClass = () => {
    switch (templateMeta?.fontStyle) {
      case "serif": return "font-serif";
      case "mono": return "font-mono";
      case "display": return "font-bold tracking-tight";
      default: return "font-sans";
    }
  };

  // Get Google Font family for headings
  const getHeadingFontStyle = () => {
    if (templateMeta?.typography?.heading) {
      return { fontFamily: `"${templateMeta.typography.heading}", sans-serif` };
    }
    return {};
  };

  // Get Google Font family for body text
  const getBodyFontStyle = () => {
    if (templateMeta?.typography?.body) {
      return { fontFamily: `"${templateMeta.typography.body}", sans-serif` };
    }
    return {};
  };

  // Get text color with proper contrast (using colorPalette.tertiary for dark backgrounds)
  const getTextColor = () => {
    if (templateMeta?.colorPalette?.tertiary) {
      return templateMeta.colorPalette.tertiary;
    }
    return "#FFFFFF";
  };

  // Get unified button styles from theme
  const unifiedButtonStyles = getButtonStyles(theme);

  // Handle title resize - using preview container width
  const handleTitleResizeStart = (e: React.MouseEvent, side: 'left' | 'right') => {
    if (isReadOnly || !question) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizingTitle(true);
    
    const startX = e.clientX;
    const startWidth = question.titleWidth || 100;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Use a fixed ratio: 5px = 1%
      const deltaPercent = deltaX / 5;
      
      let newWidth: number;
      if (side === 'right') {
        newWidth = startWidth + deltaPercent;
      } else {
        newWidth = startWidth - deltaPercent;
      }
      
      // Clamp between 20% and 200%
      newWidth = Math.max(20, Math.min(200, newWidth));
      onUpdateQuestion(question.id, { titleWidth: Math.round(newWidth) });
    };
    
    const handleMouseUp = () => {
      setIsResizingTitle(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle subtitle resize
  const handleSubtitleResizeStart = (e: React.MouseEvent, side: 'left' | 'right') => {
    if (isReadOnly || !question) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizingSubtitle(true);
    
    const startX = e.clientX;
    const startWidth = question.subtitleWidth || 100;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Use a fixed ratio: 5px = 1%
      const deltaPercent = deltaX / 5;
      
      let newWidth: number;
      if (side === 'right') {
        newWidth = startWidth + deltaPercent;
      } else {
        newWidth = startWidth - deltaPercent;
      }
      
      // Clamp between 20% and 200%
      newWidth = Math.max(20, Math.min(200, newWidth));
      onUpdateQuestion(question.id, { subtitleWidth: Math.round(newWidth) });
    };
    
    const handleMouseUp = () => {
      setIsResizingSubtitle(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Mini resize handle component - vertically centered using transform
  const ResizeHandle = ({ side, onMouseDown, isResizing }: { side: 'left' | 'right', onMouseDown: (e: React.MouseEvent) => void, isResizing: boolean }) => (
    <div
      className={`absolute ${side === 'left' ? '-left-2' : '-right-2'} cursor-ew-resize z-50 opacity-0 group-hover:opacity-100 transition-opacity`}
      style={{ top: '50%', transform: 'translateY(-50%)' }} 
      onMouseDown={onMouseDown}
    >
      <div 
        className="w-2 h-2 rounded-full border-2 transition-all hover:scale-150"
        style={{ 
          backgroundColor: isResizing ? '#F5B800' : 'white',
          borderColor: '#F5B800',
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
        }}
      />
    </div>
  );

  // Reusable wrapper for resizable text blocks
  const ResizableTextWrapper = ({ 
    children, 
    type, 
    marginBottom = '0px' 
  }: { 
    children: React.ReactNode, 
    type: 'title' | 'subtitle',
    marginBottom?: string 
  }) => {
    const width = type === 'title' ? (question?.titleWidth || 100) : (question?.subtitleWidth || 100);
    const isResizing = type === 'title' ? isResizingTitle : isResizingSubtitle;
    const handleResizeStart = type === 'title' ? handleTitleResizeStart : handleSubtitleResizeStart;
    
    return (
      <div 
        className="relative group inline-block"
        style={{ 
          width: `${width}%`, 
          transition: isResizing ? 'none' : 'width 0.15s ease-out',
          marginBottom
        }}
      >
        {!isReadOnly && (
          <>
            <ResizeHandle side="left" onMouseDown={(e) => handleResizeStart(e, 'left')} isResizing={isResizing} />
            <ResizeHandle side="right" onMouseDown={(e) => handleResizeStart(e, 'right')} isResizing={isResizing} />
          </>
        )}
        {children}
      </div>
    );
  };

  // Reusable editable components for templates - SIMPLIFIED (no context)
  const EditableTitle = ({ className, textColor = 'white' }: { className?: string, textColor?: string }) => {
    const isEditing = editingField === 'welcome-title';
    const titleWidth = question?.titleWidth || 100;
    
    // Get custom styles from question or use defaults
    const titleStyle = question?.titleStyle || {};
    const appliedStyle: React.CSSProperties = {
      color: titleStyle.textColor || textColor,
      fontFamily: titleStyle.fontFamily || getFontFamily(theme.headingFontFamily),
      fontSize: titleStyle.fontSize ? `${titleStyle.fontSize}px` : undefined,
      fontWeight: titleStyle.isBold ? 'bold' : 'normal',
      fontStyle: titleStyle.isItalic ? 'italic' : 'normal',
      textDecoration: titleStyle.isUnderline ? 'underline' : 'none',
      textAlign: titleStyle.textAlign || 'center',
    };
    
    return (
    <div className="relative flex justify-center w-full">
      <div 
        ref={titleContainerRef}
        className="relative group"
        style={{ width: `${titleWidth}%`, transition: isResizingTitle ? 'none' : 'width 0.15s ease-out' }}
      >
        {/* Mini resize handles */}
        {!isReadOnly && (
          <>
            <ResizeHandle side="left" onMouseDown={(e) => handleTitleResizeStart(e, 'left')} isResizing={isResizingTitle} />
            <ResizeHandle side="right" onMouseDown={(e) => handleTitleResizeStart(e, 'right')} isResizing={isResizingTitle} />
          </>
        )}

        {!isReadOnly && editingField === 'welcome-title' && (
          <>
            <div className="absolute -top-3 right-0 flex items-center gap-1 z-50 animate-fade-in">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setVariableTarget('title'); setShowVariableMenu((open) => !open); setMenuView('main'); }}
                className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(245, 184, 0, 0.15)', color: '#F5B800', backdropFilter: 'blur(8px)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              {question?.title && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => question && onUpdateQuestion(question.id, { title: '' })}
                  className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', backdropFilter: 'blur(8px)' }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {showVariableMenu && variableTarget === 'title' && (
              <div className="variable-menu absolute z-50 w-72 p-2 rounded-md shadow-xl animate-fade-in" style={{ top: '32px', right: 0, backgroundColor: '#4A4138', border: '1px solid rgba(245, 184, 0, 0.3)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                {menuView === 'main' ? (
                  <div className="space-y-1">
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => console.log('Réécriture AI')} className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10">
                      <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Réécriture</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Améliorer le texte avec l'IA</div>
                    </button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => setMenuView('variables')} className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10">
                      <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Variable</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Insérer une variable dynamique</div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => setMenuView('main')} className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/10 mb-2">
                      <div className="text-xs" style={{ color: '#A89A8A' }}>← Retour</div>
                    </button>
                    {availableVariables.map((variable) => (
                      <button key={variable.key} onMouseDown={(e) => e.preventDefault()} onClick={() => insertVariable(variable.key)} className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10">
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
          data-text-editable="title"
          className={`${className} ${!isReadOnly ? 'cursor-text' : ''} transition-opacity`}
          style={{ 
            ...appliedStyle,
            outline: isEditing ? '2px solid #F5B800' : 'none', 
            outlineOffset: '2px',
            padding: '4px', 
            margin: '-4px', 
            borderRadius: '4px' 
          }}
          contentEditable={!isReadOnly}
          suppressContentEditableWarning
          onFocus={() => !isReadOnly && setEditingField('welcome-title')}
          onBlur={(e) => {
            if (!isReadOnly && question) {
              onUpdateQuestion(question.id, { title: e.currentTarget.textContent || '' });
            }
            // Delay clearing to check if focus moved to toolbar
            setTimeout(() => {
              const activeEl = document.activeElement;
              if (!activeEl?.closest('.text-toolbar')) {
                setEditingField(null);
              }
            }, 100);
          }}
        >
          {question?.title || 'Click to add title'}
        </h1>
      </div>
    </div>
  );
  };

  const EditableSubtitle = ({ className, textColor = 'rgba(255,255,255,0.7)' }: { className?: string, textColor?: string }) => {
    const isEditing = editingField === 'welcome-subtitle';
    const subtitleWidth = question?.subtitleWidth || 100;
    
    // Get custom styles from question or use defaults
    const subtitleStyle = question?.subtitleStyle || {};
    const appliedStyle: React.CSSProperties = {
      color: subtitleStyle.textColor || textColor,
      fontFamily: subtitleStyle.fontFamily || getFontFamily(theme.fontFamily),
      fontSize: subtitleStyle.fontSize ? `${subtitleStyle.fontSize}px` : undefined,
      fontWeight: subtitleStyle.isBold ? 'bold' : 'normal',
      fontStyle: subtitleStyle.isItalic ? 'italic' : 'normal',
      textDecoration: subtitleStyle.isUnderline ? 'underline' : 'none',
      textAlign: subtitleStyle.textAlign || 'center',
    };
    
    return (
    <div className="relative flex justify-center w-full">
      <div 
        ref={subtitleContainerRef}
        className="relative group"
        style={{ width: `${subtitleWidth}%`, transition: isResizingSubtitle ? 'none' : 'width 0.15s ease-out' }}
      >
        {/* Mini resize handles */}
        {!isReadOnly && (
          <>
            <ResizeHandle side="left" onMouseDown={(e) => handleSubtitleResizeStart(e, 'left')} isResizing={isResizingSubtitle} />
            <ResizeHandle side="right" onMouseDown={(e) => handleSubtitleResizeStart(e, 'right')} isResizing={isResizingSubtitle} />
          </>
        )}

        {!isReadOnly && editingField === 'welcome-subtitle' && (
          <>
            <div className="absolute -top-3 right-0 flex items-center gap-1 z-50 animate-fade-in">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setVariableTarget('subtitle'); setShowVariableMenu((open) => !open); setMenuView('main'); }}
                className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(245, 184, 0, 0.15)', color: '#F5B800', backdropFilter: 'blur(8px)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              {question?.subtitle && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => question && onUpdateQuestion(question.id, { subtitle: '' })}
                  className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', backdropFilter: 'blur(8px)' }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {showVariableMenu && variableTarget === 'subtitle' && (
              <div className="variable-menu absolute z-50 w-72 p-2 rounded-md shadow-xl animate-fade-in" style={{ top: '32px', right: 0, backgroundColor: '#4A4138', border: '1px solid rgba(245, 184, 0, 0.3)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                {menuView === 'main' ? (
                  <div className="space-y-1">
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => console.log('Réécriture AI')} className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10">
                      <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Réécriture</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Améliorer le texte avec l'IA</div>
                    </button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => setMenuView('variables')} className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10">
                      <div className="font-medium text-sm" style={{ color: '#F5B800' }}>Variable</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Insérer une variable dynamique</div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => setMenuView('main')} className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/10 mb-2">
                      <div className="text-xs" style={{ color: '#A89A8A' }}>← Retour</div>
                    </button>
                    {availableVariables.map((variable) => (
                      <button key={variable.key} onMouseDown={(e) => e.preventDefault()} onClick={() => insertVariable(variable.key)} className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10">
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
          data-text-editable="subtitle"
          className={`${className} ${!isReadOnly ? 'cursor-text' : ''} transition-opacity`}
          style={{ 
            ...appliedStyle,
            outline: isEditing ? '2px solid #F5B800' : 'none', 
            outlineOffset: '2px',
            padding: '4px', 
            margin: '-4px', 
            borderRadius: '4px' 
          }}
          contentEditable={!isReadOnly}
          suppressContentEditableWarning
          onFocus={() => !isReadOnly && setEditingField('welcome-subtitle')}
          onBlur={(e) => {
            if (!isReadOnly && question) {
              onUpdateQuestion(question.id, { subtitle: e.currentTarget.textContent || '' });
            }
            // Delay clearing to check if focus moved to toolbar
            setTimeout(() => {
              const activeEl = document.activeElement;
              if (!activeEl?.closest('.text-toolbar')) {
                setEditingField(null);
              }
            }, 100);
          }}
        >
          {question?.subtitle || 'Click to add subtitle'}
        </p>
      </div>
    </div>
  );
  };

  // Render custom template layout if template has a layoutStyle
  const hasCustomLayout = templateMeta?.layoutStyle && templateMeta.layoutStyle !== "default";
  
  if (hasCustomLayout && question) {
    const themeColor = templateMeta.backgroundColor || "#0F4C5C";
    const brandName = templateMeta.brandName || "BRAND";
    const accentColor = templateMeta.accentColor || "#FFFFFF";
    const layoutStyle = templateMeta.layoutStyle;
    const isGradient = layoutStyle === "gradient" || layoutStyle === "bold" || layoutStyle === "modern";
    const backgroundStyle = isGradient ? getGradientBackground() : themeColor;
    
    // Desktop/Mobile layout options - prioritize question layout over template default
    const desktopLayout = question.desktopLayout || templateMeta.desktopLayout || 'left-right';
    const mobileLayout = question.mobileLayout || templateMeta.mobileLayout || 'vertical';
    const currentLayout = viewMode === 'desktop' ? desktopLayout : mobileLayout;
    const hasImage = templateMeta.backgroundImages && templateMeta.backgroundImages.length > 0;
    
    // Map SettingsPanel layout IDs to our layout names
    const mapDesktopLayout = (layout: string) => {
      switch(layout) {
        case 'desktop-left-right': return 'left-right';
        case 'desktop-right-left': return 'right-left';
        case 'desktop-centered': return 'centered';
        case 'desktop-card': return 'split-right';
        case 'desktop-panel': return 'split-left';
        case 'desktop-split': return 'wallpaper';
        default: return layout;
      }
    };
    const mapMobileLayout = (layout: string) => {
      switch(layout) {
        case 'mobile-vertical': return 'vertical';
        case 'mobile-centered': return 'banner';
        case 'mobile-minimal': return 'wallpaper';
        default: return layout;
      }
    };
    const effectiveDesktopLayout = mapDesktopLayout(desktopLayout);
    const effectiveMobileLayout = mapMobileLayout(mobileLayout);

    // Toggle button component - now handled in the builder, so always return null
    const ViewToggleButton = () => null;

    // Welcome screen
    if (question.type === "welcome") {
      // Minimal layout - light background
      if (layoutStyle === "minimal") {
        return (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
            <ViewToggleButton />
            <div 
              className={`relative overflow-hidden transition-all duration-300 flex flex-col items-center justify-center ${getFontClass()}`}
              style={{ 
                backgroundColor: "#FFFFFF",
                ...getContainerDimensions() 
              }}
            >
              <div className="absolute top-6 left-6 text-gray-400 text-sm font-medium tracking-wider">
                {brandName}
              </div>
              <div className="max-w-lg text-center px-8">
                <div className="mb-4">
                  <EditableTitle className={`${viewMode === 'desktop' ? 'text-5xl' : 'text-3xl'} font-medium leading-tight`} textColor="#111827" />
                </div>
                <div className="mb-8">
                  <EditableSubtitle className="text-lg" textColor="#6B7280" />
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Button
                    onClick={handleTemplateNext}
                    className="text-sm font-medium"
                    style={{ 
                      backgroundColor: themeColor, 
                      color: '#FFFFFF',
                      ...getButtonStyle()
                    }}
                  >
                    {question.buttonText || "Start"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        );
      }

      // Gradient/Bold/Modern layouts - WITH IMAGE SPLIT if available
      if (isGradient) {
        const hasImageForGradient = templateMeta?.backgroundImages && templateMeta.backgroundImages.length > 0;
        
        // If has image AND desktop, show split layout
        if (hasImageForGradient && viewMode === 'desktop') {
          return (
            <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
              <ViewToggleButton />
              <div 
                className={`relative overflow-hidden transition-all duration-300 flex ${getFontClass()}`}
                style={{ 
                  background: backgroundStyle,
                  width: '1100px', 
                  height: '620px' 
                }}
              >
                {/* Left side - Content */}
                <div className="w-1/2 h-full flex flex-col justify-center p-12">
                  <div className="text-white/80 text-sm font-medium tracking-wider mb-8">
                    {brandName}<sup className="text-xs">®</sup>
                  </div>
                  <div className="mb-6">
                    <EditableTitle className={`text-4xl ${layoutStyle === 'bold' ? 'font-black' : 'font-semibold'} leading-tight`} />
                  </div>
                  <div className="mb-8">
                    <EditableSubtitle className="text-lg" textColor="rgba(255,255,255,0.8)" />
                  </div>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    <Button
                      variant="ghost"
                      onClick={handleTemplateNext}
                      className="text-base font-semibold shadow-2xl hover:scale-105 hover:opacity-90 transition-transform"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        color: themeColor,
                        ...getButtonStyle()
                      }}
                    >
                      {question.buttonText || "Let's go"}
                    </Button>
                  </motion.div>
                  <div className="mt-auto pt-8 text-white/50 text-xs">Takes 2 min</div>
                </div>
                {/* Right side - Image */}
                <div className="w-1/2 h-full relative overflow-hidden">
                  <motion.img 
                    initial={{ scale: 1.1, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ duration: 0.6 }} 
                    src={getBackgroundImage()} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                  {/* Subtle gradient overlay for text readability */}
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${templateMeta?.colorPalette?.primary || themeColor}40 0%, transparent 30%)` }} />
                </div>
              </div>
            </div>
          );
        }
        
        // Mobile or no image - centered layout with optional background image
        return (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
            <ViewToggleButton />
            <div 
              className={`relative overflow-hidden transition-all duration-300 flex flex-col ${getFontClass()}`}
              style={{ 
                background: backgroundStyle,
                ...getContainerDimensions() 
              }}
            >
              {/* Background image with overlay for mobile */}
              {hasImageForGradient && viewMode === 'mobile' && (
                <>
                  <img src={getBackgroundImage()} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  <div className="absolute inset-0" style={{ background: `${backgroundStyle}` }} />
                </>
              )}
              <div className="absolute top-6 left-6 text-white/80 text-sm font-medium tracking-wider z-10">
                {brandName}<sup className="text-xs">®</sup>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="max-w-2xl text-center px-8 z-10">
                  <div className="mb-6">
                    <EditableTitle className={`${viewMode === 'desktop' ? 'text-6xl' : 'text-3xl'} ${layoutStyle === 'bold' ? 'font-black' : 'font-semibold'} leading-tight`} />
                  </div>
                  <div className="mb-10">
                    <EditableSubtitle className="text-xl" textColor="rgba(255,255,255,0.8)" />
                  </div>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    <Button
                      variant="ghost"
                      onClick={handleTemplateNext}
                      className="text-base font-semibold shadow-2xl hover:scale-105 hover:opacity-90 transition-transform"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        color: themeColor,
                        ...getButtonStyle()
                      }}
                    >
                      {question.buttonText || "Let's go"}
                    </Button>
                  </motion.div>
                </div>
              </div>
              <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-xs z-10">Takes 2 min</div>
            </div>
          </div>
        );
      }

      // Elegant layout - serif font, sophisticated WITH IMAGE
      if (layoutStyle === "elegant") {
        const hasImageForElegant = templateMeta?.backgroundImages && templateMeta.backgroundImages.length > 0;
        
        // Desktop with image - split layout
        if (hasImageForElegant && viewMode === 'desktop') {
          return (
            <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
              <ViewToggleButton />
              <div 
                className="relative overflow-hidden transition-all duration-300 flex font-serif"
                style={{ 
                  backgroundColor: themeColor,
                  width: '1100px', 
                  height: '620px' 
                }}
              >
                {/* Left side - Image */}
                <div className="w-1/2 h-full relative overflow-hidden">
                  <motion.img 
                    initial={{ scale: 1.1, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ duration: 0.8 }} 
                    src={getBackgroundImage()} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                {/* Right side - Content */}
                <div className="w-1/2 h-full flex flex-col justify-center p-12">
                  <div className="text-white/60 text-sm tracking-[0.3em] uppercase mb-8">
                    {brandName}
                  </div>
                  <div className="mb-6">
                    <EditableTitle className="text-4xl font-light leading-tight italic" />
                  </div>
                  <div className="mb-10">
                    <EditableSubtitle className="text-lg" textColor="rgba(255,255,255,0.7)" />
                  </div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Button
                      variant="ghost"
                      onClick={handleTemplateNext}
                      className="text-sm font-normal tracking-wider uppercase hover:opacity-90 transition-colors"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        color: themeColor,
                        borderRadius: '0px',
                        padding: '16px 32px',
                        border: 'none'
                      }}
                    >
                      {question.buttonText || "Begin"}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          );
        }
        
        // Mobile or no image - centered
        return (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
            <ViewToggleButton />
            <div 
              className="relative overflow-hidden transition-all duration-300 flex flex-col items-center justify-center font-serif"
              style={{ 
                backgroundColor: themeColor,
                ...getContainerDimensions() 
              }}
            >
              {/* Background image overlay for mobile */}
              {hasImageForElegant && viewMode === 'mobile' && (
                <>
                  <img src={getBackgroundImage()} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                </>
              )}
              <div className="absolute top-6 left-6 text-white/60 text-sm tracking-[0.3em] uppercase z-10">
                {brandName}
              </div>
              <div className="max-w-xl text-center px-8 z-10">
                <div className="mb-6">
                  <EditableTitle className={`${viewMode === 'desktop' ? 'text-5xl' : 'text-3xl'} font-light leading-tight italic`} />
                </div>
                <div className="mb-10">
                  <EditableSubtitle className="text-lg" textColor="rgba(255,255,255,0.7)" />
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Button
                    variant="ghost"
                    onClick={handleTemplateNext}
                    className="text-sm font-normal tracking-wider uppercase hover:opacity-90 transition-colors"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      color: themeColor,
                      borderRadius: '0px',
                      padding: '16px 32px'
                    }}
                  >
                    {question.buttonText || "Begin"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        );
      }

      // Glassmorphism layout
      if (layoutStyle === "glassmorphism") {
        return (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
            <ViewToggleButton />
            <div 
              className={`relative overflow-hidden transition-all duration-300 ${getFontClass()}`}
              style={{ 
                background: backgroundStyle,
                ...getContainerDimensions() 
              }}
            >
              {/* Background image */}
              {getBackgroundImage() && (
                <div className="absolute inset-0">
                  <img src={getBackgroundImage()} alt="" className="w-full h-full object-cover opacity-30" />
                </div>
              )}
              <div className="absolute top-6 left-6 text-white/80 text-sm font-medium tracking-wider z-10">
                {brandName}
              </div>
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div 
                  className="max-w-lg text-center p-10 rounded-3xl"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <div className="mb-4">
                    <EditableTitle className={`${viewMode === 'desktop' ? 'text-4xl' : 'text-2xl'} font-semibold leading-tight`} />
                  </div>
                  <div className="mb-8">
                    <EditableSubtitle className="text-base" textColor="rgba(255,255,255,0.8)" />
                  </div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Button
                      variant="ghost"
                      onClick={handleTemplateNext}
                      className="text-sm font-medium hover:opacity-90"
                      style={{ 
                        backgroundColor: 'white',
                        color: themeColor,
                        ...getButtonStyle()
                      }}
                    >
                      {question.buttonText || "Start"}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // WALLPAPER layout - Full background image with overlay
      if (effectiveDesktopLayout === 'wallpaper' || (viewMode === 'mobile' && effectiveMobileLayout === 'wallpaper')) {
        return (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
            <ViewToggleButton />
            <div className="relative overflow-hidden transition-all duration-300" style={{ ...getContainerDimensions() }}>
              {/* Full background image */}
              {getBackgroundImage() && (
                <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }} src={getBackgroundImage()} alt="" className="absolute inset-0 w-full h-full object-cover" />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, ${themeColor}ee 100%)` }} />
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="absolute top-6 left-6 text-white/80 text-sm tracking-wider">{brandName}</div>
                <div className="mb-4">
                  <EditableTitle className={`${viewMode === 'desktop' ? 'text-5xl' : 'text-3xl'} font-semibold leading-tight`} />
                </div>
                <div className="mb-8 max-w-md">
                  <EditableSubtitle className="text-lg" textColor="rgba(255,255,255,0.8)" />
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Button variant="ghost" onClick={handleTemplateNext} className="rounded-full px-8 py-4 text-base font-semibold shadow-xl hover:opacity-90" style={{ backgroundColor: '#FFFFFF', color: themeColor }}>{question.buttonText || "Get started"}</Button>
                </motion.div>
              </div>
            </div>
          </div>
        );
      }

      // RIGHT-LEFT layout - Image on left, content on right
      if (effectiveDesktopLayout === 'right-left' && viewMode === 'desktop') {
        return (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
            <ViewToggleButton />
            <div className="relative overflow-hidden transition-all duration-300 flex" style={{ backgroundColor: themeColor, width: '1100px', height: '620px' }}>
              {/* Left side - Image */}
              {getBackgroundImage() && (
                <div className="w-1/2 h-full relative overflow-hidden">
                  <motion.img initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} src={getBackgroundImage()} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              {/* Right side - Content */}
              <div className={`${getBackgroundImage() ? 'w-1/2' : 'w-full'} h-full flex flex-col justify-center p-12`}>
                <div className="text-white/60 text-sm tracking-[0.2em] uppercase mb-8">{brandName}</div>
                <div className="mb-6"><EditableTitle className="text-4xl font-light leading-tight" /></div>
                <div className="mb-8"><EditableSubtitle className="text-lg" textColor="rgba(255,255,255,0.7)" /></div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Button variant="ghost" onClick={handleTemplateNext} className="px-8 py-3 text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#FFFFFF', color: themeColor, borderRadius: '4px' }}>{question.buttonText || "Begin"}</Button>
                </motion.div>
              </div>
            </div>
          </div>
        );
      }

      // SPLIT-RIGHT layout - Content on left, image on right (same as left-right but explicit)
      if (effectiveDesktopLayout === 'split-right' && viewMode === 'desktop') {
        return (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
            <ViewToggleButton />
            <div className="relative overflow-hidden transition-all duration-300 flex" style={{ backgroundColor: themeColor, width: '1100px', height: '620px' }}>
              {/* Left side - Content */}
              <div className={`${getBackgroundImage() ? 'w-1/2' : 'w-full'} h-full flex flex-col justify-center p-12`}>
                <div className="text-white/60 text-sm tracking-wider mb-6">{brandName}</div>
                <div className="mb-4"><EditableTitle className="text-4xl font-semibold leading-tight" /></div>
                <div className="mb-8"><EditableSubtitle className="text-lg" textColor="rgba(255,255,255,0.7)" /></div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Button variant="ghost" onClick={handleTemplateNext} className="px-8 py-3 text-sm font-semibold rounded-lg hover:opacity-90" style={{ backgroundColor: '#FFFFFF', color: themeColor }}>{question.buttonText || "Continue"}</Button>
                </motion.div>
              </div>
              {/* Right side - Image */}
              {getBackgroundImage() && (
                <div className="w-1/2 h-full relative overflow-hidden">
                  <motion.img initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} src={getBackgroundImage()} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        );
      }

      // SPLIT-LEFT layout - Image on left, content on right
      if (effectiveDesktopLayout === 'split-left' && viewMode === 'desktop') {
        return (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
            <ViewToggleButton />
            <div className="relative overflow-hidden transition-all duration-300 flex" style={{ backgroundColor: themeColor, width: '1100px', height: '620px' }}>
              {/* Left side - Image */}
              {getBackgroundImage() && (
                <div className="w-1/2 h-full relative overflow-hidden">
                  <motion.img initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} src={getBackgroundImage()} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              {/* Right side - Content */}
              <div className={`${getBackgroundImage() ? 'w-1/2' : 'w-full'} h-full flex flex-col justify-center p-12`}>
                <div className="text-white/60 text-sm tracking-wider mb-6">{brandName}</div>
                <div className="mb-4"><EditableTitle className="text-4xl font-semibold leading-tight" /></div>
                <div className="mb-8"><EditableSubtitle className="text-lg" textColor="rgba(255,255,255,0.7)" /></div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Button variant="ghost" onClick={handleTemplateNext} className="px-8 py-3 text-sm font-semibold rounded-lg hover:opacity-90" style={{ backgroundColor: '#FFFFFF', color: themeColor }}>{question.buttonText || "Continue"}</Button>
                </motion.div>
              </div>
            </div>
          </div>
        );
      }

      // BANNER layout for mobile - Image on top, content below
      if (viewMode === 'mobile' && effectiveMobileLayout === 'banner' && getBackgroundImage()) {
        return (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
            <ViewToggleButton />
            <div className="relative overflow-hidden transition-all duration-300 flex flex-col" style={{ backgroundColor: themeColor, width: '375px', height: '667px' }}>
              {/* Top - Image banner */}
              <div className="h-2/5 relative overflow-hidden">
                <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 0.6 }} src={getBackgroundImage()} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                <div className="absolute top-4 left-4 text-white/90 text-xs tracking-wider">{brandName}</div>
              </div>
              {/* Bottom - Content */}
              <div className="flex-1 flex flex-col justify-center p-6">
                <div className="mb-3"><EditableTitle className="text-2xl font-semibold leading-tight" /></div>
                <div className="mb-6"><EditableSubtitle className="text-sm" textColor="rgba(255,255,255,0.7)" /></div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Button variant="ghost" onClick={handleTemplateNext} className="w-full rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90" style={{ backgroundColor: '#FFFFFF', color: themeColor }}>{question.buttonText || "Start"}</Button>
                </motion.div>
              </div>
            </div>
          </div>
        );
      }

      // VERTICAL layout for mobile - All content left-aligned with p-8 padding (matches system default)
      if (viewMode === 'mobile' && effectiveMobileLayout === 'vertical') {
        return (
          <>
            <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
              <ViewToggleButton />
              <div className="relative overflow-hidden transition-all duration-300 flex flex-col p-8" style={{ backgroundColor: themeColor, width: '375px', height: '667px' }}>
                {/* Top - Brand name */}
                <div className="mb-6">
                  <div className="text-white/70 text-sm tracking-wider">{brandName}</div>
                </div>
                {/* Square image - left aligned with hover buttons */}
                <div className="mb-6">
                  <div 
                    className="overflow-hidden shadow-xl relative group"
                    style={{
                      width: `${176 * (imageSettings.size / 100)}px`,
                      height: `${176 * (imageSettings.size / 100)}px`,
                      borderRadius: `${imageSettings.borderRadius}px`,
                      border: imageSettings.borderWidth > 0 ? `${imageSettings.borderWidth}px solid ${imageSettings.borderColor}` : 'none',
                    }}
                  >
                    {(uploadedImage || (getBackgroundImage() && !hardcodedImageHidden)) ? (
                      <>
                        <motion.img 
                          initial={{ scale: 1.1 }} 
                          animate={{ scale: 1 }} 
                          transition={{ duration: 0.6 }} 
                          src={uploadedImage || getBackgroundImage()} 
                          alt="" 
                          className="w-full h-full object-cover"
                          style={{
                            transform: `rotate(${imageSettings.rotation}deg) scaleX(${imageSettings.flipH ? -1 : 1}) scaleY(${imageSettings.flipV ? -1 : 1})`,
                          }}
                        />
                        {/* Hover buttons */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10">
                          <button 
                            onClick={() => {
                              // Copy template image to uploadedImage when opening editor
                              if (!uploadedImage && getBackgroundImage()) {
                                setUploadedImage(getBackgroundImage());
                              }
                              setShowEditorModal(true);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" 
                            style={{ backgroundColor: 'rgba(61, 55, 49, 0.9)' }} 
                            title="Éditer l'image"
                          >
                            <Edit3 className="w-4 h-4 text-white" />
                          </button>
                          <button 
                            onClick={() => {
                              setUploadedImage(null);
                              setHardcodedImageHidden(true);
                              setImageSettings(defaultSettings);
                              if (question) onUpdateQuestion(question.id, { image: undefined, imageSettings: undefined });
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 bg-red-500 hover:bg-red-600" 
                            title="Supprimer l'image"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Upload className="w-10 h-10 mb-2" style={{ color: accentColor }} />
                        <p className="text-xs font-medium" style={{ color: accentColor }}>Upload Image</p>
                        <p className="text-xs mt-1 text-white/50">Click to browse</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Content - left-aligned with inline editing */}
                <div className="flex-1 flex flex-col">
                  <div className="mb-2"><EditableTitle className="text-2xl font-semibold leading-tight" /></div>
                  <div className="mb-6"><EditableSubtitle className="text-sm" textColor="rgba(255,255,255,0.7)" /></div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Button variant="ghost" onClick={handleTemplateNext} className="rounded-full px-6 py-3 text-sm font-semibold hover:opacity-90" style={{ backgroundColor: '#FFFFFF', color: themeColor }}>{question.buttonText || "Start"}</Button>
                  </motion.div>
                </div>
                {/* Footer - Time */}
                <div className="mt-auto">
                  <div className="text-white/50 text-xs">Takes 2 min</div>
                </div>
              </div>
            </div>
            {/* File input for image upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {/* Image Editor Modal */}
            <ImageEditorModal
              open={showEditorModal}
              onOpenChange={setShowEditorModal}
              imageUrl={uploadedImage || getBackgroundImage() || ''}
              settings={imageSettings}
              onSave={handleImageEdit}
            />
          </>
        );
      }

      // Default LEFT-RIGHT layout (typeform style) - Desktop with image, Mobile without
      return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
          <ViewToggleButton />
          <div className="relative overflow-hidden transition-all duration-300 flex" style={{ backgroundColor: themeColor, ...getContainerDimensions() }}>
            {/* Left side - Content */}
            <div className={`${viewMode === 'desktop' && getBackgroundImage() ? 'w-1/2' : 'w-full'} h-full flex flex-col justify-between p-8`}>
              <div className="text-white/90 text-sm font-medium tracking-wider">{brandName}<sup className="text-xs">®</sup></div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-6"><EditableTitle className={`${viewMode === 'desktop' ? 'text-4xl' : 'text-2xl'} font-light leading-tight`} /></div>
                <div className="mb-6"><EditableSubtitle className="text-base" textColor="rgba(255,255,255,0.7)" /></div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Button variant="ghost" onClick={handleTemplateNext} className="rounded-full px-6 py-3 text-sm font-medium hover:opacity-90" style={{ backgroundColor: 'white', color: themeColor }}>{question.buttonText || "Start quiz"}</Button>
                </motion.div>
              </div>
              <div className="text-white/60 text-xs">Takes 2 min</div>
            </div>
            {/* Right side - Image (desktop only) */}
            {viewMode === 'desktop' && getBackgroundImage() && (
              <div className="w-1/2 h-full relative overflow-hidden">
                <motion.img initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} src={getBackgroundImage()} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      );
    }

    // Picture choice - Grid layout
    if (question.type === "picture-choice") {
      return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
          <ViewToggleButton />
          <div className="relative overflow-hidden transition-all duration-300 flex flex-col items-center justify-center" style={{ background: isGradient ? backgroundStyle : themeColor, ...getContainerDimensions() }}>
            <div className="absolute top-6 left-6 text-white/70 text-sm tracking-wider">{brandName}</div>
            <div className="max-w-2xl text-center px-8">
              <div className="mb-10">
                <EditableTitle className={`${viewMode === 'desktop' ? 'text-3xl' : 'text-xl'} font-medium text-center`} />
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`grid ${viewMode === 'desktop' ? 'grid-cols-4 gap-4' : 'grid-cols-2 gap-3'}`}>
                {(question.choices || []).map((choice, index) => (
                  <button key={index} onClick={() => handleTemplateChoiceSelect(choice)} className={`relative overflow-hidden rounded-xl transition-all hover:scale-105 ${templateSelectedChoices.includes(choice) ? 'ring-4 ring-white shadow-2xl scale-105' : ''}`}>
                    <img src={getPictureChoiceImages()[index % getPictureChoiceImages().length]} alt={choice} className={`w-full ${viewMode === 'desktop' ? 'h-32' : 'h-24'} object-cover`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-medium">{choice}</div>
                    {templateSelectedChoices.includes(choice) && <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"><Check className="w-4 h-4" style={{ color: themeColor }} /></div>}
                  </button>
                ))}
              </motion.div>
              {templateSelectedChoices.length > 0 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8"><Button onClick={handleTemplateNext} className="rounded-xl px-8 py-3 text-base font-semibold shadow-xl" style={{ backgroundColor: 'white', color: themeColor }}>Continue</Button></motion.div>}
            </div>
          </div>
        </div>
      );
    }

    // Rating - NPS scale (uses ratingCount from question, defaults to 10 for NPS)
    if (question.type === "rating" && (question.ratingType === "nps" || question.ratingCount === 10 || question.ratingCount === 11)) {
      const maxRating = question.ratingCount || 10;
      const ratingNumbers = Array.from({ length: maxRating + 1 }, (_, i) => i);
      const buttonSize = viewMode === 'mobile' 
        ? (maxRating > 7 ? 'w-[26px] h-8' : 'w-8 h-10')
        : 'w-12 h-14';
      
      return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
          <ViewToggleButton />
          <div className="relative overflow-hidden transition-all duration-300 flex flex-col" style={{ background: isGradient ? backgroundStyle : themeColor, ...getContainerDimensions() }}>
            <div className="p-6 text-white/60 text-sm tracking-wider">{brandName}</div>
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="mb-2 px-2 text-center">
                <EditableTitle className={`${viewMode === 'desktop' ? 'text-3xl' : 'text-lg'} font-medium text-center`} />
              </div>
              <div className="mb-6 px-2 text-center">
                <EditableSubtitle className="text-xs text-center" textColor="rgba(255,255,255,0.6)" />
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`flex flex-wrap justify-center ${viewMode === 'mobile' ? 'gap-1' : 'gap-1'}`}>
                {ratingNumbers.map(n => (
                  <button key={n} onClick={() => setTemplateSelectedChoices([String(n)])} className={`${buttonSize} rounded-lg ${viewMode === 'mobile' ? 'text-xs' : 'text-sm'} font-semibold transition-all ${templateSelectedChoices.includes(String(n)) ? 'bg-white text-green-600 scale-110 shadow-xl' : n >= maxRating - 1 ? 'bg-green-500/30 text-white hover:bg-green-500/50' : n >= maxRating - 3 ? 'bg-yellow-500/30 text-white hover:bg-yellow-500/50' : 'bg-white/20 text-white hover:bg-white/30'}`}>{n}</button>
                ))}
              </motion.div>
              <div className={`flex justify-between w-full max-w-md mt-2 ${viewMode === 'mobile' ? 'text-[10px] px-1' : 'text-xs'} text-white/50`}><span>Not at all likely</span><span>Extremely likely</span></div>
              {templateSelectedChoices.length > 0 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6"><Button onClick={handleTemplateNext} className="rounded-xl px-8 py-3 font-semibold" style={{ backgroundColor: 'white', color: themeColor }}>Submit</Button></motion.div>}
            </div>
          </div>
        </div>
      );
    }

    // Rating - Stars (uses ratingCount from question)
    if (question.type === "rating") {
      const starCount = question.ratingCount || 5;
      const stars = Array.from({ length: starCount }, (_, i) => i + 1);
      
      return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
          <ViewToggleButton />
          <div className="relative overflow-hidden transition-all duration-300 flex flex-col items-center justify-center" style={{ background: layoutStyle === "elegant" ? themeColor : (isGradient ? backgroundStyle : themeColor), ...getContainerDimensions() }}>
            <div className="absolute top-6 left-6 text-white/40 text-sm tracking-[0.2em] uppercase">{brandName}</div>
            <div className="max-w-xl text-center px-8">
              <div className="mb-8">
                <EditableTitle className={`${viewMode === 'desktop' ? 'text-4xl' : 'text-2xl'} ${layoutStyle === 'elegant' ? 'font-light italic' : 'font-medium'} text-center`} />
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex gap-3 justify-center mb-4 flex-wrap">
                {stars.map(star => (
                  <button key={star} onClick={() => setTemplateSelectedChoices([String(star)])} className="transition-all hover:scale-110">
                    <Star className={`${viewMode === 'desktop' ? 'w-12 h-12' : 'w-8 h-8'}`} fill={Number(templateSelectedChoices[0]) >= star ? "#FFD700" : "transparent"} stroke={Number(templateSelectedChoices[0]) >= star ? "#FFD700" : "rgba(255,255,255,0.4)"} strokeWidth={1.5} />
                  </button>
                ))}
              </motion.div>
              <p className="text-white/50 text-sm mb-8">Tap to rate</p>
              {templateSelectedChoices.length > 0 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><Button onClick={handleTemplateNext} className={`px-8 py-3 font-medium ${layoutStyle === 'elegant' ? 'border-2 border-white/40 bg-transparent hover:border-white/60' : 'bg-white'}`} style={{ color: layoutStyle === 'elegant' ? 'white' : themeColor, borderRadius: layoutStyle === 'elegant' ? '0' : '12px' }}>Continue</Button></motion.div>}
            </div>
          </div>
        </div>
      );
    }

    // Text/Email/Phone/Short-text/Long-text input - Typeform style with question number and type label
    if (question.type === "text" || question.type === "email" || question.type === "phone" || question.type === "short-text" || question.type === "long-text") {
      const questionNumber = allQuestions ? allQuestions.findIndex(q => q.id === question.id) : 0;
      const isLongText = question.type === "long-text";
      const getTypeLabel = () => {
        switch(question.type) {
          case "email": return "Email";
          case "phone": return "Phone";
          case "long-text": return "Long text";
          default: return "Short text";
        }
      };
      const getTypeIcon = () => {
        switch(question.type) {
          case "email": return "✉";
          case "phone": return "📞";
          default: return "✎";
        }
      };

      // Minimal style - white background
      if (layoutStyle === "minimal") {
        return (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
            <ViewToggleButton />
            <div className="relative overflow-hidden transition-all duration-300 flex flex-col bg-white" style={{ ...getContainerDimensions() }}>
              <div className="p-6 text-gray-300 text-sm tracking-wider">{brandName}</div>
              <div className="flex-1 flex flex-col items-center justify-center px-12">
                <div className="w-full max-w-lg">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <span>{questionNumber} →</span>
                  </motion.div>
                  <div className="mb-6">
                    <EditableTitle className={`${viewMode === 'desktop' ? 'text-3xl' : 'text-xl'} font-medium`} textColor="#111827" />
                  </div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    {isLongText ? (
                      <textarea placeholder={question.placeholder || "Type your answer here..."} className="w-full border-b-2 border-gray-200 focus:border-gray-900 bg-transparent pb-2 text-xl text-gray-900 placeholder-gray-400 outline-none transition-colors resize-none" rows={1} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                    ) : (
                      <input type={question.type === "email" ? "email" : question.type === "phone" ? "tel" : "text"} placeholder={question.placeholder || "Type your answer here..."} className="w-full border-b-2 border-gray-200 focus:border-gray-900 bg-transparent pb-2 text-xl text-gray-900 placeholder-gray-400 outline-none transition-colors" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                    )}
                  </motion.div>
                  {inputValue && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-3">
                      <Button onClick={handleTemplateNext} className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 font-medium flex items-center gap-2" style={{ borderRadius: '4px' }}>
                        OK <Check className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Gradient/Bold/Modern style
      return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
          <ViewToggleButton />
          <div className="relative overflow-hidden transition-all duration-300 flex flex-col" style={{ background: isGradient ? backgroundStyle : themeColor, ...getContainerDimensions() }}>
            <div className="p-6 text-white/60 text-sm font-bold tracking-wider">{brandName}®</div>
            <div className="flex-1 flex flex-col items-center justify-center px-12">
              <div className="w-full max-w-lg">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-white/60 text-sm mb-4">
                  <span>{questionNumber} →</span>
                </motion.div>
                <div className="mb-6">
                  <EditableTitle className={`${viewMode === 'desktop' ? 'text-3xl' : 'text-xl'} ${layoutStyle === 'bold' ? 'font-black' : 'font-medium'}`} />
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  {isLongText ? (
                    <textarea placeholder={question.placeholder || "Type your answer here..."} className="w-full border-b-2 border-white/30 focus:border-white bg-transparent pb-2 text-xl text-white placeholder-white/50 outline-none transition-colors resize-none" rows={1} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                  ) : (
                    <input type={question.type === "email" ? "email" : question.type === "phone" ? "tel" : "text"} placeholder={question.placeholder || "Type your answer here..."} className="w-full border-b-2 border-white/30 focus:border-white bg-transparent pb-2 text-xl text-white placeholder-white/50 outline-none transition-colors" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                  )}
                </motion.div>
                {inputValue && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-3">
                    <Button onClick={handleTemplateNext} className="bg-white hover:bg-white/90 px-6 py-2.5 font-semibold flex items-center gap-2 rounded" style={{ color: themeColor }}>
                      OK <Check className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Choice questions - varies by layout style
    const choices = question.type === "yesno" ? ["Yes", "No"] : (question.choices || []);
    
    // Minimal style - white background with bordered choices
    if (layoutStyle === "minimal") {
      return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
          <ViewToggleButton />
          <div className="relative overflow-hidden transition-all duration-300 flex flex-col bg-white" style={{ ...getContainerDimensions() }}>
            <div className="p-6 text-gray-300 text-sm tracking-wider">{brandName}</div>
            <div className="flex-1 flex flex-col justify-center px-12 max-w-xl">
              <div className="mb-8">
                <EditableTitle className={`${viewMode === 'desktop' ? 'text-3xl' : 'text-xl'} font-medium`} textColor="#111827" />
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
                {choices.map((choice, index) => (
                  <button key={index} onClick={() => handleTemplateChoiceSelect(choice)} className={`w-full text-left px-5 py-4 border-2 transition-all ${templateSelectedChoices.includes(choice) ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                    <span className="text-gray-900">{choice}</span>
                  </button>
                ))}
              </motion.div>
              {templateSelectedChoices.length > 0 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6"><Button onClick={handleTemplateNext} className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 font-medium" style={{ borderRadius: '0' }}>Continue</Button></motion.div>}
            </div>
          </div>
        </div>
      );
    }

    // Gradient/Bold/Modern - centered with pill choices
    if (isGradient) {
      return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
          <ViewToggleButton />
          <div className="relative overflow-hidden transition-all duration-300 flex flex-col items-center justify-center" style={{ background: backgroundStyle, ...getContainerDimensions() }}>
            <div className="absolute top-6 left-6 text-white/60 text-sm font-bold tracking-wider">{brandName}®</div>
            <div className="max-w-2xl text-center px-8">
              <div className="mb-10">
                <EditableTitle className={`${viewMode === 'desktop' ? 'text-4xl' : 'text-2xl'} ${layoutStyle === 'bold' ? 'font-black' : 'font-semibold'} text-center`} />
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-3">
                {choices.map((choice, index) => (
                  <button key={index} onClick={() => handleTemplateChoiceSelect(choice)} className={`px-6 py-3 rounded-xl text-base font-medium transition-all ${templateSelectedChoices.includes(choice) ? 'bg-white text-gray-900 shadow-xl scale-105' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'}`}>{choice}</button>
                ))}
              </motion.div>
              {templateSelectedChoices.length > 0 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10"><Button onClick={handleTemplateNext} className="bg-white hover:bg-white/90 px-10 py-4 text-lg font-bold rounded-xl shadow-xl" style={{ color: themeColor }}>Continue</Button></motion.div>}
            </div>
          </div>
        </div>
      );
    }

    // Elegant style - sophisticated with outline choices
    if (layoutStyle === "elegant") {
      return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
          <ViewToggleButton />
          <div className="relative overflow-hidden transition-all duration-300 flex flex-col items-center justify-center" style={{ backgroundColor: themeColor, ...getContainerDimensions() }}>
            <div className="absolute top-6 left-6 text-white/40 text-sm tracking-[0.2em] uppercase">{brandName}</div>
            <div className="max-w-xl text-center px-8">
              <div className="mb-10">
                <EditableTitle className={`${viewMode === 'desktop' ? 'text-3xl' : 'text-xl'} font-light italic text-center`} />
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
                {choices.map((choice, index) => (
                  <button key={index} onClick={() => handleTemplateChoiceSelect(choice)} className={`w-full px-6 py-4 border transition-all ${templateSelectedChoices.includes(choice) ? 'border-white bg-white/10' : 'border-white/30 hover:border-white/60'}`}>
                    <span className="text-white font-light">{choice}</span>
                  </button>
                ))}
              </motion.div>
              {templateSelectedChoices.length > 0 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8"><Button onClick={handleTemplateNext} className="border-2 border-white/40 bg-transparent hover:border-white/60 text-white px-8 py-3 font-normal tracking-wider uppercase" style={{ borderRadius: '0' }}>Continue</Button></motion.div>}
            </div>
          </div>
        </div>
      );
    }

    // Glassmorphism style
    if (layoutStyle === "glassmorphism") {
      return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
          <ViewToggleButton />
          <div className="relative overflow-hidden transition-all duration-300" style={{ background: backgroundStyle, ...getContainerDimensions() }}>
            {getBackgroundImage() && <div className="absolute inset-0"><img src={getBackgroundImage()} alt="" className="w-full h-full object-cover opacity-30" /></div>}
            <div className="absolute top-6 left-6 text-white/80 text-sm tracking-wider z-10">{brandName}</div>
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="p-8 rounded-3xl max-w-lg w-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="mb-6">
                  <EditableTitle className={`${viewMode === 'desktop' ? 'text-2xl' : 'text-xl'} font-semibold text-center`} />
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                  {choices.map((choice, index) => (
                    <button key={index} onClick={() => handleTemplateChoiceSelect(choice)} className={`w-full px-5 py-3 rounded-xl transition-all ${templateSelectedChoices.includes(choice) ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>{choice}</button>
                  ))}
                </motion.div>
                {templateSelectedChoices.length > 0 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center"><Button onClick={handleTemplateNext} className="bg-white hover:bg-white/90 px-8 py-3 font-medium rounded-xl" style={{ color: themeColor }}>Continue</Button></motion.div>}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Get choice display style from question or default to 'list'
    const choiceDisplayStyle = question.choiceDisplayStyle || 'list';

    // Render choices based on display style
    const renderChoices = () => {
      const letterLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      
      switch (choiceDisplayStyle) {
        case 'pills':
          // Pills style - rounded buttons in a flex wrap layout
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3">
              {choices.map((choice, index) => (
                <button 
                  key={index} 
                  onClick={() => handleTemplateChoiceSelect(choice)} 
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    templateSelectedChoices.includes(choice) 
                      ? 'bg-white text-gray-900 shadow-lg scale-105' 
                      : 'bg-white/15 text-white hover:bg-white/25 border border-white/30'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </motion.div>
          );
        
        case 'grid':
          // Grid style - 2 columns layout
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`grid ${viewMode === 'desktop' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {choices.map((choice, index) => (
                <button 
                  key={index} 
                  onClick={() => handleTemplateChoiceSelect(choice)} 
                  className={`px-4 py-3 rounded-xl text-left transition-all ${
                    templateSelectedChoices.includes(choice) 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <span className="text-sm font-medium">{choice}</span>
                </button>
              ))}
            </motion.div>
          );
        
        case 'cards':
          // Outline style - rounded pills with circular letter badges
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
              {choices.map((choice, index) => (
                <button 
                  key={index} 
                  onClick={() => handleTemplateChoiceSelect(choice)} 
                  className={`inline-flex items-center gap-3 px-5 py-3 transition-all ${
                    templateSelectedChoices.includes(choice) 
                      ? 'bg-white/20' 
                      : 'bg-transparent hover:bg-white/10'
                  }`}
                  style={{
                    border: templateSelectedChoices.includes(choice) ? '2px solid white' : '2px solid rgba(255,255,255,0.6)',
                    borderRadius: '40px'
                  }}
                >
                  <span 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{
                      border: '2px solid rgba(255,255,255,0.6)',
                      color: 'white',
                      backgroundColor: 'transparent'
                    }}
                  >
                    {letterLabels[index] || index + 1}
                  </span>
                  <span className="text-white text-lg" style={{ fontFamily: 'Georgia, serif' }}>{choice}</span>
                </button>
              ))}
            </motion.div>
          );
        
        case 'list':
        default:
          // List style - vertical list with letter labels
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
              {choices.map((choice, index) => (
                <button 
                  key={index} 
                  onClick={() => handleTemplateChoiceSelect(choice)} 
                  className={`w-full max-w-md flex items-center gap-3 text-left px-4 py-3.5 rounded-lg transition-all ${
                    templateSelectedChoices.includes(choice) 
                      ? 'bg-white/25 border-white/50' 
                      : 'bg-white/10 hover:bg-white/15 border-transparent'
                  } border`}
                >
                  <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                    templateSelectedChoices.includes(choice) 
                      ? 'bg-white text-gray-900' 
                      : 'bg-white/20 text-white'
                  }`}>
                    {letterLabels[index] || index + 1}
                  </span>
                  <span className="text-white text-sm">{choice}</span>
                </button>
              ))}
            </motion.div>
          );
      }
    };

    // Default typeform style - split layout
    return (
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100" onClick={handleContainerClick}>
        <ViewToggleButton />
        <div className="relative overflow-hidden transition-all duration-300 flex" style={{ backgroundColor: themeColor, ...getContainerDimensions() }}>
          {viewMode === 'desktop' && getBackgroundImage() && (
            <div className="w-1/2 h-full relative overflow-hidden">
              <div className="absolute top-6 left-6 z-10 text-white/90 text-sm tracking-wider">{brandName}®</div>
              <img src={getBackgroundImage()} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className={`${viewMode === 'desktop' && getBackgroundImage() ? 'w-1/2' : 'w-full'} h-full flex flex-col justify-center p-8`}>
            {(!getBackgroundImage() || viewMode === 'mobile') && <div className="text-white/70 text-sm tracking-wider mb-4">{brandName}®</div>}
            {/* Question number indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white/60 text-sm font-medium">{question.number}</span>
              <span className="text-amber-400">→</span>
            </div>
            <div className="mb-6">
              <EditableTitle className={`${viewMode === 'desktop' ? 'text-2xl' : 'text-xl'} font-medium`} />
            </div>
            {/* Badge indicator */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Multiple Choice
              </span>
            </div>
            {renderChoices()}
            {templateSelectedChoices.length > 0 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6"><Button variant="ghost" onClick={handleTemplateNext} className="rounded-lg px-6 py-2.5 font-medium hover:opacity-90" style={{ backgroundColor: 'white', color: themeColor }}>OK</Button></motion.div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobileResponsive ? "w-full h-full relative overflow-hidden" : "flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100"} onClick={handleContainerClick}>
      {/* Toggle button now handled in the builder */}

      <div 
        className="relative overflow-hidden transition-all duration-300" 
        style={{ 
          backgroundColor: theme.backgroundColor, 
          ...getContainerDimensions() 
        }}
      >
        {/* Background image from question settings */}
        {(() => {
          // Check if we should use the welcome screen's background for all screens
          const welcomeQuestion = allQuestions.find(q => q.type === 'welcome');
          const applyToAll = welcomeQuestion?.applyBackgroundToAll;
          
          let bgImage: string | undefined;
          let overlayOpacity: number | undefined;
          
          if (applyToAll && welcomeQuestion) {
            // Use welcome screen's background for all questions
            bgImage = viewMode === 'mobile' && welcomeQuestion.backgroundImageMobile 
              ? welcomeQuestion.backgroundImageMobile 
              : welcomeQuestion.backgroundImage;
            overlayOpacity = welcomeQuestion.overlayOpacity;
          } else {
            // Use the current question's background
            bgImage = viewMode === 'mobile' && question.backgroundImageMobile 
              ? question.backgroundImageMobile 
              : question.backgroundImage;
            overlayOpacity = question.overlayOpacity;
          }
          
          if (!bgImage) return null;
          
          return (
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Optional overlay for better text readability */}
              <div 
                className="absolute inset-0" 
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  opacity: overlayOpacity !== undefined ? overlayOpacity / 100 : 0.3
                }} 
              />
            </div>
          );
        })()}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full relative z-10"
          >
            {question.type === "welcome" ? (
              <div
                className="flex w-full h-full"
                style={{
                  alignItems: viewMode === "desktop" && (question.desktopLayout === "desktop-left-right" || !question.desktopLayout) ? "flex-start" : viewMode === "desktop" ? "center" : "flex-start",
                  justifyContent: viewMode === "desktop" ? "center" : "flex-start",
                  padding: "0",
                }}
              >
                {(() => {
                  const desktopLayout = question.desktopLayout || "desktop-left-right";
                  const mobileLayout = question.mobileLayout || "mobile-vertical";
                  const currentLayout = viewMode === "desktop" ? desktopLayout : mobileLayout;

                  // Image component with upload functionality
                  const baseSize = viewMode === 'desktop' ? 320 : currentLayout === 'mobile-horizontal' ? 140 : 280;
                  const scaledSize = baseSize * (imageSettings.size / 100);
                  
                  const ImageBlock = () => (
                    <div
                      className="overflow-hidden relative group"
                      style={{ 
                        borderRadius: `${imageSettings.borderRadius}px`,
                        width: `${scaledSize}px`,
                        height: `${scaledSize}px`,
                        maxWidth: '100%',
                        flexShrink: 0,
                        border: imageSettings.borderWidth > 0 ? `${imageSettings.borderWidth}px solid ${imageSettings.borderColor}` : 'none',
                      }}
                    >
                      {uploadedImage ? (
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                          style={{
                            transform: `rotate(${imageSettings.rotation}deg) scaleX(${imageSettings.flipH ? -1 : 1}) scaleY(${imageSettings.flipV ? -1 : 1})`,
                            transition: 'transform 0.3s ease'
                          }}
                        />
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <Upload className="w-12 h-12 mb-3" style={{ color: theme.accentColor }} />
                          <p className="text-sm font-medium" style={{ color: theme.accentColor }}>
                            Upload Image
                          </p>
                          <p className="text-xs mt-1" style={{ color: theme.textSecondaryColor }}>
                            Click to browse
                          </p>
                        </div>
                      )}
                      
                      {/* Boutons toujours visibles au survol */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10">
                        <button
                          onClick={() => setShowEditorModal(true)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(61, 55, 49, 0.9)' }}
                          title="Éditer l'image"
                        >
                          <Edit3 className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => {
                            setUploadedImage(null);
                            setImageSettings(defaultSettings);
                            if (question) onUpdateQuestion(question.id, { image: undefined, imageSettings: undefined });
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 bg-red-500 hover:bg-red-600"
                          title="Supprimer l'image"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  );

                  // Text content component  
                  const alignment = question.welcomeDisplayStyle || 'left';
                  const alignmentTextClass = alignment === 'center' || alignment === 'centered' ? 'text-center items-center' : alignment === 'right' ? 'text-right items-end' : 'text-left items-start';
                  
                  const TextContent = ({ centered = false }: { centered?: boolean }) => {
                    const titleWidth = question.titleWidth || 100;
                    const subtitleWidth = question.subtitleWidth || 100;
                    
                    return (
                    <div className={`flex flex-col ${alignmentTextClass} overflow-visible`}>
                      {/* Title with resize handles */}
                      <div 
                        className="relative group"
                        style={{ 
                          width: `${titleWidth}%`, 
                          transition: isResizingTitle ? 'none' : 'width 0.15s ease-out',
                          display: 'inline-block',
                          marginBottom: '16px'
                        }}
                      >
                        {/* Mini resize handles */}
                        {!isReadOnly && (
                          <>
                            <ResizeHandle side="left" onMouseDown={(e) => handleTitleResizeStart(e, 'left')} isResizing={isResizingTitle} />
                            <ResizeHandle side="right" onMouseDown={(e) => handleTitleResizeStart(e, 'right')} isResizing={isResizingTitle} />
                          </>
                        )}

                        {editingField === 'welcome-title' && (
                          <>
                            <div className="absolute -top-3 right-0 flex items-center gap-1 z-50 animate-fade-in">
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { setVariableTarget('title'); setShowVariableMenu((open) => !open); setMenuView('main'); }}
                                className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
                                style={{ 
                                  backgroundColor: 'rgba(245, 184, 0, 0.15)',
                                  color: '#F5B800',
                                  backdropFilter: 'blur(8px)'
                                }}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              {question.title && (
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => onUpdateQuestion(question.id, { title: '' })}
                                  className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
                                  style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    color: '#ef4444',
                                    backdropFilter: 'blur(8px)',
                                  }}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

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
                                      <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Améliorer le texte avec l'IA</div>
                                    </button>
                                    <button
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => setMenuView('variables')}
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
                                      onClick={() => setMenuView('main')}
                                      className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/10 mb-2"
                                    >
                                      <div className="text-xs" style={{ color: '#A89A8A' }}>← Retour</div>
                                    </button>
                                    {availableVariables.map((variable) => (
                                      <button
                                        key={variable.key}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => insertVariable(variable.key)}
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
                          data-text-editable="title"
                          className={`${!isReadOnly ? 'cursor-text' : ''} transition-opacity`}
                          style={{ 
                            color: question.titleStyle?.textColor || theme.buttonColor,
                            fontFamily: question.titleStyle?.fontFamily || getFontFamily(theme.headingFontFamily),
                            fontSize: question.titleStyle?.fontSize ? `${question.titleStyle.fontSize}px` : '2.25rem',
                            fontWeight: question.titleStyle?.isBold ? 'bold' : 'normal',
                            fontStyle: question.titleStyle?.isItalic ? 'italic' : 'normal',
                            textDecoration: question.titleStyle?.isUnderline ? 'underline' : 'none',
                            textAlign: question.titleStyle?.textAlign || (alignment === 'center' || alignment === 'centered' ? 'center' : alignment === 'right' ? 'right' : 'left'),
                            outline: !isReadOnly && editingField === 'welcome-title' ? '2px solid rgba(245, 202, 60, 0.5)' : 'none',
                            padding: '4px',
                            margin: '-4px',
                            borderRadius: '4px',
                            userSelect: 'text',
                            WebkitUserSelect: 'text',
                          }}
                          contentEditable={!isReadOnly}
                          suppressContentEditableWarning
                          onFocus={() => !isReadOnly && setEditingField('welcome-title')}
                          onBlur={(e) => {
                            if (!isReadOnly) {
                              // Save HTML to preserve inline styles
                              const html = e.currentTarget.innerHTML;
                              onUpdateQuestion(question.id, { 
                                title: e.currentTarget.textContent || '',
                                titleHtml: html 
                              });
                              // Delay clearing to check if focus moved to toolbar
                              setTimeout(() => {
                                const activeEl = document.activeElement;
                                if (!activeEl?.closest('.text-toolbar') && !activeEl?.closest('.floating-toolbar')) {
                                  setEditingField(null);
                                }
                              }, 100);
                            }
                          }}
                          dangerouslySetInnerHTML={{ __html: question.titleHtml || question.title }}
                        />
                      </div>
                      
                      {/* Subtitle with resize handles */}
                      <div 
                        className="relative group"
                        style={{ 
                          width: `${subtitleWidth}%`, 
                          transition: isResizingSubtitle ? 'none' : 'width 0.15s ease-out',
                          display: 'inline-block',
                          marginBottom: '32px'
                        }}
                      >
                        {/* Mini resize handles */}
                        {!isReadOnly && (
                          <>
                            <ResizeHandle side="left" onMouseDown={(e) => handleSubtitleResizeStart(e, 'left')} isResizing={isResizingSubtitle} />
                            <ResizeHandle side="right" onMouseDown={(e) => handleSubtitleResizeStart(e, 'right')} isResizing={isResizingSubtitle} />
                          </>
                        )}

                        {!isReadOnly && editingField === 'welcome-subtitle' && (
                          <>
                            <div className="absolute -top-3 right-0 flex items-center gap-1 z-50 animate-fade-in">
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { setVariableTarget('subtitle'); setShowVariableMenu((open) => !open); setMenuView('main'); }}
                                className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
                                style={{ 
                                  backgroundColor: 'rgba(245, 184, 0, 0.15)',
                                  color: '#F5B800',
                                  backdropFilter: 'blur(8px)'
                                }}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              {question.subtitle && (
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => onUpdateQuestion(question.id, { subtitle: '' })}
                                  className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
                                  style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    color: '#ef4444',
                                    backdropFilter: 'blur(8px)',
                                  }}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

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
                                      <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>Améliorer le texte avec l'IA</div>
                                    </button>
                                    <button
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => setMenuView('variables')}
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
                                      onClick={() => setMenuView('main')}
                                      className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/10 mb-2"
                                    >
                                      <div className="text-xs" style={{ color: '#A89A8A' }}>← Retour</div>
                                    </button>
                                    {availableVariables.map((variable) => (
                                      <button
                                        key={variable.key}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => insertVariable(variable.key)}
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
                          data-text-editable="subtitle"
                          className={`${!isReadOnly ? 'cursor-text' : ''} transition-opacity`}
                          style={{ 
                            color: question.subtitleStyle?.textColor || theme.textSecondaryColor,
                            fontFamily: question.subtitleStyle?.fontFamily || getFontFamily(theme.fontFamily),
                            fontSize: question.subtitleStyle?.fontSize ? `${question.subtitleStyle.fontSize}px` : '1.125rem',
                            fontWeight: question.subtitleStyle?.isBold ? 'bold' : 'normal',
                            fontStyle: question.subtitleStyle?.isItalic ? 'italic' : 'normal',
                            textDecoration: question.subtitleStyle?.isUnderline ? 'underline' : 'none',
                            textAlign: question.subtitleStyle?.textAlign || (alignment === 'center' || alignment === 'centered' ? 'center' : alignment === 'right' ? 'right' : 'left'),
                            opacity: 0.9,
                            outline: !isReadOnly && editingField === 'welcome-subtitle' ? '2px solid rgba(184, 168, 146, 0.5)' : 'none',
                            padding: '4px',
                            margin: '-4px',
                            borderRadius: '4px',
                            userSelect: 'text',
                            WebkitUserSelect: 'text',
                          }}
                          contentEditable={!isReadOnly}
                          suppressContentEditableWarning
                          onFocus={() => !isReadOnly && setEditingField('welcome-subtitle')}
                          onBlur={(e) => {
                            if (!isReadOnly) {
                              // Save HTML to preserve inline styles
                              const html = e.currentTarget.innerHTML;
                              onUpdateQuestion(question.id, { 
                                subtitle: e.currentTarget.textContent || '',
                                subtitleHtml: html 
                              });
                              // Delay clearing to check if focus moved to toolbar
                              setTimeout(() => {
                                const activeEl = document.activeElement;
                                if (!activeEl?.closest('.text-toolbar') && !activeEl?.closest('.floating-toolbar')) {
                                  setEditingField(null);
                                }
                              }, 100);
                            }
                          }}
                          dangerouslySetInnerHTML={{ __html: question.subtitleHtml || question.subtitle || '' }}
                        />
                      </div>
                      
                      <button
                        onClick={onNext}
                        className="flex items-center justify-center font-medium transition-all hover:opacity-90"
                        style={unifiedButtonStyles}
                      >
                        <span>{question.buttonText || "Commencer"}</span>
                      </button>
                    </div>
                  );
                  };

                  // Desktop layouts
                  if (viewMode === 'desktop') {
                    // Horizontal alignment for the whole content block
                    const horizontalAlign = alignment === 'center' || alignment === 'centered' ? 'items-center' : alignment === 'right' ? 'items-end' : 'items-start';
                    const justifyContent = alignment === 'center' || alignment === 'centered' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start';
                    
                    if (desktopLayout === 'desktop-left-right') {
                      const align = question.splitAlignment || 'left';
                      const alignmentClass =
                        align === 'center'
                          ? 'items-center'
                          : align === 'right'
                          ? 'items-end'
                          : 'items-start';
                      const textContainerClass =
                        align === 'center'
                          ? 'max-w-[700px] mx-auto'
                          : align === 'right'
                          ? 'max-w-[700px] ml-auto'
                          : 'max-w-[700px]';

                      return (
                        <div className={`w-full h-full flex ${justifyContent} justify-start overflow-y-auto scrollbar-hide`} style={{ padding: '35px 75px' }}>
                          <div className={`flex flex-col ${horizontalAlign} gap-10 max-w-[700px] overflow-visible`}>
                            {(question.showImage !== false) && <ImageBlock />}
                            <TextContent />
                          </div>
                        </div>
                      );
                    } else if (desktopLayout === 'desktop-right-left') {
                      // Stack: Texte à gauche, Image petite à droite (sur la même ligne)
                      return (
                        <div className={`w-full h-full flex ${justifyContent} items-center px-24`}>
                          <div className="max-w-[900px] flex items-center gap-16">
                            <div className="max-w-[500px]">
                              <TextContent />
                            </div>
                            {(question.showImage !== false) && <ImageBlock />}
                          </div>
                        </div>
                      );
                    } else if (desktopLayout === 'desktop-centered') {
                      // Centered: Image à gauche, Texte à droite (comme split)
                      return (
                        <div className={`w-full h-full flex ${justifyContent} items-center px-24`}>
                          <div className="max-w-[900px] flex items-center gap-16">
                            {(question.showImage !== false) && <ImageBlock />}
                            <div className="max-w-[500px]">
                              <TextContent />
                            </div>
                          </div>
                        </div>
                      );
                    } else if (desktopLayout === 'desktop-split') {
                      // Wallpaper: Image en fond, texte en overlay
                      return (
                        <div className="absolute inset-0">
                          {uploadedImage ? (
                            <img
                              src={uploadedImage}
                              alt="Background"
                              className="absolute inset-0 w-full h-full object-cover"
                              style={{
                                transform: `rotate(${imageRotation}deg)`,
                                transition: 'transform 0.3s ease'
                              }}
                            />
                          ) : (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <Upload className="w-16 h-16 mb-4" style={{ color: '#F5B800' }} />
                              <p className="text-lg font-medium" style={{ color: '#F5B800' }}>
                                Upload Background Image
                              </p>
                              <p className="text-sm mt-2" style={{ color: '#A89A8A' }}>
                                Click to browse
                              </p>
                            </div>
                          )}
                          <div 
                            className="absolute inset-0 bg-black" 
                            style={{ opacity: question.overlayOpacity ?? 0.6 }}
                          />
                          {uploadedImage && (
                            <div className="absolute top-4 right-4 z-20 opacity-0 hover:opacity-100 transition-opacity flex items-center gap-2">
                              <button
                                onClick={() => setShowUploadModal(true)}
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                                title="Change image"
                              >
                                <ImagePlus className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                              </button>
                              <button
                                onClick={() => setShowEditorModal(true)}
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                                title="Edit image"
                              >
                                <Edit3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                              </button>
                            </div>
                          )}
                          <div className="relative z-10 flex items-center justify-center h-full px-16">
                            <div className="max-w-[700px] text-center">
                              <TextContent centered />
                            </div>
                          </div>
                        </div>
                      );
                    } else if (desktopLayout === 'desktop-card') {
                      // Card: Split 50/50 - Texte à gauche avec padding, Image à droite collée au bord
                      return (
                        <div className="relative w-full h-full flex">
                          <div className="w-1/2 flex items-center justify-center px-24 z-10">
                            <div className="max-w-[500px]">
                              <TextContent />
                            </div>
                          </div>
                          <div className="absolute right-0 top-0 w-1/2 h-full group">
                            {uploadedImage ? (
                              <>
                                <img
                                  src={uploadedImage}
                                  alt="Feedback illustration"
                                  className="w-full h-full object-cover"
                                  style={{
                                    transform: `rotate(${imageRotation}deg)`,
                                    transition: 'transform 0.3s ease'
                                  }}
                                />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
                                  <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                    style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                                    title="Change image"
                                  >
                                    <ImagePlus className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                                  </button>
                                  <button
                                    onClick={() => setShowEditorModal(true)}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                    style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                                    title="Edit image"
                                  >
                                    <Edit3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <Upload className="w-16 h-16 mb-4" style={{ color: '#F5B800' }} />
                                <p className="text-lg font-medium" style={{ color: '#F5B800' }}>
                                  Upload Image
                                </p>
                                <p className="text-sm mt-2" style={{ color: '#A89A8A' }}>
                                  Click to browse
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    } else if (desktopLayout === 'desktop-panel') {
                      // Panel: Split 50/50 - Image à gauche collée au bord, Texte à droite avec padding
                      return (
                        <div className="relative w-full h-full flex">
                            <div className="absolute left-0 top-0 w-1/2 h-full group">
                              {uploadedImage ? (
                                <>
                                  <img
                                    src={uploadedImage}
                                    alt="Feedback illustration"
                                    className="w-full h-full object-cover"
                                    style={{
                                      transform: `rotate(${imageRotation}deg)`,
                                      transition: 'transform 0.3s ease'
                                    }}
                                  />
                                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
                                    <button
                                      onClick={() => setShowUploadModal(true)}
                                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                      style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                                      title="Change image"
                                    >
                                      <ImagePlus className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                                    </button>
                                    <button
                                      onClick={() => setShowEditorModal(true)}
                                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                      style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                                      title="Edit image"
                                    >
                                      <Edit3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                                    </button>
                                  </div>
                                </>
                            ) : (
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <Upload className="w-16 h-16 mb-4" style={{ color: '#F5B800' }} />
                                <p className="text-lg font-medium" style={{ color: '#F5B800' }}>
                                  Upload Image
                                </p>
                                <p className="text-sm mt-2" style={{ color: '#A89A8A' }}>
                                  Click to browse
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="w-1/2 ml-auto flex items-center justify-center px-24 z-10">
                            <div className="max-w-[500px]">
                              <TextContent />
                            </div>
                          </div>
                        </div>
                      );
                    }
                  }

                  // Mobile layouts
                  if (mobileLayout === 'mobile-vertical') {
                    const imageAlignment = alignment === 'center' || alignment === 'centered' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';
                    return (
                      <div className="flex flex-col gap-6 w-full max-w-[700px]" style={{ padding: '35px' }}>
                        <div className="flex w-full" style={{ justifyContent: imageAlignment }}>
                          {(question.showImage !== false) && <ImageBlock />}
                        </div>
                        <TextContent />
                      </div>
                    );
                  } else if (mobileLayout === 'mobile-text-top') {
                    return (
                      <div className="flex flex-col gap-6 w-full max-w-[700px]" style={{ padding: '35px' }}>
                        <div className="flex-1">
                          <TextContent />
                        </div>
                        {(question.showImage !== false) && <ImageBlock />}
                      </div>
                    );
                  } else if (mobileLayout === 'mobile-centered') {
                    return (
                      <div className="flex flex-col w-full h-full">
                        <div className="w-full relative group" style={{ height: '40%', minHeight: '250px' }}>
                          {uploadedImage ? (
                            <>
                              <img
                                src={uploadedImage}
                                alt="Banner"
                                className="w-full h-full object-cover"
                                style={{
                                  transform: `rotate(${imageRotation}deg)`,
                                  transition: 'transform 0.3s ease'
                                }}
                              />
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
                                <button
                                  onClick={() => setShowUploadModal(true)}
                                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                  style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                                  title="Change image"
                                >
                                  <ImagePlus className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                                </button>
                                <button
                                  onClick={() => setShowEditorModal(true)}
                                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                  style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                                  title="Edit image"
                                >
                                  <Edit3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <Upload className="w-12 h-12 mb-3" style={{ color: '#F5B800' }} />
                              <p className="text-sm font-medium" style={{ color: '#F5B800' }}>
                                Upload Banner
                              </p>
                              <p className="text-xs mt-1" style={{ color: '#A89A8A' }}>
                                Click to browse
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex items-start justify-center pt-6 pb-8" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
                          <div className="w-full max-w-[700px]">
                            <TextContent />
                          </div>
                        </div>
                      </div>
                    );
                  } else if (mobileLayout === 'mobile-minimal') {
                    return (
                      <div className="absolute inset-0">
                        {uploadedImage ? (
                          <img
                            src={uploadedImage}
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{
                              transform: `rotate(${imageRotation}deg)`,
                              transition: 'transform 0.3s ease'
                            }}
                          />
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Upload className="w-14 h-14 mb-3" style={{ color: '#F5B800' }} />
                            <p className="text-base font-medium" style={{ color: '#F5B800' }}>
                              Upload Background
                            </p>
                            <p className="text-sm mt-1" style={{ color: '#A89A8A' }}>
                              Click to browse
                            </p>
                          </div>
                        )}
                        <div 
                          className="absolute inset-0 bg-black" 
                          style={{ opacity: question.overlayOpacity ?? 0.6 }}
                        />
                        {uploadedImage && (
                          <div className="absolute top-4 right-4 z-20 opacity-0 hover:opacity-100 transition-opacity flex items-center gap-2">
                            <button
                              onClick={() => setShowUploadModal(true)}
                              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                              style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                              title="Change image"
                            >
                              <ImagePlus className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                            </button>
                            <button
                              onClick={() => setShowEditorModal(true)}
                              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                              style={{ backgroundColor: 'rgba(61, 55, 49, 0.85)' }}
                              title="Edit image"
                            >
                              <Edit3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                            </button>
                          </div>
                        )}
                        <div className="relative z-10 flex items-center justify-center h-full px-5 py-6">
                          <div className="max-w-[700px]">
                            <TextContent />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Fallback
                  return (
                    <div className="w-full h-full grid grid-cols-[auto_1fr] gap-16 items-center px-12">
                      {(question.showImage !== false) && <ImageBlock />}
                      <TextContent />
                    </div>
                  );
                })()}
              </div>
            ) : question.type === "text" || question.type === "email" || question.type === "phone" || question.type === "number" || question.type === "date" ? (
              <div className="w-full h-full flex items-center justify-center" style={{ padding: viewMode === 'desktop' ? '0 96px' : '0 20px', paddingLeft: '7%', paddingRight: '7%' }}>
                <div className="w-full max-w-[700px]">
                  <div className="mb-10">
                    {question.number && (
                      <div className="mb-5 font-semibold" style={{ color: '#F5B800', fontSize: viewMode === 'desktop' ? '18px' : '14px' }}>
                        {question.number} →
                      </div>
                    )}
                    <ResizableTextWrapper type="title">
                      <div className="relative">
                        {editingField === 'text-title' && (
                        <>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { setVariableTarget('title'); setShowVariableMenu((open) => !open); setMenuView('main'); }}
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
                                    onClick={() => {
                                      console.log('Réécriture AI');
                                    }}
                                    className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                                  >
                                    <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                      Réécriture
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                      Améliorer le texte avec l'IA
                                    </div>
                                  </button>
                                  <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setMenuView('variables')}
                                    className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                                  >
                                    <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                      Variable
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                      Insérer une variable dynamique
                                    </div>
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setMenuView('main')}
                                    className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/10 mb-2"
                                  >
                                    <div className="text-xs" style={{ color: '#A89A8A' }}>
                                      ← Retour
                                    </div>
                                  </button>
                                  {availableVariables.map((variable) => (
                                    <button
                                      key={variable.key}
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => insertVariable(variable.key)}
                                      className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                                    >
                                      <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                        {variable.label}
                                      </div>
                                      <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                        {variable.description} • {`{{${variable.key}}}`}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      <h2 
                        data-text-editable="title"
                        className="font-bold cursor-text hover:opacity-80 transition-opacity" 
                        style={{ 
                          color: question.titleStyle?.textColor || theme.buttonColor, 
                          fontFamily: question.titleStyle?.fontFamily || getFontFamily(theme.headingFontFamily),
                          fontWeight: question.titleStyle?.isBold ? 'bold' : 700, 
                          fontStyle: question.titleStyle?.isItalic ? 'italic' : 'normal',
                          textDecoration: question.titleStyle?.isUnderline ? 'underline' : 'none',
                          fontSize: question.titleStyle?.fontSize ? `${question.titleStyle.fontSize}px` : (viewMode === 'desktop' ? '56px' : '32px'),
                          lineHeight: '1.1',
                          letterSpacing: '-0.02em',
                          textAlign: question.titleStyle?.textAlign || 'left',
                          outline: editingField === 'text-title' ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
                          padding: '4px',
                          margin: '-4px',
                          borderRadius: '4px'
                        }}
                        contentEditable={!isReadOnly}
                        suppressContentEditableWarning
                        onFocus={() => !isReadOnly && setEditingField('text-title')}
                        onBlur={(e) => {
                          const html = e.currentTarget.innerHTML;
                          onUpdateQuestion(question.id, { 
                            title: e.currentTarget.textContent || '',
                            titleHtml: html 
                          });
                        }}
                        dangerouslySetInnerHTML={{ __html: question.titleHtml || question.title }}
                      />
                      </div>
                    </ResizableTextWrapper>
                  </div>
                  <form onSubmit={handleSubmit}>
                    {question.variant === 'long' ? (
                      <>
                        <Textarea
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={question.placeholder || "Type your answer here..."}
                          className="bg-transparent border-0 border-b-2 rounded-none text-2xl px-0 py-3 min-h-[200px] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#F5B800] placeholder:text-[#8B7E6E] resize-none transition-colors"
                          style={{ 
                            borderColor: '#F5B800',
                            color: '#F5B800'
                          }}
                          autoFocus
                        />
                      </>
                    ) : question.type === 'phone' ? (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              color: '#F5B800'
                            }}
                          >
                            <span className="text-2xl">{PHONE_COUNTRIES.find(c => c.code === selectedCountry)?.flag}</span>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          
                          {showCountryDropdown && (
                            <div 
                              className="absolute top-full left-0 mt-2 rounded-lg overflow-hidden z-10 max-h-[300px] overflow-y-auto"
                              style={{ 
                                backgroundColor: '#4A4138',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                minWidth: '250px'
                              }}
                            >
                              {PHONE_COUNTRIES.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(country.code);
                                    setShowCountryDropdown(false);
                                    if (question) {
                                      onUpdateQuestion(question.id, { phoneCountry: country.code });
                                    }
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-opacity-10 hover:bg-white transition-colors text-left"
                                  style={{ color: '#F5B800' }}
                                >
                                  <span className="text-xl">{country.flag}</span>
                                  <span className="flex-1">{country.name}</span>
                                  <span className="text-sm opacity-70">{country.dialCode}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          type="tel"
                          placeholder={question.placeholder || PHONE_COUNTRIES.find(c => c.code === selectedCountry)?.dialCode + ' (555) 000-0000'}
                          className="flex-1 bg-transparent border-0 border-b-2 rounded-none text-2xl px-0 py-5 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#F5B800] placeholder:text-[#8B7E6E] transition-colors"
                          style={{ 
                            borderColor: '#F5B800',
                            color: '#F5B800'
                          }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        type={
                          question.type === 'email' ? 'email' :
                          question.type === 'number' ? 'number' :
                          question.type === 'date' ? 'date' :
                          question.variant === 'number' ? 'number' : 
                          question.variant === 'date' ? 'date' : 
                          'text'
                        }
                        placeholder={
                          question.placeholder || (
                            question.type === 'email' ? 'name@example.com' :
                            question.type === 'number' ? 'Enter a number...' :
                            question.type === 'date' ? 'Select a date...' :
                            question.variant === 'number' ? 'Enter a number...' :
                            question.variant === 'date' ? 'Select a date...' :
                            question.variant === 'video' ? 'Upload video/audio or paste link...' :
                            'Type your answer here...'
                          )
                        }
                        className="bg-transparent border-0 border-b-2 rounded-none text-2xl px-0 py-5 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#F5B800] placeholder:text-[#8B7E6E] transition-colors"
                        style={{ 
                          borderColor: '#F5B800',
                          color: '#F5B800'
                        }}
                        autoFocus
                      />
                    )}
                    <div className="mt-8 flex items-center gap-4">
                      <Button
                        type="submit"
                        className="font-semibold hover:opacity-90 transition-opacity"
                        style={unifiedButtonStyles}
                      >
                        OK <span className="ml-1">✓</span>
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            ) : question.type === "rating" ? (
              <div className="w-full h-full flex items-center justify-center px-24" style={{ paddingLeft: '7%', paddingRight: '7%' }}>
                <div className="w-full max-w-[700px] relative">
                  {editingField === 'rating-title' && (
                    <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowVariableMenu(!showVariableMenu)}
                          className="absolute -top-2 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2" 
                        align="end"
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  <div className="mb-8">
                    {question.number && (
                      <div className="mb-4 font-semibold text-base" style={{ color: '#F5B800' }}>
                        {question.number} →
                      </div>
                    )}
                    <ResizableTextWrapper type="title">
                      <h2 
                        data-text-editable="title"
                        className="text-4xl font-bold leading-[1.1] cursor-text hover:opacity-80 transition-opacity" 
                        style={{ 
                          color: question.titleStyle?.textColor || theme.buttonColor, 
                          fontFamily: question.titleStyle?.fontFamily || getFontFamily(theme.headingFontFamily),
                          fontWeight: question.titleStyle?.isBold ? 'bold' : 700, 
                          fontStyle: question.titleStyle?.isItalic ? 'italic' : 'normal',
                          textDecoration: question.titleStyle?.isUnderline ? 'underline' : 'none',
                          fontSize: question.titleStyle?.fontSize ? `${question.titleStyle.fontSize}px` : undefined,
                          textAlign: question.titleStyle?.textAlign || 'left',
                          letterSpacing: '-0.02em',
                          outline: editingField === 'rating-title' ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
                          padding: '4px',
                          margin: '-4px',
                          borderRadius: '4px'
                        }}
                        contentEditable={!isReadOnly}
                        suppressContentEditableWarning
                        onFocus={() => !isReadOnly && setEditingField('rating-title')}
                        onBlur={(e) => {
                          if (!isReadOnly) {
                            const html = e.currentTarget.innerHTML;
                            onUpdateQuestion(question.id, { 
                              title: e.currentTarget.textContent || '',
                              titleHtml: html 
                            });
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: question.titleHtml || question.title }}
                      />
                    </ResizableTextWrapper>
                  </div>
                  <div className="flex gap-4">
                    {Array.from({ length: question.ratingCount || 5 }, (_, i) => i + 1).map((rating) => {
                      const getRatingIcon = () => {
                        const iconProps = {
                          size: 24,
                          fill: '#F5B800',
                          color: '#F5B800',
                          strokeWidth: 2
                        };

                        switch (question.ratingType) {
                          case 'smileys':
                            if (rating === 1) return <Frown {...iconProps} />;
                            if (rating === 2) return <Frown {...iconProps} fill="none" />;
                            if (rating === 3) return <Meh {...iconProps} />;
                            if (rating === 4) return <Smile {...iconProps} fill="none" />;
                            return <Smile {...iconProps} />;
                          case 'hearts':
                            return <Heart {...iconProps} />;
                          case 'thumbs':
                            return <ThumbsUp {...iconProps} />;
                          case 'numbers':
                            return <span className="text-2xl font-bold">{rating}</span>;
                          case 'stars':
                          default:
                            return <Star {...iconProps} />;
                        }
                      };

                      return (
                        <div
                          key={rating}
                          onMouseEnter={() => setHoveredRatingIndex(rating)}
                          onMouseLeave={() => setHoveredRatingIndex(null)}
                          className="relative w-16 h-16 rounded-xl transition-all flex items-center justify-center font-semibold cursor-default"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#FFFFFF'
                          }}
                        >
                          {/* Action buttons - on top border */}
                          <div 
                            className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
                            style={{
                              opacity: hoveredRatingIndex === rating ? 1 : 0,
                              transition: 'opacity 0.2s ease'
                            }}
                          >
                            <button
                              onClick={() => handleDeleteRating(rating)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                              style={{ 
                                backgroundColor: 'rgba(61, 55, 49, 0.9)',
                                border: '1px solid rgba(255,255,255,0.1)'
                              }}
                              title="Delete rating"
                            >
                              <X className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />
                            </button>
                            <button
                              onClick={() => {
                                setBranchingChoiceIndex(rating);
                                setShowBranchingModal(true);
                              }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                              style={{ 
                                backgroundColor: 'rgba(61, 55, 49, 0.9)',
                                border: '1px solid rgba(255,255,255,0.1)'
                              }}
                              title="Branching logic"
                            >
                              <GitBranch className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />
                            </button>
                            <button
                              onClick={() => {/* Custom logic for sparkles */}}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                              style={{ 
                                backgroundColor: 'rgba(245, 184, 0, 0.9)',
                                border: '1px solid rgba(255,255,255,0.1)'
                              }}
                              title="Customize rating"
                            >
                              <Sparkles className="w-3.5 h-3.5" style={{ color: '#3D3731' }} />
                            </button>
                          </div>
                          
                          {getRatingIcon()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : question.type === "choice" || question.type === "dropdown" || question.type === "yesno" || question.type === "picture-choice" ? (
              <div className="w-full h-full flex items-center justify-center" style={{ padding: viewMode === 'desktop' ? '0 96px' : '0 20px', paddingLeft: '7%', paddingRight: '7%' }}>
                <div className="w-full max-w-[700px] relative">
                  {editingField === 'choice-title' && (
                    <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowVariableMenu(!showVariableMenu)}
                          className="absolute -top-2 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2" 
                        align="end"
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  <div className="mb-10">
                    {question.number && (
                      <div className="mb-5 font-semibold" style={{ color: '#F5B800', fontSize: viewMode === 'desktop' ? '18px' : '14px' }}>
                        {question.number} →
                      </div>
                    )}
                    <ResizableTextWrapper type="title">
                      <h2 
                        data-text-editable="title"
                        className="font-bold cursor-text hover:opacity-80 transition-opacity" 
                        style={{ 
                        color: question.titleStyle?.textColor || theme.buttonColor, 
                        fontFamily: question.titleStyle?.fontFamily || getFontFamily(theme.headingFontFamily),
                        fontWeight: question.titleStyle?.isBold ? 'bold' : 700, 
                        fontStyle: question.titleStyle?.isItalic ? 'italic' : 'normal',
                        textDecoration: question.titleStyle?.isUnderline ? 'underline' : 'none',
                        fontSize: question.titleStyle?.fontSize ? `${question.titleStyle.fontSize}px` : (viewMode === 'desktop' ? '56px' : '32px'),
                        textAlign: question.titleStyle?.textAlign || 'left',
                        lineHeight: '1.1',
                          letterSpacing: '-0.02em',
                          outline: editingField === 'choice-title' ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
                        padding: '4px',
                        margin: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable={!isReadOnly}
                      suppressContentEditableWarning
                      onFocus={() => !isReadOnly && setEditingField('choice-title')}
                      onBlur={(e) => {
                        if (!isReadOnly) {
                          const html = e.currentTarget.innerHTML;
                          onUpdateQuestion(question.id, { 
                            title: e.currentTarget.textContent || '',
                            titleHtml: html 
                          });
                        }
                      }}
                      dangerouslySetInnerHTML={{ __html: question.titleHtml || question.title }}
                    />
                    </ResizableTextWrapper>
                  </div>
                  {/* Render choices based on choiceDisplayStyle */}
                  {(() => {
                    const displayStyle = question.choiceDisplayStyle || 'list';
                    const choices = question.choices || ["Yes", "No", "Sometimes"];
                    
                    // Action buttons component for each choice
                    const ChoiceActions = ({ index }: { index: number }) => (
                      <div 
                        className="absolute -top-3 right-4 flex items-center gap-1.5"
                        style={{
                          opacity: hoveredChoiceIndex === index ? 1 : 0,
                          transition: 'opacity 0.2s ease'
                        }}
                      >
                        <button
                          onClick={() => handleDeleteChoice(index)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(61, 55, 49, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                          title="Delete choice"
                        >
                          <X className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />
                        </button>
                        <button
                          onClick={() => { setBranchingChoiceIndex(index); setShowBranchingModal(true); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(61, 55, 49, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                          title="Branching logic"
                        >
                          <GitBranch className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />
                        </button>
                        <button
                          onClick={() => {/* Custom logic */}}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(245, 184, 0, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                          title="Customize choice"
                        >
                          <Sparkles className="w-3.5 h-3.5" style={{ color: '#3D3731' }} />
                        </button>
                      </div>
                    );

                    switch (displayStyle) {
                      case 'pills':
                        return (
                          <div className="flex flex-wrap gap-3">
                            {choices.map((choice, index) => (
                              <div
                                key={index}
                                onMouseEnter={() => setHoveredChoiceIndex(index)}
                                onMouseLeave={() => setHoveredChoiceIndex(null)}
                                className="relative group px-5 py-3 rounded-full transition-all"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.15)',
                                  border: editingChoiceIndex === index ? '2px solid rgba(245, 184, 0, 0.5)' : '1px solid rgba(255,255,255,0.3)'
                                }}
                              >
                                <ChoiceActions index={index} />
                                <span 
                                  className={`text-base font-medium ${!isReadOnly ? 'cursor-text hover:opacity-80' : ''} transition-opacity`}
                                  style={{ color: '#FFFFFF', outline: 'none' }}
                                  contentEditable={!isReadOnly}
                                  suppressContentEditableWarning
                                  onFocus={() => !isReadOnly && setEditingChoiceIndex(index)}
                                  onBlur={(e) => !isReadOnly && handleChoiceBlur(index, e.currentTarget.textContent || '')}
                                >
                                  {choice}
                                </span>
                              </div>
                            ))}
                          </div>
                        );

                      case 'grid':
                        return (
                          <div className={`grid ${viewMode === 'desktop' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                            {choices.map((choice, index) => (
                              <div
                                key={index}
                                onMouseEnter={() => setHoveredChoiceIndex(index)}
                                onMouseLeave={() => setHoveredChoiceIndex(null)}
                                className="relative group p-4 rounded-xl transition-all"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  border: editingChoiceIndex === index ? '2px solid rgba(245, 184, 0, 0.5)' : '1px solid rgba(255,255,255,0.2)'
                                }}
                              >
                                <ChoiceActions index={index} />
                                <span 
                                  className={`text-base font-medium ${!isReadOnly ? 'cursor-text hover:opacity-80' : ''} transition-opacity`}
                                  style={{ color: '#FFFFFF', outline: 'none' }}
                                  contentEditable={!isReadOnly}
                                  suppressContentEditableWarning
                                  onFocus={() => !isReadOnly && setEditingChoiceIndex(index)}
                                  onBlur={(e) => !isReadOnly && handleChoiceBlur(index, e.currentTarget.textContent || '')}
                                >
                                  {choice}
                                </span>
                              </div>
                            ))}
                          </div>
                        );

                      case 'cards':
                        // Outline style - rounded pills with letter badges in circles (vertical layout)
                        return (
                          <div className="flex flex-col gap-3">
                            {choices.map((choice, index) => (
                              <div
                                key={index}
                                onMouseEnter={() => setHoveredChoiceIndex(index)}
                                onMouseLeave={() => setHoveredChoiceIndex(null)}
                                className="relative group inline-flex items-center gap-3 px-5 py-3 transition-all cursor-pointer w-fit"
                                style={{
                                  border: editingChoiceIndex === index ? '2px solid rgba(245, 184, 0, 0.8)' : '2px solid rgba(255,255,255,0.5)',
                                  borderRadius: '40px',
                                  backgroundColor: 'transparent'
                                }}
                              >
                                <ChoiceActions index={index} />
                                <span 
                                  className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0" 
                                  style={{ 
                                    border: '2px solid rgba(255,255,255,0.5)', 
                                    color: '#FFFFFF',
                                    backgroundColor: 'transparent'
                                  }}
                                >
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span 
                                  className={`text-lg ${!isReadOnly ? 'cursor-text hover:opacity-80' : ''} transition-opacity pr-2`}
                                  style={{ color: '#FFFFFF', outline: 'none', fontFamily: 'Georgia, serif' }}
                                  contentEditable={!isReadOnly}
                                  suppressContentEditableWarning
                                  onFocus={() => !isReadOnly && setEditingChoiceIndex(index)}
                                  onBlur={(e) => !isReadOnly && handleChoiceBlur(index, e.currentTarget.textContent || '')}
                                >
                                  {choice}
                                </span>
                              </div>
                            ))}
                          </div>
                        );

                      case 'list':
                      default:
                        return (
                          <div className="space-y-4">
                            {choices.map((choice, index) => (
                              <div
                                key={index}
                                onMouseEnter={() => setHoveredChoiceIndex(index)}
                                onMouseLeave={() => setHoveredChoiceIndex(null)}
                                className="relative group w-full p-5 rounded-xl transition-all flex items-center gap-5 text-left"
                                style={{
                                  backgroundColor: theme.backgroundColor === '#ffffff' ? '#f5f5f5' : 'rgba(255,255,255,0.1)',
                                  border: editingChoiceIndex === index ? '2px solid rgba(26, 26, 26, 0.5)' : `1px solid ${theme.borderColor}`
                                }}
                              >
                                <ChoiceActions index={index} />
                                <span className="font-semibold text-base" style={{ color: theme.accentColor }}>
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span 
                                  className={`flex-1 text-xl font-medium ${!isReadOnly ? 'cursor-text hover:opacity-80' : ''} transition-opacity`}
                                  style={{ color: theme.textColor, outline: 'none', padding: '4px', margin: '-4px', borderRadius: '4px' }}
                                  contentEditable={!isReadOnly}
                                  suppressContentEditableWarning
                                  onFocus={() => !isReadOnly && setEditingChoiceIndex(index)}
                                  onBlur={(e) => !isReadOnly && handleChoiceBlur(index, e.currentTarget.textContent || '')}
                                >
                                  {choice}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                    }
                  })()}
                </div>
              </div>
            ) : question.type === "file" ? (
              <div className="w-full h-full flex items-center justify-center" style={{ padding: viewMode === 'desktop' ? '0 96px' : '0 20px', paddingLeft: '7%', paddingRight: '7%' }}>
                <div className="w-full max-w-[700px] relative">
                  {editingField === 'file-title' && (
                    <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowVariableMenu(!showVariableMenu)}
                          className="absolute -top-2 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2" 
                        align="end"
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  <div className="mb-10">
                    {question.number && (
                      <div className="mb-5 font-semibold text-lg" style={{ color: '#F5B800' }}>
                        {question.number} →
                      </div>
                    )}
                    <ResizableTextWrapper type="title">
                      <h2 
                        data-text-editable="title"
                        className="font-bold cursor-text hover:opacity-80 transition-opacity" 
                        style={{ 
                        color: question.titleStyle?.textColor || theme.buttonColor, 
                        fontFamily: question.titleStyle?.fontFamily || getFontFamily(theme.headingFontFamily),
                        fontWeight: question.titleStyle?.isBold ? 'bold' : 700, 
                        fontStyle: question.titleStyle?.isItalic ? 'italic' : 'normal',
                        textDecoration: question.titleStyle?.isUnderline ? 'underline' : 'none',
                        fontSize: question.titleStyle?.fontSize ? `${question.titleStyle.fontSize}px` : (viewMode === 'desktop' ? '56px' : '32px'),
                        textAlign: question.titleStyle?.textAlign || 'left',
                        lineHeight: '1.1',
                          letterSpacing: '-0.02em',
                          outline: editingField === 'file-title' ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
                          padding: '4px',
                          margin: '-4px',
                          borderRadius: '4px'
                        }}
                        contentEditable={!isReadOnly}
                        suppressContentEditableWarning
                        onFocus={() => !isReadOnly && setEditingField('file-title')}
                        onBlur={(e) => {
                          if (!isReadOnly) {
                            const html = e.currentTarget.innerHTML;
                            onUpdateQuestion(question.id, { 
                              title: e.currentTarget.textContent || '',
                              titleHtml: html 
                            });
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: question.titleHtml || question.title }}
                      />
                    </ResizableTextWrapper>
                  </div>
                  <div 
                    className="border-2 border-dashed rounded-xl p-12 text-center transition-all"
                    style={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }}
                  >
                    <Upload className="w-16 h-16 mx-auto mb-4" style={{ color: '#F5B800' }} />
                    <p className="text-xl mb-2" style={{ color: '#FFFFFF' }}>
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm" style={{ color: '#A89A8A' }}>
                      {question.fileTypes?.join(', ') || 'Any file type'} • Max {question.maxFileSize || 10}MB
                    </p>
                  </div>
                </div>
              </div>
            ) : question.type === "statement" ? (
              <div className="w-full h-full flex items-center justify-center" style={{ padding: viewMode === 'desktop' ? '0 96px' : '0 20px', paddingLeft: '7%', paddingRight: '7%' }}>
                <div className="w-full max-w-[700px] text-center relative">
                  {(editingField === 'statement-title' || editingField === 'statement-subtitle') && (
                    <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowVariableMenu(!showVariableMenu)}
                          className="absolute -top-2 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2 z-50" 
                        align="end"
                        side="bottom"
                        sideOffset={8}
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  <ResizableTextWrapper type="title" marginBottom="16px">
                    <h2
                      data-text-editable="title"
                      className="font-bold cursor-text hover:opacity-80 transition-opacity"
                      style={{ 
                      color: question.titleStyle?.textColor || theme.buttonColor, 
                      fontFamily: question.titleStyle?.fontFamily || getFontFamily(theme.headingFontFamily),
                      fontWeight: question.titleStyle?.isBold ? 'bold' : 700, 
                      fontStyle: question.titleStyle?.isItalic ? 'italic' : 'normal',
                      textDecoration: question.titleStyle?.isUnderline ? 'underline' : 'none',
                      fontSize: question.titleStyle?.fontSize ? `${question.titleStyle.fontSize}px` : (viewMode === 'desktop' ? '56px' : '32px'),
                      textAlign: question.titleStyle?.textAlign || 'left',
                      lineHeight: '1.1',
                        letterSpacing: '-0.02em',
                        outline: editingField === 'statement-title' ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
                        padding: '4px',
                        margin: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable={!isReadOnly}
                      suppressContentEditableWarning
                      onFocus={() => !isReadOnly && setEditingField('statement-title')}
                      onBlur={(e) => {
                        if (!isReadOnly) {
                          const html = e.currentTarget.innerHTML;
                          onUpdateQuestion(question.id, { 
                            title: e.currentTarget.textContent || '',
                            titleHtml: html 
                          });
                        }
                      }}
                      dangerouslySetInnerHTML={{ __html: question.titleHtml || question.title }}
                    />
                  </ResizableTextWrapper>
                  {question.subtitle && (
                    <ResizableTextWrapper type="subtitle" marginBottom="48px">
                      <p 
                        data-text-editable="subtitle"
                        className="text-xl cursor-text hover:opacity-80 transition-opacity"
                        style={{ 
                          color: question.subtitleStyle?.textColor || '#B8A892',
                          fontFamily: question.subtitleStyle?.fontFamily || getFontFamily(theme.fontFamily),
                          fontWeight: question.subtitleStyle?.isBold ? 'bold' : 'normal',
                          fontStyle: question.subtitleStyle?.isItalic ? 'italic' : 'normal',
                          textDecoration: question.subtitleStyle?.isUnderline ? 'underline' : 'none',
                          fontSize: question.subtitleStyle?.fontSize ? `${question.subtitleStyle.fontSize}px` : undefined,
                          textAlign: question.subtitleStyle?.textAlign || 'left',
                          outline: editingField === 'statement-subtitle' ? '2px solid rgba(184, 168, 146, 0.5)' : 'none',
                          padding: '4px',
                          margin: '-4px',
                          borderRadius: '4px'
                        }}
                        contentEditable={!isReadOnly}
                        suppressContentEditableWarning
                        onFocus={() => !isReadOnly && setEditingField('statement-subtitle')}
                        onBlur={(e) => {
                          if (!isReadOnly) {
                            const html = e.currentTarget.innerHTML;
                            onUpdateQuestion(question.id, { 
                              subtitle: e.currentTarget.textContent || '',
                              subtitleHtml: html 
                            });
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: question.subtitleHtml || question.subtitle || '' }}
                      />
                    </ResizableTextWrapper>
                  )}
                  <button
                    onClick={onNext}
                    className="font-semibold hover:opacity-90 transition-opacity"
                    style={unifiedButtonStyles}
                  >
                    {question.buttonText || "Continue"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ padding: viewMode === 'desktop' ? '35px 75px' : '24px' }}>
                <div className="w-full max-w-[700px] text-center relative">
                  {(editingField === 'ending-title' || editingField === 'ending-subtitle') && (
                    <>
                      <div className="absolute -top-2 right-0 flex items-center gap-1 z-50">
                        <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              onClick={() => {
                                console.log('Variable button clicked, current state:', showVariableMenu);
                                setShowVariableMenu(!showVariableMenu);
                              }}
                              className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
                              style={{ 
                                backgroundColor: 'rgba(245, 184, 0, 0.15)',
                                color: '#F5B800',
                                backdropFilter: 'blur(8px)'
                              }}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2 z-50" 
                        align="end"
                        side="bottom"
                        sideOffset={8}
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                        </Popover>
                        {((editingField === 'ending-title' && question.title) || (editingField === 'ending-subtitle' && question.subtitle)) && (
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              if (editingField === 'ending-title') {
                                onUpdateQuestion(question.id, { title: '' });
                              } else {
                                onUpdateQuestion(question.id, { subtitle: '' });
                              }
                            }}
                            className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                              backdropFilter: 'blur(8px)',
                            }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  <ResizableTextWrapper type="title" marginBottom={viewMode === 'desktop' ? '16px' : '8px'}>
                    <h2 
                      data-text-editable="title"
                      className="font-bold cursor-text hover:opacity-80 transition-opacity" 
                      style={{ 
                      color: question.titleStyle?.textColor || '#F5B800', 
                      fontFamily: question.titleStyle?.fontFamily || getFontFamily(theme.headingFontFamily),
                      fontWeight: question.titleStyle?.isBold ? 'bold' : 700,
                      fontStyle: question.titleStyle?.isItalic ? 'italic' : 'normal',
                      textDecoration: question.titleStyle?.isUnderline ? 'underline' : 'none',
                      fontSize: question.titleStyle?.fontSize ? `${question.titleStyle.fontSize}px` : (viewMode === 'desktop' ? '42px' : '28px'),
                      textAlign: question.titleStyle?.textAlign || 'center',
                        outline: editingField === 'ending-title' ? '2px solid rgba(245, 184, 0, 0.5)' : 'none',
                        padding: '4px',
                        margin: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable={!isReadOnly}
                      suppressContentEditableWarning
                      onFocus={() => !isReadOnly && setEditingField('ending-title')}
                      onBlur={(e) => {
                        if (!isReadOnly) {
                          const html = e.currentTarget.innerHTML;
                          onUpdateQuestion(question.id, { 
                            title: e.currentTarget.textContent || '',
                            titleHtml: html 
                          });
                        }
                      }}
                      dangerouslySetInnerHTML={{ __html: editingField === 'ending-title' ? (question.titleHtml || question.title) : replaceVariables(question.titleHtml || question.title) }}
                    />
                  </ResizableTextWrapper>
                  {question.subtitle && (
                    <ResizableTextWrapper type="subtitle" marginBottom={viewMode === 'desktop' ? '48px' : '32px'}>
                      <p 
                        data-text-editable="subtitle"
                        className="cursor-text hover:opacity-80 transition-opacity" 
                        style={{ 
                          color: question.subtitleStyle?.textColor || '#C4B5A0',
                          fontFamily: question.subtitleStyle?.fontFamily || getFontFamily(theme.fontFamily),
                          fontWeight: question.subtitleStyle?.isBold ? 'bold' : 'normal',
                          fontStyle: question.subtitleStyle?.isItalic ? 'italic' : 'normal',
                          textDecoration: question.subtitleStyle?.isUnderline ? 'underline' : 'none',
                          fontSize: question.subtitleStyle?.fontSize ? `${question.subtitleStyle.fontSize}px` : (viewMode === 'desktop' ? '18px' : '14px'),
                          textAlign: question.subtitleStyle?.textAlign || 'center',
                          opacity: 0.8,
                          outline: editingField === 'ending-subtitle' ? '2px solid rgba(196, 181, 160, 0.5)' : 'none',
                          padding: '4px',
                          margin: '-4px',
                          borderRadius: '4px'
                        }}
                        contentEditable={!isReadOnly}
                        suppressContentEditableWarning
                        onFocus={() => !isReadOnly && setEditingField('ending-subtitle')}
                        onBlur={(e) => {
                          if (!isReadOnly) {
                            const html = e.currentTarget.innerHTML;
                            onUpdateQuestion(question.id, { 
                              subtitle: e.currentTarget.textContent || '',
                              subtitleHtml: html 
                            });
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: editingField === 'ending-subtitle' ? (question.subtitleHtml || question.subtitle || '') : replaceVariables(question.subtitleHtml || question.subtitle || '') }}
                      />
                    </ResizableTextWrapper>
                  )}
                  <Button
                    onClick={() => window.location.reload()}
                    className="font-semibold hover:opacity-90 transition-opacity"
                    style={unifiedButtonStyles}
                  >
                    {question.buttonText || "Start over"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Hidden file input - always rendered so it's accessible from all layouts */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Image modals */}
      <ImageUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onImageSelect={handleImageSelect}
      />
      <ImageEditorModal
        open={showEditorModal}
        onOpenChange={setShowEditorModal}
        imageUrl={uploadedImage || getBackgroundImage() || ''}
        settings={imageSettings}
        onSave={handleImageEdit}
      />
      
      {/* Branching modal */}
      <BranchingModal
        open={showBranchingModal}
        onOpenChange={setShowBranchingModal}
        questionTitle={question?.title || ''}
        questionId={question?.id || ''}
        choices={question?.choices || []}
        availableQuestions={allQuestions
          .filter(q => q.type !== 'welcome' && q.type !== 'ending')
          .map(q => ({
            id: q.id,
            title: q.title,
            number: q.number?.toString() || ''
          }))
        }
      />
    </div>
  );
};
