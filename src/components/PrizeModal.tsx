import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gift } from "lucide-react";
import { useState } from "react";
import { Prize } from "./WheelBuilder";

interface PrizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prize?: Prize | null;
  onSave: (prize: Prize) => void;
  segments: Array<{ id: string; label: string }>;
}

export const PrizeModal = ({
  open,
  onOpenChange,
  prize,
  onSave,
  segments
}: PrizeModalProps) => {
  const [formData, setFormData] = useState<Partial<Prize>>(
    prize || {
      id: `prize-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      remaining: 1,
      value: '',
      attributionMethod: 'instant',
      timeWindow: 1,
      assignedSegments: [],
      priority: 1,
      maxWinsPerIP: 1,
      maxWinsPerEmail: 1,
      maxWinsPerDevice: 1,
      verificationPeriod: 24,
      notifyAdminOnWin: false,
      notifyAdminOnDepletion: false,
      status: 'active'
    }
  );

  const handleSave = () => {
    onSave(formData as Prize);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Créer un lot</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            <TabsTrigger value="attribution">Méthode d'attribution</TabsTrigger>
            <TabsTrigger value="segments">
              Segments de roue
              <Gift className="w-3.5 h-3.5 ml-1.5" />
            </TabsTrigger>
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
                    <SelectItem value="instant">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Instantané (tirage aléatoire)
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

              <details className="border rounded-lg">
                <summary className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-2">
                  <span className="text-sm font-medium">Paramètres avancés</span>
                </summary>
                
                <div className="p-4 space-y-4 border-t">
                  <div>
                    <Label>Ordre de priorité des lots</Label>
                    <Select
                      value={formData.priority?.toString() || "1"}
                      onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Séquentiel (ordre défini)</SelectItem>
                        <SelectItem value="2">Aléatoire</SelectItem>
                        <SelectItem value="3">Par priorité</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Détermine l'ordre dans lequel les lots sont proposés aux participants
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max gains par IP</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.maxWinsPerIP}
                        onChange={(e) => setFormData({ ...formData, maxWinsPerIP: parseInt(e.target.value) })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Max gains par email</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.maxWinsPerEmail}
                        onChange={(e) => setFormData({ ...formData, maxWinsPerEmail: parseInt(e.target.value) })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max gains par appareil</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.maxWinsPerDevice}
                        onChange={(e) => setFormData({ ...formData, maxWinsPerDevice: parseInt(e.target.value) })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Période de vérification (heures)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.verificationPeriod}
                        onChange={(e) => setFormData({ ...formData, verificationPeriod: parseInt(e.target.value) })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="notifyWin"
                        checked={formData.notifyAdminOnWin}
                        onCheckedChange={(checked) => setFormData({ ...formData, notifyAdminOnWin: checked as boolean })}
                      />
                      <Label htmlFor="notifyWin" className="font-normal cursor-pointer">
                        Notifier l'admin quand un lot est gagné
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="notifyDepletion"
                        checked={formData.notifyAdminOnDepletion}
                        onCheckedChange={(checked) => setFormData({ ...formData, notifyAdminOnDepletion: checked as boolean })}
                      />
                      <Label htmlFor="notifyDepletion" className="font-normal cursor-pointer">
                        Notifier l'admin quand un lot est épuisé
                      </Label>
                    </div>
                  </div>
                </div>
              </details>
            </TabsContent>

            <TabsContent value="segments" className="space-y-4 mt-0">
              <p className="text-sm text-muted-foreground">
                Sélectionnez les segments de roue qui peuvent remporter ce lot.
              </p>

              <div className="space-y-2">
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`segment-${segment.id}`}
                      checked={formData.assignedSegments?.includes(segment.id)}
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
                    <Label htmlFor={`segment-${segment.id}`} className="flex-1 cursor-pointer font-normal">
                      {segment.label}
                    </Label>
                  </div>
                ))}
              </div>

              {(formData.assignedSegments?.length || 0) > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Segments sélectionnés :</p>
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