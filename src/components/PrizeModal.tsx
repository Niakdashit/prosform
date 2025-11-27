import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Percent, Gift, Image as ImageIcon, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Prize } from "./WheelBuilder";

interface JackpotSymbol {
  id: string;
  emoji: string;
  label: string;
  prizeId?: string;
}

interface PrizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prize?: Prize | null;
  onSave: (prize: Prize) => void;
  segments: Array<{ id: string; label: string }>;
  gameType?: 'scratch' | 'wheel' | 'jackpot';
  symbols?: JackpotSymbol[]; // Pour Jackpot
  onAddSymbol?: (emoji: string) => void; // Pour ajouter un symbole personnalisé
}

export const PrizeModal = ({
  open,
  onOpenChange,
  prize,
  onSave,
  segments,
  gameType = 'wheel',
  symbols = [],
  onAddSymbol,
}: PrizeModalProps) => {
  const symbolImageInputRef = useRef<HTMLInputElement>(null);
  const getDefaultFormData = (): Partial<Prize> => ({
    id: `prize-${Date.now()}`,
    name: '',
    description: '',
    quantity: 1,
    remaining: 1,
    value: '',
    attributionMethod: 'probability',
    winProbability: 50,
    timeWindow: 1,
    assignedSegments: [],
    priority: 1,
    maxWinsPerIP: 1,
    maxWinsPerEmail: 1,
    maxWinsPerDevice: 1,
    verificationPeriod: 24,
    notifyAdminOnWin: false,
    notifyAdminOnDepletion: false,
    scratchWinText: '🎉 Gagné !',
    scratchLoseText: 'Dommage...',
    status: 'active'
  });

  const [formData, setFormData] = useState<Partial<Prize>>(prize || getDefaultFormData());

  // Synchroniser formData avec prize quand le modal s'ouvre ou que prize change
  useEffect(() => {
    if (open) {
      if (prize) {
        setFormData(prize);
      } else {
        setFormData(getDefaultFormData());
      }
    }
  }, [open, prize]);

  const handleSave = () => {
    onSave(formData as Prize);
    onOpenChange(false);
  };

  const handleScratchImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'win' | 'lose') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'win') {
          setFormData({ ...formData, scratchWinImage: base64 });
        } else {
          setFormData({ ...formData, scratchLoseImage: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler pour upload d'image comme symbole personnalisé (Jackpot)
  const handleSymbolImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAddSymbol) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onAddSymbol(base64); // Ajouter l'image comme nouveau symbole
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{prize ? 'Modifier le lot' : 'Créer un lot'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            <TabsTrigger value="attribution">Méthode d'attribution</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 px-1">
            <TabsContent value="general" className="space-y-4 mt-0">
              <div>
                <Label>Nom du lot *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nouveau lot"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du lot..."
                  className="mt-1.5 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantité totale *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Valeur (affichage)</Label>
                  <Input
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Ex: 1000€"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attribution" className="space-y-4 mt-0">
              <div>
                <Label>Méthode d'attribution *</Label>
                <Select
                  value={formData.attributionMethod}
                  onValueChange={(value: any) => setFormData({ ...formData, attributionMethod: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="probability">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        Probabilité (tirage aléatoire)
                      </div>
                    </SelectItem>
                    <SelectItem value="calendar">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Calendrier (date/heure précise)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.attributionMethod === 'probability' && (
                <div className="bg-muted/50 border border-muted-foreground/20 rounded-lg p-4 space-y-4">
                  <p className="text-sm text-foreground">
                    Le lot sera attribué aléatoirement selon la probabilité définie.
                  </p>

                  <div>
                    <Label>Probabilité de gain (%)</Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.winProbability || 50}
                        onChange={(e) => setFormData({ ...formData, winProbability: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                        className="w-24"
                      />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${formData.winProbability || 50}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{formData.winProbability || 50}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Chaque participant a {formData.winProbability || 50}% de chance de gagner ce lot
                    </p>
                  </div>
                </div>
              )}

              {/* Contenu révélé (Scratch) - uniquement pour le jeu Scratch */}
              {gameType === 'scratch' && (
              <div className="bg-muted/30 border border-muted-foreground/20 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-medium">Contenu révélé (Scratch)</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Définissez ce que la carte à gratter affiche sous la couverture pour ce lot.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Optionnel</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Texte gagnant</Label>
                    <Input
                      value={formData.scratchWinText || ''}
                      onChange={(e) => setFormData({ ...formData, scratchWinText: e.target.value })}
                      placeholder="Ex: 🎉 Gagné !"
                      className="mt-1.5"
                    />

                    <Label className="mt-3 flex items-center gap-2 text-xs">
                      <ImageIcon className="w-3 h-3" /> Image gagnante
                    </Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => document.getElementById('scratch-win-image-input')?.click()}
                      >
                        Importer une image
                      </Button>
                      {formData.scratchWinImage && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          Image sélectionnée
                        </span>
                      )}
                    </div>
                    {formData.scratchWinImage && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-10 h-10 rounded border overflow-hidden bg-muted flex items-center justify-center">
                          <img
                            src={formData.scratchWinImage}
                            alt="Aperçu image gagnante"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">Aperçu</span>
                      </div>
                    )}
                    <input
                      id="scratch-win-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleScratchImageUpload(e, 'win')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Texte perdant</Label>
                    <Input
                      value={formData.scratchLoseText || ''}
                      onChange={(e) => setFormData({ ...formData, scratchLoseText: e.target.value })}
                      placeholder="Ex: Dommage..."
                      className="mt-1.5"
                    />

                    <Label className="mt-3 flex items-center gap-2 text-xs">
                      <ImageIcon className="w-3 h-3" /> Image perdante
                    </Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => document.getElementById('scratch-lose-image-input')?.click()}
                      >
                        Importer une image
                      </Button>
                      {formData.scratchLoseImage && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          Image sélectionnée
                        </span>
                      )}
                    </div>
                    {formData.scratchLoseImage && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-10 h-10 rounded border overflow-hidden bg-muted flex items-center justify-center">
                          <img
                            src={formData.scratchLoseImage}
                            alt="Aperçu image perdante"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">Aperçu</span>
                      </div>
                    )}
                    <input
                      id="scratch-lose-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleScratchImageUpload(e, 'lose')}
                    />
                  </div>
                </div>
              </div>
              )}

              {formData.attributionMethod === 'calendar' && (
                <div className="bg-muted/50 border border-muted-foreground/20 rounded-lg p-4 space-y-4">
                  <p className="text-sm text-foreground">
                    Le lot sera attribué au participant qui joue exactement à la date et l'heure programmées.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={formData.calendarDate}
                        onChange={(e) => setFormData({ ...formData, calendarDate: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Heure *</Label>
                      <Input
                        type="time"
                        value={formData.calendarTime}
                        onChange={(e) => setFormData({ ...formData, calendarTime: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Fenêtre de temps (minutes)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.timeWindow}
                      onChange={(e) => setFormData({ ...formData, timeWindow: parseInt(e.target.value) })}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      0 = instant précis, 5 = ±5 minutes autour de l'heure programmée
                    </p>
                  </div>
                </div>
              )}
              {/* Section symboles/segments */}
              {(segments.length > 0 || gameType === 'jackpot') && (
                <div className="space-y-4 mt-6">
                  <p className="text-sm text-muted-foreground">
                    {gameType === 'jackpot' 
                      ? 'Sélectionnez le symbole qui fera gagner ce lot (les 3 rouleaux afficheront ce symbole).'
                      : 'Sélectionnez les éléments du jeu qui peuvent remporter ce lot (segments, cartes, symboles...).'}
                  </p>

                  {/* Bouton pour ajouter un symbole personnalisé (Jackpot uniquement) */}
                  {gameType === 'jackpot' && onAddSymbol && (
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => symbolImageInputRef.current?.click()}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Ajouter un symbole personnalisé
                      </Button>
                      <input
                        ref={symbolImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSymbolImageUpload}
                      />
                    </div>
                  )}

                  <div className={gameType === 'jackpot' ? 'grid grid-cols-4 gap-2' : 'space-y-2'}>
                    {(() => {
                      const assignedSegmentIds = formData.assignedSegments || [];
                      const assignedCount = assignedSegmentIds.length;
                      const unassignedCount = segments.length - assignedCount;
                      const totalProbability = formData.winProbability || 0;
                      
                      // Probabilité par segment assigné
                      const perAssignedProbability = assignedCount > 0 ? totalProbability / assignedCount : 0;
                      
                      // Probabilité restante pour les segments non assignés
                      const remainingProbability = 100 - totalProbability;
                      const perUnassignedProbability = unassignedCount > 0 ? remainingProbability / unassignedCount : 0;

                      return segments.map((segment) => {
                        const assigned = assignedSegmentIds.includes(segment.id);
                        
                        // Calculer la probabilité selon si le segment est assigné ou non
                        let segmentProbability: number;
                        if (assigned) {
                          segmentProbability = perAssignedProbability;
                        } else {
                          segmentProbability = perUnassignedProbability;
                        }

                        // Pour Jackpot, vérifier si c'est une image (base64)
                        const isImage = segment.label?.startsWith('data:image');

                        // Affichage différent pour Jackpot (grille de symboles)
                        if (gameType === 'jackpot') {
                          return (
                            <div
                              key={segment.id}
                              onClick={() => {
                                const current = formData.assignedSegments || [];
                                // Pour Jackpot, un seul symbole peut être sélectionné à la fois
                                setFormData({
                                  ...formData,
                                  assignedSegments: assigned ? [] : [segment.id]
                                });
                              }}
                              className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                assigned 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-muted hover:border-muted-foreground/50'
                              }`}
                            >
                              {isImage ? (
                                <img 
                                  src={segment.label} 
                                  alt="Symbole" 
                                  className="w-10 h-10 object-contain"
                                />
                              ) : (
                                <span className="text-3xl">{segment.label}</span>
                              )}
                              {assigned && (
                                <Badge variant="secondary" className="mt-1 text-[10px]">Sélectionné</Badge>
                              )}
                            </div>
                          );
                        }

                        // Affichage standard pour Wheel et Scratch
                        return (
                          <div
                            key={segment.id}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={`segment-${segment.id}`}
                              checked={assigned}
                              onCheckedChange={(checked) => {
                                const current = formData.assignedSegments || [];
                                setFormData({
                                  ...formData,
                                  assignedSegments: checked
                                    ? [...current, segment.id]
                                    : current.filter(id => id !== segment.id)
                                });
                              }}
                            />
                            <div className="flex-1 flex items-center justify-between gap-3">
                              <Label htmlFor={`segment-${segment.id}`} className="cursor-pointer font-normal flex-1">
                                {segment.label}
                              </Label>
                              {formData.attributionMethod === 'probability' && (
                                <span className={`text-xs whitespace-nowrap ${assigned ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                  {segmentProbability.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {(formData.assignedSegments?.length || 0) > 0 && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-2">Éléments sélectionnés :</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.assignedSegments?.map(segmentId => {
                          const segment = segments.find(s => s.id === segmentId);
                          return segment ? (
                            <Badge key={segmentId} variant="secondary">
                              {segment.label}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!formData.name.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};