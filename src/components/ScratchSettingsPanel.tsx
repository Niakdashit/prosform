import { ScratchConfig } from "./ScratchBuilder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { LayoutSelector } from "./LayoutSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackgroundUploader } from "@/components/ui/BackgroundUploader";

interface ScratchSettingsPanelProps {
  config: ScratchConfig;
  activeView: 'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose';
  onUpdateConfig: (updates: Partial<ScratchConfig>) => void;
  onViewModeChange?: (mode: 'desktop' | 'mobile') => void;
}

export const ScratchSettingsPanel = ({ 
  config, 
  activeView, 
  onUpdateConfig
}: ScratchSettingsPanelProps) => {
  
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
          </div>
        );

      case 'scratch':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Couleur de grattage</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  value={config.scratchScreen.scratchColor}
                  onChange={(e) => onUpdateConfig({
                    scratchScreen: { ...config.scratchScreen, scratchColor: e.target.value }
                  })}
                  className="h-8 w-16" 
                />
                <Input 
                  type="text" 
                  value={config.scratchScreen.scratchColor}
                  onChange={(e) => onUpdateConfig({
                    scratchScreen: { ...config.scratchScreen, scratchColor: e.target.value }
                  })}
                  className="h-8 text-xs flex-1" 
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Largeur de la carte: {config.scratchScreen.cardWidth}px
              </Label>
              <Slider
                value={[config.scratchScreen.cardWidth]}
                onValueChange={([value]) => onUpdateConfig({
                  scratchScreen: { ...config.scratchScreen, cardWidth: value }
                })}
                min={200}
                max={400}
                step={10}
                className="w-full"
              />
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Hauteur de la carte: {config.scratchScreen.cardHeight}px
              </Label>
              <Slider
                value={[config.scratchScreen.cardHeight]}
                onValueChange={([value]) => onUpdateConfig({
                  scratchScreen: { ...config.scratchScreen, cardHeight: value }
                })}
                min={150}
                max={300}
                step={10}
                className="w-full"
              />
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Seuil de révélation: {config.scratchScreen.threshold}%
              </Label>
              <Slider
                value={[config.scratchScreen.threshold]}
                onValueChange={([value]) => onUpdateConfig({
                  scratchScreen: { ...config.scratchScreen, threshold: value }
                })}
                min={50}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Taille du pinceau: {config.scratchScreen.brushSize}px
              </Label>
              <Slider
                value={[config.scratchScreen.brushSize]}
                onValueChange={([value]) => onUpdateConfig({
                  scratchScreen: { ...config.scratchScreen, brushSize: value }
                })}
                min={10}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Block spacing: {config.scratchScreen.blockSpacing}x
              </Label>
              <Slider
                value={[config.scratchScreen.blockSpacing]}
                onValueChange={([value]) => onUpdateConfig({
                  scratchScreen: { ...config.scratchScreen, blockSpacing: value }
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
                desktopImage={config.scratchScreen.backgroundImage}
                mobileImage={config.scratchScreen.backgroundImageMobile}
                onDesktopImageChange={(image) => onUpdateConfig({
                  scratchScreen: { ...config.scratchScreen, backgroundImage: image }
                })}
                onDesktopImageRemove={() => onUpdateConfig({
                  scratchScreen: { ...config.scratchScreen, backgroundImage: undefined }
                })}
                onMobileImageChange={(image) => onUpdateConfig({
                  scratchScreen: { ...config.scratchScreen, backgroundImageMobile: image }
                })}
                onMobileImageRemove={() => onUpdateConfig({
                  scratchScreen: { ...config.scratchScreen, backgroundImageMobile: undefined }
                })}
              />
            )}
          </div>
        );

      case 'ending-win':
        return (
          <div className="space-y-4">
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

  const getViewTitle = () => {
    switch (activeView) {
      case 'welcome': return 'Welcome Screen';
      case 'contact': return 'Contact';
      case 'scratch': return 'Scratch Card';
      case 'ending-win': return 'Ending Gagnant';
      case 'ending-lose': return 'Ending Perdant';
    }
  };

  return (
    <div className="w-[280px] bg-background border-l border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm">Settings</h3>
        <p className="text-xs text-muted-foreground">{getViewTitle()}</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3">
          {renderSettings()}
        </div>
      </ScrollArea>
    </div>
  );
};
