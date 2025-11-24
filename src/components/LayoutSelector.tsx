import { DesktopLayoutType, MobileLayoutType, DESKTOP_LAYOUTS, MOBILE_LAYOUTS } from "@/types/layouts";
import { Monitor, Smartphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LayoutSelectorProps {
  desktopLayout: DesktopLayoutType;
  mobileLayout: MobileLayoutType;
  onDesktopLayoutChange: (layout: DesktopLayoutType) => void;
  onMobileLayoutChange: (layout: MobileLayoutType) => void;
}

export const LayoutSelector = ({
  desktopLayout,
  mobileLayout,
  onDesktopLayoutChange,
  onMobileLayoutChange
}: LayoutSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Mobile</Label>
        <Select value={mobileLayout} onValueChange={onMobileLayoutChange}>
          <SelectTrigger className="h-9">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {MOBILE_LAYOUTS.map((layout) => (
              <SelectItem key={layout.id} value={layout.id}>
                {layout.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Desktop</Label>
        <Select value={desktopLayout} onValueChange={onDesktopLayoutChange}>
          <SelectTrigger className="h-9">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {DESKTOP_LAYOUTS.map((layout) => (
              <SelectItem key={layout.id} value={layout.id}>
                {layout.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
