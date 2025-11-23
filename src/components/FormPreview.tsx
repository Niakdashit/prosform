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
            <div className="flex items-center justify-between w-full max-w-[1600px] px-24 gap-12">
              <div className="flex-1 max-w-[580px]">
                <h1 className="font-bold mb-6 leading-[0.9]" style={{ 
                  color: '#F5CA3C', 
                  fontWeight: 700, 
                  fontSize: '80px',
                  letterSpacing: '-0.04em' 
                }}>
                  {question.title}
                </h1>
                <p className="text-[17px] mb-14 leading-[1.65]" style={{ color: '#B8A892' }}>
                  {question.subtitle}
                </p>
                <button
                  onClick={onNext}
                  className="flex items-center gap-3 px-7 font-semibold transition-opacity hover:opacity-90"
                  style={{ 
                    backgroundColor: '#F5CA3C', 
                    color: '#3D3731',
                    height: '60px',
                    borderRadius: '30px',
                    fontSize: '18px',
                    border: 'none',
                    boxShadow: 'none'
                  }}
                >
                  <span>Give feedback</span>
                  <span className="font-normal" style={{ color: 'rgba(61, 55, 49, 0.6)', fontSize: '15px' }}>
                    press <strong style={{ fontWeight: 600 }}>Enter</strong> ↵
                  </span>
                </button>
                <div className="flex items-center gap-2.5 mt-5" style={{ color: '#B8A892', fontSize: '14px' }}>
                  <Clock className="w-4 h-4" />
                  <span>Takes X minutes</span>
                </div>
              </div>
              <div className="flex-1 max-w-[720px]">
                <div className="w-full overflow-hidden" style={{ 
                  borderRadius: '48px',
                  aspectRatio: '1.35/1',
                  boxShadow: '0 40px 100px -30px rgba(0,0,0,0.7)'
                }}>
                  <img
                    src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=1200&h=890&fit=crop"
                    alt="Feedback illustration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ) : question.type === "text" ? (
            <div className="w-full max-w-[900px] px-16">
              <div className="mb-10">
                {question.number && (
                  <div className="mb-5 font-semibold text-lg" style={{ color: '#F5B800' }}>
                    {question.number} →
                  </div>
                )}
                <h2 className="text-[56px] font-bold leading-[1.1]" style={{ color: '#FFFFFF', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {question.title}
                </h2>
              </div>
              <form onSubmit={handleSubmit}>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer here..."
                  className="bg-transparent border-b rounded-none text-2xl px-0 py-5 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#7A6F61]"
                  style={{ 
                    borderColor: 'rgba(255,255,255,0.25)',
                    color: '#FFFFFF'
                  }}
                  autoFocus
                />
                <div className="mt-8 flex items-center gap-4">
                  <Button
                    type="submit"
                    className="font-semibold px-6 py-3 h-[48px] rounded-lg text-base hover:opacity-90 transition-opacity"
                    style={{ 
                      backgroundColor: '#F5B800', 
                      color: '#3D3731' 
                    }}
                  >
                    OK <span className="ml-1">✓</span>
                  </Button>
                  <span className="text-sm" style={{ color: '#A89A8A' }}>
                    press <kbd className="px-2.5 py-1.5 rounded text-sm font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#C4B5A0' }}>Enter</kbd>
                  </span>
                </div>
              </form>
            </div>
          ) : question.type === "rating" ? (
            <div className="w-full max-w-[900px] px-16">
              <div className="mb-10">
                {question.number && (
                  <div className="mb-5 font-semibold text-lg" style={{ color: '#F5B800' }}>
                    {question.number} →
                  </div>
                )}
                <h2 className="text-[56px] font-bold leading-[1.1]" style={{ color: '#FFFFFF', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {question.title}
                </h2>
              </div>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={onNext}
                    className="w-20 h-20 rounded-xl transition-all flex items-center justify-center text-3xl font-semibold hover:opacity-80"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#FFFFFF'
                    }}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          ) : question.type === "choice" ? (
            <div className="w-full max-w-[900px] px-16">
              <div className="mb-10">
                {question.number && (
                  <div className="mb-5 font-semibold text-lg" style={{ color: '#F5B800' }}>
                    {question.number} →
                  </div>
                )}
                <h2 className="text-[56px] font-bold leading-[1.1]" style={{ color: '#FFFFFF', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {question.title}
                </h2>
              </div>
              <div className="space-y-4">
                {["Yes", "No", "Sometimes"].map((choice, index) => (
                  <button
                    key={choice}
                    onClick={onNext}
                    className="w-full p-5 rounded-xl transition-all flex items-center gap-5 text-left group hover:opacity-80"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <span className="font-semibold text-base" style={{ color: '#A89A8A' }}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-xl font-medium" style={{ color: '#FFFFFF' }}>{choice}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[900px] text-center px-16">
              <h2 className="text-[72px] font-bold mb-6 leading-[1.1]" style={{ color: '#F5B800', fontWeight: 700, letterSpacing: '-0.03em' }}>
                {question.title}
              </h2>
              <p className="text-xl mb-10" style={{ color: '#C4B5A0' }}>
                We appreciate you taking the time to share your thoughts.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="font-semibold px-8 py-3 h-[52px] rounded-lg text-base hover:opacity-90 transition-opacity"
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
