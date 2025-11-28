import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Upload, X } from 'lucide-react';
import { ArticleConfig } from './ArticleWheelBuilder';

interface ArticleWheelSettingsPanelProps {
  articleConfig: ArticleConfig;
  onUpdateArticleConfig: (updates: Partial<ArticleConfig>) => void;
}

// Palette de couleurs rapides
const quickColors = [
  // Row 1 - rainbow + whites/grays
  { color: 'rainbow', isGradient: true },
  '#ffffff',
  '#f8f9fa',
  '#e9ecef',
  '#dee2e6',
  // Row 2 - grays
  '#ced4da',
  '#adb5bd',
  '#6c757d',
  '#495057',
  '#343a40',
  // Row 3 - darks + colors
  '#212529',
  '#000000',
  '#ff6b6b',
  '#51cf66',
  '#339af0',
  // Row 4 - pastels
  '#69db7c',
  '#ffd43b',
  '#da77f2',
  '#ff922b',
  '#74c0fc',
];

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  isOpen,
  onToggle,
  children 
}) => {
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

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  value, 
  onChange,
  showFitOptions = false,
  fitMode = 'fill',
  onFitModeChange
}) => {
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
      {/* Upload zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
      >
        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 10MB</p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Fit options - always show if enabled */}
      {showFitOptions && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onFitModeChange?.('fill')}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              fitMode === 'fill' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Remplir
          </button>
          <button
            onClick={() => onFitModeChange?.('fit')}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              fitMode === 'fit' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Adapté
          </button>
        </div>
      )}

      {/* Thumbnail preview with delete button */}
      {value && (
        <div className="flex items-center gap-3 mt-3">
          <img 
            src={value} 
            alt={label} 
            className="w-16 h-12 object-cover rounded border border-gray-200"
          />
          <button
            onClick={() => onChange(undefined)}
            className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

interface ColorPickerGridProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const ColorPickerGrid: React.FC<ColorPickerGridProps> = ({ value, onChange, label }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      
      <div className="grid grid-cols-5 gap-2">
        {quickColors.map((color, i) => (
          <button
            key={i}
            onClick={() => {
              if (color === 'rainbow') {
                setShowCustomPicker(!showCustomPicker);
              } else {
                onChange(color as string);
              }
            }}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              value === color ? 'border-gray-800 scale-110' : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{
              background: color === 'rainbow' 
                ? 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' 
                : color as string,
            }}
          />
        ))}
      </div>

      {showCustomPicker && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-gray-200"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg"
            placeholder="#000000"
          />
        </div>
      )}
    </div>
  );
};

interface SliderWithInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
}

const SliderWithInput: React.FC<SliderWithInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  unit = 'px'
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: '#374151' }}
        />
        <div className="flex items-center">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 h-9 px-3 text-sm border border-gray-200 rounded-lg text-right"
          />
        </div>
      </div>
    </div>
  );
};

export const ArticleWheelSettingsPanel: React.FC<ArticleWheelSettingsPanelProps> = ({
  articleConfig,
  onUpdateArticleConfig,
}) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-2">
      {/* Section 1: Bannière */}
        <CollapsibleSection 
          title="Bannière" 
          isOpen={openSection === 'banner'}
          onToggle={() => toggleSection('banner')}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">Bannière</label>
          <ImageUploader
            label="Télécharger pour Desktop/Tablet"
            value={articleConfig.banner?.imageUrl}
            onChange={(url) => onUpdateArticleConfig({ 
              banner: { ...articleConfig.banner, imageUrl: url } 
            })}
          />

          <ColorPickerGrid
            label="Couleurs unies (rapide)"
            value={articleConfig.frameColor}
            onChange={(color) => onUpdateArticleConfig({ frameColor: color })}
          />

          <div className="border-t border-gray-100 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Cadre (arrondi + bordure)</h4>
            
            <SliderWithInput
              label="Largeur du cadre (px)"
              value={articleConfig.frameWidth}
              onChange={(v) => onUpdateArticleConfig({ frameWidth: v })}
              min={400}
              max={1200}
            />

            <SliderWithInput
              label="Arrondi du cadre (px)"
              value={articleConfig.frameBorderRadius}
              onChange={(v) => onUpdateArticleConfig({ frameBorderRadius: v })}
              min={0}
              max={50}
            />

            <SliderWithInput
              label="Épaisseur de bordure (px)"
              value={articleConfig.frameBorderWidth}
              onChange={(v) => onUpdateArticleConfig({ frameBorderWidth: v })}
              min={0}
              max={10}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de bordure</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={articleConfig.frameBorderColor}
                  onChange={(e) => onUpdateArticleConfig({ frameBorderColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer border border-gray-200"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 2: Couleurs */}
        <CollapsibleSection 
          title="Couleurs"
          isOpen={openSection === 'page'}
          onToggle={() => toggleSection('page')}
        >
          <ImageUploader
            label="Fond de page (plein écran)"
            value={articleConfig.pageBackgroundImage}
            onChange={(url) => onUpdateArticleConfig({ pageBackgroundImage: url })}
          />

          <ColorPickerGrid
            label="Couleurs unies"
            value={articleConfig.pageBackgroundColor || '#f3f4f6'}
            onChange={(color) => onUpdateArticleConfig({ pageBackgroundColor: color })}
          />
        </CollapsibleSection>

        {/* Section 3: En-tête */}
        <CollapsibleSection 
          title="En-tête"
          isOpen={openSection === 'header'}
          onToggle={() => toggleSection('header')}
        >
          <ImageUploader
            label="Télécharger une image d'en-tête"
            value={articleConfig.headerImage}
            onChange={(url) => onUpdateArticleConfig({ headerImage: url })}
            showFitOptions={true}
            fitMode={articleConfig.headerFitMode || 'fill'}
            onFitModeChange={(mode) => onUpdateArticleConfig({ headerFitMode: mode })}
          />
        </CollapsibleSection>

        {/* Section 4: Pied de page */}
        <CollapsibleSection 
          title="Pied de page"
          isOpen={openSection === 'footer'}
          onToggle={() => toggleSection('footer')}
        >
          <ImageUploader
            label="Télécharger une image de pied de page"
            value={articleConfig.footerImage}
            onChange={(url) => onUpdateArticleConfig({ footerImage: url })}
            showFitOptions={true}
            fitMode={articleConfig.footerFitMode || 'fill'}
            onFitModeChange={(mode) => onUpdateArticleConfig({ footerFitMode: mode })}
          />
        </CollapsibleSection>
    </div>
  );
};

export default ArticleWheelSettingsPanel;
