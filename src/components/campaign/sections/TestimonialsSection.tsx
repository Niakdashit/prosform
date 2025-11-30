import { Star, Quote } from "lucide-react";

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  content: string;
  rating?: number; // 1-5
}

export interface TestimonialsSectionConfig {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  layout: 'grid' | 'carousel' | 'single' | 'masonry';
  testimonials: Testimonial[];
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  showRating?: boolean;
  showQuoteIcon?: boolean;
  cardStyle?: 'minimal' | 'bordered' | 'elevated' | 'filled';
}

export const defaultTestimonialsConfig: TestimonialsSectionConfig = {
  enabled: false,
  title: 'Ce qu\'ils en disent',
  layout: 'grid',
  testimonials: [
    { 
      id: 't1', 
      name: 'Marie D.', 
      content: 'J\'ai gagné une super réduction ! Trop contente !', 
      rating: 5 
    },
    { 
      id: 't2', 
      name: 'Thomas L.', 
      role: 'Client fidèle',
      content: 'Simple, rapide et amusant. Je recommande !', 
      rating: 5 
    },
    { 
      id: 't3', 
      name: 'Sophie M.', 
      content: 'Une expérience ludique et des cadeaux au top.', 
      rating: 4 
    },
  ],
  showRating: true,
  showQuoteIcon: true,
  cardStyle: 'elevated',
};

interface TestimonialsSectionProps {
  config: TestimonialsSectionConfig;
  isPreview?: boolean;
}

export const TestimonialsSection = ({ config, isPreview }: TestimonialsSectionProps) => {
  if (!config.enabled || config.testimonials.length === 0) return null;

  const getCardStyle = () => {
    switch (config.cardStyle) {
      case 'minimal':
        return {};
      case 'bordered':
        return { border: `1px solid ${config.textColor}20` };
      case 'elevated':
        return { 
          backgroundColor: config.backgroundColor === '#ffffff' ? '#f9fafb' : config.textColor + '08',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        };
      case 'filled':
        return { backgroundColor: config.accentColor + '10' };
      default:
        return {};
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star}
          className="w-4 h-4"
          style={{ 
            color: star <= rating ? config.accentColor : config.textColor + '30',
            fill: star <= rating ? config.accentColor : 'transparent',
          }}
        />
      ))}
    </div>
  );

  const renderTestimonial = (testimonial: Testimonial) => (
    <div 
      key={testimonial.id}
      className="p-6 rounded-xl relative"
      style={getCardStyle()}
    >
      {/* Quote icon */}
      {config.showQuoteIcon && (
        <Quote 
          className="w-8 h-8 absolute top-4 right-4 opacity-20"
          style={{ color: config.accentColor }}
        />
      )}

      {/* Rating */}
      {config.showRating && testimonial.rating && (
        <div className="mb-3">
          {renderStars(testimonial.rating)}
        </div>
      )}

      {/* Content */}
      <p 
        className="text-base leading-relaxed"
        style={{ color: config.textColor }}
      >
        "{testimonial.content}"
      </p>

      {/* Author */}
      <div className="mt-4 flex items-center gap-3">
        {testimonial.avatar ? (
          <img 
            src={testimonial.avatar} 
            alt={testimonial.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
            style={{ 
              backgroundColor: config.accentColor + '20',
              color: config.accentColor,
            }}
          >
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div>
          <p 
            className="font-semibold text-sm"
            style={{ color: config.textColor }}
          >
            {testimonial.name}
          </p>
          {testimonial.role && (
            <p 
              className="text-xs"
              style={{ color: config.textColor + '80' }}
            >
              {testimonial.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const gridClass = {
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    carousel: 'flex gap-6 overflow-x-auto pb-4 snap-x',
    single: 'max-w-2xl mx-auto',
    masonry: 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6',
  }[config.layout];

  return (
    <section 
      className="w-full px-4 py-12"
      style={{ backgroundColor: config.backgroundColor }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Titre */}
        {config.title && (
          <div className="text-center mb-8">
            <h2 
              className="text-2xl md:text-3xl font-bold"
              style={{ color: config.textColor }}
            >
              {config.title}
            </h2>
            {config.subtitle && (
              <p 
                className="mt-2 text-lg"
                style={{ color: config.textColor + 'aa' }}
              >
                {config.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Testimonials */}
        <div className={gridClass}>
          {config.testimonials.map(testimonial => (
            <div 
              key={testimonial.id}
              className={config.layout === 'carousel' ? 'min-w-[300px] snap-center' : ''}
            >
              {renderTestimonial(testimonial)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
