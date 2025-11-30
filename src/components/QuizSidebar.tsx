import { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuizConfig } from "./QuizBuilder";
import { Plus, Palette, LayoutList, Home, Award, GripVertical, MoreVertical, Copy, Trash2, HelpCircle, User, PanelTop } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeStylePanel } from "@/components/ui/ThemeStylePanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutSettingsPanel } from "./campaign";

interface QuizSidebarProps {
  config: QuizConfig;
  activeView: 'welcome' | 'contact' | 'question' | 'result';
  activeQuestionIndex: number;
  onViewSelect: (view: 'welcome' | 'contact' | 'question' | 'result') => void;
  onQuestionSelect: (index: number) => void;
  onAddQuestion: () => void;
  onDuplicateQuestion: (index: number) => void;
  onReorderQuestions: (startIndex: number, endIndex: number) => void;
  onDeleteQuestion: (index: number) => void;
  onUpdateConfig: (updates: Partial<QuizConfig>) => void;
}

export const QuizSidebar = ({
  config,
  activeView,
  activeQuestionIndex,
  onViewSelect,
  onQuestionSelect,
  onAddQuestion,
  onDuplicateQuestion,
  onReorderQuestions,
  onDeleteQuestion,
  onUpdateConfig,
}: QuizSidebarProps) => {
  const { theme, updateTheme } = useTheme();
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

  const views = [
    { id: 'welcome' as const, label: 'Welcome', icon: Home },
    { id: 'contact' as const, label: 'Contact', icon: User },
    { id: 'result' as const, label: 'Résultats', icon: Award }
  ];

  return (
    <div className="w-[280px] bg-background border-r border-border flex flex-col">
      <Tabs defaultValue="views" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-2 mt-3 mb-0 h-9">
          <TabsTrigger value="views" className="text-[10px] gap-0.5 px-1.5">
            <LayoutList className="w-3 h-3" />
            <span>Vues</span>
          </TabsTrigger>
          <TabsTrigger value="structure" className="text-[10px] gap-0.5 px-1.5">
            <PanelTop className="w-3 h-3" />
            <span>Structure</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="text-[10px] gap-0.5 px-1.5">
            <Palette className="w-3 h-3" />
            <span>Style</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="views" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-3 pb-3">
              {views.map((view) => {
                const Icon = view.icon;
                const isActive = view.id === activeView;

                return (
                  <button
                    key={view.id}
                    onClick={() => onViewSelect(view.id)}
                    className={cn(
                      "w-full px-2 py-2.5 rounded-lg mb-1 flex items-start gap-2 transition-all",
                      "hover:bg-muted/50",
                      isActive && "bg-muted"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left min-w-0 pt-1">
                      <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                        {view.label}
                      </p>
                    </div>
                  </button>
                );
              })}

              <Separator className="my-3" />

              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-sm font-semibold text-foreground">Questions</span>
                <button 
                  onClick={onAddQuestion}
                  className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                  title="Ajouter une question"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {config.questions.map((question, index) => {
                const isActive = activeView === 'question' && activeQuestionIndex === index;
                
                return (
                  <div
                    key={question.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onQuestionSelect(index)}
                    className={cn(
                      "group w-full px-2 py-2.5 rounded-lg mb-1 flex items-center gap-2 transition-all cursor-move",
                      "hover:bg-muted/50",
                      isActive && "bg-muted",
                      draggedIndex === index && "opacity-50",
                      dragOverIndex === index && "bg-muted"
                    )}
                  >
                    <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs text-foreground break-words">
                        Q{index + 1}: {question.question}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {question.points} pts • {question.answers.length} réponses
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded p-1 transition-all"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateQuestion(index);
                        }}>
                          <Copy className="w-3 h-3 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteQuestion(index);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="structure" className="flex-1 mt-0 overflow-hidden">
          <LayoutSettingsPanel 
            layout={config.layout}
            onUpdateLayout={(updates) => onUpdateConfig({ layout: { ...config.layout, ...updates } as any })}
          />
        </TabsContent>

        <TabsContent value="style" className="flex-1 mt-0 overflow-hidden">
          <ThemeStylePanel hideJackpotSections />
        </TabsContent>
      </Tabs>
    </div>
  );
};
