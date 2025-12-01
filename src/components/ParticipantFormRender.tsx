import { motion, AnimatePresence } from "framer-motion";
import { Question } from "./FormBuilder";
import { useState, useEffect } from "react";
import { useTheme, getButtonStyles } from "@/contexts/ThemeContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart, ThumbsUp, Smile, Meh, Frown } from "lucide-react";
import { AnalyticsTrackingService } from "@/services/AnalyticsTrackingService";

interface ParticipantFormRenderProps {
  questions: Question[];
  campaignId?: string;
}

export const ParticipantFormRender = ({ questions, campaignId }: ParticipantFormRenderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [isComplete, setIsComplete] = useState(false);
  const { theme } = useTheme();
  const buttonStyles = getButtonStyles(theme);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // Track each question view (each question is a step)
  useEffect(() => {
    if (campaignId && currentQuestion) {
      // Track welcome for first question, game for others, ending for completion
      if (currentIndex === 0) {
        AnalyticsTrackingService.trackStepView(campaignId, 'welcome');
      } else if (isComplete) {
        AnalyticsTrackingService.trackStepView(campaignId, 'ending');
      } else {
        AnalyticsTrackingService.trackStepView(campaignId, 'game');
      }
    }
  }, [currentIndex, isComplete, campaignId, currentQuestion]);

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleResponse = (value: string | string[]) => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const renderInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'welcome':
        return (
          <button
            onClick={handleNext}
            className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
            style={buttonStyles}
          >
            {currentQuestion.buttonText || "Commencer"}
          </button>
        );

      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="w-full max-w-md">
            <Input
              type={currentQuestion.type === 'email' ? 'email' : currentQuestion.type === 'phone' ? 'tel' : currentQuestion.type === 'number' ? 'number' : 'text'}
              placeholder={currentQuestion.placeholder || "Votre réponse..."}
              className="w-full px-4 py-3 text-lg rounded-lg"
              style={{ 
                backgroundColor: theme.backgroundColor,
                borderColor: theme.accentColor + '40',
                color: theme.textColor
              }}
              onChange={(e) => handleResponse(e.target.value)}
              value={responses[currentQuestion.id] as string || ''}
            />
            <button
              onClick={handleNext}
              disabled={!responses[currentQuestion.id]}
              className="mt-6 px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 disabled:opacity-50"
              style={buttonStyles}
            >
              Continuer
            </button>
          </div>
        );

      case 'long-text':
        return (
          <div className="w-full max-w-lg">
            <Textarea
              placeholder={currentQuestion.placeholder || "Votre réponse..."}
              className="w-full px-4 py-3 text-lg rounded-lg min-h-[120px]"
              style={{ 
                backgroundColor: theme.backgroundColor,
                borderColor: theme.accentColor + '40',
                color: theme.textColor
              }}
              onChange={(e) => handleResponse(e.target.value)}
              value={responses[currentQuestion.id] as string || ''}
            />
            <button
              onClick={handleNext}
              disabled={!responses[currentQuestion.id]}
              className="mt-6 px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 disabled:opacity-50"
              style={buttonStyles}
            >
              Continuer
            </button>
          </div>
        );

      case 'choice':
      case 'dropdown':
        return (
          <div className="w-full max-w-md space-y-3">
            {currentQuestion.choices?.map((choice, index) => {
              const isSelected = responses[currentQuestion.id] === choice;
              return (
                <button
                  key={index}
                  onClick={() => {
                    handleResponse(choice);
                    setTimeout(handleNext, 300);
                  }}
                  className="w-full px-6 py-4 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: isSelected ? theme.accentColor : theme.accentColor + '15',
                    color: isSelected ? '#fff' : theme.textColor,
                    border: `2px solid ${isSelected ? theme.accentColor : 'transparent'}`
                  }}
                >
                  <span className="font-medium">{choice}</span>
                </button>
              );
            })}
          </div>
        );

      case 'yesno':
        return (
          <div className="flex gap-4">
            {['Oui', 'Non'].map((choice) => {
              const isSelected = responses[currentQuestion.id] === choice;
              return (
                <button
                  key={choice}
                  onClick={() => {
                    handleResponse(choice);
                    setTimeout(handleNext, 300);
                  }}
                  className="px-8 py-4 rounded-xl font-semibold transition-all"
                  style={{
                    backgroundColor: isSelected ? theme.accentColor : theme.accentColor + '15',
                    color: isSelected ? '#fff' : theme.textColor
                  }}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        );

      case 'rating':
        const ratingCount = currentQuestion.ratingCount || 5;
        const ratingType = currentQuestion.ratingType || 'star';
        const currentRating = Number(responses[currentQuestion.id]) || 0;

        const RatingIcon = ratingType === 'heart' ? Heart : 
                          ratingType === 'thumb' ? ThumbsUp : Star;

        if (ratingType === 'emoji') {
          const emojis = [Frown, Meh, Smile];
          return (
            <div className="flex gap-4">
              {emojis.map((Icon, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleResponse(String(index + 1));
                    setTimeout(handleNext, 300);
                  }}
                  className="p-4 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: currentRating === index + 1 ? theme.accentColor + '30' : 'transparent'
                  }}
                >
                  <Icon 
                    className="w-12 h-12" 
                    style={{ color: currentRating === index + 1 ? theme.accentColor : theme.textSecondaryColor }}
                  />
                </button>
              ))}
            </div>
          );
        }

        if (ratingType === 'nps') {
          return (
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleResponse(String(i));
                    setTimeout(handleNext, 300);
                  }}
                  className="w-12 h-12 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: currentRating === i ? theme.accentColor : theme.accentColor + '15',
                    color: currentRating === i ? '#fff' : theme.textColor
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          );
        }

        return (
          <div className="flex gap-2">
            {Array.from({ length: ratingCount }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  handleResponse(String(i + 1));
                  setTimeout(handleNext, 300);
                }}
                className="p-2 transition-all hover:scale-110"
              >
                <RatingIcon 
                  className="w-10 h-10" 
                  fill={currentRating >= i + 1 ? theme.accentColor : 'transparent'}
                  stroke={currentRating >= i + 1 ? theme.accentColor : theme.textSecondaryColor}
                />
              </button>
            ))}
          </div>
        );

      case 'ending':
        return (
          <div className="text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
              style={{ backgroundColor: theme.accentColor + '20' }}
            >
              🎉
            </div>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setResponses({});
                setIsComplete(false);
              }}
              className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
              style={buttonStyles}
            >
              Recommencer
            </button>
          </div>
        );

      default:
        return (
          <button
            onClick={handleNext}
            className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
            style={buttonStyles}
          >
            Continuer
          </button>
        );
    }
  };

  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: theme.backgroundColor }}>
        <p style={{ color: theme.textColor }}>Aucune question</p>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Progress bar */}
      {currentQuestion.type !== 'welcome' && currentQuestion.type !== 'ending' && (
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: theme.accentColor + '30' }}>
          <motion.div 
            className="h-full"
            style={{ backgroundColor: theme.accentColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex flex-col items-center justify-center p-8"
        >
          {/* Question content */}
          <div className="max-w-2xl w-full text-center">
            {/* Question number */}
            {currentQuestion.type !== 'welcome' && currentQuestion.type !== 'ending' && (
              <p 
                className="text-sm mb-4 opacity-60"
                style={{ color: theme.textSecondaryColor }}
              >
                Question {currentIndex + 1} / {totalQuestions}
              </p>
            )}

            {/* Title */}
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: theme.textColor }}
            >
              {currentQuestion.title}
            </h1>

            {/* Subtitle */}
            {currentQuestion.subtitle && (
              <p 
                className="text-lg mb-8 opacity-80"
                style={{ color: theme.textSecondaryColor }}
              >
                {currentQuestion.subtitle}
              </p>
            )}

            {/* Input */}
            <div className="flex justify-center">
              {renderInput()}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
