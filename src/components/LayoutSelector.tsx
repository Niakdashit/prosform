import { DesktopLayoutType, MobileLayoutType, DESKTOP_LAYOUTS, MOBILE_LAYOUTS } from "@/types/layouts";
import { Monitor, Smartphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import mobileVerticalIcon from "@/assets/layout-mobile-vertical.svg";
import mobileCenteredIcon from "@/assets/layout-mobile-centered.svg";
import mobileMinimalIcon from "@/assets/layout-mobile-minimal.svg";
import desktopLeftRightIcon from "@/assets/layout-desktop-left-right.svg";
import desktopRightLeftIcon from "@/assets/layout-desktop-right-left.svg";
import desktopCenteredIcon from "@/assets/layout-desktop-centered.svg";
import desktopSplitIcon from "@/assets/layout-desktop-split.svg";
import desktopCardIcon from "@/assets/layout-desktop-card.svg";
import desktopPanelIcon from "@/assets/layout-desktop-panel.svg";

interface LayoutSelectorProps {
  desktopLayout: DesktopLayoutType;
  mobileLayout: MobileLayoutType;
  onDesktopLayoutChange: (layout: DesktopLayoutType) => void;
  onMobileLayoutChange: (layout: MobileLayoutType) => void;
  excludeDesktopLayouts?: DesktopLayoutType[];
  excludeMobileLayouts?: MobileLayoutType[];
}

const LayoutIcon = ({ type }: { type: string }) => {
  const iconMap: Record<string, string> = {
    "mobile-vertical": mobileVerticalIcon,
    "mobile-centered": mobileCenteredIcon,
    "mobile-minimal": mobileMinimalIcon,
    "desktop-left-right": desktopLeftRightIcon,
    "desktop-right-left": desktopRightLeftIcon,
    "desktop-centered": desktopCenteredIcon,
    "desktop-split": desktopSplitIcon,
    "desktop-card": desktopCardIcon,
    "desktop-panel": desktopPanelIcon,
  };
  
  const icon = iconMap[type];
  if (!icon) return null;
  
  return <img src={icon} alt={type} className="w-full h-full" />;
};

export const LayoutSelector = ({
  desktopLayout,
  mobileLayout,
  onDesktopLayoutChange,
  onMobileLayoutChange,
  excludeDesktopLayouts = [],
  excludeMobileLayouts = []
}: LayoutSelectorProps) => {
  const filteredDesktopLayouts = DESKTOP_LAYOUTS.filter(layout => !excludeDesktopLayouts.includes(layout.id));
  const filteredMobileLayouts = MOBILE_LAYOUTS.filter(layout => !excludeMobileLayouts.includes(layout.id));
  return (
    <div className="flex gap-2">
      {/* Mobile */}
      <div className="flex-1 space-y-1">
        <Label className="text-[10px] text-muted-foreground">Mobile</Label>
        <Select value={mobileLayout} onValueChange={onMobileLayoutChange}>
          <SelectTrigger className="h-9">
            <div className="flex items-center gap-2 w-full">
              <div className="w-5 h-5 flex-shrink-0">
                <LayoutIcon type={mobileLayout} />
              </div>
            </div>
          </SelectTrigger>
          <SelectContent>
            {filteredMobileLayouts.map((layout) => (
              <SelectItem key={layout.id} value={layout.id} className="text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5">
                    <LayoutIcon type={layout.id} />
                  </div>
                  <span>{layout.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop */}
      <div className="flex-1 space-y-1">
        <Label className="text-[10px] text-muted-foreground">Desktop</Label>
        <Select value={desktopLayout} onValueChange={onDesktopLayoutChange}>
          <SelectTrigger className="h-9">
            <div className="flex items-center gap-2 w-full">
              <div className="w-5 h-5 flex-shrink-0">
                <LayoutIcon type={desktopLayout} />
              </div>
            </div>
          </SelectTrigger>
          <SelectContent>
            {filteredDesktopLayouts.map((layout) => (
              <SelectItem key={layout.id} value={layout.id} className="text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5">
                    <LayoutIcon type={layout.id} />
                  </div>
                  <span>{layout.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
