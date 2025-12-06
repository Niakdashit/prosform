import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { GoogleReviewGame } from '@/components/google-review/GoogleReviewGame';
import { defaultGoogleReviewConfig } from '@/components/google-review/types';
import type { GoogleReviewConfig, GoogleReviewPrize, QRCodeData } from '@/components/google-review/types';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { CampaignService } from '@/services/CampaignService';
import { supabase } from '@/integrations/supabase/client';

function GoogleReviewPreviewContent() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('id');
  const { updateTheme } = useTheme();
  
  const [config, setConfig] = useState<GoogleReviewConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      
      try {
        // Essayer de charger depuis la campagne en base
        if (campaignId) {
          const campaign = await CampaignService.getById(campaignId);
          if (campaign && campaign.config) {
            setConfig(campaign.config as unknown as GoogleReviewConfig);
            if (campaign.theme) {
              updateTheme(campaign.theme);
            }
            setIsLoading(false);
            return;
          }
        }
        
        // Sinon, charger depuis localStorage (mode preview)
        const savedConfig = localStorage.getItem('google-review-config');
        const savedTheme = localStorage.getItem('google-review-theme');
        
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
          if (savedTheme) {
            updateTheme(JSON.parse(savedTheme));
          }
        } else {
          setConfig(defaultGoogleReviewConfig);
        }
      } catch (err) {
        console.error('Error loading config:', err);
        setError('Erreur lors du chargement de la campagne');
        setConfig(defaultGoogleReviewConfig);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  // Gestion des résultats du jeu
  const handleGameComplete = async (result: {
    hasWon: boolean;
    prize: GoogleReviewPrize | null;
    qrCode: QRCodeData | null;
    participantId: string;
  }) => {
    console.log('Game complete:', result);
    
    // Enregistrer la participation en base si on a un campaignId
    if (campaignId && result.hasWon && result.prize) {
      try {
        await supabase.from('participations').insert({
          campaign_id: campaignId,
          participant_data: { participantId: result.participantId },
          has_won: result.hasWon,
          prize_name: result.prize.name,
          prize_code: result.qrCode?.code,
        });
      } catch (err) {
        console.error('Error saving participation:', err);
      }
    }
  };

  // Gestion des avis négatifs
  const handleNegativeReviewSubmit = async (
    text: string, 
    stars: number, 
    participantId: string
  ) => {
    console.log('Negative review:', { text, stars, participantId });
    
    // Enregistrer l'avis négatif en base si on a un campaignId
    if (campaignId) {
      try {
        await supabase.from('google_reviews').insert({
          campaign_id: campaignId,
          participant_id: participantId,
          rating: stars,
          review_text: text,
          is_google_redirect: false,
        });
      } catch (err) {
        console.error('Error saving negative review:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
          <p className="text-gray-500">Chargement du jeu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-gray-500">Veuillez réessayer plus tard</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-8">
      <GoogleReviewGame
        config={config}
        onNegativeReviewSubmit={handleNegativeReviewSubmit}
        onGameComplete={handleGameComplete}
        viewMode="mobile"
        isPreview={false}
      />
    </div>
  );
}

const GoogleReviewPreview = () => {
  return (
    <ThemeProvider>
      <GoogleReviewPreviewContent />
    </ThemeProvider>
  );
};

export default GoogleReviewPreview;
