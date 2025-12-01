import { QuizConfig, QuizQuestion, QuizAnswer } from "./QuizBuilder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutSelector } from "./LayoutSelector";
import { Button } from "@/components/ui/button";
import { Upload, X, Plus, Trash2, Check, AlignCenter, Image, Split } from "lucide-react";
import { WallpaperUploadModal } from "./WallpaperUploadModal";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BackgroundUploader } from "@/components/ui/BackgroundUploader";

interface QuizSettingsPanelProps {
  config: QuizConfig;
  activeView: 'welcome' | 'contact' | 'question' | 'result';
  activeQuestionIndex: number;
  onUpdateConfig: (updates: Partial<QuizConfig>) => void;
  onUpdateQuestion: (index: number, updates: Partial<QuizQuestion>) => void;
  onViewModeChange?: (mode: 'desktop' | 'mobile') => void;
}

export const QuizSettingsPanel = ({ 
  config, 
  activeView,
  activeQuestionIndex,
  onUpdateConfig,
  onUpdateQuestion
}: QuizSettingsPanelProps) => {
  const [wallpaperModalOpen, setWallpaperModalOpen] = useState(false);
  const [activeWallpaperSection, setActiveWallpaperSection] = useState<'welcome' | 'result'>('welcome');
  
  const handleWallpaperSelect = (imageUrl: string) => {
    switch (activeWallpaperSection) {
      case 'welcome':
        onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, wallpaperImage: imageUrl } });
        break;
      case 'result':
        onUpdateConfig({ resultScreen: { ...config.resultScreen, wallpaperImage: imageUrl } });
        break;
    }
  };

  const handleRemoveWallpaper = (section: 'welcome' | 'result') => {
    switch (section) {
      case 'welcome':
        onUpdateConfig({ welcomeScreen: { ...config.welcomeScreen, wallpaperImage: undefined } });
        break;
      case 'result':
        onUpdateConfig({ resultScreen: { ...config.resultScreen, wallpaperImage: undefined } });
        break;
    }
  };

  const handleUpdateAnswer = (answerIndex: number, updates: Partial<QuizAnswer>) => {
    const question = config.questions[activeQuestionIndex];
    const updatedAnswers = question.answers.map((answer, index) => 
      index === answerIndex ? { ...answer, ...updates } : answer
    );
    onUpdateQuestion(activeQuestionIndex, { answers: updatedAnswers });
  };

  const handleAddAnswer = () => {
    const question = config.questions[activeQuestionIndex];
    const newAnswer: QuizAnswer = {
      id: `a${Date.now()}`,
      text: 'Nouvelle réponse',
      isCorrect: false
    };
    onUpdateQuestion(activeQuestionIndex, { 
      answers: [...question.answers, newAnswer] 
    });
  };

  const handleDeleteAnswer = (answerIndex: number) => {
    const question = config.questions[activeQuestionIndex];
    if (question.answers.length <= 2) return; // Minimum 2 réponses
    
    const updatedAnswers = question.answers.filter((_, index) => index !== answerIndex);
    onUpdateQuestion(activeQuestionIndex, { answers: updatedAnswers });
  };

  const handleToggleCorrectAnswer = (answerIndex: number) => {
    const question = config.questions[activeQuestionIndex];
    const updatedAnswers = question.answers.map((answer, index) => ({
      ...answer,
      isCorrect: index === answerIndex ? !answer.isCorrect : answer.isCorrect
    }));
    onUpdateQuestion(activeQuestionIndex, { answers: updatedAnswers });
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
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="time-toggle" className="text-xs font-normal">Time to complete</Label>
                <Switch id="time-toggle" defaultChecked className="scale-90" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="submissions-toggle" className="text-xs font-normal">Number of submissions</Label>
                <Switch id="submissions-toggle" className="scale-90" />
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Button</Label>
              <Input 
                type="text" 
                value={config.welcomeScreen.buttonText || ""}
                onChange={(e) => onUpdateConfig({ 
                  welcomeScreen: { ...config.welcomeScreen, buttonText: e.target.value } 
                })}
                placeholder="Commencer le quiz"
                className="text-xs h-8"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">{(config.welcomeScreen.buttonText || "").length}/24</p>
            </div>

            <Separator />

            {config.welcomeScreen.desktopLayout === 'desktop-left-right' && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Alignment</Label>
                  <Select 
                    value={config.welcomeScreen.splitAlignment || 'left'}
                    onValueChange={(value: 'left' | 'center' | 'right') => onUpdateConfig({
                      welcomeScreen: { ...config.welcomeScreen, splitAlignment: value as any }
                    })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left" className="text-xs">Left</SelectItem>
                      <SelectItem value="center" className="text-xs">Center</SelectItem>
                      <SelectItem value="right" className="text-xs">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
              </>
            )}
            
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
            {/* Form Settings */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div>
                <div className="text-sm font-medium">Contact Form</div>
                <div className="text-xs text-muted-foreground">
                  {config.contactScreen.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <Switch 
                checked={config.contactScreen.enabled}
                onCheckedChange={(checked) => onUpdateConfig({ 
                  contactScreen: { ...config.contactScreen, enabled: checked } 
                })}
              />
            </div>

            {config.contactScreen.enabled && (
              <>
                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
                  <LayoutSelector
                    desktopLayout={config.contactScreen.desktopLayout}
                    mobileLayout={config.contactScreen.mobileLayout}
                    onDesktopLayoutChange={(layout) => onUpdateConfig({
                      contactScreen: { ...config.contactScreen, desktopLayout: layout }
                    })}
                    onMobileLayoutChange={(layout) => onUpdateConfig({
                      contactScreen: { ...config.contactScreen, mobileLayout: layout }
                    })}
                  />
                </div>
                
                <Separator />

                {/* Content Section */}
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground mb-2 block">Content</Label>
                  
                  <div>
                    <Label className="text-xs mb-1.5 block">Form title</Label>
                    <Input 
                      type="text" 
                      value={config.contactScreen.title}
                      onChange={(e) => onUpdateConfig({ 
                        contactScreen: { ...config.contactScreen, title: e.target.value } 
                      })}
                      className="h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-1.5 block">Subtitle</Label>
                    <Input 
                      type="text" 
                      value={config.contactScreen.subtitle}
                      onChange={(e) => onUpdateConfig({ 
                        contactScreen: { ...config.contactScreen, subtitle: e.target.value } 
                      })}
                      className="h-9"
                    />
                  </div>
                </div>

                <Separator />

                {/* Fields Section */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground mb-2 block">Fields ({config.contactScreen.fields.length})</Label>
                  <div className="space-y-2">
                    {config.contactScreen.fields.map((field, index) => (
                      <div 
                        key={field.type} 
                        className="flex items-center justify-between p-2 rounded-md border bg-card"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${field.required ? 'bg-primary' : 'bg-muted-foreground'}`} />
                          <span className="text-sm capitalize">{field.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {field.required ? 'Required' : 'Optional'}
                          </span>
                          <Switch 
                            checked={field.required}
                            onCheckedChange={(checked) => {
                              const newFields = [...config.contactScreen.fields];
                              newFields[index] = { ...field, required: checked };
                              onUpdateConfig({ 
                                contactScreen: { ...config.contactScreen, fields: newFields } 
                              });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Block spacing: {config.contactScreen.blockSpacing}x
                  </Label>
                  <Slider
                    value={[config.contactScreen.blockSpacing]}
                    onValueChange={([value]) => onUpdateConfig({
                      contactScreen: { ...config.contactScreen, blockSpacing: value }
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
                    desktopImage={config.contactScreen.backgroundImage}
                    mobileImage={config.contactScreen.backgroundImageMobile}
                    onDesktopImageChange={(image) => onUpdateConfig({
                      contactScreen: { ...config.contactScreen, backgroundImage: image }
                    })}
                    onDesktopImageRemove={() => onUpdateConfig({
                      contactScreen: { ...config.contactScreen, backgroundImage: undefined }
                    })}
                    onMobileImageChange={(image) => onUpdateConfig({
                      contactScreen: { ...config.contactScreen, backgroundImageMobile: image }
                    })}
                    onMobileImageRemove={() => onUpdateConfig({
                      contactScreen: { ...config.contactScreen, backgroundImageMobile: undefined }
                    })}
                  />
                )}
              </>
            )}
          </div>
        );

      case 'question':
        const question = config.questions[activeQuestionIndex];
        if (!question) return null;

        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Question</Label>
              <Textarea 
                value={question.question}
                onChange={(e) => onUpdateQuestion(activeQuestionIndex, { question: e.target.value })}
                className="text-xs min-h-[80px]"
                placeholder="Entrez votre question..."
              />
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Style des réponses</Label>
              <Select
                value={config.settings.answerStyle || 'filled'}
                onValueChange={(value: 'filled' | 'outline' | 'soft' | 'filled-square') => onUpdateConfig({
                  settings: { ...config.settings, answerStyle: value }
                })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filled" className="text-xs">Plein</SelectItem>
                  <SelectItem value="outline" className="text-xs">Contour</SelectItem>
                  <SelectItem value="soft" className="text-xs">Soft (cadre)</SelectItem>
                  <SelectItem value="filled-square" className="text-xs">Plein (coins carrés)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Points</Label>
              <Input 
                type="number" 
                value={question.points}
                onChange={(e) => onUpdateQuestion(activeQuestionIndex, { points: parseInt(e.target.value) || 0 })}
                className="text-xs h-8"
                min={0}
              />
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Temps limite (secondes)</Label>
              <Input 
                type="number" 
                value={question.timeLimit || 30}
                onChange={(e) => onUpdateQuestion(activeQuestionIndex, { timeLimit: parseInt(e.target.value) || 30 })}
                className="text-xs h-8"
                min={10}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Réponses</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleAddAnswer}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {question.answers.map((answer, index) => (
                  <div key={answer.id} className="flex items-center gap-2">
                    <Button
                      variant={answer.isCorrect ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-6 w-6 p-0 flex-shrink-0",
                        answer.isCorrect && "bg-green-600 hover:bg-green-700"
                      )}
                      onClick={() => handleToggleCorrectAnswer(index)}
                    >
                      {answer.isCorrect && <Check className="w-3 h-3" />}
                    </Button>
                    <Input 
                      value={answer.text}
                      onChange={(e) => handleUpdateAnswer(index, { text: e.target.value })}
                      className="text-xs h-8 flex-1"
                      placeholder={`Réponse ${index + 1}`}
                    />
                    {question.answers.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0 text-destructive"
                        onClick={() => handleDeleteAnswer(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Explication (optionnel)</Label>
              <Textarea 
                value={question.explanation || ''}
                onChange={(e) => onUpdateQuestion(activeQuestionIndex, { explanation: e.target.value })}
                className="text-xs min-h-[60px]"
                placeholder="Expliquez la bonne réponse..."
              />
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Afficher le score</Label>
                <Switch
                  checked={config.resultScreen.showScore}
                  onCheckedChange={(checked) => onUpdateConfig({
                    resultScreen: { ...config.resultScreen, showScore: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Afficher les bonnes réponses</Label>
                <Switch
                  checked={config.resultScreen.showCorrectAnswers}
                  onCheckedChange={(checked) => onUpdateConfig({
                    resultScreen: { ...config.resultScreen, showCorrectAnswers: checked }
                  })}
                />
              </div>
            </div>

            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Block spacing: {config.resultScreen.blockSpacing}x
              </Label>
              <Slider
                value={[config.resultScreen.blockSpacing]}
                onValueChange={([value]) => onUpdateConfig({
                  resultScreen: { ...config.resultScreen, blockSpacing: value }
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
                desktopImage={config.resultScreen.backgroundImage}
                mobileImage={config.resultScreen.backgroundImageMobile}
                onDesktopImageChange={(image) => onUpdateConfig({
                  resultScreen: { ...config.resultScreen, backgroundImage: image }
                })}
                onDesktopImageRemove={() => onUpdateConfig({
                  resultScreen: { ...config.resultScreen, backgroundImage: undefined }
                })}
                onMobileImageChange={(image) => onUpdateConfig({
                  resultScreen: { ...config.resultScreen, backgroundImageMobile: image }
                })}
                onMobileImageRemove={() => onUpdateConfig({
                  resultScreen: { ...config.resultScreen, backgroundImageMobile: undefined }
                })}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-[280px] bg-background border-l border-border flex flex-col">
      <div className="h-12 border-b border-border flex items-center px-3">
        <h3 className="text-sm font-semibold">Settings</h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 pb-20">
          {renderSettings()}
        </div>
      </ScrollArea>

      <WallpaperUploadModal
        open={wallpaperModalOpen}
        onOpenChange={setWallpaperModalOpen}
        onImageSelect={handleWallpaperSelect}
      />
    </div>
  );
};
