import { useCallback, useEffect, useState } from 'react';
import { useTheme, getButtonStyles } from '@/contexts/ThemeContext';
import SmartWheel from '@/components/SmartWheel/SmartWheel';
import { useGoogleReview } from './useGoogleReviewReducer';
import { InstructionsModal } from './InstructionsModal';
import { ReviewView } from './ReviewView';
import { NegativeReviewModal } from './NegativeReviewModal';
import { WaitingScreen } from './WaitingScreen';
import { ResultScreen } from './ResultScreen';
import { findAvailableQRCode, markQRCodeAsUsed } from './qrCodeService';
import type { 
  GoogleReviewConfig, 
  GoogleReviewPrize, 
  QRCodeData,
  WheelSegment 
} from './types';
import { defaultGoogleReviewConfig } from './types';

// Import des composants de jeu existants (à adapter selon la structure)
// Pour l'instant, on crée un wrapper simple
interface GoogleReviewGameProps {
  config: GoogleReviewConfig;
  onConfigUpdate?: (config: GoogleReviewConfig) => void;
  onNegativeReviewSubmit?: (text: string, stars: number, participantId: string) => void;
  onGameComplete?: (result: {
    hasWon: boolean;
    prize: GoogleReviewPrize | null;
    qrCode: QRCodeData | null;
    participantId: string;
  }) => void;
  viewMode?: 'desktop' | 'mobile';
  isPreview?: boolean;
  isMobileResponsive?: boolean; // Pour le mode éditeur mobile (plein écran)
}

export function GoogleReviewGame({
  config = defaultGoogleReviewConfig,
  onConfigUpdate,
  onNegativeReviewSubmit,
  onGameComplete,
  viewMode = 'mobile',
  isPreview = false,
  isMobileResponsive = false,
}: GoogleReviewGameProps) {
  const { theme } = useTheme();
  const [participantId] = useState(() => `participant-${Date.now()}`);
  const [prizes, setPrizes] = useState<GoogleReviewPrize[]>(config.prizes);

  const handleNegativeReviewSubmit = useCallback((text: string, stars: number) => {
    onNegativeReviewSubmit?.(text, stars, participantId);
  }, [onNegativeReviewSubmit, participantId]);

  const handleGameComplete = useCallback((
    hasWon: boolean, 
    prize: GoogleReviewPrize | null, 
    qrCode: QRCodeData | null
  ) => {
    onGameComplete?.({
      hasWon,
      prize,
      qrCode,
      participantId,
    });
  }, [onGameComplete, participantId]);

  const { state, actions, getRemainingTime } = useGoogleReview({
    config,
    onNegativeReviewSubmit: handleNegativeReviewSubmit,
    onRedirectToGoogle: () => {
      console.log('Redirection vers Google Review...');
    },
    onGameComplete: handleGameComplete,
    isPreview, // Passer le mode preview pour démarrer sur 'game' au lieu de 'instructions'
  });

  // Fonction pour déterminer le résultat du jeu
  const determineGameResult = useCallback((): {
    hasWon: boolean;
    prize: GoogleReviewPrize | null;
    qrCode: QRCodeData | null;
  } => {
    // Filtrer les lots actifs avec des QR codes disponibles
    const activePrizes = prizes.filter(p => 
      p.status === 'active' && 
      p.remaining > 0 &&
      p.qrCodes.some(qr => !qr.isUsed)
    );

    if (activePrizes.length === 0) {
      return { hasWon: false, prize: null, qrCode: null };
    }

    // Calculer la probabilité totale
    const totalProbability = activePrizes.reduce((sum, p) => sum + p.probability, 0);
    
    // Tirer un nombre aléatoire
    const random = Math.random() * 100;
    
    // Vérifier si on gagne (basé sur les probabilités)
    let cumulativeProbability = 0;
    for (const prize of activePrizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        // Gagné ! Trouver un QR code disponible
        const qrCode = findAvailableQRCode(prize);
        if (qrCode) {
          // Marquer le QR code comme utilisé
          const updatedQRCodes = markQRCodeAsUsed(
            prize.qrCodes,
            qrCode.id,
            participantId
          );
          
          // Mettre à jour le lot
          const updatedPrize = {
            ...prize,
            qrCodes: updatedQRCodes,
            remaining: prize.remaining - 1,
            status: prize.remaining - 1 === 0 ? 'depleted' as const : 'active' as const,
          };

          // Mettre à jour la liste des lots
          setPrizes(prev => prev.map(p => 
            p.id === prize.id ? updatedPrize : p
          ));

          return {
            hasWon: true,
            prize: updatedPrize,
            qrCode: { ...qrCode, isUsed: true, usedAt: new Date().toISOString(), usedBy: participantId },
          };
        }
      }
    }

    return { hasWon: false, prize: null, qrCode: null };
  }, [prizes, participantId]);

  // Composant de jeu intégré (Roue simple pour commencer)
  const GameComponent = () => {
    const [isSpinning, setIsSpinning] = useState(false);

    const segments = config.wheelConfig?.segments || [
      { id: '1', label: 'Lot 1', color: '#FF6B6B' },
      { id: '2', label: 'Lot 2', color: '#4ECDC4' },
      { id: '3', label: 'Lot 3', color: '#45B7D1' },
      { id: '4', label: 'Lot 4', color: '#96CEB4' },
      { id: '5', label: 'Perdu', color: '#DDD' },
      { id: '6', label: 'Lot 5', color: '#FFEAA7' },
    ];

    // Convertir les segments pour SmartWheel (ajouter 'value' requis)
    const wheelSegments = segments.map((seg) => ({
      id: seg.id,
      label: seg.label,
      value: seg.label,
      color: seg.color,
      textColor: seg.textColor || '#FFFFFF',
      probability: seg.probability || Math.floor(100 / segments.length),
      icon: seg.icon,
    }));

    // Gérer le résultat de la roue
    const handleWheelResult = (segment: any) => {
      const result = determineGameResult();
      actions.setGameResult(result.hasWon, result.prize, result.qrCode);
    };

    return (
      <div 
        className="min-h-full flex flex-col items-center justify-center px-6 py-12"
        style={{ 
          backgroundColor: config.game.backgroundColor || theme.backgroundColor || '#FFFFFF',
          backgroundImage: config.game.backgroundImage ? `url(${config.game.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Logo */}
        {config.general.businessLogo && (
          <div className="mb-6">
            <img 
              src={config.general.businessLogo} 
              alt={config.general.businessName}
              className="h-16 object-contain"
            />
          </div>
        )}

        {/* Titre */}
        <h1 
          className="text-2xl font-bold text-center mb-2"
          style={{ color: theme.textColor || '#1F2937' }}
          dangerouslySetInnerHTML={
            config.game.titleHtml 
              ? { __html: config.game.titleHtml }
              : undefined
          }
        >
          {!config.game.titleHtml ? config.game.title : null}
        </h1>

        {/* Sous-titre */}
        <p 
          className="text-center mb-6 opacity-80"
          style={{ color: theme.textColor || '#6B7280' }}
        >
          {config.game.subtitle}
        </p>

        {/* SmartWheel - même composant que l'éditeur */}
        <div className="relative flex-shrink-0">
          <SmartWheel
            segments={wheelSegments}
            size={viewMode === 'mobile' ? 280 : 350}
            onSpin={() => {
              if (!state.gameUnlocked) {
                // Si le jeu n'est pas débloqué, démarrer le flux (instructions)
                actions.startFlow();
              }
            }}
            onResult={handleWheelResult}
            disabled={isSpinning || (state.timerStartedAt && !state.gameUnlocked)}
            brandColors={{
              primary: theme.buttonColor || '#F5B800',
              secondary: theme.backgroundColor || '#FFFFFF',
              accent: theme.textColor || '#1F2937'
            }}
          />
        </div>
      </div>
    );
  };

  // Rendu conditionnel selon l'étape
  return (
    <div 
      className={isMobileResponsive 
        ? "w-full h-full relative overflow-hidden" 
        : "flex items-center justify-center relative overflow-hidden"
      }
    >
      <div 
        className="relative overflow-hidden transition-all duration-300 flex-shrink-0 flex flex-col bg-white rounded-3xl shadow-2xl" 
        style={{ 
          backgroundColor: theme.backgroundColor || '#FFFFFF',
          width: isMobileResponsive ? '100%' : (viewMode === 'desktop' ? '1100px' : '375px'), 
          minWidth: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '1100px' : '375px'),
          maxWidth: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '1100px' : '375px'),
          height: isMobileResponsive ? '100%' : (viewMode === 'desktop' ? '620px' : '667px'),
          minHeight: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '620px' : '667px'),
          maxHeight: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '620px' : '667px'),
        }}
      >
      {/* Modale d'instructions (plein écran, sans jeu derrière) */}
      {state.currentStep === 'instructions' && (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.backgroundColor || '#FFFFFF' }}>
          <InstructionsModal
            config={config}
            isOpen={true}
            onClose={() => {}} // Pas de fermeture sans continuer
            onContinue={actions.closeInstructions}
          />
        </div>
      )}

      {/* Vue avis */}
      {state.currentStep === 'review' && (
        <ReviewView
          config={config}
          onSelectRating={actions.selectRating}
        />
      )}

      {/* Modale d'avis négatif */}
      {state.currentStep === 'negative-modal' && (
        <>
          <ReviewView
            config={config}
            onSelectRating={actions.selectRating}
          />
          <NegativeReviewModal
            config={config}
            isOpen={true}
            initialStars={state.selectedRating === 'horrible' ? 1 : 2}
            onClose={actions.closeNegativeModal}
            onSubmit={actions.submitNegativeReview}
            onUpgradeRating={actions.upgradeRating}
          />
        </>
      )}

      {/* Écran d'attente */}
      {state.currentStep === 'waiting' && (
        <WaitingScreen
          config={config}
          remainingSeconds={getRemainingTime()}
          onComplete={() => actions.setGameResult(false, null, null)} // Sera remplacé par le vrai résultat
        />
      )}

      {/* Vue du jeu */}
      {state.currentStep === 'game' && (
        <GameComponent />
      )}

      {/* Overlay masque noir avec spinner pendant la validation */}
      {state.timerStartedAt && !state.gameUnlocked && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 rounded-3xl">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mb-4" />
          <p className="text-white font-semibold">En attente de validation</p>
        </div>
      )}

      {/* Écran de résultat */}
      {state.currentStep === 'result' && (
        <ResultScreen
          config={config}
          hasWon={state.hasWon}
          prize={state.wonPrize}
          qrCode={state.assignedQRCode}
        />
      )}
      </div>
    </div>
  );
}
