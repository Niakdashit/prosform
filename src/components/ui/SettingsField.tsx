import { ReactNode } from "react";
import { Label } from "./label";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface SettingsFieldProps {
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}

export const SettingsField = ({
  label,
  help,
  error,
  children,
  required = false
}: SettingsFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-xs font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {help && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">{help}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};
