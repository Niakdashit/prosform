import { useState, useMemo } from "react";
import { 
  allTemplates, 
  templateCategories, 
  FormTemplate, 
  TemplateCategory,
  searchTemplates,
  getTemplatesByCategory 
} from "@/data/templates";
import { TemplateCard } from "./TemplateCard";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Grid3X3,
  LayoutList,
  Filter,
  X
} from "lucide-react";
import { Question } from "@/components/FormBuilder";

interface TemplateLibraryProps {
  onSelectTemplate: (questions: Question[], templateMeta?: { 
    layoutStyle?: string; 
    brandName?: string; 
    backgroundImages?: string[]; 
    backgroundColor?: string;
    gradientStart?: string;
    gradientEnd?: string;
    gradientAngle?: number;
    buttonStyle?: string;
    fontStyle?: string;
    accentColor?: string;
    pictureChoiceImages?: string[];
    desktopLayout?: string;
    mobileLayout?: string;
    // NEW: Color Palette (3 tints)
    colorPalette?: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    // NEW: Typography (Google Fonts)
    typography?: {
      heading: string;
      body: string;
    };
  }) => void;
}

export const TemplateLibrary = ({ onSelectTemplate }: TemplateLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewTemplate, setPreviewTemplate] = useState<FormTemplate | null>(null);
  const [sortBy, setSortBy] = useState<"popular" | "new">("popular");

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let templates = searchQuery 
      ? searchTemplates(searchQuery)
      : selectedCategory === "all" 
        ? allTemplates 
        : getTemplatesByCategory(selectedCategory);

    // Sort
    if (sortBy === "popular") {
      templates = [...templates].sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === "new") {
      templates = [...templates].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return templates;
  }, [searchQuery, selectedCategory, sortBy]);

  const handleUseTemplate = (template: FormTemplate) => {
    onSelectTemplate(template.questions, {
      layoutStyle: template.layoutStyle,
      brandName: template.brandName,
      backgroundImages: template.backgroundImages,
      backgroundColor: template.backgroundColor,
      gradientStart: template.gradientStart,
      gradientEnd: template.gradientEnd,
      gradientAngle: template.gradientAngle,
      buttonStyle: template.buttonStyle,
      fontStyle: template.fontStyle,
      accentColor: template.accentColor,
      pictureChoiceImages: template.pictureChoiceImages,
      desktopLayout: template.desktopLayout,
      mobileLayout: template.mobileLayout,
      // NEW: Pass color palette and typography
      colorPalette: template.colorPalette,
      typography: template.typography,
    });
    setPreviewTemplate(null);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Categories */}
        <div className="w-64 border-r border-border bg-muted/30 hidden md:block">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    All Templates
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {allTemplates.length}
                    </Badge>
                  </span>
                </button>
                {templateCategories.map((category) => {
                  const count = getTemplatesByCategory(category.id).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </span>
                        {count > 0 && (
                          <Badge 
                            variant={selectedCategory === category.id ? "outline" : "secondary"} 
                            className="text-xs"
                          >
                            {count}
                          </Badge>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content - Template Grid */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Mobile Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 md:hidden">
              <Badge
                variant={selectedCategory === "all" ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Badge>
              {templateCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.icon} {category.name}
                </Badge>
              ))}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "all" && !searchQuery && ` in ${templateCategories.find(c => c.id === selectedCategory)?.name}`}
              </p>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length > 0 ? (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }>
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreview={setPreviewTemplate}
                    onUse={handleUseTemplate}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No templates found
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={handleUseTemplate}
      />
    </div>
  );
};
