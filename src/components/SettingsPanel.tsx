import { Question } from "./FormBuilder";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image, Smartphone } from "lucide-react";

interface SettingsPanelProps {
  question?: Question;
}

export const SettingsPanel = ({ question }: SettingsPanelProps) => {
  if (!question) return null;

  return (
    <div className="w-72 bg-background border-l border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <select className="w-full px-3 py-1.5 text-sm bg-card border border-border rounded">
          <option>Welcome Screen</option>
        </select>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          <div>
            <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Time to complete</h3>
            <div className="flex items-center space-x-2">
              <Switch id="time-toggle" defaultChecked className="scale-75" />
              <Label htmlFor="time-toggle" className="text-xs">Show time estimate</Label>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Number of submissions</h3>
            <div className="flex items-center space-x-2">
              <Switch id="submissions-toggle" className="scale-75" />
              <Label htmlFor="submissions-toggle" className="text-xs">Show submission count</Label>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Button</h3>
            <input 
              type="text" 
              defaultValue="Give feedback"
              className="w-full px-2 py-1.5 text-xs bg-card border border-border rounded"
            />
            <p className="text-xs text-muted-foreground mt-1">13/24</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Image or video</h3>
            <div className="aspect-square bg-muted rounded overflow-hidden mb-2">
              <img
                src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=300&h=300&fit=crop"
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Button variant="outline" size="sm" className="text-xs h-7">
                <Image className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7">
                Link
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7">
                Delete
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Layout</h3>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile
              </Button>
              <Button variant="default" size="sm" className="flex-1 text-xs h-7">
                Desktop
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Focal point</h3>
            <div className="aspect-video bg-muted rounded overflow-hidden relative mb-2">
              <img
                src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400&h=300&fit=crop"
                alt="Focal point"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary rounded-full bg-primary/20" />
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs h-7">
              Reset
            </Button>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Brightness</h3>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              className="w-full h-1"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
