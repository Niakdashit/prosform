import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Save, Globe, Palette, Gift, Loader2, X, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GoogleReviewTopToolbarProps {
  onPreview: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  activeTab: 'design' | 'campaign' | 'qrcodes';
  onTabChange: (tab: 'design' | 'campaign' | 'qrcodes') => void;
}

export const GoogleReviewTopToolbar = ({ 
  onPreview, 
  onSave, 
  onPublish, 
  isSaving, 
  hasUnsavedChanges, 
  activeTab, 
  onTabChange 
}: GoogleReviewTopToolbarProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showExitDialog, setShowExitDialog] = useState(false);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      navigate('/campaigns');
    }
  };

  const handleConfirmExit = () => {
    setShowExitDialog(false);
    navigate('/campaigns');
  };

  return (
    <>
      <div className={`h-12 bg-card border-b border-border flex items-center ${isMobile ? 'overflow-x-auto px-3' : 'justify-center px-3'}`}>
        {/* Badge Google Review */}
        <div className="flex items-center gap-2 mr-4">
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
            <Star className="w-3 h-3 fill-amber-500" />
            <span className="text-xs font-medium">Google Review</span>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 ${isMobile ? 'flex-shrink-0' : ''}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-1.5 h-8 text-xs px-2.5 ${activeTab === 'design' ? 'bg-accent' : ''}`}
            onClick={() => onTabChange('design')}
          >
            <Palette className="w-3.5 h-3.5" />
            Campagne
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-1.5 h-8 text-xs px-2.5 ${activeTab === 'campaign' ? 'bg-accent' : ''}`}
            onClick={() => onTabChange('campaign')}
          >
            <Gift className="w-3.5 h-3.5" />
            Paramètres et lots
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-1.5 h-8 text-xs px-2.5 ${activeTab === 'qrcodes' ? 'bg-accent' : ''}`}
            onClick={() => onTabChange('qrcodes')}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="3" height="3" />
              <rect x="18" y="14" width="3" height="3" />
              <rect x="14" y="18" width="3" height="3" />
              <rect x="18" y="18" width="3" height="3" />
            </svg>
            QR Codes
          </Button>
        </div>

        <div className={`flex items-center gap-2 ${isMobile ? 'flex-shrink-0 ml-2' : 'absolute right-3'}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={onPreview}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 h-8 px-3 text-xs font-medium"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-8 px-3 text-xs font-medium"
            onClick={handleClose}
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
            Fermer
          </Button>
          <Button 
            size="sm" 
            className="gap-2 h-8 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onPublish}
            disabled={isSaving}
          >
            <Globe className="w-4 h-4" />
            Publier
          </Button>
        </div>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifications non sauvegardées</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter sans sauvegarder ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer l'édition</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Quitter sans sauvegarder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
