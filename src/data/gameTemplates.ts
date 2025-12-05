import { JackpotConfig } from "@/components/JackpotBuilder";

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  popularity: number;
  isNew?: boolean;
  isPremium?: boolean;
  // Config partielle à appliquer
  config: Partial<JackpotConfig>;
  // Style global
  colorPalette: {
    primary: string;    // Couleur de fond principale
    secondary: string;  // Couleur d'accent (boutons, highlights)
    tertiary: string;   // Couleur de texte
  };
  typography: {
    heading: string;
    body: string;
  };
  backgroundImage?: string;
}

export type TemplateCategory = 
  | "fitness"
  | "food"
  | "retail"
  | "beauty"
  | "tech"
  | "events"
  | "seasonal"
  | "minimal";

export const templateCategories: { id: TemplateCategory; name: string; icon: string }[] = [
  { id: "fitness", name: "Fitness & Sport", icon: "💪" },
  { id: "food", name: "Food & Restaurant", icon: "🍕" },
  { id: "retail", name: "Retail & Shopping", icon: "🛍️" },
  { id: "beauty", name: "Beauté & Wellness", icon: "💄" },
  { id: "tech", name: "Tech & Gaming", icon: "🎮" },
  { id: "events", name: "Événements", icon: "🎉" },
  { id: "seasonal", name: "Saisonnier", icon: "🎄" },
  { id: "minimal", name: "Minimaliste", icon: "✨" },
];

export const gameTemplates: GameTemplate[] = [
  // ============ FITNESS TEMPLATES ============
  {
    id: "fitness-gym-promo",
    name: "Gym Promo - 1 Mois Gratuit",
    description: "Template sombre avec accents vert fluo, parfait pour les salles de sport et promotions fitness.",
    category: "fitness",
    thumbnail: "/templates/jackpot/fitness-gym.jpg",
    popularity: 95,
    isNew: true,
    colorPalette: {
      primary: "#1a1a1a",      // Fond sombre
      secondary: "#b4ff4f",    // Vert fluo accent
      tertiary: "#f5f5f5",     // Texte clair
    },
    typography: {
      heading: "Montserrat",
      body: "Inter",
    },
    backgroundImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "GAGNEZ 1 MOIS DE FITNESS GRATUIT !",
        titleHtml: `<p style="text-transform: uppercase; font-weight: 800;">GAGNEZ <span style="background: #b4ff4f; color: #1a1a1a; padding: 2px 8px; border-radius: 4px;">1 MOIS DE FITNESS</span> GRATUIT !</p>`,
        subtitle: "Participez à notre jeu concours et tentez de remporter un mois complet d'entraînement gratuit dans notre salle de fitness.",
        buttonText: "Tenter ma chance",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#000000",
        overlayOpacity: 55,
      },
      contactForm: {
        enabled: true,
        title: "Vos coordonnées",
        subtitle: "Pour vous contacter si vous gagnez",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom complet' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
          { id: 'phone', type: 'phone', required: false, label: 'Téléphone' }
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "Faites tourner le jackpot !",
        subtitle: "Alignez 3 symboles identiques pour gagner",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2000,
      },
      symbols: [
        { id: '1', emoji: '💪', label: 'Muscle' },
        { id: '2', emoji: '🏋️', label: 'Haltère' },
        { id: '3', emoji: '🥇', label: 'Médaille' },
        { id: '4', emoji: '⭐', label: 'Étoile' },
        { id: '5', emoji: '🔥', label: 'Feu' },
        { id: '6', emoji: '💎', label: 'Diamant' },
      ],
      endingWin: {
        title: "FÉLICITATIONS ! 🎉",
        subtitle: "Vous avez gagné {{prize}} ! Notre équipe vous contactera très bientôt.",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Pas de chance cette fois !",
        subtitle: "Revenez demain pour une nouvelle tentative. Restez motivé ! 💪",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },

  // ============ EVENTS / OCEAN DIVING CONTEST ============
  {
    id: "events-ocean-diving",
    name: "Océan Org - Baptême de plongée",
    description: "Concours de plongée avec visuel bleu profond et bandeau blanc incliné.",
    category: "events",
    thumbnail: "/templates/jackpot/ocean-bapteme.jpg",
    popularity: 90,
    isNew: true,
    colorPalette: {
      primary: "#0a2943",   // Bleu profond
      secondary: "#ffffff", // Blanc pour bandeaux/cta
      tertiary: "#cbe7ff",  // Texte clair secondaire
    },
    typography: {
      heading: "Poppins",
      body: "Inter",
    },
    // Placez le visuel fourni dans /public/templates/jackpot/ocean-bapteme.jpg
    backgroundImage: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80&auto=format&fit=crop",
    // backgroundImage: "/templates/jackpot/ocean-bapteme.jpg",
    config: {
      welcomeScreen: {
        title: "Baptême de plongée",
        titleHtml: `
<div style="font-family:'Poppins', sans-serif; font-weight:800; text-transform:uppercase; color:#ffffff; display:flex; flex-direction:column; gap:14px; align-items:center; letter-spacing:0.5px;">
  <div style="font-size:22px; text-align:center; line-height:1.2;">Jouez et tentez de gagner un</div>
  <div style="background:#ffffff; color:#0a2943; padding:10px 18px; font-size:24px; transform: rotate(-2deg); box-shadow:0 8px 18px rgba(0,0,0,0.28); border:2px solid #ffffff; text-align:center;">Baptême de plongée</div>
  <div style="font-size:24px; letter-spacing:2px;">↓↓↓</div>
</div>`,
        subtitle: "Retrouvez toutes les informations nécessaires pour participer à notre concours de plongée en France directement dans la description !",
        buttonText: "Participer",
        blockSpacing: 0.9,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
        overlayEnabled: true,
        overlayColor: "#0a2943",
        overlayOpacity: 35,
        alignment: "center",
        applyBackgroundToAll: true,
      },
      contactForm: {
        enabled: true,
        title: "Inscription",
        subtitle: "Laissez vos coordonnées pour participer au tirage",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom complet' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
      jackpotScreen: {
        title: "Tournez et plongez",
        subtitle: "Gagnez votre baptême de plongée",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
        template: "jackpot-11",
        spinDuration: 2000,
      },
      symbols: [
        { id: '1', emoji: '🐠', label: 'Poisson' },
        { id: '2', emoji: '🐚', label: 'Coquillage' },
        { id: '3', emoji: '🌊', label: 'Vague' },
        { id: '4', emoji: '🤿', label: 'Masque' },
        { id: '5', emoji: '⚓', label: 'Ancre' },
        { id: '6', emoji: '🐬', label: 'Dauphin' },
      ],
      endingWin: {
        title: "Bravo, futur plongeur !",
        subtitle: "Vous remportez {{prize}} — nous revenons vers vous pour planifier votre baptême.",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
      endingLose: {
        title: "Merci d'avoir joué",
        subtitle: "Retentez demain et restez à l'affût des fonds marins !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
    },
  },

  // ============ SEASONAL - CONCORDIA NOËL ============ 
  {
    id: "seasonal-concordia-noel",
    name: "Concordia - Concours Noël",
    description: "Concours spécial Noël 100€ à gagner, visuel cadeau et bandeaux rouge/vert.",
    category: "seasonal",
    thumbnail: "/templates/jackpot/concordia-noel.jpg",
    popularity: 93,
    isNew: true,
    colorPalette: {
      primary: "#0b5a3a",   // Vert sapin
      secondary: "#e33434", // Rouge vif
      tertiary: "#ffffff",  // Texte blanc
    },
    typography: {
      heading: "Poppins",
      body: "Poppins",
    },
    // Image à placer dans public/templates/jackpot/concordia-noel.jpg (issue du visuel fourni)
    // Remplacez par le visuel fourni dans public/templates/jackpot/concordia-noel.jpg.
    // Fallback vers une photo Unsplash si le fichier n'est pas présent.
    backgroundImage: "https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=1200&q=80&auto=format&fit=crop",
    // backgroundImage: "/templates/jackpot/concordia-noel.jpg",
    // backgroundImageMobile: "/templates/jackpot/concordia-noel.jpg",
    config: {
      welcomeScreen: {
        title: "Concours",
        titleHtml: `
<div style="display:flex; flex-direction:column; gap:14px; align-items:center; text-transform:uppercase; font-family:'Poppins', sans-serif; font-weight:800; color:#ffffff;">
  <div style="transform: rotate(-7deg); background:#e33434; color:#ffffff; padding:8px 16px; border-radius:0px; font-size:16px; box-shadow:0 8px 18px rgba(0,0,0,0.28); border:2px solid #ffffff;">Concordia</div>
  <div style="display:flex; flex-direction:column; gap:10px; align-items:center; letter-spacing:0.5px;">
    <div style="background:#0b5a3a; color:#ffffff; padding:9px 20px; border-radius:0px; font-size:28px; box-shadow:0 8px 20px rgba(0,0,0,0.28); border:2px solid #ffffff;">Concours</div>
    <div style="background:#e33434; color:#ffffff; padding:9px 20px; border-radius:0px; font-size:26px; transform: rotate(-2deg); box-shadow:0 8px 20px rgba(0,0,0,0.28); border:2px solid #ffffff;">Spécial Noël</div>
    <div style="background:#0b5a3a; color:#ffffff; padding:9px 20px; border-radius:0px; font-size:24px; box-shadow:0 8px 20px rgba(0,0,0,0.28); border:2px solid #ffffff;">100€ à gagner !</div>
  </div>
</div>`,
        subtitle: "",
        buttonText: "Découvrir ici",
        blockSpacing: 0.7,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
        overlayEnabled: false,
        overlayColor: "#0b5a3a",
        overlayOpacity: 20,
        applyBackgroundToAll: true,
        alignment: "center",
        showImage: false,
      },
      contactForm: {
        enabled: true,
        title: "Participez",
        subtitle: "Laissez vos coordonnées pour le tirage au sort",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom complet' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
      jackpotScreen: {
        title: "Tournez pour gagner",
        subtitle: "100€ à gagner",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
        template: "jackpot-11",
        spinDuration: 2000,
      },
      symbols: [
        { id: '1', emoji: '🎄', label: 'Sapin' },
        { id: '2', emoji: '🎁', label: 'Cadeau' },
        { id: '3', emoji: '⭐', label: 'Étoile' },
        { id: '4', emoji: '🍬', label: 'Sucrerie' },
        { id: '5', emoji: '❄️', label: 'Flocon' },
        { id: '6', emoji: '🔔', label: 'Cloche' },
      ],
      endingWin: {
        title: "Félicitations !",
        subtitle: "Vous remportez {{prize}} — nous revenons vers vous très vite.",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
      endingLose: {
        title: "Merci d'avoir joué",
        subtitle: "Revenez demain pour une nouvelle chance !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
    },
  },

  // ============ EVENTS / SPRING CONTEST VISUAL ============ 
  {
    id: "spring-concours",
    name: "Concours Printemps",
    description: "Visuel concours printanier avec répétition typographique et polaroids.",
    category: "events",
    thumbnail: "/templates/jackpot/spring-concours.jpg",
    popularity: 91,
    isNew: true,
    colorPalette: {
      primary: "#5a4a46",   // fond brun-rosé
      secondary: "#ffffff", // texte clair
      tertiary: "#e6d0c0",  // texte secondaire
    },
    typography: {
      heading: "Poppins",
      body: "Inter",
    },
    // Image à placer dans public/templates/jackpot/spring-concours.jpg (issue du visuel fourni)
    backgroundImage: "/templates/jackpot/spring-concours.jpg",
    config: {
      welcomeScreen: {
        title: "CONCOURS",
        // Empilement typographique façon contour répété
        titleHtml: `<div style="font-family: 'Poppins', sans-serif; text-transform: uppercase; color: #ffffff; letter-spacing: 1px; display: grid; gap: 8px; text-align: center;">
  <div style="display:grid; gap:6px; font-size: 48px; font-weight: 800; line-height:1;">
    <span style="color:transparent; -webkit-text-stroke: 1px #ffffff; opacity:0.35;">Concours</span>
    <span style="color:transparent; -webkit-text-stroke: 1px #ffffff; opacity:0.35;">Concours</span>
    <span style="color:transparent; -webkit-text-stroke: 1px #ffffff; opacity:0.35;">Concours</span>
    <span style="color:transparent; -webkit-text-stroke: 1px #ffffff; opacity:0.35;">Concours</span>
    <span style="color:transparent; -webkit-text-stroke: 1px #ffffff; opacity:0.35;">Concours</span>
    <span style="color:#ffffff; font-size:52px; font-weight:800;">Concours</span>
  </div>
</div>`,
        subtitle: "Spécial Printemps",
        buttonText: "Participer",
        blockSpacing: 1,
        mobileLayout: "mobile-text-top",
        desktopLayout: "desktop-centered",
        overlayEnabled: true,
        overlayColor: "#5a4a46",
        overlayOpacity: 35,
      },
      contactForm: {
        enabled: true,
        title: "Inscription",
        subtitle: "Laissez vos coordonnées pour participer",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom complet' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-text-top",
        desktopLayout: "desktop-centered",
      },
      jackpotScreen: {
        title: "Tournez et gagnez",
        subtitle: "Concours Printemps",
        blockSpacing: 1,
        mobileLayout: "mobile-text-top",
        desktopLayout: "desktop-centered",
        template: "jackpot-11",
        spinDuration: 2000,
      },
      symbols: [
        { id: '1', emoji: '🌸', label: 'Fleur' },
        { id: '2', emoji: '📸', label: 'Photo' },
        { id: '3', emoji: '☀️', label: 'Soleil' },
        { id: '4', emoji: '🍹', label: 'Cocktail' },
        { id: '5', emoji: '📖', label: 'Livre' },
        { id: '6', emoji: '🧳', label: 'Voyage' },
      ],
      endingWin: {
        title: "Félicitations !",
        subtitle: "Vous remportez {{prize}} — restez à l’affût de nos surprises de printemps.",
        blockSpacing: 1,
        mobileLayout: "mobile-text-top",
        desktopLayout: "desktop-centered",
      },
      endingLose: {
        title: "Merci d'avoir participé",
        subtitle: "Revenez tenter votre chance, le printemps continue !",
        blockSpacing: 1,
        mobileLayout: "mobile-text-top",
        desktopLayout: "desktop-centered",
      },
    },
  },

  // ============ SEASONAL - PROMO NOËL -20% ============ 
  {
    id: "seasonal-noel-promo",
    name: "Promo Noël -20%",
    description: "Promo de Noël -20% avec code, fond rayé rouge/blanc et encart vert sapin.",
    category: "seasonal",
    thumbnail: "/templates/jackpot/seasonal-noel-promo.jpg",
    popularity: 89,
    isNew: true,
    colorPalette: {
      primary: "#0f3c32",   // Vert sapin
      secondary: "#b32025", // Rouge bordeaux
      tertiary: "#ffffff",  // Texte blanc
    },
    typography: {
      heading: "Poppins",
      body: "Poppins",
    },
    // Fond rayé rouge/blanc (data URI SVG) - remplaçable par upload si besoin
    backgroundImage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><rect width='40' height='40' fill='%23ffffff'/><path d='M-15 15 L15 -15 H35 L5 15 Z' stroke='%23b32025' stroke-width='8'/><path d='M5 35 L35 5 H55 L25 35 Z' stroke='%23b32025' stroke-width='8'/><path d='M25 55 L55 25 H75 L45 55 Z' stroke='%23b32025' stroke-width='8'/></svg>",
    config: {
      welcomeScreen: {
        title: "Promotion de Noël",
        titleHtml: `<div style="font-family: 'Poppins', sans-serif; text-transform: uppercase; color: #ffffff; letter-spacing: 1px; display: grid; gap: 10px; text-align: center; background: #0f3c32; padding: 22px 18px; border-radius: 10px; border: 2px solid #ffffff;">
  <span style="font-size: 12px;">@reallygreatsite</span>
  <span style="font-size: 18px;">Promotion de Noël</span>
  <span style="font-size: 56px; font-weight: 700; letter-spacing: 2px;">-20%</span>
  <span style="font-size: 16px;">Avec le code</span>
  <span style="font-size: 18px; font-weight: 600; padding: 10px 16px; border: 1px solid #ffffff; border-radius: 6px; display: inline-flex; justify-content: center;">NOËL20</span>
  <span style="font-size: 14px;">Valable sur toute la boutique</span>
</div>`,
        subtitle: "Valable sur toute la boutique",
        buttonText: "Utiliser NOËL20",
        blockSpacing: 1,
        mobileLayout: "mobile-text-top",
        desktopLayout: "desktop-centered",
        overlayEnabled: false,
        overlayColor: "#0f3c32",
        overlayOpacity: 40,
      },
      contactForm: {
        enabled: true,
        title: "Recevoir l'offre",
        subtitle: "Laissez vos coordonnées pour obtenir le code",
        blockSpacing: 1,
        fields: [
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
      jackpotScreen: {
        title: "Jeu spécial Noël",
        subtitle: "Tournez pour des cadeaux supplémentaires",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
        template: "jackpot-11",
        spinDuration: 2000,
      },
      symbols: [
        { id: '1', emoji: '🎄', label: 'Sapin' },
        { id: '2', emoji: '🎁', label: 'Cadeau' },
        { id: '3', emoji: '⭐', label: 'Étoile' },
        { id: '4', emoji: '🍬', label: 'Sucrerie' },
        { id: '5', emoji: '❄️', label: 'Flocon' },
        { id: '6', emoji: '🔔', label: 'Cloche' },
      ],
      endingWin: {
        title: "Joyeux Noël !",
        subtitle: "Vous gagnez {{prize}} + -20% avec NOËL20",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
      endingLose: {
        title: "Ce n'est pas fini",
        subtitle: "Utilisez quand même -20% avec le code NOËL20",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
    },
  },

  // ============ TRAVEL / SUMMER CONTEST ============ 
  {
    id: "travel-sun-contest",
    name: "Séjour au Soleil",
    description: "Template tropical avec fond feuille teal, badge jaune et call-to-action clair.",
    category: "events",
    thumbnail: "/templates/jackpot/travel-sun.jpg",
    popularity: 92,
    isNew: true,
    colorPalette: {
      primary: "#0e4a48",    // Teal profond
      secondary: "#f6c546",  // Jaune bouton
      tertiary: "#ffffff",   // Texte clair
    },
    typography: {
      heading: "Poppins",
      body: "Inter",
    },
    backgroundImage: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1200&q=80", // tropical leaves
    config: {
      welcomeScreen: {
        title: "Jeu concours",
        titleHtml: `<div style="font-family: 'Poppins', sans-serif; font-weight: 800; text-transform: uppercase; color: #ffffff; letter-spacing: 0.5px; display: inline-flex; flex-direction: column; gap: 10px;">
  <span style="background:#0e4a48; padding:12px 16px; border-radius:8px; box-shadow:0 8px 22px rgba(0,0,0,0.25);">Jeu concours</span>
  <span style="color:#ffffff; font-size:22px; text-transform: uppercase; letter-spacing: 0.6px;">Tentez de remporter 1 séjour au soleil</span>
</div>`,
        subtitle: "@reallygreatsite",
        buttonText: "VALEUR 890€",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#0f4b4a",
        overlayOpacity: 55,
      },
      contactForm: {
        enabled: true,
        title: "Inscription",
        subtitle: "Entrez vos coordonnées pour participer",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom complet' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
          { id: 'phone', type: 'phone', required: false, label: 'Téléphone' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "Séjour à gagner",
        subtitle: "Alignez 3 symboles pour décrocher votre voyage",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2000,
      },
      symbols: [
        { id: '1', emoji: '🌴', label: 'Palmier' },
        { id: '2', emoji: '☀️', label: 'Soleil' },
        { id: '3', emoji: '🌊', label: 'Vague' },
        { id: '4', emoji: '🍹', label: 'Cocktail' },
        { id: '5', emoji: '🧳', label: 'Valise' },
        { id: '6', emoji: '✈️', label: 'Avion' },
      ],
      endingWin: {
        title: "Félicitations !",
        subtitle: "Vous avez gagné {{prize}} — on vous contacte très vite.",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Ce n'est que partie remise",
        subtitle: "Retentez demain, le soleil vous attend !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },

  // ============ GAMING EVENT (from provided visual) ============
  {
    id: "gaming-concours",
    name: "Concours Jeux Vidéos",
    description: "Affiche concours gaming clair avec bandeaux rose/violet et illustrations console.",
    category: "tech",
    thumbnail: "/templates/jackpot/gaming-concours.jpg",
    popularity: 94,
    isNew: true,
    colorPalette: {
      primary: "#f3f3fa",     // Fond très clair
      secondary: "#8c7bff",   // Violet accent (bandeau)
      tertiary: "#111111",    // Texte foncé
    },
    typography: {
      heading: "Poppins",
      body: "Inter",
    },
    // Pas de background image : look clair et illustré
    config: {
      welcomeScreen: {
        title: "Concours de jeux vidéos",
        titleHtml: `<div style="text-transform: uppercase; font-weight: 800; font-family: 'Poppins', sans-serif; display: inline-flex; flex-direction: column; gap: 6px;">
  <span style="background:#f4a8ff; color:#ffffff; padding:6px 12px; border-radius:6px; letter-spacing:0.5px;">Concours</span>
  <span style="background:#8c7bff; color:#ffffff; padding:6px 12px; border-radius:6px; letter-spacing:0.5px;">De jeux vidéos</span>
</div>`,
        subtitle: "Le 10 Janvier à partir de 18h",
        buttonText: "Participer",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: false,
        backgroundImage: undefined,
      },
      contactForm: {
        enabled: true,
        title: "Inscription",
        subtitle: "Participez au concours et recevez les infos",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom complet' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "Tournois & Lots",
        subtitle: "Alignez 3 symboles gaming pour gagner",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2000,
      },
      symbols: [
        { id: '1', emoji: '🎮', label: 'Manette' },
        { id: '2', emoji: '🎧', label: 'Casque' },
        { id: '3', emoji: '🏆', label: 'Trophée' },
        { id: '4', emoji: '⏰', label: 'Horloge' },
        { id: '5', emoji: '🌙', label: 'Lune' },
        { id: '6', emoji: '👾', label: 'Alien' },
      ],
      endingWin: {
        title: "GG ! 🎉",
        subtitle: "Vous avez gagné {{prize}} — rendez-vous le 10 janvier !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "On se revoit en game",
        subtitle: "Retente ta chance, le tournoi commence le 10 janvier à 18h.",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },
  {
    id: "fitness-challenge",
    name: "Défi Fitness",
    description: "Template énergique pour challenges et compétitions sportives.",
    category: "fitness",
    thumbnail: "/templates/jackpot/fitness-challenge.jpg",
    popularity: 88,
    colorPalette: {
      primary: "#0f172a",
      secondary: "#f97316",
      tertiary: "#ffffff",
    },
    typography: {
      heading: "Bebas Neue",
      body: "Inter",
    },
    backgroundImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "RELEVEZ LE DÉFI !",
        subtitle: "Gagnez des équipements sportifs premium et des abonnements exclusifs.",
        buttonText: "Je participe",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#0f172a",
        overlayOpacity: 60,
      },
      symbols: [
        { id: '1', emoji: '🏆', label: 'Trophée' },
        { id: '2', emoji: '💪', label: 'Muscle' },
        { id: '3', emoji: '🎯', label: 'Cible' },
        { id: '4', emoji: '⚡', label: 'Éclair' },
        { id: '5', emoji: '🔥', label: 'Feu' },
        { id: '6', emoji: '🥊', label: 'Boxe' },
      ],
      contactForm: {
        enabled: true,
        title: "Inscrivez-vous",
        subtitle: "Quelques infos pour participer",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom complet' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "C'est parti !",
        subtitle: "Alignez 3 symboles pour gagner",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2000,
      },
      endingWin: {
        title: "CHAMPION ! 🏆",
        subtitle: "Vous avez remporté {{prize}} !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Presque !",
        subtitle: "Continuez à vous entraîner et revenez tenter votre chance !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },

  // ============ FOOD TEMPLATES ============
  {
    id: "food-restaurant",
    name: "Restaurant Gourmet",
    description: "Template élégant pour restaurants et établissements gastronomiques.",
    category: "food",
    thumbnail: "/templates/jackpot/food-restaurant.jpg",
    popularity: 92,
    colorPalette: {
      primary: "#1c1917",
      secondary: "#eab308",
      tertiary: "#fafaf9",
    },
    typography: {
      heading: "Playfair Display",
      body: "Lato",
    },
    backgroundImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "Gagnez un dîner pour 2 !",
        subtitle: "Tentez votre chance et offrez-vous une expérience gastronomique inoubliable.",
        buttonText: "Participer",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#1c1917",
        overlayOpacity: 50,
      },
      symbols: [
        { id: '1', emoji: '🍷', label: 'Vin' },
        { id: '2', emoji: '🍽️', label: 'Assiette' },
        { id: '3', emoji: '👨‍🍳', label: 'Chef' },
        { id: '4', emoji: '⭐', label: 'Étoile' },
        { id: '5', emoji: '🥂', label: 'Champagne' },
        { id: '6', emoji: '🍰', label: 'Dessert' },
      ],
      contactForm: {
        enabled: true,
        title: "Réservez votre place",
        subtitle: "Vos coordonnées pour le tirage",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
          { id: 'phone', type: 'phone', required: true, label: 'Téléphone' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "Tournez la roue !",
        subtitle: "3 symboles identiques = 1 dîner offert",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2500,
      },
      endingWin: {
        title: "Félicitations ! 🎉",
        subtitle: "Vous avez gagné {{prize}} ! Nous vous contacterons pour la réservation.",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Pas cette fois...",
        subtitle: "Mais profitez de -15% sur votre prochaine visite avec le code CHANCE15",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },
  {
    id: "food-pizza",
    name: "Pizzeria Fun",
    description: "Template coloré et fun pour pizzerias et fast-foods.",
    category: "food",
    thumbnail: "/templates/jackpot/food-pizza.jpg",
    popularity: 85,
    colorPalette: {
      primary: "#dc2626",
      secondary: "#fbbf24",
      tertiary: "#ffffff",
    },
    typography: {
      heading: "Fredoka One",
      body: "Nunito",
    },
    backgroundImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "🍕 Pizza Gratuite !",
        subtitle: "Jouez et gagnez une pizza de votre choix !",
        buttonText: "Je joue !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#dc2626",
        overlayOpacity: 70,
      },
      symbols: [
        { id: '1', emoji: '🍕', label: 'Pizza' },
        { id: '2', emoji: '🧀', label: 'Fromage' },
        { id: '3', emoji: '🍅', label: 'Tomate' },
        { id: '4', emoji: '🌶️', label: 'Piment' },
        { id: '5', emoji: '🫒', label: 'Olive' },
        { id: '6', emoji: '🍄', label: 'Champignon' },
      ],
      contactForm: {
        enabled: true,
        title: "Vos infos",
        subtitle: "Pour recevoir votre pizza !",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Prénom' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "C'est parti !",
        subtitle: "3 pizzas = 1 pizza gratuite !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2000,
      },
      endingWin: {
        title: "MAMMA MIA ! 🍕",
        subtitle: "Vous avez gagné {{prize}} !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Oups !",
        subtitle: "Pas de pizza cette fois, mais -10% sur votre commande !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },

  // ============ RETAIL TEMPLATES ============
  {
    id: "retail-fashion",
    name: "Mode & Fashion",
    description: "Template chic pour boutiques de mode et marques de vêtements.",
    category: "retail",
    thumbnail: "/templates/jackpot/retail-fashion.jpg",
    popularity: 90,
    colorPalette: {
      primary: "#18181b",
      secondary: "#f472b6",
      tertiary: "#fafafa",
    },
    typography: {
      heading: "Cormorant Garamond",
      body: "Raleway",
    },
    backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "Gagnez votre shopping !",
        subtitle: "Tentez de remporter une carte cadeau de 200€",
        buttonText: "Participer",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#18181b",
        overlayOpacity: 55,
      },
      symbols: [
        { id: '1', emoji: '👗', label: 'Robe' },
        { id: '2', emoji: '👠', label: 'Talon' },
        { id: '3', emoji: '👜', label: 'Sac' },
        { id: '4', emoji: '💎', label: 'Diamant' },
        { id: '5', emoji: '🛍️', label: 'Shopping' },
        { id: '6', emoji: '✨', label: 'Étoile' },
      ],
      contactForm: {
        enabled: true,
        title: "Inscrivez-vous",
        subtitle: "Pour recevoir votre gain",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "Faites tourner !",
        subtitle: "3 symboles = 1 carte cadeau",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2000,
      },
      endingWin: {
        title: "Bravo ! 🎉",
        subtitle: "Vous avez gagné {{prize}} !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Dommage !",
        subtitle: "Profitez quand même de -20% avec le code LUCKY20",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },

  // ============ BEAUTY TEMPLATES ============
  {
    id: "beauty-spa",
    name: "Spa & Wellness",
    description: "Template zen et relaxant pour spas et centres de bien-être.",
    category: "beauty",
    thumbnail: "/templates/jackpot/beauty-spa.jpg",
    popularity: 87,
    colorPalette: {
      primary: "#064e3b",
      secondary: "#a7f3d0",
      tertiary: "#ecfdf5",
    },
    typography: {
      heading: "Cormorant",
      body: "Quicksand",
    },
    backgroundImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "Offrez-vous un moment de détente",
        subtitle: "Gagnez un soin spa d'une valeur de 150€",
        buttonText: "Tenter ma chance",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#064e3b",
        overlayOpacity: 50,
      },
      symbols: [
        { id: '1', emoji: '🧘', label: 'Yoga' },
        { id: '2', emoji: '🌸', label: 'Fleur' },
        { id: '3', emoji: '💆', label: 'Massage' },
        { id: '4', emoji: '🕯️', label: 'Bougie' },
        { id: '5', emoji: '🌿', label: 'Plante' },
        { id: '6', emoji: '💎', label: 'Cristal' },
      ],
      contactForm: {
        enabled: true,
        title: "Vos coordonnées",
        subtitle: "Pour réserver votre soin",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
          { id: 'phone', type: 'phone', required: true, label: 'Téléphone' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "Respirez...",
        subtitle: "Et laissez la chance opérer",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 3000,
      },
      endingWin: {
        title: "Namaste 🙏",
        subtitle: "Vous avez gagné {{prize}} ! Prenez rendez-vous.",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Ce n'est que partie remise",
        subtitle: "Profitez de -25% sur votre premier soin",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },

  // ============ TECH TEMPLATES ============
  {
    id: "tech-gaming",
    name: "Gaming Zone",
    description: "Template néon pour gaming et esports.",
    category: "tech",
    thumbnail: "/templates/jackpot/tech-gaming.jpg",
    popularity: 93,
    isNew: true,
    colorPalette: {
      primary: "#0c0a09",
      secondary: "#8b5cf6",
      tertiary: "#e0e7ff",
    },
    typography: {
      heading: "Orbitron",
      body: "Exo 2",
    },
    backgroundImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "🎮 JACKPOT GAMER",
        subtitle: "Gagnez des accessoires gaming et des jeux vidéo !",
        buttonText: "PLAY",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#0c0a09",
        overlayOpacity: 65,
      },
      symbols: [
        { id: '1', emoji: '🎮', label: 'Manette' },
        { id: '2', emoji: '🕹️', label: 'Joystick' },
        { id: '3', emoji: '💻', label: 'PC' },
        { id: '4', emoji: '🎧', label: 'Casque' },
        { id: '5', emoji: '⚡', label: 'Power' },
        { id: '6', emoji: '🏆', label: 'Trophée' },
      ],
      contactForm: {
        enabled: true,
        title: "Pseudo & Contact",
        subtitle: "Pour recevoir ton loot",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Pseudo' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "SPIN TO WIN",
        subtitle: "3 symboles = EPIC LOOT",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 1800,
      },
      endingWin: {
        title: "GG WP ! 🏆",
        subtitle: "Tu as drop {{prize}} !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "GAME OVER",
        subtitle: "Retry demain pour un nouveau run !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },

  // ============ EVENTS TEMPLATES ============
  {
    id: "events-party",
    name: "Soirée VIP",
    description: "Template festif pour événements et soirées.",
    category: "events",
    thumbnail: "/templates/jackpot/events-party.jpg",
    popularity: 86,
    colorPalette: {
      primary: "#1e1b4b",
      secondary: "#fbbf24",
      tertiary: "#fef3c7",
    },
    typography: {
      heading: "Poppins",
      body: "Inter",
    },
    backgroundImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "🎉 Gagnez vos places VIP !",
        subtitle: "Accès exclusif, champagne offert et rencontre avec les artistes.",
        buttonText: "Participer",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#1e1b4b",
        overlayOpacity: 60,
      },
      symbols: [
        { id: '1', emoji: '🎉', label: 'Confetti' },
        { id: '2', emoji: '🥂', label: 'Champagne' },
        { id: '3', emoji: '🎵', label: 'Musique' },
        { id: '4', emoji: '⭐', label: 'Star' },
        { id: '5', emoji: '🎤', label: 'Micro' },
        { id: '6', emoji: '💃', label: 'Danse' },
      ],
      contactForm: {
        enabled: true,
        title: "Réservation",
        subtitle: "Vos coordonnées pour le pass VIP",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom complet' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
          { id: 'phone', type: 'phone', required: true, label: 'Téléphone' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "Let's Party !",
        subtitle: "3 symboles = Pass VIP",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2200,
      },
      endingWin: {
        title: "YOU'RE IN ! 🎉",
        subtitle: "Vous avez gagné {{prize}} !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Pas cette fois...",
        subtitle: "Mais profitez de -30% sur les entrées standard !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },

  // ============ SEASONAL TEMPLATES ============
  {
    id: "seasonal-christmas",
    name: "Noël Magique",
    description: "Template festif pour les fêtes de fin d'année.",
    category: "seasonal",
    thumbnail: "/templates/jackpot/seasonal-christmas.jpg",
    popularity: 91,
    colorPalette: {
      primary: "#14532d",
      secondary: "#dc2626",
      tertiary: "#fef2f2",
    },
    typography: {
      heading: "Mountains of Christmas",
      body: "Nunito",
    },
    backgroundImage: "https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "🎄 Le Jackpot de Noël !",
        subtitle: "Gagnez des cadeaux magiques pour les fêtes",
        buttonText: "Ouvrir mon cadeau",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#14532d",
        overlayOpacity: 55,
      },
      symbols: [
        { id: '1', emoji: '🎄', label: 'Sapin' },
        { id: '2', emoji: '🎅', label: 'Père Noël' },
        { id: '3', emoji: '🎁', label: 'Cadeau' },
        { id: '4', emoji: '⭐', label: 'Étoile' },
        { id: '5', emoji: '❄️', label: 'Flocon' },
        { id: '6', emoji: '🔔', label: 'Cloche' },
      ],
      contactForm: {
        enabled: true,
        title: "Votre lettre au Père Noël",
        subtitle: "Vos coordonnées pour recevoir votre cadeau",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Prénom' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "Ho Ho Ho !",
        subtitle: "3 symboles = 1 cadeau magique",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2500,
      },
      endingWin: {
        title: "Joyeux Noël ! 🎄",
        subtitle: "Le Père Noël vous offre {{prize}} !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Le Père Noël reviendra...",
        subtitle: "Revenez demain pour une nouvelle chance !",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },

  // ============ MINIMAL TEMPLATES ============
  {
    id: "minimal-clean",
    name: "Clean & Simple",
    description: "Template minimaliste et épuré pour toutes les marques.",
    category: "minimal",
    thumbnail: "/templates/jackpot/minimal-clean.jpg",
    popularity: 84,
    colorPalette: {
      primary: "#ffffff",
      secondary: "#18181b",
      tertiary: "#3f3f46",
    },
    typography: {
      heading: "DM Sans",
      body: "Inter",
    },
    config: {
      welcomeScreen: {
        title: "Tentez votre chance",
        subtitle: "Un jeu simple, des gains exceptionnels.",
        buttonText: "Jouer",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      symbols: [
        { id: '1', emoji: '⬛', label: 'Carré' },
        { id: '2', emoji: '⬜', label: 'Blanc' },
        { id: '3', emoji: '🔲', label: 'Cadre' },
        { id: '4', emoji: '◾', label: 'Petit' },
        { id: '5', emoji: '◽', label: 'Mini' },
        { id: '6', emoji: '▪️', label: 'Point' },
      ],
      contactForm: {
        enabled: true,
        title: "Vos coordonnées",
        subtitle: "Simple et rapide",
        blockSpacing: 1,
        fields: [
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "C'est parti",
        subtitle: "Alignez 3 symboles",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2000,
      },
      endingWin: {
        title: "Bravo",
        subtitle: "Vous avez gagné {{prize}}",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Dommage",
        subtitle: "Réessayez demain",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },

  // ============ TECH TALK PODCAST ============
  {
    id: "tech-talk-podcast",
    name: "Tech Talk Podcast",
    description: "Template moderne avec effet glassmorphism, idéal pour les podcasts tech et événements digitaux.",
    category: "tech",
    thumbnail: "/templates/jackpot/tech-talk.jpg",
    popularity: 88,
    isNew: true,
    colorPalette: {
      primary: "#2d1f3d",      // Fond violet sombre
      secondary: "#e8a4c9",    // Rose accent
      tertiary: "#ffffff",     // Texte blanc
    },
    typography: {
      heading: "Poppins",
      body: "Inter",
    },
    backgroundImage: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "Tech Talk",
        titleHtml: `<p style="font-weight: 800; font-size: 3em; line-height: 1;">tech<br/>talk</p>`,
        subtitle: "Let's discuss technology! Le premier épisode est maintenant disponible.",
        buttonText: "Participer",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
        overlayEnabled: true,
        overlayColor: "#2d1f3d",
        overlayOpacity: 60,
      },
      contactForm: {
        enabled: true,
        title: "Rejoignez la communauté",
        subtitle: "Recevez les prochains épisodes",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
      jackpotScreen: {
        title: "Tentez votre chance !",
        subtitle: "Gagnez des goodies tech exclusifs",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
        template: "jackpot-11",
        spinDuration: 2500,
      },
      symbols: [
        { id: '1', emoji: '🎙️', label: 'Micro' },
        { id: '2', emoji: '💻', label: 'Laptop' },
        { id: '3', emoji: '🎧', label: 'Casque' },
        { id: '4', emoji: '📱', label: 'Phone' },
        { id: '5', emoji: '⚡', label: 'Tech' },
        { id: '6', emoji: '🚀', label: 'Rocket' },
      ],
      endingWin: {
        title: "Félicitations !",
        subtitle: "Vous avez gagné {{prize}}",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
      endingLose: {
        title: "Pas cette fois",
        subtitle: "Abonnez-vous pour retenter",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-centered",
      },
    },
  },

  // ============ BUSINESS GROWTH ============
  {
    id: "business-growth-strategy",
    name: "Business Growth Strategy",
    description: "Template professionnel noir et vert lime, parfait pour le marketing B2B et les consultants.",
    category: "retail",
    thumbnail: "/templates/jackpot/business-growth.jpg",
    popularity: 92,
    isNew: true,
    colorPalette: {
      primary: "#1a1a1a",      // Fond noir
      secondary: "#c8ff00",    // Vert lime accent
      tertiary: "#ffffff",     // Texte blanc
    },
    typography: {
      heading: "Montserrat",
      body: "Inter",
    },
    backgroundImage: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "Your Business. My Strategy.",
        titleHtml: `<p style="font-weight: 400;">Your <strong>Business.</strong><br/>My <strong>Strategy.</strong><br/><em style="color: #c8ff00;">Unlimited Growth.</em></p>`,
        subtitle: "Proven marketing systems built to scale your success.",
        buttonText: "Contact Us",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#000000",
        overlayOpacity: 70,
      },
      contactForm: {
        enabled: true,
        title: "Parlons de votre projet",
        subtitle: "Obtenez une consultation gratuite",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Nom complet' },
          { id: 'email', type: 'email', required: true, label: 'Email professionnel' },
          { id: 'phone', type: 'phone', required: true, label: 'Téléphone' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "Gagnez une consultation !",
        subtitle: "Alignez 3 symboles pour gagner",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2500,
      },
      symbols: [
        { id: '1', emoji: '📈', label: 'Growth' },
        { id: '2', emoji: '💼', label: 'Business' },
        { id: '3', emoji: '🎯', label: 'Target' },
        { id: '4', emoji: '💡', label: 'Idea' },
        { id: '5', emoji: '🏆', label: 'Win' },
        { id: '6', emoji: '⚡', label: 'Power' },
      ],
      endingWin: {
        title: "Bravo !",
        subtitle: "Vous avez gagné {{prize}}",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Merci pour votre intérêt",
        subtitle: "Nous vous contacterons bientôt",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },

  // ============ EXPLORE LEARN INNOVATE ============
  {
    id: "explore-learn-innovate",
    name: "Explore, Learn, Innovate",
    description: "Template moderne bleu nuit avec accents néon, idéal pour les formations et produits digitaux.",
    category: "tech",
    thumbnail: "/templates/jackpot/explore-innovate.jpg",
    popularity: 85,
    isNew: true,
    colorPalette: {
      primary: "#0a1628",      // Bleu nuit profond
      secondary: "#e040fb",    // Magenta néon
      tertiary: "#ffffff",     // Texte blanc
    },
    typography: {
      heading: "Poppins",
      body: "Inter",
    },
    backgroundImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    config: {
      welcomeScreen: {
        title: "Explore, Learn, Innovate.",
        titleHtml: `<p style="font-weight: 700; font-style: italic; font-size: 2.5em; line-height: 1.1;">Explore,<br/>Learn,<br/>Innovate.</p>`,
        subtitle: "Get my freebie and be productive today!",
        buttonText: "Télécharger",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        overlayEnabled: true,
        overlayColor: "#0a1628",
        overlayOpacity: 75,
      },
      contactForm: {
        enabled: true,
        title: "Accédez au contenu gratuit",
        subtitle: "Entrez vos informations",
        blockSpacing: 1,
        fields: [
          { id: 'name', type: 'text', required: true, label: 'Prénom' },
          { id: 'email', type: 'email', required: true, label: 'Email' },
        ],
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      jackpotScreen: {
        title: "Bonus surprise !",
        subtitle: "Gagnez un accès premium",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
        template: "jackpot-11",
        spinDuration: 2500,
      },
      symbols: [
        { id: '1', emoji: '🎓', label: 'Learn' },
        { id: '2', emoji: '💡', label: 'Innovate' },
        { id: '3', emoji: '🔮', label: 'Explore' },
        { id: '4', emoji: '📚', label: 'Book' },
        { id: '5', emoji: '🚀', label: 'Launch' },
        { id: '6', emoji: '✨', label: 'Magic' },
      ],
      endingWin: {
        title: "Incroyable !",
        subtitle: "Vous avez débloqué {{prize}}",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
      endingLose: {
        title: "Merci !",
        subtitle: "Votre freebie arrive par email",
        blockSpacing: 1,
        mobileLayout: "mobile-vertical",
        desktopLayout: "desktop-right-left",
      },
    },
  },
];

// Helper functions
export const getTemplatesByCategory = (category: TemplateCategory): GameTemplate[] => {
  return gameTemplates.filter(t => t.category === category);
};

export const searchTemplates = (query: string): GameTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return gameTemplates.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.category.toLowerCase().includes(lowerQuery)
  );
};

// Alias pour compatibilité avec l'ancien code
export type JackpotTemplate = GameTemplate;
export type JackpotTemplateCategory = TemplateCategory;
export const jackpotTemplates = gameTemplates;
export const jackpotTemplateCategories = templateCategories;
export const searchJackpotTemplates = searchTemplates;
export const getJackpotTemplatesByCategory = getTemplatesByCategory;
