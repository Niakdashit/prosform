import { DesktopLayoutType, MobileLayoutType, DESKTOP_LAYOUTS, MOBILE_LAYOUTS } from "@/types/layouts";
import { Monitor, Smartphone } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  onMobileLayoutChange,
}: LayoutSelectorProps) => {
  return (
    <div className="space-y-3">
      {/* Mobile row */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Mobile</span>
          <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <Select
          value={mobileLayout}
          onValueChange={(value) => onMobileLayoutChange(value as MobileLayoutType)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOBILE_LAYOUTS.map((layout) => (
              <SelectItem
                key={layout.id}
                value={layout.id}
                className="text-xs"
              >
                {layout.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop row */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Desktop</span>
          <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <Select
          value={desktopLayout}
          onValueChange={(value) => onDesktopLayoutChange(value as DesktopLayoutType)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DESKTOP_LAYOUTS.map((layout) => (
              <SelectItem
                key={layout.id}
                value={layout.id}
                className="text-xs"
              >
                {layout.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
