import { FormTemplate } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Star, Check, ChevronRight, Smile, Send, ArrowRight } from "lucide-react";
import { useEffect } from "react";

interface TemplateCardProps {
  template: FormTemplate;
  onPreview: (template: FormTemplate) => void;
  onUse: (template: FormTemplate) => void;
}

// Load Google Font dynamically
const loadGoogleFont = (fontFamily: string) => {
  if (typeof document === 'undefined') return;
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;
  
  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
};

export const TemplateCard = ({ template, onPreview, onUse }: TemplateCardProps) => {
  const welcomeQ = template.questions.find(q => q.type === "welcome");
  const choiceQ = template.questions.find(q => q.type === "choice" && q.choices);
  const ratingQ = template.questions.find(q => q.type === "rating");
  const pictureQ = template.questions.find(q => q.type === "picture-choice");
  
  // Load Google Fonts for this template
  useEffect(() => {
    if (template.typography?.heading) {
      loadGoogleFont(template.typography.heading);
    }
    if (template.typography?.body) {
      loadGoogleFont(template.typography.body);
    }
  }, [template.typography]);

  // Get contrast-safe text color based on background
  const getTextColor = () => {
    // Use tertiary (light) color for text on dark backgrounds
    if (template.colorPalette?.tertiary) {
      return template.colorPalette.tertiary;
    }
    return "#FFFFFF";
  };

  // Get button styles with proper contrast
  const getButtonStyle = () => {
    const palette = template.colorPalette;
    if (palette) {
      return {
        backgroundColor: palette.secondary,
        color: palette.primary,
      };
    }
    return {
      backgroundColor: template.accentColor || "#FFFFFF",
      color: template.backgroundColor || "#000000",
    };
  };

  // Get heading font family
  const getHeadingFont = () => {
    return template.typography?.heading || "Inter";
  };

  // Get body font family  
  const getBodyFont = () => {
    return template.typography?.body || "Inter";
  };

  // Check if template has a background image
  const hasBackgroundImage = template.backgroundImages && template.backgroundImages.length > 0;
  
  // Get background style
  const getBackgroundStyle = () => {
    const palette = template.colorPalette;
    const bgColor = palette?.primary || template.backgroundColor || "#1a1a1a";
    
    if (template.gradientStart && template.gradientEnd) {
      return {
        background: `linear-gradient(${template.gradientAngle || 135}deg, ${template.gradientStart} 0%, ${template.gradientEnd} 100%)`
      };
    }
    return { backgroundColor: bgColor };
  };

  // Universal preview renderer - works for ALL templates
  const renderUniversalPreview = () => {
    const textColor = getTextColor();
    const headingFont = getHeadingFont();
    const bodyFont = getBodyFont();
    const buttonStyle = getButtonStyle();
    const bgStyle = getBackgroundStyle();
    const title = welcomeQ?.title || template.name;
    const subtitle = welcomeQ?.subtitle || template.description;
    const buttonText = welcomeQ?.buttonText || "Start";

    // LAYOUT: Split with image (left-right, right-left, split-left, split-right)
    if (hasBackgroundImage && ['left-right', 'right-left', 'split-left', 'split-right'].includes(template.desktopLayout || '')) {
      const imageOnRight = ['left-right', 'split-right'].includes(template.desktopLayout || '');
      
      return (
        <div className="absolute inset-0 flex" style={bgStyle}>
          {/* Content Side */}
          <div className={`w-1/2 p-4 flex flex-col justify-center ${imageOnRight ? 'order-1' : 'order-2'}`}>
            <div 
              className="text-[8px] tracking-widest mb-2 uppercase opacity-60"
              style={{ color: textColor, fontFamily: bodyFont }}
            >
              {template.brandName}
            </div>
            <div 
              className="text-sm font-semibold leading-tight mb-2 line-clamp-2"
              style={{ color: textColor, fontFamily: headingFont }}
            >
              {title.length > 40 ? title.substring(0, 40) + '...' : title}
            </div>
            <div 
              className="text-[9px] opacity-70 mb-3 line-clamp-2"
              style={{ color: textColor, fontFamily: bodyFont }}
            >
              {subtitle && subtitle.length > 60 ? subtitle.substring(0, 60) + '...' : subtitle}
            </div>
            <div 
              className="rounded-lg px-3 py-1.5 text-[9px] font-medium w-fit flex items-center gap-1"
              style={buttonStyle}
            >
              {buttonText} <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          {/* Image Side */}
          <div className={`w-1/2 relative ${imageOnRight ? 'order-2' : 'order-1'}`}>
            <img 
              src={template.backgroundImages![0]} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
            <div 
              className="absolute inset-0" 
              style={{ 
                background: imageOnRight 
                  ? `linear-gradient(to right, ${template.colorPalette?.primary || template.backgroundColor} 0%, transparent 50%)`
                  : `linear-gradient(to left, ${template.colorPalette?.primary || template.backgroundColor} 0%, transparent 50%)`
              }} 
            />
          </div>
        </div>
      );
    }

    // LAYOUT: Wallpaper (full background image)
    if (hasBackgroundImage && template.desktopLayout === 'wallpaper') {
      return (
        <div className="absolute inset-0">
          <img 
            src={template.backgroundImages![0]} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div 
              className="text-[8px] tracking-widest mb-2 uppercase opacity-80"
              style={{ color: textColor, fontFamily: bodyFont }}
            >
              {template.brandName}
            </div>
            <div 
              className="text-base font-bold leading-tight mb-2"
              style={{ color: textColor, fontFamily: headingFont }}
            >
              {title.length > 35 ? title.substring(0, 35) + '...' : title}
            </div>
            <div 
              className="rounded-lg px-4 py-2 text-[10px] font-medium"
              style={buttonStyle}
            >
              {buttonText}
            </div>
          </div>
        </div>
      );
    }

    // LAYOUT: Centered with gradient or solid background (with optional image)
    if (hasBackgroundImage) {
      return (
        <div className="absolute inset-0" style={bgStyle}>
          <img 
            src={template.backgroundImages![0]} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-30" 
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div 
              className="text-[8px] tracking-widest mb-3 uppercase opacity-70"
              style={{ color: textColor, fontFamily: bodyFont }}
            >
              {template.brandName}
            </div>
            <div 
              className="text-sm font-bold leading-tight mb-2 max-w-[180px]"
              style={{ color: textColor, fontFamily: headingFont }}
            >
              {title.length > 45 ? title.substring(0, 45) + '...' : title}
            </div>
            <div 
              className="text-[9px] opacity-70 mb-4 max-w-[160px] line-clamp-2"
              style={{ color: textColor, fontFamily: bodyFont }}
            >
              {subtitle}
            </div>
            <div 
              className="rounded-lg px-4 py-2 text-[10px] font-medium"
              style={buttonStyle}
            >
              {buttonText}
            </div>
          </div>
        </div>
      );
    }

    // LAYOUT: No image - clean gradient/solid with form preview
    return (
      <div className="absolute inset-0 p-4 flex flex-col" style={bgStyle}>
        <div 
          className="text-[8px] tracking-widest uppercase opacity-60"
          style={{ color: textColor, fontFamily: bodyFont }}
        >
          {template.brandName}
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div 
            className="text-base font-bold leading-tight mb-2"
            style={{ color: textColor, fontFamily: headingFont }}
          >
            {title.length > 35 ? title.substring(0, 35) + '...' : title}
          </div>
          <div 
            className="text-[9px] opacity-70 mb-3 line-clamp-2"
            style={{ color: textColor, fontFamily: bodyFont }}
          >
            {subtitle}
          </div>
          {/* Mini form preview */}
          <div className="space-y-1.5 mb-3">
            <div 
              className="rounded px-2 py-1.5 text-[8px] opacity-60"
              style={{ backgroundColor: `${textColor}15`, color: textColor, fontFamily: bodyFont }}
            >
              Your name
            </div>
            <div 
              className="rounded px-2 py-1.5 text-[8px] opacity-60"
              style={{ backgroundColor: `${textColor}15`, color: textColor, fontFamily: bodyFont }}
            >
              Email address
            </div>
          </div>
          <div 
            className="rounded-lg px-3 py-1.5 text-[9px] font-medium w-fit"
            style={buttonStyle}
          >
            {buttonText}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="group relative bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 cursor-pointer"
      onClick={() => onPreview(template)}
    >
      {/* Visual Preview */}
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        {renderUniversalPreview()}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white hover:bg-white/90 text-gray-900 text-xs h-8"
            onClick={(e) => { e.stopPropagation(); onPreview(template); }}
          >
            Preview
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-xs h-8"
            onClick={(e) => { e.stopPropagation(); onUse(template); }}
          >
            Use
          </Button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-3">
        <h4 className="font-semibold text-foreground text-sm mb-0.5 line-clamp-1">
          {template.name}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      </div>
    </div>
  );
};
