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
    <div className="w-64 bg-background border-r border-border flex flex-col">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
          <div className="w-4 h-4 bg-foreground/20 rounded-sm" />
        </div>
        <h2 className="text-sm font-medium text-foreground">How are we doing?</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {questions.map((question) => {
            const Icon = iconMap[question.icon || "message"];
            const isActive = question.id === activeQuestionId;
            
            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(question.id)}
                className={cn(
                  "w-full p-2.5 rounded-md mb-1 flex items-start gap-2.5 transition-all",
                  "hover:bg-muted",
                  isActive && "bg-muted"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-xs font-semibold",
                  question.type === "welcome" && "bg-pink-100 text-pink-600",
                  question.type === "text" && "bg-blue-100 text-blue-600",
                  question.type === "rating" && "bg-green-100 text-green-600",
                  question.type === "choice" && "bg-purple-100 text-purple-600",
                  question.type === "ending" && "bg-cyan-100 text-cyan-600"
                )}>
                  {question.number ? (
                    <span>{question.number}</span>
                  ) : (
                    Icon && <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                    {question.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
          <Plus className="w-3 h-3 mr-2" />
          Endings
        </Button>
      </div>
    </div>
  );
};
