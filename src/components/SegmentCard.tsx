import { useState } from "react";
import { WheelSegment } from "./WheelBuilder";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ChevronDown, ChevronRight, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SegmentCardProps {
  segment: WheelSegment;
  index: number;
  totalSegments: number;
  onUpdate: (id: string, updates: Partial<WheelSegment>) => void;
  onDelete?: (id: string) => void;
}

export const SegmentCard = ({
  segment,
  index,
  totalSegments,
  onUpdate,
  onDelete
}: SegmentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
        
        <div
          className="w-4 h-4 rounded border-2 border-background shadow-sm"
          style={{ backgroundColor: segment.color }}
        />
        
        <div className="flex-1 text-left">
          <div className="text-sm font-medium truncate">{segment.label}</div>
          <div className="text-xs text-muted-foreground">
            {segment.probability}% probability
          </div>
        </div>

        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-2 space-y-4 border-t animate-in slide-in-from-top-2 duration-200">
          {/* Label */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Label</Label>
            <Input
              type="text"
              value={segment.label}
              onChange={(e) => onUpdate(segment.id, { label: e.target.value })}
              className="h-8 text-xs"
              placeholder="e.g., 10% discount"
            />
          </div>

          {/* Color */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={segment.color}
                onChange={(e) => onUpdate(segment.id, { color: e.target.value })}
                className="h-8 w-16 cursor-pointer"
              />
              <Input
                type="text"
                value={segment.color}
                onChange={(e) => onUpdate(segment.id, { color: e.target.value })}
                className="h-8 text-xs flex-1 font-mono"
                placeholder="#FF6B6B"
              />
            </div>
          </div>

          {/* Probability */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">Probability</Label>
              <span className="text-xs font-semibold text-primary">
                {segment.probability}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={segment.probability || 0}
              onChange={(e) => onUpdate(segment.id, { probability: parseInt(e.target.value) })}
              className="w-full h-2 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Delete Button */}
          {totalSegments > 2 && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(segment.id)}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete segment
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
