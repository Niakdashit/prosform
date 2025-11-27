import { JackpotConfig } from "./JackpotBuilder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { LayoutSelector } from "./LayoutSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          </div>
        );

      case 'jackpot':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
              <LayoutSelector
                desktopLayout={config.jackpotScreen.desktopLayout}
                mobileLayout={config.jackpotScreen.mobileLayout}
                onDesktopLayoutChange={(layout) => onUpdateConfig({
                  jackpotScreen: { ...config.jackpotScreen, desktopLayout: layout }
                })}
                onMobileLayoutChange={(layout) => onUpdateConfig({
                  jackpotScreen: { ...config.jackpotScreen, mobileLayout: layout }
                })}
              />
            </div>
            
            <Separator />

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
          </div>
        );

      case 'ending-win':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
              <LayoutSelector
                desktopLayout={config.endingWin.desktopLayout}
                mobileLayout={config.endingWin.mobileLayout}
                onDesktopLayoutChange={(layout) => onUpdateConfig({
                  endingWin: { ...config.endingWin, desktopLayout: layout }
                })}
                onMobileLayoutChange={(layout) => onUpdateConfig({
                  endingWin: { ...config.endingWin, mobileLayout: layout }
                })}
              />
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
          </div>
        );

      case 'ending-lose':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
              <LayoutSelector
                desktopLayout={config.endingLose.desktopLayout}
                mobileLayout={config.endingLose.mobileLayout}
                onDesktopLayoutChange={(layout) => onUpdateConfig({
                  endingLose: { ...config.endingLose, desktopLayout: layout }
                })}
                onMobileLayoutChange={(layout) => onUpdateConfig({
                  endingLose: { ...config.endingLose, mobileLayout: layout }
                })}
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
