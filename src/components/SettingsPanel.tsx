import { Question } from "./FormBuilder";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Image, Smartphone, Plus, Trash2, Eye, EyeOff, Sparkles, Info } from "lucide-react";

interface SettingsPanelProps {
  question?: Question;
  onUpdateQuestion?: (id: string, updates: Partial<Question>) => void;
}

export const SettingsPanel = ({ question, onUpdateQuestion }: SettingsPanelProps) => {
  if (!question) return null;

  const getQuestionTypeLabel = () => {
    const labels: Record<string, string> = {
      welcome: "Welcome Screen",
      text: question.variant === 'long' ? "Long Text" : question.variant === 'number' ? "Number" : "Text",
      rating: question.variant === 'scale' ? "Opinion Scale" : question.variant === 'ranking' ? "Ranking" : "Rating",
      choice: question.variant === 'dropdown' ? "Dropdown" : question.variant === 'yesno' ? "Yes/No" : "Multiple Choice",
      ending: "End Screen"
    };
    return labels[question.type] || "Question";
  };

  const renderWelcomeSettings = () => (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="time-toggle" className="text-xs font-normal">Time to complete</Label>
          <Switch id="time-toggle" defaultChecked className="scale-90" />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="submissions-toggle" className="text-xs font-normal">Number of submissions</Label>
          <Switch id="submissions-toggle" className="scale-90" />
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Button</Label>
        <Input 
          type="text" 
          defaultValue="Give feedback"
          className="text-xs h-8"
        />
        <p className="text-[10px] text-muted-foreground mt-1.5">13/24</p>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2 relative group">
          <img
            src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=300&h=300&fit=crop"
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <Button variant="outline" size="sm" className="text-[10px] h-7 px-2">
            <Image className="w-3 h-3 mr-1" />
            Upload
          </Button>
          <Button variant="outline" size="sm" className="text-[10px] h-7 px-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Link
          </Button>
          <Button variant="outline" size="sm" className="text-[10px] h-7 px-2">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7 px-2">
            <Smartphone className="w-3 h-3 mr-1" />
            Mobile
          </Button>
          <Button variant="default" size="sm" className="flex-1 text-[10px] h-7 px-2">
            Desktop
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Brightness</Label>
        <input
          type="range"
          min="0"
          max="100"
          defaultValue="50"
          className="w-full h-1.5 accent-primary cursor-pointer"
        />
      </div>
    </>
  );

  const renderTextSettings = () => (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
          <Switch id="required-toggle" defaultChecked className="scale-90" />
        </div>
        
        {question.variant === 'long' && (
          <div className="flex items-center justify-between">
            <Label htmlFor="maxchars-toggle" className="text-xs font-normal">Max characters</Label>
            <Switch id="maxchars-toggle" className="scale-90" />
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <Button variant="outline" size="sm" className="w-full text-[10px] h-8">
          <Plus className="w-3 h-3 mr-1" />
          Add media
        </Button>
      </div>
    </>
  );

  const renderRatingSettings = () => (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
          <Switch id="required-toggle" defaultChecked className="scale-90" />
        </div>
      </div>

      {question.variant === 'scale' && (
        <>
          <Separator className="my-4" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1.5 block">From</Label>
                <Input type="number" defaultValue="0" className="text-xs h-7" />
              </div>
              <span className="text-xs text-muted-foreground mt-5">to</span>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1.5 block">To</Label>
                <Input type="number" defaultValue="10" className="text-xs h-7" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">0 label</Label>
              <Input 
                type="text" 
                placeholder="Not supported at all"
                className="text-xs h-7"
              />
              <p className="text-[10px] text-muted-foreground mt-1">20/24</p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">5 label</Label>
              <Input 
                type="text" 
                placeholder="Neutral"
                className="text-xs h-7"
              />
              <p className="text-[10px] text-muted-foreground mt-1">0/24</p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">10 label</Label>
              <Input 
                type="text" 
                placeholder="Very supported"
                className="text-xs h-7"
              />
              <p className="text-[10px] text-muted-foreground mt-1">14/24</p>
            </div>
          </div>
        </>
      )}

      {question.variant === 'stars' && (
        <>
          <Separator className="my-4" />
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Number of stars</Label>
            <Select defaultValue="7">
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <SelectItem key={num} value={String(num)} className="text-xs">
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <Button variant="outline" size="sm" className="w-full text-[10px] h-8">
          <Plus className="w-3 h-3 mr-1" />
          Add media
        </Button>
      </div>
    </>
  );

  const renderChoiceSettings = () => (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
          <Switch id="required-toggle" defaultChecked className="scale-90" />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="multiple-toggle" className="text-xs font-normal">Multiple selection</Label>
          <Switch id="multiple-toggle" className="scale-90" />
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Max selections</Label>
        <Select defaultValue="unlimited">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unlimited" className="text-xs">Unlimited</SelectItem>
            <SelectItem value="1" className="text-xs">1</SelectItem>
            <SelectItem value="2" className="text-xs">2</SelectItem>
            <SelectItem value="3" className="text-xs">3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="randomize-toggle" className="text-xs font-normal">Randomize</Label>
          <Switch id="randomize-toggle" className="scale-90" />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="other-toggle" className="text-xs font-normal">"Other" option</Label>
          <Switch id="other-toggle" className="scale-90" />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="vertical-toggle" className="text-xs font-normal">Vertical alignment</Label>
          <Switch id="vertical-toggle" className="scale-90" />
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <Button variant="outline" size="sm" className="w-full text-[10px] h-8">
          <Plus className="w-3 h-3 mr-1" />
          Add media
        </Button>
      </div>
    </>
  );

  const renderEndingSettings = () => (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="social-toggle" className="text-xs font-normal">Social share icons</Label>
          <Switch id="social-toggle" className="scale-90" />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="button-toggle" className="text-xs font-normal">Button</Label>
          <Switch id="button-toggle" className="scale-90" />
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <Button variant="outline" size="sm" className="w-full text-[10px] h-8">
          <Plus className="w-3 h-3 mr-1" />
          Add media
        </Button>
      </div>
    </>
  );

  const renderSettings = () => {
    switch (question.type) {
      case "welcome":
        return renderWelcomeSettings();
      case "text":
        return renderTextSettings();
      case "rating":
        return renderRatingSettings();
      case "choice":
        return renderChoiceSettings();
      case "ending":
        return renderEndingSettings();
      default:
        return null;
    }
  };

  return (
    <div className="w-[280px] bg-background border-l border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 text-xs bg-muted rounded-md font-medium text-foreground">
            {getQuestionTypeLabel()}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {renderSettings()}
        </div>
      </ScrollArea>
    </div>
  );
};
