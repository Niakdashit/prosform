import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { GoogleReviewConfig } from './types';

interface NegativeReviewModalProps {
  config: GoogleReviewConfig;
  isOpen: boolean;
  initialStars?: number;
  onClose: () => void;
  onSubmit: (text: string, stars: number) => void;
  onUpgradeRating: () => void; // Appelé si l'utilisateur sélectionne 4 ou 5 étoiles
}

export function NegativeReviewModal({
  config,
  isOpen,
  initialStars = 3,
  onClose,
  onSubmit,
  onUpgradeRating,
}: NegativeReviewModalProps) {
  const [stars, setStars] = useState(initialStars);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');

  if (!isOpen) return null;

  const { negativeReview, general } = config;
  const displayStars = hoveredStar ?? stars;
  const isValid = reviewText.trim().length >= (negativeReview.minLength || 10);

  const handleStarClick = (starValue: number) => {
    setStars(starValue);
    // Si 4 ou 5 étoiles, rediriger vers Google
    if (starValue >= 4) {
      onUpgradeRating();
    }
  };

  const handleSubmit = () => {
    if (isValid) {
      onSubmit(reviewText.trim(), stars);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl mx-4">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Nom de l'établissement */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
          {general.businessName}
        </h2>

        {/* Étoiles de notation */}
        {negativeReview.showStars && (
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                onClick={() => handleStarClick(starValue)}
                onMouseEnter={() => setHoveredStar(starValue)}
                onMouseLeave={() => setHoveredStar(null)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 transition-colors ${
                    starValue <= displayStars
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Zone de texte */}
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder={negativeReview.placeholder}
          className="min-h-[120px] mb-2 resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />

        {/* Compteur de caractères */}
        <p className="text-xs text-gray-400 mb-4 text-right">
          {reviewText.length} / {negativeReview.minLength || 10} caractères minimum
        </p>

        {/* Bouton publier */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full h-12 text-base font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isValid ? '#3B82F6' : '#D1D5DB',
            color: '#FFFFFF',
          }}
        >
          {negativeReview.buttonText}
        </Button>

        {/* Note explicative */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          Votre avis nous sera envoyé directement et ne sera pas publié sur Google.
        </p>
      </div>
    </div>
  );
}
