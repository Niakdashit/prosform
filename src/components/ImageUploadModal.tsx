import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadImageToStorage } from "@/utils/imageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (imageData: string) => void;
}

export const ImageUploadModal = ({ open, onOpenChange, onImageSelect }: ImageUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      const publicUrl = await uploadImageToStorage(file, user.id, 'content');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle style={{ color: '#3D3731' }}>Media gallery</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="icon">Icon</TabsTrigger>
            <TabsTrigger value="gallery">My gallery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-6">
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-16 flex flex-col items-center justify-center ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'
              } transition-colors`}
              style={{ borderColor: '#E5E5E5' }}
            >
              <div className="text-center">
                {uploading ? (
                  <>
                    <Loader2 className="w-10 h-10 mb-3 mx-auto animate-spin" style={{ color: '#A89A8A' }} />
                    <p className="text-base font-medium mb-2" style={{ color: '#3D3731' }}>
                      Uploading...
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-medium mb-2" style={{ color: '#3D3731' }}>
                      <span className="underline">Upload</span> or drop an image here
                    </p>
                    <p className="text-sm" style={{ color: '#A89A8A' }}>
                      JPG, PNG, WEBP or GIF. Up to 5MB.
                    </p>
                  </>
                )}
              </div>
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
          
          <TabsContent value="image" className="mt-6">
            <div className="text-center py-12" style={{ color: '#A89A8A' }}>
              Image library coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="mt-6">
            <div className="text-center py-12" style={{ color: '#A89A8A' }}>
              Video library coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="icon" className="mt-6">
            <div className="text-center py-12" style={{ color: '#A89A8A' }}>
              Icon library coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="gallery" className="mt-6">
            <div className="text-center py-12" style={{ color: '#A89A8A' }}>
              Your gallery is empty
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
