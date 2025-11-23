import { WheelConfig, WheelSegment } from "./WheelBuilder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LayoutSelector } from "./LayoutSelector";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";

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
  
  const renderSettings = () => {
    switch (activeView) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Layout</Label>
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
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Layout</Label>
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
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Layout</Label>
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
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Layout</Label>
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
          </div>
        );
    }
  };

  return (
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
  );
};
