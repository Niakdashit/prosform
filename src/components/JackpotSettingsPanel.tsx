import { JackpotConfig } from "./JackpotBuilder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { LayoutSelector } from "./LayoutSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackgroundUploader } from "@/components/ui/BackgroundUploader";
import { SettingsSection } from "./ui/SettingsSection";
import { SettingsField } from "./ui/SettingsField";
import { Layout, FileText } from "lucide-react";

interface JackpotSettingsPanelProps {
  config: JackpotConfig;
  activeView: 'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose';
  onUpdateConfig: (updates: Partial<JackpotConfig>) => void;
  onViewModeChange?: (mode: 'desktop' | 'mobile') => void;
}

export const JackpotSettingsPanel = ({ 
  config, 
  activeView, 
  onUpdateConfig
}: JackpotSettingsPanelProps) => {
  
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
          <div className="space-y-6">
            {/* Layout Section */}
            <SettingsSection 
              title="Layout" 
              icon={<Layout className="w-4 h-4" />}
              defaultCollapsed={true}
            >
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
            </SettingsSection>

            <Separator />

            {/* Spacing Section */}
            <SettingsSection 
              title="Spacing" 
              icon={<FileText className="w-4 h-4" />}
            >
              <SettingsField
                label={`Block spacing: ${config.contactForm.blockSpacing}x`}
                help="Adjust vertical spacing between elements"
              >
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
              </SettingsField>
            </SettingsSection>

            <Separator />

            {/* Background Section */}
            {config.welcomeScreen.applyBackgroundToAll ? (
              <div className="text-xs text-muted-foreground italic p-3 rounded-lg bg-muted/50">
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

      case 'jackpot':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Template</Label>
              <Select 
                value={config.jackpotScreen.template}
                onValueChange={(value) => onUpdateConfig({
                  jackpotScreen: { ...config.jackpotScreen, template: value }
                })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jackpot-11" className="text-xs">Classic Gold</SelectItem>
                  <SelectItem value="jackpot-2" className="text-xs">Neon</SelectItem>
                  <SelectItem value="jackpot-3" className="text-xs">Vegas</SelectItem>
                  <SelectItem value="jackpot-4" className="text-xs">Modern</SelectItem>
                  <SelectItem value="jackpot-5" className="text-xs">Retro</SelectItem>
                  <SelectItem value="jackpot-6" className="text-xs">Minimal</SelectItem>
                  <SelectItem value="jackpot-8" className="text-xs">Premium</SelectItem>
                  <SelectItem value="jackpot-9" className="text-xs">Luxury</SelectItem>
                  <SelectItem value="jackpot-10" className="text-xs">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Durée du spin: {config.jackpotScreen.spinDuration}ms
              </Label>
              <Slider
                value={[config.jackpotScreen.spinDuration]}
                onValueChange={([value]) => onUpdateConfig({
                  jackpotScreen: { ...config.jackpotScreen, spinDuration: value }
                })}
                min={1000}
                max={5000}
                step={250}
                className="w-full"
              />
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Block spacing: {config.jackpotScreen.blockSpacing}x
              </Label>
              <Slider
                value={[config.jackpotScreen.blockSpacing]}
                onValueChange={([value]) => onUpdateConfig({
                  jackpotScreen: { ...config.jackpotScreen, blockSpacing: value }
                })}
                min={0.5}
                max={3}
                step={0.25}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Background Image - only show if not applying from Welcome */}
            {config.welcomeScreen.applyBackgroundToAll ? (
              <div className="text-xs text-muted-foreground italic">
                Background appliqué depuis Welcome Screen
              </div>
            ) : (
              <BackgroundUploader
                desktopImage={config.jackpotScreen.backgroundImage}
                mobileImage={config.jackpotScreen.backgroundImageMobile}
                onDesktopImageChange={(image) => onUpdateConfig({
                  jackpotScreen: { ...config.jackpotScreen, backgroundImage: image }
                })}
                onDesktopImageRemove={() => onUpdateConfig({
                  jackpotScreen: { ...config.jackpotScreen, backgroundImage: undefined }
                })}
                onMobileImageChange={(image) => onUpdateConfig({
                  jackpotScreen: { ...config.jackpotScreen, backgroundImageMobile: image }
                })}
                onMobileImageRemove={() => onUpdateConfig({
                  jackpotScreen: { ...config.jackpotScreen, backgroundImageMobile: undefined }
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

            {/* Background Image - only show if not applying from Welcome */}
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

            {/* Background Image - only show if not applying from Welcome */}
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
      case 'jackpot': return 'Jackpot';
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
