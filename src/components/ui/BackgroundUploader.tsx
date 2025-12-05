import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Upload, X } from "lucide-react";

interface BackgroundUploaderProps {
  desktopImage?: string;
  mobileImage?: string;
  onDesktopImageChange: (image: string) => void;
  onDesktopImageRemove: () => void;
  onMobileImageChange: (image: string) => void;
  onMobileImageRemove: () => void;
  showApplyToAll?: boolean;
  applyToAll?: boolean;
  onApplyToAllChange?: (value: boolean) => void;
  // Overlay options
  overlayEnabled?: boolean;
  onOverlayEnabledChange?: (value: boolean) => void;
  overlayColor?: string;
  onOverlayColorChange?: (color: string) => void;
  overlayOpacity?: number;
  onOverlayOpacityChange?: (opacity: number) => void;
}

export const BackgroundUploader = ({ 
  desktopImage,
  mobileImage,
  onDesktopImageChange, 
  onDesktopImageRemove,
  onMobileImageChange,
  onMobileImageRemove,
  showApplyToAll = false,
  applyToAll = false,
  onApplyToAllChange,
  overlayEnabled = false,
  onOverlayEnabledChange,
  overlayColor = '#000000',
  onOverlayColorChange,
  overlayOpacity = 50,
  onOverlayOpacityChange
}: BackgroundUploaderProps) => {
  const hasBackground = desktopImage || mobileImage;
  
  return (
  <div className="space-y-3">
    <Label className="text-xs text-muted-foreground">Background</Label>
    
    {/* Desktop 16:9 */}
    <div className="space-y-1">
      <span className="text-[10px] text-muted-foreground">Desktop (16:9)</span>
      {desktopImage ? (
        <div className="relative">
          <img 
            src={desktopImage} 
            alt="Desktop Background" 
            className="w-full h-16 object-cover rounded-lg"
          />
          <button
            onClick={onDesktopImageRemove}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Upload</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  onDesktopImageChange(event.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
      )}
    </div>

    {/* Mobile 9:16 */}
    <div className="space-y-1">
      <span className="text-[10px] text-muted-foreground">Mobile (9:16) {!mobileImage && desktopImage && <span className="text-primary">• utilise desktop</span>}</span>
      {mobileImage ? (
        <div className="relative">
          <img 
            src={mobileImage} 
            alt="Mobile Background" 
            className="w-full h-16 object-cover rounded-lg"
          />
          <button
            onClick={onMobileImageRemove}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Upload</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  onMobileImageChange(event.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
      )}
    </div>

    {showApplyToAll && (
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Appliquer à tous les écrans</Label>
        <Switch 
          checked={applyToAll} 
          onCheckedChange={onApplyToAllChange}
        />
      </div>
    )}

    {/* Overlay options - only show when there's a background */}
    {hasBackground && onOverlayEnabledChange && (
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Masque sur le fond</Label>
          <Switch 
            checked={overlayEnabled} 
            onCheckedChange={onOverlayEnabledChange}
          />
        </div>
        
        {overlayEnabled && (
          <div className="space-y-3 pl-2">
            {/* Overlay Color */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Couleur</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={overlayColor}
                  onChange={(e) => onOverlayColorChange?.(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-border"
                />
                <span className="text-xs text-muted-foreground font-mono">{overlayColor}</span>
              </div>
            </div>
            
            {/* Overlay Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Opacité</Label>
                <span className="text-xs text-muted-foreground">{overlayOpacity}%</span>
              </div>
              <Slider
                value={[overlayOpacity]}
                onValueChange={(value) => onOverlayOpacityChange?.(value[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    )}
  </div>
  );
};
