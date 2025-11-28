import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadImageToStorage } from "@/utils/imageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WallpaperUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
}

export const WallpaperUploadModal = ({ 
  open, 
  onOpenChange, 
  onImageSelect,
  currentImage 
}: WallpaperUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState(currentImage || "");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour uploader des images");
        return;
      }

      const publicUrl = await uploadImageToStorage(file, user.id, 'wallpapers');
      onImageSelect(publicUrl);
      toast.success("Image uploadée avec succès");
      onOpenChange(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageSelect(urlInput.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter une image wallpaper</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-6">
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'
              } transition-colors`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-10 h-10 mb-3 text-muted-foreground animate-spin" />
                  <p className="text-sm font-medium mb-1">Upload en cours...</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">
                    <span className="underline">Upload</span> ou glissez une image ici
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP ou GIF. Max 5MB.
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </TabsContent>
          
          <TabsContent value="url" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url" className="text-xs">URL de l'image</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="text-sm"
              />
            </div>
            
            {urlInput && (
              <div className="rounded-lg border p-2">
                <img 
                  src={urlInput} 
                  alt="Preview" 
                  className="w-full h-40 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <Button 
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="w-full"
            >
              Ajouter l'image
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
