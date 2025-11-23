import { motion, AnimatePresence } from "framer-motion";
import { Question } from "./FormBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, Star, Smile, Frown, Meh, Heart, ThumbsUp,
  Mail, Phone, Hash, Calendar, Video, FileText, Type,
  CheckSquare, List, CheckCircle, Image as ImageIcon,
  Paperclip, BarChart3, Upload, ChevronDown, Sparkles, Monitor, Smartphone
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
  const [variableTarget, setVariableTarget] = useState<'title' | 'subtitle' | null>(null);
  const [menuView, setMenuView] = useState<'main' | 'variables'>('main');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const availableVariables = [
    { key: 'first_name', label: 'First name', description: "User's first name" },
    { key: 'email', label: 'Email', description: "User's email address" },
    { key: 'ville', label: 'Ville', description: "Ville de l'utilisateur" },
  ];

  const insertVariable = (variableKey: string) => {
    if (!question) return;

    if (variableTarget === 'title') {
      const newTitle = (question.title || '') + `{{${variableKey}}}`;
      onUpdateQuestion(question.id, { title: newTitle });
    } else if (variableTarget === 'subtitle') {
      const newSubtitle = (question.subtitle || '') + `{{${variableKey}}}`;
      onUpdateQuestion(question.id, { subtitle: newSubtitle });
    }

    setShowVariableMenu(false);
    setMenuView('main');
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

  // Fonction pour obtenir les dimensions du conteneur selon le mode
  const getContainerDimensions = () => {
    if (viewMode === 'mobile') {
      return { width: '375px', height: '667px', borderRadius: '36px' }; // iPhone format
    }
    return { width: '1100px', height: '620px', borderRadius: '0' }; // Desktop format
  };

  // Fonction pour obtenir le layout exact comme dans l'icône
  const getLayoutClasses = () => {
    const layout = viewMode === 'mobile' ? question?.mobileLayout : question?.desktopLayout;
    const isMobile = viewMode === 'mobile';
    
    if (!layout) {
      return isMobile ? 'flex flex-col justify-center p-8' : 'flex items-center justify-center px-24';
    }

    // WELCOME SCREEN LAYOUTS
    if (question?.type === 'welcome') {
      if (isMobile) {
        switch (layout) {
          case 'mobile-vertical': // Stack vertical
            return 'flex flex-col justify-center p-8';
          case 'mobile-horizontal': // Split horizontal  
            return 'grid grid-cols-2 gap-4 items-center p-6';
          case 'mobile-centered': // Centered
            return 'flex flex-col justify-center items-center text-center p-8';
          case 'mobile-minimal': // Minimal
            return 'flex flex-col justify-center p-12';
          case 'mobile-hero': // Hero avec grande image en haut
            return 'flex flex-col p-6';
          default:
            return 'flex flex-col justify-center p-8';
        }
      } else {
        switch (layout) {
          case 'desktop-left-right': // Image gauche, texte droite
            return 'grid grid-cols-[1fr_1.2fr] gap-16 items-center p-12';
          case 'desktop-right-left': // Texte gauche, image droite
            return 'grid grid-cols-[1.2fr_1fr] gap-16 items-center p-12';
          case 'desktop-centered': // Centré
            return 'flex flex-col justify-center items-center text-center p-16 max-w-3xl mx-auto';
          case 'desktop-split': // Wallpaper (50/50)
            return 'grid grid-cols-[1fr_1fr] gap-16 items-center p-12';
          case 'desktop-fullscreen': // Fullscreen
            return 'flex flex-col justify-center items-center text-center';
          default:
            return 'grid grid-cols-[1fr_1fr] gap-16 items-center p-12';
        }
      }
    }

    // TEXT/INPUT LAYOUTS
    if (['text', 'email', 'phone', 'number', 'date'].includes(question?.type || '')) {
      if (isMobile) {
        switch (layout) {
          case 'mobile-vertical':
            return 'flex flex-col justify-center p-8';
          case 'mobile-centered':
            return 'flex flex-col justify-center items-center p-8';
          case 'mobile-minimal':
            return 'flex flex-col justify-center p-12';
          case 'mobile-fullwidth':
            return 'flex flex-col justify-center p-6';
          default:
            return 'flex flex-col justify-center p-8';
        }
      } else {
        switch (layout) {
          case 'desktop-centered':
            return 'flex justify-center items-center px-24';
          case 'desktop-narrow':
            return 'flex justify-center items-center px-32';
          case 'desktop-wide':
            return 'flex justify-center items-center px-16';
          case 'desktop-minimal':
            return 'flex justify-center items-center px-40';
          case 'desktop-left-right':
            return 'grid grid-cols-2 gap-16 items-center px-12';
          default:
            return 'flex justify-center items-center px-24';
        }
      }
    }

    // CHOICE LAYOUTS
    if (['choice', 'picture-choice'].includes(question?.type || '')) {
      if (isMobile) {
        switch (layout) {
          case 'mobile-vertical':
            return 'flex flex-col p-8';
          case 'mobile-grid':
            return 'grid grid-cols-2 gap-3 p-8';
          case 'mobile-cards':
            return 'flex flex-col gap-3 p-8';
          default:
            return 'flex flex-col p-8';
        }
      } else {
        switch (layout) {
          case 'desktop-left-right':
            return 'grid grid-cols-2 gap-16 px-12';
          case 'desktop-columns':
            return 'grid grid-cols-2 gap-8 px-12';
          case 'desktop-grid':
            return 'grid grid-cols-3 gap-6 px-12';
          case 'desktop-centered':
            return 'flex justify-center items-center px-24';
          default:
            return 'flex justify-center items-center px-24';
        }
      }
    }

    return isMobile ? 'flex flex-col justify-center p-8' : 'flex justify-center items-center px-24';
  };

  const getMaxWidth = () => {
    if (viewMode === 'mobile') return '100%';
    
    const layout = question?.desktopLayout;
    switch (layout) {
      case 'desktop-narrow': return '500px';
      case 'desktop-wide': return '900px';
      case 'desktop-minimal': return '450px';
      default: return '700px';
    }
  };

  const containerDimensions = getContainerDimensions();
  const layoutClasses = getLayoutClasses();

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-100">
      {/* Boutons de switch Mobile/Desktop */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-white rounded-lg p-1 shadow-lg">
        <button
          onClick={() => setViewMode('desktop')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            viewMode === 'desktop' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
          }`}
        >
          <Monitor className="w-4 h-4" />
          Desktop
        </button>
        <button
          onClick={() => setViewMode('mobile')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            viewMode === 'mobile' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Mobile
        </button>
      </div>

      <div 
        className="relative overflow-hidden transition-all duration-300 shadow-2xl" 
        style={{ 
          backgroundColor: '#3D3731', 
          width: containerDimensions.width, 
          height: containerDimensions.height,
          borderRadius: containerDimensions.borderRadius
        }}
      >
        {/* Logo */}
        <div className="absolute top-8 left-8 z-10">
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
              <div className={`w-full h-full ${layoutClasses}`}>
                <div className="flex flex-col gap-4">
                  {question.image && (
                    <img
                      src={question.image}
                      alt="Welcome Image"
                      className="w-full object-cover rounded-md"
                      style={{ maxHeight: '200px' }}
                    />
                  )}
                  <div>
                    <h2
                      className="text-3xl font-bold text-white break-words"
                      onClick={() => {
                        setEditingField('title');
                        setVariableTarget('title');
                      }}
                    >
                      {editingField === 'title' ? (
                        <Input
                          className="text-3xl font-bold"
                          defaultValue={question.title}
                          onBlur={(e) => handleTitleBlur(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                        />
                      ) : (
                        replaceVariables(question.title || "Welcome")
                      )}
                    </h2>
                    <p
                      className="text-gray-300 mt-2 break-words"
                      onClick={() => {
                        setEditingField('subtitle');
                        setVariableTarget('subtitle');
                      }}
                    >
                      {editingField === 'subtitle' ? (
                        <Textarea
                          className="text-gray-300 mt-2"
                          defaultValue={question.subtitle}
                          onBlur={(e) => handleSubtitleBlur(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                        />
                      ) : (
                        replaceVariables(question.subtitle || "This is a welcome screen. Customize it to your liking.")
                      )}
                    </p>
                  </div>
                  <Button onClick={onNext}>Get Started</Button>
                </div>
              </div>
            ) : question.type === "text" ? (
              <div className={`w-full h-full ${layoutClasses}`} style={{ maxWidth: getMaxWidth() }}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                  <label className="text-white text-sm">{replaceVariables(question.title || "Your question here")}</label>
                  <Input
                    type="text"
                    placeholder="Your answer"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full"
                  />
                  <Button type="submit">Next</Button>
                </form>
              </div>
            ) : question.type === "email" ? (
              <div className={`w-full h-full ${layoutClasses}`} style={{ maxWidth: getMaxWidth() }}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                  <label className="text-white text-sm">{replaceVariables(question.title || "Your question here")}</label>
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full"
                  />
                  <Button type="submit">Next</Button>
                </form>
              </div>
            ) : question.type === "phone" ? (
              <div className={`w-full h-full ${layoutClasses}`} style={{ maxWidth: getMaxWidth() }}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                  <label className="text-white text-sm">{replaceVariables(question.title || "Your question here")}</label>
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={showCountryDropdown}
                          className="w-[120px] justify-start text-left font-normal"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        >
                          <img
                            src={`https://flagcdn.com/w20/${selectedCountry.toLowerCase()}.png`}
                            alt={selectedCountry}
                            width={20}
                            height={20}
                            className="mr-2 rounded-sm object-cover"
                          />
                          <span>{PHONE_COUNTRIES.find(country => country.code === selectedCountry)?.dialCode}</span>
                          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        {PHONE_COUNTRIES.map((country) => (
                          <div
                            key={country.code}
                            className="flex items-center space-x-2 p-2 hover:bg-secondary cursor-pointer"
                            onClick={() => {
                              setSelectedCountry(country.code);
                              onUpdateQuestion(question.id, { phoneCountry: country.code });
                              setShowCountryDropdown(false);
                            }}
                          >
                            <img
                              src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                              alt={country.code}
                              width={20}
                              height={20}
                              className="rounded-sm object-cover"
                            />
                            <span>{country.name} ({country.dialCode})</span>
                          </div>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="tel"
                      placeholder="Your phone number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button type="submit">Next</Button>
                </form>
              </div>
            ) : question.type === "number" ? (
              <div className={`w-full h-full ${layoutClasses}`} style={{ maxWidth: getMaxWidth() }}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                  <label className="text-white text-sm">{replaceVariables(question.title || "Your question here")}</label>
                  <Input
                    type="number"
                    placeholder="Your answer"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full"
                  />
                  <Button type="submit">Next</Button>
                </form>
              </div>
            ) : question.type === "date" ? (
              <div className={`w-full h-full ${layoutClasses}`} style={{ maxWidth: getMaxWidth() }}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                  <label className="text-white text-sm">{replaceVariables(question.title || "Your question here")}</label>
                  <Input
                    type="date"
                    placeholder="Your answer"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full"
                  />
                  <Button type="submit">Next</Button>
                </form>
              </div>
            ) : question.type === "choice" ? (
              <div className={`w-full h-full ${layoutClasses}`} style={{ maxWidth: getMaxWidth() }}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                  <label className="text-white text-sm">{replaceVariables(question.title || "Choose an option")}</label>
                  <div className="flex flex-col gap-2">
                    {question.choices?.map((choice, index) => (
                      <label key={index} className="flex items-center space-x-2 text-white">
                        <input
                          type="radio"
                          name="choice"
                          value={choice}
                          onChange={(e) => setInputValue(e.target.value)}
                        />
                        {editingChoiceIndex === index ? (
                          <Input
                            type="text"
                            defaultValue={choice}
                            onBlur={(e) => handleChoiceBlur(index, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                          />
                        ) : (
                          <span onClick={() => setEditingChoiceIndex(index)}>{choice}</span>
                        )}
                      </label>
                    ))}
                  </div>
                  <Button type="submit">Next</Button>
                </form>
              </div>
            ) : question.type === "picture-choice" ? (
              <div className={`w-full h-full ${layoutClasses}`} style={{ maxWidth: getMaxWidth() }}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                  <label className="text-white text-sm">{replaceVariables(question.title || "Choose a picture")}</label>
                  <div className="grid grid-cols-2 gap-4">
                    {question.choices?.map((choice, index) => (
                      <label key={index} className="flex flex-col items-center space-x-2 text-white">
                        <input
                          type="radio"
                          name="choice"
                          value={choice}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="hidden"
                        />
                        <img
                          src={choice}
                          alt={`Choice ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                  <Button type="submit">Next</Button>
                </form>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
