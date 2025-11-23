import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Question } from "./FormBuilder";
import { Plus, GripVertical, MoreVertical, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getQuestionIcon } from "@/lib/questionIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuestionSidebarProps {
  questions: Question[];
  activeQuestionId: string;
  onQuestionSelect: (id: string) => void;
  onReorderQuestions: (startIndex: number, endIndex: number) => void;
  onDuplicateQuestion: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
}


export const QuestionSidebar = ({
  questions,
  activeQuestionId,
  onQuestionSelect,
  onReorderQuestions,
  onDuplicateQuestion,
  onDeleteQuestion,
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
      <ScrollArea className="flex-1">
        <div className="p-3">
          {/* Questions (sauf endings) */}
          {questions.filter(q => q.type !== "ending").map((question, index) => {
            const questionIcon = getQuestionIcon(question);
            const Icon = questionIcon.icon;
            const isActive = question.id === activeQuestionId;
            const isDragging = draggedIndex === index;
            const isDropTarget = dragOverIndex === index && draggedIndex !== index;

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
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    questionIcon.color
                  )}>
                    {question.number ? (
                      <>
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-semibold ml-0.5">{question.number}</span>
                      </>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0 pt-1">
                    <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                      {question.title}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateQuestion(question.id);
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteQuestion(question.id);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateQuestion(question.id);
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteQuestion(question.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
