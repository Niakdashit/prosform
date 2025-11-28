import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WheelConfig } from "./WheelBuilder";
import { Plus, Palette, LayoutList, Gift, Home, Mail, Award, GripVertical, MoreVertical, Copy, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { WheelBorderStyleSelector } from "@/components/ui/WheelBorderStyleSelector";
import { ThemeStylePanel } from "@/components/ui/ThemeStylePanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Prize {
  id: string;
  name: string;
  attributionMethod: 'probability' | 'calendar';
  winProbability?: number;
  assignedSegments?: string[];
  status: 'active' | 'depleted' | 'scheduled';
  remaining: number;
}

interface WheelSidebarProps {
  config: WheelConfig;
  activeView: 'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose';
  onViewSelect: (view: 'welcome' | 'contact' | 'wheel' | 'ending-win' | 'ending-lose') => void;
  onOpenSegmentsModal: () => void;
  onDuplicateSegment: (id: string) => void;
  onReorderSegments: (startIndex: number, endIndex: number) => void;
  onDeleteSegment: (id: string) => void;
  onGoToDotation: () => void;
  prizes?: Prize[];
}

export const WheelSidebar = ({
  config,
  activeView,
  onViewSelect,
  onOpenSegmentsModal,
  onDuplicateSegment,
  onReorderSegments,
  onDeleteSegment,
  onGoToDotation,
  prizes = [],
}: WheelSidebarProps) => {
  const { theme } = useTheme();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Vérifier si au moins un lot utilise la méthode probabilité
  const hasProbabilityPrizes = prizes.some(p => 
    p.attributionMethod === 'probability' && 
    p.status === 'active' && 
    p.remaining > 0
  );

  // Vérifier si au moins un lot utilise la méthode calendrier
  const hasCalendarPrizes = prizes.some(p => 
    p.attributionMethod === 'calendar' && 
    p.status === 'active' && 
    p.remaining > 0
  );

  // Calculer la probabilité de chaque segment basée sur les lots
  const getSegmentProbability = (segmentId: string): number => {
    // Filtrer les lots actifs avec probabilité
    const activePrizes = prizes.filter(p => 
      p.attributionMethod === 'probability' && 
      p.status === 'active' && 
      p.remaining > 0
    );

    if (activePrizes.length === 0) {
      // Pas de lots probabilité configurés, répartition égale
      return 100 / config.segments.length;
    }

    // Trouver les lots assignés à ce segment
    const assignedPrizes = activePrizes.filter(p => 
      p.assignedSegments?.includes(segmentId)
    );

    if (assignedPrizes.length > 0) {
      // Somme des probabilités des lots assignés à ce segment
      // divisée par le nombre de segments assignés à chaque lot
      let totalProb = 0;
      for (const prize of assignedPrizes) {
        const assignedCount = prize.assignedSegments?.length || 1;
        totalProb += (prize.winProbability || 0) / assignedCount;
      }
      return totalProb;
    }

    // Segment non assigné : calcul de la probabilité restante
    const totalAssignedProb = activePrizes.reduce((sum, p) => sum + (p.winProbability || 0), 0);
    const remainingProb = Math.max(0, 100 - totalAssignedProb);
    
    // Compter les segments non assignés
    const assignedSegmentIds = new Set(activePrizes.flatMap(p => p.assignedSegments || []));
    const unassignedSegments = config.segments.filter(s => !assignedSegmentIds.has(s.id));
    
    if (unassignedSegments.length > 0 && unassignedSegments.some(s => s.id === segmentId)) {
      return remainingProb / unassignedSegments.length;
    }

    return 0;
  };

  // Obtenir les infos calendrier pour un segment
  const getSegmentCalendarInfo = (segmentId: string): { hasCalendar: boolean; prizeName?: string; date?: string; time?: string } => {
    const calendarPrize = prizes.find(p => 
      p.attributionMethod === 'calendar' && 
      p.status === 'active' && 
      p.remaining > 0 &&
      p.assignedSegments?.includes(segmentId)
    );

    if (calendarPrize) {
      return {
        hasCalendar: true,
        prizeName: calendarPrize.name,
        date: calendarPrize.calendarDate,
        time: calendarPrize.calendarTime
      };
    }

    return { hasCalendar: false };
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    if (dragIndex !== dropIndex) {
      onReorderSegments(dragIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const views = [
    { id: 'welcome' as const, label: 'Welcome', icon: Home },
    { id: 'contact' as const, label: 'Contact', icon: Mail },
    { id: 'wheel' as const, label: 'Roue', icon: Gift },
    { id: 'ending-win' as const, label: 'Ending Gagnant', icon: Award },
    { id: 'ending-lose' as const, label: 'Ending Perdant', icon: Award }
  ];

  return (
    <div className="w-[280px] bg-background border-r border-border flex flex-col">
      <Tabs defaultValue="views" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-2 mt-3 mb-0 h-9">
          <TabsTrigger value="views" className="text-[10px] gap-0.5 px-1.5">
            <LayoutList className="w-3 h-3" />
            <span>Vues</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="text-[10px] gap-0.5 px-1.5">
            <Palette className="w-3 h-3" />
            <span>Style</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="views" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-3 pb-3">
              {views.map((view) => {
                const Icon = view.icon;
                const isActive = view.id === activeView;

                return (
                  <button
                    key={view.id}
                    onClick={() => onViewSelect(view.id)}
                    className={cn(
                      "w-full px-2 py-2.5 rounded-lg mb-1 flex items-start gap-2 transition-all",
                      "hover:bg-muted/50",
                      isActive && "bg-muted"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left min-w-0 pt-1">
                      <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                        {view.label}
                      </p>
                    </div>
                  </button>
                );
              })}

              <Separator className="my-3" />

              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-sm font-semibold text-foreground">Segments</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={onGoToDotation}
                    className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                    title="Gérer les dotations"
                  >
                    <Gift className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={onOpenSegmentsModal}
                    className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                    title="Configurer les segments"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {config.segments.map((segment, index) => (
                <div
                  key={segment.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group w-full px-2 py-2.5 rounded-lg mb-1 flex items-center gap-2 transition-all cursor-move",
                    "hover:bg-muted/50",
                    draggedIndex === index && "opacity-50",
                    dragOverIndex === index && "bg-muted"
                  )}
                >
                  <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <div 
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs text-foreground truncate">
                      {segment.label}
                    </p>
                    {(() => {
                      const calendarInfo = getSegmentCalendarInfo(segment.id);
                      if (calendarInfo.hasCalendar) {
                        // Afficher l'heure programmée pour les lots calendrier
                        return (
                          <p className="text-[10px] text-amber-600 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {calendarInfo.time || '--:--'}
                          </p>
                        );
                      } else if (hasProbabilityPrizes) {
                        // Afficher la probabilité pour les lots probabilité
                        return (
                          <p className="text-[10px] text-muted-foreground">
                            {getSegmentProbability(segment.id).toFixed(0)}%
                          </p>
                        );
                      } else {
                        // Aucun lot configuré
                        return (
                          <p className="text-[10px] text-muted-foreground">
                            --
                          </p>
                        );
                      }
                    })()}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded p-1 transition-all"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDuplicateSegment(segment.id)}>
                        <Copy className="w-3 h-3 mr-2" />
                        Dupliquer
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteSegment(segment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="style" className="flex-1 mt-0 overflow-hidden">
          <ThemeStylePanel hideJackpotSections />
        </TabsContent>
      </Tabs>
    </div>
  );
};
