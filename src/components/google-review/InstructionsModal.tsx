import { X, ArrowLeft } from 'lucide-react';
import { useTheme, getButtonStyles } from '@/contexts/ThemeContext';
import type { GoogleReviewConfig } from './types';

interface InstructionsModalProps {
  config: GoogleReviewConfig;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function InstructionsModal({
  config,
  isOpen,
  onClose,
  onContinue,
}: InstructionsModalProps) {
  const { theme } = useTheme();
  
  // Obtenir les styles de bouton comme SmartWheel
  const buttonStyles = getButtonStyles(theme, 'desktop');
  
  if (!isOpen) return null;

  const { instructions, general } = config;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div 
        className="relative w-full max-w-sm bg-white p-6 shadow-2xl mx-4"
        style={{ 
          backgroundColor: instructions.backgroundColor,
          borderRadius: buttonStyles.borderRadius
        }}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Titre */}
        <div className="flex items-center gap-4 mb-6">
          <h2 
            className="text-2xl font-bold text-gray-900"
            dangerouslySetInnerHTML={
              instructions.titleHtml 
                ? { __html: instructions.titleHtml }
                : undefined
            }
          >
            {!instructions.titleHtml ? instructions.title : null}
          </h2>
          
          {/* Drapeau français (optionnel) */}
          <div className="flex gap-0.5">
            <div className="w-3 h-5 bg-blue-600 rounded-l" />
            <div className="w-3 h-5 bg-white border-y border-gray-200" />
            <div className="w-3 h-5 bg-red-500 rounded-r" />
          </div>
        </div>

        {/* Liste des étapes */}
        <ol className="space-y-3 mb-8">
          {instructions.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <span className="font-medium text-gray-500">{index + 1}.</span>
              <span className="flex items-center gap-2">
                {step}
                {/* Flèche pour "Retournez à la page du jeu" */}
                {step.toLowerCase().includes('retour') && (
                  <ArrowLeft className="h-4 w-4 text-blue-500" />
                )}
              </span>
            </li>
          ))}
        </ol>

        {/* Bouton principal avec logo Google - même style que SmartWheel */}
        <button
          onClick={onContinue}
          className="w-full font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
          style={{
            ...buttonStyles,
            backgroundColor: theme.buttonColor || '#F5B800',
            color: theme.buttonTextColor || '#1F2937',
            boxShadow: `0 4px 14px ${(theme.buttonColor || '#F5B800')}40`
          }}
        >
          <img 
            src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
            alt="Google" 
            className="w-5 h-5"
          />
          {instructions.buttonText}
        </button>

        {/* Logo de l'établissement (optionnel) */}
        {general.businessLogo && (
          <div className="mt-6 flex justify-center">
            <img 
              src={general.businessLogo} 
              alt={general.businessName}
              className="h-12 object-contain opacity-50"
            />
          </div>
        )}
      </div>
    </div>
  );
}
