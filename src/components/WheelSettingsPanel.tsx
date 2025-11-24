import { WheelConfig, WheelSegment } from "./WheelBuilder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { LayoutSelector } from "./LayoutSelector";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { WallpaperUploadModal } from "./WallpaperUploadModal";
import { useState } from "react";

interface WheelSettingsPanelProps {
  config: WheelConfig;
  activeView: 'welcome' | 'contact' | 'wheel' | 'ending';
  onUpdateConfig: (updates: Partial<WheelConfig>) => void;
  onUpdateSegment: (id: string, updates: Partial<WheelSegment>) => void;
  onViewModeChange?: (mode: 'desktop' | 'mobile') => void;
}

export const WheelSettingsPanel = ({ 
  config, 
  activeView, 
  onUpdateConfig,
  onUpdateSegment 
}: WheelSettingsPanelProps) => {
  const [wallpaperModalOpen, setWallpaperModalOpen] = useState(false);
  const [activeWallpaperSection, setActiveWallpaperSection] = useState<'welcome' | 'contact' | 'wheel' | 'ending'>('welcome');
  
  const handleWallpaperSelect = (imageUrl: string) => {
    switch (activeWallpaperSection) {
      case 'welcome':
        onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, wallpaperImage: imageUrl } });
        break;
      case 'contact':
        onUpdateConfig({ contactForm: { ...config.contactForm, wallpaperImage: imageUrl } });
        break;
      case 'wheel':
        onUpdateConfig({ wheelScreen: { ...config.wheelScreen, wallpaperImage: imageUrl } });
        break;
      case 'ending':
        onUpdateConfig({ endingScreen: { ...config.endingScreen, wallpaperImage: imageUrl } });
        break;
    }
  };

  const handleRemoveWallpaper = (section: 'welcome' | 'contact' | 'wheel' | 'ending') => {
    switch (section) {
      case 'welcome':
        onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, wallpaperImage: undefined } });
        break;
      case 'contact':
        onUpdateConfig({ contactForm: { ...config.contactForm, wallpaperImage: undefined } });
        break;
      case 'wheel':
        onUpdateConfig({ wheelScreen: { ...config.wheelScreen, wallpaperImage: undefined } });
        break;
      case 'ending':
        onUpdateConfig({ endingScreen: { ...config.endingScreen, wallpaperImage: undefined } });
        break;
    }
  };

  const getCurrentWallpaper = () => {
    switch (activeWallpaperSection) {
      case 'welcome':
        return config.welcomeScreen.wallpaperImage;
      case 'contact':
        return config.contactForm.wallpaperImage;
      case 'wheel':
        return config.wheelScreen.wallpaperImage;
      case 'ending':
        return config.endingScreen.wallpaperImage;
    }
  };
  
  const renderSettings = () => {
    switch (activeView) {
      case 'welcome':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
              <LayoutSelector
                desktopLayout={config.welcomeScreen.desktopLayout}
                mobileLayout={config.welcomeScreen.mobileLayout}
                onDesktopLayoutChange={(layout) => onUpdateConfig({
                  welcomeScreen: { ...config.welcomeScreen, desktopLayout: layout }
                })}
                onMobileLayoutChange={(layout) => onUpdateConfig({
                  welcomeScreen: { ...config.welcomeScreen, mobileLayout: layout }
                })}
              />
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Button text</Label>
              <Input 
                type="text" 
                value={config.welcomeScreen.buttonText}
                onChange={(e) => onUpdateConfig({ 
                  welcomeScreen: { ...config.welcomeScreen, buttonText: e.target.value } 
                })}
                className="text-xs h-8"
              />
            </div>

            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Block spacing: {config.welcomeScreen.blockSpacing}x
              </Label>
              <Slider
                value={[config.welcomeScreen.blockSpacing]}
                onValueChange={([value]) => onUpdateConfig({
                  welcomeScreen: { ...config.welcomeScreen, blockSpacing: value }
                })}
                min={0.5}
                max={3}
                step={0.25}
                className="w-full"
              />
            </div>

            {(config.welcomeScreen.desktopLayout === 'desktop-split' || config.welcomeScreen.mobileLayout === 'mobile-minimal') && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground mb-2 block">Wallpaper image</Label>
                  {config.welcomeScreen.wallpaperImage ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border">
                        <img 
                          src={config.welcomeScreen.wallpaperImage} 
                          alt="Wallpaper preview" 
                          className="w-full h-24 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveWallpaper('welcome')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs h-8"
                        onClick={() => {
                          setActiveWallpaperSection('welcome');
                          setWallpaperModalOpen(true);
                        }}
                      >
                        Changer l'image
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs h-8 justify-start"
                      onClick={() => {
                        setActiveWallpaperSection('welcome');
                        setWallpaperModalOpen(true);
                      }}
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      Ajouter une image
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Overlay opacity: {((config.welcomeScreen.overlayOpacity ?? 0.6) * 100).toFixed(0)}%
                  </Label>
                  <Slider
                    value={[(config.welcomeScreen.overlayOpacity ?? 0.6) * 100]}
                    onValueChange={([value]) => onUpdateConfig({
                      welcomeScreen: { ...config.welcomeScreen, overlayOpacity: value / 100 }
                    })}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
              <LayoutSelector
                desktopLayout={config.contactForm.desktopLayout}
                mobileLayout={config.contactForm.mobileLayout}
                onDesktopLayoutChange={(layout) => onUpdateConfig({
                  contactForm: { ...config.contactForm, desktopLayout: layout }
                })}
                onMobileLayoutChange={(layout) => onUpdateConfig({
                  contactForm: { ...config.contactForm, mobileLayout: layout }
                })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal">Enable contact form</Label>
              <Switch 
                checked={config.contactForm.enabled}
                onCheckedChange={(checked) => onUpdateConfig({ 
                  contactForm: { ...config.contactForm, enabled: checked } 
                })}
                className="scale-90" 
              />
            </div>

            {config.contactForm.enabled && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Form title</Label>
                  <Input 
                    type="text" 
                    value={config.contactForm.title}
                    onChange={(e) => onUpdateConfig({ 
                      contactForm: { ...config.contactForm, title: e.target.value } 
                    })}
                    className="text-xs h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Subtitle</Label>
                  <Input 
                    type="text" 
                    value={config.contactForm.subtitle}
                    onChange={(e) => onUpdateConfig({ 
                      contactForm: { ...config.contactForm, subtitle: e.target.value } 
                    })}
                    className="text-xs h-8"
                  />
                </div>

                <Separator />
                
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Block spacing: {config.contactForm.blockSpacing}x
                  </Label>
                  <Slider
                    value={[config.contactForm.blockSpacing]}
                    onValueChange={([value]) => onUpdateConfig({
                      contactForm: { ...config.contactForm, blockSpacing: value }
                    })}
                    min={0.5}
                    max={3}
                    step={0.25}
                    className="w-full"
                  />
                </div>

                {(config.contactForm.desktopLayout === 'desktop-split' || config.contactForm.mobileLayout === 'mobile-minimal') && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground mb-2 block">Wallpaper image</Label>
                      {config.contactForm.wallpaperImage ? (
                        <div className="space-y-2">
                          <div className="relative rounded-lg overflow-hidden border">
                            <img 
                              src={config.contactForm.wallpaperImage} 
                              alt="Wallpaper preview" 
                              className="w-full h-24 object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => handleRemoveWallpaper('contact')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs h-8"
                            onClick={() => {
                              setActiveWallpaperSection('contact');
                              setWallpaperModalOpen(true);
                            }}
                          >
                            Changer l'image
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs h-8 justify-start"
                          onClick={() => {
                            setActiveWallpaperSection('contact');
                            setWallpaperModalOpen(true);
                          }}
                        >
                          <Upload className="w-3 h-3 mr-2" />
                          Ajouter une image
                        </Button>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Overlay opacity: {((config.contactForm.overlayOpacity ?? 0.6) * 100).toFixed(0)}%
                      </Label>
                      <Slider
                        value={[(config.contactForm.overlayOpacity ?? 0.6) * 100]}
                        onValueChange={([value]) => onUpdateConfig({
                          contactForm: { ...config.contactForm, overlayOpacity: value / 100 }
                        })}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Fields</Label>
                  {config.contactForm.fields.map((field, index) => (
                    <div key={field.type} className="flex items-center justify-between">
                      <Label className="text-xs font-normal capitalize">{field.label}</Label>
                      <Switch 
                        checked={field.required}
                        onCheckedChange={(checked) => {
                          const newFields = [...config.contactForm.fields];
                          newFields[index] = { ...field, required: checked };
                          onUpdateConfig({ 
                            contactForm: { ...config.contactForm, fields: newFields } 
                          });
                        }}
                        className="scale-90" 
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'wheel':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
              <LayoutSelector
                desktopLayout={config.wheelScreen.desktopLayout}
                mobileLayout={config.wheelScreen.mobileLayout}
                onDesktopLayoutChange={(layout) => onUpdateConfig({
                  wheelScreen: { ...config.wheelScreen, desktopLayout: layout }
                })}
                onMobileLayoutChange={(layout) => onUpdateConfig({
                  wheelScreen: { ...config.wheelScreen, mobileLayout: layout }
                })}
              />
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Block spacing: {config.wheelScreen.blockSpacing}x
              </Label>
              <Slider
                value={[config.wheelScreen.blockSpacing]}
                onValueChange={([value]) => onUpdateConfig({
                  wheelScreen: { ...config.wheelScreen, blockSpacing: value }
                })}
                min={0.5}
                max={3}
                step={0.25}
                className="w-full"
              />
            </div>

            {(config.wheelScreen.desktopLayout === 'desktop-split' || config.wheelScreen.mobileLayout === 'mobile-minimal') && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground mb-2 block">Wallpaper image</Label>
                  {config.wheelScreen.wallpaperImage ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border">
                        <img 
                          src={config.wheelScreen.wallpaperImage} 
                          alt="Wallpaper preview" 
                          className="w-full h-24 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveWallpaper('wheel')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs h-8"
                        onClick={() => {
                          setActiveWallpaperSection('wheel');
                          setWallpaperModalOpen(true);
                        }}
                      >
                        Changer l'image
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs h-8 justify-start"
                      onClick={() => {
                        setActiveWallpaperSection('wheel');
                        setWallpaperModalOpen(true);
                      }}
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      Ajouter une image
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Overlay opacity: {((config.wheelScreen.overlayOpacity ?? 0.6) * 100).toFixed(0)}%
                  </Label>
                  <Slider
                    value={[(config.wheelScreen.overlayOpacity ?? 0.6) * 100]}
                    onValueChange={([value]) => onUpdateConfig({
                      wheelScreen: { ...config.wheelScreen, overlayOpacity: value / 100 }
                    })}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </>
            )}
            
            <Separator />
            
            <Label className="text-xs text-muted-foreground">Segments configuration</Label>
            {config.segments.map((segment) => (
              <div key={segment.id} className="p-3 border rounded-lg space-y-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block">Label</Label>
                  <Input 
                    type="text" 
                    value={segment.label}
                    onChange={(e) => onUpdateSegment(segment.id, { label: e.target.value })}
                    className="text-xs h-7"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block">Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={segment.color}
                      onChange={(e) => onUpdateSegment(segment.id, { color: e.target.value })}
                      className="h-7 w-14" 
                    />
                    <Input 
                      type="text" 
                      value={segment.color}
                      onChange={(e) => onUpdateSegment(segment.id, { color: e.target.value })}
                      className="h-7 text-xs flex-1" 
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block">
                    Probability: {segment.probability}%
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={segment.probability || 0}
                    onChange={(e) => onUpdateSegment(segment.id, { probability: parseInt(e.target.value) })}
                    className="w-full h-1.5 accent-primary cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'ending':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
              <LayoutSelector
                desktopLayout={config.endingScreen.desktopLayout}
                mobileLayout={config.endingScreen.mobileLayout}
                onDesktopLayoutChange={(layout) => onUpdateConfig({
                  endingScreen: { ...config.endingScreen, desktopLayout: layout }
                })}
                onMobileLayoutChange={(layout) => onUpdateConfig({
                  endingScreen: { ...config.endingScreen, mobileLayout: layout }
                })}
              />
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Title</Label>
              <Input 
                type="text" 
                value={config.endingScreen.title}
                onChange={(e) => onUpdateConfig({ 
                  endingScreen: { ...config.endingScreen, title: e.target.value } 
                })}
                className="text-xs h-8"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Subtitle</Label>
              <Input 
                type="text" 
                value={config.endingScreen.subtitle}
                onChange={(e) => onUpdateConfig({ 
                  endingScreen: { ...config.endingScreen, subtitle: e.target.value } 
                })}
                className="text-xs h-8"
                placeholder="Use {{prize}} for the won prize"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Utilisez {'{{'} prize{'}}'} pour afficher le lot gagné
              </p>
            </div>

            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Block spacing: {config.endingScreen.blockSpacing}x
              </Label>
              <Slider
                value={[config.endingScreen.blockSpacing]}
                onValueChange={([value]) => onUpdateConfig({
                  endingScreen: { ...config.endingScreen, blockSpacing: value }
                })}
                min={0.5}
                max={3}
                step={0.25}
                className="w-full"
              />
            </div>

            {(config.endingScreen.desktopLayout === 'desktop-split' || config.endingScreen.mobileLayout === 'mobile-minimal') && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground mb-2 block">Wallpaper image</Label>
                  {config.endingScreen.wallpaperImage ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border">
                        <img 
                          src={config.endingScreen.wallpaperImage} 
                          alt="Wallpaper preview" 
                          className="w-full h-24 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveWallpaper('ending')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs h-8"
                        onClick={() => {
                          setActiveWallpaperSection('ending');
                          setWallpaperModalOpen(true);
                        }}
                      >
                        Changer l'image
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs h-8 justify-start"
                      onClick={() => {
                        setActiveWallpaperSection('ending');
                        setWallpaperModalOpen(true);
                      }}
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      Ajouter une image
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Overlay opacity: {((config.endingScreen.overlayOpacity ?? 0.6) * 100).toFixed(0)}%
                  </Label>
                  <Slider
                    value={[(config.endingScreen.overlayOpacity ?? 0.6) * 100]}
                    onValueChange={([value]) => onUpdateConfig({
                      endingScreen: { ...config.endingScreen, overlayOpacity: value / 100 }
                    })}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <>
      <div className="w-[300px] bg-background border-l border-border flex flex-col">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Settings</h3>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4">
            {renderSettings()}
          </div>
        </ScrollArea>
      </div>

      <WallpaperUploadModal
        open={wallpaperModalOpen}
        onOpenChange={setWallpaperModalOpen}
        onImageSelect={handleWallpaperSelect}
        currentImage={getCurrentWallpaper()}
      />
    </>
  );
};
