import { WheelConfig, WheelSegment } from "./WheelBuilder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { LayoutSelector } from "./LayoutSelector";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WallpaperUploadModal } from "./WallpaperUploadModal";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { BackgroundUploader } from "@/components/ui/BackgroundUploader";

interface WheelSettingsPanelProps {
  config: WheelConfig;
  activeView: 'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose';
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
  const [activeWallpaperSection, setActiveWallpaperSection] = useState<'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose'>('welcome');
  
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
      case 'ending-win':
        onUpdateConfig({ endingWin: { ...config.endingWin, wallpaperImage: imageUrl } });
        break;
      case 'ending-lose':
        onUpdateConfig({ endingLose: { ...config.endingLose, wallpaperImage: imageUrl } });
        break;
    }
  };

  const handleRemoveWallpaper = (section: 'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose') => {
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
      case 'ending-win':
        onUpdateConfig({ endingWin: { ...config.endingWin, wallpaperImage: undefined } });
        break;
      case 'ending-lose':
        onUpdateConfig({ endingLose: { ...config.endingLose, wallpaperImage: undefined } });
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
      case 'ending-win':
        return config.endingWin.wallpaperImage;
      case 'ending-lose':
        return config.endingLose.wallpaperImage;
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

            {/* Alignment */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Alignment</Label>
              <Select
                value={config.welcomeScreen.alignment || 'left'}
                onValueChange={(value) => onUpdateConfig({
                  welcomeScreen: { ...config.welcomeScreen, alignment: value as 'left' | 'center' | 'right' }
                })}
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

            <Separator />

            {/* Background Image */}
            <BackgroundUploader
              desktopImage={config.welcomeScreen.backgroundImage}
              mobileImage={config.welcomeScreen.backgroundImageMobile}
              onDesktopImageChange={(image) => onUpdateConfig({
                welcomeScreen: { ...config.welcomeScreen, backgroundImage: image }
              })}
              onDesktopImageRemove={() => onUpdateConfig({
                welcomeScreen: { ...config.welcomeScreen, backgroundImage: undefined }
              })}
              onMobileImageChange={(image) => onUpdateConfig({
                welcomeScreen: { ...config.welcomeScreen, backgroundImageMobile: image }
              })}
              onMobileImageRemove={() => onUpdateConfig({
                welcomeScreen: { ...config.welcomeScreen, backgroundImageMobile: undefined }
              })}
              showApplyToAll={true}
              applyToAll={config.welcomeScreen.applyBackgroundToAll}
              onApplyToAllChange={(value) => onUpdateConfig({
                welcomeScreen: { ...config.welcomeScreen, applyBackgroundToAll: value }
              })}
            />
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

                <Separator />

                {/* Background Image */}
                {config.welcomeScreen.applyBackgroundToAll ? (
                  <div className="text-xs text-muted-foreground italic">
                    Background appliqué depuis Welcome Screen
                  </div>
                ) : (
                  <BackgroundUploader
                    desktopImage={config.contactForm.backgroundImage}
                    mobileImage={config.contactForm.backgroundImageMobile}
                    onDesktopImageChange={(image) => onUpdateConfig({
                      contactForm: { ...config.contactForm, backgroundImage: image }
                    })}
                    onDesktopImageRemove={() => onUpdateConfig({
                      contactForm: { ...config.contactForm, backgroundImage: undefined }
                    })}
                    onMobileImageChange={(image) => onUpdateConfig({
                      contactForm: { ...config.contactForm, backgroundImageMobile: image }
                    })}
                    onMobileImageRemove={() => onUpdateConfig({
                      contactForm: { ...config.contactForm, backgroundImageMobile: undefined }
                    })}
                  />
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
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Taille de la roue: {config.wheelScreen.wheelSize || 100}%
              </Label>
              <Slider
                value={[config.wheelScreen.wheelSize || 100]}
                onValueChange={([value]) => onUpdateConfig({
                  wheelScreen: { ...config.wheelScreen, wheelSize: value }
                })}
                min={50}
                max={150}
                step={5}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Background Image */}
            {config.welcomeScreen.applyBackgroundToAll ? (
              <div className="text-xs text-muted-foreground italic">
                Background appliqué depuis Welcome Screen
              </div>
            ) : (
              <BackgroundUploader
                desktopImage={config.wheelScreen.backgroundImage}
                mobileImage={config.wheelScreen.backgroundImageMobile}
                onDesktopImageChange={(image) => onUpdateConfig({
                  wheelScreen: { ...config.wheelScreen, backgroundImage: image }
                })}
                onDesktopImageRemove={() => onUpdateConfig({
                  wheelScreen: { ...config.wheelScreen, backgroundImage: undefined }
                })}
                onMobileImageChange={(image) => onUpdateConfig({
                  wheelScreen: { ...config.wheelScreen, backgroundImageMobile: image }
                })}
                onMobileImageRemove={() => onUpdateConfig({
                  wheelScreen: { ...config.wheelScreen, backgroundImageMobile: undefined }
                })}
              />
            )}
          </div>
        );

      case 'ending-win':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Title</Label>
              <Input 
                type="text" 
                value={config.endingWin.title}
                onChange={(e) => onUpdateConfig({ 
                  endingWin: { ...config.endingWin, title: e.target.value } 
                })}
                className="text-xs h-8"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Subtitle</Label>
              <Input 
                type="text" 
                value={config.endingWin.subtitle}
                onChange={(e) => onUpdateConfig({ 
                  endingWin: { ...config.endingWin, subtitle: e.target.value } 
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
                Block spacing: {config.endingWin.blockSpacing}x
              </Label>
              <Slider
                value={[config.endingWin.blockSpacing]}
                onValueChange={([value]) => onUpdateConfig({
                  endingWin: { ...config.endingWin, blockSpacing: value }
                })}
                min={0.5}
                max={3}
                step={0.25}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Background Image */}
            {config.welcomeScreen.applyBackgroundToAll ? (
              <div className="text-xs text-muted-foreground italic">
                Background appliqué depuis Welcome Screen
              </div>
            ) : (
              <BackgroundUploader
                desktopImage={config.endingWin.backgroundImage}
                mobileImage={config.endingWin.backgroundImageMobile}
                onDesktopImageChange={(image) => onUpdateConfig({
                  endingWin: { ...config.endingWin, backgroundImage: image }
                })}
                onDesktopImageRemove={() => onUpdateConfig({
                  endingWin: { ...config.endingWin, backgroundImage: undefined }
                })}
                onMobileImageChange={(image) => onUpdateConfig({
                  endingWin: { ...config.endingWin, backgroundImageMobile: image }
                })}
                onMobileImageRemove={() => onUpdateConfig({
                  endingWin: { ...config.endingWin, backgroundImageMobile: undefined }
                })}
              />
            )}
          </div>
        );

      case 'ending-lose':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Title</Label>
              <Input 
                type="text" 
                value={config.endingLose.title}
                onChange={(e) => onUpdateConfig({ 
                  endingLose: { ...config.endingLose, title: e.target.value } 
                })}
                className="text-xs h-8"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Subtitle</Label>
              <Input 
                type="text" 
                value={config.endingLose.subtitle}
                onChange={(e) => onUpdateConfig({ 
                  endingLose: { ...config.endingLose, subtitle: e.target.value } 
                })}
                className="text-xs h-8"
              />
            </div>

            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Block spacing: {config.endingLose.blockSpacing}x
              </Label>
              <Slider
                value={[config.endingLose.blockSpacing]}
                onValueChange={([value]) => onUpdateConfig({
                  endingLose: { ...config.endingLose, blockSpacing: value }
                })}
                min={0.5}
                max={3}
                step={0.25}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Background Image */}
            {config.welcomeScreen.applyBackgroundToAll ? (
              <div className="text-xs text-muted-foreground italic">
                Background appliqué depuis Welcome Screen
              </div>
            ) : (
              <BackgroundUploader
                desktopImage={config.endingLose.backgroundImage}
                mobileImage={config.endingLose.backgroundImageMobile}
                onDesktopImageChange={(image) => onUpdateConfig({
                  endingLose: { ...config.endingLose, backgroundImage: image }
                })}
                onDesktopImageRemove={() => onUpdateConfig({
                  endingLose: { ...config.endingLose, backgroundImage: undefined }
                })}
                onMobileImageChange={(image) => onUpdateConfig({
                  endingLose: { ...config.endingLose, backgroundImageMobile: image }
                })}
                onMobileImageRemove={() => onUpdateConfig({
                  endingLose: { ...config.endingLose, backgroundImageMobile: undefined }
                })}
              />
            )}
          </div>
        );
    }
  };

  return (
    <>
      <div className="w-[280px] bg-background border-l border-border flex flex-col">
        <div className="h-12 border-b border-border flex items-center px-3">
          <h3 className="text-sm font-semibold">Settings</h3>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-3 pb-20">
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
