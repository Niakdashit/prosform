import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Upload, X } from 'lucide-react';
import { ArticleConfig } from './ArticleJackpotBuilder';

interface ArticleJackpotSettingsPanelProps {
  articleConfig: ArticleConfig;
  onUpdateArticleConfig: (updates: Partial<ArticleConfig>) => void;
}

export const ArticleJackpotSettingsPanel: React.FC<ArticleJackpotSettingsPanelProps> = ({
  articleConfig,
  onUpdateArticleConfig,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    frame: true,
    header: false,
    footer: false,
    page: false,
    cta: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleImageUpload = (key: 'headerImage' | 'footerImage') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateArticleConfig({ [key]: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Article Settings</h3>

      {/* Frame Settings */}
      <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
        <button onClick={() => toggleSection('frame')} className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50">
          <span className="font-medium text-sm text-gray-800">Cadre</span>
          <span className="text-xs text-gray-500">{openSections.frame ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
        </button>
        {openSections.frame && (
          <div className="p-4 border-t border-gray-100 bg-white space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Largeur</label>
              <input type="number" value={articleConfig.frameWidth} onChange={(e) => onUpdateArticleConfig({ frameWidth: Number(e.target.value) })} className="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Couleur de fond</label>
              <div className="flex gap-2">
                <input type="color" value={articleConfig.frameColor} onChange={(e) => onUpdateArticleConfig({ frameColor: e.target.value })} className="w-10 h-9 border border-gray-200 rounded cursor-pointer" />
                <input type="text" value={articleConfig.frameColor} onChange={(e) => onUpdateArticleConfig({ frameColor: e.target.value })} className="flex-1 h-9 px-3 border border-gray-200 rounded text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Rayon des coins: {articleConfig.frameBorderRadius}px</label>
              <input type="range" min="0" max="50" value={articleConfig.frameBorderRadius} onChange={(e) => onUpdateArticleConfig({ frameBorderRadius: Number(e.target.value) })} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Épaisseur bordure: {articleConfig.frameBorderWidth}px</label>
              <input type="range" min="0" max="10" value={articleConfig.frameBorderWidth} onChange={(e) => onUpdateArticleConfig({ frameBorderWidth: Number(e.target.value) })} className="w-full" />
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
        <button onClick={() => toggleSection('header')} className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50">
          <span className="font-medium text-sm text-gray-800">En-tête</span>
          <span className="text-xs text-gray-500">{openSections.header ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
        </button>
        {openSections.header && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400" onClick={() => document.getElementById('header-upload')?.click()}>
              <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Image d'en-tête</p>
            </div>
            <input id="header-upload" type="file" accept="image/*" onChange={handleImageUpload('headerImage')} className="hidden" />
            {articleConfig.headerImage && (
              <div className="flex items-center gap-3 mt-3">
                <img src={articleConfig.headerImage} alt="Header" className="w-12 h-12 object-cover rounded border" />
                <button onClick={() => onUpdateArticleConfig({ headerImage: undefined })} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4 text-gray-500" /></button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
        <button onClick={() => toggleSection('footer')} className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50">
          <span className="font-medium text-sm text-gray-800">Pied de page</span>
          <span className="text-xs text-gray-500">{openSections.footer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
        </button>
        {openSections.footer && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400" onClick={() => document.getElementById('footer-upload')?.click()}>
              <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Image de pied de page</p>
            </div>
            <input id="footer-upload" type="file" accept="image/*" onChange={handleImageUpload('footerImage')} className="hidden" />
            {articleConfig.footerImage && (
              <div className="flex items-center gap-3 mt-3">
                <img src={articleConfig.footerImage} alt="Footer" className="w-12 h-12 object-cover rounded border" />
                <button onClick={() => onUpdateArticleConfig({ footerImage: undefined })} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4 text-gray-500" /></button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Page Background */}
      <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
        <button onClick={() => toggleSection('page')} className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50">
          <span className="font-medium text-sm text-gray-800">Arrière-plan</span>
          <span className="text-xs text-gray-500">{openSections.page ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
        </button>
        {openSections.page && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <label className="text-xs text-gray-500 mb-1 block">Couleur de fond</label>
            <div className="flex gap-2">
              <input type="color" value={articleConfig.pageBackgroundColor || '#f3f4f6'} onChange={(e) => onUpdateArticleConfig({ pageBackgroundColor: e.target.value })} className="w-10 h-9 border border-gray-200 rounded cursor-pointer" />
              <input type="text" value={articleConfig.pageBackgroundColor || '#f3f4f6'} onChange={(e) => onUpdateArticleConfig({ pageBackgroundColor: e.target.value })} className="flex-1 h-9 px-3 border border-gray-200 rounded text-sm" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleJackpotSettingsPanel;
