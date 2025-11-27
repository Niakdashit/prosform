import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface JackpotSymbolPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSymbol: (value: string) => void; // emoji or data URL
}

const EMOJI_PRESETS = [
  "🍒","🍋","🍊","🍇","⭐","💎","🔔","7️⃣","🎁","💰","🍀","🔥"
];

export const JackpotSymbolPickerModal = ({ open, onOpenChange, onSelectSymbol }: JackpotSymbolPickerModalProps) => {
  const [activeTab, setActiveTab] = useState<string>("icons");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (value: string) => {
    onSelectSymbol(value);
    onOpenChange(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      handleSelect(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un symbole</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="icons">Icônes</TabsTrigger>
            <TabsTrigger value="upload">Uploader</TabsTrigger>
          </TabsList>

          <TabsContent value="icons" className="mt-0">
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSelect(emoji)}
                  className="flex items-center justify-center h-10 rounded-lg bg-muted hover:bg-muted/80 text-2xl transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-0">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Importez une image carrée pour l&apos;utiliser comme symbole.</p>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                Importer une image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default JackpotSymbolPickerModal;
