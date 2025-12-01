import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSmartJackpotRenderer } from './hooks/useSmartJackpotRenderer';
import './SmartJackpot.css';

interface SpinResult {
  forceWin: boolean;
  forceSymbol?: string; // Symbole à utiliser pour le gain (si forceWin = true)
}

interface SmartJackpotProps {
  symbols?: string[];
  template?: string;
  customTemplateUrl?: string;
  modernFrameColor?: string;
  modernInnerColor?: string;
  onWin?: (result: string[]) => void;
  onLose?: () => void;
  onBeforeSpin?: () => SpinResult | null; // Callback pour déterminer le résultat avant le spin
  onAssetsReady?: () => void;
  disabled?: boolean;
  spinDuration?: number;
}

const DEFAULT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'];

const SLOT_HEIGHT = 80; // must match .reel height in CSS
const STRIP_LENGTH = 12; // number of symbols in a spinning strip per reel

const SmartJackpot: React.FC<SmartJackpotProps> = ({
  symbols = DEFAULT_SYMBOLS,
  template = 'jackpot-11',
  customTemplateUrl,
  modernFrameColor = '#F59E0B',
  modernInnerColor = '#312E38',
  onWin,
  onLose,
  onBeforeSpin,
  onAssetsReady,
  disabled = false,
  spinDuration = 2000
}) => {
  const { shouldRender, templateUrl } = useSmartJackpotRenderer({
    template,
    customTemplateUrl,
    onAssetsReady
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[]>([symbols[0], symbols[1], symbols[2]]);
  const [strips, setStrips] = useState<string[][]>([
    [symbols[0]],
    [symbols[1] || symbols[0]],
    [symbols[2] || symbols[0]],
  ]);
  const [hasSpun, setHasSpun] = useState(false);
  const [spinId, setSpinId] = useState(0);
  const spinTimeoutRef = useRef<number | null>(null);
  const finalReelsRef = useRef<string[]>([]);
  const wasForceWinRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const instanceIdRef = useRef<string>(Math.random().toString(36).substring(7));
  
  // Cleanup on unmount
  React.useEffect(() => {
    isMountedRef.current = true;
    console.log('🎰 [SmartJackpot] Instance créée:', instanceIdRef.current);
    return () => {
      console.log('🎰 [SmartJackpot] Instance démontée:', instanceIdRef.current);
      isMountedRef.current = false;
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);


  const getRandomSymbol = useCallback(() => {
    return symbols[Math.floor(Math.random() * symbols.length)];
  }, [symbols]);

  const spin = useCallback(() => {
    if (isSpinning || disabled || hasSpun) return;

    setIsSpinning(true);
    setHasSpun(true);

    // S'assurer que spinDuration est valide (minimum 1000ms)
    const actualSpinDuration = Math.max(spinDuration || 2000, 1000);
    console.log('🎰 [SmartJackpot] Instance', instanceIdRef.current, '- Début du spin, spinDuration:', spinDuration, '→ actualSpinDuration:', actualSpinDuration, 'ms');
    
    // Appeler onBeforeSpin pour obtenir le résultat forcé
    const spinResult = onBeforeSpin?.();
    
    let finalReels: string[];
    let forceWin = false;
    
    if (spinResult) {
      forceWin = spinResult.forceWin;
      if (spinResult.forceWin) {
        // Forcer un gain : 3 symboles identiques
        const winSymbol = spinResult.forceSymbol || symbols[0];
        finalReels = [winSymbol, winSymbol, winSymbol];
        console.log('🎰 [SmartJackpot] Résultat forcé GAGNANT:', winSymbol);
      } else {
        // Forcer une perte : 3 symboles différents
        const shuffled = [...symbols].sort(() => Math.random() - 0.5);
        // S'assurer que les 3 symboles sont différents
        finalReels = [shuffled[0], shuffled[1] || shuffled[0], shuffled[2] || shuffled[0]];
        // Si par hasard ils sont identiques, changer le dernier
        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
          const otherSymbol = symbols.find(s => s !== finalReels[0]) || symbols[0];
          finalReels[2] = otherSymbol;
        }
        console.log('🎰 [SmartJackpot] Résultat forcé PERDANT:', finalReels);
      }
    } else {
      // Comportement par défaut : aléatoire
      finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      console.log('🎰 [SmartJackpot] Résultat aléatoire:', finalReels);
    }
    
    // Stocker dans les refs pour éviter les problèmes de closure
    finalReelsRef.current = finalReels;
    wasForceWinRef.current = forceWin;
    
    setReels(finalReels);

    // Construire des bandes verticales de symboles pour chaque rouleau
    const newStrips: string[][] = finalReels.map((finalSymbol) => {
      const strip: string[] = [];
      for (let i = 0; i < STRIP_LENGTH - 1; i++) {
        strip.push(getRandomSymbol());
      }
      strip.push(finalSymbol);
      return strip;
    });

    setStrips(newStrips);

    // Invalider les bandes précédentes pour relancer l'animation
    setSpinId((id) => id + 1);

    // Arrêt du spin après la durée totale
    spinTimeoutRef.current = window.setTimeout(() => {
      // Vérifier que le composant est toujours monté
      if (!isMountedRef.current) {
        console.log('🎰 [SmartJackpot] Composant démonté, annulation du callback');
        return;
      }
      
      setIsSpinning(false);

      // Utiliser les refs pour avoir les valeurs correctes
      const reelsResult = finalReelsRef.current;
      const wasForced = wasForceWinRef.current;
      
      // Vérifier si c'est un gain (3 symboles identiques OU forceWin était true)
      const isWin = wasForced || (reelsResult[0] === reelsResult[1] && reelsResult[1] === reelsResult[2]);
      console.log('🎰 [SmartJackpot] Instance', instanceIdRef.current, '- Fin du spin. Reels:', reelsResult, 'wasForced:', wasForced, 'isWin:', isWin);
      
      if (isWin) {
        console.log('🎰 [SmartJackpot] → Appel de onWin');
        onWin?.(reelsResult);
      } else {
        console.log('🎰 [SmartJackpot] → Appel de onLose');
        onLose?.();
      }
    }, actualSpinDuration);
  }, [isSpinning, disabled, hasSpun, getRandomSymbol, spinDuration, onWin, onLose, onBeforeSpin, symbols]);

  const templateClass = `template-${template}`;
  const isModern = template === 'jackpot-6';

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={`smart-jackpot-container ${templateClass}`}>
      {/* Frame du template */}
      <div 
        className={`jackpot-frame ${isModern ? 'jackpot-frame-modern' : ''}`}
        style={isModern ? { backgroundColor: modernFrameColor } : { backgroundImage: `url("${templateUrl}")` }}
      >
        {/* Zone des rouleaux */}
        <div className={isModern ? 'modern-inner' : undefined} style={isModern ? { backgroundColor: modernInnerColor } : undefined}>
        <div className="reels-container">
          {strips.map((strip, reelIndex) => (
            <div key={`${reelIndex}-${spinId}`} className="reel">
              <motion.div
                className="reel-strip"
                initial={{ y: 0 }}
                animate={{
                  y: -SLOT_HEIGHT * (strip.length - 1),
                }}
                transition={{
                  duration: spinDuration / 1000,
                  ease: "easeInOut",
                  delay: reelIndex * 0.15,
                }}
              >
                {strip.map((symbol, index) => {
                  const isImage = symbol?.startsWith('data:image');

                  return (
                    <div key={index} className="symbol-wrapper">
                      {isImage ? (
                        <img
                          src={symbol}
                          alt={`Symbol ${index + 1}`}
                          className="symbol symbol-image"
                        />
                      ) : (
                        <span className="symbol">{symbol}</span>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Bouton Spin */}
      <button
        onClick={spin}
        disabled={isSpinning || disabled || hasSpun}
        className="spin-button"
      >
        {isSpinning ? 'Spinning...' : hasSpun ? 'Terminé' : 'SPIN'}
      </button>
    </div>
  );
};

export default SmartJackpot;
