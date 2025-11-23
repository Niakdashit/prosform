import { useState } from "react";
import { QuestionSidebar } from "./QuestionSidebar";
import { FormPreview } from "./FormPreview";
import { SettingsPanel } from "./SettingsPanel";
import { TopToolbar } from "./TopToolbar";
import { AddContentModal } from "./AddContentModal";
import { toast } from "sonner";

export interface Question {
  id: string;
  type: "welcome" | "text" | "rating" | "choice" | "ending";
  title: string;
  subtitle?: string;
  icon?: string;
  number?: number;
  variant?: string; // Pour distinguer short-text, long-text, video, etc.
  choices?: string[]; // Pour les questions à choix multiples
}

const defaultQuestions: Question[] = [
  {
    id: "welcome",
    type: "welcome",
    title: "How are we doing?",
    subtitle: "Your feedback helps us build an even better place to work.",
    icon: "greeting"
  },
  {
    id: "q1",
    type: "text",
    title: "First, what's your full name?",
    icon: "user",
    number: 1
  },
  {
    id: "q2",
    type: "choice",
    title: "Thanks, ___. Which department do you...",
    icon: "building",
    number: 2,
    choices: ["Marketing", "Sales", "Engineering", "Other"]
  },
  {
    id: "q3",
    type: "rating",
    title: "How do you rate the company...",
    icon: "star",
    number: 3
  },
  {
    id: "q4",
    type: "choice",
    title: "Do you feel valued?",
    icon: "check",
    number: 4,
    choices: ["Yes", "No", "Sometimes"]
  },
  {
    id: "q5",
    type: "choice",
    title: "Do you feel supported by the...",
    icon: "chart",
    number: 5,
    choices: ["Yes", "No", "Sometimes"]
  },
  {
    id: "q6",
    type: "choice",
    title: "Does leadership clearly...",
    icon: "target",
    number: 6,
    choices: ["Yes", "No", "Sometimes"]
  },
  {
    id: "q7",
    type: "text",
    title: "Great! Is there anything we coul...",
    icon: "message",
    number: 7
  },
  {
    id: "ending",
    type: "ending",
    title: "Thanks for your feedback, ___!",
    icon: "check"
  }
];

export const FormBuilder = () => {
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [activeQuestionId, setActiveQuestionId] = useState("welcome");
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);

  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const handleAddElement = (elementType: string) => {
    // Map element types to question types and variants
    const typeMap: { [key: string]: { type: Question["type"], variant?: string } } = {
      "short-text": { type: "text", variant: "short" },
      "long-text": { type: "text", variant: "long" },
      "multiple-choice": { type: "choice", variant: "multiple" },
      "dropdown": { type: "choice", variant: "dropdown" },
      "yes-no": { type: "choice", variant: "yesno" },
      "rating": { type: "rating", variant: "stars" },
      "opinion-scale": { type: "rating", variant: "scale" },
      "ranking": { type: "rating", variant: "ranking" },
      "number": { type: "text", variant: "number" },
      "date": { type: "text", variant: "date" },
      "checkbox": { type: "choice", variant: "checkbox" },
      "video": { type: "text", variant: "video" },
    };

    const mapping = typeMap[elementType] || { type: "text", variant: "short" };
    
    // Update the active question's type
    if (activeQuestion) {
      if (activeQuestion.type === "welcome" || activeQuestion.type === "ending") {
        toast.error("Cannot change Welcome or Ending screen type");
        return;
      }
      updateQuestion(activeQuestion.id, { 
        type: mapping.type,
        variant: mapping.variant 
      });
      toast.success(`Changed to ${elementType.replace('-', ' ')}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted overflow-hidden">
      <TopToolbar onAddContent={() => setIsAddContentModalOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <QuestionSidebar
          questions={questions}
          activeQuestionId={activeQuestionId}
          onQuestionSelect={setActiveQuestionId}
        />
        
        <FormPreview
          question={activeQuestion}
          onUpdateQuestion={updateQuestion}
          onNext={() => {
            const currentIndex = questions.findIndex(q => q.id === activeQuestionId);
            if (currentIndex < questions.length - 1) {
              setActiveQuestionId(questions[currentIndex + 1].id);
            }
          }}
        />
        
        <SettingsPanel question={activeQuestion} />
      </div>

      <AddContentModal
        isOpen={isAddContentModalOpen}
        onClose={() => setIsAddContentModalOpen(false)}
        onSelectElement={handleAddElement}
      />
    </div>
  );
};
