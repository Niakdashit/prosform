import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Building2, 
  Link, 
  Clock, 
  Gamepad2,
  MessageSquare,
  Star,
  Image,
  Palette,
  Type,
  Plus,
  Trash2,
  CircleDot,
  Sparkles,
  Dice5
} from "lucide-react";
import type { GoogleReviewConfig, GoogleReviewGameType } from './types';
import type { EditorView } from './GoogleReviewBuilder';

interface GoogleReviewSettingsPanelProps {
  config: GoogleReviewConfig;
  activeView: EditorView;
  onUpdateConfig: (updates: Partial<GoogleReviewConfig>) => void;
}

export const GoogleReviewSettingsPanel = ({
  config,
  activeView,
  onUpdateConfig,
}: GoogleReviewSettingsPanelProps) => {

  const updateGeneral = (updates: Partial<GoogleReviewConfig['general']>) => {
    onUpdateConfig({
      general: { ...config.general, ...updates }
    });
  };

  const updateInstructions = (updates: Partial<GoogleReviewConfig['instructions']>) => {
    onUpdateConfig({
      instructions: { ...config.instructions, ...updates }
    });
  };

  const updateReview = (updates: Partial<GoogleReviewConfig['review']>) => {
    onUpdateConfig({
      review: { ...config.review, ...updates }
    });
  };

  const updateNegativeReview = (updates: Partial<GoogleReviewConfig['negativeReview']>) => {
    onUpdateConfig({
      negativeReview: { ...config.negativeReview, ...updates }
    });
  };

  const updateWaiting = (updates: Partial<GoogleReviewConfig['waiting']>) => {
    onUpdateConfig({
      waiting: { ...config.waiting, ...updates }
    });
  };

  const updateGame = (updates: Partial<GoogleReviewConfig['game']>) => {
    onUpdateConfig({
      game: { ...config.game, ...updates }
    });
  };

  const updateResult = (updates: Partial<GoogleReviewConfig['result']>) => {
    onUpdateConfig({
      result: { ...config.result, ...updates }
    });
  };

  const updateWheelConfig = (updates: Partial<NonNullable<GoogleReviewConfig['wheelConfig']>>) => {
    onUpdateConfig({
      wheelConfig: { ...config.wheelConfig, ...updates }
    });
  };

  const updateScratchConfig = (updates: Partial<NonNullable<GoogleReviewConfig['scratchConfig']>>) => {
    onUpdateConfig({
      scratchConfig: { ...config.scratchConfig, ...updates }
    });
  };

  const updateJackpotConfig = (updates: Partial<NonNullable<GoogleReviewConfig['jackpotConfig']>>) => {
    onUpdateConfig({
      jackpotConfig: { ...config.jackpotConfig, ...updates }
    });
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...config.instructions.steps];
    newSteps[index] = value;
    updateInstructions({ steps: newSteps });
  };

  const addStep = () => {
    updateInstructions({ 
      steps: [...config.instructions.steps, 'Nouvelle étape'] 
    });
  };

  const removeStep = (index: number) => {
    if (config.instructions.steps.length > 1) {
      const newSteps = config.instructions.steps.filter((_, i) => i !== index);
      updateInstructions({ steps: newSteps });
    }
  };

  return (
    <aside className="w-80 bg-card border-l border-border flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Paramètres</h3>
        <p className="text-xs text-muted-foreground">
          {activeView === 'instructions' && 'Modale d\'instructions'}
          {activeView === 'review' && 'Page d\'avis'}
          {activeView === 'game' && 'Configuration du jeu'}
          {activeView === 'ending-win' && 'Écran gagnant'}
          {activeView === 'ending-lose' && 'Écran perdant'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Configuration générale - toujours visible */}
          <Accordion type="single" collapsible defaultValue="general">
            <AccordionItem value="general">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Établissement
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs">Nom de l'établissement</Label>
                  <Input
                    value={config.general.businessName}
                    onChange={(e) => updateGeneral({ businessName: e.target.value })}
                    placeholder="Restaurant Paradis"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">URL Google Avis</Label>
                  <Input
                    value={config.general.googleReviewUrl}
                    onChange={(e) => updateGeneral({ googleReviewUrl: e.target.value })}
                    placeholder="https://g.page/r/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Lien de votre fiche Google My Business pour les avis
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Logo (URL)</Label>
                  <Input
                    value={config.general.businessLogo || ''}
                    onChange={(e) => updateGeneral({ businessLogo: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Type de jeu</Label>
                  <Select
                    value={config.general.gameType}
                    onValueChange={(value: GoogleReviewGameType) => updateGeneral({ gameType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wheel">Roue de la fortune</SelectItem>
                      <SelectItem value="scratch">Carte à gratter</SelectItem>
                      <SelectItem value="jackpot">Machine à sous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Durée du timer (secondes)</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[config.general.timerDuration]}
                      onValueChange={([value]) => updateGeneral({ timerDuration: value })}
                      min={10}
                      max={60}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">
                      {config.general.timerDuration}s
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Temps d'attente avant déblocage du jeu
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator />

          {/* Paramètres spécifiques à la vue active */}
          {activeView === 'instructions' && (
            <Accordion type="single" collapsible defaultValue="instructions">
              <AccordionItem value="instructions">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Modale d'instructions
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Titre</Label>
                    <Input
                      value={config.instructions.title}
                      onChange={(e) => updateInstructions({ title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Étapes du parcours</Label>
                    {config.instructions.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">
                          {index + 1}.
                        </span>
                        <Input
                          value={step}
                          onChange={(e) => updateStep(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(index)}
                          disabled={config.instructions.steps.length <= 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addStep}
                      className="w-full"
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      Ajouter une étape
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Texte du bouton</Label>
                    <Input
                      value={config.instructions.buttonText}
                      onChange={(e) => updateInstructions({ buttonText: e.target.value })}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {activeView === 'review' && (
            <>
              <Accordion type="single" collapsible defaultValue="review">
                <AccordionItem value="review">
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Page d'avis
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Titre</Label>
                      <Input
                        value={config.review.title}
                        onChange={(e) => updateReview({ title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Sous-titre</Label>
                      <Textarea
                        value={config.review.subtitle}
                        onChange={(e) => updateReview({ subtitle: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label className="text-xs">Type de notation</Label>
                      <Select
                        value={config.review.ratingType || 'smileys'}
                        onValueChange={(value: 'smileys' | 'stars') => updateReview({ ratingType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smileys">😊 Smileys</SelectItem>
                          <SelectItem value="stars">⭐ Étoiles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {config.review.ratingType !== 'stars' && (
                      <>
                        <Separator />

                        <p className="text-xs font-medium text-muted-foreground">Labels des smileys</p>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-red-500">Horrible</Label>
                            <Input
                              value={config.review.ratings.horrible.label}
                              onChange={(e) => updateReview({
                                ratings: {
                                  ...config.review.ratings,
                                  horrible: { ...config.review.ratings.horrible, label: e.target.value }
                                }
                              })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-yellow-500">Moyen</Label>
                            <Input
                              value={config.review.ratings.moyen.label}
                              onChange={(e) => updateReview({
                                ratings: {
                                  ...config.review.ratings,
                                  moyen: { ...config.review.ratings.moyen, label: e.target.value }
                                }
                              })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-green-500">Excellent</Label>
                            <Input
                              value={config.review.ratings.excellent.label}
                              onChange={(e) => updateReview({
                                ratings: {
                                  ...config.review.ratings,
                                  excellent: { ...config.review.ratings.excellent, label: e.target.value }
                                }
                              })}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="negative">
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Modale avis négatif
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Placeholder du textarea</Label>
                      <Input
                        value={config.negativeReview.placeholder}
                        onChange={(e) => updateNegativeReview({ placeholder: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Texte du bouton</Label>
                      <Input
                        value={config.negativeReview.buttonText}
                        onChange={(e) => updateNegativeReview({ buttonText: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Longueur minimum</Label>
                      <Input
                        type="number"
                        value={config.negativeReview.minLength || 10}
                        onChange={(e) => updateNegativeReview({ minLength: parseInt(e.target.value) })}
                        min={1}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Afficher les étoiles</Label>
                      <Switch
                        checked={config.negativeReview.showStars}
                        onCheckedChange={(checked) => updateNegativeReview({ showStars: checked })}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}

          {activeView === 'game' && (
            <>
              <Accordion type="single" collapsible defaultValue="game">
                <AccordionItem value="game">
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" />
                      Vue du jeu
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Titre</Label>
                      <Input
                        value={config.game.title}
                        onChange={(e) => updateGame({ title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Sous-titre</Label>
                      <Input
                        value={config.game.subtitle}
                        onChange={(e) => updateGame({ subtitle: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Texte du bouton</Label>
                      <Input
                        value={config.game.buttonText}
                        onChange={(e) => updateGame({ buttonText: e.target.value })}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Configuration spécifique selon le type de jeu */}
              {config.general.gameType === 'wheel' && (
                <Accordion type="single" collapsible defaultValue="wheel-config">
                  <AccordionItem value="wheel-config">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <CircleDot className="w-4 h-4" />
                        Roue de la fortune
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
                      <p className="text-xs text-muted-foreground">
                        Configurez les segments dans l'onglet "Style" de la sidebar
                      </p>
                      <div className="space-y-2">
                        <Label className="text-xs">Durée du spin (secondes)</Label>
                        <Slider
                          value={[config.wheelConfig?.spinDuration || 5]}
                          onValueChange={([value]) => updateWheelConfig({ spinDuration: value })}
                          min={2}
                          max={10}
                          step={1}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {config.general.gameType === 'scratch' && (
                <Accordion type="single" collapsible defaultValue="scratch-config">
                  <AccordionItem value="scratch-config">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Carte à gratter
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Largeur (px)</Label>
                        <Slider
                          value={[config.scratchConfig?.width || 280]}
                          onValueChange={([value]) => updateScratchConfig({ width: value })}
                          min={200}
                          max={400}
                          step={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Hauteur (px)</Label>
                        <Slider
                          value={[config.scratchConfig?.height || 180]}
                          onValueChange={([value]) => updateScratchConfig({ height: value })}
                          min={120}
                          max={300}
                          step={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Seuil de révélation (%)</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[config.scratchConfig?.scratchPercentage || 70]}
                            onValueChange={([value]) => updateScratchConfig({ scratchPercentage: value })}
                            min={30}
                            max={90}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-xs w-10 text-right">{config.scratchConfig?.scratchPercentage || 70}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Taille du pinceau</Label>
                        <Slider
                          value={[config.scratchConfig?.brushSize || 30]}
                          onValueChange={([value]) => updateScratchConfig({ brushSize: value })}
                          min={15}
                          max={50}
                          step={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Couleur de grattage</Label>
                        <Input
                          type="color"
                          value={config.scratchConfig?.scratchColor || '#C0C0C0'}
                          onChange={(e) => updateScratchConfig({ scratchColor: e.target.value })}
                          className="h-8 w-full"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {config.general.gameType === 'scratch' && (
                <Accordion type="single" collapsible defaultValue="scratch-cards">
                  <AccordionItem value="scratch-cards">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Cartes ({(config.scratchConfig?.cards || []).length})
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
                      {(config.scratchConfig?.cards || []).map((card, index) => (
                        <div key={card.id} className="p-2 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{card.name}</span>
                            <div className="flex items-center gap-1">
                              <Switch
                                checked={card.isWinning}
                                onCheckedChange={(checked) => {
                                  const cards = [...(config.scratchConfig?.cards || [])];
                                  cards[index] = { ...card, isWinning: checked };
                                  updateScratchConfig({ cards });
                                }}
                              />
                              <span className="text-[10px] text-muted-foreground">
                                {card.isWinning ? 'Gagnant' : 'Perdant'}
                              </span>
                            </div>
                          </div>
                          <Input
                            value={card.name}
                            onChange={(e) => {
                              const cards = [...(config.scratchConfig?.cards || [])];
                              cards[index] = { ...card, name: e.target.value };
                              updateScratchConfig({ cards });
                            }}
                            placeholder="Nom de la carte"
                            className="h-7 text-xs"
                          />
                          <Input
                            value={card.revealText || ''}
                            onChange={(e) => {
                              const cards = [...(config.scratchConfig?.cards || [])];
                              cards[index] = { ...card, revealText: e.target.value };
                              updateScratchConfig({ cards });
                            }}
                            placeholder="Texte révélé (ex: 🎉 Gagné !)"
                            className="h-7 text-xs"
                          />
                          <div className="flex items-center gap-2">
                            <Label className="text-[10px] w-16">Probabilité</Label>
                            <Slider
                              value={[card.probability]}
                              onValueChange={([value]) => {
                                const cards = [...(config.scratchConfig?.cards || [])];
                                cards[index] = { ...card, probability: value };
                                updateScratchConfig({ cards });
                              }}
                              min={1}
                              max={100}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-[10px] w-8">{card.probability}%</span>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const cards = config.scratchConfig?.cards || [];
                          const newCard = {
                            id: `card-${Date.now()}`,
                            name: `Carte ${cards.length + 1}`,
                            revealText: '🎁 Nouveau',
                            probability: 10,
                            isWinning: true,
                          };
                          updateScratchConfig({ cards: [...cards, newCard] });
                        }}
                      >
                        <Plus className="w-3 h-3 mr-2" />
                        Ajouter une carte
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {config.general.gameType === 'jackpot' && (
                <Accordion type="single" collapsible defaultValue="jackpot-config">
                  <AccordionItem value="jackpot-config">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Dice5 className="w-4 h-4" />
                        Machine à sous
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Template</Label>
                        <Select
                          value={config.jackpotConfig?.template || 'jackpot-11'}
                          onValueChange={(value) => updateJackpotConfig({ template: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jackpot-3">Neon Glow</SelectItem>
                            <SelectItem value="jackpot-5">Retro</SelectItem>
                            <SelectItem value="jackpot-6">Modern</SelectItem>
                            <SelectItem value="jackpot-8">Minimal</SelectItem>
                            <SelectItem value="jackpot-9">Cyber</SelectItem>
                            <SelectItem value="jackpot-10">Royal</SelectItem>
                            <SelectItem value="jackpot-11">Diamond</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Durée du spin (ms)</Label>
                        <Slider
                          value={[config.jackpotConfig?.spinDuration || 2000]}
                          onValueChange={([value]) => updateJackpotConfig({ spinDuration: value })}
                          min={1000}
                          max={4000}
                          step={500}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Symboles</Label>
                        <div className="flex flex-wrap gap-2">
                          {(config.jackpotConfig?.symbols || []).map((symbol, index) => (
                            <span key={symbol.id} className="text-2xl">
                              {symbol.emoji || '🍒'}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Les symboles peuvent être modifiés dans les paramètres avancés
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <Accordion type="single" collapsible>
                <AccordionItem value="waiting">
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Écran d'attente
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Titre</Label>
                      <Input
                        value={config.waiting.title}
                        onChange={(e) => updateWaiting({ title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Sous-titre</Label>
                      <Input
                        value={config.waiting.subtitle}
                        onChange={(e) => updateWaiting({ subtitle: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Couleur du spinner</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={config.waiting.spinnerColor || '#F5B800'}
                          onChange={(e) => updateWaiting({ spinnerColor: e.target.value })}
                          className="w-10 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={config.waiting.spinnerColor || '#F5B800'}
                          onChange={(e) => updateWaiting({ spinnerColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}

          {/* Écran gagnant */}
          {activeView === 'ending-win' && (
            <Accordion type="single" collapsible defaultValue="ending-win">
              <AccordionItem value="ending-win">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-500" />
                    Écran gagnant
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Titre</Label>
                    <Input
                      value={config.result.winTitle}
                      onChange={(e) => updateResult({ winTitle: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Sous-titre</Label>
                    <Input
                      value={config.result.winSubtitle}
                      onChange={(e) => updateResult({ winSubtitle: e.target.value })}
                      placeholder="Utilisez {{prize}} pour le nom du lot"
                    />
                  </div>

                  <Separator />

                  <p className="text-xs font-medium text-muted-foreground">Options d'affichage</p>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Afficher le QR Code</Label>
                    <Switch
                      checked={config.result.showQRCode}
                      onCheckedChange={(checked) => updateResult({ showQRCode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Afficher l'image du lot</Label>
                    <Switch
                      checked={config.result.showPrizeImage}
                      onCheckedChange={(checked) => updateResult({ showPrizeImage: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Afficher le numéro gagnant</Label>
                    <Switch
                      checked={config.result.showWinnerNumber}
                      onCheckedChange={(checked) => updateResult({ showWinnerNumber: checked })}
                    />
                  </div>

                  {config.result.showQRCode && (
                    <div className="space-y-2">
                      <Label className="text-xs">Taille du QR Code (px)</Label>
                      <Slider
                        value={[config.result.qrCodeSize || 200]}
                        onValueChange={([value]) => updateResult({ qrCodeSize: value })}
                        min={100}
                        max={300}
                        step={20}
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Écran perdant */}
          {activeView === 'ending-lose' && (
            <Accordion type="single" collapsible defaultValue="ending-lose">
              <AccordionItem value="ending-lose">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-400" />
                    Écran perdant
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Titre</Label>
                    <Input
                      value={config.result.loseTitle}
                      onChange={(e) => updateResult({ loseTitle: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Sous-titre</Label>
                    <Input
                      value={config.result.loseSubtitle}
                      onChange={(e) => updateResult({ loseSubtitle: e.target.value })}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};
