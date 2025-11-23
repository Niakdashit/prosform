import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Question } from "./FormBuilder";
import { Plus, GripVertical, MoreVertical, Copy, Trash2, Palette, GitBranch, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";
import { getQuestionIcon } from "@/lib/questionIcons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
      <Tabs defaultValue="questions" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-3 mb-0">
          <TabsTrigger value="questions" className="text-xs gap-1">
            <LayoutList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Questions</span>
          </TabsTrigger>
          <TabsTrigger value="logic" className="text-xs gap-1">
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logiques</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs gap-1">
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Style</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
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
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        questionIcon.color
                      )}>
                        {question.number ? (
                          <>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold ml-0.5">{question.number}</span>
                          </>
                        ) : (
                          <Icon className="w-4 h-4" />
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
                {questions.filter(q => q.type === "ending").map((question) => {
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
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-200/80 text-gray-700 font-bold">
                          <span className="text-xs">A</span>
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
        </TabsContent>

        <TabsContent value="logic" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              <div className="text-center py-8 text-muted-foreground">
                <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Logic rules will appear here</p>
                <p className="text-xs mt-1">Create branching logic from question choices</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="style" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Typography</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Global font</Label>
                    <Select defaultValue="inter">
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter" className="text-xs">Inter</SelectItem>
                        <SelectItem value="roboto" className="text-xs">Roboto</SelectItem>
                        <SelectItem value="poppins" className="text-xs">Poppins</SelectItem>
                        <SelectItem value="montserrat" className="text-xs">Montserrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Colors</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Text color</Label>
                    <div className="flex gap-2">
                      <Input type="color" defaultValue="#000000" className="h-8 w-16" />
                      <Input type="text" defaultValue="#000000" className="h-8 text-xs flex-1" />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Button color</Label>
                    <div className="flex gap-2">
                      <Input type="color" defaultValue="#3b82f6" className="h-8 w-16" />
                      <Input type="text" defaultValue="#3b82f6" className="h-8 text-xs flex-1" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">System color</Label>
                    <div className="flex gap-2">
                      <Input type="color" defaultValue="#6b7280" className="h-8 w-16" />
                      <Input type="text" defaultValue="#6b7280" className="h-8 text-xs flex-1" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Buttons</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Button style</Label>
                    <Select defaultValue="rounded">
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square" className="text-xs">Square</SelectItem>
                        <SelectItem value="rounded" className="text-xs">Rounded</SelectItem>
                        <SelectItem value="pill" className="text-xs">Pill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
