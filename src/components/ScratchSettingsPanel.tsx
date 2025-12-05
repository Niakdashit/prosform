import { ScratchConfig, ContactField } from "./ScratchBuilder";
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

interface ScratchSettingsPanelProps {
  config: ScratchConfig;
  activeView: 'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose';
  onUpdateConfig: (updates: Partial<ScratchConfig>) => void;
  onViewModeChange?: (mode: 'desktop' | 'mobile') => void;
  hideSpacingAndBackground?: boolean;
  hideLayoutAndAlignment?: boolean;
}

export const ScratchSettingsPanel = ({ 
  config, 
  activeView, 
  onUpdateConfig,
  hideSpacingAndBackground = false,
  hideLayoutAndAlignment = false
}: ScratchSettingsPanelProps) => {
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateModalMode, setTemplateModalMode] = useState<'load' | 'save'>('load');
  const scratchConfig = config;
  
  const renderSettings = () => {
    switch (activeView) {
      case 'welcome':
        return (
          <div className="space-y-4">
            {!hideLayoutAndAlignment && (
              <>
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
                  <LayoutSelector
                    desktopLayout={config.welcomeScreen.desktopLayout}
                    mobileLayout={config.welcomeScreen.mobileLayout}
                    onDesktopLayoutChange={(layout) => onUpdateConfig({
                      welcomeScreen: { ...config.welcomeScreen, desktopLayout: layout, showImage: true }
                    })}
                    onMobileLayoutChange={(layout) => onUpdateConfig({
                      welcomeScreen: { ...config.welcomeScreen, mobileLayout: layout, showImage: true }
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
              </>
            )}
            
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

            {!hideSpacingAndBackground && (
              <>
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
                  overlayEnabled={config.welcomeScreen.overlayEnabled}
                  onOverlayEnabledChange={(value) => onUpdateConfig({
                    welcomeScreen: { ...config.welcomeScreen, overlayEnabled: value }
                  })}
                  overlayColor={config.welcomeScreen.overlayColor || '#000000'}
                  onOverlayColorChange={(color) => onUpdateConfig({
                    welcomeScreen: { ...config.welcomeScreen, overlayColor: color }
                  })}
                  overlayOpacity={config.welcomeScreen.overlayOpacity ?? 50}
                  onOverlayOpacityChange={(opacity) => onUpdateConfig({
                    welcomeScreen: { ...config.welcomeScreen, overlayOpacity: opacity }
                  })}
                />
              </>
            )}
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
                    desktopLayout={scratchConfig.contactForm.desktopLayout}
                    mobileLayout={scratchConfig.contactForm.mobileLayout}
                    onDesktopLayoutChange={(layout) => onUpdateConfig({
                      contactForm: { ...scratchConfig.contactForm, desktopLayout: layout }
                    })}
                    onMobileLayoutChange={(layout) => onUpdateConfig({
                      contactForm: { ...scratchConfig.contactForm, mobileLayout: layout }
                    })}
                    excludeDesktopLayouts={['desktop-split', 'desktop-right-left', 'desktop-centered']}
                    excludeMobileLayouts={['mobile-minimal']}
                  />
                </div>
                
                <Separator />
              </>
            )}
            
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal">Enable contact form</Label>
              <Switch 
                checked={scratchConfig.contactForm.enabled}
                onCheckedChange={(checked) => onUpdateConfig({ 
                  contactForm: { ...scratchConfig.contactForm, enabled: checked } 
                })}
                className="scale-90" 
              />
            </div>

            {scratchConfig.contactForm.enabled && (
              <>
                <Separator />
                
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Form title</Label>
                  <Input 
                    type="text" 
                    value={scratchConfig.contactForm.title}
                    onChange={(e) => onUpdateConfig({ 
                      contactForm: { ...scratchConfig.contactForm, title: e.target.value } 
                    })}
                    className="text-xs h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Subtitle</Label>
                  <Input 
                    type="text" 
                    value={scratchConfig.contactForm.subtitle}
                    onChange={(e) => onUpdateConfig({ 
                      contactForm: { ...scratchConfig.contactForm, subtitle: e.target.value } 
                    })}
                    className="text-xs h-8"
                  />
                </div>

                {!hideSpacingAndBackground && (
                  <>
                    <Separator />
                    
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Block spacing: {scratchConfig.contactForm.blockSpacing}x
                      </Label>
                      <Slider
                        value={[scratchConfig.contactForm.blockSpacing]}
                        onValueChange={([value]) => onUpdateConfig({
                          contactForm: { ...scratchConfig.contactForm, blockSpacing: value }
                        })}
                        min={0.5}
                        max={3}
                        step={0.25}
                        className="w-full"
                      />
                    </div>

                    <Separator />

                    {/* Background Image - masqué pour mobile-centered, desktop-panel, desktop-card */}
                    {scratchConfig.welcomeScreen.applyBackgroundToAll ? (
                      <div className="text-xs text-muted-foreground italic">
                        Background appliqué depuis Welcome Screen
                      </div>
                    ) : (
                      (scratchConfig.contactForm.desktopLayout !== 'desktop-panel' && 
                       scratchConfig.contactForm.desktopLayout !== 'desktop-card' &&
                       scratchConfig.contactForm.mobileLayout !== 'mobile-centered') && (
                        <BackgroundUploader
                          desktopImage={scratchConfig.contactForm.backgroundImage}
                          mobileImage={scratchConfig.contactForm.backgroundImageMobile}
                          onDesktopImageChange={(image) => onUpdateConfig({
                            contactForm: { ...scratchConfig.contactForm, backgroundImage: image }
                          })}
                          onDesktopImageRemove={() => onUpdateConfig({
                            contactForm: { ...scratchConfig.contactForm, backgroundImage: undefined }
                          })}
                          onMobileImageChange={(image) => onUpdateConfig({
                            contactForm: { ...scratchConfig.contactForm, backgroundImageMobile: image }
                          })}
                          onMobileImageRemove={() => onUpdateConfig({
                            contactForm: { ...scratchConfig.contactForm, backgroundImageMobile: undefined }
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
                        {scratchConfig.contactForm.fields.map((field, index) => (
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
                            const newFields = scratchConfig.contactForm.fields.filter((_, i) => i !== index);
                            onUpdateConfig({ 
                              contactForm: { ...scratchConfig.contactForm, fields: newFields } 
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
                              const newFields = [...scratchConfig.contactForm.fields];
                              newFields[index] = { ...field, label: e.target.value };
                              onUpdateConfig({ 
                                contactForm: { ...scratchConfig.contactForm, fields: newFields } 
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
                              const newFields = [...scratchConfig.contactForm.fields];
                              newFields[index] = { ...field, type: value as any };
                              onUpdateConfig({ 
                                contactForm: { ...scratchConfig.contactForm, fields: newFields } 
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
                              const newFields = [...scratchConfig.contactForm.fields];
                              newFields[index] = { ...field, placeholder: e.target.value };
                              onUpdateConfig({ 
                                contactForm: { ...scratchConfig.contactForm, fields: newFields } 
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
                              const newFields = [...scratchConfig.contactForm.fields];
                              newFields[index] = { ...field, helpText: e.target.value };
                              onUpdateConfig({ 
                                contactForm: { ...scratchConfig.contactForm, fields: newFields } 
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
                              const newFields = [...scratchConfig.contactForm.fields];
                              newFields[index] = { 
                                ...field, 
                                options: e.target.value.split('\n').filter(o => o.trim()) 
                              };
                              onUpdateConfig({ 
                                contactForm: { ...scratchConfig.contactForm, fields: newFields } 
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
                            const newFields = [...scratchConfig.contactForm.fields];
                            newFields[index] = { ...field, required: e.target.checked };
                            onUpdateConfig({ 
                              contactForm: { ...scratchConfig.contactForm, fields: newFields } 
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
                            ...scratchConfig.contactForm, 
                            fields: [...scratchConfig.contactForm.fields, newField] 
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
                            ...scratchConfig.contactForm, 
                            fields: [...scratchConfig.contactForm.fields, newField] 
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

      case 'scratch':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Surface de grattage</Label>
              
              {/* Color option */}
              <div className="space-y-2">
                <Label className="text-[11px] text-muted-foreground">Couleur</Label>
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

              {/* Image option */}
              <div className="mt-3">
                <Label className="text-[11px] text-muted-foreground mb-2 block">Ou image</Label>
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            onUpdateConfig({
                              scratchScreen: { 
                                ...config.scratchScreen, 
                                scratchImage: event.target?.result as string 
                              }
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="h-8 text-xs"
                  >
                    Upload image
                  </Button>
                  {config.scratchScreen.scratchImage && (
                    <>
                      <img 
                        src={config.scratchScreen.scratchImage} 
                        alt="Scratch surface" 
                        className="w-12 h-8 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateConfig({
                          scratchScreen: { ...config.scratchScreen, scratchImage: undefined }
                        })}
                        className="h-8 text-xs"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Accordion for Card Settings */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="card-settings" className="border-none">
                <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline py-2">
                  Scratch Card
                </AccordionTrigger>
                <AccordionContent className="pt-3 space-y-4">
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
                      Arrondi des angles: {config.scratchScreen.cardBorderRadius}px
                    </Label>
                    <Slider
                      value={[config.scratchScreen.cardBorderRadius]}
                      onValueChange={([value]) => onUpdateConfig({
                        scratchScreen: { ...config.scratchScreen, cardBorderRadius: value }
                      })}
                      min={0}
                      max={50}
                      step={2}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Épaisseur bordure: {config.scratchScreen.cardBorderWidth}px
                    </Label>
                    <Slider
                      value={[config.scratchScreen.cardBorderWidth]}
                      onValueChange={([value]) => onUpdateConfig({
                        scratchScreen: { ...config.scratchScreen, cardBorderWidth: value }
                      })}
                      min={0}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  {config.scratchScreen.cardBorderWidth > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Couleur de bordure</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={config.scratchScreen.cardBorderColor}
                          onChange={(e) => onUpdateConfig({
                            scratchScreen: { ...config.scratchScreen, cardBorderColor: e.target.value }
                          })}
                          className="h-8 w-16" 
                        />
                        <Input 
                          type="text" 
                          value={config.scratchScreen.cardBorderColor}
                          onChange={(e) => onUpdateConfig({
                            scratchScreen: { ...config.scratchScreen, cardBorderColor: e.target.value }
                          })}
                          className="h-8 text-xs flex-1" 
                        />
                      </div>
                    </div>
                  )}
                  
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {!hideSpacingAndBackground && (
              <>
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
              </>
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

            {!hideSpacingAndBackground && (
              <>
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
              </>
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

            {!hideSpacingAndBackground && (
              <>
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
              </>
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
        currentFields={scratchConfig.contactForm.fields || []}
        onLoad={(fields) => {
          onUpdateConfig({ 
            contactForm: { 
              ...scratchConfig.contactForm, 
              fields: fields as ContactField[] 
            } 
          });
        }}
        onSave={() => {}}
      />
    </>
  );
};
