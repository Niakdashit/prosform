import { motion, AnimatePresence } from "framer-motion";
import { Question } from "./FormBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { useState } from "react";

interface FormPreviewProps {
  question?: Question;
  onNext: () => void;
}

export const FormPreview = ({ question, onNext }: FormPreviewProps) => {
  const [inputValue, setInputValue] = useState("");

  if (!question) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#3D3731' }}>
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
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl mx-auto px-8"
        >
          {question.type === "welcome" ? (
            <div className="grid grid-cols-2 gap-20 items-center max-w-6xl px-12">
              <div>
                <h1 className="text-[4rem] font-bold mb-6 leading-[1.1]" style={{ 
                  color: '#F5B800', 
                  fontWeight: 700, 
                  letterSpacing: '-0.02em' 
                }}>
                  {question.title}
                </h1>
                <p className="text-[15px] mb-10 leading-relaxed" style={{ color: '#A89A8A' }}>
                  {question.subtitle}
                </p>
                <Button
                  onClick={onNext}
                  size="lg"
                  className="h-auto text-base font-semibold px-7 py-3.5 rounded-lg"
                  style={{ 
                    backgroundColor: '#F5B800', 
                    color: '#3D3731' 
                  }}
                >
                  Give feedback
                  <span className="ml-4 text-sm opacity-80 font-normal">press <strong>Enter ↵</strong></span>
                </Button>
                <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: '#A89A8A' }}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Takes X minutes</span>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_25px_80px_-20px_rgba(0,0,0,0.6)]">
                  <img
                    src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&h=600&fit=crop"
                    alt="Feedback illustration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ) : question.type === "text" ? (
            <div className="max-w-2xl px-12">
              <div className="mb-8">
                {question.number && (
                  <div className="mb-4 font-medium text-base" style={{ color: '#F5B800' }}>
                    {question.number} →
                  </div>
                )}
                <h2 className="text-5xl font-bold mb-4" style={{ color: '#F5F5F5', fontWeight: 700 }}>
                  {question.title}
                </h2>
              </div>
              <form onSubmit={handleSubmit}>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer here..."
                  className="bg-transparent border-b rounded-none text-xl px-0 py-4 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ 
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: '#F5F5F5'
                  }}
                  autoFocus
                />
                <div className="mt-6 flex items-center gap-3">
                  <Button
                    type="submit"
                    className="font-medium px-5 py-2.5 h-auto rounded-lg"
                    style={{ 
                      backgroundColor: '#F5B800', 
                      color: '#3D3731' 
                    }}
                  >
                    OK <span className="ml-1">✓</span>
                  </Button>
                  <span className="text-xs" style={{ color: '#A89A8A' }}>
                    press <kbd className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>Enter</kbd>
                  </span>
                </div>
              </form>
            </div>
          ) : question.type === "rating" ? (
            <div className="max-w-2xl px-12">
              <div className="mb-8">
                {question.number && (
                  <div className="mb-4 font-medium text-base" style={{ color: '#F5B800' }}>
                    {question.number} →
                  </div>
                )}
                <h2 className="text-5xl font-bold mb-4" style={{ color: '#F5F5F5', fontWeight: 700 }}>
                  {question.title}
                </h2>
              </div>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={onNext}
                    className="w-16 h-16 rounded-lg transition-all flex items-center justify-center text-2xl font-semibold"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#F5F5F5'
                    }}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          ) : question.type === "choice" ? (
            <div className="max-w-2xl px-12">
              <div className="mb-8">
                {question.number && (
                  <div className="mb-4 font-medium text-base" style={{ color: '#F5B800' }}>
                    {question.number} →
                  </div>
                )}
                <h2 className="text-5xl font-bold mb-4" style={{ color: '#F5F5F5', fontWeight: 700 }}>
                  {question.title}
                </h2>
              </div>
              <div className="space-y-3">
                {["Yes", "No", "Sometimes"].map((choice, index) => (
                  <button
                    key={choice}
                    onClick={onNext}
                    className="w-full p-4 rounded-lg transition-all flex items-center gap-4 text-left group"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)'
                    }}
                  >
                    <span className="font-medium" style={{ color: '#A89A8A' }}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-lg font-medium" style={{ color: '#F5F5F5' }}>{choice}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl text-center px-12">
              <h2 className="text-6xl font-bold mb-5" style={{ color: '#F5B800', fontWeight: 700 }}>
                {question.title}
              </h2>
              <p className="text-lg mb-8" style={{ color: '#A89A8A' }}>
                We appreciate you taking the time to share your thoughts.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="font-semibold px-7 py-3.5 h-auto rounded-lg"
                style={{ 
                  backgroundColor: '#F5B800', 
                  color: '#3D3731' 
                }}
              >
                Start over
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
