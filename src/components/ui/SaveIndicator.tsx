import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export const SaveIndicator = ({ status, className }: SaveIndicatorProps) => {
  if (status === 'idle') return null;

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="w-3 h-3 text-green-600" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3 h-3 text-destructive" />
          <span className="text-destructive">Error</span>
        </>
      )}
    </div>
  );
};
