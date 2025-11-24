import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, Image as ImageIcon, X, Gift } from "lucide-react";
import { WheelSegment } from "./WheelBuilder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface SegmentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segments: WheelSegment[];
  onUpdateSegment: (id: string, updates: Partial<WheelSegment>) => void;
  onAddSegment: () => void;
  onDeleteSegment: (id: string) => void;
}

export const SegmentsModal = ({
  open,
  onOpenChange,
  segments,
  onUpdateSegment,
  onAddSegment,
  onDeleteSegment
}: SegmentsModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSegmentIdRef = useRef<string | null>(null);
  const [customPrizes, setCustomPrizes] = useState<Array<{ id: string; name: string }>>([]);
  const [isAddingPrize, setIsAddingPrize] = useState(false);
  const [newPrizeName, setNewPrizeName] = useState("");

  // Liste de lots prédéfinis + lots personnalisés
  const availablePrizes = [
    { id: "none", name: "Aucun lot" },
    { id: "prize1", name: "10% de réduction" },
    { id: "prize2", name: "Livraison gratuite" },
    { id: "prize3", name: "20% de réduction" },
    { id: "prize4", name: "Cadeau surprise" },
    { id: "prize5", name: "15% de réduction" },
    { id: "prize6", name: "Bon d'achat 50€" },
    ...customPrizes,
  ];

  const handleAddCustomPrize = () => {
    if (newPrizeName.trim()) {
      const newPrize = {
        id: `custom-${Date.now()}`,
        name: newPrizeName.trim()
      };
      setCustomPrizes([...customPrizes, newPrize]);
      setNewPrizeName("");
      setIsAddingPrize(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentSegmentIdRef.current) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSegment(currentSegmentIdRef.current!, { icon: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openImageUpload = (segmentId: string) => {
    currentSegmentIdRef.current = segmentId;
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Configuration des segments</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {segments.map((segment, index) => (
              <div 
                key={segment.id} 
                className="p-4 border rounded-lg space-y-3 bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <span className="text-sm font-medium">Segment {index + 1}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDeleteSegment(segment.id)}
                    disabled={segments.length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Label</Label>
                  <Input 
                    type="text" 
                    value={segment.label}
                    onChange={(e) => onUpdateSegment(segment.id, { label: e.target.value })}
                    className="text-sm h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Couleur</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={segment.color}
                        onChange={(e) => onUpdateSegment(segment.id, { color: e.target.value })}
                        className="h-9 w-16 cursor-pointer" 
                      />
                      <Input 
                        type="text" 
                        value={segment.color}
                        onChange={(e) => onUpdateSegment(segment.id, { color: e.target.value })}
                        className="h-9 text-sm flex-1" 
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Image</Label>
                    {segment.icon ? (
                      <div className="relative h-9 border rounded-md overflow-hidden flex items-center justify-center bg-muted">
                        <img 
                          src={segment.icon} 
                          alt={segment.label}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0 h-6 w-6 bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                          onClick={() => onUpdateSegment(segment.id, { icon: undefined })}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="h-9 w-full gap-2"
                        onClick={() => openImageUpload(segment.id)}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Ajouter
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Probabilité: {segment.probability}%
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={segment.probability || 0}
                    onChange={(e) => onUpdateSegment(segment.id, { probability: parseInt(e.target.value) })}
                    className="w-full h-2 accent-primary cursor-pointer"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" />
                    Lot associé
                  </Label>
                  <Select 
                    value={(segment as any).prizeId || "none"} 
                    onValueChange={(value) => onUpdateSegment(segment.id, { prizeId: value } as any)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Sélectionner un lot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePrizes.map((prize) => (
                        <SelectItem key={prize.id} value={prize.id} className="text-sm">
                          {prize.name}
                        </SelectItem>
                      ))}
                      <Separator className="my-1" />
                      {!isAddingPrize ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-8 text-xs"
                          onClick={() => setIsAddingPrize(true)}
                        >
                          <Plus className="w-3 h-3 mr-2" />
                          Créer un nouveau lot
                        </Button>
                      ) : (
                        <div className="p-2 space-y-2">
                          <Input
                            placeholder="Nom du lot"
                            value={newPrizeName}
                            onChange={(e) => setNewPrizeName(e.target.value)}
                            className="h-8 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddCustomPrize();
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-xs flex-1"
                              onClick={handleAddCustomPrize}
                            >
                              Ajouter
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => {
                                setIsAddingPrize(false);
                                setNewPrizeName("");
                              }}
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={onAddSegment}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter un segment
          </Button>
          
          <Button onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </Dialog>
  );
};
