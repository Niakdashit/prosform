import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';

interface InactivityWarningModalProps {
  open: boolean;
  onStayConnected: () => void;
  onLogout: () => void;
}

export function InactivityWarningModal({
  open,
  onStayConnected,
  onLogout,
}: InactivityWarningModalProps) {
  const [countdown, setCountdown] = useState(120); // 2 minutes = 120 secondes

  useEffect(() => {
    if (!open) {
      setCountdown(120);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center">Session inactive</DialogTitle>
          <DialogDescription className="text-center">
            Vous allez être déconnecté pour inactivité dans{' '}
            <span className="font-bold text-amber-600">{formatTime(countdown)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Pour des raisons de sécurité, votre session sera automatiquement fermée après 15 minutes d'inactivité.
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
          <Button
            onClick={onStayConnected}
            className="w-full sm:w-auto"
          >
            Rester connecté
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
