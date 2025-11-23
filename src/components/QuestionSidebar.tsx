import { ScrollArea } from "@/components/ui/scroll-area";
import { Question } from "./FormBuilder";
import { User, Building2, Star, List, BarChart3, Ban, AlignLeft, CheckCircle, Smile, Plus, ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionSidebarProps {
  questions: Question[];
  activeQuestionId: string;
  onQuestionSelect: (id: string) => void;
  onReorderQuestions: (startIndex: number, endIndex: number) => void;
}

const iconMap: Record<string, any> = {
  user: User,
  building: Building2,
  star: Star,
  list: List,
  chart: BarChart3,
  ban: Ban,
  alignLeft: AlignLeft,
  check: CheckCircle,
  greeting: Smile,
  layers: Layers,
};

export const QuestionSidebar = ({
  questions,
  activeQuestionId,
  onQuestionSelect,
  onReorderQuestions,
}: QuestionSidebarProps) => {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    if (dragIndex !== dropIndex) {
      onReorderQuestions(dragIndex, dropIndex);
    }
  };
  return (
    <div className="w-[280px] bg-background border-r border-border flex flex-col">
      {/* Header avec breadcrumb */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
          </svg>
          <span>Forms</span>
          <span>›</span>
          <span className="truncate">Employer Feedback Form (co...</span>
        </div>
      </div>

      {/* Universal mode dropdown */}
      <div className="px-4 py-3.5 bg-muted/30">
        <button className="w-full flex items-center justify-between text-sm hover:bg-muted/50 px-3 py-2 rounded">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4" />
            <span>Universal mode</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {/* Titre du formulaire */}
          <div className="px-2 py-3 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 bg-foreground/20 rounded-sm" />
            </div>
            <span className="text-sm font-medium text-foreground">How are we doing?</span>
          </div>

          {/* Questions (sauf endings) */}
          {questions.filter(q => q.type !== "ending").map((question, index) => {
            const Icon = iconMap[question.icon || "alignLeft"];
            const isActive = question.id === activeQuestionId;
            
            // Déterminer la couleur de fond selon le type et l'index
            let bgColor = "bg-gray-200 text-gray-700";
            if (question.type === "welcome") bgColor = "bg-gray-200/80 text-gray-700";
            else if (question.type === "text" && question.number === 1) bgColor = "bg-pink-200/70 text-pink-800";
            else if (question.type === "choice" && question.number === 2) bgColor = "bg-purple-200/70 text-purple-800";
            else if (question.type === "rating" && question.number === 3) bgColor = "bg-green-200/70 text-green-800";
            else if (question.type === "choice" && question.number === 4) bgColor = "bg-green-200/70 text-green-800";
            else if (question.type === "choice" && question.number === 5) bgColor = "bg-green-200/70 text-green-800";
            else if (question.type === "choice" && question.number === 6) bgColor = "bg-purple-200/70 text-purple-800";
            else if (question.type === "text" && question.number === 7) bgColor = "bg-blue-200/70 text-blue-800";

            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(question.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={cn(
                  "w-full px-2 py-2.5 rounded-lg mb-1 flex items-start gap-3 transition-colors cursor-move",
                  "hover:bg-muted/50",
                  isActive && "bg-muted"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold",
                  bgColor
                )}>
                  {question.number ? (
                    <span className="text-sm">{question.number}</span>
                  ) : (
                    Icon && <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0 pt-1">
                  <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                    {question.title}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Séparateur + Section Endings */}
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-sm font-semibold text-foreground">Endings</span>
              <button className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Endings list */}
            {questions.filter(q => q.type === "ending").map((question, endingIndex) => {
              const isActive = question.id === activeQuestionId;
              const fullIndex = questions.findIndex(q => q.id === question.id);
              
              return (
                <button
                  key={question.id}
                  onClick={() => onQuestionSelect(question.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, fullIndex)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, fullIndex)}
                  className={cn(
                    "w-full px-2 py-2.5 rounded-lg mb-1 flex items-start gap-3 transition-colors cursor-move",
                    "hover:bg-muted/50",
                    isActive && "bg-muted"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-200/80 text-gray-700 font-bold">
                    <span className="text-sm">A</span>
                  </div>
                  <div className="flex-1 text-left min-w-0 pt-1">
                    <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                      {question.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
