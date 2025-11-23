import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value?: number;
  indeterminate?: boolean;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}

export const ProgressBar = ({
  value = 0,
  indeterminate = false,
  className,
  trackClassName,
  fillClassName
}: ProgressBarProps) => {
  return (
    <div
      className={cn(
        "w-full h-1 rounded-full overflow-hidden relative",
        "bg-muted/30",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          indeterminate 
            ? "animate-[progressBar_1.3s_infinite_linear] origin-left" 
            : "",
          fillClassName || "bg-primary"
        )}
        style={indeterminate ? {} : { width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};
