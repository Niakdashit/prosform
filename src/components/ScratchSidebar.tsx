import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScratchConfig, ScratchCard } from "./ScratchBuilder";
import { Plus, Palette, LayoutList, Gift, Home, Mail, Award, Trash2, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeStylePanel } from "@/components/ui/ThemeStylePanel";

interface ScratchSidebarProps {
  config: ScratchConfig;
  activeView: 'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose';
  onViewSelect: (view: 'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose') => void;
  onUpdateCard: (id: string, updates: Partial<ScratchCard>) => void;
  onAddCard: () => void;
  onDeleteCard: (id: string) => void;
  onGoToDotation: () => void;
}

export const ScratchSidebar = ({
  config,
  activeView,
  onViewSelect,
  onUpdateCard,
  onAddCard,
  onDeleteCard,
  onGoToDotation,
}: ScratchSidebarProps) => {
  const { theme } = useTheme();

  const views = [
    { id: 'welcome' as const, label: 'Welcome', icon: Home },
    { id: 'contact' as const, label: 'Contact', icon: Mail },
    { id: 'scratch' as const, label: 'Scratch', icon: Ticket },
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
                <span className="text-sm font-semibold text-foreground">Cartes</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={onGoToDotation}
                    className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                    title="Gérer les dotations"
                  >
                    <Gift className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={onAddCard}
                    className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                    title="Ajouter une carte"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {config.cards.map((card) => (
                <div
                  key={card.id}
                  className={cn(
                    "group w-full px-2 py-2.5 rounded-lg mb-1 flex items-center gap-2 transition-all",
                    "hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold",
                    card.isWinning ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    {card.isWinning ? '✓' : '✗'}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs text-foreground truncate">
                      {card.revealText}
                    </p>
                  </div>
                  <button 
                    onClick={() => onDeleteCard(card.id)}
                    className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive rounded p-1 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
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
