import { WheelConfig, WheelSegment } from "./WheelBuilder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { LayoutSelector } from "./LayoutSelector";
import { SettingsSection } from "./ui/SettingsSection";
import { SettingsField } from "./ui/SettingsField";
import { SaveIndicator } from "./ui/SaveIndicator";
import { SegmentCard } from "./SegmentCard";
import { BackgroundUploader } from "@/components/ui/BackgroundUploader";
import { useAutoSave } from "@/hooks/useAutoSave";
import { 
  Layout, 
  FileText, 
  Palette, 
  Target, 
  PartyPopper,
  AlertCircle,
  Plus
} from "lucide-react";
import { useMemo } from "react";

interface WheelSettingsPanelOptimizedProps {
  config: WheelConfig;
  activeView: 'welcome' | 'contact' | 'wheel' | 'ending';
  onUpdateConfig: (updates: Partial<WheelConfig>) => void;
  onUpdateSegment: (id: string, updates: Partial<WheelSegment>) => void;
  onAddSegment?: () => void;
  onDeleteSegment?: (id: string) => void;
}

export const WheelSettingsPanelOptimized = ({ 
  config, 
  activeView, 
  onUpdateConfig,
  onUpdateSegment,
  onAddSegment,
  onDeleteSegment
}: WheelSettingsPanelOptimizedProps) => {
  
  // Auto-save with status indicator
  const { status: saveStatus } = useAutoSave({
    data: config,
    onSave: async (data) => {
      // Simulate save to localStorage or API
      localStorage.setItem('wheel-config', JSON.stringify(data));
      console.log('Config auto-saved', data);
    },
    delay: 1000
  });

  // Calculate total probability for segments
  const totalProbability = useMemo(() => {
    return config.segments.reduce((sum, seg) => sum + (seg.probability || 0), 0);
  }, [config.segments]);

  const renderSettings = () => {
    switch (activeView) {
      case 'welcome':
        return (
          <div className="space-y-6">
            {/* Layout Section */}
            <SettingsSection 
              title="Layout" 
              icon={<Layout className="w-4 h-4" />}
              defaultCollapsed={true}
            >
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
            </SettingsSection>

            <Separator />

            {/* Content Section */}
            <SettingsSection 
              title="Content" 
              icon={<FileText className="w-4 h-4" />}
            >
              <SettingsField
                label="Button text"
                help="Text displayed on the call-to-action button"
              >
                <Input 
                  type="text" 
                  value={config.welcomeScreen.buttonText}
                  onChange={(e) => onUpdateConfig({ 
                    welcomeScreen: { ...config.welcomeScreen, buttonText: e.target.value } 
                  })}
                  className="h-9"
                  placeholder="e.g., Spin the wheel"
                />
              </SettingsField>
            </SettingsSection>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            {/* Form Settings */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div>
                <div className="text-sm font-medium">Enable contact form</div>
              </div>
              <Switch 
                checked={config.contactForm.enabled}
                onCheckedChange={(checked) => onUpdateConfig({ 
                  contactForm: { ...config.contactForm, enabled: checked } 
                })}
              />
            </div>

            {config.contactForm.enabled && (
              <>
                <Separator />

                <SettingsField label="Form title">
                  <Input 
                    type="text" 
                    value={config.contactForm.title}
                    onChange={(e) => onUpdateConfig({ 
                      contactForm: { ...config.contactForm, title: e.target.value } 
                    })}
                    className="h-9"
                  />
                </SettingsField>

                <SettingsField label="Subtitle">
                  <Input 
                    type="text" 
                    value={config.contactForm.subtitle}
                    onChange={(e) => onUpdateConfig({ 
                      contactForm: { ...config.contactForm, subtitle: e.target.value } 
                    })}
                    className="h-9"
                  />
                </SettingsField>

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
              </>
            )}
          </div>
        );

      case 'wheel':
        const isProbabilityValid = totalProbability === 100;
        
        return (
          <div className="space-y-6">
            {/* Layout Section */}
            <SettingsSection 
              title="Layout" 
              icon={<Layout className="w-4 h-4" />}
              defaultCollapsed={true}
            >
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
            </SettingsSection>

            <Separator />

            {/* Segments Section */}
            <SettingsSection 
              title="Segments" 
              icon={<Target className="w-4 h-4" />}
              badge={config.segments.length}
            >
              {/* Probability Summary */}
              <div className={`p-3 rounded-lg border ${
                isProbabilityValid 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Total Probability</span>
                  <span className={`text-sm font-bold ${
                    isProbabilityValid ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {totalProbability}%
                  </span>
                </div>
                <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      isProbabilityValid ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(totalProbability, 100)}%` }}
                  />
                </div>
                {!isProbabilityValid && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>Total should equal 100%</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {onAddSegment && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddSegment}
                    className="flex-1"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const equalProbability = Math.floor(100 / config.segments.length);
                    const remainder = 100 - (equalProbability * config.segments.length);
                    config.segments.forEach((seg, idx) => {
                      onUpdateSegment(seg.id, { 
                        probability: equalProbability + (idx === 0 ? remainder : 0)
                      });
                    });
                  }}
                  className="flex-1"
                >
                  Distribute
                </Button>
              </div>

              {/* Segment Cards */}
              <div className="space-y-2">
                {config.segments.map((segment, index) => (
                  <SegmentCard
                    key={segment.id}
                    segment={segment}
                    index={index}
                    totalSegments={config.segments.length}
                    onUpdate={onUpdateSegment}
                    onDelete={onDeleteSegment}
                  />
                ))}
              </div>
            </SettingsSection>
          </div>
        );

      case 'ending':
        return (
          <div className="space-y-6">
            {/* Content Section */}
            <SettingsSection 
              title="Content" 
              icon={<PartyPopper className="w-4 h-4" />}
            >
              <SettingsField label="Title">
                <Input 
                  type="text" 
                  value={config.endingWin?.title || config.endingLose?.title || ''}
                  onChange={(e) => {
                    if (activeView === 'ending') {
                      onUpdateConfig({ 
                        endingWin: { ...config.endingWin, title: e.target.value } 
                      });
                    }
                  }}
                  className="h-9"
                  placeholder="e.g., Congratulations!"
                />
              </SettingsField>

              <SettingsField 
                label="Subtitle"
                help="Use {{prize}} to display the won prize"
              >
                <Input 
                  type="text" 
                  value={config.endingWin?.subtitle || config.endingLose?.subtitle || ''}
                  onChange={(e) => {
                    if (activeView === 'ending') {
                      onUpdateConfig({ 
                        endingWin: { ...config.endingWin, subtitle: e.target.value } 
                      });
                    }
                  }}
                  className="h-9"
                  placeholder="You won {{prize}}"
                />
                <div className="mt-2 p-2 rounded-md bg-muted text-xs">
                  <span className="font-mono text-primary">{'{{prize}}'}</span>
                  <span className="text-muted-foreground"> will be replaced with the actual prize</span>
                </div>
              </SettingsField>
            </SettingsSection>
          </div>
        );
    }
  };

  return (
    <div className="w-[320px] bg-background border-l border-border flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Settings</h3>
        <SaveIndicator status={saveStatus} />
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {renderSettings()}
        </div>
      </ScrollArea>
    </div>
  );
};
