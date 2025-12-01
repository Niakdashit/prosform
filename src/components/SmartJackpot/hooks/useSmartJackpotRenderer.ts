import { useState, useEffect, useRef, useMemo } from 'react';

const TEMPLATE_MAP: Record<string, string> = {
  'jackpot-frame': 'jackpot-frame.svg',
  'jackpot-2': 'Jackpot 2.svg',
  'jackpot-3': 'Jackpot 3.svg',
  'jackpot-4': 'Jackpot 4.svg',
  'jackpot-5': 'Jackpot 5.svg',
  'jackpot-6': 'Jackpot 6.svg',
  'jackpot-8': 'Jackpot 8.svg',
  'jackpot-9': 'Jackpot 9.svg',
  'jackpot-10': 'Jackpot 10.svg',
  'jackpot-11': 'Jackpot 11.svg'
};

const getTemplateUrl = (templateId: string): string => {
  const fileName = TEMPLATE_MAP[templateId] || 'Jackpot 11.svg';
  return encodeURI(`/assets/slot-frames/${fileName}`);
};

interface UseSmartJackpotRendererProps {
  template: string;
  customTemplateUrl?: string;
  onAssetsReady?: () => void;
}

export const useSmartJackpotRenderer = ({
  template,
  customTemplateUrl,
  onAssetsReady
}: UseSmartJackpotRendererProps) => {
  const [assetsReady, setAssetsReady] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const assetsReadyNotifiedRef = useRef(false);

  const templateUrl = useMemo(() => {
    if (template === 'jackpot-custom' && customTemplateUrl) {
      return customTemplateUrl;
    }
    return getTemplateUrl(template);
  }, [template, customTemplateUrl]);

  const isModern = template === 'jackpot-6';

  useEffect(() => {
    assetsReadyNotifiedRef.current = false;
    setAssetsReady(false);
    setShouldRender(false);

    // Si template moderne (pas d'image à charger), on est prêt immédiatement
    if (isModern) {
      console.log('✅ [SmartJackpot] Template moderne, pas d\'image à charger');
      setAssetsReady(true);
      setShouldRender(true);
      assetsReadyNotifiedRef.current = true;
      onAssetsReady?.();
      return;
    }

    // Sinon, précharger l'image du template
    console.log('🔄 [SmartJackpot] Préchargement template:', templateUrl);
    const img = new Image();
    
    img.onload = () => {
      console.log('✅ [SmartJackpot] Template chargé, rendering immediately');
      setAssetsReady(true);
      setShouldRender(true);
      assetsReadyNotifiedRef.current = true;
      onAssetsReady?.();
    };

    img.onerror = (e) => {
      console.error('❌ [SmartJackpot] Erreur chargement template:', e);
      // Même en cas d'erreur, on affiche le composant
      setAssetsReady(true);
      setShouldRender(true);
      assetsReadyNotifiedRef.current = true;
      onAssetsReady?.();
    };

    img.src = templateUrl;
  }, [templateUrl, isModern, onAssetsReady]);

  return {
    assetsReady,
    shouldRender,
    templateUrl
  };
};
