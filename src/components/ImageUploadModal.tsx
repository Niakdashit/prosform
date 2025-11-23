import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import { useRef } from "react";

interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (imageData: string) => void;
}

export const ImageUploadModal = ({ open, onOpenChange, onImageSelect }: ImageUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
        onOpenChange(false);
      };
      reader.readAsDataURL(file);
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
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-16 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              style={{ borderColor: '#E5E5E5' }}
            >
              <div className="text-center">
                <p className="text-base font-medium mb-2" style={{ color: '#3D3731' }}>
                  <span className="underline">Upload</span> or drop an image here
                </p>
                <p className="text-sm" style={{ color: '#A89A8A' }}>
                  JPG, PNG, or GIF. Up to 4MB.
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
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
