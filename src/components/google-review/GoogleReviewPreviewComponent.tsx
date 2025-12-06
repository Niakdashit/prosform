import { useState } from "react";
import { useTheme, getFontFamily, getButtonStyles } from "@/contexts/ThemeContext";
import SmartWheel from "@/components/SmartWheel/SmartWheel";
import { SmartScratch } from "@/components/SmartScratch/SmartScratch";
import SmartJackpot from "@/components/SmartJackpot/SmartJackpot";
import { EditableTextBlock } from "@/components/EditableTextBlock";
import { ReviewView } from "./ReviewView";
import { 
  CampaignHeader, 
  CampaignFooter,
} from "@/components/campaign";
import type { GoogleReviewConfig } from './types';
import type { EditorView } from './GoogleReviewBuilder';

interface GoogleReviewPreviewComponentProps {
  config: GoogleReviewConfig;
  activeView: EditorView;
  viewMode: 'desktop' | 'mobile';
  isMobileResponsive?: boolean;
  onUpdateConfig?: (updates: Partial<GoogleReviewConfig>) => void;
}

export function GoogleReviewPreviewComponent({
  config,
  activeView,
  viewMode,
  isMobileResponsive = false,
  onUpdateConfig,
}: GoogleReviewPreviewComponentProps) {
  const { theme } = useTheme();
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // Obtenir les styles de bouton comme SmartWheel
  const buttonStyles = getButtonStyles(theme, viewMode === 'mobile' ? 'mobile' : 'desktop');

  // Fonction pour ajouter un bloc de texte
  const handleAddTextBlock = () => {
    const newId = `text-${Date.now()}`;
    const currentTexts = config.game.additionalTexts || [];
    onUpdateConfig?.({
      game: {
        ...config.game,
        additionalTexts: [...currentTexts, { id: newId, text: 'Nouveau texte' }]
      }
    });
  };

  // Fonction pour mettre à jour un bloc de texte additionnel
  const handleUpdateAdditionalText = (id: string, text: string, html?: string) => {
    const currentTexts = config.game.additionalTexts || [];
    onUpdateConfig?.({
      game: {
        ...config.game,
        additionalTexts: currentTexts.map(t => t.id === id ? { ...t, text, html } : t)
      }
    });
  };

  // Fonction pour supprimer un bloc de texte additionnel
  const handleRemoveAdditionalText = (id: string) => {
    const currentTexts = config.game.additionalTexts || [];
    onUpdateConfig?.({
      game: {
        ...config.game,
        additionalTexts: currentTexts.filter(t => t.id !== id)
      }
    });
  };

  const segments = config.wheelConfig?.segments || [];

  // Convertir les segments pour SmartWheel (ajouter 'value' requis)
  const wheelSegments = segments.map((seg) => ({
    id: seg.id,
    label: seg.label,
    value: seg.label, // SmartWheel requiert 'value'
    color: seg.color,
    textColor: seg.textColor || '#FFFFFF',
    probability: seg.probability || Math.floor(100 / segments.length),
    icon: seg.icon,
  }));

  // Fonction pour rendre le composant de jeu selon le type sélectionné
  const renderGameComponent = (options: { onSpin?: () => void; disabled?: boolean } = {}) => {
    const { onSpin, disabled = false } = options;
    const gameType = config.general.gameType;
    const size = viewMode === 'mobile' ? 280 : 350;

    switch (gameType) {
      case 'scratch':
        const cards = config.scratchConfig?.cards || [];
        const cardWidth = config.scratchConfig?.width || size;
        const cardHeight = config.scratchConfig?.height || (size * 0.65);
        
        // Afficher plusieurs cartes si configurées (max 4)
        if (cards.length > 1) {
          const displayCards = cards.slice(0, 4); // Maximum 4 cartes
          const cols = 2;
          const cardSize = viewMode === 'mobile' ? 166 : 204;
          const cardH = cardSize * 0.75;
          
          return (
            <div className="flex flex-col items-center gap-3">
              <div 
                className="grid gap-3"
                style={{ 
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                }}
              >
                {displayCards.map((card) => (
                  <div
                    key={card.id}
                    className="relative cursor-pointer transition-transform hover:scale-105"
                    style={{
                      width: cardSize,
                      height: cardH,
                      backgroundColor: config.scratchConfig?.scratchColor || '#C0C0C0',
                      borderRadius: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    {/* Texture de grattage */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-20"
                      style={{
                        background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)',
                      }}
                    />
                    {/* Icône centrale */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl opacity-50">🎁</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {cards.length} cartes • Grattez pour révéler
              </p>
            </div>
          );
        }
        
        // Une seule carte : afficher le SmartScratch interactif
        const displayCard = cards.length > 0 ? cards[0] : null;
        return (
          <SmartScratch
            width={cardWidth}
            height={cardHeight}
            scratchColor={config.scratchConfig?.scratchColor || '#C0C0C0'}
            scratchImage={displayCard?.scratchImage}
            revealImage={displayCard?.revealImage}
            revealText={displayCard?.revealText || '🎉 Gagné !'}
            threshold={config.scratchConfig?.scratchPercentage || 70}
            brushSize={config.scratchConfig?.brushSize || 30}
            disabled={disabled}
            onStart={onSpin}
            onComplete={() => {}}
            borderRadius={16}
          />
        );
      
      case 'jackpot':
        const jackpotSymbols = config.jackpotConfig?.symbols?.map(s => s.emoji || s.image || '🍒') || ['🍒', '🍋', '🍊', '🍇', '⭐', '💎'];
        return (
          <SmartJackpot
            symbols={jackpotSymbols}
            template={config.jackpotConfig?.template || 'jackpot-11'}
            spinDuration={config.jackpotConfig?.spinDuration || 2000}
            disabled={disabled}
            onWin={() => {}}
            onLose={() => {}}
          />
        );
      
      case 'wheel':
      default:
        return (
          <SmartWheel
            segments={wheelSegments}
            size={size}
            onSpin={onSpin}
            onResult={() => {}}
            disabled={disabled}
            borderStyle={theme.wheelBorderStyle === 'gold' ? 'goldRing' : theme.wheelBorderStyle === 'silver' ? 'silverRing' : theme.wheelBorderStyle}
            customBorderColor={theme.wheelBorderStyle === 'custom' ? theme.wheelBorderCustomColor : undefined}
            brandColors={{
              primary: theme.buttonColor || '#F5B800',
              secondary: theme.backgroundColor || '#FFFFFF',
              accent: theme.textColor || '#1F2937'
            }}
          />
        );
    }
  };

  // Rendu de la vue Instructions - affiche le jeu + modale si on clique sur "Faire tourner"
  const renderInstructions = () => (
    <div className="relative w-full h-full">
      {/* Vue du jeu avec SmartWheel - le bouton "Faire tourner" ouvre la modale */}
      <div 
        className="w-full h-full flex flex-col items-center justify-center p-6 overflow-auto"
        style={{ backgroundColor: theme.backgroundColor || '#FFFFFF' }}
      >
        {/* Titre - éditable in-line */}
        <EditableTextBlock
          value={config.game.titleHtml || config.game.title}
          onChange={(value, html) => onUpdateConfig?.({ game: { ...config.game, title: value, titleHtml: html } })}
          placeholder="Titre du jeu"
          className="text-2xl md:text-3xl font-bold text-center"
          style={{ 
            color: theme.textColor || '#1F2937',
            fontFamily: getFontFamily(theme.headingFontFamily),
          }}
          isEditing={editingField === 'instructions-title'}
          onFocus={() => setEditingField('instructions-title')}
          onBlur={() => setEditingField(null)}
          fieldType="title"
          marginBottom="8px"
        />

        {/* Sous-titre - éditable in-line */}
        <EditableTextBlock
          value={config.game.subtitleHtml || config.game.subtitle}
          onChange={(value, html) => onUpdateConfig?.({ game: { ...config.game, subtitle: value, subtitleHtml: html } })}
          placeholder="Sous-titre du jeu"
          className="text-center opacity-80"
          style={{ 
            color: theme.textColor || '#6B7280',
            fontFamily: getFontFamily(theme.fontFamily),
          }}
          isEditing={editingField === 'instructions-subtitle'}
          onFocus={() => setEditingField('instructions-subtitle')}
          onBlur={() => setEditingField(null)}
          fieldType="subtitle"
          marginBottom="16px"
          showAddButton
          onAddTextBlock={handleAddTextBlock}
        />

        {/* Blocs de texte additionnels */}
        {config.game.additionalTexts?.map((textBlock) => (
          <EditableTextBlock
            key={textBlock.id}
            value={textBlock.html || textBlock.text}
            onChange={(value, html) => handleUpdateAdditionalText(textBlock.id, value, html)}
            onClear={() => handleRemoveAdditionalText(textBlock.id)}
            placeholder="Texte additionnel"
            className="text-center opacity-80"
            style={{ 
              color: theme.textColor || '#6B7280',
              fontFamily: getFontFamily(theme.fontFamily),
            }}
            isEditing={editingField === `additional-${textBlock.id}`}
            onFocus={() => setEditingField(`additional-${textBlock.id}`)}
            onBlur={() => setEditingField(null)}
            fieldType="subtitle"
            marginBottom="16px"
            showClear
            showAddButton
            onAddTextBlock={handleAddTextBlock}
          />
        ))}

        {/* Espacement avant la roue */}
        <div style={{ marginBottom: '8px' }} />

        {/* Composant de jeu - masqué si modale ouverte */}
        {!showInstructionsModal && (
          <div className="relative flex-shrink-0">
            {renderGameComponent({ onSpin: () => setShowInstructionsModal(true), disabled: false })}
          </div>
        )}
      </div>
      
      {/* Modale d'instructions - s'affiche au clic sur le bouton */}
      {showInstructionsModal && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowInstructionsModal(false)}
        >
          <div 
            className="relative w-full max-w-sm bg-white p-6 shadow-2xl mx-4"
            style={{ 
              backgroundColor: config.instructions.backgroundColor,
              borderRadius: buttonStyles.borderRadius
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            
            {/* Titre */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {config.instructions.title}
              </h2>
              <div className="flex gap-0.5">
                <div className="w-3 h-5 bg-blue-600 rounded-l" />
                <div className="w-3 h-5 bg-white border-y border-gray-200" />
                <div className="w-3 h-5 bg-red-500 rounded-r" />
              </div>
            </div>

            {/* Liste des étapes */}
            <ol className="space-y-3 mb-8">
              {config.instructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="font-medium text-gray-500">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {/* Bouton avec logo Google - même style que SmartWheel */}
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="w-full font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              style={{
                ...buttonStyles,
                backgroundColor: theme.buttonColor || '#F5B800',
                color: theme.buttonTextColor || '#1F2937',
                boxShadow: `0 4px 14px ${(theme.buttonColor || '#F5B800')}40`
              }}
            >
              <img 
                src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
                alt="Google" 
                className="w-5 h-5"
              />
              {config.instructions.buttonText}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Rendu de la vue Avis
  const renderReview = () => (
    <div className="w-full h-full overflow-auto">
      <ReviewView
        config={config}
        onSelectRating={() => {}}
        onUpdateConfig={onUpdateConfig}
      />
    </div>
  );

  // Rendu de la vue Jeu (avec SmartWheel)
  const renderGame = () => (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-6 overflow-auto"
      style={{ backgroundColor: theme.backgroundColor || '#FFFFFF' }}
    >
      {/* Titre - éditable in-line */}
      <EditableTextBlock
        value={config.game.titleHtml || config.game.title}
        onChange={(value, html) => onUpdateConfig?.({ game: { ...config.game, title: value, titleHtml: html } })}
        placeholder="Titre du jeu"
        className="text-2xl md:text-3xl font-bold text-center"
        style={{ 
          color: theme.textColor || '#1F2937',
          fontFamily: getFontFamily(theme.headingFontFamily),
        }}
        isEditing={editingField === 'game-title'}
        onFocus={() => setEditingField('game-title')}
        onBlur={() => setEditingField(null)}
        fieldType="title"
        marginBottom="8px"
      />

      {/* Sous-titre - éditable in-line */}
      <EditableTextBlock
        value={config.game.subtitleHtml || config.game.subtitle}
        onChange={(value, html) => onUpdateConfig?.({ game: { ...config.game, subtitle: value, subtitleHtml: html } })}
        placeholder="Sous-titre du jeu"
        className="text-center opacity-80"
        style={{ 
          color: theme.textColor || '#6B7280',
          fontFamily: getFontFamily(theme.fontFamily),
        }}
        isEditing={editingField === 'game-subtitle'}
        onFocus={() => setEditingField('game-subtitle')}
        onBlur={() => setEditingField(null)}
        fieldType="subtitle"
        marginBottom="16px"
        showAddButton
        onAddTextBlock={handleAddTextBlock}
      />

      {/* Blocs de texte additionnels */}
      {config.game.additionalTexts?.map((textBlock) => (
        <EditableTextBlock
          key={textBlock.id}
          value={textBlock.html || textBlock.text}
          onChange={(value, html) => handleUpdateAdditionalText(textBlock.id, value, html)}
          onClear={() => handleRemoveAdditionalText(textBlock.id)}
          placeholder="Texte additionnel"
          className="text-center opacity-80"
          style={{ 
            color: theme.textColor || '#6B7280',
            fontFamily: getFontFamily(theme.fontFamily),
          }}
          isEditing={editingField === `game-additional-${textBlock.id}`}
          onFocus={() => setEditingField(`game-additional-${textBlock.id}`)}
          onBlur={() => setEditingField(null)}
          fieldType="subtitle"
          marginBottom="16px"
          showClear
          showAddButton
          onAddTextBlock={handleAddTextBlock}
        />
      ))}

      {/* Espacement avant la roue */}
      <div style={{ marginBottom: '8px' }} />

      {/* Composant de jeu */}
      <div className="relative flex-shrink-0">
        {renderGameComponent({ disabled: true })}
      </div>
    </div>
  );

  // Rendu de l'écran gagnant
  const renderEndingWin = () => (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-6 overflow-auto"
      style={{ backgroundColor: theme.backgroundColor || '#FFFFFF' }}
    >
      {/* Icône de victoire */}
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Titre - éditable in-line */}
      <EditableTextBlock
        value={config.result.winTitleHtml || config.result.winTitle}
        onChange={(value, html) => onUpdateConfig?.({ result: { ...config.result, winTitle: value, winTitleHtml: html } })}
        placeholder="Titre gagnant"
        className="text-2xl md:text-3xl font-bold text-center"
        style={{ 
          color: theme.textColor || '#1F2937',
          fontFamily: getFontFamily(theme.headingFontFamily),
        }}
        isEditing={editingField === 'win-title'}
        onFocus={() => setEditingField('win-title')}
        onBlur={() => setEditingField(null)}
        fieldType="title"
        marginBottom="8px"
      />

      {/* Sous-titre - éditable in-line */}
      <EditableTextBlock
        value={config.result.winSubtitle}
        onChange={(value, html) => onUpdateConfig?.({ result: { ...config.result, winSubtitle: value } })}
        placeholder="Sous-titre gagnant (utilisez {{prize}} pour le lot)"
        className="text-center opacity-80"
        style={{ 
          color: theme.textColor || '#6B7280',
          fontFamily: getFontFamily(theme.fontFamily),
        }}
        isEditing={editingField === 'win-subtitle'}
        onFocus={() => setEditingField('win-subtitle')}
        onBlur={() => setEditingField(null)}
        fieldType="subtitle"
        marginBottom="24px"
      />

      {/* QR Code placeholder */}
      {config.result.showQRCode && (
        <div 
          className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4"
          style={{ border: '2px dashed #E5E7EB' }}
        >
          <span className="text-gray-400 text-sm">QR Code</span>
        </div>
      )}

      {/* Numéro gagnant */}
      {config.result.showWinnerNumber && (
        <p className="text-sm text-gray-500">
          Numéro gagnant : <span className="font-mono font-bold">GR-2024-001</span>
        </p>
      )}
    </div>
  );

  // Rendu de l'écran perdant
  const renderEndingLose = () => (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-6 overflow-auto"
      style={{ backgroundColor: theme.backgroundColor || '#FFFFFF' }}
    >
      {/* Icône */}
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      {/* Titre - éditable in-line */}
      <EditableTextBlock
        value={config.result.loseTitleHtml || config.result.loseTitle}
        onChange={(value, html) => onUpdateConfig?.({ result: { ...config.result, loseTitle: value, loseTitleHtml: html } })}
        placeholder="Titre perdant"
        className="text-2xl md:text-3xl font-bold text-center"
        style={{ 
          color: theme.textColor || '#1F2937',
          fontFamily: getFontFamily(theme.headingFontFamily),
        }}
        isEditing={editingField === 'lose-title'}
        onFocus={() => setEditingField('lose-title')}
        onBlur={() => setEditingField(null)}
        fieldType="title"
        marginBottom="8px"
      />

      {/* Sous-titre - éditable in-line */}
      <EditableTextBlock
        value={config.result.loseSubtitle}
        onChange={(value, html) => onUpdateConfig?.({ result: { ...config.result, loseSubtitle: value } })}
        placeholder="Sous-titre perdant"
        className="text-center opacity-80 max-w-xs"
        style={{ 
          color: theme.textColor || '#6B7280',
          fontFamily: getFontFamily(theme.fontFamily),
        }}
        isEditing={editingField === 'lose-subtitle'}
        onFocus={() => setEditingField('lose-subtitle')}
        onBlur={() => setEditingField(null)}
        fieldType="subtitle"
        marginBottom="24px"
      />

      {/* Message d'encouragement */}
      <div 
        className="px-6 py-4 rounded-xl text-center max-w-sm"
        style={{ backgroundColor: theme.primaryColor + '20' }}
      >
        <p className="text-sm" style={{ color: theme.textColor }}>
          Merci d'avoir participé ! Revenez nous voir pour tenter à nouveau votre chance.
        </p>
      </div>
    </div>
  );

  // Sélection du rendu selon la vue active
  const renderContent = () => {
    switch (activeView) {
      case 'instructions':
        return renderInstructions();
      case 'review':
        return renderReview();
      case 'game':
        return renderGame();
      case 'ending-win':
        return renderEndingWin();
      case 'ending-lose':
        return renderEndingLose();
      default:
        return renderGame();
    }
  };

  return (
    <div 
      className={isMobileResponsive 
        ? "w-full h-full relative overflow-hidden" 
        : "flex items-center justify-center relative overflow-hidden"
      }
    >
      <div 
        className="relative overflow-hidden transition-all duration-300 flex-shrink-0 flex flex-col" 
        style={{ 
          backgroundColor: theme.backgroundColor || '#FFFFFF',
          width: isMobileResponsive ? '100%' : (viewMode === 'desktop' ? '1100px' : '375px'), 
          minWidth: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '1100px' : '375px'),
          maxWidth: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '1100px' : '375px'),
          height: isMobileResponsive ? '100%' : (viewMode === 'desktop' ? '620px' : '667px'),
          minHeight: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '620px' : '667px'),
          maxHeight: isMobileResponsive ? undefined : (viewMode === 'desktop' ? '620px' : '667px'),
        }}
      >
        {/* Contenu principal avec flex-1 pour prendre l'espace restant - même structure que WheelPreview */}
        <div className="flex-1 relative overflow-auto z-10 min-h-0 scrollbar-hide">
          {/* Header dans la zone scrollable, pas sticky */}
          {config.layout?.header?.enabled && (
            <div className="relative z-20">
              <CampaignHeader config={config.layout.header} isPreview />
            </div>
          )}

          {/* Contenu */}
          <div className="w-full h-full relative z-10">
            {renderContent()}
          </div>

          {/* Footer dans la zone scrollable */}
          {config.layout?.footer?.enabled && (
            <div className="relative z-10">
              <CampaignFooter config={config.layout.footer} isPreview />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
