import { DesktopLayoutType, MobileLayoutType, DESKTOP_LAYOUTS, MOBILE_LAYOUTS } from "@/types/layouts";
import { Monitor, Smartphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import mobileVerticalIcon from "@/assets/layout-mobile-vertical.svg";
import mobileHorizontalIcon from "@/assets/layout-mobile-horizontal.svg";
import mobileCenteredIcon from "@/assets/layout-mobile-centered.svg";
import mobileMinimalIcon from "@/assets/layout-mobile-minimal.svg";
import desktopLeftRightIcon from "@/assets/layout-desktop-left-right.svg";
import desktopRightLeftIcon from "@/assets/layout-desktop-right-left.svg";
import desktopCenteredIcon from "@/assets/layout-desktop-centered.svg";
import desktopSplitIcon from "@/assets/layout-desktop-split.svg";
import desktopCardIcon from "@/assets/layout-desktop-card.svg";
import desktopPanelIcon from "@/assets/layout-desktop-panel.svg";
import desktopWallpaperIcon from "@/assets/layout-desktop-wallpaper.svg";

interface LayoutSelectorProps {
  desktopLayout: DesktopLayoutType;
  mobileLayout: MobileLayoutType;
  onDesktopLayoutChange: (layout: DesktopLayoutType) => void;
  onMobileLayoutChange: (layout: MobileLayoutType) => void;
}

const LayoutIcon = ({ type }: { type: string }) => {
  const iconMap: Record<string, string> = {
    "mobile-vertical": mobileVerticalIcon,
    "mobile-horizontal": mobileHorizontalIcon,
    "mobile-centered": mobileCenteredIcon,
    "mobile-minimal": mobileMinimalIcon,
    "desktop-left-right": desktopLeftRightIcon,
    "desktop-right-left": desktopRightLeftIcon,
    "desktop-centered": desktopCenteredIcon,
    "desktop-split": desktopSplitIcon,
    "desktop-card": desktopCardIcon,
    "desktop-panel": desktopPanelIcon,
    "desktop-wallpaper": desktopWallpaperIcon,
  };
  
  const icon = iconMap[type];
  if (!icon) return null;
  
  return <img src={icon} alt={type} className="w-full h-full" />;
};

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
            <div className="flex items-center gap-2 w-full">
              <div className="w-6 h-6 flex-shrink-0">
                <LayoutIcon type={mobileLayout} />
              </div>
              <svg className="ml-auto w-3 h-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </SelectTrigger>
          <SelectContent>
            {MOBILE_LAYOUTS.map((layout) => (
              <SelectItem key={layout.id} value={layout.id} className="text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6">
                    <LayoutIcon type={layout.id} />
                  </div>
                  <span>{layout.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Desktop</Label>
        <Select value={desktopLayout} onValueChange={onDesktopLayoutChange}>
          <SelectTrigger className="h-9">
            <div className="flex items-center gap-2 w-full">
              <div className="w-6 h-6 flex-shrink-0">
                <LayoutIcon type={desktopLayout} />
              </div>
              <svg className="ml-auto w-3 h-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </SelectTrigger>
          <SelectContent>
            {DESKTOP_LAYOUTS.map((layout) => (
              <SelectItem key={layout.id} value={layout.id} className="text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6">
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
