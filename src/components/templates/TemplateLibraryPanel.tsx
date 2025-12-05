import { useState, useMemo, useEffect } from "react";
import { 
  gameTemplates, 
  templateCategories, 
  GameTemplate, 
  TemplateCategory,
  searchTemplates,
  getTemplatesByCategory 
} from "@/data/gameTemplates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Filter,
  X,
  Check,
  Eye,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JackpotConfig } from "@/components/JackpotBuilder";

// Alias pour compatibilité
export type JackpotTemplate = GameTemplate;
export type JackpotTemplateCategory = TemplateCategory;

interface TemplateLibraryPanelProps {
  onSelectTemplate: (config: Partial<JackpotConfig>, templateMeta: {
    colorPalette: GameTemplate['colorPalette'];
    typography: GameTemplate['typography'];
    backgroundImage?: string;
  }) => void;
  currentConfig?: JackpotConfig;
}

// Load Google Font dynamically
const loadGoogleFont = (fontFamily: string) => {
  if (typeof document === 'undefined') return;
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;
  
  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
};

// Template Card Component
const JackpotTemplateCard = ({ 
  template, 
  onPreview, 
  onUse 
}: { 
  template: JackpotTemplate; 
  onPreview: (t: JackpotTemplate) => void;
  onUse: (t: JackpotTemplate) => void;
}) => {
  useEffect(() => {
    if (template.typography?.heading) loadGoogleFont(template.typography.heading);
    if (template.typography?.body) loadGoogleFont(template.typography.body);
  }, [template.typography]);

  const { primary, secondary, tertiary } = template.colorPalette;

  return (
    <div 
      className="group relative bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 cursor-pointer"
      onClick={() => onPreview(template)}
    >
      {/* Visual Preview */}
      <div 
        className="relative h-52 overflow-hidden"
        style={{ backgroundColor: primary }}
      >
        {/* Background Image */}
        {template.backgroundImage && (
          <>
            <img 
              src={template.backgroundImage} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div 
              className="absolute inset-0" 
              style={{ backgroundColor: primary, opacity: 0.6 }}
            />
          </>
        )}
        
        {/* Content Preview */}
        <div className="absolute inset-0 p-4 flex flex-col justify-center">
          {/* Brand badge */}
          <div 
            className="text-[9px] tracking-widest uppercase mb-2 opacity-70"
            style={{ color: tertiary, fontFamily: template.typography.body }}
          >
            {template.category}
          </div>
          
          {/* Title */}
          <div 
            className="text-base font-bold leading-tight mb-2 line-clamp-2"
            style={{ color: tertiary, fontFamily: template.typography.heading }}
          >
            {template.config.welcomeScreen?.title || template.name}
          </div>
          
          {/* Subtitle */}
          <div 
            className="text-[10px] opacity-80 mb-3 line-clamp-2"
            style={{ color: tertiary, fontFamily: template.typography.body }}
          >
            {template.config.welcomeScreen?.subtitle || template.description}
          </div>
          
          {/* Button preview */}
          <div 
            className="rounded-lg px-3 py-1.5 text-[10px] font-semibold w-fit"
            style={{ backgroundColor: secondary, color: primary }}
          >
            {template.config.welcomeScreen?.buttonText || "Jouer"}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {template.isNew && (
            <Badge className="bg-green-500 text-white text-[9px] px-1.5 py-0.5">
              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
              New
            </Badge>
          )}
          {template.isPremium && (
            <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5">
              Pro
            </Badge>
          )}
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white hover:bg-white/90 text-gray-900 text-xs h-8"
            onClick={(e) => { e.stopPropagation(); onPreview(template); }}
          >
            <Eye className="w-3 h-3 mr-1" />
            Aperçu
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-xs h-8"
            onClick={(e) => { e.stopPropagation(); onUse(template); }}
          >
            <Check className="w-3 h-3 mr-1" />
            Utiliser
          </Button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-3">
        <h4 className="font-semibold text-foreground text-sm mb-0.5 line-clamp-1">
          {template.name}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
        
        {/* Color palette preview */}
        <div className="flex gap-1 mt-2">
          <div 
            className="w-4 h-4 rounded-full border border-border" 
            style={{ backgroundColor: primary }}
            title="Couleur principale"
          />
          <div 
            className="w-4 h-4 rounded-full border border-border" 
            style={{ backgroundColor: secondary }}
            title="Couleur d'accent"
          />
          <div 
            className="w-4 h-4 rounded-full border border-border" 
            style={{ backgroundColor: tertiary }}
            title="Couleur de texte"
          />
        </div>
      </div>
    </div>
  );
};

// Preview Modal
const TemplatePreviewModal = ({
  template,
  isOpen,
  onClose,
  onUse
}: {
  template: JackpotTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (t: JackpotTemplate) => void;
}) => {
  if (!template) return null;

  const { primary, secondary, tertiary } = template.colorPalette;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>{template.name}</span>
            <Button onClick={() => onUse(template)} className="gap-2">
              <Check className="w-4 h-4" />
              Utiliser ce template
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-6">
          {/* Preview Container - simulates mobile view */}
          <div className="max-w-sm mx-auto">
            <div 
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: primary }}
            >
              {/* Background */}
              {template.backgroundImage && (
                <div className="relative h-96">
                  <img 
                    src={template.backgroundImage} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0" 
                    style={{ backgroundColor: primary, opacity: 0.55 }}
                  />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-center">
                    <div 
                      className="text-xs tracking-widest uppercase mb-3 opacity-70"
                      style={{ color: tertiary, fontFamily: template.typography.body }}
                    >
                      {template.category}
                    </div>
                    
                    <h2 
                      className="text-2xl font-bold leading-tight mb-3"
                      style={{ color: tertiary, fontFamily: template.typography.heading }}
                    >
                      {template.config.welcomeScreen?.title}
                    </h2>
                    
                    <p 
                      className="text-sm opacity-80 mb-6"
                      style={{ color: tertiary, fontFamily: template.typography.body }}
                    >
                      {template.config.welcomeScreen?.subtitle}
                    </p>
                    
                    <button 
                      className="rounded-xl px-6 py-3 text-sm font-semibold w-fit"
                      style={{ backgroundColor: secondary, color: primary }}
                    >
                      {template.config.welcomeScreen?.buttonText}
                    </button>
                  </div>
                </div>
              )}
              
              {!template.backgroundImage && (
                <div className="p-6 min-h-[300px] flex flex-col justify-center">
                  <h2 
                    className="text-2xl font-bold leading-tight mb-3"
                    style={{ color: tertiary, fontFamily: template.typography.heading }}
                  >
                    {template.config.welcomeScreen?.title}
                  </h2>
                  
                  <p 
                    className="text-sm opacity-80 mb-6"
                    style={{ color: tertiary, fontFamily: template.typography.body }}
                  >
                    {template.config.welcomeScreen?.subtitle}
                  </p>
                  
                  <button 
                    className="rounded-xl px-6 py-3 text-sm font-semibold w-fit"
                    style={{ backgroundColor: secondary, color: primary }}
                  >
                    {template.config.welcomeScreen?.buttonText}
                  </button>
                </div>
              )}
            </div>
            
            {/* Symbols preview */}
            <div className="mt-6 p-4 bg-muted rounded-xl">
              <h4 className="text-sm font-medium mb-3">Symboles inclus</h4>
              <div className="flex gap-2 flex-wrap">
                {template.config.symbols?.map((symbol) => (
                  <div 
                    key={symbol.id}
                    className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl shadow-sm"
                  >
                    {symbol.emoji}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Typography & Colors */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-xl">
                <h4 className="text-sm font-medium mb-2">Typographie</h4>
                <p className="text-xs text-muted-foreground">
                  Titres: {template.typography.heading}<br/>
                  Corps: {template.typography.body}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-xl">
                <h4 className="text-sm font-medium mb-2">Palette</h4>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-background shadow-sm" 
                    style={{ backgroundColor: primary }}
                    title="Principal"
                  />
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-background shadow-sm" 
                    style={{ backgroundColor: secondary }}
                    title="Accent"
                  />
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-background shadow-sm" 
                    style={{ backgroundColor: tertiary }}
                    title="Texte"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const TemplateLibraryPanel = ({ onSelectTemplate }: TemplateLibraryPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
  const [previewTemplate, setPreviewTemplate] = useState<GameTemplate | null>(null);
  const [sortBy, setSortBy] = useState<"popular" | "new">("popular");

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let templates = searchQuery 
      ? searchTemplates(searchQuery)
      : selectedCategory === "all" 
        ? gameTemplates 
        : getTemplatesByCategory(selectedCategory);

    // Sort
    if (sortBy === "popular") {
      templates = [...templates].sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === "new") {
      templates = [...templates].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return templates;
  }, [searchQuery, selectedCategory, sortBy]);

  const handleUseTemplate = (template: GameTemplate) => {
    onSelectTemplate(template.config, {
      colorPalette: template.colorPalette,
      typography: template.typography,
      backgroundImage: template.backgroundImage,
    });
    setPreviewTemplate(null);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <h2 className="text-xl font-semibold mb-4">Bibliothèque de Templates</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un template..."
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
          
          {/* Sort buttons */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === "popular" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("popular")}
            >
              Populaires
            </Button>
            <Button
              variant={sortBy === "new" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("new")}
            >
              Nouveaux
            </Button>
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
                Catégories
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
                    Tous les templates
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {gameTemplates.length}
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
                Tous
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
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} trouvé{filteredTemplates.length !== 1 ? 's' : ''}
                {searchQuery && ` pour "${searchQuery}"`}
                {selectedCategory !== "all" && !searchQuery && ` dans ${templateCategories.find(c => c.id === selectedCategory)?.name}`}
              </p>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <JackpotTemplateCard
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
                  Aucun template trouvé
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Essayez de modifier votre recherche ou vos filtres.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Effacer les filtres
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

// Alias pour compatibilité avec l'ancien code
export const JackpotTemplateLibrary = TemplateLibraryPanel;
