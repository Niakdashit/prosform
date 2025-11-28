import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Upload, X } from 'lucide-react';
import { ArticleConfig } from './ArticleQuizBuilder';

interface ArticleQuizSettingsPanelProps {
  articleConfig: ArticleConfig;
  onUpdateArticleConfig: (updates: Partial<ArticleConfig>) => void;
}

const quickColors = [
  { color: 'rainbow', isGradient: true },
  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
  '#ced4da', '#adb5bd', '#6c757d', '#495057', '#343a40',
  '#212529', '#000000', '#ff6b6b', '#51cf66', '#339af0',
  '#69db7c', '#ffd43b', '#da77f2', '#ff922b', '#74c0fc',
];

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-sm text-gray-800">{title}</span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          {isOpen ? 'Masquer' : 'Afficher'}
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-100 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  showFitOptions?: boolean;
  fitMode?: 'fill' | 'fit';
  onFitModeChange?: (mode: 'fill' | 'fit') => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, value, onChange, showFitOptions = false, fitMode = 'fill', onFitModeChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
      >
        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 10MB</p>
      </div>
      
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

      {showFitOptions && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onFitModeChange?.('fill')}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${fitMode === 'fill' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Remplir
          </button>
          <button
            onClick={() => onFitModeChange?.('fit')}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${fitMode === 'fit' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Adapté
          </button>
        </div>
      )}

      {value && (
        <div className="flex items-center gap-3 mt-3">
          <img src={value} alt="Preview" className="w-12 h-12 object-cover rounded border" />
          <button onClick={() => onChange(undefined)} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export const ArticleQuizSettingsPanel: React.FC<ArticleQuizSettingsPanelProps> = ({
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

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Article Settings</h3>

      {/* Frame Settings */}
      <CollapsibleSection title="Cadre" isOpen={openSections.frame} onToggle={() => toggleSection('frame')}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Largeur</label>
            <input
              type="number"
              value={articleConfig.frameWidth}
              onChange={(e) => onUpdateArticleConfig({ frameWidth: Number(e.target.value) })}
              className="w-full h-9 px-3 border border-gray-200 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Couleur de fond</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={articleConfig.frameColor}
                onChange={(e) => onUpdateArticleConfig({ frameColor: e.target.value })}
                className="w-10 h-9 border border-gray-200 rounded cursor-pointer"
              />
              <input
                type="text"
                value={articleConfig.frameColor}
                onChange={(e) => onUpdateArticleConfig({ frameColor: e.target.value })}
                className="flex-1 h-9 px-3 border border-gray-200 rounded text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Rayon des coins</label>
            <input
              type="range"
              min="0"
              max="50"
              value={articleConfig.frameBorderRadius}
              onChange={(e) => onUpdateArticleConfig({ frameBorderRadius: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{articleConfig.frameBorderRadius}px</span>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Épaisseur bordure</label>
            <input
              type="range"
              min="0"
              max="10"
              value={articleConfig.frameBorderWidth}
              onChange={(e) => onUpdateArticleConfig({ frameBorderWidth: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{articleConfig.frameBorderWidth}px</span>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Couleur bordure</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={articleConfig.frameBorderColor}
                onChange={(e) => onUpdateArticleConfig({ frameBorderColor: e.target.value })}
                className="w-10 h-9 border border-gray-200 rounded cursor-pointer"
              />
              <input
                type="text"
                value={articleConfig.frameBorderColor}
                onChange={(e) => onUpdateArticleConfig({ frameBorderColor: e.target.value })}
                className="flex-1 h-9 px-3 border border-gray-200 rounded text-sm"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Header */}
      <CollapsibleSection title="En-tête" isOpen={openSections.header} onToggle={() => toggleSection('header')}>
        <ImageUploader
          label="Image d'en-tête"
          value={articleConfig.headerImage}
          onChange={(url) => onUpdateArticleConfig({ headerImage: url })}
          showFitOptions={true}
          fitMode={articleConfig.headerFitMode}
          onFitModeChange={(mode) => onUpdateArticleConfig({ headerFitMode: mode })}
        />
      </CollapsibleSection>

      {/* Footer */}
      <CollapsibleSection title="Pied de page" isOpen={openSections.footer} onToggle={() => toggleSection('footer')}>
        <ImageUploader
          label="Image de pied de page"
          value={articleConfig.footerImage}
          onChange={(url) => onUpdateArticleConfig({ footerImage: url })}
          showFitOptions={true}
          fitMode={articleConfig.footerFitMode}
          onFitModeChange={(mode) => onUpdateArticleConfig({ footerFitMode: mode })}
        />
      </CollapsibleSection>

      {/* Page Background */}
      <CollapsibleSection title="Arrière-plan page" isOpen={openSections.page} onToggle={() => toggleSection('page')}>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Couleur de fond</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={articleConfig.pageBackgroundColor || '#f3f4f6'}
              onChange={(e) => onUpdateArticleConfig({ pageBackgroundColor: e.target.value })}
              className="w-10 h-9 border border-gray-200 rounded cursor-pointer"
            />
            <input
              type="text"
              value={articleConfig.pageBackgroundColor || '#f3f4f6'}
              onChange={(e) => onUpdateArticleConfig({ pageBackgroundColor: e.target.value })}
              className="flex-1 h-9 px-3 border border-gray-200 rounded text-sm"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* CTA Button */}
      <CollapsibleSection title="Bouton CTA" isOpen={openSections.cta} onToggle={() => toggleSection('cta')}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Couleur de fond</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={articleConfig.ctaBackgroundColor}
                onChange={(e) => onUpdateArticleConfig({ ctaBackgroundColor: e.target.value })}
                className="w-10 h-9 border border-gray-200 rounded cursor-pointer"
              />
              <input
                type="text"
                value={articleConfig.ctaBackgroundColor}
                onChange={(e) => onUpdateArticleConfig({ ctaBackgroundColor: e.target.value })}
                className="flex-1 h-9 px-3 border border-gray-200 rounded text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Couleur du texte</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={articleConfig.ctaTextColor}
                onChange={(e) => onUpdateArticleConfig({ ctaTextColor: e.target.value })}
                className="w-10 h-9 border border-gray-200 rounded cursor-pointer"
              />
              <input
                type="text"
                value={articleConfig.ctaTextColor}
                onChange={(e) => onUpdateArticleConfig({ ctaTextColor: e.target.value })}
                className="flex-1 h-9 px-3 border border-gray-200 rounded text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Rayon des coins</label>
            <input
              type="range"
              min="0"
              max="50"
              value={articleConfig.ctaBorderRadius}
              onChange={(e) => onUpdateArticleConfig({ ctaBorderRadius: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{articleConfig.ctaBorderRadius}px</span>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ArticleQuizSettingsPanel;
