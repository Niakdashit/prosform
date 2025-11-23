import { Question } from "./FormBuilder";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Settings, Eye } from "lucide-react";

interface SettingsPanelProps {
  question?: Question;
}

export const SettingsPanel = ({ question }: SettingsPanelProps) => {
  if (!question) return null;

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <Tabs defaultValue="welcome" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="welcome" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Welcome Screen
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Time to complete</h3>
            <div className="flex items-center space-x-2">
              <Switch id="time-toggle" defaultChecked />
              <Label htmlFor="time-toggle" className="text-sm">Show time estimate</Label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Number of submissions</h3>
            <div className="flex items-center space-x-2">
              <Switch id="submissions-toggle" />
              <Label htmlFor="submissions-toggle" className="text-sm">Show submission count</Label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Button</h3>
            <Button variant="outline" className="w-full justify-start">
              Give feedback
            </Button>
            <p className="text-xs text-muted-foreground mt-2">13/24 characters used</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Image or video</h3>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
              <img
                src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=300&h=300&fit=crop"
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Image className="w-4 h-4 mr-2" />
                Replace
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Remove
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Layout</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Mobile
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Desktop
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Focal point</h3>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400&h=300&fit=crop"
                alt="Focal point"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary rounded-full bg-primary/20" />
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2">
              Reset
            </Button>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Brightness</h3>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              className="w-full"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
