import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Save, Globe, Palette, Gift, Loader2, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { PublishService } from "@/services/PublishService";
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

interface ScratchTopToolbarProps {
  onPreview: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  activeTab: 'design' | 'campaign' | 'templates';
  onTabChange: (tab: 'design' | 'campaign' | 'templates') => void;
  campaignId?: string;
}

export const ScratchTopToolbar = ({ onPreview, onSave, onPublish, isSaving, hasUnsavedChanges, activeTab, onTabChange, campaignId }: ScratchTopToolbarProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

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

  const handlePublish = async () => {
    if (!campaignId) {
      toast.error("Impossible de publier : ID de campagne manquant");
      return;
    }

    if (hasUnsavedChanges && onSave) {
      toast.info("Sauvegarde des modifications...");
      await onSave();
    }

    setIsPublishing(true);

    try {
      const result = await PublishService.publish(campaignId);

      if (result.success) {
        toast.success("Campagne publiée avec succès !", {
          description: "Votre campagne est maintenant accessible au public",
          action: {
            label: "Copier le lien",
            onClick: () => {
              if (result.publicUrl) {
                navigator.clipboard.writeText(result.publicUrl);
                toast.success("Lien copié !");
              }
            },
          },
        });

        if (onPublish) {
          onPublish();
        }
      } else {
        toast.error(result.error || "Erreur lors de la publication");
      }
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Erreur lors de la publication de la campagne");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <div className={`h-12 bg-card border-b border-border flex items-center ${isMobile ? 'overflow-x-auto px-3' : 'justify-center px-3'}`}>
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
            Paramètres et dotations
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-1.5 h-8 text-xs px-2.5 ${activeTab === 'templates' ? 'bg-accent' : ''}`}
            onClick={() => onTabChange('templates')}
          >
            <Palette className="w-3.5 h-3.5" />
            Templates
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
            className="gap-2 h-8 px-4 text-xs font-medium"
            style={{ 
              backgroundColor: '#f5ca3c', 
              color: '#3d3731',
              border: 'none',
            }}
            onClick={handlePublish}
            disabled={isSaving || isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                Publier
              </>
            )}
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
