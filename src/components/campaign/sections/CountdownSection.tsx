import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

export interface CountdownSectionConfig {
  enabled: boolean;
  endDate?: string; // ISO date string
  title?: string;
  subtitle?: string;
  layout: 'inline' | 'banner' | 'floating' | 'minimal';
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  showIcon?: boolean;
  urgencyLevel?: 'low' | 'medium' | 'high';
  expiredMessage?: string;
  position?: 'top' | 'bottom'; // Pour le layout floating
}

export const defaultCountdownConfig: CountdownSectionConfig = {
  enabled: false,
  title: 'Offre limitée !',
  subtitle: 'Ne manquez pas cette opportunité',
  layout: 'banner',
  showIcon: true,
  urgencyLevel: 'medium',
  expiredMessage: 'Cette offre a expiré',
  position: 'top',
};

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

const calculateTimeLeft = (endDate: string): TimeLeft => {
  const difference = new Date(endDate).getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  };
};

interface CountdownSectionProps {
  config: CountdownSectionConfig;
  isPreview?: boolean;
}

export const CountdownSection = ({ config, isPreview }: CountdownSectionProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => 
    config.endDate ? calculateTimeLeft(config.endDate) : { days: 2, hours: 12, minutes: 30, seconds: 45, expired: false }
  );

  useEffect(() => {
    if (!config.endDate || isPreview) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(config.endDate!));
    }, 1000);

    return () => clearInterval(timer);
  }, [config.endDate, isPreview]);

  if (!config.enabled) return null;

  const urgencyColors = {
    low: { bg: config.backgroundColor || '#f0fdf4', text: config.textColor || '#166534' },
    medium: { bg: config.backgroundColor || '#fef3c7', text: config.textColor || '#92400e' },
    high: { bg: config.backgroundColor || '#fef2f2', text: config.textColor || '#dc2626' },
  }[config.urgencyLevel || 'medium'];

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div 
        className="text-2xl md:text-3xl font-bold tabular-nums min-w-[3rem] text-center"
        style={{ color: config.accentColor || urgencyColors.text }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <div 
        className="text-xs uppercase tracking-wide"
        style={{ color: urgencyColors.text + 'aa' }}
      >
        {label}
      </div>
    </div>
  );

  const Separator = () => (
    <span 
      className="text-2xl font-bold mx-1"
      style={{ color: config.accentColor || urgencyColors.text }}
    >
      :
    </span>
  );

  if (timeLeft.expired) {
    return (
      <div 
        className="w-full py-3 px-4 text-center"
        style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
      >
        <p className="font-medium">{config.expiredMessage}</p>
      </div>
    );
  }

  // Layout minimal
  if (config.layout === 'minimal') {
    return (
      <div className="flex items-center justify-center gap-2 py-2">
        {config.showIcon && <Clock className="w-4 h-4" style={{ color: config.accentColor }} />}
        <span className="text-sm font-medium" style={{ color: config.textColor }}>
          {timeLeft.days > 0 && `${timeLeft.days}j `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  // Layout inline
  if (config.layout === 'inline') {
    return (
      <div className="flex items-center justify-center gap-4 py-4">
        {config.showIcon && (
          <div 
            className="p-2 rounded-full"
            style={{ backgroundColor: config.accentColor + '20' }}
          >
            {config.urgencyLevel === 'high' ? (
              <AlertTriangle className="w-5 h-5" style={{ color: config.accentColor }} />
            ) : (
              <Clock className="w-5 h-5" style={{ color: config.accentColor }} />
            )}
          </div>
        )}
        <div>
          {config.title && (
            <p className="font-semibold" style={{ color: config.textColor }}>
              {config.title}
            </p>
          )}
        </div>
        <div className="flex items-center">
          <TimeBlock value={timeLeft.days} label="Jours" />
          <Separator />
          <TimeBlock value={timeLeft.hours} label="Heures" />
          <Separator />
          <TimeBlock value={timeLeft.minutes} label="Min" />
          <Separator />
          <TimeBlock value={timeLeft.seconds} label="Sec" />
        </div>
      </div>
    );
  }

  // Layout banner (défaut)
  return (
    <div 
      className="w-full py-4 px-4"
      style={{ backgroundColor: urgencyColors.bg }}
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
        {/* Icône et texte */}
        <div className="flex items-center gap-3">
          {config.showIcon && (
            config.urgencyLevel === 'high' ? (
              <AlertTriangle className="w-6 h-6 animate-pulse" style={{ color: urgencyColors.text }} />
            ) : (
              <Clock className="w-6 h-6" style={{ color: urgencyColors.text }} />
            )
          )}
          <div className="text-center md:text-left">
            {config.title && (
              <p className="font-bold text-lg" style={{ color: urgencyColors.text }}>
                {config.title}
              </p>
            )}
            {config.subtitle && (
              <p className="text-sm" style={{ color: urgencyColors.text + 'cc' }}>
                {config.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-1 md:gap-2">
          <TimeBlock value={timeLeft.days} label="Jours" />
          <Separator />
          <TimeBlock value={timeLeft.hours} label="Heures" />
          <Separator />
          <TimeBlock value={timeLeft.minutes} label="Min" />
          <Separator />
          <TimeBlock value={timeLeft.seconds} label="Sec" />
        </div>
      </div>
    </div>
  );
};
