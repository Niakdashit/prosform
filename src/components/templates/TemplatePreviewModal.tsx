import { FormTemplate } from "@/data/templates";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  Star,
  MessageSquare,
  CheckCircle,
  Mail,
  Phone,
  Hash,
  Calendar,
  Upload,
  Image,
  List,
  ToggleLeft,
  Check
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TemplatePreviewModalProps {
  template: FormTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (template: FormTemplate) => void;
}

const questionTypeIcons: Record<string, React.ReactNode> = {
  welcome: <MessageSquare className="w-4 h-4" />,
  text: <MessageSquare className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  date: <Calendar className="w-4 h-4" />,
  rating: <Star className="w-4 h-4" />,
  choice: <List className="w-4 h-4" />,
  dropdown: <List className="w-4 h-4" />,
  yesno: <ToggleLeft className="w-4 h-4" />,
  file: <Upload className="w-4 h-4" />,
  "picture-choice": <Image className="w-4 h-4" />,
  statement: <MessageSquare className="w-4 h-4" />,
  ending: <CheckCircle className="w-4 h-4" />,
};

const questionTypeLabels: Record<string, string> = {
  welcome: "Welcome Screen",
  text: "Text Input",
  email: "Email",
  phone: "Phone Number",
  number: "Number",
  date: "Date",
  rating: "Rating",
  choice: "Multiple Choice",
  dropdown: "Dropdown",
  yesno: "Yes/No",
  file: "File Upload",
  "picture-choice": "Picture Choice",
  statement: "Statement",
  ending: "Ending Screen",
};

// Typeform-style preview component
const TypeformPreview = ({ 
  template, 
  activeQuestionIndex, 
  setActiveQuestionIndex,
  onUse 
}: { 
  template: FormTemplate; 
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number | ((prev: number) => number)) => void;
  onUse: (template: FormTemplate) => void;
}) => {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const question = template.questions[activeQuestionIndex];
  const themeColor = template.backgroundColor || "#8D3B34";
  const brandName = template.brandName || "BRAND";
  const backgroundImages = template.backgroundImages || [];

  const getBackgroundImage = () => {
    if (backgroundImages.length === 0) return "";
    return backgroundImages[activeQuestionIndex % backgroundImages.length];
  };

  const handleChoiceSelect = (choice: string) => {
    if (question.variant === "checkbox") {
      setSelectedChoices(prev => 
        prev.includes(choice) ? prev.filter(c => c !== choice) : [...prev, choice]
      );
    } else {
      setSelectedChoices([choice]);
    }
  };

  const handleNext = () => {
    if (activeQuestionIndex < template.questions.length - 1) {
      setSelectedChoices([]);
      setActiveQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeQuestionIndex > 0) {
      setSelectedChoices([]);
      setActiveQuestionIndex(prev => prev - 1);
    }
  };

  // Picture choice images
  const pictureChoiceImages = [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80",
  ];

  // Welcome screen
  if (question.type === "welcome") {
    return (
      <div className="w-full h-full flex" style={{ backgroundColor: themeColor }}>
        <div className="w-1/2 h-full flex flex-col justify-between p-8">
          <div className="text-white/90 text-sm font-medium tracking-wider">
            {brandName}<sup className="text-xs">®</sup>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-light text-white leading-tight mb-6"
            >
              {question.title}
            </motion.h1>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Button
                onClick={handleNext}
                className="rounded-full px-5 py-2 text-sm font-medium"
                style={{ backgroundColor: 'white', color: themeColor }}
              >
                {question.buttonText || "Take quiz"}
                <span className="ml-2 text-xs opacity-60">press Enter ↵</span>
              </Button>
            </motion.div>
          </div>
          <div className="text-white/60 text-xs">Takes 15 sec</div>
        </div>
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

  // Picture choice
  if (question.type === "picture-choice") {
    return (
      <div className="w-full h-full flex flex-col" style={{ backgroundColor: themeColor }}>
        <div className="p-4 text-white/90 text-sm font-medium tracking-wider">
          {brandName}<sup className="text-xs">®</sup>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <motion.h2
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-light text-white text-center mb-8"
          >
            {question.title}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 justify-center flex-wrap"
          >
            {(question.choices || []).map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoiceSelect(choice)}
                className={`relative overflow-hidden rounded-lg transition-all ${
                  selectedChoices.includes(choice) ? 'ring-2 ring-white' : 'hover:scale-105'
                }`}
                style={{ width: '120px' }}
              >
                <img
                  src={pictureChoiceImages[index % pictureChoiceImages.length]}
                  alt={choice}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  {choice}
                </div>
                {selectedChoices.includes(choice) && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" style={{ color: themeColor }} />
                  </div>
                )}
              </button>
            ))}
          </motion.div>
          {selectedChoices.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <Button onClick={handleNext} className="rounded px-4 py-1.5 text-sm" style={{ backgroundColor: 'white', color: themeColor }}>
                OK
              </Button>
            </motion.div>
          )}
        </div>
        <div className="p-4 flex justify-end items-center gap-2">
          <button onClick={handlePrev} disabled={activeQuestionIndex === 0} className="w-6 h-6 rounded flex items-center justify-center bg-white/20 hover:bg-white/30 disabled:opacity-30">
            <ChevronUp className="w-3 h-3 text-white" />
          </button>
          <button onClick={handleNext} className="w-6 h-6 rounded flex items-center justify-center bg-white/20 hover:bg-white/30">
            <ChevronDown className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Standard choice question - split layout
  return (
    <div className="w-full h-full flex" style={{ backgroundColor: themeColor }}>
      <div className="w-1/2 h-full relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10 text-white/90 text-sm font-medium tracking-wider">
          {brandName}<sup className="text-xs">®</sup>
        </div>
        <AnimatePresence mode="wait">
          <motion.img
            key={activeQuestionIndex}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            src={getBackgroundImage()}
            alt="Background"
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>
      <div className="w-1/2 h-full flex flex-col justify-between p-8">
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-xl font-light text-white leading-tight mb-6"
            >
              {question.title}
            </motion.h2>
          </AnimatePresence>
          {question.choices && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
              {question.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoiceSelect(choice)}
                  className={`w-full max-w-sm text-left px-3 py-2.5 rounded-md transition-all ${
                    selectedChoices.includes(choice) ? 'bg-white/30 border-white' : 'bg-white/10 hover:bg-white/20 border-transparent'
                  } border`}
                >
                  <span className="text-white text-sm">{choice}</span>
                </button>
              ))}
            </motion.div>
          )}
          {selectedChoices.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <Button onClick={handleNext} className="rounded px-4 py-1.5 text-sm" style={{ backgroundColor: 'white', color: themeColor }}>
                OK
              </Button>
            </motion.div>
          )}
        </div>
        <div className="flex justify-end items-center gap-2">
          <button onClick={handlePrev} disabled={activeQuestionIndex === 0} className="w-6 h-6 rounded flex items-center justify-center bg-white/20 hover:bg-white/30 disabled:opacity-30">
            <ChevronUp className="w-3 h-3 text-white" />
          </button>
          <button onClick={handleNext} className="w-6 h-6 rounded flex items-center justify-center bg-white/20 hover:bg-white/30">
            <ChevronDown className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const TemplatePreviewModal = ({ 
  template, 
  isOpen, 
  onClose, 
  onUse 
}: TemplatePreviewModalProps) => {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  if (!template) return null;

  const activeQuestion = template.questions[activeQuestionIndex];
  const isTypeformStyle = template.layoutStyle === "typeform";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left Panel - Question List */}
          <div className="w-72 border-r border-border bg-muted/30 flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold text-lg text-foreground">{template.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {template.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setActiveQuestionIndex(index)}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-all ${
                      activeQuestionIndex === index
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${
                        activeQuestionIndex === index 
                          ? 'bg-primary-foreground/20' 
                          : 'bg-muted'
                      }`}>
                        {questionTypeIcons[question.type] || <MessageSquare className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium opacity-70">
                          {questionTypeLabels[question.type] || question.type}
                        </p>
                        <p className="text-sm font-medium truncate">
                          {question.title}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <Button 
                className="w-full" 
                onClick={() => onUse(template)}
              >
                Use This Template
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 flex flex-col">
            <DialogHeader className="p-4 border-b border-border flex-row items-center justify-between">
              <DialogTitle className="text-base font-medium">
                Preview: {questionTypeLabels[activeQuestion.type]}
              </DialogTitle>
            </DialogHeader>

            {/* Preview Area */}
            {isTypeformStyle ? (
              <div className="flex-1 overflow-hidden">
                <TypeformPreview 
                  template={template}
                  activeQuestionIndex={activeQuestionIndex}
                  setActiveQuestionIndex={setActiveQuestionIndex}
                  onUse={onUse}
                />
              </div>
            ) : (
              <div 
                className="flex-1 flex items-center justify-center p-8"
                style={{ backgroundColor: template.backgroundColor }}
              >
                <div 
                  className="w-full max-w-xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl"
                  style={{ color: template.color }}
                >
                  {activeQuestion.number && (
                    <div className="flex items-center gap-2 mb-4">
                      <span 
                        className="text-sm font-medium px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${template.color}20` }}
                      >
                        {activeQuestion.number}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-3">{activeQuestion.title}</h3>
                  {activeQuestion.subtitle && (
                    <p className="text-lg opacity-80 mb-6">{activeQuestion.subtitle}</p>
                  )}
                  <div className="mt-6">
                    {activeQuestion.type === 'welcome' || activeQuestion.type === 'ending' ? (
                      <Button 
                        className="px-8 py-3 text-base font-medium"
                        style={{ backgroundColor: template.color, color: template.backgroundColor }}
                      >
                        {activeQuestion.buttonText || 'Continue'}
                      </Button>
                    ) : activeQuestion.type === 'choice' && activeQuestion.choices ? (
                      <div className="space-y-3">
                        {activeQuestion.choices.map((choice, i) => (
                          <div 
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:scale-[1.02]"
                            style={{ borderColor: `${template.color}30`, backgroundColor: `${template.color}10` }}
                          >
                            <span className="w-6 h-6 rounded flex items-center justify-center text-sm font-medium" style={{ backgroundColor: `${template.color}20` }}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span>{choice}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-b-2 py-3 text-xl opacity-50" style={{ borderColor: `${template.color}50` }}>
                        {activeQuestion.placeholder || 'Your answer...'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation - only show for non-typeform style */}
            {!isTypeformStyle && (
              <div className="p-4 border-t border-border flex items-center justify-between bg-card">
                <Button
                  variant="outline"
                  disabled={activeQuestionIndex === 0}
                  onClick={() => setActiveQuestionIndex(prev => prev - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {activeQuestionIndex + 1} of {template.questions.length}
                </span>
                <Button
                  variant="outline"
                  disabled={activeQuestionIndex === template.questions.length - 1}
                  onClick={() => setActiveQuestionIndex(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
