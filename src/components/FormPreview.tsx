import { motion, AnimatePresence } from "framer-motion";
import { Question } from "./FormBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";
import { useState } from "react";

interface FormPreviewProps {
  question?: Question;
  onNext: () => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
}

export const FormPreview = ({ question, onNext, onUpdateQuestion }: FormPreviewProps) => {
  const [inputValue, setInputValue] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingChoiceIndex, setEditingChoiceIndex] = useState<number | null>(null);

  if (!question) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleTitleBlur = (value: string) => {
    if (question && value.trim() !== question.title) {
      onUpdateQuestion(question.id, { title: value.trim() });
    }
    setEditingField(null);
  };

  const handleSubtitleBlur = (value: string) => {
    if (question && value.trim() !== question.subtitle) {
      onUpdateQuestion(question.id, { subtitle: value.trim() });
    }
    setEditingField(null);
  };

  const handleChoiceBlur = (index: number, value: string) => {
    if (question && question.choices) {
      const newChoices = [...question.choices];
      newChoices[index] = value.trim() || question.choices[index];
      onUpdateQuestion(question.id, { choices: newChoices });
    }
    setEditingChoiceIndex(null);
  };

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100">
      <div className="relative overflow-hidden" style={{ backgroundColor: '#3D3731', width: '1100px', height: '620px' }}>
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
            className="w-full h-full"
          >
            {question.type === "welcome" ? (
              <div className="flex items-center justify-center w-full h-full px-16">
                <div className="w-full h-full grid grid-cols-[1fr_1fr] gap-16 items-center px-12">
                  <div>
                    <h1 
                      className="font-bold mb-6 leading-[1.05] cursor-text hover:opacity-80 transition-opacity" 
                      style={{ 
                        color: '#F5CA3C', 
                        fontWeight: 700, 
                        fontSize: '64px',
                        letterSpacing: '-0.02em',
                        outline: editingField === 'welcome-title' ? '2px solid rgba(245, 202, 60, 0.5)' : 'none',
                        padding: '4px',
                        margin: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('welcome-title')}
                      onBlur={(e) => handleTitleBlur(e.currentTarget.textContent || '')}
                    >
                      {question.title}
                    </h1>
                    <p 
                      className="text-[16px] mb-8 leading-[1.6] cursor-text hover:opacity-80 transition-opacity" 
                      style={{ 
                        color: '#B8A892',
                        outline: editingField === 'welcome-subtitle' ? '2px solid rgba(184, 168, 146, 0.5)' : 'none',
                        padding: '4px',
                        margin: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('welcome-subtitle')}
                      onBlur={(e) => handleSubtitleBlur(e.currentTarget.textContent || '')}
                    >
                      {question.subtitle}
                    </p>
                    <button
                      onClick={onNext}
                      className="flex items-center gap-3 px-7 font-semibold transition-opacity hover:opacity-90"
                      style={{ 
                        backgroundColor: '#F5CA3C', 
                        color: '#3D3731',
                        height: '56px',
                        borderRadius: '28px',
                        fontSize: '17px',
                        border: 'none',
                        boxShadow: 'none'
                      }}
                    >
                      <span>Give feedback</span>
                      <span className="font-normal" style={{ color: 'rgba(61, 55, 49, 0.55)', fontSize: '14px' }}>
                        press <strong style={{ fontWeight: 600 }}>Enter</strong> ↵
                      </span>
                    </button>
                    <div className="flex items-center gap-2.5 mt-5" style={{ color: '#A89A8A', fontSize: '14px' }}>
                      <Clock className="w-4 h-4" />
                      <span>Takes X minutes</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div
                      className="overflow-hidden w-[420px] h-[420px] max-w-full"
                      style={{ borderRadius: "36px" }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=1600&h=1600&fit=crop"
                        alt="Feedback illustration"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : question.type === "text" || question.type === "email" || question.type === "phone" || question.type === "number" || question.type === "date" ? (
              <div className="w-full h-full flex items-center justify-center px-24">
                <div className="w-full max-w-[700px]">
                  <div className="mb-10">
                    {question.number && (
                      <div className="mb-5 font-semibold text-lg" style={{ color: '#F5B800' }}>
                        {question.number} →
                      </div>
                    )}
                    <h2 
                      className="text-[56px] font-bold leading-[1.1] cursor-text hover:opacity-80 transition-opacity" 
                      style={{ 
                        color: '#FFFFFF', 
                        fontWeight: 700, 
                        letterSpacing: '-0.02em',
                        outline: editingField === 'text-title' ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
                        padding: '4px',
                        margin: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('text-title')}
                      onBlur={(e) => handleTitleBlur(e.currentTarget.textContent || '')}
                    >
                      {question.title}
                    </h2>
                    {(question.variant || question.type !== "text") && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(245, 184, 0, 0.15)', color: '#F5B800' }}>
                        {question.type === 'email' && '📧 Email'}
                        {question.type === 'phone' && '📱 Phone'}
                        {question.type === 'number' && '🔢 Number'}
                        {question.type === 'date' && '📅 Date'}
                        {question.type === 'text' && question.variant === 'video' && '🎥 Video/Audio'}
                        {question.type === 'text' && question.variant === 'long' && '📝 Long Text'}
                        {question.type === 'text' && question.variant === 'short' && '✏️ Short Text'}
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSubmit}>
                    {question.variant === 'long' ? (
                      <Textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your answer here..."
                        className="bg-transparent border rounded-lg text-xl px-4 py-4 min-h-[200px] focus:ring-2 focus:ring-[#F5B800] placeholder:text-[#7A6F61] resize-none"
                        style={{ 
                          borderColor: 'rgba(255,255,255,0.25)',
                          color: '#FFFFFF'
                        }}
                        autoFocus
                      />
                    ) : (
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        type={
                          question.type === 'email' ? 'email' :
                          question.type === 'phone' ? 'tel' :
                          question.type === 'number' ? 'number' :
                          question.type === 'date' ? 'date' :
                          question.variant === 'number' ? 'number' : 
                          question.variant === 'date' ? 'date' : 
                          'text'
                        }
                        placeholder={
                          question.type === 'email' ? 'name@example.com' :
                          question.type === 'phone' ? '+1 (555) 000-0000' :
                          question.type === 'number' ? 'Enter a number...' :
                          question.type === 'date' ? 'Select a date...' :
                          question.variant === 'number' ? 'Enter a number...' :
                          question.variant === 'date' ? 'Select a date...' :
                          question.variant === 'video' ? 'Upload video/audio or paste link...' :
                          question.placeholder || 'Type your answer here...'
                        }
                        className="bg-transparent border-b rounded-none text-2xl px-0 py-5 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#7A6F61]"
                        style={{ 
                          borderColor: 'rgba(255,255,255,0.25)',
                          color: '#FFFFFF'
                        }}
                        autoFocus
                      />
                    )}
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
              </div>
            ) : question.type === "rating" ? (
              <div className="w-full h-full flex items-center justify-center px-24">
                <div className="w-full max-w-[700px]">
                  <div className="mb-10">
                    {question.number && (
                      <div className="mb-5 font-semibold text-lg" style={{ color: '#F5B800' }}>
                        {question.number} →
                      </div>
                    )}
                    <h2 
                      className="text-[56px] font-bold leading-[1.1] cursor-text hover:opacity-80 transition-opacity" 
                      style={{ 
                        color: '#FFFFFF', 
                        fontWeight: 700, 
                        letterSpacing: '-0.02em',
                        outline: editingField === 'rating-title' ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
                        padding: '4px',
                        margin: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('rating-title')}
                      onBlur={(e) => handleTitleBlur(e.currentTarget.textContent || '')}
                    >
                      {question.title}
                    </h2>
                    {question.variant && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(245, 184, 0, 0.15)', color: '#F5B800' }}>
                        {question.variant === 'stars' && '⭐ Rating'}
                        {question.variant === 'scale' && '📊 Opinion Scale'}
                        {question.variant === 'ranking' && '🔢 Ranking'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div
                        key={rating}
                        className="w-20 h-20 rounded-xl transition-all flex items-center justify-center text-3xl font-semibold cursor-default"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#FFFFFF'
                        }}
                      >
                        {rating}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : question.type === "choice" || question.type === "dropdown" || question.type === "yesno" || question.type === "picture-choice" ? (
              <div className="w-full h-full flex items-center justify-center px-24">
                <div className="w-full max-w-[700px]">
                  <div className="mb-10">
                    {question.number && (
                      <div className="mb-5 font-semibold text-lg" style={{ color: '#F5B800' }}>
                        {question.number} →
                      </div>
                    )}
                    <h2 
                      className="text-[56px] font-bold leading-[1.1] cursor-text hover:opacity-80 transition-opacity" 
                      style={{ 
                        color: '#FFFFFF', 
                        fontWeight: 700, 
                        letterSpacing: '-0.02em',
                        outline: editingField === 'choice-title' ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
                        padding: '4px',
                        margin: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('choice-title')}
                      onBlur={(e) => handleTitleBlur(e.currentTarget.textContent || '')}
                    >
                      {question.title}
                    </h2>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(245, 184, 0, 0.15)', color: '#F5B800' }}>
                      {question.type === 'dropdown' && '📋 Dropdown'}
                      {question.type === 'yesno' && '✓/✗ Yes/No'}
                      {question.type === 'picture-choice' && '🖼️ Picture Choice'}
                      {question.type === 'choice' && question.variant === 'multiple' && '☑️ Multiple Choice'}
                      {question.type === 'choice' && question.variant === 'checkbox' && '☑️ Checkbox'}
                      {question.type === 'choice' && !question.variant && '☑️ Multiple Choice'}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {(question.choices || ["Yes", "No", "Sometimes"]).map((choice, index) => (
                      <div
                        key={index}
                        className="w-full p-5 rounded-xl transition-all flex items-center gap-5 text-left"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          border: editingChoiceIndex === index ? '2px solid rgba(245, 184, 0, 0.5)' : '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        <span className="font-semibold text-base" style={{ color: '#A89A8A' }}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span 
                          className="text-xl font-medium cursor-text hover:opacity-80 transition-opacity" 
                          style={{ 
                            color: '#FFFFFF',
                            outline: 'none',
                            padding: '4px',
                            margin: '-4px',
                            borderRadius: '4px'
                          }}
                          contentEditable
                          suppressContentEditableWarning
                          onFocus={() => setEditingChoiceIndex(index)}
                          onBlur={(e) => handleChoiceBlur(index, e.currentTarget.textContent || '')}
                        >
                          {choice}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : question.type === "file" ? (
              <div className="w-full h-full flex items-center justify-center px-24">
                <div className="w-full max-w-[700px]">
                  <div className="mb-10">
                    {question.number && (
                      <div className="mb-5 font-semibold text-lg" style={{ color: '#F5B800' }}>
                        {question.number} →
                      </div>
                    )}
                    <h2 
                      className="text-[56px] font-bold leading-[1.1] cursor-text hover:opacity-80 transition-opacity" 
                      style={{ 
                        color: '#FFFFFF', 
                        fontWeight: 700, 
                        letterSpacing: '-0.02em',
                        outline: editingField === 'file-title' ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
                        padding: '4px',
                        margin: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('file-title')}
                      onBlur={(e) => handleTitleBlur(e.currentTarget.textContent || '')}
                    >
                      {question.title}
                    </h2>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(245, 184, 0, 0.15)', color: '#F5B800' }}>
                      📎 File Upload
                    </div>
                  </div>
                  <div 
                    className="border-2 border-dashed rounded-xl p-12 text-center transition-all"
                    style={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }}
                  >
                    <div className="text-6xl mb-4">📤</div>
                    <p className="text-xl mb-2" style={{ color: '#FFFFFF' }}>
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm" style={{ color: '#A89A8A' }}>
                      {question.fileTypes?.join(', ') || 'Any file type'} • Max {question.maxFileSize || 10}MB
                    </p>
                  </div>
                </div>
              </div>
            ) : question.type === "statement" ? (
              <div className="w-full h-full flex items-center justify-center px-24">
                <div className="w-full max-w-[700px] text-center">
                  <h2 
                    className="text-[56px] font-bold mb-6 leading-[1.1] cursor-text hover:opacity-80 transition-opacity" 
                    style={{ 
                      color: '#FFFFFF', 
                      fontWeight: 700, 
                      letterSpacing: '-0.02em',
                      outline: editingField === 'statement-title' ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
                      padding: '4px',
                      margin: '-4px',
                      borderRadius: '4px'
                    }}
                    contentEditable
                    suppressContentEditableWarning
                    onFocus={() => setEditingField('statement-title')}
                    onBlur={(e) => handleTitleBlur(e.currentTarget.textContent || '')}
                  >
                    {question.title}
                  </h2>
                  {question.subtitle && (
                    <p 
                      className="text-xl mb-8 cursor-text hover:opacity-80 transition-opacity" 
                      style={{ 
                        color: '#B8A892',
                        outline: editingField === 'statement-subtitle' ? '2px solid rgba(184, 168, 146, 0.5)' : 'none',
                        padding: '4px',
                        margin: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('statement-subtitle')}
                      onBlur={(e) => handleSubtitleBlur(e.currentTarget.textContent || '')}
                    >
                      {question.subtitle}
                    </p>
                  )}
                  <button
                    onClick={onNext}
                    className="font-semibold px-8 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity"
                    style={{ 
                      backgroundColor: '#F5B800', 
                      color: '#3D3731' 
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center px-24">
                <div className="w-full max-w-[700px] text-center">
                  <h2 
                    className="text-[72px] font-bold mb-6 leading-[1.1] cursor-text hover:opacity-80 transition-opacity" 
                    style={{ 
                      color: '#F5B800', 
                      fontWeight: 700, 
                      letterSpacing: '-0.03em',
                      outline: editingField === 'ending-title' ? '2px solid rgba(245, 184, 0, 0.5)' : 'none',
                      padding: '4px',
                      margin: '-4px',
                      borderRadius: '4px'
                    }}
                    contentEditable
                    suppressContentEditableWarning
                    onFocus={() => setEditingField('ending-title')}
                    onBlur={(e) => handleTitleBlur(e.currentTarget.textContent || '')}
                  >
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
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
