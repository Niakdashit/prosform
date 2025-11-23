import { Question } from "./FormBuilder";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Image, Smartphone, Plus, Trash2, Info, Upload, Link as LinkIcon } from "lucide-react";

interface SettingsPanelProps {
  question?: Question;
  onUpdateQuestion?: (id: string, updates: Partial<Question>) => void;
}

export const SettingsPanel = ({ question, onUpdateQuestion }: SettingsPanelProps) => {
  if (!question) return null;

  const getQuestionTypeLabel = () => {
    const labels: Record<string, string> = {
      welcome: "Welcome Screen",
      text: question.variant === 'long' ? "Long Text" : "Short Text",
      rating: question.variant === 'scale' ? "Opinion Scale" : question.variant === 'ranking' ? "Ranking" : "Rating",
      choice: "Multiple Choice",
      ending: "End Screen",
      email: "Email",
      phone: "Phone Number",
      number: "Number",
      date: "Date",
      dropdown: "Dropdown",
      yesno: "Yes/No",
      file: "File Upload",
      statement: "Statement",
      "picture-choice": "Picture Choice",
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
          value={question.subtitle || "Give feedback"}
          onChange={(e) => onUpdateQuestion?.(question.id, { subtitle: e.target.value })}
          className="text-xs h-8"
        />
        <p className="text-[10px] text-muted-foreground mt-1.5">{(question.subtitle || "Give feedback").length}/24</p>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Image or video</Label>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full text-[10px] h-7 justify-start">
            <Upload className="w-3 h-3 mr-1.5" />
            Upload
          </Button>
          <Button variant="outline" size="sm" className="w-full text-[10px] h-7 justify-start">
            <LinkIcon className="w-3 h-3 mr-1.5" />
            Add from URL
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

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
        <Select defaultValue="split">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="split" className="text-xs">Split</SelectItem>
            <SelectItem value="stack" className="text-xs">Stack</SelectItem>
            <SelectItem value="wallpaper" className="text-xs">Wallpaper</SelectItem>
          </SelectContent>
        </Select>
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
        <Label className="text-xs text-muted-foreground mb-2 block">Placeholder</Label>
        <Input 
          type="text" 
          value={question.placeholder || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { placeholder: e.target.value })}
          placeholder="Type your answer here..."
          className="text-xs h-8"
        />
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

  const renderEmailSettings = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch id="required-toggle" defaultChecked className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Placeholder</Label>
        <Input 
          type="text" 
          value={question.placeholder || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { placeholder: e.target.value })}
          placeholder="name@example.com"
          className="text-xs h-8"
        />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Error message</Label>
        <Input 
          type="text" 
          placeholder="Please enter a valid email"
          className="text-xs h-8"
        />
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

  const renderPhoneSettings = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch id="required-toggle" defaultChecked className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Phone format</Label>
        <Select defaultValue="international">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="international" className="text-xs">International</SelectItem>
            <SelectItem value="national" className="text-xs">National</SelectItem>
            <SelectItem value="e164" className="text-xs">E.164</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Default country</Label>
        <Select defaultValue="us">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us" className="text-xs">🇺🇸 United States (+1)</SelectItem>
            <SelectItem value="fr" className="text-xs">🇫🇷 France (+33)</SelectItem>
            <SelectItem value="uk" className="text-xs">🇬🇧 United Kingdom (+44)</SelectItem>
            <SelectItem value="de" className="text-xs">🇩🇪 Germany (+49)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Placeholder</Label>
        <Input 
          type="text" 
          value={question.placeholder || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { placeholder: e.target.value })}
          placeholder="+1 (555) 000-0000"
          className="text-xs h-8"
        />
      </div>
    </>
  );

  const renderNumberSettings = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch id="required-toggle" defaultChecked className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Min value</Label>
            <Input type="number" placeholder="No min" className="text-xs h-7" />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Max value</Label>
            <Input type="number" placeholder="No max" className="text-xs h-7" />
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Step</Label>
        <Input type="number" placeholder="1" className="text-xs h-8" />
        <p className="text-[10px] text-muted-foreground mt-1">Increment value</p>
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <Label htmlFor="decimals-toggle" className="text-xs font-normal">Allow decimals</Label>
        <Switch id="decimals-toggle" className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Placeholder</Label>
        <Input 
          type="text" 
          value={question.placeholder || ""}
          onChange={(e) => onUpdateQuestion?.(question.id, { placeholder: e.target.value })}
          placeholder="Enter a number" 
          className="text-xs h-8" 
        />
      </div>
    </>
  );

  const renderDateSettings = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch id="required-toggle" defaultChecked className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Date format</Label>
        <Select defaultValue="ddmmyyyy">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ddmmyyyy" className="text-xs">DD/MM/YYYY</SelectItem>
            <SelectItem value="mmddyyyy" className="text-xs">MM/DD/YYYY</SelectItem>
            <SelectItem value="yyyymmdd" className="text-xs">YYYY-MM-DD</SelectItem>
            <SelectItem value="ddmmmyyyy" className="text-xs">DD MMM YYYY</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Min date</Label>
        <Input type="date" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Max date</Label>
        <Input type="date" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Default date</Label>
        <Select defaultValue="none">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="text-xs">None</SelectItem>
            <SelectItem value="today" className="text-xs">Today</SelectItem>
            <SelectItem value="custom" className="text-xs">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  const renderDropdownSettings = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch id="required-toggle" defaultChecked className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-muted-foreground">Choices</Label>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {["Option 1", "Option 2", "Option 3"].map((choice, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input value={choice} className="text-xs h-7 flex-1" />
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="alphabetize-toggle" className="text-xs font-normal">Alphabetize</Label>
          <Switch id="alphabetize-toggle" className="scale-90" />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="search-toggle" className="text-xs font-normal">Enable search</Label>
          <Switch id="search-toggle" className="scale-90" />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="other-dropdown-toggle" className="text-xs font-normal">"Other" option</Label>
          <Switch id="other-dropdown-toggle" className="scale-90" />
        </div>
      </div>
    </>
  );

  const renderYesNoSettings = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch id="required-toggle" defaultChecked className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Positive label</Label>
        <Input type="text" placeholder="Yes" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Negative label</Label>
        <Input type="text" placeholder="No" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
        <Select defaultValue="horizontal">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="horizontal" className="text-xs">Horizontal</SelectItem>
            <SelectItem value="vertical" className="text-xs">Vertical</SelectItem>
          </SelectContent>
        </Select>
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

  const renderFileUploadSettings = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch id="required-toggle" defaultChecked className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">File types</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch id="images-type" className="scale-90" />
            <Label htmlFor="images-type" className="text-xs font-normal">Images (JPG, PNG, GIF)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="docs-type" className="scale-90" />
            <Label htmlFor="docs-type" className="text-xs font-normal">Documents (PDF, DOC)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="sheets-type" className="scale-90" />
            <Label htmlFor="sheets-type" className="text-xs font-normal">Spreadsheets (XLS, CSV)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="videos-type" className="scale-90" />
            <Label htmlFor="videos-type" className="text-xs font-normal">Videos (MP4, MOV)</Label>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Max file size (MB)</Label>
        <Input type="number" placeholder="10" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <Label htmlFor="multiple-files-toggle" className="text-xs font-normal">Multiple files</Label>
        <Switch id="multiple-files-toggle" className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Max number of files</Label>
        <Input type="number" placeholder="5" className="text-xs h-8" />
      </div>
    </>
  );

  const renderStatementSettings = () => (
    <>
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Description</Label>
        <Textarea 
          placeholder="Add additional information..."
          className="text-xs min-h-[80px]"
        />
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <Label htmlFor="continue-toggle" className="text-xs font-normal">Continue button</Label>
        <Switch id="continue-toggle" defaultChecked className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Button text</Label>
        <Input type="text" placeholder="Continue" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Min display time (sec)</Label>
        <Input type="number" placeholder="0" className="text-xs h-8" />
        <p className="text-[10px] text-muted-foreground mt-1">Before user can continue</p>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
        <Select defaultValue="center">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="center" className="text-xs">Center</SelectItem>
            <SelectItem value="left" className="text-xs">Left</SelectItem>
            <SelectItem value="split" className="text-xs">Split with media</SelectItem>
          </SelectContent>
        </Select>
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

  const renderPictureChoiceSettings = () => (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
          <Switch id="required-toggle" defaultChecked className="scale-90" />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="multiple-pic-toggle" className="text-xs font-normal">Multiple selection</Label>
          <Switch id="multiple-pic-toggle" className="scale-90" />
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-muted-foreground">Choices</Label>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {["Choice 1", "Choice 2", "Choice 3"].map((choice, idx) => (
            <div key={idx} className="border rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={choice} className="text-xs h-7 flex-1" placeholder="Label" />
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="w-full text-[10px] h-7 justify-start">
                <Upload className="w-3 h-3 mr-1.5" />
                Upload image
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Layout</Label>
        <Select defaultValue="grid-2">
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid-2" className="text-xs">Grid 2x2</SelectItem>
            <SelectItem value="grid-3" className="text-xs">Grid 3x3</SelectItem>
            <SelectItem value="list" className="text-xs">List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="labels-toggle" className="text-xs font-normal">Show labels</Label>
          <Switch id="labels-toggle" defaultChecked className="scale-90" />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="randomize-pic-toggle" className="text-xs font-normal">Randomize order</Label>
          <Switch id="randomize-pic-toggle" className="scale-90" />
        </div>
      </div>
    </>
  );

  const renderRatingSettings = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="required-toggle" className="text-xs font-normal">Required</Label>
        <Switch id="required-toggle" defaultChecked className="scale-90" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Rating type</Label>
        <div className="flex gap-2">
          <Input type="number" defaultValue="5" className="text-xs h-8 w-16" />
          <Select defaultValue="stars">
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stars" className="text-xs">⭐ Stars</SelectItem>
              <SelectItem value="smileys" className="text-xs">😊 Smileys</SelectItem>
              <SelectItem value="hearts" className="text-xs">❤️ Hearts</SelectItem>
              <SelectItem value="thumbs" className="text-xs">👍 Thumbs</SelectItem>
              <SelectItem value="numbers" className="text-xs">🔢 Numbers</SelectItem>
            </SelectContent>
          </Select>
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
        <Label className="text-xs text-muted-foreground mb-2 block">Button text</Label>
        <Input type="text" placeholder="Create your own form" className="text-xs h-8" />
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Button link</Label>
        <Input type="text" placeholder="https://..." className="text-xs h-8" />
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
      case "email":
        return renderEmailSettings();
      case "phone":
        return renderPhoneSettings();
      case "number":
        return renderNumberSettings();
      case "date":
        return renderDateSettings();
      case "rating":
        return renderRatingSettings();
      case "choice":
        return renderChoiceSettings();
      case "dropdown":
        return renderDropdownSettings();
      case "yesno":
        return renderYesNoSettings();
      case "file":
        return renderFileUploadSettings();
      case "statement":
        return renderStatementSettings();
      case "picture-choice":
        return renderPictureChoiceSettings();
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
