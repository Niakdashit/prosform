// Types pour le parcours Google Review

import { 
  HeaderConfig, 
  FooterConfig, 
  defaultHeaderConfig, 
  defaultFooterConfig 
} from '@/components/campaign';

export type ReviewRating = 'horrible' | 'moyen' | 'excellent';

export type GoogleReviewStep = 
  | 'instructions'    // Modale initiale avec les étapes
  | 'review'          // Vue pour noter (3 smileys)
  | 'negative-modal'  // Modale pour avis négatif (horrible/moyen)
  | 'waiting'         // Écran d'attente avec spinner
  | 'game'            // Vue du jeu (roue/scratch/jackpot)
  | 'result';         // Écran de fin avec QR code

export type GoogleReviewGameType = 'wheel' | 'scratch' | 'jackpot';

// Re-export des types de campaign pour faciliter l'import
export type { HeaderConfig, FooterConfig };

export interface GoogleReviewConfig {
  // Configuration générale
  general: {
    businessName: string;
    businessLogo?: string;
    googleReviewUrl: string;  // URL Google My Business pour les avis
    timerDuration: number;    // Durée du timer en secondes (défaut: 20)
    gameType: GoogleReviewGameType;
  };
  
  // Layout global (header/footer)
  layout?: {
    header: HeaderConfig;
    footer: FooterConfig;
  };
  
  // Configuration de la modale d'instructions
  instructions: {
    title: string;
    titleHtml?: string;
    steps: string[];
    buttonText: string;
    backgroundColor?: string;
  };
  
  // Configuration de la vue avis
  review: {
    title: string;
    titleHtml?: string;
    subtitle: string;
    subtitleHtml?: string;
    backgroundImage?: string;
    backgroundColor?: string;
    ratingType?: 'smileys' | 'stars'; // Type de notation
    ratings: {
      horrible: {
        label: string;
        color: string;
        emoji: string;
      };
      moyen: {
        label: string;
        color: string;
        emoji: string;
      };
      excellent: {
        label: string;
        color: string;
        emoji: string;
      };
    };
  };
  
  // Configuration de la modale d'avis négatif
  negativeReview: {
    title: string;
    placeholder: string;
    buttonText: string;
    minLength?: number;
    showStars?: boolean;
    starsDefault?: number;
  };
  
  // Configuration de l'écran d'attente
  waiting: {
    title: string;
    subtitle: string;
    spinnerColor?: string;
  };
  
  // Configuration du jeu (hérite de WheelConfig/ScratchConfig/JackpotConfig)
  game: {
    title: string;
    titleHtml?: string;
    subtitle: string;
    subtitleHtml?: string;
    buttonText: string;
    backgroundImage?: string;
    backgroundColor?: string;
    additionalTexts?: { id: string; text: string; html?: string }[];
  };
  
  // Configuration de l'écran de résultat
  result: {
    winTitle: string;
    winTitleHtml?: string;
    winSubtitle: string;
    loseTitle: string;
    loseTitleHtml?: string;
    loseSubtitle: string;
    showQRCode: boolean;
    showPrizeImage: boolean;
    showWinnerNumber: boolean;
    qrCodeSize?: number;
    backgroundColor?: string;
  };
  
  // Configuration des lots (identique à Prize existant)
  prizes: GoogleReviewPrize[];
  
  // Configuration de la roue (si gameType === 'wheel')
  wheelConfig?: {
    segments: WheelSegment[];
    wheelSize?: number;
    spinDuration?: number;
    centerImage?: string;
    pointerImage?: string;
  };
  
  // Configuration du scratch (si gameType === 'scratch')
  scratchConfig?: {
    cards: ScratchCard[];
    scratchPercentage?: number;
    width?: number;
    height?: number;
    brushSize?: number;
    scratchColor?: string;
  };
  
  // Configuration du jackpot (si gameType === 'jackpot')
  jackpotConfig?: {
    symbols: JackpotSymbol[];
    reelCount?: number;
    spinDuration?: number;
    template?: string;
  };
}

export interface ScratchCard {
  id: string;
  name: string;
  scratchImage?: string;
  revealImage?: string;
  revealText?: string;
  probability: number;
  prizeId?: string;
  isWinning: boolean;
}

export interface GoogleReviewPrize {
  id: string;
  name: string;
  description?: string;
  image?: string;
  quantity: number;
  remaining: number;
  probability: number;
  qrCodes: QRCodeData[];
  status: 'active' | 'depleted';
}

export interface QRCodeData {
  id: string;
  code: string;      // Code unique (ex: "GR-2024-001")
  qrImage?: string;  // Image QR générée (base64 ou URL)
  isUsed: boolean;
  usedAt?: string;
  usedBy?: string;   // ID du participant
  prizeId: string;
  createdAt: string;
}

export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  textColor?: string;
  icon?: string;
  prizeId?: string;
  probability?: number;
}

export interface JackpotSymbol {
  id: string;
  image?: string;
  emoji?: string;
  name?: string;
  value?: number;
  prizeId?: string;
}

// État du parcours Google Review
export interface GoogleReviewState {
  currentStep: GoogleReviewStep;
  selectedRating: ReviewRating | null;
  negativeReviewText: string;
  negativeReviewStars: number;
  timerStartedAt: number | null;
  timerCompleted: boolean;
  gameUnlocked: boolean;
  hasPlayed: boolean;
  hasWon: boolean;
  wonPrize: GoogleReviewPrize | null;
  assignedQRCode: QRCodeData | null;
  participantId: string | null;
}

// Actions pour le reducer
export type GoogleReviewAction =
  | { type: 'START_FLOW' }
  | { type: 'CLOSE_INSTRUCTIONS' }
  | { type: 'SELECT_RATING'; rating: ReviewRating }
  | { type: 'OPEN_NEGATIVE_MODAL' }
  | { type: 'CLOSE_NEGATIVE_MODAL' }
  | { type: 'SUBMIT_NEGATIVE_REVIEW'; text: string; stars: number }
  | { type: 'START_TIMER' }
  | { type: 'COMPLETE_TIMER' }
  | { type: 'UNLOCK_GAME' }
  | { type: 'PLAY_GAME' }
  | { type: 'SET_RESULT'; hasWon: boolean; prize: GoogleReviewPrize | null; qrCode: QRCodeData | null }
  | { type: 'RESET' };

// Configuration par défaut
export const defaultGoogleReviewConfig: GoogleReviewConfig = {
  general: {
    businessName: 'Votre établissement',
    googleReviewUrl: '',
    timerDuration: 20,
    gameType: 'wheel',
  },
  layout: {
    header: {
      ...defaultHeaderConfig,
      enabled: true,
    },
    footer: {
      ...defaultFooterConfig,
      enabled: true,
    },
  },
  instructions: {
    title: 'Jouer',
    steps: [
      'Laissez-nous votre avis',
      'Retournez à la page du jeu',
      'Jouez pour gagner un cadeau',
    ],
    buttonText: 'Avis',
    backgroundColor: '#FFFFFF',
  },
  review: {
    title: 'Laissez votre avis',
    subtitle: 'Pouvez-vous nous accorder un instant ? Votre avis est précieux pour nous.\n\nPartagez votre expérience :',
    ratings: {
      horrible: {
        label: 'Horrible',
        color: '#EF4444',
        emoji: '😠',
      },
      moyen: {
        label: 'Moyen',
        color: '#EAB308',
        emoji: '😐',
      },
      excellent: {
        label: 'Excellent',
        color: '#22C55E',
        emoji: '😊',
      },
    },
  },
  negativeReview: {
    title: 'Partagez votre expérience',
    placeholder: 'Partagez votre expérience...',
    buttonText: 'Publier',
    minLength: 10,
    showStars: true,
    starsDefault: 3,
  },
  waiting: {
    title: 'En attente de validation',
    subtitle: 'Merci pour votre avis ! Veuillez patienter...',
    spinnerColor: '#F5B800',
  },
  game: {
    title: 'Tournez la roue !',
    subtitle: 'Tentez votre chance et découvrez votre lot',
    buttonText: 'Jouer',
  },
  result: {
    winTitle: 'Félicitations !',
    winSubtitle: 'Vous avez gagné {{prize}}',
    loseTitle: 'Dommage !',
    loseSubtitle: 'Vous n\'avez pas gagné cette fois-ci',
    showQRCode: true,
    showPrizeImage: true,
    showWinnerNumber: true,
    qrCodeSize: 200,
  },
  prizes: [],
  wheelConfig: {
    segments: [
      { id: 'seg-1', label: 'Lot 1', color: '#1F2937', textColor: '#FFFFFF', probability: 16.67 },
      { id: 'seg-2', label: 'Perdu', color: '#FFFFFF', textColor: '#1F2937', probability: 16.67 },
      { id: 'seg-3', label: 'Lot 2', color: '#1F2937', textColor: '#FFFFFF', probability: 16.67 },
      { id: 'seg-4', label: 'Perdu', color: '#FFFFFF', textColor: '#1F2937', probability: 16.67 },
      { id: 'seg-5', label: 'Lot 3', color: '#1F2937', textColor: '#FFFFFF', probability: 16.67 },
      { id: 'seg-6', label: 'Perdu', color: '#FFFFFF', textColor: '#1F2937', probability: 16.65 },
    ],
    wheelSize: 300,
    spinDuration: 5,
  },
  scratchConfig: {
    cards: [
      { id: 'card-1', name: 'Lot 1', revealText: '🎉 Gagné !', probability: 20, isWinning: true },
      { id: 'card-2', name: 'Perdu', revealText: '😢 Perdu', probability: 30, isWinning: false },
      { id: 'card-3', name: 'Lot 2', revealText: '🎁 Super !', probability: 20, isWinning: true },
      { id: 'card-4', name: 'Perdu', revealText: '😢 Perdu', probability: 30, isWinning: false },
    ],
    scratchPercentage: 70,
    width: 280,
    height: 180,
    brushSize: 30,
    scratchColor: '#C0C0C0',
  },
  jackpotConfig: {
    symbols: [
      { id: 'sym-1', emoji: '🍒' },
      { id: 'sym-2', emoji: '🍋' },
      { id: 'sym-3', emoji: '🍊' },
      { id: 'sym-4', emoji: '🍇' },
      { id: 'sym-5', emoji: '⭐' },
      { id: 'sym-6', emoji: '💎' },
    ],
    reelCount: 3,
    spinDuration: 2000,
    template: 'jackpot-11',
  },
};

// État initial - démarre sur 'game' (jeu bloqué), la modale s'affiche au clic sur "Jouer"
export const initialGoogleReviewState: GoogleReviewState = {
  currentStep: 'game',
  selectedRating: null,
  negativeReviewText: '',
  negativeReviewStars: 3,
  timerStartedAt: null,
  timerCompleted: false,
  gameUnlocked: false, // Le jeu est bloqué jusqu'à ce que l'utilisateur laisse un avis
  hasPlayed: false,
  hasWon: false,
  wonPrize: null,
  assignedQRCode: null,
  participantId: null,
};
