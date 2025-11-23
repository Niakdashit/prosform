import { motion, AnimatePresence } from "framer-motion";
import { Question } from "./FormBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, Star, Smile, Frown, Meh, Heart, ThumbsUp,
  Mail, Phone, Hash, Calendar, Video, FileText, Type,
  CheckSquare, List, CheckCircle, Image as ImageIcon,
  Paperclip, BarChart3, Upload, ChevronDown, Sparkles
} from "lucide-react";
import { useState, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PHONE_COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
];

interface FormPreviewProps {
  question?: Question;
  onNext: () => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
}

export const FormPreview = ({ question, onNext, onUpdateQuestion }: FormPreviewProps) => {
  const [inputValue, setInputValue] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingChoiceIndex, setEditingChoiceIndex] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(question?.phoneCountry || 'US');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [formResponses, setFormResponses] = useState<Record<string, string>>({});
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const availableVariables = [
    { key: 'first_name', label: 'First name', description: 'User\'s first name' },
    { key: 'email', label: 'Email', description: 'User\'s email address' },
    { key: 'phone', label: 'Phone', description: 'User\'s phone number' },
  ];

  const insertVariable = (variableKey: string) => {
    const activeElement = document.activeElement as HTMLElement;
    const isTitle = activeElement === titleRef.current;
    const isSubtitle = activeElement === subtitleRef.current;
    
    if (isTitle && question) {
      const newTitle = (question.title || '') + `{{${variableKey}}}`;
      onUpdateQuestion(question.id, { title: newTitle });
    } else if (isSubtitle && question) {
      const newSubtitle = (question.subtitle || '') + `{{${variableKey}}}`;
      onUpdateQuestion(question.id, { subtitle: newSubtitle });
    }
    
    setShowVariableMenu(false);
  };

  const replaceVariables = (text: string): string => {
    if (!text) return text;
    let result = text;
    Object.entries(formResponses).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    });
    return result;
  };

  if (!question) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store response for variable replacement
    if (question && inputValue.trim()) {
      const responseKey = question.title.toLowerCase().includes('name') ? 'first_name' : 
                          question.title.toLowerCase().includes('email') ? 'email' :
                          question.id;
      setFormResponses(prev => ({
        ...prev,
        [responseKey]: inputValue.trim()
      }));
    }
    
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
                <div className="w-full h-full grid grid-cols-[1fr_1fr] gap-16 items-center px-12 relative">
                  {(editingField === 'welcome-title' || editingField === 'welcome-subtitle') && (
                    <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowVariableMenu(!showVariableMenu)}
                          className="absolute -top-2 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2" 
                        align="end"
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
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
                      <span>{question.buttonText || "Start"}</span>
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
                <div className="w-full max-w-[700px] relative">
                  {editingField === 'text-title' && (
                    <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowVariableMenu(!showVariableMenu)}
                          className="absolute -top-2 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2" 
                        align="end"
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
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
                        {question.type === 'email' && <><Mail className="w-4 h-4" /><span>Email</span></>}
                        {question.type === 'phone' && <><Phone className="w-4 h-4" /><span>Phone</span></>}
                        {question.type === 'number' && <><Hash className="w-4 h-4" /><span>Number</span></>}
                        {question.type === 'date' && <><Calendar className="w-4 h-4" /><span>Date</span></>}
                        {question.type === 'text' && question.variant === 'video' && <><Video className="w-4 h-4" /><span>Video/Audio</span></>}
                        {question.type === 'text' && question.variant === 'long' && <><FileText className="w-4 h-4" /><span>Long Text</span></>}
                        {question.type === 'text' && question.variant === 'short' && <><Type className="w-4 h-4" /><span>Short Text</span></>}
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSubmit}>
                    {question.variant === 'long' ? (
                      <>
                        <Textarea
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={question.placeholder || "Type your answer here..."}
                          className="bg-transparent border-0 border-b-2 rounded-none text-2xl px-0 py-5 min-h-[200px] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#F5B800] placeholder:text-[#8B7E6E] resize-none transition-colors"
                          style={{ 
                            borderColor: '#F5B800',
                            color: '#F5B800'
                          }}
                          autoFocus
                        />
                        <div className="mt-2 text-sm" style={{ color: '#8B7E6E' }}>
                          <kbd className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#A89A8A' }}>Shift</kbd>
                          {' '}+ <kbd className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#A89A8A' }}>Enter</kbd>
                          {' '}to make a line break
                        </div>
                      </>
                    ) : question.type === 'phone' ? (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              color: '#F5B800'
                            }}
                          >
                            <span className="text-2xl">{PHONE_COUNTRIES.find(c => c.code === selectedCountry)?.flag}</span>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          
                          {showCountryDropdown && (
                            <div 
                              className="absolute top-full left-0 mt-2 rounded-lg overflow-hidden z-10 max-h-[300px] overflow-y-auto"
                              style={{ 
                                backgroundColor: '#4A4138',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                minWidth: '250px'
                              }}
                            >
                              {PHONE_COUNTRIES.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(country.code);
                                    setShowCountryDropdown(false);
                                    if (question) {
                                      onUpdateQuestion(question.id, { phoneCountry: country.code });
                                    }
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-opacity-10 hover:bg-white transition-colors text-left"
                                  style={{ color: '#F5B800' }}
                                >
                                  <span className="text-xl">{country.flag}</span>
                                  <span className="flex-1">{country.name}</span>
                                  <span className="text-sm opacity-70">{country.dialCode}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          type="tel"
                          placeholder={question.placeholder || PHONE_COUNTRIES.find(c => c.code === selectedCountry)?.dialCode + ' (555) 000-0000'}
                          className="flex-1 bg-transparent border-0 border-b-2 rounded-none text-2xl px-0 py-5 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#F5B800] placeholder:text-[#8B7E6E] transition-colors"
                          style={{ 
                            borderColor: '#F5B800',
                            color: '#F5B800'
                          }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        type={
                          question.type === 'email' ? 'email' :
                          question.type === 'number' ? 'number' :
                          question.type === 'date' ? 'date' :
                          question.variant === 'number' ? 'number' : 
                          question.variant === 'date' ? 'date' : 
                          'text'
                        }
                        placeholder={
                          question.placeholder || (
                            question.type === 'email' ? 'name@example.com' :
                            question.type === 'number' ? 'Enter a number...' :
                            question.type === 'date' ? 'Select a date...' :
                            question.variant === 'number' ? 'Enter a number...' :
                            question.variant === 'date' ? 'Select a date...' :
                            question.variant === 'video' ? 'Upload video/audio or paste link...' :
                            'Type your answer here...'
                          )
                        }
                        className="bg-transparent border-0 border-b-2 rounded-none text-2xl px-0 py-5 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#F5B800] placeholder:text-[#8B7E6E] transition-colors"
                        style={{ 
                          borderColor: '#F5B800',
                          color: '#F5B800'
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
                <div className="w-full max-w-[700px] relative">
                  {editingField === 'rating-title' && (
                    <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowVariableMenu(!showVariableMenu)}
                          className="absolute -top-2 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2" 
                        align="end"
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
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
                        {question.variant === 'stars' && <><Star className="w-4 h-4" /><span>Rating</span></>}
                        {question.variant === 'scale' && <><BarChart3 className="w-4 h-4" /><span>Opinion Scale</span></>}
                        {question.variant === 'ranking' && <><Hash className="w-4 h-4" /><span>Ranking</span></>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    {Array.from({ length: question.ratingCount || 5 }, (_, i) => i + 1).map((rating) => {
                      const getRatingIcon = () => {
                        const iconProps = {
                          size: 32,
                          fill: '#F5B800',
                          color: '#F5B800',
                          strokeWidth: 2
                        };

                        switch (question.ratingType) {
                          case 'smileys':
                            if (rating === 1) return <Frown {...iconProps} />;
                            if (rating === 2) return <Frown {...iconProps} fill="none" />;
                            if (rating === 3) return <Meh {...iconProps} />;
                            if (rating === 4) return <Smile {...iconProps} fill="none" />;
                            return <Smile {...iconProps} />;
                          case 'hearts':
                            return <Heart {...iconProps} />;
                          case 'thumbs':
                            return <ThumbsUp {...iconProps} />;
                          case 'numbers':
                            return <span className="text-2xl font-bold">{rating}</span>;
                          case 'stars':
                          default:
                            return <Star {...iconProps} />;
                        }
                      };

                      return (
                        <div
                          key={rating}
                          className="w-20 h-20 rounded-xl transition-all flex items-center justify-center font-semibold cursor-default"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#FFFFFF'
                          }}
                        >
                          {getRatingIcon()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : question.type === "choice" || question.type === "dropdown" || question.type === "yesno" || question.type === "picture-choice" ? (
              <div className="w-full h-full flex items-center justify-center px-24">
                <div className="w-full max-w-[700px] relative">
                  {editingField === 'choice-title' && (
                    <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowVariableMenu(!showVariableMenu)}
                          className="absolute -top-2 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2" 
                        align="end"
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
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
                      {question.type === 'dropdown' && <><List className="w-4 h-4" /><span>Dropdown</span></>}
                      {question.type === 'yesno' && <><CheckCircle className="w-4 h-4" /><span>Yes/No</span></>}
                      {question.type === 'picture-choice' && <><ImageIcon className="w-4 h-4" /><span>Picture Choice</span></>}
                      {question.type === 'choice' && question.variant === 'multiple' && <><CheckSquare className="w-4 h-4" /><span>Multiple Choice</span></>}
                      {question.type === 'choice' && question.variant === 'checkbox' && <><CheckSquare className="w-4 h-4" /><span>Checkbox</span></>}
                      {question.type === 'choice' && !question.variant && <><CheckSquare className="w-4 h-4" /><span>Multiple Choice</span></>}
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
                <div className="w-full max-w-[700px] relative">
                  {editingField === 'file-title' && (
                    <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowVariableMenu(!showVariableMenu)}
                          className="absolute -top-2 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2" 
                        align="end"
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
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
                      <Paperclip className="w-4 h-4" />
                      <span>File Upload</span>
                    </div>
                  </div>
                  <div 
                    className="border-2 border-dashed rounded-xl p-12 text-center transition-all"
                    style={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }}
                  >
                    <Upload className="w-16 h-16 mx-auto mb-4" style={{ color: '#F5B800' }} />
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
                <div className="w-full max-w-[700px] text-center relative">
                  {(editingField === 'statement-title' || editingField === 'statement-subtitle') && (
                    <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowVariableMenu(!showVariableMenu)}
                          className="absolute -top-2 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2 z-50" 
                        align="end"
                        side="bottom"
                        sideOffset={8}
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  <h2
                    ref={titleRef}
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
                      ref={subtitleRef}
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
                    {question.buttonText || "Continue"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center px-24">
                <div className="w-full max-w-[700px] text-center relative">
                  {(editingField === 'ending-title' || editingField === 'ending-subtitle') && (
                    <Popover open={showVariableMenu} onOpenChange={setShowVariableMenu}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Variable button clicked, current state:', showVariableMenu);
                            setShowVariableMenu(!showVariableMenu);
                          }}
                          className="absolute -top-2 right-0 w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center z-50"
                          style={{ 
                            backgroundColor: 'rgba(245, 184, 0, 0.15)',
                            color: '#F5B800',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72 p-2 z-50" 
                        align="end"
                        side="bottom"
                        sideOffset={8}
                        style={{
                          backgroundColor: '#4A4138',
                          border: '1px solid rgba(245, 184, 0, 0.3)',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="space-y-1">
                          {availableVariables.map((variable) => (
                            <button
                              key={variable.key}
                              onClick={() => insertVariable(variable.key)}
                              className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
                            >
                              <div className="font-medium text-sm" style={{ color: '#F5B800' }}>
                                {variable.label}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#A89A8A' }}>
                                {variable.description} • {`{{${variable.key}}}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

                  <h2 
                    ref={titleRef}
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
                    {editingField === 'ending-title' ? question.title : replaceVariables(question.title)}
                  </h2>
                  {question.subtitle && (
                    <p 
                      ref={subtitleRef}
                      className="text-xl mb-10 cursor-text hover:opacity-80 transition-opacity" 
                      style={{ 
                        color: '#C4B5A0',
                        outline: editingField === 'ending-subtitle' ? '2px solid rgba(196, 181, 160, 0.5)' : 'none',
                        padding: '4px',
                        margin: '-4px',
                        borderRadius: '4px'
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingField('ending-subtitle')}
                      onBlur={(e) => handleSubtitleBlur(e.currentTarget.textContent || '')}
                    >
                      {editingField === 'ending-subtitle' ? question.subtitle : replaceVariables(question.subtitle)}
                    </p>
                  )}
                  <Button
                    onClick={() => window.location.reload()}
                    className="font-semibold px-8 py-3 h-[52px] rounded-lg text-base hover:opacity-90 transition-opacity"
                    style={{ 
                      backgroundColor: '#F5B800', 
                      color: '#3D3731' 
                    }}
                  >
                    {question.buttonText || "Start over"}
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
