import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Question } from "./FormBuilder";
import { User, Building2, Star, List, BarChart3, Ban, AlignLeft, CheckCircle, Smile, Plus, ChevronDown, Layers, GripVertical } from "lucide-react";
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    if (dragIndex !== dropIndex) {
      onReorderQuestions(dragIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
            const isDragging = draggedIndex === index;
            const isDropTarget = dragOverIndex === index && draggedIndex !== index;
            
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
              <div key={question.id} className="relative">
                {isDropTarget && (
                  <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary z-10">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}
                <button
                  onClick={() => onQuestionSelect(question.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "w-full px-2 py-2.5 rounded-lg mb-1 flex items-start gap-2 transition-all group",
                    "hover:bg-muted/50",
                    isActive && "bg-muted",
                    isDragging && "opacity-50 scale-95"
                  )}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
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
              </div>
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
              const isDragging = draggedIndex === fullIndex;
              const isDropTarget = dragOverIndex === fullIndex && draggedIndex !== fullIndex;
              
              return (
                <div key={question.id} className="relative">
                  {isDropTarget && (
                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary z-10">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                    </div>
                  )}
                  <button
                    onClick={() => onQuestionSelect(question.id)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, fullIndex)}
                    onDragOver={(e) => handleDragOver(e, fullIndex)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, fullIndex)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "w-full px-2 py-2.5 rounded-lg mb-1 flex items-start gap-2 transition-all group",
                      "hover:bg-muted/50",
                      isActive && "bg-muted",
                      isDragging && "opacity-50 scale-95"
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-200/80 text-gray-700 font-bold">
                      <span className="text-sm">A</span>
                    </div>
                    <div className="flex-1 text-left min-w-0 pt-1">
                      <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                        {question.title}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
