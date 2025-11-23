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
    <div className="w-80 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-2">How are we doing?</h2>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add content
        </Button>
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
                  "w-full p-3 rounded-lg mb-2 flex items-start gap-3 transition-all",
                  "hover:bg-muted/50",
                  isActive && "bg-muted border border-primary/20"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0",
                  question.type === "welcome" && "bg-accent/10 text-accent-foreground",
                  question.type === "text" && "bg-blue-500/10 text-blue-600",
                  question.type === "rating" && "bg-green-500/10 text-green-600",
                  question.type === "choice" && "bg-purple-500/10 text-purple-600",
                  question.type === "ending" && "bg-accent/10 text-accent-foreground"
                )}>
                  {question.number ? (
                    <span className="text-sm font-semibold">{question.number}</span>
                  ) : (
                    Icon && <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {question.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Endings
        </Button>
      </div>
    </div>
  );
};
