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
import { useTheme } from "@/contexts/ThemeContext";
import { EndingTypeModal } from "./EndingTypeModal";
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
  const [endingModalOpen, setEndingModalOpen] = useState(false);
  const { theme, updateTheme } = useTheme();

  const handleSelectEndingType = (type: string) => {
    console.log("Selected ending type:", type);
    // TODO: Handle ending type selection
  };

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
        <TabsList className="grid w-full grid-cols-3 mx-2 mt-3 mb-0 h-9">
          <TabsTrigger value="questions" className="text-[10px] gap-0.5 px-1.5">
            <LayoutList className="w-3 h-3" />
            <span>Questions</span>
          </TabsTrigger>
          <TabsTrigger value="logic" className="text-[10px] gap-0.5 px-1.5">
            <GitBranch className="w-3 h-3" />
            <span>Logiques</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="text-[10px] gap-0.5 px-1.5">
            <Palette className="w-3 h-3" />
            <span>Style</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-3 pb-3">
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
                  <button 
                    onClick={() => setEndingModalOpen(true)}
                    className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
                  >
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
          <ScrollArea className="h-[calc(100vh-140px)]">
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
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-3 space-y-4 pb-20">
              <div>
                <h3 className="text-sm font-semibold mb-3">Typography</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Global font</Label>
                    <Select value={theme.fontFamily} onValueChange={(value) => updateTheme({ fontFamily: value })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter" className="text-xs">Inter</SelectItem>
                        <SelectItem value="roboto" className="text-xs">Roboto</SelectItem>
                        <SelectItem value="poppins" className="text-xs">Poppins</SelectItem>
                        <SelectItem value="montserrat" className="text-xs">Montserrat</SelectItem>
                        <SelectItem value="lato" className="text-xs">Lato</SelectItem>
                        <SelectItem value="opensans" className="text-xs">Open Sans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Font size</Label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="12"
                        max="20"
                        step="1"
                        value={theme.fontSize}
                        onChange={(e) => updateTheme({ fontSize: parseInt(e.target.value) })}
                        className="w-full h-1.5 accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Small</span>
                        <span>{theme.fontSize}px</span>
                        <span>Large</span>
                      </div>
                    </div>
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
                      <Input 
                        type="color" 
                        value={theme.textColor} 
                        onChange={(e) => updateTheme({ textColor: e.target.value })}
                        className="h-8 w-16" 
                      />
                      <Input 
                        type="text" 
                        value={theme.textColor}
                        onChange={(e) => updateTheme({ textColor: e.target.value })}
                        className="h-8 text-xs flex-1" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Background color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={theme.backgroundColor}
                        onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                        className="h-8 w-16" 
                      />
                      <Input 
                        type="text" 
                        value={theme.backgroundColor}
                        onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                        className="h-8 text-xs flex-1" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Button color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={theme.buttonColor}
                        onChange={(e) => updateTheme({ buttonColor: e.target.value })}
                        className="h-8 w-16" 
                      />
                      <Input 
                        type="text" 
                        value={theme.buttonColor}
                        onChange={(e) => updateTheme({ buttonColor: e.target.value })}
                        className="h-8 text-xs flex-1" 
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">System color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={theme.systemColor}
                        onChange={(e) => updateTheme({ systemColor: e.target.value })}
                        className="h-8 w-16" 
                      />
                      <Input 
                        type="text" 
                        value={theme.systemColor}
                        onChange={(e) => updateTheme({ systemColor: e.target.value })}
                        className="h-8 text-xs flex-1" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Accent color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={theme.accentColor}
                        onChange={(e) => updateTheme({ accentColor: e.target.value })}
                        className="h-8 w-16" 
                      />
                      <Input 
                        type="text" 
                        value={theme.accentColor}
                        onChange={(e) => updateTheme({ accentColor: e.target.value })}
                        className="h-8 text-xs flex-1" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Buttons</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-3 block">Button style</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "filled", label: "Filled", style: "filled" },
                        { value: "outline", label: "Outline", style: "outline" },
                        { value: "soft", label: "Soft", style: "soft" },
                        { value: "ghost", label: "Ghost", style: "ghost" },
                      ].map((styleOption) => (
                        <button
                          key={styleOption.value}
                          onClick={() => updateTheme({ buttonStyle: styleOption.value as any })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-primary/50",
                            theme.buttonStyle === styleOption.value ? "border-primary bg-primary/5" : "border-border"
                          )}
                        >
                          <div 
                            className="w-full h-8 flex items-center justify-center text-xs font-semibold transition-all"
                            style={
                              styleOption.style === "filled" 
                                ? { 
                                    backgroundColor: theme.buttonColor, 
                                    color: theme.backgroundColor,
                                    borderRadius: "8px"
                                  }
                                : styleOption.style === "outline"
                                ? {
                                    backgroundColor: "transparent",
                                    border: `2px solid ${theme.buttonColor}`,
                                    color: theme.buttonColor,
                                    borderRadius: "8px"
                                  }
                                : styleOption.style === "soft"
                                ? {
                                    backgroundColor: `${theme.buttonColor}20`,
                                    color: theme.buttonColor,
                                    borderRadius: "8px"
                                  }
                                : {
                                    backgroundColor: "transparent",
                                    color: theme.buttonColor,
                                    borderRadius: "8px"
                                  }
                            }
                          >
                            OK
                          </div>
                          <span className="text-[10px] font-medium">{styleOption.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-3 block">Border radius</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 0, label: "Square", radius: "0px" },
                        { value: 8, label: "Rounded", radius: "8px" },
                        { value: 999, label: "Pill", radius: "999px" },
                      ].map((radius) => (
                        <button
                          key={radius.value}
                          onClick={() => updateTheme({ buttonRadius: radius.value })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-primary/50",
                            theme.buttonRadius === radius.value ? "border-primary bg-primary/5" : "border-border"
                          )}
                        >
                          <div 
                            className="w-full h-8 flex items-center justify-center text-xs font-semibold transition-all"
                            style={{ 
                              backgroundColor: theme.buttonColor,
                              color: theme.backgroundColor,
                              borderRadius: radius.radius
                            }}
                          >
                            OK
                          </div>
                          <span className="text-[10px] font-medium">{radius.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-3 block">Button size</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "small", label: "Small", height: "28px", padding: "0 16px", fontSize: "13px" },
                        { value: "medium", label: "Medium", height: "36px", padding: "0 20px", fontSize: "14px" },
                        { value: "large", label: "Large", height: "44px", padding: "0 24px", fontSize: "15px" },
                      ].map((size) => (
                        <button
                          key={size.value}
                          onClick={() => updateTheme({ buttonSize: size.value as any })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:border-primary/50",
                            theme.buttonSize === size.value ? "border-primary bg-primary/5" : "border-border"
                          )}
                        >
                          <div 
                            className="w-full flex items-center justify-center font-semibold transition-all"
                            style={{
                              backgroundColor: theme.buttonColor,
                              color: theme.backgroundColor,
                              borderRadius: "8px",
                              height: size.height,
                              padding: size.padding,
                              fontSize: size.fontSize
                            }}
                          >
                            OK
                          </div>
                          <span className="text-[10px] font-medium">{size.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Borders</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Border color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={theme.borderColor}
                        onChange={(e) => updateTheme({ borderColor: e.target.value })}
                        className="h-8 w-16" 
                      />
                      <Input 
                        type="text" 
                        value={theme.borderColor}
                        onChange={(e) => updateTheme({ borderColor: e.target.value })}
                        className="h-8 text-xs flex-1" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Border width</Label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="4"
                        step="0.5"
                        value={theme.borderWidth}
                        onChange={(e) => updateTheme({ borderWidth: parseFloat(e.target.value) })}
                        className="w-full h-1.5 accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>None</span>
                        <span>{theme.borderWidth}px</span>
                        <span>Thick</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Border radius</Label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="2"
                        value={theme.borderRadius}
                        onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}
                        className="w-full h-1.5 accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Sharp</span>
                        <span>{theme.borderRadius}px</span>
                        <span>Round</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Spacing</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Question spacing</Label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={theme.questionSpacing}
                        onChange={(e) => updateTheme({ questionSpacing: parseFloat(e.target.value) })}
                        className="w-full h-1.5 accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Compact</span>
                        <span>{theme.questionSpacing.toFixed(1)}x</span>
                        <span>Spacious</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Input padding</Label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="8"
                        max="24"
                        step="2"
                        value={theme.inputPadding}
                        onChange={(e) => updateTheme({ inputPadding: parseInt(e.target.value) })}
                        className="w-full h-1.5 accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Tight</span>
                        <span>{theme.inputPadding}px</span>
                        <span>Loose</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Page margins</Label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="16"
                        max="64"
                        step="4"
                        value={theme.pageMargins}
                        onChange={(e) => updateTheme({ pageMargins: parseInt(e.target.value) })}
                        className="w-full h-1.5 accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Narrow</span>
                        <span>{theme.pageMargins}px</span>
                        <span>Wide</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Effects</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Shadow intensity</Label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={theme.shadowIntensity}
                        onChange={(e) => updateTheme({ shadowIntensity: parseInt(e.target.value) })}
                        className="w-full h-1.5 accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>None</span>
                        <span>{theme.shadowIntensity}%</span>
                        <span>Strong</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Animation speed</Label>
                    <Select value={theme.animationSpeed} onValueChange={(value: any) => updateTheme({ animationSpeed: value })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-xs">No animations</SelectItem>
                        <SelectItem value="slow" className="text-xs">Slow (500ms)</SelectItem>
                        <SelectItem value="normal" className="text-xs">Normal (300ms)</SelectItem>
                        <SelectItem value="fast" className="text-xs">Fast (150ms)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <EndingTypeModal 
        open={endingModalOpen}
        onOpenChange={setEndingModalOpen}
        onSelectType={handleSelectEndingType}
      />
    </div>
  );
};
