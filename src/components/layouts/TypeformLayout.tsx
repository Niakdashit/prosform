import { motion, AnimatePresence } from "framer-motion";
import { Question } from "../FormBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Check, ChevronUp, ChevronDown } from "lucide-react";

interface TypeformLayoutProps {
  question: Question;
  allQuestions: Question[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  viewMode: 'desktop' | 'mobile';
  themeColor?: string;
  brandName?: string;
  backgroundImages?: string[];
}

// Default background images for hair product theme
const defaultBackgroundImages = [
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80", // Woman with flowing hair
  "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80", // Hair styling
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80", // Woman hair portrait
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80", // Salon styling
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80", // Hair care
];

export const TypeformLayout = ({
  question,
  allQuestions,
  currentIndex,
  onNext,
  onPrev,
  onUpdateQuestion,
  viewMode,
  themeColor = "#8D3B34",
  brandName = "GLOSSY LOCKS",
  backgroundImages = defaultBackgroundImages,
}: TypeformLayoutProps) => {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Get background image based on current question
  const getBackgroundImage = () => {
    const imageIndex = currentIndex % backgroundImages.length;
    return backgroundImages[imageIndex];
  };

  // Determine layout based on question type
  const isWelcomeScreen = question.type === "welcome";
  const isPictureChoice = question.type === "picture-choice";
  const isEnding = question.type === "ending";

  const handleChoiceSelect = (choice: string) => {
    if (question.variant === "checkbox") {
      setSelectedChoices(prev => 
        prev.includes(choice) 
          ? prev.filter(c => c !== choice)
          : [...prev, choice]
      );
    } else {
      setSelectedChoices([choice]);
    }
  };

  const handleSubmit = () => {
    setSelectedChoices([]);
    setInputValue("");
    onNext();
  };

  // Welcome screen layout - split with image on right
  if (isWelcomeScreen) {
    return (
      <div className="w-full h-full flex" style={{ backgroundColor: themeColor }}>
        {/* Left side - Content */}
        <div className="w-1/2 h-full flex flex-col justify-between p-12">
          {/* Brand */}
          <div className="text-white/90 text-sm font-medium tracking-wider">
            {brandName}<sup className="text-xs">®</sup>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-light text-white leading-tight mb-8"
            >
              {question.title || "Find the right product for your hair"}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                onClick={handleSubmit}
                className="rounded-full px-6 py-3 text-base font-medium"
                style={{ 
                  backgroundColor: 'white',
                  color: themeColor,
                }}
              >
                {question.buttonText || "Take quiz"}
                <span className="ml-2 text-xs opacity-60">press Enter ↵</span>
              </Button>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-white/60 text-xs flex items-center gap-1">
            <span className="inline-block w-4 h-4 border border-white/40 rounded-full flex items-center justify-center text-[10px]">⏱</span>
            Takes 15 sec
          </div>
        </div>

        {/* Right side - Image */}
        <div className="w-1/2 h-full relative overflow-hidden">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            src={getBackgroundImage()}
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  // Picture choice layout - full width with image cards
  if (isPictureChoice) {
    const pictureChoiceImages = [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80",
    ];

    return (
      <div className="w-full h-full flex flex-col" style={{ backgroundColor: themeColor }}>
        {/* Brand */}
        <div className="p-6 text-white/90 text-sm font-medium tracking-wider">
          {brandName}<sup className="text-xs">®</sup>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-light text-white text-center mb-10"
          >
            {question.title}
          </motion.h2>

          {/* Picture choices */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            {(question.choices || ["Straight", "Curly", "Coily"]).map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoiceSelect(choice)}
                className={`relative overflow-hidden rounded-lg transition-all ${
                  selectedChoices.includes(choice) 
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' 
                    : 'hover:scale-105'
                }`}
                style={{ width: '160px' }}
              >
                <img
                  src={pictureChoiceImages[index % pictureChoiceImages.length]}
                  alt={choice}
                  className="w-full h-32 object-cover"
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-medium"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  {choice}
                </div>
                {selectedChoices.includes(choice) && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3" style={{ color: themeColor }} />
                  </div>
                )}
              </button>
            ))}
          </motion.div>

          {/* OK Button */}
          {selectedChoices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Button
                onClick={handleSubmit}
                className="rounded px-6 py-2 text-sm font-medium"
                style={{ 
                  backgroundColor: 'white',
                  color: themeColor,
                }}
              >
                OK
              </Button>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="p-6 flex justify-end items-center gap-2">
          <button 
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="w-8 h-8 rounded flex items-center justify-center bg-white/20 hover:bg-white/30 disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4 text-white" />
          </button>
          <button 
            onClick={handleSubmit}
            className="w-8 h-8 rounded flex items-center justify-center bg-white/20 hover:bg-white/30"
          >
            <ChevronDown className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Standard choice question - split layout with image on left
  return (
    <div className="w-full h-full flex" style={{ backgroundColor: themeColor }}>
      {/* Left side - Image */}
      <div className="w-1/2 h-full relative overflow-hidden">
        {/* Brand overlay */}
        <div className="absolute top-6 left-6 z-10 text-white/90 text-sm font-medium tracking-wider">
          {brandName}<sup className="text-xs">®</sup>
        </div>
        <motion.img
          key={currentIndex}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          src={getBackgroundImage()}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side - Content */}
      <div className="w-1/2 h-full flex flex-col justify-between p-12">
        {/* Question */}
        <div className="flex-1 flex flex-col justify-center">
          <motion.h2
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-light text-white leading-tight mb-8"
          >
            {question.title}
          </motion.h2>

          {/* Choices */}
          {question.choices && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              {question.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoiceSelect(choice)}
                  className={`w-full max-w-md text-left px-4 py-3 rounded-md transition-all ${
                    selectedChoices.includes(choice)
                      ? 'bg-white/30 border-white'
                      : 'bg-white/10 hover:bg-white/20 border-transparent'
                  } border`}
                >
                  <span className="text-white text-sm">{choice}</span>
                </button>
              ))}
            </motion.div>
          )}

          {/* Input fields for text/email questions */}
          {(question.type === "text" || question.type === "email") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-md"
            >
              <Input
                type={question.type === "email" ? "email" : "text"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={question.placeholder || "Type your answer here..."}
                className="bg-transparent border-0 border-b-2 border-white/30 rounded-none text-white placeholder:text-white/50 focus:border-white focus-visible:ring-0 text-lg py-2"
              />
            </motion.div>
          )}

          {/* OK Button */}
          {(selectedChoices.length > 0 || inputValue.trim()) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Button
                onClick={handleSubmit}
                className="rounded px-6 py-2 text-sm font-medium"
                style={{ 
                  backgroundColor: 'white',
                  color: themeColor,
                }}
              >
                OK
              </Button>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-end items-center gap-2">
          <button 
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="w-8 h-8 rounded flex items-center justify-center bg-white/20 hover:bg-white/30 disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4 text-white" />
          </button>
          <button 
            onClick={handleSubmit}
            className="w-8 h-8 rounded flex items-center justify-center bg-white/20 hover:bg-white/30"
          >
            <ChevronDown className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
