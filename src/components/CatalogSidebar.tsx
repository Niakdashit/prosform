import { Plus, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CatalogItem } from "./CatalogBuilder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CatalogSidebarProps {
  items: CatalogItem[];
  onItemsChange: (items: CatalogItem[]) => void;
  catalogTitle: string;
  onCatalogTitleChange: (title: string) => void;
  catalogSubtitle: string;
  onCatalogSubtitleChange: (subtitle: string) => void;
}

export const CatalogSidebar = ({
  items,
  onItemsChange,
  catalogTitle,
  onCatalogTitleChange,
  catalogSubtitle,
  onCatalogSubtitleChange,
}: CatalogSidebarProps) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const addItem = () => {
    const newItem: CatalogItem = {
      id: Date.now().toString(),
      title: "Nouvelle campagne",
      description: "Description de la campagne",
      image: "",
      buttonText: "PARTICIPER !",
      link: "",
      isComingSoon: false,
    };
    onItemsChange([...items, newItem]);
    setSelectedItemId(newItem.id);
  };

  const deleteItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const updateItem = (id: string, updates: Partial<CatalogItem>) => {
    onItemsChange(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="w-80 border-r bg-background flex flex-col">
      <Tabs defaultValue="items" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="items">Campagnes</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="flex-1 flex flex-col mt-0">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Liste des campagnes</span>
                <Button size="sm" variant="ghost" onClick={addItem}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {items.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedItemId === item.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2 h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {selectedItem && (
            <div className="border-t p-4 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuration
              </h3>

              <div className="space-y-3">
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={selectedItem.title}
                    onChange={(e) => updateItem(selectedItem.id, { title: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={selectedItem.description}
                    onChange={(e) => updateItem(selectedItem.id, { description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Texte du bouton</Label>
                  <Input
                    value={selectedItem.buttonText}
                    onChange={(e) => updateItem(selectedItem.id, { buttonText: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Lien</Label>
                  <Input
                    value={selectedItem.link}
                    onChange={(e) => updateItem(selectedItem.id, { link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Prochainement</Label>
                  <Switch
                    checked={selectedItem.isComingSoon}
                    onCheckedChange={(checked) => updateItem(selectedItem.id, { isComingSoon: checked })}
                  />
                </div>

                {selectedItem.isComingSoon && (
                  <div>
                    <Label>Date de sortie</Label>
                    <Input
                      value={selectedItem.comingSoonDate || ""}
                      onChange={(e) => updateItem(selectedItem.id, { comingSoonDate: e.target.value })}
                      placeholder="Ex: 1er Mars"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div>
                <Label>Titre du catalogue</Label>
                <Input
                  value={catalogTitle}
                  onChange={(e) => onCatalogTitleChange(e.target.value)}
                />
              </div>

              <div>
                <Label>Sous-titre</Label>
                <Input
                  value={catalogSubtitle}
                  onChange={(e) => onCatalogSubtitleChange(e.target.value)}
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

import { useState } from "react";
