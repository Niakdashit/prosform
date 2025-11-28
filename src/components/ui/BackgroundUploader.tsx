import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { uploadImageToStorage } from "@/utils/imageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BackgroundUploaderProps {
  desktopImage?: string;
  mobileImage?: string;
  onDesktopImageChange: (image: string) => void;
  onDesktopImageRemove: () => void;
  onMobileImageChange: (image: string) => void;
  onMobileImageRemove: () => void;
  showApplyToAll?: boolean;
  applyToAll?: boolean;
  onApplyToAllChange?: (value: boolean) => void;
}

export const BackgroundUploader = ({ 
  desktopImage,
  mobileImage,
  onDesktopImageChange, 
  onDesktopImageRemove,
  onMobileImageChange,
  onMobileImageRemove,
  showApplyToAll = false,
  applyToAll = false,
  onApplyToAllChange
}: BackgroundUploaderProps) => {
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  const handleDesktopUpload = async (file: File) => {
    setUploadingDesktop(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour uploader des images");
        return;
      }

      const publicUrl = await uploadImageToStorage(file, user.id, 'backgrounds');
      onDesktopImageChange(publicUrl);
      toast.success("Image uploadée avec succès");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload");
    } finally {
      setUploadingDesktop(false);
    }
  };

  const handleMobileUpload = async (file: File) => {
    setUploadingMobile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour uploader des images");
        return;
      }

      const publicUrl = await uploadImageToStorage(file, user.id, 'backgrounds');
      onMobileImageChange(publicUrl);
      toast.success("Image uploadée avec succès");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload");
    } finally {
      setUploadingMobile(false);
    }
  };

  return (
  <div className="space-y-3">
    <Label className="text-xs text-muted-foreground">Background</Label>
    
    {/* Desktop 16:9 */}
    <div className="space-y-1">
      <span className="text-[10px] text-muted-foreground">Desktop (16:9)</span>
      {desktopImage ? (
        <div className="relative">
          <img 
            src={desktopImage} 
            alt="Desktop Background" 
            className="w-full h-16 object-cover rounded-lg"
          />
          <button
            onClick={onDesktopImageRemove}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
          {uploadingDesktop ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {uploadingDesktop ? "Uploading..." : "Upload"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploadingDesktop}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleDesktopUpload(file);
              }
            }}
          />
        </label>
      )}
    </div>

    {/* Mobile 9:16 */}
    <div className="space-y-1">
      <span className="text-[10px] text-muted-foreground">Mobile (9:16) {!mobileImage && desktopImage && <span className="text-primary">• utilise desktop</span>}</span>
      {mobileImage ? (
        <div className="relative">
          <img 
            src={mobileImage} 
            alt="Mobile Background" 
            className="w-full h-16 object-cover rounded-lg"
          />
          <button
            onClick={onMobileImageRemove}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
          {uploadingMobile ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {uploadingMobile ? "Uploading..." : "Upload"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploadingMobile}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleMobileUpload(file);
              }
            }}
          />
        </label>
      )}
    </div>

    {showApplyToAll && (
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Appliquer à tous les écrans</Label>
        <Switch 
          checked={applyToAll} 
          onCheckedChange={onApplyToAllChange}
        />
      </div>
    )}
  </div>
  );
};
