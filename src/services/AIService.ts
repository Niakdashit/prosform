// Service AI utilisant Groq API
// La clé API est stockée dans .env.local (VITE_GROQ_API_KEY)

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Types pour les actions que l'IA peut effectuer
export type AIActionType = 
  | 'update_title' | 'update_subtitle' | 'update_button' | 'update_description' | 'update_color'
  | 'add_field' | 'remove_field' | 'update_fields' 
  | 'full_config'
  | 'update_segments' | 'update_segment_colors' | 'add_segment' | 'remove_segment'
  | 'update_quiz_questions' | 'add_question' | 'update_question'
  | 'update_scratch_cards' | 'update_jackpot_symbols'
  | 'apply_template' | 'update_theme_colors'
  | 'set_background_image' | 'set_logo' | 'set_game_image'
  | 'update_prizes';

export interface AIAction {
  type: AIActionType;
  field: string;
  value: any;
  view?: string;
}

// Configuration d'un champ de contact
export interface ContactFieldConfig {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

// Segment de roue
export interface WheelSegmentConfig {
  id: string;
  label: string;
  color: string;
  textColor?: string;
  probability?: number;
  isWinning?: boolean;
  prizeId?: string;
}

// Question de quiz
export interface QuizQuestionConfig {
  id: string;
  question: string;
  answers: { id: string; text: string; isCorrect: boolean }[];
  image?: string;
}

// Carte scratch
export interface ScratchCardConfig {
  id: string;
  label: string;
  image?: string;
  isWinning?: boolean;
  probability?: number;
}

// Symbole jackpot
export interface JackpotSymbolConfig {
  id: string;
  image: string;
  label: string;
  value?: number;
}

// Prix
export interface PrizeConfig {
  id: string;
  name: string;
  description?: string;
  image?: string;
  code?: string;
  quantity?: number;
}

// Templates/Styles prédéfinis
export type TemplateStyle = 
  | 'modern' | 'classic' | 'playful' | 'elegant' | 'minimal' | 'bold' | 'festive' | 'corporate'
  | 'christmas' | 'halloween' | 'summer' | 'spring' | 'blackfriday' | 'valentine' | 'newyear';

// Thème de couleurs
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  buttonBg?: string;
  buttonText?: string;
}

// Configuration complète d'une campagne
export interface FullCampaignConfig {
  template?: TemplateStyle;
  themeColors?: ThemeColors;
  logo?: string;
  backgroundImage?: string;
  welcomeScreen?: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    image?: string;
  };
  contactForm?: {
    title?: string;
    subtitle?: string;
    fields?: ContactFieldConfig[];
  };
  endingWin?: {
    title?: string;
    subtitle?: string;
    image?: string;
  };
  endingLose?: {
    title?: string;
    subtitle?: string;
  };
  // Éléments de jeu spécifiques
  segments?: WheelSegmentConfig[];
  questions?: QuizQuestionConfig[];
  scratchCards?: ScratchCardConfig[];
  jackpotSymbols?: JackpotSymbolConfig[];
  prizes?: PrizeConfig[];
}

// Médias uploadés par l'utilisateur
export interface UploadedMedia {
  id: string;
  type: 'image' | 'video' | 'logo';
  url: string;
  name: string;
}

export interface AIResponse {
  success: boolean;
  message: string;
  actions?: AIAction[];
  error?: string;
}

// Récupérer la clé API de manière sécurisée
const getApiKey = (): string => {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    console.error('VITE_GROQ_API_KEY not found in environment variables');
    throw new Error('API key not configured');
  }
  return key;
};

// Prompt système pour l'assistant de création de campagnes
const SYSTEM_PROMPT = `Tu es un assistant IA expert en création de campagnes marketing gamifiées.
Tu aides les utilisateurs à créer et personnaliser leurs campagnes (roue de la fortune, quiz, scratch cards, jackpot).

IMPORTANT: Quand l'utilisateur te demande de modifier quelque chose, tu DOIS retourner une réponse JSON avec les actions à effectuer.

## TEMPLATES PRÉDÉFINIS DISPONIBLES
Utilise ces templates pour créer des designs cohérents:
- "modern": Design épuré, couleurs vives, sans serif
- "classic": Design élégant, couleurs sobres, serif
- "playful": Design fun, couleurs pop, formes arrondies
- "elegant": Design luxe, or/noir/blanc
- "minimal": Design minimaliste, noir/blanc
- "bold": Design impactant, couleurs contrastées
- "festive": Design festif, confettis, couleurs joyeuses
- "corporate": Design professionnel, bleu/gris
- "christmas": Rouge/vert/or, flocons, sapin
- "halloween": Orange/noir/violet, citrouilles
- "summer": Jaune/bleu/orange, soleil, plage
- "spring": Rose/vert/jaune, fleurs
- "blackfriday": Noir/or/rouge, style promo
- "valentine": Rose/rouge, cœurs
- "newyear": Or/noir/argent, feux d'artifice

## PALETTES DE COULEURS PAR TEMPLATE
- modern: {"primary": "#6366f1", "secondary": "#8b5cf6", "accent": "#f59e0b", "background": "#ffffff", "text": "#1f2937"}
- elegant: {"primary": "#d4af37", "secondary": "#1a1a1a", "accent": "#ffffff", "background": "#0a0a0a", "text": "#ffffff"}
- playful: {"primary": "#f472b6", "secondary": "#a78bfa", "accent": "#34d399", "background": "#fef3c7", "text": "#1f2937"}
- christmas: {"primary": "#dc2626", "secondary": "#15803d", "accent": "#fbbf24", "background": "#fef2f2", "text": "#1f2937"}
- blackfriday: {"primary": "#000000", "secondary": "#fbbf24", "accent": "#ef4444", "background": "#18181b", "text": "#ffffff"}
- halloween: {"primary": "#f97316", "secondary": "#7c3aed", "accent": "#000000", "background": "#1c1917", "text": "#ffffff"}

## TYPES D'ACTIONS DISPONIBLES

### 1. Textes (titre, sous-titre, bouton)
{"type": "update_title|update_subtitle|update_button", "field": "title|subtitle|buttonText", "value": "...", "view": "welcome|contact|wheel|ending-win|ending-lose|result"}

### 2. Champs du formulaire de contact
- Ajouter: {"type": "add_field", "field": "fields", "value": {"id": "field_xxx", "type": "email|text|phone|select|checkbox|date", "label": "...", "required": true}, "view": "contact"}
- Supprimer: {"type": "remove_field", "field": "fields", "value": "Label du champ", "view": "contact"}
- Remplacer tous: {"type": "update_fields", "field": "fields", "value": [...], "view": "contact"}

### 3. Segments de roue
{"type": "update_segments", "field": "segments", "value": [
  {"id": "s1", "label": "-10%", "color": "#ef4444", "textColor": "#ffffff", "probability": 30, "isWinning": true},
  {"id": "s2", "label": "Perdu", "color": "#6b7280", "textColor": "#ffffff", "probability": 40, "isWinning": false},
  {"id": "s3", "label": "-20%", "color": "#22c55e", "textColor": "#ffffff", "probability": 20, "isWinning": true},
  {"id": "s4", "label": "-50%", "color": "#f59e0b", "textColor": "#000000", "probability": 10, "isWinning": true}
]}

### 4. Questions de quiz
{"type": "update_quiz_questions", "field": "questions", "value": [
  {"id": "q1", "question": "Quelle est la capitale de la France?", "answers": [
    {"id": "a1", "text": "Paris", "isCorrect": true},
    {"id": "a2", "text": "Lyon", "isCorrect": false},
    {"id": "a3", "text": "Marseille", "isCorrect": false}
  ]}
]}

### 5. Cartes scratch
{"type": "update_scratch_cards", "field": "cards", "value": [
  {"id": "c1", "label": "Gagné!", "isWinning": true, "probability": 30},
  {"id": "c2", "label": "Perdu", "isWinning": false, "probability": 70}
]}

### 6. Symboles jackpot
{"type": "update_jackpot_symbols", "field": "symbols", "value": [
  {"id": "sym1", "label": "Cerise", "image": "/gamification/neo/cherry.svg", "value": 10},
  {"id": "sym2", "label": "Citron", "image": "/gamification/neo/lemon.svg", "value": 20},
  {"id": "sym3", "label": "7", "image": "/gamification/neo/seven.svg", "value": 100}
]}

### 7. Appliquer un template prédéfini
{"type": "apply_template", "field": "template", "value": "modern|christmas|blackfriday|..."}

### 8. Couleurs du thème
{"type": "update_theme_colors", "field": "colors", "value": {"primary": "#6366f1", "secondary": "#8b5cf6", "accent": "#f59e0b", "background": "#ffffff", "text": "#1f2937"}}

### 9. Images (utilise les médias uploadés par l'utilisateur)
- Logo: {"type": "set_logo", "field": "logo", "value": "URL_DU_MEDIA_UPLOADE"}
- Background: {"type": "set_background_image", "field": "backgroundImage", "value": "URL", "view": "welcome|contact|..."}
- Image de jeu: {"type": "set_game_image", "field": "image", "value": "URL", "view": "welcome"}

### 10. Prix
{"type": "update_prizes", "field": "prizes", "value": [
  {"id": "p1", "name": "-10%", "description": "10% de réduction", "code": "PROMO10", "quantity": 100},
  {"id": "p2", "name": "-20%", "description": "20% de réduction", "code": "PROMO20", "quantity": 50}
]}

### 11. Configuration complète avec jeu
{"type": "full_config", "field": "campaign", "value": {
  "template": "blackfriday",
  "themeColors": {"primary": "#000", "secondary": "#fbbf24", "accent": "#ef4444", "background": "#18181b", "text": "#fff"},
  "welcomeScreen": {"title": "...", "subtitle": "...", "buttonText": "..."},
  "contactForm": {"title": "...", "subtitle": "...", "fields": [...]},
  "endingWin": {"title": "...", "subtitle": "..."},
  "endingLose": {"title": "...", "subtitle": "..."},
  "segments": [...],
  "prizes": [...]
}}

## RÈGLES IMPORTANTES

1. **Si l'utilisateur fournit des médias (logo, images)**: Utilise-les en priorité! Place le logo en haut, utilise les images comme backgrounds ou illustrations.

2. **Si pas de médias fournis**: Choisis un template prédéfini adapté au contexte de la campagne.

3. **Pour les segments de roue**: 
   - Propose 6-8 segments avec des probabilités réalistes
   - **LABELS COURTS** (max 10 caractères): "-10%", "Perdu", "-20%", "Rejouez", "Cadeau", "-50%"
   - **NE PAS** mettre le nom de la marque dans les segments
   - Utilise des couleurs contrastées du thème
   - Mix de gains et de cases "Perdu" ou "Rejouez"

4. **Pour les quiz**:
   - 3-5 questions en rapport avec le thème
   - 3-4 réponses par question
   - Questions engageantes et fun

5. **Couleurs**: Assure-toi que les couleurs sont harmonieuses et que le texte est lisible sur les fonds.

6. **Cohérence visuelle**:
   - Applique le même background à tous les écrans si fourni
   - Utilise "applyBackgroundToAll": true dans welcomeScreen
   - Les écrans de fin doivent avoir des images ou emojis festifs

## EXEMPLES

1. "Crée une campagne de Noël pour une bijouterie" →
{"message": "Voici votre campagne de Noël!", "actions": [{"type": "full_config", "field": "campaign", "value": {
  "template": "christmas",
  "themeColors": {"primary": "#dc2626", "secondary": "#15803d", "accent": "#fbbf24", "background": "#fef2f2", "text": "#1f2937"},
  "welcomeScreen": {"title": "🎄 Noël Magique 🎄", "subtitle": "Tournez la roue et gagnez des bijoux jusqu'à -50%!", "buttonText": "Ouvrir mon cadeau", "applyBackgroundToAll": true},
  "contactForm": {"title": "Vos coordonnées", "subtitle": "Pour recevoir votre cadeau", "fields": [{"id": "f1", "type": "text", "label": "Prénom", "required": true}, {"id": "f2", "type": "email", "label": "Email", "required": true}]},
  "endingWin": {"title": "🎁 Félicitations!", "subtitle": "Vous avez gagné {{prize}}! Votre code: {{code}}"},
  "endingLose": {"title": "😢 Dommage!", "subtitle": "Retentez votre chance demain!"},
  "segments": [
    {"id": "s1", "label": "-10%", "color": "#dc2626", "textColor": "#fff", "probability": 30, "isWinning": true},
    {"id": "s2", "label": "Perdu", "color": "#15803d", "textColor": "#fff", "probability": 25, "isWinning": false},
    {"id": "s3", "label": "-20%", "color": "#fbbf24", "textColor": "#000", "probability": 20, "isWinning": true},
    {"id": "s4", "label": "Rejouez", "color": "#dc2626", "textColor": "#fff", "probability": 15, "isWinning": false},
    {"id": "s5", "label": "-50%", "color": "#15803d", "textColor": "#fff", "probability": 5, "isWinning": true},
    {"id": "s6", "label": "Cadeau", "color": "#fbbf24", "textColor": "#000", "probability": 5, "isWinning": true}
  ],
  "prizes": [
    {"id": "p1", "name": "-10%", "code": "NOEL10", "quantity": 100},
    {"id": "p2", "name": "-20%", "code": "NOEL20", "quantity": 50},
    {"id": "p3", "name": "-50%", "code": "NOEL50", "quantity": 10},
    {"id": "p4", "name": "Cadeau surprise", "code": "GIFT", "quantity": 10}
  ]
}}]}

2. "Change les couleurs de la roue en dégradé de bleu" →
{"message": "J'ai mis à jour les couleurs de la roue!", "actions": [{"type": "update_segments", "field": "segments", "value": [
  {"id": "s1", "label": "-10%", "color": "#1e3a8a", "textColor": "#fff", "probability": 30, "isWinning": true},
  {"id": "s2", "label": "Perdu", "color": "#3b82f6", "textColor": "#fff", "probability": 25, "isWinning": false},
  {"id": "s3", "label": "-20%", "color": "#60a5fa", "textColor": "#000", "probability": 20, "isWinning": true},
  {"id": "s4", "label": "Rejouez", "color": "#93c5fd", "textColor": "#000", "probability": 15, "isWinning": false},
  {"id": "s5", "label": "-50%", "color": "#1e40af", "textColor": "#fff", "probability": 5, "isWinning": true},
  {"id": "s6", "label": "Jackpot", "color": "#2563eb", "textColor": "#fff", "probability": 5, "isWinning": true}
]}]}

3. "Applique le style Halloween" →
{"message": "Ambiance Halloween activée! 🎃", "actions": [
  {"type": "apply_template", "field": "template", "value": "halloween"},
  {"type": "update_theme_colors", "field": "colors", "value": {"primary": "#f97316", "secondary": "#7c3aed", "accent": "#000000", "background": "#1c1917", "text": "#ffffff"}}
]}

## RÈGLES IMPORTANTES

1. Si l'utilisateur demande une modification ou création de campagne, tu DOIS répondre UNIQUEMENT avec du JSON valide, sans texte avant ni après.
2. Le JSON doit être sur une seule structure: {"message": "...", "actions": [...]}
3. Ne mets PAS de blocs markdown \`\`\`json autour du JSON.
4. Si l'utilisateur pose une question sans demander de modification, réponds normalement en texte sans JSON.
5. Réponds toujours en français. Sois créatif, propose des designs engageants et des textes marketing percutants!
6. Pour une campagne complète, utilise TOUJOURS "type": "full_config" avec TOUTES les propriétés (welcomeScreen, contactForm, endingWin, endingLose, segments, prizes, themeColors).`;

export const AIService = {
  /**
   * Envoie un message à l'IA et retourne la réponse
   */
  async chat(userMessage: string, context?: string): Promise<AIResponse> {
    try {
      const apiKey = getApiKey();
      
      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
      ];
      
      // Ajouter le contexte si fourni
      if (context) {
        messages.push({
          role: 'system',
          content: `Contexte actuel de la campagne: ${context}`
        });
      }
      
      messages.push({ role: 'user', content: userMessage });

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7,
          max_tokens: 4096, // Augmenté pour les configurations complètes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content;

      if (!assistantMessage) {
        throw new Error('No response from AI');
      }

      // Essayer de parser la réponse comme JSON (pour les actions)
      try {
        // Méthode 1: Chercher un bloc JSON complet avec "message" et "actions"
        const jsonMatch = assistantMessage.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1].trim());
          return {
            success: true,
            message: parsed.message || 'Modifications appliquées.',
            actions: parsed.actions || [],
          };
        }
        
        // Méthode 2: Chercher un objet JSON brut dans la réponse
        const rawJsonMatch = assistantMessage.match(/\{\s*"message"\s*:\s*"[^"]*"\s*,\s*"actions"\s*:\s*\[[\s\S]*\]\s*\}/);
        if (rawJsonMatch) {
          const parsed = JSON.parse(rawJsonMatch[0]);
          return {
            success: true,
            message: parsed.message || 'Modifications appliquées.',
            actions: parsed.actions || [],
          };
        }
        
        // Méthode 3: Essayer de parser toute la réponse comme JSON
        if (assistantMessage.trim().startsWith('{')) {
          const parsed = JSON.parse(assistantMessage);
          if (parsed.actions) {
            return {
              success: true,
              message: parsed.message || 'Modifications appliquées.',
              actions: parsed.actions || [],
            };
          }
        }
        
        // Méthode 4: Chercher "Configuration complète" suivi de JSON
        const configMatch = assistantMessage.match(/\*\*Configuration complète[^*]*\*\*\s*```json\s*([\s\S]*?)```/i);
        if (configMatch) {
          const parsed = JSON.parse(configMatch[1].trim());
          return {
            success: true,
            message: parsed.message || 'Voici votre campagne personnalisée !',
            actions: parsed.actions || [],
          };
        }
        
        // Méthode 5: Extraire le JSON même s'il est mal formaté (entre les premiers { et derniers })
        const firstBrace = assistantMessage.indexOf('{');
        const lastBrace = assistantMessage.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          const jsonStr = assistantMessage.substring(firstBrace, lastBrace + 1);
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.actions || parsed.message) {
              return {
                success: true,
                message: parsed.message || 'Modifications appliquées.',
                actions: parsed.actions || [],
              };
            }
          } catch {
            // Continuer avec les autres méthodes
          }
        }
      } catch (parseError) {
        console.warn('JSON parsing failed:', parseError);
        // Ce n'est pas du JSON valide, c'est une réponse textuelle normale
      }

      return {
        success: true,
        message: assistantMessage,
      };
    } catch (error) {
      console.error('AI Service error:', error);
      return {
        success: false,
        message: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Génère des suggestions pour un élément spécifique
   */
  async suggest(element: string, currentValue: string): Promise<AIResponse> {
    const prompt = `Suggère 3 alternatives pour ce ${element}. Valeur actuelle: "${currentValue}". 
    Donne uniquement les suggestions, une par ligne, sans numérotation.`;
    return this.chat(prompt);
  },

  /**
   * Améliore un texte existant
   */
  async improve(text: string, type: 'title' | 'subtitle' | 'button' | 'description'): Promise<AIResponse> {
    const typeLabels = {
      title: 'titre',
      subtitle: 'sous-titre',
      button: 'texte de bouton',
      description: 'description'
    };
    const prompt = `Améliore ce ${typeLabels[type]} pour le rendre plus engageant: "${text}". 
    Donne une seule suggestion améliorée.`;
    return this.chat(prompt);
  }
};
