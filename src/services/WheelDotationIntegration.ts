// Stub pour le système de dotation - à implémenter selon vos besoins
export const wheelDotationIntegration = {
  determineWheelSpin: async (params: {
    campaignId: string;
    participantEmail: string;
    participantId?: string;
    userAgent: string;
  }) => {
    console.log('🎯 [WheelDotationIntegration] determineWheelSpin called (stub)', params);
    
    // Retourner un résultat aléatoire par défaut
    return {
      segmentId: null, // null = mode aléatoire
      prizeId: null,
    };
  },
};
