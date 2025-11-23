import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, ExternalLink, Grid2x2, Mail, Diamond } from "lucide-react";
import { cn } from "@/lib/utils";

interface EndingTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: string) => void;
}

export const EndingTypeModal = ({ open, onOpenChange, onSelectType }: EndingTypeModalProps) => {
  const endingTypes = [
    {
      id: "end-screen",
      label: "End Screen",
      icon: FileText,
      premium: false,
    },
    {
      id: "redirect-url",
      label: "Redirect to URL",
      icon: ExternalLink,
      premium: true,
    },
  ];

  const postSubmitActions = [
    {
      id: "connect-apps",
      label: "Connect to apps",
      icon: Grid2x2,
      premium: false,
    },
    {
      id: "send-messages",
      label: "Send messages",
      icon: Mail,
      premium: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose an ending type</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Ending Types */}
          <div className="space-y-2">
            {endingTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    onSelectType(type.id);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                    "hover:border-primary hover:bg-muted/50",
                    "text-left group"
                  )}
                >
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="text-base font-medium flex-1">{type.label}</span>
                  {type.premium && (
                    <Diamond className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Post-submit Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Post-submit actions</h3>
            <div className="space-y-2">
              {postSubmitActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      onSelectType(action.id);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                      "hover:border-primary hover:bg-muted/50",
                      "text-left group"
                    )}
                  >
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                    <span className="text-base font-medium flex-1">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
