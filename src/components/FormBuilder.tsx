import { useState } from "react";
import { QuestionSidebar } from "./QuestionSidebar";
import { FormPreview } from "./FormPreview";
import { SettingsPanel } from "./SettingsPanel";

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
  const [questions] = useState<Question[]>(defaultQuestions);
  const [activeQuestionId, setActiveQuestionId] = useState("welcome");

  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  return (
    <div className="flex h-screen bg-muted overflow-hidden">
      <QuestionSidebar
        questions={questions}
        activeQuestionId={activeQuestionId}
        onQuestionSelect={setActiveQuestionId}
      />
      
      <FormPreview
        question={activeQuestion}
        onNext={() => {
          const currentIndex = questions.findIndex(q => q.id === activeQuestionId);
          if (currentIndex < questions.length - 1) {
            setActiveQuestionId(questions[currentIndex + 1].id);
          }
        }}
      />
      
      <SettingsPanel question={activeQuestion} />
    </div>
  );
};
