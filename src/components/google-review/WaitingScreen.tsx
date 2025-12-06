import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { GoogleReviewConfig } from './types';

interface WaitingScreenProps {
  config: GoogleReviewConfig;
  remainingSeconds: number;
  onComplete: () => void;
}

export function WaitingScreen({
  config,
  remainingSeconds,
  onComplete,
}: WaitingScreenProps) {
  const { waiting, general } = config;
  const [displaySeconds, setDisplaySeconds] = useState(remainingSeconds);

  // Mise à jour du compteur chaque seconde
  useEffect(() => {
    setDisplaySeconds(remainingSeconds);
    
    if (remainingSeconds <= 0) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setDisplaySeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, onComplete]);

  // Calcul du pourcentage pour le cercle de progression
  const totalDuration = config.general.timerDuration;
  const progress = ((totalDuration - displaySeconds) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 45; // rayon = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: waiting.spinnerColor ? `${waiting.spinnerColor}10` : '#FEF9E7' }}
    >
      {/* Logo de l'établissement */}
      {general.businessLogo && (
        <div className="mb-8">
          <img 
            src={general.businessLogo} 
            alt={general.businessName}
            className="h-16 object-contain opacity-50"
          />
        </div>
      )}

      {/* Cercle de progression avec timer */}
      <div className="relative w-32 h-32 mb-8">
        {/* Cercle de fond */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          {/* Cercle de progression */}
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke={waiting.spinnerColor || '#F5B800'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        
        {/* Compteur au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-3xl font-bold"
            style={{ color: waiting.spinnerColor || '#F5B800' }}
          >
            {displaySeconds}s
          </span>
        </div>
      </div>

      {/* Spinner animé */}
      <Loader2 
        className="w-8 h-8 animate-spin mb-6"
        style={{ color: waiting.spinnerColor || '#F5B800' }}
      />

      {/* Titre */}
      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
        {waiting.title}
      </h2>

      {/* Sous-titre */}
      <p className="text-gray-600 text-center max-w-sm">
        {waiting.subtitle}
      </p>

      {/* Message d'information */}
      <div className="mt-8 p-4 bg-white/80 rounded-lg border border-gray-200 max-w-sm">
        <p className="text-sm text-gray-500 text-center">
          ⏳ Le jeu sera débloqué automatiquement dans quelques instants...
        </p>
      </div>
    </div>
  );
}
