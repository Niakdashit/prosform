import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ImageEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onSave: (rotation: number) => void;
}

export const ImageEditorModal = ({ open, onOpenChange, imageUrl, onSave }: ImageEditorModalProps) => {
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("free");

  const rotationOptions = [-20, -10, 0, 10, 20];

  const handleSave = () => {
    onSave(rotation);
    onOpenChange(false);
  };

  const handleReset = () => {
    setRotation(0);
    setAspectRatio("free");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle style={{ color: '#3D3731' }}>Image editor</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="crop" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="crop">Crop</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="crop" className="mt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: '#3D3731' }}>
                  Aspect ratio
                </label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="1:1">1:1</SelectItem>
                    <SelectItem value="16:9">16:9</SelectItem>
                    <SelectItem value="4:3">4:3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg p-4 bg-muted/20">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full h-auto mx-auto"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease'
                  }}
                />
              </div>

              <div className="flex items-center justify-center gap-4">
                {rotationOptions.map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setRotation(angle)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      rotation === angle
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    style={{
                      backgroundColor: rotation === angle ? '#F5B800' : undefined,
                      color: rotation === angle ? '#3D3731' : '#6B6254'
                    }}
                  >
                    {angle > 0 ? `+${angle}°` : `${angle}°`}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="adjustments" className="mt-6">
            <div className="text-center py-12" style={{ color: '#A89A8A' }}>
              Adjustments coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="filters" className="mt-6">
            <div className="text-center py-12" style={{ color: '#A89A8A' }}>
              Filters coming soon
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            style={{ color: '#6B6254', borderColor: '#E5E5E5' }}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            style={{ backgroundColor: '#F5B800', color: '#3D3731' }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
