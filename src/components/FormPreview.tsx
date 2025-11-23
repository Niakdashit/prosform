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
    <div className="flex-1 flex items-center justify-center bg-brown-dark relative overflow-hidden">
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-primary rotate-45" />
          <div className="w-3 h-3 rounded-full bg-primary rotate-45" />
        </div>
        <div className="flex gap-1 mt-1">
          <div className="w-3 h-3 rounded-full bg-primary rotate-45" />
          <div className="w-3 h-3 rounded-full bg-primary rotate-45" />
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
            <div className="grid grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold text-primary mb-4 leading-tight" style={{ fontWeight: 700 }}>
                  {question.title}
                </h1>
                <p className="text-lg text-cream/70 mb-8">
                  {question.subtitle}
                </p>
                <Button
                  onClick={onNext}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-brown-dark font-semibold px-6 py-5 rounded-md h-auto"
                >
                  Give feedback
                  <span className="ml-2 text-sm">press Enter ↵</span>
                </Button>
                <div className="flex items-center gap-2 mt-4 text-cream/60 text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Takes X minutes</span>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-cream rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=600&h=600&fit=crop"
                    alt="Feedback illustration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ) : question.type === "text" ? (
            <div className="max-w-2xl">
              <div className="mb-6">
                {question.number && (
                  <div className="text-primary/60 mb-3 font-medium text-sm">
                    {question.number} →
                  </div>
                )}
                <h2 className="text-4xl font-bold text-cream mb-4" style={{ fontWeight: 700 }}>
                  {question.title}
                </h2>
              </div>
              <form onSubmit={handleSubmit}>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer here..."
                  className="bg-transparent border-b border-cream/30 rounded-none text-xl text-cream placeholder:text-cream/40 focus:border-primary px-0 py-3 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoFocus
                />
                <div className="mt-4 flex items-center gap-3">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-brown-dark font-medium px-4 py-2 h-auto"
                  >
                    OK <span className="ml-1">✓</span>
                  </Button>
                  <span className="text-cream/50 text-xs">
                    press <kbd className="px-1.5 py-0.5 bg-cream/10 rounded text-xs">Enter</kbd>
                  </span>
                </div>
              </form>
            </div>
          ) : question.type === "rating" ? (
            <div className="max-w-2xl">
              <div className="mb-6">
                {question.number && (
                  <div className="text-primary/60 mb-3 font-medium text-sm">
                    {question.number} →
                  </div>
                )}
                <h2 className="text-4xl font-bold text-cream mb-4" style={{ fontWeight: 700 }}>
                  {question.title}
                </h2>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={onNext}
                    className="w-14 h-14 rounded-lg bg-cream/10 hover:bg-primary/20 border border-cream/20 hover:border-primary transition-all flex items-center justify-center text-xl text-cream font-semibold"
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          ) : question.type === "choice" ? (
            <div className="max-w-2xl">
              <div className="mb-6">
                {question.number && (
                  <div className="text-primary/60 mb-3 font-medium text-sm">
                    {question.number} →
                  </div>
                )}
                <h2 className="text-4xl font-bold text-cream mb-4" style={{ fontWeight: 700 }}>
                  {question.title}
                </h2>
              </div>
              <div className="space-y-2">
                {["Yes", "No", "Sometimes"].map((choice, index) => (
                  <button
                    key={choice}
                    onClick={onNext}
                    className="w-full p-4 rounded-lg bg-cream/10 hover:bg-primary/20 border border-cream/20 hover:border-primary transition-all flex items-center gap-3 text-left group"
                  >
                    <span className="text-cream/60 group-hover:text-primary font-medium text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-lg text-cream font-medium">{choice}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl text-center">
              <h2 className="text-5xl font-bold text-primary mb-4" style={{ fontWeight: 700 }}>
                {question.title}
              </h2>
              <p className="text-lg text-cream/70 mb-6">
                We appreciate you taking the time to share your thoughts.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-primary/90 text-brown-dark font-semibold px-6 py-3 h-auto"
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
