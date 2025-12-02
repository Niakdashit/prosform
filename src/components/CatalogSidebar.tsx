import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Palette, LayoutList, GripVertical, MoreVertical, Copy, Trash2, PanelTop, Maximize2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeStylePanel } from "@/components/ui/ThemeStylePanel";
import { LayoutSettingsPanel } from "./campaign";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CatalogConfig, CatalogItem, CatalogCategory } from "./CatalogBuilder";

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
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);

  const addItem = (categoryId?: string) => {
    const newItem: CatalogItem = {
      id: `item-${Date.now()}`,
      title: "Nouvelle campagne",
      description: "Description de la campagne",
      image: "",
      buttonText: "PARTICIPER !",
      link: "",
      isComingSoon: false,
      categoryId,
    };
    onUpdateConfig({ items: [...config.items, newItem] });
    onSelectItem(newItem.id);
  };

  const addCategory = () => {
    const newCat: CatalogCategory = {
      id: `cat-${Date.now()}`,
      title: "Nouvelle catégorie",
    };
    onUpdateConfig({ categories: [...(config.categories || []), newCat] });
  };

  // Group items by category
  const getItemsByCategory = () => {
    const categories = config.categories || [];
    const itemsWithoutCategory = config.items.filter(item => !item.categoryId);
    
    return {
      categories: categories.map(cat => ({
        ...cat,
        items: config.items.filter(item => item.categoryId === cat.id)
      })),
      uncategorized: itemsWithoutCategory
    };
  };

  const grouped = getItemsByCategory();

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
    setDragOverCategoryId(null);
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
    setDragOverCategoryId(null);
  };

  const handleCategoryDragOver = (e: React.DragEvent, categoryId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategoryId(categoryId);
  };

  const handleCategoryDrop = (e: React.DragEvent, categoryId: string | undefined) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    if (!isNaN(dragIndex) && dragIndex >= 0 && dragIndex < config.items.length) {
      const newItems = [...config.items];
      newItems[dragIndex] = { ...newItems[dragIndex], categoryId };
      onUpdateConfig({ items: newItems });
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragOverCategoryId(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragOverCategoryId(null);
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
            <div className="p-3 pb-3 w-[256px]">
              {/* Header with add buttons */}
              <div className="mb-3">
                <span className="text-sm font-semibold text-foreground">Campagnes</span>
                <div className="flex gap-1 mt-2">
                  <button 
                    onClick={() => addItem()}
                    className="h-6 px-2 rounded hover:bg-muted flex items-center gap-1 transition-colors text-xs border border-border"
                  >
                    <Plus className="w-3 h-3" />
                    Campagne
                  </button>
                  <button 
                    onClick={addCategory}
                    className="h-6 px-2 rounded hover:bg-muted flex items-center gap-1 transition-colors text-xs border border-border"
                  >
                    <Plus className="w-3 h-3" />
                    Catégorie
                  </button>
                </div>
              </div>
              
              {/* Categories with their items */}
              {grouped.categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className={cn(
                    "mb-4 rounded-lg transition-colors",
                    dragOverCategoryId === cat.id && draggedIndex !== null && "bg-primary/10 ring-2 ring-primary/30"
                  )}
                  onDragOver={(e) => handleCategoryDragOver(e, cat.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleCategoryDrop(e, cat.id)}
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {cat.title}
                    </span>
                    <button 
                      onClick={() => addItem(cat.id)}
                      className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center transition-colors"
                      title={`Ajouter à ${cat.title}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {cat.items.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground px-2 py-2">Aucune campagne (glisser ici)</p>
                  ) : (
                    cat.items.map((item) => {
                      const index = config.items.findIndex(i => i.id === item.id);
                      return (
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
                            "group w-full px-2 py-2.5 rounded-lg mb-1 flex items-center gap-2 transition-all cursor-move overflow-hidden",
                            "hover:bg-muted/50",
                            draggedIndex === index && "opacity-50",
                            dragOverIndex === index && "bg-muted",
                            selectedItemId === item.id && "bg-muted border border-primary"
                          )}
                        >
                          <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 text-left min-w-0 overflow-hidden">
                            <p className="text-xs text-foreground truncate font-medium">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
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
                                <Copy className="w-3 h-3 mr-2" />Dupliquer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-destructive">
                                <Trash2 className="w-3 h-3 mr-2" />Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })
                  )}
                </div>
              ))}

              {/* Uncategorized items */}
              <div 
                className={cn(
                  "mb-4 rounded-lg transition-colors",
                  dragOverCategoryId === 'uncategorized' && draggedIndex !== null && "bg-primary/10 ring-2 ring-primary/30"
                )}
                onDragOver={(e) => handleCategoryDragOver(e, 'uncategorized')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleCategoryDrop(e, undefined)}
              >
                {grouped.categories.length > 0 && (
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Sans catégorie
                    </span>
                  </div>
                )}
                {grouped.uncategorized.length === 0 && grouped.categories.length > 0 ? (
                  <p className="text-[10px] text-muted-foreground px-2 py-2">Glisser ici pour retirer d'une catégorie</p>
                ) : (
                  grouped.uncategorized.map((item) => {
                    const index = config.items.findIndex(i => i.id === item.id);
                    return (
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
                          "group w-full px-2 py-2.5 rounded-lg mb-1 flex items-center gap-2 transition-all cursor-move overflow-hidden",
                          "hover:bg-muted/50",
                          draggedIndex === index && "opacity-50",
                          dragOverIndex === index && "bg-muted",
                          selectedItemId === item.id && "bg-muted border border-primary"
                        )}
                      >
                        <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 text-left min-w-0 overflow-hidden">
                          <p className="text-xs text-foreground truncate font-medium">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
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
                              <Copy className="w-3 h-3 mr-2" />Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-destructive">
                              <Trash2 className="w-3 h-3 mr-2" />Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })
                )}
              </div>
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
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Largeur</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={config.containerWidth || 1200}
                        onChange={(e) => {
                          const val = Math.min(1920, Math.max(800, Number(e.target.value) || 800));
                          onUpdateConfig({ containerWidth: val });
                        }}
                        className="w-20 h-7 text-xs text-right"
                        min={800}
                        max={1920}
                      />
                      <span className="text-xs text-muted-foreground">px</span>
                    </div>
                  </div>
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
              middleContent={
                <div className="border rounded-lg px-3 mb-2">
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span className="font-medium text-sm">Catégories</span>
                    </div>
                    <button
                      onClick={addCategory}
                      className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                      title="Ajouter une catégorie"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pb-4 space-y-3">
                    {/* Show category nav toggle */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Afficher la navigation</Label>
                      <Switch
                        checked={config.showCategoryNav || false}
                        onCheckedChange={(checked) => onUpdateConfig({ showCategoryNav: checked })}
                      />
                    </div>

                    {/* Category list */}
                    <div className="space-y-2">
                      {(config.categories || []).map((cat, index) => (
                        <div
                          key={cat.id}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                        >
                          <Input
                            value={cat.title}
                            onChange={(e) => {
                              const updated = [...(config.categories || [])];
                              updated[index] = { ...cat, title: e.target.value };
                              onUpdateConfig({ categories: updated });
                            }}
                            className="h-7 text-xs flex-1"
                            placeholder="Nom de la catégorie"
                          />
                          <button
                            onClick={() => {
                              const updated = (config.categories || []).filter(c => c.id !== cat.id);
                              const updatedItems = config.items.map(item => 
                                item.categoryId === cat.id ? { ...item, categoryId: undefined } : item
                              );
                              onUpdateConfig({ categories: updated, items: updatedItems });
                            }}
                            className="w-6 h-6 rounded hover:bg-destructive/10 flex items-center justify-center transition-colors text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {(!config.categories || config.categories.length === 0) && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Aucune catégorie
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              }
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
