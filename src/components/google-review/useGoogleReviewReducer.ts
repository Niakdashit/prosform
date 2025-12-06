import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { 
  GoogleReviewState, 
  GoogleReviewAction, 
  GoogleReviewConfig,
  GoogleReviewPrize,
  QRCodeData 
} from './types';
import { initialGoogleReviewState } from './types';

function googleReviewReducer(
  state: GoogleReviewState,
  action: GoogleReviewAction
): GoogleReviewState {
  switch (action.type) {
    case 'START_FLOW':
      return {
        ...state,
        currentStep: 'instructions',
      };

    case 'CLOSE_INSTRUCTIONS':
      return {
        ...state,
        currentStep: 'review',
      };

    case 'SELECT_RATING':
      return {
        ...state,
        selectedRating: action.rating,
      };

    case 'OPEN_NEGATIVE_MODAL':
      return {
        ...state,
        currentStep: 'negative-modal',
      };

    case 'CLOSE_NEGATIVE_MODAL':
      return {
        ...state,
        currentStep: 'review',
      };

    case 'SUBMIT_NEGATIVE_REVIEW':
      return {
        ...state,
        negativeReviewText: action.text,
        negativeReviewStars: action.stars,
        currentStep: 'game',
        gameUnlocked: true,
      };

    case 'START_TIMER':
      return {
        ...state,
        timerStartedAt: Date.now(),
        currentStep: 'game', // Afficher la vue du jeu avec la roue
        // gameUnlocked reste false - le spinner sera affiché
      };

    case 'COMPLETE_TIMER':
      return {
        ...state,
        timerCompleted: true,
        gameUnlocked: true,
        currentStep: 'game',
      };

    case 'UNLOCK_GAME':
      return {
        ...state,
        gameUnlocked: true,
        currentStep: 'game',
      };

    case 'PLAY_GAME':
      return {
        ...state,
        hasPlayed: true,
      };

    case 'SET_RESULT':
      return {
        ...state,
        hasWon: action.hasWon,
        wonPrize: action.prize,
        assignedQRCode: action.qrCode,
        currentStep: 'result',
      };

    case 'RESET':
      return initialGoogleReviewState;

    default:
      return state;
  }
}

interface UseGoogleReviewOptions {
  config: GoogleReviewConfig;
  onNegativeReviewSubmit?: (text: string, stars: number) => void;
  onRedirectToGoogle?: () => void;
  onGameComplete?: (hasWon: boolean, prize: GoogleReviewPrize | null, qrCode: QRCodeData | null) => void;
  isPreview?: boolean; // En mode preview, on démarre sur 'game' au lieu de 'instructions'
}

export function useGoogleReview(options: UseGoogleReviewOptions) {
  const { config, onNegativeReviewSubmit, onRedirectToGoogle, onGameComplete, isPreview = false } = options;
  
  // En mode preview, on démarre directement sur le jeu avec gameUnlocked=true
  const initialState: GoogleReviewState = isPreview 
    ? { ...initialGoogleReviewState, currentStep: 'game', gameUnlocked: true }
    : initialGoogleReviewState;
    
  const [state, dispatch] = useReducer(googleReviewReducer, initialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Gérer le timer de 20 secondes
  useEffect(() => {
    if (state.timerStartedAt && !state.timerCompleted) {
      const timerDuration = config.general.timerDuration * 1000;
      const elapsed = Date.now() - state.timerStartedAt;
      const remaining = timerDuration - elapsed;

      if (remaining <= 0) {
        dispatch({ type: 'COMPLETE_TIMER' });
      } else {
        timerRef.current = setTimeout(() => {
          dispatch({ type: 'COMPLETE_TIMER' });
        }, remaining);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state.timerStartedAt, state.timerCompleted, config.general.timerDuration]);

  // Nettoyer les intervalles au démontage
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, []);

  // Actions exposées
  const startFlow = useCallback(() => {
    dispatch({ type: 'START_FLOW' });
  }, []);

  const closeInstructions = useCallback(() => {
    dispatch({ type: 'CLOSE_INSTRUCTIONS' });
  }, []);

  const selectRating = useCallback((rating: 'horrible' | 'moyen' | 'excellent') => {
    dispatch({ type: 'SELECT_RATING', rating });

    if (rating === 'excellent') {
      // Redirection vers Google et démarrage du timer en arrière-plan
      if (config.general.googleReviewUrl) {
        window.open(config.general.googleReviewUrl, '_blank');
      }
      onRedirectToGoogle?.();
      // Démarrer le timer mais rester sur la vue du jeu (pas d'écran d'attente visible)
      dispatch({ type: 'START_TIMER' });
      // Débloquer le jeu immédiatement - le participant peut jouer dès qu'il revient
      setTimeout(() => {
        dispatch({ type: 'UNLOCK_GAME' });
      }, config.general.timerDuration * 1000);
    } else {
      // Ouvrir la modale d'avis négatif
      dispatch({ type: 'OPEN_NEGATIVE_MODAL' });
    }
  }, [config.general.googleReviewUrl, config.general.timerDuration, onRedirectToGoogle]);

  const closeNegativeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_NEGATIVE_MODAL' });
  }, []);

  const submitNegativeReview = useCallback((text: string, stars: number) => {
    dispatch({ type: 'SUBMIT_NEGATIVE_REVIEW', text, stars });
    onNegativeReviewSubmit?.(text, stars);
  }, [onNegativeReviewSubmit]);

  // Si l'utilisateur change d'avis et clique sur 4 ou 5 étoiles dans la modale
  const upgradeRating = useCallback(() => {
    if (config.general.googleReviewUrl) {
      window.open(config.general.googleReviewUrl, '_blank');
    }
    onRedirectToGoogle?.();
    // Démarrer le timer en arrière-plan et débloquer le jeu après
    dispatch({ type: 'START_TIMER' });
    setTimeout(() => {
      dispatch({ type: 'UNLOCK_GAME' });
    }, config.general.timerDuration * 1000);
  }, [config.general.googleReviewUrl, config.general.timerDuration, onRedirectToGoogle]);

  const playGame = useCallback(() => {
    dispatch({ type: 'PLAY_GAME' });
  }, []);

  const setGameResult = useCallback((
    hasWon: boolean,
    prize: GoogleReviewPrize | null,
    qrCode: QRCodeData | null
  ) => {
    dispatch({ type: 'SET_RESULT', hasWon, prize, qrCode });
    onGameComplete?.(hasWon, prize, qrCode);
  }, [onGameComplete]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Calcul du temps restant pour le timer
  const getRemainingTime = useCallback(() => {
    if (!state.timerStartedAt) return config.general.timerDuration;
    const elapsed = Math.floor((Date.now() - state.timerStartedAt) / 1000);
    return Math.max(0, config.general.timerDuration - elapsed);
  }, [state.timerStartedAt, config.general.timerDuration]);

  return {
    state,
    actions: {
      startFlow,
      closeInstructions,
      selectRating,
      closeNegativeModal,
      submitNegativeReview,
      upgradeRating,
      playGame,
      setGameResult,
      reset,
    },
    getRemainingTime,
  };
}
