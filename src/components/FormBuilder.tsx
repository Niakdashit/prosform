import { useState } from "react";
import { QuestionSidebar } from "./QuestionSidebar";
import { FormPreview } from "./FormPreview";
import { SettingsPanel } from "./SettingsPanel";
import { TopToolbar } from "./TopToolbar";
import { AddContentModal } from "./AddContentModal";

export interface Question {
  id: string;
  type: "welcome" | "text" | "rating" | "choice" | "ending";
  title: string;
  subtitle?: string;
  icon?: string;
  number?: number;
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
    number: 2
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
    number: 4
  },
  {
    id: "q5",
    type: "choice",
    title: "Do you feel supported by the...",
    icon: "chart",
    number: 5
  },
  {
    id: "q6",
    type: "choice",
    title: "Does leadership clearly...",
    icon: "target",
    number: 6
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
    // Map element types to question types
    const typeMap: { [key: string]: Question["type"] } = {
      "short-text": "text",
      "long-text": "text",
      "multiple-choice": "choice",
      "dropdown": "choice",
      "yes-no": "choice",
      "rating": "rating",
      "opinion-scale": "rating",
      "ranking": "rating",
    };

    const questionType = typeMap[elementType] || "text";
    
    // Update the active question's type
    if (activeQuestion) {
      updateQuestion(activeQuestion.id, { type: questionType });
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
