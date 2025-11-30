import { useEffect } from 'react';
import type { Campaign } from '@/types/campaign';
import { ParticipantWheelRender } from './ParticipantWheelRender';
import { ParticipantQuizRender } from './ParticipantQuizRender';
import { ParticipantScratchRender } from './ParticipantScratchRender';
import { ParticipantJackpotRender } from './ParticipantJackpotRender';
import { ParticipantFormRender } from './ParticipantFormRender';

interface PublicCampaignRendererProps {
  campaign: Campaign;
}

/**
 * Composant qui affiche le bon type de campagne selon son type
 * et applique le thème configuré
 */
export function PublicCampaignRenderer({ campaign }: PublicCampaignRendererProps) {
  
  // Appliquer le thème de la campagne
  useEffect(() => {
    if (campaign.theme && typeof campaign.theme === 'object') {
      const theme = campaign.theme as Record<string, any>;
      
      // Appliquer les variables CSS du thème
      const root = document.documentElement;
      Object.entries(theme).forEach(([key, value]) => {
        if (typeof value === 'string') {
          // Convertir les clés camelCase en kebab-case pour CSS
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          root.style.setProperty(`--campaign-${cssKey}`, value);
        }
      });
    }

    // Nettoyer au démontage
    return () => {
      const root = document.documentElement;
      // Retirer les variables CSS du thème
      if (campaign.theme && typeof campaign.theme === 'object') {
        const theme = campaign.theme as Record<string, any>;
        Object.keys(theme).forEach((key) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          root.style.removeProperty(`--campaign-${cssKey}`);
        });
      }
    };
  }, [campaign.theme]);

  // Extraire le config de la campagne
  const config = campaign.config as any;

  // Afficher le composant approprié selon le type
  switch (campaign.type) {
    case 'wheel':
      return <ParticipantWheelRender config={config} campaignId={campaign.id} />;
    
    case 'quiz':
      return <ParticipantQuizRender config={config} campaignId={campaign.id} />;
    
    case 'scratch':
      return <ParticipantScratchRender config={config} campaignId={campaign.id} />;
    
    case 'jackpot':
      return <ParticipantJackpotRender config={config} campaignId={campaign.id} />;
    
    case 'form':
      // Le formulaire attend questions directement
      return <ParticipantFormRender questions={config.questions || []} />;
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              Type de campagne non supporté : {campaign.type}
            </p>
          </div>
        </div>
      );
  }
}
