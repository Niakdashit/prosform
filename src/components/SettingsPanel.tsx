import { Question } from "./FormBuilder";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Image, Smartphone, Plus, Trash2, Info, Upload, Link as LinkIcon, Star, Smile, Heart, ThumbsUp, Tag, Monitor, LayoutGrid, List, CircleDot, Square, Type, Underline, BoxSelect, Minus, Hash, Sliders, ToggleLeft, Calendar, ChevronDown, FileUp, Maximize, AlignCenter, AlignLeft, Split, Sparkles, PartyPopper, ExternalLink, Globe, Play, Video, CheckSquare, Palette, RectangleHorizontal, Circle, SquareIcon, Paintbrush } from "lucide-react";
import { BackgroundUploader } from "@/components/ui/BackgroundUploader";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getQuestionIcon, questionIconMap } from "@/lib/questionIcons";
import { MOBILE_LAYOUTS, DESKTOP_LAYOUTS } from "@/types/layouts";
import mobileVerticalIcon from "@/assets/layout-mobile-vertical.svg";
import mobileHorizontalIcon from "@/assets/layout-mobile-horizontal.svg";
import mobileCenteredIcon from "@/assets/layout-mobile-centered.svg";
import mobileMinimalIcon from "@/assets/layout-mobile-minimal.svg";
import desktopLeftRightIcon from "@/assets/layout-desktop-left-right.svg";
import desktopRightLeftIcon from "@/assets/layout-desktop-right-left.svg";
import desktopCenteredIcon from "@/assets/layout-desktop-centered.svg";
import desktopSplitIcon from "@/assets/layout-desktop-split.svg";
import desktopCardIcon from "@/assets/layout-desktop-card.svg";
import desktopPanelIcon from "@/assets/layout-desktop-panel.svg";
import desktopWallpaperIcon from "@/assets/layout-desktop-wallpaper.svg";

interface SettingsPanelProps {
  question?: Question;
  onUpdateQuestion?: (id: string, updates: Partial<Question>) => void;
  onViewModeChange?: (mode: 'desktop' | 'mobile') => void;
}

const LayoutIcon = ({ type }: { type: string }) => {
  const iconMap: Record<string, string> = {
    "mobile-vertical": mobileVerticalIcon,
    "mobile-horizontal": mobileHorizontalIcon,
    "mobile-centered": mobileCenteredIcon,
    "mobile-minimal": mobileMinimalIcon,
    "desktop-left-right": desktopLeftRightIcon,
    "desktop-right-left": desktopRightLeftIcon,
    "desktop-centered": desktopCenteredIcon,
    "desktop-split": desktopSplitIcon,
    "desktop-card": desktopCardIcon,
    "desktop-panel": desktopPanelIcon,
    "desktop-wallpaper": desktopWallpaperIcon,
  };
  
  const icon = iconMap[type];
  if (!icon) return null;
  
  return <img src={icon} alt={type} className="w-full h-full" />;
};

const LayoutSelector = ({ question, onUpdateQuestion, onViewModeChange }: SettingsPanelProps) => {
  if (!question) return null;

  // Only show layout selector for question types with visual content
  const shouldShowLayout = ['welcome', 'statement', 'picture-choice', 'file'].includes(question.type);
  if (!shouldShowLayout) return null;

  const mobileLayouts = MOBILE_LAYOUTS.map(layout => ({
    value: layout.id,
    label: layout.name
  }));

  const desktopLayouts = DESKTOP_LAYOUTS.map(layout => ({
    value: layout.id,
    label: layout.name
  }));

  const currentMobileLayout = question.mobileLayout || "mobile-vertical";
  const currentDesktopLayout = question.desktopLayout || "desktop-left-right";

  return (
    <>
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
        
        <div className="flex items-center gap-3">
          <Label className="text-xs font-normal text-muted-foreground w-16 flex-shrink-0">Mobile</Label>
          <Select 
            value={currentMobileLayout}
            onValueChange={(value) => {
              onUpdateQuestion?.(question.id, { mobileLayout: value });
              onViewModeChange?.('mobile');
            }}
          >
            <SelectTrigger className="h-9 text-xs flex-1">
              <div className="flex items-center gap-2 w-full">
                <div className="w-6 h-6 flex-shrink-0">
                  <LayoutIcon type={currentMobileLayout} />
                </div>
                <svg className="ml-auto w-3 h-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </SelectTrigger>
            <SelectContent>
              {mobileLayouts.map((layout) => (
                <SelectItem key={layout.value} value={layout.value} className="text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6">
                      <LayoutIcon type={layout.value} />
                    </div>
                    <span>{layout.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Label className="text-xs font-normal text-muted-foreground w-16 flex-shrink-0">Desktop</Label>
          <Select 
            value={currentDesktopLayout}
            onValueChange={(value) => {
              onUpdateQuestion?.(question.id, { desktopLayout: value });
              onViewModeChange?.('desktop');
            }}
          >
            <SelectTrigger className="h-9 text-xs flex-1">
              <div className="flex items-center gap-2 w-full">
                <div className="w-6 h-6 flex-shrink-0">
                  <LayoutIcon type={currentDesktopLayout} />
                </div>
                <svg className="ml-auto w-3 h-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </SelectTrigger>
            <SelectContent>
              {desktopLayouts.map((layout) => (
                <SelectItem key={layout.value} value={layout.value} className="text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6">
                      <LayoutIcon type={layout.value} />
                    </div>
                    <span>{layout.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overlay opacity control for Wallpaper layouts */}
        {(currentMobileLayout === 'mobile-minimal' || currentDesktopLayout === 'desktop-wallpaper' || currentDesktopLayout === 'desktop-split') && (
          <div className="mt-4">
            <Label className="text-xs text-muted-foreground mb-2 block">
              Overlay opacity: {((question.overlayOpacity ?? 0.6) * 100).toFixed(0)}%
            </Label>
            <Slider
              value={[(question.overlayOpacity ?? 0.6) * 100]}
              onValueChange={([value]) => onUpdateQuestion?.(question.id, { overlayOpacity: value / 100 })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        )}
      </div>

      <Separator className="my-4" />
    </>
  );
};

export const SettingsPanel = ({ question, onUpdateQuestion, onViewModeChange }: SettingsPanelProps) => {
  if (!question) return null;

  const getQuestionTypeLabel = () => {
    const labels: Record<string, string> = {
      welcome: "Welcome Screen",
      text: question.variant === 'long' ? "Long Text" : "Short Text",
      rating: question.variant === 'scale' ? "Opinion Scale" : question.variant === 'ranking' ? "Ranking" : "Rating",
      choice: "Multiple Choice",
      ending: "End Screen",
      email: "Email",
      phone: "Phone Number",
      number: "Number",
      date: "Date",
      dropdown: "Dropdown",
      yesno: "Yes/No",
      file: "File Upload",
      statement: "Statement",
      "picture-choice": "Picture Choice",
      website: "Website",
      video: "Video/Audio",
      checkbox: "Checkbox",
    };
    return labels[question.type] || "Question";
  };

  const BlockSpacingControl = () => (
    <>
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Block spacing</Label>
        <div className="space-y-2">
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={question?.blockSpacing || 1}
            onChange={(e) => onUpdateQuestion?.(question!.id, { blockSpacing: parseFloat(e.target.value) })}
            className="w-full h-1.5 accent-primary cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Tight</span>
            <span>{(question?.blockSpacing || 1).toFixed(1)}</span>
            <span>Loose</span>
          </div>
        </div>
      </div>
      <Separator className="my-4" />
    </>
  );

  // Generic Display Style Selector Component
  const DisplayStyleSelector = <T extends string>({ 
    label, 
    options, 
    value, 
    onChange,
    columns = 4
  }: { 
    label: string;
    options: { value: T; icon: React.ComponentType<{ className?: string }>; label: string }[];
    value: T;
    onChange: (value: T) => void;
    columns?: number;
  }) => (
    <div>
      <Label className="text-xs text-muted-foreground mb-2 block">{label}</Label>
      <div className={`grid grid-cols-${columns} gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
              value === option.value
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-muted-foreground/30'
            }`}
          >
            <option.icon className={`w-4 h-4 mb-1 ${value === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-[9px] ${value === option.value ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Style Customization Panel Component
  const StyleCustomizationPanel = () => {
    const currentStyle = question.styleCustomization || {};
    
    const updateStyleCustomization = (key: string, value: string) => {
      onUpdateQuestion?.(question.id, {
        styleCustomization: {
          ...currentStyle,
          [key]: value
        }
      });
    };

    const borderRadiusOptions = [
      { value: 'none', label: 'None', preview: 'rounded-none' },
      { value: 'small', label: 'Small', preview: 'rounded-sm' },
      { value: 'medium', label: 'Medium', preview: 'rounded-md' },
      { value: 'large', label: 'Large', preview: 'rounded-lg' },
      { value: 'full', label: 'Full', preview: 'rounded-full' },
    ];

    const presetColors = [
      '#F5B800', // Yellow (primary)
      '#3B82F6', // Blue
      '#10B981', // Green
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#F97316', // Orange
      '#EC4899', // Pink
      '#6B7280', // Gray
      '#000000', // Black
      '#FFFFFF', // White
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs font-medium">Style Customization</Label>
        </div>

        {/* Border Radius */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Border Radius</Label>
          <div className="flex gap-1">
            {borderRadiusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateStyleCustomization('borderRadius', option.value)}
                className={`flex-1 p-2 border-2 transition-all ${
                  (currentStyle.borderRadius || 'medium') === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                }`}
                title={option.label}
              >
                <div className={`w-full h-4 bg-muted-foreground/20 ${option.preview}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Button Color */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Button Color</Label>
          <div className="flex gap-1.5 flex-wrap">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => updateStyleCustomization('buttonColor', color)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  currentStyle.buttonColor === color
                    ? 'border-primary scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-muted-foreground/50">
                  <Plus className="w-3 h-3 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <Input
                  type="color"
                  value={currentStyle.buttonColor || '#F5B800'}
                  onChange={(e) => updateStyleCustomization('buttonColor', e.target.value)}
                  className="w-20 h-8 p-0 border-0"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Text Color */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Text Color</Label>
          <div className="flex gap-1.5 flex-wrap">
            {['#FFFFFF', '#000000', '#374151', '#6B7280', '#F5B800'].map((color) => (
              <button
                key={color}
                onClick={() => updateStyleCustomization('buttonTextColor', color)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  currentStyle.buttonTextColor === color
                    ? 'border-primary scale-110'
                    : 'border-muted hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-muted-foreground/50">
                  <Plus className="w-3 h-3 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <Input
                  type="color"
                  value={currentStyle.buttonTextColor || '#000000'}
                  onChange={(e) => updateStyleCustomization('buttonTextColor', e.target.value)}
                  className="w-20 h-8 p-0 border-0"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Border Color */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Border Color</Label>
          <div className="flex gap-1.5 flex-wrap">
            {['transparent', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#F5B800', '#3B82F6'].map((color) => (
              <button
                key={color}
                onClick={() => updateStyleCustomization('borderColor', color)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  currentStyle.borderColor === color
                    ? 'border-primary scale-110'
                    : 'border-muted hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: color === 'transparent' ? 'white' : color,
                  backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Background Color</Label>
          <div className="flex gap-1.5 flex-wrap">
            {['transparent', '#FFFFFF', '#F3F4F6', '#E5E7EB', '#FEF3C7', '#DBEAFE'].map((color) => (
              <button
                key={color}
                onClick={() => updateStyleCustomization('backgroundColor', color)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  currentStyle.backgroundColor === color
                    ? 'border-primary scale-110'
                    : 'border-muted hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: color === 'transparent' ? 'white' : color,
                  backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderWelcomeSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      {/* Alignment */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Alignment</Label>
        <Select
          value={question.welcomeDisplayStyle || 'left'}
          onValueChange={(value: 'left' | 'center' | 'right' | 'centered' | 'fullscreen' | 'split') => onUpdateQuestion?.(question.id, { welcomeDisplayStyle: value })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="time-toggle" className="text-xs font-normal">Time to complete</Label>
          <Switch id="time-toggle" defaultChecked className="scale-90" />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="submissions-toggle" className="text-xs font-normal">Number of submissions</Label>
          <Switch id="submissions-toggle" className="scale-90" />
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Button</Label>
        <Input 
          type="text" 
          value={question.buttonText || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { buttonText: e.target.value })}
          placeholder="Give feedback"
          className="text-xs h-8"
        />
        <p className="text-[10px] text-muted-foreground mt-1.5">{(question.buttonText || "").length}/24</p>
      </div>

      <Separator className="my-4" />

      {question.desktopLayout === 'desktop-left-right' && (
        <>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Alignment</Label>
            <Select 
              value={question.splitAlignment || 'left'}
              onValueChange={(value: 'left' | 'center' | 'right') => onUpdateQuestion?.(question.id, { splitAlignment: value })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left" className="text-xs">Left</SelectItem>
                <SelectItem value="center" className="text-xs">Center</SelectItem>
                <SelectItem value="right" className="text-xs">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator className="my-4" />
        </>
      )}

      <BlockSpacingControl />

      <Separator className="my-4" />

      {/* Background Image */}
      <BackgroundUploader
        desktopImage={question.backgroundImage}
        mobileImage={question.backgroundImageMobile}
        onDesktopImageChange={(image) => onUpdateQuestion?.(question.id, { backgroundImage: image })}
        onDesktopImageRemove={() => onUpdateQuestion?.(question.id, { backgroundImage: undefined })}
        onMobileImageChange={(image) => onUpdateQuestion?.(question.id, { backgroundImageMobile: image })}
        onMobileImageRemove={() => onUpdateQuestion?.(question.id, { backgroundImageMobile: undefined })}
        showApplyToAll={true}
        applyToAll={question.applyBackgroundToAll}
        onApplyToAllChange={(value) => onUpdateQuestion?.(question.id, { applyBackgroundToAll: value })}
      />
    </>
  );

  const renderTextSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      {/* Text Display Style */}
      <DisplayStyleSelector
        label="Display style"
        options={[
          { value: 'default', icon: Type, label: 'Default' },
          { value: 'underline', icon: Underline, label: 'Underline' },
          { value: 'boxed', icon: BoxSelect, label: 'Boxed' },
          { value: 'minimal', icon: Minus, label: 'Minimal' },
        ]}
        value={question.textDisplayStyle || 'default'}
        onChange={(value) => onUpdateQuestion?.(question.id, { textDisplayStyle: value })}
      />

      <Separator className="my-4" />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
          <Switch 
            id="required-toggle" 
            checked={question.required}
            onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
            className="scale-90" 
          />
        </div>
        
        {question.variant === 'long' && (
          <div className="flex items-center justify-between">
            <Label htmlFor="maxchars-toggle" className="text-xs font-normal">Max characters</Label>
            <Switch id="maxchars-toggle" className="scale-90" />
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Placeholder</Label>
        <Input 
          type="text" 
          value={question.placeholder || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { placeholder: e.target.value })}
          placeholder="Type your answer here..."
          className="text-xs h-8"
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <Button variant="outline" size="sm" className="w-full text-[10px] h-8">
          <Plus className="w-3 h-3 mr-1" />
          Add media
        </Button>
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  const renderEmailSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch 
          id="required-toggle" 
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
          className="scale-90" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Placeholder</Label>
        <Input 
          type="text" 
          value={question.placeholder || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { placeholder: e.target.value })}
          placeholder="name@example.com"
          className="text-xs h-8"
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Error message</Label>
        <Input 
          type="text" 
          placeholder="Please enter a valid email"
          className="text-xs h-8"
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <Button variant="outline" size="sm" className="w-full text-[10px] h-8">
          <Plus className="w-3 h-3 mr-1" />
          Add media
        </Button>
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  const renderPhoneSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch 
          id="required-toggle" 
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
          className="scale-90" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Phone format</Label>
        <Select defaultValue="international">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="international" className="text-xs">International</SelectItem>
            <SelectItem value="national" className="text-xs">National</SelectItem>
            <SelectItem value="e164" className="text-xs">E.164</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Default country</Label>
        <Select defaultValue="us">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us" className="text-xs">🇺🇸 United States (+1)</SelectItem>
            <SelectItem value="fr" className="text-xs">🇫🇷 France (+33)</SelectItem>
            <SelectItem value="uk" className="text-xs">🇬🇧 United Kingdom (+44)</SelectItem>
            <SelectItem value="de" className="text-xs">🇩🇪 Germany (+49)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Placeholder</Label>
        <Input 
          type="text" 
          value={question.placeholder || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { placeholder: e.target.value })}
          placeholder="+1 (555) 000-0000"
          className="text-xs h-8"
        />
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  const renderNumberSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch 
          id="required-toggle" 
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
          className="scale-90" 
        />
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Min value</Label>
            <Input type="number" placeholder="No min" className="text-xs h-7" />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Max value</Label>
            <Input type="number" placeholder="No max" className="text-xs h-7" />
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Step</Label>
        <Input type="number" placeholder="1" className="text-xs h-8" />
        <p className="text-[10px] text-muted-foreground mt-1">Increment value</p>
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <Label htmlFor="decimals-toggle" className="text-xs font-normal">Allow decimals</Label>
        <Switch id="decimals-toggle" className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Placeholder</Label>
        <Input 
          type="text" 
          value={question.placeholder || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { placeholder: e.target.value })}
          placeholder="Enter a number" 
          className="text-xs h-8" 
        />
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  const renderDateSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      {/* Date Display Style */}
      <DisplayStyleSelector
        label="Display style"
        options={[
          { value: 'calendar', icon: Calendar, label: 'Calendar' },
          { value: 'dropdowns', icon: ChevronDown, label: 'Dropdowns' },
          { value: 'input', icon: Type, label: 'Input' },
        ]}
        value={question.dateDisplayStyle || 'calendar'}
        onChange={(value) => onUpdateQuestion?.(question.id, { dateDisplayStyle: value })}
        columns={3}
      />

      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch 
          id="required-toggle" 
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
          className="scale-90" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Date format</Label>
        <Select defaultValue="ddmmyyyy">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ddmmyyyy" className="text-xs">DD/MM/YYYY</SelectItem>
            <SelectItem value="mmddyyyy" className="text-xs">MM/DD/YYYY</SelectItem>
            <SelectItem value="yyyymmdd" className="text-xs">YYYY-MM-DD</SelectItem>
            <SelectItem value="ddmmmyyyy" className="text-xs">DD MMM YYYY</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Min date</Label>
        <Input type="date" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Max date</Label>
        <Input type="date" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Default date</Label>
        <Select defaultValue="none">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="text-xs">None</SelectItem>
            <SelectItem value="today" className="text-xs">Today</SelectItem>
            <SelectItem value="custom" className="text-xs">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  const renderDropdownSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      {/* Dropdown Display Style */}
      <DisplayStyleSelector
        label="Display style"
        options={[
          { value: 'select', icon: ChevronDown, label: 'Select' },
          { value: 'searchable', icon: List, label: 'Search' },
          { value: 'buttons', icon: LayoutGrid, label: 'Buttons' },
        ]}
        value={question.dropdownDisplayStyle || 'select'}
        onChange={(value) => onUpdateQuestion?.(question.id, { dropdownDisplayStyle: value })}
        columns={3}
      />

      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch 
          id="required-toggle" 
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
          className="scale-90" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-muted-foreground">Choices</Label>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {["Option 1", "Option 2", "Option 3"].map((choice, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input value={choice} className="text-xs h-7 flex-1" />
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="alphabetize-toggle" className="text-xs font-normal">Alphabetize</Label>
          <Switch id="alphabetize-toggle" className="scale-90" />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="search-toggle" className="text-xs font-normal">Enable search</Label>
          <Switch id="search-toggle" className="scale-90" />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="other-dropdown-toggle" className="text-xs font-normal">"Other" option</Label>
          <Switch id="other-dropdown-toggle" className="scale-90" />
        </div>
      </div>
    </>
  );

  const renderYesNoSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      {/* Yes/No Display Style */}
      <DisplayStyleSelector
        label="Display style"
        options={[
          { value: 'buttons', icon: Square, label: 'Buttons' },
          { value: 'toggle', icon: ToggleLeft, label: 'Toggle' },
          { value: 'cards', icon: LayoutGrid, label: 'Cards' },
          { value: 'icons', icon: ThumbsUp, label: 'Icons' },
        ]}
        value={question.yesnoDisplayStyle || 'buttons'}
        onChange={(value) => onUpdateQuestion?.(question.id, { yesnoDisplayStyle: value })}
      />

      <Separator className="my-4" />

      {/* Style Customization */}
      <StyleCustomizationPanel />

      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch 
          id="required-toggle" 
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
          className="scale-90" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Positive label</Label>
        <Input type="text" placeholder="Yes" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Negative label</Label>
        <Input type="text" placeholder="No" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
        <Select defaultValue="horizontal">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="horizontal" className="text-xs">Horizontal</SelectItem>
            <SelectItem value="vertical" className="text-xs">Vertical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <Button variant="outline" size="sm" className="w-full text-[10px] h-8">
          <Plus className="w-3 h-3 mr-1" />
          Add media
        </Button>
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  const renderFileUploadSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      {/* File Upload Display Style */}
      <DisplayStyleSelector
        label="Display style"
        options={[
          { value: 'dropzone', icon: Upload, label: 'Dropzone' },
          { value: 'button', icon: FileUp, label: 'Button' },
          { value: 'minimal', icon: Minus, label: 'Minimal' },
        ]}
        value={question.fileDisplayStyle || 'dropzone'}
        onChange={(value) => onUpdateQuestion?.(question.id, { fileDisplayStyle: value })}
        columns={3}
      />

      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch 
          id="required-toggle" 
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
          className="scale-90" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">File types</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch id="images-type" className="scale-90" />
            <Label htmlFor="images-type" className="text-xs font-normal">Images (JPG, PNG, GIF)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="docs-type" className="scale-90" />
            <Label htmlFor="docs-type" className="text-xs font-normal">Documents (PDF, DOC)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="sheets-type" className="scale-90" />
            <Label htmlFor="sheets-type" className="text-xs font-normal">Spreadsheets (XLS, CSV)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="videos-type" className="scale-90" />
            <Label htmlFor="videos-type" className="text-xs font-normal">Videos (MP4, MOV)</Label>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Max file size (MB)</Label>
        <Input type="number" placeholder="10" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <Label htmlFor="multiple-files-toggle" className="text-xs font-normal">Multiple files</Label>
        <Switch id="multiple-files-toggle" className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Max number of files</Label>
        <Input type="number" placeholder="5" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  const renderStatementSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Description</Label>
        <Textarea 
          placeholder="Add additional information..."
          className="text-xs min-h-[80px]"
        />
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <Label htmlFor="continue-toggle" className="text-xs font-normal">Continue button</Label>
        <Switch id="continue-toggle" defaultChecked className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Button text</Label>
        <Input 
          type="text" 
          value={question.buttonText || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { buttonText: e.target.value })}
          placeholder="Continue" 
          className="text-xs h-8" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Min display time (sec)</Label>
        <Input type="number" placeholder="0" className="text-xs h-8" />
        <p className="text-[10px] text-muted-foreground mt-1">Before user can continue</p>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
        <Select defaultValue="center">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="center" className="text-xs">Center</SelectItem>
            <SelectItem value="left" className="text-xs">Left</SelectItem>
            <SelectItem value="split" className="text-xs">Split with media</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <Button variant="outline" size="sm" className="w-full text-[10px] h-8">
          <Plus className="w-3 h-3 mr-1" />
          Add media
        </Button>
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  const renderPictureChoiceSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
          <Switch 
            id="required-toggle" 
            checked={question.required}
            onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
            className="scale-90" 
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="multiple-pic-toggle" className="text-xs font-normal">Multiple selection</Label>
          <Switch id="multiple-pic-toggle" className="scale-90" />
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-muted-foreground">Choices</Label>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {["Choice 1", "Choice 2", "Choice 3"].map((choice, idx) => (
            <div key={idx} className="border rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={choice} className="text-xs h-7 flex-1" placeholder="Label" />
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="w-full text-[10px] h-7 justify-start">
                <Upload className="w-3 h-3 mr-1.5" />
                Upload image
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
        <Select defaultValue="grid-2">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid-2" className="text-xs">Grid 2x2</SelectItem>
            <SelectItem value="grid-3" className="text-xs">Grid 3x3</SelectItem>
            <SelectItem value="list" className="text-xs">List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="labels-toggle" className="text-xs font-normal">Show labels</Label>
          <Switch id="labels-toggle" defaultChecked className="scale-90" />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="randomize-pic-toggle" className="text-xs font-normal">Randomize order</Label>
          <Switch id="randomize-pic-toggle" className="scale-90" />
        </div>
      </div>
    </>
  );

  const renderRatingSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      {/* Rating Display Style */}
      <DisplayStyleSelector
        label="Display style"
        options={[
          { value: 'stars', icon: Star, label: 'Stars' },
          { value: 'numbers', icon: Hash, label: 'Numbers' },
          { value: 'emojis', icon: Smile, label: 'Emojis' },
          { value: 'hearts', icon: Heart, label: 'Hearts' },
          { value: 'slider', icon: Sliders, label: 'Slider' },
        ]}
        value={question.ratingDisplayStyle || 'stars'}
        onChange={(value) => onUpdateQuestion?.(question.id, { ratingDisplayStyle: value })}
        columns={5}
      />

      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch 
          id="required-toggle" 
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
          className="scale-90" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Rating type</Label>
        <div className="flex gap-2">
          <Input 
            type="number" 
            value={question.ratingCount || 5}
            onChange={(e) => onUpdateQuestion?.(question.id, { ratingCount: parseInt(e.target.value) || 5 })}
            min="2"
            max="10"
            className="text-xs h-8 w-16" 
          />
          <Select 
            value={question.ratingType || "stars"}
            onValueChange={(value) => onUpdateQuestion?.(question.id, { ratingType: value })}
          >
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
              <SelectContent>
                <SelectItem value="stars" className="text-xs">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3" />
                    <span>Stars</span>
                  </div>
                </SelectItem>
                <SelectItem value="smileys" className="text-xs">
                  <div className="flex items-center gap-2">
                    <Smile className="w-3 h-3" />
                    <span>Smileys</span>
                  </div>
                </SelectItem>
                <SelectItem value="hearts" className="text-xs">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3 h-3" />
                    <span>Hearts</span>
                  </div>
                </SelectItem>
                <SelectItem value="thumbs" className="text-xs">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-3 h-3" />
                    <span>Thumbs</span>
                  </div>
                </SelectItem>
                <SelectItem value="numbers" className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 flex items-center justify-center font-bold">#</span>
                    <span>Numbers</span>
                  </div>
                </SelectItem>
              </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <Button variant="outline" size="sm" className="w-full text-[10px] h-8">
          <Plus className="w-3 h-3 mr-1" />
          Add media
        </Button>
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  const renderChoiceSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      {/* Choice Display Style */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Display style</Label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'list', icon: List, label: 'List' },
            { value: 'pills', icon: CircleDot, label: 'Pills' },
            { value: 'grid', icon: LayoutGrid, label: 'Grid' },
            { value: 'cards', icon: Square, label: 'Outline' },
          ].map((style) => (
            <button
              key={style.value}
              onClick={() => onUpdateQuestion?.(question.id, { choiceDisplayStyle: style.value as 'pills' | 'list' | 'grid' | 'cards' })}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                (question.choiceDisplayStyle || 'list') === style.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-muted-foreground/30'
              }`}
            >
              <style.icon className={`w-4 h-4 mb-1 ${(question.choiceDisplayStyle || 'list') === style.value ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[9px] ${(question.choiceDisplayStyle || 'list') === style.value ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Style Customization */}
      <StyleCustomizationPanel />

      <Separator className="my-4" />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
          <Switch 
            id="required-toggle" 
            checked={question.required}
            onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
            className="scale-90" 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="multiple-toggle" className="text-xs font-normal">Multiple selection</Label>
          <Switch id="multiple-toggle" className="scale-90" />
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Max selections</Label>
        <Select defaultValue="unlimited">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unlimited" className="text-xs">Unlimited</SelectItem>
            <SelectItem value="1" className="text-xs">1</SelectItem>
            <SelectItem value="2" className="text-xs">2</SelectItem>
            <SelectItem value="3" className="text-xs">3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="randomize-toggle" className="text-xs font-normal">Randomize</Label>
          <Switch id="randomize-toggle" className="scale-90" />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="other-toggle" className="text-xs font-normal">"Other" option</Label>
          <Switch id="other-toggle" className="scale-90" />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="vertical-toggle" className="text-xs font-normal">Vertical alignment</Label>
          <Switch id="vertical-toggle" className="scale-90" />
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <Button variant="outline" size="sm" className="w-full text-[10px] h-8">
          <Plus className="w-3 h-3 mr-1" />
          Add media
        </Button>
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  const renderEndingSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} />
      
      {/* Ending Display Style */}
      <DisplayStyleSelector
        label="Display style"
        options={[
          { value: 'centered', icon: AlignCenter, label: 'Centered' },
          { value: 'confetti', icon: PartyPopper, label: 'Confetti' },
          { value: 'minimal', icon: Minus, label: 'Minimal' },
          { value: 'redirect', icon: ExternalLink, label: 'Redirect' },
        ]}
        value={question.endingDisplayStyle || 'centered'}
        onChange={(value) => onUpdateQuestion?.(question.id, { endingDisplayStyle: value })}
      />

      <Separator className="my-4" />
      
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Insert variable</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full text-xs h-8 justify-start">
              <Tag className="w-3 h-3 mr-2" />
              Add variable to text
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              <button
                onClick={() => {
                  const newTitle = question.title + " {{first_name}}";
                  onUpdateQuestion?.(question.id, { title: newTitle });
                }}
                className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted transition-colors"
              >
                <div className="font-medium">First name</div>
                <div className="text-muted-foreground text-[10px]">Inserts: {"{{first_name}}"}</div>
              </button>
              <button
                onClick={() => {
                  const newTitle = question.title + " {{email}}";
                  onUpdateQuestion?.(question.id, { title: newTitle });
                }}
                className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted transition-colors"
              >
                <div className="font-medium">Email</div>
                <div className="text-muted-foreground text-[10px]">Inserts: {"{{email}}"}</div>
              </button>
            </div>
          </PopoverContent>
        </Popover>
        <p className="text-[10px] text-muted-foreground mt-2">
          Variables like {"{{first_name}}"} will be replaced with actual responses
        </p>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="social-toggle" className="text-xs font-normal">Social share icons</Label>
          <Switch id="social-toggle" className="scale-90" />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="button-toggle" className="text-xs font-normal">Button</Label>
          <Switch id="button-toggle" className="scale-90" />
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Button text</Label>
        <Input 
          type="text" 
          value={question.buttonText || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { buttonText: e.target.value })}
          placeholder="Create your own form" 
          className="text-xs h-8" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Button link</Label>
        <Input type="text" placeholder="https://..." className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      {/* Background Image */}
      <BackgroundUploader
        desktopImage={question.backgroundImage}
        mobileImage={question.backgroundImageMobile}
        onDesktopImageChange={(image) => onUpdateQuestion?.(question.id, { backgroundImage: image })}
        onDesktopImageRemove={() => onUpdateQuestion?.(question.id, { backgroundImage: undefined })}
        onMobileImageChange={(image) => onUpdateQuestion?.(question.id, { backgroundImageMobile: image })}
        onMobileImageRemove={() => onUpdateQuestion?.(question.id, { backgroundImageMobile: undefined })}
      />
    </>
  );

  // Website Settings
  const renderWebsiteSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      <DisplayStyleSelector
        label="Display style"
        options={[
          { value: 'default', icon: Globe, label: 'Default' },
          { value: 'card', icon: Square, label: 'Card' },
          { value: 'minimal', icon: Minus, label: 'Minimal' },
        ]}
        value={question.websiteDisplayStyle || 'default'}
        onChange={(value) => onUpdateQuestion?.(question.id, { websiteDisplayStyle: value })}
        columns={3}
      />

      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch 
          id="required-toggle" 
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
          className="scale-90" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Placeholder</Label>
        <Input 
          type="text" 
          value={question.placeholder || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { placeholder: e.target.value })}
          placeholder="https://example.com"
          className="text-xs h-8"
        />
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  // Video/Audio Settings
  const renderVideoSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      <DisplayStyleSelector
        label="Display style"
        options={[
          { value: 'dropzone', icon: Upload, label: 'Dropzone' },
          { value: 'button', icon: FileUp, label: 'Button' },
          { value: 'embed', icon: Play, label: 'Embed' },
        ]}
        value={question.videoDisplayStyle || 'dropzone'}
        onChange={(value) => onUpdateQuestion?.(question.id, { videoDisplayStyle: value })}
        columns={3}
      />

      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch 
          id="required-toggle" 
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
          className="scale-90" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Accepted formats</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch id="video-type" defaultChecked className="scale-90" />
            <Label htmlFor="video-type" className="text-xs font-normal">Video (MP4, MOV, WebM)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="audio-type" defaultChecked className="scale-90" />
            <Label htmlFor="audio-type" className="text-xs font-normal">Audio (MP3, WAV, OGG)</Label>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Max file size (MB)</Label>
        <Input type="number" defaultValue="100" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  // Checkbox Settings
  const renderCheckboxSettings = () => (
    <>
      <LayoutSelector question={question} onUpdateQuestion={onUpdateQuestion} onViewModeChange={onViewModeChange} />
      
      <DisplayStyleSelector
        label="Display style"
        options={[
          { value: 'square', icon: Square, label: 'Square' },
          { value: 'round', icon: CircleDot, label: 'Round' },
          { value: 'toggle', icon: ToggleLeft, label: 'Toggle' },
        ]}
        value={question.checkboxDisplayStyle || 'square'}
        onChange={(value) => onUpdateQuestion?.(question.id, { checkboxDisplayStyle: value })}
        columns={3}
      />

      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch 
          id="required-toggle" 
          checked={question.required}
          onCheckedChange={(checked) => onUpdateQuestion?.(question.id, { required: checked })}
          className="scale-90" 
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Checkbox label</Label>
        <Input 
          type="text" 
          value={question.placeholder || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { placeholder: e.target.value })}
          placeholder="I agree to the terms"
          className="text-xs h-8"
        />
      </div>

      <Separator className="my-4" />

      <BlockSpacingControl />
    </>
  );

  const renderSettings = () => {
    switch (question.type) {
      case "welcome":
        return renderWelcomeSettings();
      case "text":
        return renderTextSettings();
      case "email":
        return renderEmailSettings();
      case "phone":
        return renderPhoneSettings();
      case "number":
        return renderNumberSettings();
      case "date":
        return renderDateSettings();
      case "rating":
        return renderRatingSettings();
      case "choice":
        return renderChoiceSettings();
      case "dropdown":
        return renderDropdownSettings();
      case "yesno":
        return renderYesNoSettings();
      case "file":
        return renderFileUploadSettings();
      case "statement":
        return renderStatementSettings();
      case "picture-choice":
        return renderPictureChoiceSettings();
      case "ending":
        return renderEndingSettings();
      case "website":
        return renderWebsiteSettings();
      case "video":
        return renderVideoSettings();
      case "checkbox":
        return renderCheckboxSettings();
      default:
        return null;
    }
  };

  return (
    <div className="w-[280px] bg-background border-l border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Select 
            value={question.type}
            onValueChange={(value) => {
              // Update question type and reset variant if needed
              const updates: Partial<Question> = { type: value as any };
              
              // Reset variant for text types
              if (value === 'text') {
                updates.variant = 'short';
              }
              
              // Reset variant for rating types
              if (value === 'rating') {
                updates.variant = undefined;
                updates.ratingCount = 5;
              }
              
              onUpdateQuestion?.(question.id, updates);
            }}
          >
            <SelectTrigger className="flex-1 h-9 text-xs">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getQuestionIcon(question).icon;
                  const color = getQuestionIcon(question).color;
                  return (
                    <>
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">{getQuestionTypeLabel()}</span>
                    </>
                  );
                })()}
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              <SelectItem value="welcome" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["welcome"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["welcome"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Welcome Screen</span>
                </div>
              </SelectItem>
              
              <SelectItem value="text" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["short-text"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["short-text"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Short Text</span>
                </div>
              </SelectItem>
              
              <SelectItem value="email" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["email"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["email"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Email</span>
                </div>
              </SelectItem>
              
              <SelectItem value="phone" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["phone"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["phone"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Phone Number</span>
                </div>
              </SelectItem>
              
              <SelectItem value="number" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["number"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["number"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Number</span>
                </div>
              </SelectItem>
              
              <SelectItem value="date" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["date"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["date"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Date</span>
                </div>
              </SelectItem>
              
              <SelectItem value="choice" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["multiple-choice"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["multiple-choice"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Multiple Choice</span>
                </div>
              </SelectItem>
              
              <SelectItem value="yesno" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["yes-no"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["yes-no"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Yes/No</span>
                </div>
              </SelectItem>
              
              <SelectItem value="dropdown" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["dropdown"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["dropdown"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Dropdown</span>
                </div>
              </SelectItem>
              
              <SelectItem value="rating" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["rating"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["rating"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Rating</span>
                </div>
              </SelectItem>
              
              <SelectItem value="picture-choice" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["picture-choice"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["picture-choice"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Picture Choice</span>
                </div>
              </SelectItem>
              
              <SelectItem value="file" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["file-upload"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["file-upload"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>File Upload</span>
                </div>
              </SelectItem>
              
              <SelectItem value="statement" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["statement"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["statement"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>Statement</span>
                </div>
              </SelectItem>
              
              <SelectItem value="ending" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${questionIconMap["ending"].color}`}>
                    {(() => {
                      const Icon = questionIconMap["ending"].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <span>End Screen</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {renderSettings()}
        </div>
      </ScrollArea>
    </div>
  );
};
