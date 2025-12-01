import { useState, useEffect, useRef } from 'react';

interface UseSmartScratchRendererProps {
  revealImage?: string;
  onAssetsReady?: () => void;
}

export const useSmartScratchRenderer = ({
  revealImage,
  onAssetsReady
}: UseSmartScratchRendererProps) => {
  const [assetsReady, setAssetsReady] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const assetsReadyNotifiedRef = useRef(false);

  useEffect(() => {
    assetsReadyNotifiedRef.current = false;
    setAssetsReady(false);
    setShouldRender(false);

    // Si pas d'image de révélation, on est prêt immédiatement
    if (!revealImage) {
      console.log('✅ [SmartScratch] Pas d\'image de révélation, prêt immédiatement');
      setAssetsReady(true);
      setShouldRender(true);
      assetsReadyNotifiedRef.current = true;
      onAssetsReady?.();
      return;
    }

    // Sinon, précharger l'image de révélation
    console.log('🔄 [SmartScratch] Préchargement image révélation:', revealImage);
    const img = new Image();
    
    img.onload = () => {
      console.log('✅ [SmartScratch] Image révélation chargée, rendering immediately');
      setAssetsReady(true);
      setShouldRender(true);
      assetsReadyNotifiedRef.current = true;
      onAssetsReady?.();
    };

    img.onerror = (e) => {
      console.error('❌ [SmartScratch] Erreur chargement image révélation:', e);
      // Même en cas d'erreur, on affiche le composant
      setAssetsReady(true);
      setShouldRender(true);
      assetsReadyNotifiedRef.current = true;
      onAssetsReady?.();
    };

    img.src = revealImage;
  }, [revealImage, onAssetsReady]);

  return {
    assetsReady,
    shouldRender
  };
};
