import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WheelConfig } from "./WheelBuilder";
import { Plus, Palette, LayoutList, Gift, Home, Mail, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";

interface WheelSidebarProps {
  config: WheelConfig;
  activeView: 'welcome' | 'contact' | 'wheel' | 'ending';
  onViewSelect: (view: 'welcome' | 'contact' | 'wheel' | 'ending') => void;
  onAddSegment: () => void;
  onDeleteSegment: (id: string) => void;
}

export const WheelSidebar = ({
  config,
  activeView,
  onViewSelect,
  onAddSegment,
  onDeleteSegment,
}: WheelSidebarProps) => {
  const { theme, updateTheme } = useTheme();

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
                  onClick={onAddSegment}
                  className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {config.segments.map((segment) => (
                <div
                  key={segment.id}
                  className="w-full px-2 py-2.5 rounded-lg mb-1 flex items-center gap-2 hover:bg-muted/50"
                >
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
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
