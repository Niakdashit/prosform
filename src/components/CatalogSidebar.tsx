import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Palette, LayoutList, Gift, GripVertical, MoreVertical, Copy, Trash2, PanelTop, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeStylePanel } from "@/components/ui/ThemeStylePanel";
import { LayoutSettingsPanel } from "./campaign";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CatalogConfig, CatalogItem } from "./CatalogBuilder";

interface CatalogSidebarProps {
  config: CatalogConfig;
  onUpdateConfig: (updates: Partial<CatalogConfig>) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

export const CatalogSidebar = ({
  config,
  onUpdateConfig,
  selectedItemId,
  onSelectItem,
}: CatalogSidebarProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const addItem = () => {
    const newItem: CatalogItem = {
      id: `item-${Date.now()}`,
      title: "Nouvelle campagne",
      description: "Description de la campagne",
      image: "",
      buttonText: "PARTICIPER !",
      link: "",
      isComingSoon: false,
    };
    onUpdateConfig({ items: [...config.items, newItem] });
    onSelectItem(newItem.id);
  };

  const duplicateItem = (id: string) => {
    const index = config.items.findIndex(item => item.id === id);
    if (index === -1) return;
    
    const itemToDuplicate = config.items[index];
    const newItem = {
      ...itemToDuplicate,
      id: `item-${Date.now()}`,
      title: `${itemToDuplicate.title} (copie)`,
    };
    
    const newItems = [...config.items];
    newItems.splice(index + 1, 0, newItem);
    onUpdateConfig({ items: newItems });
  };

  const deleteItem = (id: string) => {
    onUpdateConfig({ items: config.items.filter(item => item.id !== id) });
    if (selectedItemId === id) onSelectItem(null);
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
      const newItems = Array.from(config.items);
      const [removed] = newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, removed);
      onUpdateConfig({ items: newItems });
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-[280px] bg-background border-r border-border flex flex-col">
      <Tabs defaultValue="items" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-2 mt-3 mb-0 h-9">
          <TabsTrigger value="items" className="text-[10px] gap-0.5 px-1.5">
            <LayoutList className="w-3 h-3" />
            <span>Campagnes</span>
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

        <TabsContent value="items" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-3 pb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Campagnes</span>
                <button 
                  onClick={addItem}
                  className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                  title="Ajouter une campagne"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {config.items.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectItem(item.id)}
                  className={cn(
                    "group w-full px-2 py-2.5 rounded-lg mb-1 flex items-center gap-2 transition-all cursor-move",
                    "hover:bg-muted/50",
                    draggedIndex === index && "opacity-50",
                    dragOverIndex === index && "bg-muted",
                    selectedItemId === item.id && "bg-muted border border-primary"
                  )}
                >
                  <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs text-foreground truncate font-medium">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {item.description}
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
                      <DropdownMenuItem onClick={() => duplicateItem(item.id)}>
                        <Copy className="w-3 h-3 mr-2" />
                        Dupliquer
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteItem(item.id)}
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

        <TabsContent value="structure" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Container Width */}
              <div className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" />
                  <span className="font-medium text-sm">Conteneur</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Largeur: {config.containerWidth || 1200}px
                  </Label>
                  <Slider
                    value={[config.containerWidth || 1200]}
                    onValueChange={([v]) => onUpdateConfig({ containerWidth: v })}
                    min={800}
                    max={1920}
                    step={40}
                  />
                </div>
              </div>
            </div>
            <LayoutSettingsPanel 
              layout={config.layout}
              onUpdateLayout={(updates) => onUpdateConfig({ layout: { ...config.layout, ...updates } as any })}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="style" className="flex-1 mt-0 overflow-hidden">
          <ThemeStylePanel hideJackpotSections />
        </TabsContent>
      </Tabs>
    </div>
  );
};
