import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { WheelSegment } from "./WheelBuilder";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    </Dialog>
  );
};
