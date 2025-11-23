import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Question } from "./FormBuilder";
import { User, Building2, Star, CheckCircle, BarChart3, Target, MessageSquare, Smile, Plus } from "lucide-react";
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
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
            </svg>
            Forms
          </span>
          <span>›</span>
          <span className="truncate">Employer Feedback Form (co...</span>
        </div>
      </div>
      
      {/* Universal mode + titre */}
      <div className="p-2.5 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-muted rounded flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-foreground/20 rounded-sm" />
          </div>
          <h2 className="text-xs font-medium text-foreground truncate">How are we doing?</h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-1.5">
          {questions.map((question, index) => {
            const Icon = iconMap[question.icon || "message"];
            const isActive = question.id === activeQuestionId;
            
            // Skip le premier welcome pour éviter le doublon
            if (question.type === "welcome") return null;
            
            // Afficher "Endings" avant le dernier item
            const isLastItem = index === questions.length - 1;
            
            return (
              <div key={question.id}>
                {isLastItem && (
                  <div className="px-2 py-3 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Endings</span>
                      <button className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => onQuestionSelect(question.id)}
                  className={cn(
                    "w-full p-2 rounded mb-1 flex items-start gap-2.5 transition-colors",
                    "hover:bg-muted/50",
                    isActive && "bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-[11px] font-semibold",
                    question.type === "text" && "bg-pink-200/60 text-pink-700",
                    question.type === "rating" && "bg-green-200/60 text-green-700",
                    question.type === "choice" && index % 3 === 0 && "bg-purple-200/60 text-purple-700",
                    question.type === "choice" && index % 3 === 1 && "bg-green-200/60 text-green-700",
                    question.type === "choice" && index % 3 === 2 && "bg-purple-200/60 text-purple-700",
                    question.type === "ending" && "bg-gray-200 text-gray-700"
                  )}>
                    {question.type === "ending" ? (
                      <span>A</span>
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
              </div>
            );
          })}
        </div>
      </ScrollArea>

    </div>
  );
};
