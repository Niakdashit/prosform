import { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WheelConfig } from "./WheelBuilder";
import { Plus, Palette, LayoutList, Gift, Home, Mail, Award, GripVertical, MoreVertical, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { WheelBorderStyleSelector } from "@/components/ui/WheelBorderStyleSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WheelSidebarProps {
  config: WheelConfig;
  activeView: 'welcome' | 'contact' | 'wheel' | 'ending';
  onViewSelect: (view: 'welcome' | 'contact' | 'wheel' | 'ending') => void;
  onOpenSegmentsModal: () => void;
  onDuplicateSegment: (id: string) => void;
  onReorderSegments: (startIndex: number, endIndex: number) => void;
  onDeleteSegment: (id: string) => void;
}

export const WheelSidebar = ({
  config,
  activeView,
  onViewSelect,
  onOpenSegmentsModal,
  onDuplicateSegment,
  onReorderSegments,
  onDeleteSegment,
}: WheelSidebarProps) => {
  const { theme, updateTheme } = useTheme();
  const borderColorInputRef = useRef<HTMLInputElement | null>(null);
  const [isWheelSectionOpen, setIsWheelSectionOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
    { id: 'ending' as const, label: 'Ending', icon: Award }
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
                <button 
                  onClick={onOpenSegmentsModal}
                  className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                  title="Configurer les segments"
                >
                  <Plus className="w-4 h-4" />
                </button>
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
                    <p className="text-[10px] text-muted-foreground">
                      {segment.probability}%
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
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="style" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-3 space-y-4 pb-20">
              <div>
                <h3 className="text-sm font-semibold mb-3">Typography</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Global font</Label>
                    <Select value={theme.fontFamily} onValueChange={(value) => updateTheme({ fontFamily: value })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter" className="text-xs">Inter</SelectItem>
                        <SelectItem value="roboto" className="text-xs">Roboto</SelectItem>
                        <SelectItem value="poppins" className="text-xs">Poppins</SelectItem>
                        <SelectItem value="montserrat" className="text-xs">Montserrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Font size</Label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="12"
                        max="20"
                        step="1"
                        value={theme.fontSize}
                        onChange={(e) => updateTheme({ fontSize: parseInt(e.target.value) })}
                        className="w-full h-1.5 accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Small</span>
                        <span>{theme.fontSize}px</span>
                        <span>Large</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Colors</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Text color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={theme.textColor} 
                        onChange={(e) => updateTheme({ textColor: e.target.value })}
                        className="h-8 w-16" 
                      />
                      <Input 
                        type="text" 
                        value={theme.textColor}
                        onChange={(e) => updateTheme({ textColor: e.target.value })}
                        className="h-8 text-xs flex-1" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Background color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={theme.backgroundColor}
                        onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                        className="h-8 w-16" 
                      />
                      <Input 
                        type="text" 
                        value={theme.backgroundColor}
                        onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                        className="h-8 text-xs flex-1" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {activeView === 'wheel' && (
                <>
                  <Separator />

                  <div>
                    <button
                      type="button"
                      onClick={() => setIsWheelSectionOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between mb-1 px-1 py-1 rounded-md hover:bg-muted/60 transition-colors"
                    >
                      <span className="text-sm font-semibold">Wheel</span>
                      <span className="text-xs text-muted-foreground">
                        {isWheelSectionOpen ? 'Masquer' : 'Afficher'}
                      </span>
                    </button>

                    {isWheelSectionOpen && (
                      <div className="space-y-2 mt-1">
                        <Label className="text-xs text-muted-foreground mb-1 block">Border style</Label>
                        <WheelBorderStyleSelector
                          value={theme.wheelBorderStyle}
                          onChange={(value) => {
                            updateTheme({ wheelBorderStyle: value });
                            if (value === 'classic') {
                              // Ouvrir automatiquement le color picker natif
                              setTimeout(() => {
                                if (borderColorInputRef.current) {
                                  borderColorInputRef.current.click();
                                }
                              }, 0);
                            }
                          }}
                        />
                        {theme.wheelBorderStyle === 'classic' && (
                          <div className="mt-2 space-y-1">
                            <Label className="text-xs text-muted-foreground mb-1 block">Border color</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                ref={borderColorInputRef}
                                type="color"
                                value={theme.wheelBorderCustomColor || '#d4d4d8'}
                                onChange={(e) => updateTheme({ wheelBorderCustomColor: e.target.value })}
                                className="h-7 w-10 p-0"
                              />
                              <Input
                                type="text"
                                value={theme.wheelBorderCustomColor || '#d4d4d8'}
                                onChange={(e) => updateTheme({ wheelBorderCustomColor: e.target.value })}
                                className="h-7 text-[11px] flex-1 font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
