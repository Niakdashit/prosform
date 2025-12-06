import { useState } from 'react';
import { Star } from 'lucide-react';
import { useTheme, getFontFamily } from '@/contexts/ThemeContext';
import { EditableTextBlock } from '@/components/EditableTextBlock';
import type { GoogleReviewConfig, ReviewRating } from './types';

interface ReviewViewProps {
  config: GoogleReviewConfig;
  onSelectRating: (rating: ReviewRating) => void;
  onUpdateConfig?: (updates: Partial<GoogleReviewConfig>) => void;
}

// Composant Étoiles avec animation
function StarsRating({
  onSelectRating,
  starColor = '#F5B800',
}: {
  onSelectRating: (rating: ReviewRating) => void;
  starColor?: string;
}) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedStars, setSelectedStars] = useState<number | null>(null);

  const handleStarClick = (starIndex: number) => {
    setSelectedStars(starIndex);
    // Mapper les étoiles aux ratings
    if (starIndex <= 2) {
      onSelectRating('horrible');
    } else if (starIndex <= 3) {
      onSelectRating('moyen');
    } else {
      onSelectRating('excellent');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className="w-10 h-10 md:w-12 md:h-12"
              fill={(hoveredStar !== null ? star <= hoveredStar : star <= (selectedStars || 0)) ? starColor : 'transparent'}
              stroke={starColor}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <p className="text-sm opacity-70" style={{ color: starColor }}>
        {selectedStars ? `${selectedStars} étoile${selectedStars > 1 ? 's' : ''}` : 'Cliquez pour noter'}
      </p>
    </div>
  );
}

// Composant Smiley avec animation
function RatingSmiley({
  rating,
  label,
  color,
  emoji,
  onClick,
}: {
  rating: ReviewRating;
  label: string;
  color: string;
  emoji: string;
  onClick: () => void;
}) {
  // SVG paths pour les différents smileys
  const getSmileyPath = () => {
    switch (rating) {
      case 'horrible':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={color} 
              strokeWidth="4"
            />
            {/* Yeux */}
            <circle cx="35" cy="40" r="5" fill={color} />
            <circle cx="65" cy="40" r="5" fill={color} />
            {/* Bouche triste */}
            <path 
              d="M 30 70 Q 50 55 70 70" 
              fill="none" 
              stroke={color} 
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'moyen':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={color} 
              strokeWidth="4"
            />
            {/* Yeux */}
            <circle cx="35" cy="40" r="5" fill={color} />
            <circle cx="65" cy="40" r="5" fill={color} />
            {/* Bouche neutre */}
            <line 
              x1="30" y1="65" x2="70" y2="65" 
              stroke={color} 
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'excellent':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={color} 
              strokeWidth="4"
            />
            {/* Yeux */}
            <circle cx="35" cy="40" r="5" fill={color} />
            <circle cx="65" cy="40" r="5" fill={color} />
            {/* Bouche souriante */}
            <path 
              d="M 30 60 Q 50 80 70 60" 
              fill="none" 
              stroke={color} 
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 transition-transform hover:scale-110 active:scale-95"
    >
      <div 
        className="w-20 h-20 md:w-24 md:h-24"
        style={{ color }}
      >
        {getSmileyPath()}
      </div>
      <span 
        className="text-sm font-medium"
        style={{ color }}
      >
        {label}
      </span>
    </button>
  );
}

export function ReviewView({ config, onSelectRating, onUpdateConfig }: ReviewViewProps) {
  const { review, general } = config;
  const { theme } = useTheme();
  const [editingField, setEditingField] = useState<string | null>(null);

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center px-6 py-6 relative"
      style={{
        backgroundColor: theme.backgroundColor || review.backgroundColor || '#FFFFFF',
        backgroundImage: review.backgroundImage ? `url(${review.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Drapeau français */}
      <div className="absolute top-4 right-4 flex gap-0.5">
        <div className="w-3 h-5 bg-blue-600 rounded-l" />
        <div className="w-3 h-5 bg-white border-y border-gray-200" />
        <div className="w-3 h-5 bg-red-500 rounded-r" />
      </div>

      {/* Logo de l'établissement */}
      {general.businessLogo && (
        <div className="mb-4">
          <img 
            src={general.businessLogo} 
            alt={general.businessName}
            className="h-16 object-contain"
          />
        </div>
      )}

      {/* Titre - éditable in-line */}
      <EditableTextBlock
        value={review.titleHtml || review.title}
        onChange={(value, html) => onUpdateConfig?.({ review: { ...review, title: value, titleHtml: html } })}
        placeholder="Titre de la vue avis"
        className="text-xl md:text-2xl font-bold text-center"
        style={{ 
          color: review.titleHtml ? undefined : (theme.textColor || '#1F2937'),
          fontFamily: getFontFamily(theme.headingFontFamily),
        }}
        isEditing={editingField === 'review-title'}
        onFocus={() => setEditingField('review-title')}
        onBlur={() => setEditingField(null)}
        fieldType="title"
        marginBottom="12px"
      />

      {/* Sous-titre - éditable in-line */}
      <EditableTextBlock
        value={review.subtitleHtml || review.subtitle}
        onChange={(value, html) => onUpdateConfig?.({ review: { ...review, subtitle: value, subtitleHtml: html } })}
        placeholder="Sous-titre de la vue avis"
        className="text-sm text-center max-w-xs whitespace-pre-line"
        style={{ 
          color: review.subtitleHtml ? undefined : (theme.textColor || '#6B7280'),
          fontFamily: getFontFamily(theme.fontFamily),
          opacity: 0.8,
        }}
        isEditing={editingField === 'review-subtitle'}
        onFocus={() => setEditingField('review-subtitle')}
        onBlur={() => setEditingField(null)}
        fieldType="subtitle"
        marginBottom="24px"
      />

      {/* Notation - Étoiles ou Smileys selon la config */}
      {review.ratingType === 'stars' ? (
        <StarsRating
          onSelectRating={onSelectRating}
          starColor={theme.buttonColor || '#F5B800'}
        />
      ) : (
        <div className="flex items-center justify-center gap-6">
          <RatingSmiley
            rating="horrible"
            label={review.ratings.horrible.label}
            color={review.ratings.horrible.color}
            emoji={review.ratings.horrible.emoji}
            onClick={() => onSelectRating('horrible')}
          />
          
          <RatingSmiley
            rating="moyen"
            label={review.ratings.moyen.label}
            color={review.ratings.moyen.color}
            emoji={review.ratings.moyen.emoji}
            onClick={() => onSelectRating('moyen')}
          />
          
          <RatingSmiley
            rating="excellent"
            label={review.ratings.excellent.label}
            color={review.ratings.excellent.color}
            emoji={review.ratings.excellent.emoji}
            onClick={() => onSelectRating('excellent')}
          />
        </div>
      )}
    </div>
  );
}
