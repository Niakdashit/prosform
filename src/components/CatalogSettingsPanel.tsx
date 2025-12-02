import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CatalogConfig, CatalogItem } from "./CatalogBuilder";

interface CatalogSettingsPanelProps {
  config: CatalogConfig;
  selectedItemId: string | null;
  onUpdateConfig: (updates: Partial<CatalogConfig>) => void;
  onUpdateItem: (id: string, updates: Partial<CatalogItem>) => void;
  viewMode: 'desktop' | 'mobile';
}

export const CatalogSettingsPanel = ({ 
  config, 
  selectedItemId, 
  onUpdateConfig,
  onUpdateItem,
  viewMode
}: CatalogSettingsPanelProps) => {
  const selectedItem = config.items.find(item => item.id === selectedItemId);

  return (
    <div className="w-[280px] bg-background border-l border-border flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Catalog Global Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Paramètres globaux</h3>
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Titre du catalogue</Label>
              <Input 
                type="text" 
                value={config.catalogTitle}
                onChange={(e) => onUpdateConfig({ catalogTitle: e.target.value })}
                className="text-xs h-9"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Sous-titre</Label>
              <Input 
                type="text" 
                value={config.catalogSubtitle}
                onChange={(e) => onUpdateConfig({ catalogSubtitle: e.target.value })}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Selected Item Settings */}
          {selectedItem && (
            <>
              <Separator />
              
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Paramètres de la campagne</h3>
                
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Titre</Label>
                  <Input 
                    type="text" 
                    value={selectedItem.title}
                    onChange={(e) => onUpdateItem(selectedItem.id, { title: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Description</Label>
                  <Textarea 
                    value={selectedItem.description}
                    onChange={(e) => onUpdateItem(selectedItem.id, { description: e.target.value })}
                    className="text-xs min-h-[60px]"
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Texte du bouton</Label>
                  <Input 
                    type="text" 
                    value={selectedItem.buttonText}
                    onChange={(e) => onUpdateItem(selectedItem.id, { buttonText: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Lien</Label>
                  <Input 
                    type="text" 
                    value={selectedItem.link}
                    onChange={(e) => onUpdateItem(selectedItem.id, { link: e.target.value })}
                    placeholder="https://..."
                    className="text-xs h-9"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label className="text-xs font-normal">Prochainement</Label>
                  <Switch 
                    checked={selectedItem.isComingSoon}
                    onCheckedChange={(checked) => onUpdateItem(selectedItem.id, { isComingSoon: checked })}
                    className="scale-90" 
                  />
                </div>

                {selectedItem.isComingSoon && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Date de sortie</Label>
                    <Input 
                      type="text" 
                      value={selectedItem.comingSoonDate || ""}
                      onChange={(e) => onUpdateItem(selectedItem.id, { comingSoonDate: e.target.value })}
                      placeholder="Ex: 1er Mars"
                      className="text-xs h-9"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
