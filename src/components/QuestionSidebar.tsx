import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Question } from "./FormBuilder";
import { User, Building2, Star, CheckCircle, BarChart3, Target, MessageSquare, Smile, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionSidebarProps {
  questions: Question[];
  activeQuestionId: string;
  onQuestionSelect: (id: string) => void;
}

const iconMap: Record<string, any> = {
  user: User,
  building: Building2,
  star: Star,
  check: CheckCircle,
  chart: BarChart3,
  target: Target,
  message: MessageSquare,
  greeting: Smile,
};

export const QuestionSidebar = ({
  questions,
  activeQuestionId,
  onQuestionSelect,
}: QuestionSidebarProps) => {
  return (
    <div className="w-[200px] bg-background border-r border-border flex flex-col">
      {/* Header avec breadcrumb */}
      <div className="px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
          </svg>
          <span>Forms</span>
          <span>›</span>
          <span className="truncate">Employer Feedback Form (co...</span>
        </div>
      </div>

      {/* Universal mode dropdown */}
      <div className="px-3 py-3 bg-muted/30">
        <button className="w-full flex items-center justify-between text-xs hover:bg-muted/50 px-2 py-1.5 rounded">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Universal mode</span>
          </div>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-1.5">
          {/* Titre du formulaire */}
          <div className="px-2 py-2 mb-1 flex items-center gap-2">
            <div className="w-7 h-7 bg-muted rounded flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-foreground/20 rounded-sm" />
            </div>
            <span className="text-[11px] font-medium text-foreground">How are we doing?</span>
          </div>

          {/* Questions */}
          {questions.map((question, index) => {
            const Icon = iconMap[question.icon || "message"];
            const isActive = question.id === activeQuestionId;
            
            // Déterminer la couleur de fond selon le type et l'index
            let bgColor = "bg-gray-200 text-gray-700";
            if (question.type === "welcome") bgColor = "bg-pink-200/50 text-pink-700";
            else if (question.type === "text" && question.number === 1) bgColor = "bg-pink-200/50 text-pink-700";
            else if (question.type === "choice" && question.number === 2) bgColor = "bg-purple-200/50 text-purple-700";
            else if (question.type === "rating" && question.number === 3) bgColor = "bg-green-200/50 text-green-700";
            else if (question.type === "choice" && question.number === 4) bgColor = "bg-purple-200/50 text-purple-700";
            else if (question.type === "choice" && question.number === 5) bgColor = "bg-green-200/50 text-green-700";
            else if (question.type === "choice" && question.number === 6) bgColor = "bg-purple-200/50 text-purple-700";
            else if (question.type === "text" && question.number === 7) bgColor = "bg-blue-200/50 text-blue-700";
            else if (question.type === "ending") bgColor = "bg-gray-200 text-gray-700";

            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(question.id)}
                className={cn(
                  "w-full px-2 py-2 rounded mb-0.5 flex items-start gap-2.5 transition-colors",
                  "hover:bg-muted/50",
                  isActive && "bg-muted"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-[11px] font-semibold",
                  bgColor
                )}>
                  {question.type === "ending" ? (
                    <span className="font-bold">A</span>
                  ) : question.number ? (
                    <span>{question.number}</span>
                  ) : (
                    Icon && <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[11px] text-foreground line-clamp-2 leading-[1.5]">
                    {question.title}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Séparateur + Section Endings */}
          <div className="mt-3 pt-2 border-t border-border px-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-foreground">Endings</span>
              <button className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
