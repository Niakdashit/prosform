// Hook pour synchroniser les segments de la roue
// Simple pass-through pour le moment, peut être étendu plus tard avec un store global si nécessaire

interface WheelSyncConfig {
  showBulbs?: boolean;
  size?: number;
  brandColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
}

interface UseWheelSyncParams {
  campaignId?: string;
  segments: any[];
  config?: WheelSyncConfig;
}

export const useWheelSync = ({ segments }: UseWheelSyncParams) => {
  // Pour le moment, on retourne simplement les segments tels quels
  // Cette fonction peut être étendue plus tard pour implémenter
  // une synchronisation avec un store global (Zustand, Redux, etc.)
  
  return {
    segments,
  };
};
