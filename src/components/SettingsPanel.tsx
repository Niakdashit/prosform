import { Question } from "./FormBuilder";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image, Smartphone, Plus, Trash2 } from "lucide-react";

interface SettingsPanelProps {
  question?: Question;
  onUpdateQuestion?: (id: string, updates: Partial<Question>) => void;
}

export const SettingsPanel = ({ question, onUpdateQuestion }: SettingsPanelProps) => {
  if (!question) return null;

  const getQuestionTypeLabel = () => {
    const labels: Record<string, string> = {
      welcome: "Welcome Screen",
      text: "Text Question",
      rating: "Rating Question",
      choice: "Multiple Choice",
      ending: "Ending Screen"
    };
    return labels[question.type] || "Question";
  };

  const renderWelcomeSettings = () => (
    <>
      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Time to complete</h3>
        <div className="flex items-center space-x-2">
          <Switch id="time-toggle" defaultChecked className="scale-75" />
          <Label htmlFor="time-toggle" className="text-xs cursor-pointer">Show time estimate</Label>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Number of submissions</h3>
        <div className="flex items-center space-x-2">
          <Switch id="submissions-toggle" className="scale-75" />
          <Label htmlFor="submissions-toggle" className="text-xs cursor-pointer">Show submission count</Label>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Button</h3>
        <Input 
          type="text" 
          defaultValue="Give feedback"
          className="w-full text-xs h-7"
        />
        <p className="text-[10px] text-muted-foreground mt-1">13/24</p>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Image or video</h3>
        <div className="aspect-square bg-muted rounded overflow-hidden mb-1.5">
          <img
            src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=300&h=300&fit=crop"
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-3 gap-1">
          <Button variant="outline" size="sm" className="text-[10px] h-6 px-1">
            <Image className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
            Link
          </Button>
          <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
            Delete
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Layout</h3>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="flex-1 text-[10px] h-6 px-2">
            <Smartphone className="w-3 h-3 mr-1" />
            Mobile
          </Button>
          <Button variant="default" size="sm" className="flex-1 text-[10px] h-6 px-2">
            Desktop
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Brightness</h3>
        <input
          type="range"
          min="0"
          max="100"
          defaultValue="50"
          className="w-full h-1.5 accent-primary"
        />
      </div>
    </>
  );

  const renderTextSettings = () => (
    <>
      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Required</h3>
        <div className="flex items-center space-x-2">
          <Switch id="required-toggle" defaultChecked className="scale-75" />
          <Label htmlFor="required-toggle" className="text-xs cursor-pointer">Make this field required</Label>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Placeholder</h3>
        <Input 
          type="text" 
          placeholder="Type your answer here..."
          className="w-full text-xs h-7"
        />
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Character limit</h3>
        <Input 
          type="number" 
          placeholder="No limit"
          className="w-full text-xs h-7"
        />
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Description</h3>
        <Input 
          type="text" 
          placeholder="Add a description..."
          className="w-full text-xs h-7"
        />
      </div>

      {question.variant === 'long' && (
        <div>
          <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Rows</h3>
          <Input 
            type="number" 
            defaultValue="5"
            min="3"
            max="20"
            className="w-full text-xs h-7"
          />
        </div>
      )}
    </>
  );

  const renderRatingSettings = () => (
    <>
      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Required</h3>
        <div className="flex items-center space-x-2">
          <Switch id="required-toggle" defaultChecked className="scale-75" />
          <Label htmlFor="required-toggle" className="text-xs cursor-pointer">Make this field required</Label>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Number of options</h3>
        <Input 
          type="number" 
          defaultValue="5"
          min="2"
          max="10"
          className="w-full text-xs h-7"
        />
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Start label</h3>
        <Input 
          type="text" 
          placeholder="Not at all"
          className="w-full text-xs h-7"
        />
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">End label</h3>
        <Input 
          type="text" 
          placeholder="Extremely"
          className="w-full text-xs h-7"
        />
      </div>

      {question.variant === 'stars' && (
        <div>
          <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Icon style</h3>
          <div className="grid grid-cols-3 gap-1">
            <Button variant="default" size="sm" className="text-[10px] h-6 px-2">
              ⭐ Stars
            </Button>
            <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
              ❤️ Hearts
            </Button>
            <Button variant="outline" size="sm" className="text-[10px] h-6 px-2">
              👍 Thumbs
            </Button>
          </div>
        </div>
      )}
    </>
  );

  const renderChoiceSettings = () => (
    <>
      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Required</h3>
        <div className="flex items-center space-x-2">
          <Switch id="required-toggle" defaultChecked className="scale-75" />
          <Label htmlFor="required-toggle" className="text-xs cursor-pointer">Make this field required</Label>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Multiple selections</h3>
        <div className="flex items-center space-x-2">
          <Switch id="multiple-toggle" className="scale-75" />
          <Label htmlFor="multiple-toggle" className="text-xs cursor-pointer">Allow multiple answers</Label>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Randomize order</h3>
        <div className="flex items-center space-x-2">
          <Switch id="randomize-toggle" className="scale-75" />
          <Label htmlFor="randomize-toggle" className="text-xs cursor-pointer">Shuffle choices</Label>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Choices</h3>
        <div className="space-y-1.5">
          {(question.choices || ["Yes", "No", "Sometimes"]).map((choice, index) => (
            <div key={index} className="flex items-center gap-1">
              <Input 
                type="text" 
                value={choice}
                className="flex-1 text-xs h-6"
                readOnly
              />
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full text-[10px] h-6">
            <Plus className="w-3 h-3 mr-1" />
            Add choice
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Other option</h3>
        <div className="flex items-center space-x-2">
          <Switch id="other-toggle" className="scale-75" />
          <Label htmlFor="other-toggle" className="text-xs cursor-pointer">Add "Other" option</Label>
        </div>
      </div>
    </>
  );

  const renderEndingSettings = () => (
    <>
      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Button text</h3>
        <Input 
          type="text" 
          defaultValue="Submit again"
          className="w-full text-xs h-7"
        />
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Redirect URL</h3>
        <Input 
          type="url" 
          placeholder="https://example.com"
          className="w-full text-xs h-7"
        />
        <p className="text-[10px] text-muted-foreground mt-1">Redirect after submission</p>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Social sharing</h3>
        <div className="flex items-center space-x-2">
          <Switch id="sharing-toggle" className="scale-75" />
          <Label htmlFor="sharing-toggle" className="text-xs cursor-pointer">Enable social sharing</Label>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">Show responses</h3>
        <div className="flex items-center space-x-2">
          <Switch id="responses-toggle" className="scale-75" />
          <Label htmlFor="responses-toggle" className="text-xs cursor-pointer">Show response summary</Label>
        </div>
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
    <div className="w-64 bg-background border-l border-border flex flex-col">
      <div className="p-2.5 border-b border-border">
        <div className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded font-medium">
          {getQuestionTypeLabel()}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2.5 space-y-3.5">
          {renderSettings()}
        </div>
      </ScrollArea>
    </div>
  );
};
