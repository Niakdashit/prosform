import { ReactNode, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  icon?: ReactNode;
  defaultCollapsed?: boolean;
  children: ReactNode;
  badge?: string | number;
}

export const SettingsSection = ({
  title,
  icon,
  defaultCollapsed = false,
  children,
  badge
}: SettingsSectionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-2 -mx-2 rounded-md hover:bg-accent/50 transition-colors group"
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
          )}
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h4 className="text-sm font-semibold">{title}</h4>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {badge}
            </span>
          )}
        </div>
      </button>
      
      {!isCollapsed && (
        <div className="pl-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};
