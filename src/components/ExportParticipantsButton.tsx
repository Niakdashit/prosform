import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { ExportService } from '@/services/ExportService';
import { toast } from 'sonner';

interface ExportParticipantsButtonProps {
  campaignId: string;
  campaignTitle: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ExportParticipantsButton({
  campaignId,
  campaignTitle,
  variant = 'outline',
  size = 'default',
  className,
}: ExportParticipantsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const success = await ExportService.exportCampaignParticipants(
        campaignId,
        campaignTitle
      );

      if (success) {
        toast.success('Export réussi', {
          description: 'Le fichier CSV a été téléchargé',
        });
      } else {
        toast.error('Échec de l\'export', {
          description: 'Aucune donnée à exporter ou erreur lors de l\'export',
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de l\'export',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={className}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Export en cours...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Exporter CSV
        </>
      )}
    </Button>
  );
}
