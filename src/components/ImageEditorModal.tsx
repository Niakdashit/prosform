import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";

export interface ImageSettings {
  size: number; // percentage 50-150
  borderRadius: number; // px 0-100
  borderWidth: number; // px 0-20
  borderColor: string;
  rotation: number; // degrees 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

interface ImageEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  settings: ImageSettings;
  onSave: (settings: ImageSettings) => void;
}

const defaultSettings: ImageSettings = {
  size: 100,
  borderRadius: 5,
  borderWidth: 0,
  borderColor: '#F5B800',
  rotation: 0,
  flipH: false,
  flipV: false,
};

export const ImageEditorModal = ({ open, onOpenChange, imageUrl, settings, onSave }: ImageEditorModalProps) => {
  const [localSettings, setLocalSettings] = useState<ImageSettings>(settings || defaultSettings);

  useEffect(() => {
    if (open) {
      setLocalSettings(settings || defaultSettings);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSave(localSettings);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
  };

  const rotateLeft = () => {
    setLocalSettings(prev => ({
      ...prev,
      rotation: (prev.rotation - 90 + 360) % 360
    }));
  };

  const rotateRight = () => {
    setLocalSettings(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };

  const toggleFlipH = () => {
    setLocalSettings(prev => ({ ...prev, flipH: !prev.flipH }));
  };

  const toggleFlipV = () => {
    setLocalSettings(prev => ({ ...prev, flipV: !prev.flipV }));
  };

  const presetColors = ['#F5B800', '#3D3731', '#FFFFFF', '#000000', '#ef4444', '#22c55e', '#3b82f6', '#a855f7'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        style={{
          backgroundColor: '#FFF8EC',
          border: '1px solid #E5E5E5',
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#3D3731' }}>Éditer l'image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Preview */}
          <div
            className="flex justify-center p-4 rounded-lg"
            style={{ backgroundColor: '#F5EBDD' }}
          >
            <div
              style={{
                width: `${localSettings.size * 1.5}px`,
                height: `${localSettings.size * 1.5}px`,
                borderRadius: `${localSettings.borderRadius}px`,
                border: localSettings.borderWidth > 0 ? `${localSettings.borderWidth}px solid ${localSettings.borderColor}` : 'none',
                overflow: 'hidden',
                transform: `rotate(${localSettings.rotation}deg) scaleX(${localSettings.flipH ? -1 : 1}) scaleY(${localSettings.flipV ? -1 : 1})`,
                transition: 'all 0.2s ease',
              }}
            >
              <img
                src={imageUrl || "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400&h=400&fit=crop"}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="text-sm font-medium mb-3 block" style={{ color: '#6B6254' }}>
              Taille ({localSettings.size}%)
            </label>
            <Slider
              value={[localSettings.size]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, size: value }))}
              min={50}
              max={150}
              step={5}
              className="w-full"
            />
          </div>

          {/* Border Radius */}
          <div>
            <label className="text-sm font-medium mb-3 block" style={{ color: '#6B6254' }}>
              Arrondi ({localSettings.borderRadius}px)
            </label>
            <Slider
              value={[localSettings.borderRadius]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, borderRadius: value }))}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Border Width */}
          <div>
            <label className="text-sm font-medium mb-3 block" style={{ color: '#6B6254' }}>
              Épaisseur bordure ({localSettings.borderWidth}px)
            </label>
            <Slider
              value={[localSettings.borderWidth]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, borderWidth: value }))}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          {/* Border Color */}
          {localSettings.borderWidth > 0 && (
            <div>
              <label className="text-sm font-medium mb-3 block" style={{ color: '#6B6254' }}>
                Couleur bordure
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setLocalSettings(prev => ({ ...prev, borderColor: color }))}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      border: localSettings.borderColor === color ? '3px solid #F5B800' : '2px solid rgba(0,0,0,0.08)',
                      boxShadow: localSettings.borderColor === color ? '0 0 0 2px #FFF8EC' : 'none'
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={localSettings.borderColor}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, borderColor: e.target.value }))}
                  className="w-8 h-8 rounded-full cursor-pointer border-0"
                  style={{ backgroundColor: 'transparent' }}
                />
              </div>
            </div>
          )}

          {/* Flip & Rotate */}
          <div>
            <label className="text-sm font-medium mb-3 block" style={{ color: '#6B6254' }}>
              Rotation & Flip
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={rotateLeft}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#F5EBDD', color: '#F5B800' }}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={rotateRight}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#F5EBDD', color: '#F5B800' }}
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <div className="w-px h-6 mx-2" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />
              <button
                onClick={toggleFlipH}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ 
                  backgroundColor: localSettings.flipH ? '#F5CA3C' : '#F5EBDD', 
                  color: localSettings.flipH ? '#3D3731' : '#F5B800' 
                }}
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>
              <button
                onClick={toggleFlipV}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ 
                  backgroundColor: localSettings.flipV ? '#F5CA3C' : '#F5EBDD', 
                  color: localSettings.flipV ? '#3D3731' : '#F5B800' 
                }}
              >
                <FlipVertical className="w-5 h-5" />
              </button>
              <span className="ml-2 text-sm" style={{ color: '#6B6254' }}>{localSettings.rotation}°</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            style={{ color: '#6B6254', borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
          >
            Réinitialiser
          </Button>
          <Button
            onClick={handleSave}
            style={{ backgroundColor: '#F5B800', color: '#3D3731' }}
          >
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { defaultSettings };
