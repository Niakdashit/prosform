import { useState, useEffect } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { ScratchSidebar } from "./ScratchSidebar";
import { ArticleScratchPreview } from "./ArticleScratchPreview";
import { ScratchSettingsPanel } from "./ScratchSettingsPanel";
import { ArticleScratchSettingsPanel } from "./ArticleScratchSettingsPanel";
import { ScratchTopToolbar } from "./ScratchTopToolbar";
import { FloatingToolbar } from "./FloatingToolbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { ScratchConfig, ScratchCard, ScratchPrize } from "./ScratchBuilder";

const defaultScratchConfig: ScratchConfig = {
  welcomeScreen: {
    title: "Grattez et gagnez !",
    subtitle: "Découvrez votre lot en grattant la carte",
    buttonText: "Commencer à gratter",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-left-right"
  },
  contactForm: {
    enabled: true,
    title: "Merci de compléter ce formulaire :",
    subtitle: "",
    blockSpacing: 1,
    fields: [
      { type: 'name', required: true, label: 'Nom complet' },
      { type: 'email', required: true, label: 'Email' },
      { type: 'phone', required: false, label: 'Téléphone' }
    ],
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  },
  scratchScreen: {
    title: "Grattez pour gagner !",
    subtitle: "Découvrez votre lot",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered",
    scratchColor: "#C0C0C0",
    cardWidth: 300,
    cardHeight: 200,
    threshold: 50,
    brushSize: 40
  },
  cards: [
    { id: '1', revealText: 'Gagné !', isWinning: true, probability: 50 },
    { id: '2', revealText: 'Perdu...', isWinning: false, probability: 50 }
  ],
  endingWin: {
    title: "Félicitations !",
    subtitle: "Vous avez gagné",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  },
  endingLose: {
    title: "Dommage !",
    subtitle: "Vous n'avez pas gagné",
    blockSpacing: 1,
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  }
};

export interface ArticleConfig {
  banner?: { imageUrl?: string; aspectRatio?: string; };
  frameWidth: number;
  frameHeight?: number;
  frameColor: string;
  frameBorderRadius: number;
  frameBorderWidth: number;
  frameBorderColor: string;
  ctaBackgroundColor: string;
  ctaTextColor: string;
  ctaBorderRadius: number;
  pageBackgroundColor?: string;
  pageBackgroundImage?: string;
  headerImage?: string;
  headerFitMode?: 'fill' | 'fit';
  footerImage?: string;
  footerFitMode?: 'fill' | 'fit';
}

const defaultArticleConfig: ArticleConfig = {
  frameWidth: 810,
  frameHeight: undefined,
  frameColor: '#ffffff',
  frameBorderRadius: 0,
  frameBorderWidth: 0,
  frameBorderColor: '#e5e7eb',
  ctaBackgroundColor: '#000000',
  ctaTextColor: '#ffffff',
  ctaBorderRadius: 9999,
  pageBackgroundColor: '#f3f4f6',
};

export const ArticleScratchBuilder = () => {
  const { theme } = useTheme();
  const [config, setConfig] = useState<ScratchConfig>(defaultScratchConfig);
  const [articleConfig, setArticleConfig] = useState<ArticleConfig>(defaultArticleConfig);
  const [activeView, setActiveView] = useState<'welcome' | 'contact' | 'scratch' | 'ending-win' | 'ending-lose'>('welcome');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'design' | 'campaign' | 'templates'>('design');
  const [prizes, setPrizes] = useState<ScratchPrize[]>([]);

  useEffect(() => { localStorage.setItem('article-scratch-config', JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem('article-scratch-article-config', JSON.stringify(articleConfig)); }, [articleConfig]);
  useEffect(() => { localStorage.setItem('article-scratch-theme', JSON.stringify(theme)); }, [theme]);

  const updateConfig = (updates: Partial<ScratchConfig>) => setConfig(prev => ({ ...prev, ...updates }));
  const updateArticleConfig = (updates: Partial<ArticleConfig>) => setArticleConfig(prev => ({ ...prev, ...updates }));
  const updateCard = (id: string, updates: Partial<ScratchCard>) => {
    setConfig(prev => ({ ...prev, cards: prev.cards.map(c => c.id === id ? { ...c, ...updates } : c) }));
  };
  const addCard = () => setConfig(prev => ({ ...prev, cards: [...prev.cards, { id: String(Date.now()), revealText: 'Nouveau', isWinning: true, probability: 10 }] }));
  const removeCard = (id: string) => setConfig(prev => ({ ...prev, cards: prev.cards.filter(c => c.id !== id) }));
  const handlePreview = () => window.open('/article-scratch-preview', '_blank');

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <ScratchTopToolbar activeTab={activeTab} onTabChange={setActiveTab} onPreview={handlePreview} />
      <FloatingToolbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[180px] bg-white border-r flex flex-col">
          <ScratchSidebar config={config} activeView={activeView} onViewSelect={setActiveView} onUpdateCard={updateCard} onAddCard={addCard} onDeleteCard={removeCard} onGoToDotation={() => setActiveTab('campaign')} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-end p-2 bg-white border-b">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode('desktop')} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${viewMode === 'desktop' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}><Monitor className="w-4 h-4" />Desktop</button>
              <button onClick={() => setViewMode('mobile')} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${viewMode === 'mobile' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}><Smartphone className="w-4 h-4" />Mobile</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <ArticleScratchPreview config={config} articleConfig={articleConfig} activeView={activeView} onUpdateConfig={updateConfig} onUpdateArticleConfig={updateArticleConfig} viewMode={viewMode} onViewChange={setActiveView} prizes={prizes} />
          </div>
        </div>
        <div className="w-[320px] bg-white border-l flex flex-col overflow-hidden">
          <ScratchSettingsPanel config={config} activeView={activeView} onUpdateConfig={updateConfig} />
          {activeView === 'welcome' && <div className="px-4 pb-4"><ArticleScratchSettingsPanel articleConfig={articleConfig} onUpdateArticleConfig={updateArticleConfig} /></div>}
        </div>
      </div>
    </div>
  );
};

export default ArticleScratchBuilder;
