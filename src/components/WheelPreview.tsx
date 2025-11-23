import { motion, AnimatePresence } from "framer-motion";
import { WheelConfig } from "./WheelBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Smartphone } from "lucide-react";
import { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface WheelPreviewProps {
  config: WheelConfig;
  activeView: 'welcome' | 'contact' | 'wheel' | 'ending';
  onUpdateConfig: (updates: Partial<WheelConfig>) => void;
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: () => void;
  isMobileResponsive?: boolean;
  onNext: () => void;
}

export const WheelPreview = ({ 
  config, 
  activeView, 
  onUpdateConfig, 
  viewMode, 
  onToggleViewMode, 
  isMobileResponsive = false,
  onNext 
}: WheelPreviewProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [contactData, setContactData] = useState({ name: '', email: '', phone: '' });
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const { theme } = useTheme();

  const handleSpin = () => {
    setIsSpinning(true);
    
    // Calculer le gagnant basé sur les probabilités
    const random = Math.random() * 100;
    let cumulative = 0;
    let winner = config.segments[0];
    
    for (const segment of config.segments) {
      cumulative += segment.probability || 0;
      if (random <= cumulative) {
        winner = segment;
        break;
      }
    }
    
    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(winner.label);
      onNext();
    }, 3000);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'welcome':
        return (
          <div className="flex w-full h-full items-center justify-center p-8">
            <div className="text-center max-w-md">
              {editingField === 'welcome-title' ? (
                <input
                  autoFocus
                  className="text-4xl font-bold mb-4 w-full bg-transparent border-b-2 border-primary outline-none text-center"
                  style={{ color: theme.textColor }}
                  value={config.welcomeScreen.title}
                  onChange={(e) => onUpdateConfig({ 
                    welcomeScreen: { ...config.welcomeScreen, title: e.target.value } 
                  })}
                  onBlur={() => setEditingField(null)}
                />
              ) : (
                <h1 
                  className="text-4xl font-bold mb-4 cursor-pointer hover:opacity-80"
                  style={{ color: theme.textColor }}
                  onClick={() => setEditingField('welcome-title')}
                >
                  {config.welcomeScreen.title}
                </h1>
              )}
              
              {editingField === 'welcome-subtitle' ? (
                <input
                  autoFocus
                  className="text-lg mb-8 w-full bg-transparent border-b border-primary outline-none text-center"
                  style={{ color: theme.textColor }}
                  value={config.welcomeScreen.subtitle}
                  onChange={(e) => onUpdateConfig({ 
                    welcomeScreen: { ...config.welcomeScreen, subtitle: e.target.value } 
                  })}
                  onBlur={() => setEditingField(null)}
                />
              ) : (
                <p 
                  className="text-lg mb-8 cursor-pointer hover:opacity-80"
                  style={{ color: theme.textColor }}
                  onClick={() => setEditingField('welcome-subtitle')}
                >
                  {config.welcomeScreen.subtitle}
                </p>
              )}
              
              <Button 
                onClick={onNext}
                style={{ backgroundColor: theme.buttonColor, color: theme.textColor }}
                className="text-lg px-8 py-6"
              >
                {config.welcomeScreen.buttonText}
              </Button>
            </div>
          </div>
        );

      case 'contact':
        if (!config.contactForm.enabled) {
          onNext();
          return null;
        }
        return (
          <div className="flex w-full h-full items-center justify-center p-8">
            <div className="w-full max-w-md">
              <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: theme.textColor }}>
                {config.contactForm.title}
              </h2>
              <p className="text-center mb-6" style={{ color: theme.textColor, opacity: 0.8 }}>
                {config.contactForm.subtitle}
              </p>
              
              <div className="space-y-4">
                {config.contactForm.fields.map(field => (
                  <div key={field.type}>
                    <Input
                      type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                      placeholder={field.label}
                      value={contactData[field.type]}
                      onChange={(e) => setContactData(prev => ({ ...prev, [field.type]: e.target.value }))}
                      required={field.required}
                      className="h-12"
                    />
                  </div>
                ))}
                
                <Button 
                  onClick={onNext}
                  className="w-full h-12 text-lg"
                  style={{ backgroundColor: theme.buttonColor, color: theme.textColor }}
                >
                  Continuer
                </Button>
              </div>
            </div>
          </div>
        );

      case 'wheel':
        return (
          <div className="flex w-full h-full items-center justify-center p-8">
            <div className="flex flex-col items-center gap-8">
              <div className="relative">
                <svg width="400" height="400" viewBox="0 0 400 400" className={isSpinning ? "animate-spin" : ""}>
                  {config.segments.map((segment, index) => {
                    const angle = (360 / config.segments.length) * index;
                    const nextAngle = (360 / config.segments.length) * (index + 1);
                    const startAngle = (angle - 90) * Math.PI / 180;
                    const endAngle = (nextAngle - 90) * Math.PI / 180;
                    
                    const x1 = 200 + 180 * Math.cos(startAngle);
                    const y1 = 200 + 180 * Math.sin(startAngle);
                    const x2 = 200 + 180 * Math.cos(endAngle);
                    const y2 = 200 + 180 * Math.sin(endAngle);
                    
                    const largeArc = (nextAngle - angle) > 180 ? 1 : 0;
                    
                    return (
                      <g key={segment.id}>
                        <path
                          d={`M 200 200 L ${x1} ${y1} A 180 180 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={segment.color}
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text
                          x={200 + 120 * Math.cos((angle + nextAngle) / 2 * Math.PI / 180 - Math.PI / 2)}
                          y={200 + 120 * Math.sin((angle + nextAngle) / 2 * Math.PI / 180 - Math.PI / 2)}
                          fill="white"
                          fontSize="14"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {segment.label}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="200" cy="200" r="30" fill="white" stroke={theme.buttonColor} strokeWidth="4" />
                </svg>
                
                {/* Indicator arrow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                  <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px]" 
                    style={{ borderTopColor: theme.buttonColor }}
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSpin}
                disabled={isSpinning}
                className="text-lg px-12 py-6"
                style={{ backgroundColor: theme.buttonColor, color: theme.textColor }}
              >
                {isSpinning ? 'Rotation...' : 'TOURNER'}
              </Button>
            </div>
          </div>
        );

      case 'ending':
        return (
          <div className="flex w-full h-full items-center justify-center p-8">
            <div className="text-center max-w-md">
              <h1 className="text-4xl font-bold mb-4" style={{ color: theme.textColor }}>
                {config.endingScreen.title}
              </h1>
              <p className="text-xl" style={{ color: theme.textColor }}>
                {config.endingScreen.subtitle.replace('{{prize}}', wonPrize || '')}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100">
      {!isMobileResponsive && (
        <button
          onClick={onToggleViewMode}
          className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105"
          style={{
            backgroundColor: '#4A4138',
            border: '1px solid rgba(245, 184, 0, 0.3)',
            color: '#F5CA3C'
          }}
        >
          {viewMode === 'desktop' ? (
            <>
              <Monitor className="w-4 h-4" />
              <span className="text-xs font-medium">Desktop</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4" />
              <span className="text-xs font-medium">Mobile</span>
            </>
          )}
        </button>
      )}

      <div 
        className="relative overflow-hidden transition-all duration-300" 
        style={{ 
          backgroundColor: theme.backgroundColor, 
          width: viewMode === 'desktop' ? '1100px' : '375px', 
          height: viewMode === 'desktop' ? '620px' : '667px' 
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
