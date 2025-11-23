import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, Star, Smile, Frown, Meh, Heart, ThumbsUp,
  Mail, Phone, Hash, Calendar, Video, FileText, Type,
  CheckSquare, List, CheckCircle, Upload, ChevronDown
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/contexts/ThemeContext";
import { Question } from "@/components/FormBuilder";

const PHONE_COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
];

export const PublicPreview = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [formResponses, setFormResponses] = useState<Record<string, string>>({});
  const { theme } = useTheme();
  
  // Get questions from localStorage (passed from FormBuilder)
  const [questions, setQuestions] = useState<Question[]>([]);
  
  useEffect(() => {
    const storedQuestions = localStorage.getItem('preview-questions');
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    }
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const viewMode = window.innerWidth >= 768 ? 'desktop' : 'mobile';

  const handleNext = () => {
    if (currentQuestion && inputValue.trim()) {
      const responseKey = currentQuestion.title.toLowerCase().includes('name') ? 'first_name' : 
                          currentQuestion.title.toLowerCase().includes('email') ? 'email' :
                          currentQuestion.id;
      setFormResponses(prev => ({
        ...prev,
        [responseKey]: inputValue.trim()
      }));
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setInputValue("");
    }
  };

  const replaceVariables = (text: string): string => {
    if (!text) return text;
    let result = text;
    Object.entries(formResponses).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    });
    return result;
  };

  if (!currentQuestion) return null;

  return (
    <div className="w-screen h-screen fixed inset-0 flex items-center justify-center" style={{ backgroundColor: theme.backgroundColor }}>
      <div 
        className="relative overflow-hidden" 
        style={{ 
          backgroundColor: theme.backgroundColor, 
          width: viewMode === 'desktop' ? '1100px' : '375px',
          height: viewMode === 'desktop' ? '620px' : '667px',
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      >
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <div className="grid grid-cols-2 gap-1">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5CA3C]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5CA3C]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5CA3C]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5CA3C]" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center px-16"
          >
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="w-full max-w-2xl">
              {currentQuestion.number && (
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ 
                      backgroundColor: theme.systemColor,
                      color: theme.textColor
                    }}
                  >
                    {currentQuestion.number}
                  </div>
                </div>
              )}
              
              <h2 
                className="text-3xl font-bold mb-4"
                style={{ color: theme.textColor }}
              >
                {replaceVariables(currentQuestion.title)}
              </h2>
              
              {currentQuestion.subtitle && (
                <p 
                  className="text-lg mb-8"
                  style={{ color: theme.systemColor }}
                >
                  {replaceVariables(currentQuestion.subtitle)}
                </p>
              )}

              {/* Input fields based on question type */}
              {currentQuestion.type === "text" && (
                currentQuestion.variant === "long" ? (
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="mb-6"
                    rows={4}
                  />
                ) : (
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="mb-6"
                  />
                )
              )}

              {currentQuestion.type === "email" && (
                <Input
                  type="email"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="mb-6"
                />
              )}

              <Button
                type="submit"
                className="mt-4"
                style={{
                  backgroundColor: theme.buttonColor,
                  color: theme.backgroundColor
                }}
              >
                {currentQuestion.buttonText || "Continue"}
              </Button>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};