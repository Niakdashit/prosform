import { JackpotConfig, ContactField } from "./JackpotBuilder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { LayoutSelector } from "./LayoutSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackgroundUploader } from "@/components/ui/BackgroundUploader";
import { Button } from "@/components/ui/button";
import { X, FolderOpen, Save } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FormTemplateModal } from "./FormTemplateModal";
import { useState } from "react";

interface JackpotSettingsPanelProps {
  config: JackpotConfig;
  activeView: 'welcome' | 'contact' | 'jackpot' | 'ending-win' | 'ending-lose';
  onUpdateConfig: (updates: Partial<JackpotConfig>) => void;
  onViewModeChange?: (mode: 'desktop' | 'mobile') => void;
  hideSpacingAndBackground?: boolean;
  hideLayoutAndAlignment?: boolean;
}

export const JackpotSettingsPanel = ({ 
  config, 
  activeView, 
  onUpdateConfig,
  hideSpacingAndBackground = false,
  hideLayoutAndAlignment = false
}: JackpotSettingsPanelProps) => {
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateModalMode, setTemplateModalMode] = useState<'load' | 'save'>('load');
  const jackpotConfig = config;
  
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
            {!hideLayoutAndAlignment && (
              <>
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
                  <LayoutSelector
                    desktopLayout={jackpotConfig.contactForm.desktopLayout}
                    mobileLayout={jackpotConfig.contactForm.mobileLayout}
                    onDesktopLayoutChange={(layout) => onUpdateConfig({
                      contactForm: { ...jackpotConfig.contactForm, desktopLayout: layout }
                    })}
                    onMobileLayoutChange={(layout) => onUpdateConfig({
                      contactForm: { ...jackpotConfig.contactForm, mobileLayout: layout }
                    })}
                    excludeDesktopLayouts={['desktop-split', 'desktop-right-left', 'desktop-centered']}
                    excludeMobileLayouts={['mobile-centered', 'mobile-minimal']}
                  />
                </div>
                
                <Separator />
              </>
            )}
            
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal">Enable contact form</Label>
              <Switch 
                checked={jackpotConfig.contactForm.enabled}
                onCheckedChange={(checked) => onUpdateConfig({ 
                  contactForm: { ...jackpotConfig.contactForm, enabled: checked } 
                })}
                className="scale-90" 
              />
            </div>

            {jackpotConfig.contactForm.enabled && (
              <>
                <Separator />
                
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Form title</Label>
                  <Input 
                    type="text" 
                    value={jackpotConfig.contactForm.title}
                    onChange={(e) => onUpdateConfig({ 
                      contactForm: { ...jackpotConfig.contactForm, title: e.target.value } 
                    })}
                    className="text-xs h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Subtitle</Label>
                  <Input 
                    type="text" 
                    value={jackpotConfig.contactForm.subtitle}
                    onChange={(e) => onUpdateConfig({ 
                      contactForm: { ...jackpotConfig.contactForm, subtitle: e.target.value } 
                    })}
                    className="text-xs h-8"
                  />
                </div>

                {!hideSpacingAndBackground && (
                  <>
                    <Separator />
                    
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Block spacing: {jackpotConfig.contactForm.blockSpacing}x
                      </Label>
                      <Slider
                        value={[jackpotConfig.contactForm.blockSpacing]}
                        onValueChange={([value]) => onUpdateConfig({
                          contactForm: { ...jackpotConfig.contactForm, blockSpacing: value }
                        })}
                        min={0.5}
                        max={3}
                        step={0.25}
                        className="w-full"
                      />
                    </div>

                    <Separator />

                    {/* Background Image - masqué pour mobile-centered, desktop-panel, desktop-card */}
                    {jackpotConfig.welcomeScreen.applyBackgroundToAll ? (
                      <div className="text-xs text-muted-foreground italic">
                        Background appliqué depuis Welcome Screen
                      </div>
                    ) : (
                      (jackpotConfig.contactForm.desktopLayout !== 'desktop-panel' && 
                       jackpotConfig.contactForm.desktopLayout !== 'desktop-card' &&
                       jackpotConfig.contactForm.mobileLayout !== 'mobile-centered') && (
                        <BackgroundUploader
                          desktopImage={jackpotConfig.contactForm.backgroundImage}
                          mobileImage={jackpotConfig.contactForm.backgroundImageMobile}
                          onDesktopImageChange={(image) => onUpdateConfig({
                            contactForm: { ...jackpotConfig.contactForm, backgroundImage: image }
                          })}
                          onDesktopImageRemove={() => onUpdateConfig({
                            contactForm: { ...jackpotConfig.contactForm, backgroundImage: undefined }
                          })}
                          onMobileImageChange={(image) => onUpdateConfig({
                            contactForm: { ...jackpotConfig.contactForm, backgroundImageMobile: image }
                          })}
                          onMobileImageRemove={() => onUpdateConfig({
                            contactForm: { ...jackpotConfig.contactForm, backgroundImageMobile: undefined }
                          })}
                        />
                      )
                    )}

                    <Separator />
                  </>
                )}

                {/* Form Template Actions */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="templates" className="border-none">
                    <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline py-2">
                      Gérer les templates
                    </AccordionTrigger>
                    <AccordionContent className="pt-3 space-y-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTemplateModalMode('load');
                            setTemplateModalOpen(true);
                          }}
                          className="flex-1"
                        >
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Charger
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTemplateModalMode('save');
                            setTemplateModalOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                      </div>
                
                      <Separator />

                      {/* Fields Manager */}
                      <div className="space-y-3">
                        {jackpotConfig.contactForm.fields.map((field, index) => (
                    <div key={field.type} className="border border-gray-200 rounded-lg p-3 bg-white">
                      {/* Field Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 cursor-move">⊕</span>
                          <span className="text-gray-400">▢</span>
                          <span className="font-medium text-sm text-gray-800">{field.label}</span>
                        </div>
                        <button 
                          onClick={() => {
                            const newFields = jackpotConfig.contactForm.fields.filter((_, i) => i !== index);
                            onUpdateConfig({ 
                              contactForm: { ...jackpotConfig.contactForm, fields: newFields } 
                            });
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Field Settings */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Label du champ</Label>
                          <Input 
                            type="text" 
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...jackpotConfig.contactForm.fields];
                              newFields[index] = { ...field, label: e.target.value };
                              onUpdateConfig({ 
                                contactForm: { ...jackpotConfig.contactForm, fields: newFields } 
                              });
                            }}
                            className="text-xs h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Type de champ</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => {
                              const newFields = [...jackpotConfig.contactForm.fields];
                              newFields[index] = { ...field, type: value as any };
                              onUpdateConfig({ 
                                contactForm: { ...jackpotConfig.contactForm, fields: newFields } 
                              });
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texte</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="tel">Téléphone</SelectItem>
                              <SelectItem value="select">Liste déroulante</SelectItem>
                              <SelectItem value="textarea">Zone de texte</SelectItem>
                              <SelectItem value="checkbox">Case à cocher (opt-in)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Placeholder for text, email, tel, textarea */}
                      {['text', 'email', 'tel', 'textarea'].includes(field.type) && (
                        <div className="mb-3">
                          <Label className="text-xs text-gray-500 mb-1 block">Placeholder</Label>
                          <Input 
                            type="text" 
                            value={field.placeholder || ''}
                            placeholder="Texte indicatif..."
                            onChange={(e) => {
                              const newFields = [...jackpotConfig.contactForm.fields];
                              newFields[index] = { ...field, placeholder: e.target.value };
                              onUpdateConfig({ 
                                contactForm: { ...jackpotConfig.contactForm, fields: newFields } 
                              });
                            }}
                            className="text-xs h-8"
                          />
                        </div>
                      )}

                      {/* Help text for checkbox */}
                      {field.type === 'checkbox' && (
                        <div className="mb-3">
                          <Label className="text-xs text-gray-500 mb-1 block">Texte d'aide (RGPD)</Label>
                          <Input 
                            type="text" 
                            value={field.helpText || ''}
                            placeholder="Ex: Vous pouvez vous désabonner à tout moment"
                            onChange={(e) => {
                              const newFields = [...jackpotConfig.contactForm.fields];
                              newFields[index] = { ...field, helpText: e.target.value };
                              onUpdateConfig({ 
                                contactForm: { ...jackpotConfig.contactForm, fields: newFields } 
                              });
                            }}
                            className="text-xs h-8"
                          />
                        </div>
                      )}

                      {/* Options for select */}
                      {field.type === 'select' && (
                        <div className="mb-3">
                          <Label className="text-xs text-gray-500 mb-1 block">Options (une par ligne)</Label>
                          <textarea
                            value={(field.options || []).join('\n')}
                            onChange={(e) => {
                              const newFields = [...jackpotConfig.contactForm.fields];
                              newFields[index] = { 
                                ...field, 
                                options: e.target.value.split('\n').filter(o => o.trim()) 
                              };
                              onUpdateConfig({ 
                                contactForm: { ...jackpotConfig.contactForm, fields: newFields } 
                              });
                            }}
                            className="w-full px-2 py-1 text-xs border rounded min-h-[60px]"
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                          />
                        </div>
                      )}
                      
                      {/* Required Checkbox */}
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const newFields = [...jackpotConfig.contactForm.fields];
                            newFields[index] = { ...field, required: e.target.checked };
                            onUpdateConfig({ 
                              contactForm: { ...jackpotConfig.contactForm, fields: newFields } 
                            });
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-[#3d3731] focus:ring-[#3d3731]"
                        />
                        <Label className="text-xs text-gray-600">Champ obligatoire</Label>
                      </div>
                    </div>
                  ))}
                  
                   {/* Add Field Button */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      onClick={() => {
                        const newField: ContactField = {
                          id: 'field_' + Date.now(),
                          type: 'text',
                          label: 'Nouveau champ',
                          placeholder: '',
                          required: false
                        };
                        onUpdateConfig({ 
                          contactForm: { 
                            ...jackpotConfig.contactForm, 
                            fields: [...jackpotConfig.contactForm.fields, newField] 
                          } 
                        });
                      }}
                      className="h-9 bg-[#3d3731] hover:bg-[#2d2721] text-white text-xs"
                    >
                      + Ajouter un champ
                    </Button>
                    <Button
                      onClick={() => {
                        const newField: ContactField = {
                          id: 'optin_' + Date.now(),
                          type: 'checkbox',
                          label: 'J\'accepte de recevoir des communications marketing',
                          helpText: 'Conformément au RGPD, vous pouvez vous désabonner à tout moment',
                          required: true
                        };
                        onUpdateConfig({ 
                          contactForm: { 
                            ...jackpotConfig.contactForm, 
                            fields: [...jackpotConfig.contactForm.fields, newField] 
                          } 
                        });
                      }}
                      variant="outline"
                      className="h-9 text-xs"
                    >
                      + Ajouter un opt-in RGPD
                    </Button>
                  </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
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
    <>
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
      
      <FormTemplateModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        mode={templateModalMode}
        currentFields={jackpotConfig.contactForm.fields || []}
        onLoad={(fields) => {
          onUpdateConfig({ 
            contactForm: { 
              ...jackpotConfig.contactForm, 
              fields: fields as ContactField[] 
            } 
          });
        }}
        onSave={() => {}}
      />
    </>
  );
};
