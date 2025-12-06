import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeStylePanel } from "@/components/ui/ThemeStylePanel";
import { LayoutSettingsPanel } from "@/components/campaign";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MessageSquare, 
  Star, 
  Gamepad2, 
  Trophy, 
  Gift,
  QrCode,
  Clock,
  Building2,
  LayoutList,
  PanelTop,
  Palette,
  Plus,
  GripVertical,
  MoreVertical,
  Copy,
  Trash2,
  CircleDot,
  Sparkles,
  Dice5
} from "lucide-react";
import type { GoogleReviewConfig, GoogleReviewGameType } from './types';
import type { EditorView } from './GoogleReviewBuilder';

interface GoogleReviewSidebarProps {
  config: GoogleReviewConfig;
  activeView: EditorView;
  onViewSelect: (view: EditorView) => void;
  onOpenPrizesModal: () => void;
  onOpenQRCodesModal: () => void;
  onOpenSegmentsModal: () => void;
  onDuplicateSegment: (id: string) => void;
  onDeleteSegment: (id: string) => void;
  onReorderSegments: (startIndex: number, endIndex: number) => void;
  onUpdateConfig: (updates: Partial<GoogleReviewConfig>) => void;
}

// Configuration des labels selon le type de jeu
const getGameLabel = (gameType: GoogleReviewGameType) => {
  switch (gameType) {
    case 'scratch': return { label: 'Jeu', description: 'Carte à gratter', icon: Sparkles };
    case 'jackpot': return { label: 'Jeu', description: 'Machine à sous', icon: Dice5 };
    case 'wheel':
    default: return { label: 'Jeu', description: 'Roue de la fortune', icon: CircleDot };
  }
};

const getViewConfig = (gameType: GoogleReviewGameType): Record<EditorView, { icon: React.ComponentType<{ className?: string }>; label: string; description: string }> => {
  const gameConfig = getGameLabel(gameType);
  return {
    instructions: { 
      icon: MessageSquare, 
      label: 'Instructions', 
      description: 'Modale avec les étapes' 
    },
    review: { 
      icon: Star, 
      label: 'Avis', 
      description: 'Page de notation' 
    },
    game: { 
      icon: gameConfig.icon, 
      label: gameConfig.label, 
      description: gameConfig.description 
    },
    'ending-win': { 
      icon: Trophy, 
      label: 'Écran Gagnant', 
      description: 'Résultat avec lot' 
    },
    'ending-lose': { 
      icon: Gift, 
      label: 'Écran Perdant', 
      description: 'Résultat sans lot' 
    },
  };
};

export const GoogleReviewSidebar = ({
  config,
  activeView,
  onViewSelect,
  onOpenPrizesModal,
  onOpenQRCodesModal,
  onOpenSegmentsModal,
  onDuplicateSegment,
  onDeleteSegment,
  onReorderSegments,
  onUpdateConfig,
}: GoogleReviewSidebarProps) => {
  const { theme } = useTheme();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const segments = config.wheelConfig?.segments || [];
  const gameType = config.general.gameType;
  const viewConfig = getViewConfig(gameType);

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

  return (
    <aside className="w-[280px] bg-card border-r border-border flex flex-col h-full">
      <Tabs defaultValue="views" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-2 mt-3 mb-0 h-9" style={{ width: 'calc(100% - 16px)' }}>
          <TabsTrigger value="views" className="text-[10px] gap-0.5 px-1.5">
            <LayoutList className="w-3 h-3" />
            <span>Vues</span>
          </TabsTrigger>
          <TabsTrigger value="structure" className="text-[10px] gap-0.5 px-1.5">
            <PanelTop className="w-3 h-3" />
            <span>Structure</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="text-[10px] gap-0.5 px-1.5">
            <Palette className="w-3 h-3" />
            <span>Style</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="views" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-3 pb-3">
              {/* Liste des vues */}
              {(Object.entries(viewConfig) as [EditorView, typeof viewConfig[EditorView]][]).map(([view, { icon: Icon, label, description }]) => (
                <button
                  key={view}
                  onClick={() => onViewSelect(view)}
                  className={cn(
                    "w-full px-2 py-2.5 rounded-lg mb-1 flex items-start gap-2 transition-all",
                    "hover:bg-muted/50",
                    activeView === view && "bg-muted"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left min-w-0 pt-1">
                    <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                      {label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{description}</p>
                  </div>
                </button>
              ))}

              <Separator className="my-3" />

              {/* Section spécifique selon le type de jeu */}
              {gameType === 'wheel' && (
                <>
                  {/* Segments de la roue */}
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-sm font-semibold text-foreground">Segments</span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={onOpenPrizesModal}
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

                  {segments.map((segment, index) => (
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
                        <p className="text-[10px] text-muted-foreground">
                          {segment.probability ? `${segment.probability}%` : '--'}
                        </p>
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
                </>
              )}

              {gameType === 'scratch' && (
                <>
                  {/* Cartes à gratter */}
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-sm font-semibold text-foreground">Cartes</span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={onOpenPrizesModal}
                        className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                        title="Gérer les dotations"
                      >
                        <Gift className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const cards = config.scratchConfig?.cards || [];
                          const newCard = {
                            id: `card-${Date.now()}`,
                            name: `Carte ${cards.length + 1}`,
                            revealText: '🎁 Nouveau',
                            probability: 10,
                            isWinning: true,
                          };
                          onUpdateConfig({
                            scratchConfig: {
                              ...config.scratchConfig,
                              cards: [...cards, newCard],
                            }
                          });
                        }}
                        className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                        title="Ajouter une carte"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Liste des cartes */}
                  {(config.scratchConfig?.cards || []).map((card, index) => (
                    <div
                      key={card.id}
                      className={cn(
                        "group w-full px-2 py-2.5 rounded-lg mb-1 flex items-center gap-2 transition-all",
                        "hover:bg-muted/50"
                      )}
                    >
                      <div 
                        className={cn(
                          "w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[10px]",
                          card.isWinning ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        )}
                      >
                        {card.isWinning ? '✓' : '✗'}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-xs text-foreground truncate">
                          {card.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {card.probability}% - {card.revealText}
                        </p>
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
                          <DropdownMenuItem onClick={() => {
                            const cards = config.scratchConfig?.cards || [];
                            const newCard = { ...card, id: `card-${Date.now()}`, name: `${card.name} (copie)` };
                            onUpdateConfig({
                              scratchConfig: {
                                ...config.scratchConfig,
                                cards: [...cards, newCard],
                              }
                            });
                          }}>
                            <Copy className="w-3 h-3 mr-2" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              const cards = config.scratchConfig?.cards || [];
                              onUpdateConfig({
                                scratchConfig: {
                                  ...config.scratchConfig,
                                  cards: cards.filter(c => c.id !== card.id),
                                }
                              });
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}

                  {/* Seuil de révélation */}
                  <div className="px-2 mt-3">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Seuil de révélation</span>
                        <span className="text-xs text-muted-foreground">
                          {config.scratchConfig?.scratchPercentage || 70}%
                        </span>
                      </div>
                      <Slider
                        value={[config.scratchConfig?.scratchPercentage || 70]}
                        onValueChange={([value]) => onUpdateConfig({
                          scratchConfig: {
                            ...config.scratchConfig,
                            scratchPercentage: value,
                          }
                        })}
                        min={30}
                        max={90}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        % à gratter pour révéler le résultat
                      </p>
                    </div>
                  </div>
                </>
              )}

              {gameType === 'jackpot' && (
                <>
                  {/* Configuration Jackpot */}
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-sm font-semibold text-foreground">Machine à sous</span>
                    <button 
                      onClick={onOpenPrizesModal}
                      className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                      title="Gérer les dotations"
                    >
                      <Gift className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="px-2 space-y-2">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Dice5 className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-medium">Symboles</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(config.jackpotConfig?.symbols || []).map((symbol) => (
                          <span key={symbol.id} className="text-lg">
                            {symbol.emoji || '🍒'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium">Durée du spin</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {(config.jackpotConfig?.spinDuration || 2000) / 1000}s
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Separator className="my-3" />

              {/* Raccourcis configuration */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  Configuration
                </p>

                <button
                  onClick={onOpenQRCodesModal}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-all text-left"
                >
                  <QrCode className="w-4 h-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">QR Codes</p>
                    <p className="text-[10px] text-muted-foreground">
                      {config.prizes.reduce((acc, p) => acc + p.qrCodes.length, 0)} code(s)
                    </p>
                  </div>
                </button>

                <div className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-left">
                  <Clock className="w-4 h-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">Timer</p>
                    <p className="text-[10px] text-muted-foreground">
                      {config.general.timerDuration}s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="structure" className="flex-1 mt-0 overflow-hidden">
          <LayoutSettingsPanel 
            layout={config.layout}
            onUpdateLayout={(updates) => onUpdateConfig({ layout: { ...config.layout, ...updates } as any })}
          />
        </TabsContent>

        <TabsContent value="style" className="flex-1 mt-0 overflow-hidden">
          <ThemeStylePanel hideJackpotSections />
        </TabsContent>
      </Tabs>
    </aside>
  );
};
