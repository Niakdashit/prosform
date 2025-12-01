import { motion, AnimatePresence } from "framer-motion";
import { QuizConfig, QuizAnswer } from "./QuizBuilder";
import { useState, useEffect } from "react";
import { useTheme, getButtonStyles } from "@/contexts/ThemeContext";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParticipationService } from "@/services/ParticipationService";
import { AnalyticsTrackingService } from "@/services/AnalyticsTrackingService";

interface ParticipantQuizRenderProps {
  config: QuizConfig;
  campaignId: string;
}

export const ParticipantQuizRender = ({ config, campaignId }: ParticipantQuizRenderProps) => {
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'question' | 'result'>('welcome');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [contactData, setContactData] = useState({ name: "", email: "", phone: "" });
  const [score, setScore] = useState(0);
  const { theme } = useTheme();
  const buttonStyles = getButtonStyles(theme);

  const currentQuestion = config.questions[activeQuestionIndex];
  const totalQuestions = config.questions.length;

  // Track initial welcome view
  useEffect(() => {
    AnalyticsTrackingService.trackStepView(campaignId, 'welcome');
  }, [campaignId]);

  const handleNext = async () => {
    if (activeView === 'welcome') {
      if (config.contactScreen?.enabled) {
        setActiveView('contact');
        AnalyticsTrackingService.trackStepView(campaignId, 'contact');
      } else {
        setActiveView('question');
        AnalyticsTrackingService.trackStepView(campaignId, 'game');
      }
    } else if (activeView === 'contact') {
      setActiveView('question');
      AnalyticsTrackingService.trackStepView(campaignId, 'game');
    } else if (activeView === 'question') {
      // Calculate score for current question - find if selected answer is correct
      if (currentQuestion) {
        const selectedAnswerId = selectedAnswers[activeQuestionIndex];
        const correctAnswer = currentQuestion.answers.find(a => a.isCorrect);
        if (correctAnswer && selectedAnswerId === correctAnswer.id) {
          setScore(prev => prev + currentQuestion.points);
        }
      }
      
      if (activeQuestionIndex < totalQuestions - 1) {
        setActiveQuestionIndex(prev => prev + 1);
      } else {
        // Enregistrer la participation
        const finalScore = score + (currentQuestion && selectedAnswers[activeQuestionIndex] === currentQuestion.answers.find(a => a.isCorrect)?.id ? currentQuestion.points : 0);
        await ParticipationService.recordParticipation({
          campaignId,
          contactData,
          result: {
            type: finalScore > 0 ? 'win' : 'lose',
            score: finalScore,
            answers: selectedAnswers,
          },
        });
        
        setActiveView('result');
        AnalyticsTrackingService.trackStepView(campaignId, 'ending');
      }
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [activeQuestionIndex]: answerId }));
  };

  const replaceVariables = (text: string) => {
    return text
      .replace(/\{\{score\}\}/g, String(score))
      .replace(/\{\{total\}\}/g, String(totalQuestions));
  };

  const renderWelcome = () => {
    const bgStyle = config.welcomeScreen.wallpaperImage 
      ? { backgroundImage: `url(${config.welcomeScreen.wallpaperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: theme.backgroundColor };

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8" style={bgStyle}>
        {config.welcomeScreen.wallpaperImage && (
          <div className="absolute inset-0 bg-black/30" />
        )}
        <div className="relative z-10 max-w-2xl text-center">
          {config.welcomeScreen.showImage && config.welcomeScreen.wallpaperImage && (
            <img 
              src={config.welcomeScreen.wallpaperImage} 
              alt="" 
              className="w-64 h-48 object-cover rounded-xl mx-auto mb-8"
            />
          )}
          <h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: theme.textColor }}
          >
            {config.welcomeScreen.title}
          </h1>
          <p 
            className="text-lg md:text-xl mb-10 opacity-80"
            style={{ color: theme.textSecondaryColor }}
          >
            {config.welcomeScreen.subtitle}
          </p>
          <button
            onClick={handleNext}
            className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
            style={buttonStyles}
          >
            {config.welcomeScreen.buttonText || "Commencer"}
          </button>
        </div>
      </div>
    );
  };

  const renderContact = () => {
    if (!config.contactScreen) return null;

    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="max-w-md w-full">
          <h2 
            className="text-3xl font-bold mb-4 text-center"
            style={{ color: theme.textColor }}
          >
            {config.contactScreen.title || "Vos coordonnées"}
          </h2>
          <p 
            className="text-lg mb-8 text-center opacity-80"
            style={{ color: theme.textSecondaryColor }}
          >
            {config.contactScreen.subtitle || "Pour recevoir vos résultats"}
          </p>
          
          <div className="space-y-4">
            {config.contactScreen.fields?.map((field, index) => (
              <div key={index}>
                <label 
                  className="block mb-2 text-base font-normal"
                  style={{ color: theme.textColor }}
                >
                  {field.label}
                </label>
                <input
                  type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-colors"
                  style={{ 
                    borderColor: theme.accentColor + '40',
                    backgroundColor: theme.backgroundColor,
                    color: theme.textColor
                  }}
                  onChange={(e) => setContactData(prev => ({ ...prev, [field.type]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className="w-full mt-8 px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
            style={buttonStyles}
          >
            Continuer
          </button>
        </div>
      </div>
    );
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <div 
        className="w-full h-full flex flex-col p-8"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        {/* Progress bar */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-2">
            <span style={{ color: theme.textSecondaryColor }} className="text-sm">
              Question {activeQuestionIndex + 1} / {totalQuestions}
            </span>
            {currentQuestion.timeLimit && (
              <span style={{ color: theme.textSecondaryColor }} className="text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {currentQuestion.timeLimit}s
              </span>
            )}
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: theme.accentColor + '30' }}>
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${((activeQuestionIndex + 1) / totalQuestions) * 100}%`,
                backgroundColor: theme.accentColor 
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          {currentQuestion.imageUrl && (
            <img 
              src={currentQuestion.imageUrl} 
              alt="" 
              className="w-full max-w-md h-48 object-cover rounded-xl mb-8"
            />
          )}
          
          <h2 
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ color: theme.textColor }}
          >
            {currentQuestion.question}
          </h2>

          {/* Answers */}
          <div className="w-full space-y-3">
            {currentQuestion.answers.map((answer) => {
              const isSelected = selectedAnswers[activeQuestionIndex] === answer.id;
              return (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  className={cn(
                    "w-full px-6 py-4 rounded-xl text-left transition-all",
                    isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
                  )}
                  style={{
                    backgroundColor: isSelected ? theme.accentColor : theme.accentColor + '15',
                    color: isSelected ? '#fff' : theme.textColor,
                    border: `2px solid ${isSelected ? theme.accentColor : 'transparent'}`
                  }}
                >
                  <span className="font-medium">{answer.text}</span>
                </button>
              );
            })}
          </div>

          {/* Next button */}
          {selectedAnswers[activeQuestionIndex] && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="mt-8 px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
              style={buttonStyles}
            >
              {activeQuestionIndex < totalQuestions - 1 ? "Question suivante" : "Voir les résultats"}
            </motion.button>
          )}
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="max-w-lg text-center">
          {/* Score circle */}
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ backgroundColor: theme.accentColor + '20' }}
          >
            <span 
              className="text-4xl font-bold"
              style={{ color: theme.accentColor }}
            >
              {percentage}%
            </span>
          </div>

          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: theme.textColor }}
          >
            {replaceVariables(config.resultScreen.title)}
          </h2>
          <p 
            className="text-lg mb-8 opacity-80"
            style={{ color: theme.textSecondaryColor }}
          >
            {replaceVariables(config.resultScreen.subtitle)}
          </p>

          <div 
            className="text-xl mb-8"
            style={{ color: theme.textColor }}
          >
            Vous avez obtenu <strong>{score}</strong> sur <strong>{totalQuestions}</strong> bonnes réponses
          </div>

          <button
            onClick={() => {
              setActiveView('welcome');
              setActiveQuestionIndex(0);
              setSelectedAnswers({});
              setScore(0);
            }}
            className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
            style={buttonStyles}
          >
            Rejouer
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView + activeQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {activeView === 'welcome' && renderWelcome()}
          {activeView === 'contact' && renderContact()}
          {activeView === 'question' && renderQuestion()}
          {activeView === 'result' && renderResult()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
