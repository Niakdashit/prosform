// Templates Pro - High-Converting Form Templates
// Expert-level templates for Lead Generation, Marketing & Sales
import { FormTemplate } from "./templates";

// =============================================================================
// TEMPLATE 1: E-COMMERCE DISCOUNT CAPTURE
// Objectif: Capturer des emails en échange d'une réduction (comme Typeform Oasis)
// Angle marketing: Réciprocité + Urgence + Personnalisation
// =============================================================================
// PALETTE: Warm Neutrals (Elegant E-commerce)
export const ecommerceDiscountTemplate: FormTemplate = {
  id: "ecommerce-discount-1",
  name: "E-commerce Lead Magnet",
  description: "Capturez des emails qualifiés avec une offre de réduction irrésistible. Inspiré des meilleures pratiques e-commerce.",
  category: "lead-generation",
  thumbnail: "/templates/ecommerce-discount.png",
  color: "#FDFBF7",
  accentColor: "#1A1A1A",
  backgroundColor: "#FDFBF7",
  colorPalette: {
    primary: "#1A1A1A",    // Deep black
    secondary: "#8B7355",  // Warm taupe
    tertiary: "#FDFBF7",   // Warm white
  },
  typography: {
    heading: "Libre Baskerville",
    body: "Inter",
  },
  tags: ["e-commerce", "discount", "email-capture", "newsletter", "retail"],
  popularity: 99,
  isNew: true,
  layoutStyle: "minimal",
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "rounded",
  fontStyle: "serif",
  brandName: "Oasis",
  backgroundImages: [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&q=80",
    "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=900&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Want 15% off your next purchase?",
      subtitle: "Sign up for our newsletter and we'll send you an exclusive discount.",
      buttonText: "Sign up",
      icon: "gift"
    },
    {
      id: "q1",
      type: "choice",
      title: "How often do you buy new bedding?",
      icon: "shopping-bag",
      number: 1,
      choices: [
        "Rarely — every two years or less",
        "Regularly — once or twice per year", 
        "Very often — more than three times per year"
      ]
    },
    {
      id: "q2",
      type: "email",
      title: "And your email, {{name}}?",
      subtitle: "We'll send your 15% discount code here.",
      icon: "mail",
      number: 2,
      placeholder: "name@example.com"
    },
    {
      id: "q3",
      type: "picture-choice",
      title: "What kind of products are you most interested in?",
      subtitle: "Choose as many as you like",
      icon: "image",
      number: 3,
      choices: ["Muslin", "Cotton", "Linen", "Silk"]
    },
    {
      id: "q4",
      type: "choice",
      title: "What's your preferred style?",
      icon: "palette",
      number: 4,
      choices: [
        "Minimalist & Modern",
        "Classic & Timeless",
        "Bohemian & Eclectic",
        "Luxurious & Elegant"
      ]
    },
    {
      id: "q5",
      type: "date",
      title: "Before you go, what's your birthday?",
      subtitle: "We'll send you a special treat 🎂",
      icon: "calendar",
      number: 5
    },
    {
      id: "ending",
      type: "ending",
      title: "Check your inbox!",
      subtitle: "Your 15% discount code is on its way. Happy shopping!",
      icon: "check-circle",
      buttonText: "Start Shopping"
    }
  ]
};

// =============================================================================
// TEMPLATE 2: AUDIT GRATUIT / DIAGNOSTIC
// Objectif: Qualifier des leads B2B avec un audit personnalisé
// Angle marketing: Valeur perçue élevée + Expertise + Personnalisation
// =============================================================================
// PALETTE: Sapphire Blue (Trust & Expertise)
export const freeAuditTemplate: FormTemplate = {
  id: "free-audit-1",
  name: "Audit Gratuit - Lead Qualifier",
  description: "Qualifiez vos prospects B2B avec un audit personnalisé. Parfait pour agences et consultants.",
  category: "lead-generation",
  thumbnail: "/templates/free-audit.png",
  color: "#0F172A",
  accentColor: "#3B82F6",
  backgroundColor: "#0F172A",
  colorPalette: {
    primary: "#1E3A8A",    // Deep sapphire
    secondary: "#3B82F6",  // Bright blue
    tertiary: "#EFF6FF",   // Ice blue white
  },
  typography: {
    heading: "Space Grotesk",
    body: "Inter",
  },
  gradientStart: "#1E3A8A",
  gradientEnd: "#3B82F6",
  gradientAngle: 135,
  tags: ["audit", "b2b", "consulting", "agency", "qualification"],
  popularity: 96,
  isPremium: true,
  layoutStyle: "gradient",
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "STRATEX",
  backgroundImages: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Obtenez votre audit digital gratuit",
      subtitle: "En 3 minutes, découvrez les opportunités cachées pour booster votre croissance. Valeur: 500€ — Offert.",
      buttonText: "Démarrer mon audit",
      icon: "zap"
    },
    {
      id: "q1",
      type: "choice",
      title: "Quel est votre secteur d'activité ?",
      icon: "briefcase",
      number: 1,
      choices: [
        "E-commerce / Retail",
        "SaaS / Tech",
        "Services B2B",
        "Immobilier",
        "Santé / Bien-être",
        "Finance / Assurance",
        "Autre"
      ]
    },
    {
      id: "q2",
      type: "choice",
      title: "Quel est votre chiffre d'affaires annuel ?",
      subtitle: "Cela nous aide à calibrer nos recommandations.",
      icon: "trending-up",
      number: 2,
      choices: [
        "Moins de 100K€",
        "100K€ - 500K€",
        "500K€ - 1M€",
        "1M€ - 5M€",
        "Plus de 5M€"
      ]
    },
    {
      id: "q3",
      type: "choice",
      title: "Quel est votre principal défi actuellement ?",
      icon: "target",
      number: 3,
      choices: [
        "Générer plus de leads qualifiés",
        "Améliorer mon taux de conversion",
        "Augmenter ma visibilité en ligne",
        "Automatiser mes processus marketing",
        "Fidéliser mes clients existants"
      ]
    },
    {
      id: "q4",
      type: "choice",
      title: "Quel budget mensuel consacrez-vous au marketing ?",
      icon: "dollar-sign",
      number: 4,
      choices: [
        "Moins de 1 000€",
        "1 000€ - 5 000€",
        "5 000€ - 15 000€",
        "15 000€ - 50 000€",
        "Plus de 50 000€"
      ]
    },
    {
      id: "q5",
      type: "short-text",
      title: "Quelle est l'URL de votre site web ?",
      subtitle: "Nous analyserons votre présence digitale.",
      icon: "globe",
      number: 5,
      placeholder: "https://votresite.com"
    },
    {
      id: "q6",
      type: "short-text",
      title: "Quel est votre prénom ?",
      icon: "user",
      number: 6,
      placeholder: "Votre prénom"
    },
    {
      id: "q7",
      type: "email",
      title: "Où souhaitez-vous recevoir votre audit, {{name}} ?",
      icon: "mail",
      number: 7,
      placeholder: "votre@email.com"
    },
    {
      id: "q8",
      type: "phone",
      title: "Votre numéro pour un appel stratégique de 15 min",
      subtitle: "Optionnel — Un expert vous contactera pour approfondir.",
      icon: "phone",
      number: 8,
      placeholder: "+33 6 00 00 00 00"
    },
    {
      id: "ending",
      type: "ending",
      title: "Votre audit est en préparation !",
      subtitle: "Vous recevrez votre analyse personnalisée sous 24h. Un expert vous contactera pour un appel stratégique gratuit.",
      icon: "rocket",
      buttonText: "Parfait !"
    }
  ]
};

// =============================================================================
// TEMPLATE 3: QUIZ DE RECOMMANDATION PRODUIT
// Objectif: Guider vers le bon produit + Capturer email
// Angle marketing: Personnalisation + Gamification + Valeur ajoutée
// =============================================================================
// PALETTE: Orchid Purple (Beauty & Elegance) - comme Image 1
export const productQuizTemplate: FormTemplate = {
  id: "product-quiz-1",
  name: "Quiz Recommandation Produit",
  description: "Guidez vos visiteurs vers le produit parfait avec un quiz interactif et engageant.",
  category: "product-recommendation",
  thumbnail: "/templates/product-quiz.png",
  color: "#FDF4FF",
  accentColor: "#A855F7",
  backgroundColor: "#581C87",
  colorPalette: {
    primary: "#5B21B6",    // Deep violet
    secondary: "#A855F7",  // Orchid purple
    tertiary: "#FAF5FF",   // Lavender white
  },
  typography: {
    heading: "Plus Jakarta Sans",
    body: "Inter",
  },
  gradientStart: "#7C3AED",
  gradientEnd: "#A855F7",
  gradientAngle: 45,
  tags: ["quiz", "recommendation", "e-commerce", "personalization"],
  popularity: 97,
  isNew: true,
  layoutStyle: "modern",
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "LUMINA",
  backgroundImages: [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=80",
  ],
  pictureChoiceImages: [
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Trouvez votre routine beauté idéale",
      subtitle: "Répondez à 5 questions simples et recevez des recommandations personnalisées. ✨",
      buttonText: "Découvrir ma routine",
      icon: "sparkles"
    },
    {
      id: "q1",
      type: "picture-choice",
      title: "Quel est votre type de peau ?",
      icon: "droplet",
      number: 1,
      choices: ["Peau grasse", "Peau sèche", "Peau mixte", "Peau sensible"]
    },
    {
      id: "q2",
      type: "choice",
      title: "Quelle est votre préoccupation principale ?",
      icon: "target",
      number: 2,
      choices: [
        "Rides et signes de l'âge",
        "Imperfections et acné",
        "Taches et teint irrégulier",
        "Déshydratation",
        "Pores dilatés",
        "Cernes et fatigue"
      ]
    },
    {
      id: "q3",
      type: "choice",
      title: "Combien de temps consacrez-vous à votre routine ?",
      icon: "clock",
      number: 3,
      choices: [
        "Express (2-3 min)",
        "Modéré (5-10 min)",
        "Complet (15+ min)"
      ]
    },
    {
      id: "q4",
      type: "choice",
      title: "Quel est votre budget mensuel beauté ?",
      icon: "credit-card",
      number: 4,
      choices: [
        "Moins de 30€",
        "30€ - 60€",
        "60€ - 100€",
        "Plus de 100€"
      ]
    },
    {
      id: "q5",
      type: "choice",
      title: "Préférez-vous des produits... ?",
      icon: "leaf",
      number: 5,
      choices: [
        "Naturels & Bio",
        "Haute technologie",
        "Peu importe, tant que ça marche"
      ]
    },
    {
      id: "q6",
      type: "short-text",
      title: "Comment vous appelez-vous ?",
      subtitle: "Pour personnaliser vos recommandations",
      icon: "user",
      number: 6,
      placeholder: "Votre prénom"
    },
    {
      id: "q7",
      type: "email",
      title: "Où envoyer votre routine personnalisée, {{name}} ?",
      subtitle: "Vous recevrez aussi 10% de réduction sur votre première commande 🎁",
      icon: "mail",
      number: 7,
      placeholder: "votre@email.com"
    },
    {
      id: "ending",
      type: "ending",
      title: "Votre routine est prête, {{name}} !",
      subtitle: "Consultez votre boîte mail pour découvrir les produits sélectionnés rien que pour vous.",
      icon: "heart",
      buttonText: "Voir mes produits"
    }
  ]
};

// =============================================================================
// TEMPLATE 4: ONBOARDING CLIENT SaaS
// Objectif: Collecter les infos essentielles pour personnaliser l'expérience
// Angle marketing: Valeur immédiate + Progression + Personnalisation
// =============================================================================
// PALETTE: Emerald Green (Growth & Success)
export const saasOnboardingTemplate: FormTemplate = {
  id: "saas-onboarding-1",
  name: "SaaS Onboarding Flow",
  description: "Accueillez vos nouveaux utilisateurs et personnalisez leur expérience dès le premier jour.",
  category: "registration",
  thumbnail: "/templates/saas-onboarding.png",
  color: "#F0FDF4",
  accentColor: "#22C55E",
  backgroundColor: "#14532D",
  colorPalette: {
    primary: "#166534",    // Deep green
    secondary: "#22C55E",  // Emerald
    tertiary: "#F0FDF4",   // Mint white
  },
  typography: {
    heading: "Geist",
    body: "Inter",
  },
  gradientStart: "#166534",
  gradientEnd: "#22C55E",
  gradientAngle: 135,
  tags: ["onboarding", "saas", "welcome", "personalization", "activation"],
  popularity: 94,
  isNew: true,
  layoutStyle: "modern",
  desktopLayout: "centered",
  mobileLayout: "vertical",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "FLOWLY",
  backgroundImages: [
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Bienvenue sur Flowly ! 🎉",
      subtitle: "Prenons 2 minutes pour configurer votre espace de travail parfait.",
      buttonText: "C'est parti !",
      icon: "rocket"
    },
    {
      id: "q1",
      type: "short-text",
      title: "Comment devons-nous vous appeler ?",
      icon: "user",
      number: 1,
      placeholder: "Votre prénom"
    },
    {
      id: "q2",
      type: "choice",
      title: "Quel est votre rôle principal, {{name}} ?",
      icon: "briefcase",
      number: 2,
      choices: [
        "CEO / Fondateur",
        "Manager / Team Lead",
        "Marketing",
        "Ventes",
        "Produit",
        "Développeur",
        "Freelance",
        "Autre"
      ]
    },
    {
      id: "q3",
      type: "choice",
      title: "Quelle est la taille de votre équipe ?",
      icon: "users",
      number: 3,
      choices: [
        "Juste moi",
        "2-5 personnes",
        "6-20 personnes",
        "21-50 personnes",
        "51-200 personnes",
        "200+ personnes"
      ]
    },
    {
      id: "q4",
      type: "choice",
      title: "Quel est votre objectif principal avec Flowly ?",
      subtitle: "Nous personnaliserons votre tableau de bord en conséquence.",
      icon: "target",
      number: 4,
      choices: [
        "Gérer mes projets plus efficacement",
        "Améliorer la collaboration d'équipe",
        "Automatiser des tâches répétitives",
        "Suivre mes performances",
        "Centraliser mes outils",
        "Je découvre encore"
      ]
    },
    {
      id: "q5",
      type: "choice",
      title: "Comment avez-vous entendu parler de nous ?",
      icon: "search",
      number: 5,
      choices: [
        "Recherche Google",
        "Recommandation d'un ami/collègue",
        "Réseaux sociaux",
        "Article de blog",
        "Publicité",
        "Autre"
      ]
    },
    {
      id: "q6",
      type: "choice",
      title: "Utilisez-vous d'autres outils similaires ?",
      subtitle: "Nous pouvons vous aider à migrer vos données.",
      icon: "layers",
      number: 6,
      choices: [
        "Notion",
        "Asana",
        "Monday.com",
        "Trello",
        "ClickUp",
        "Aucun",
        "Autre"
      ],
      variant: "checkbox"
    },
    {
      id: "ending",
      type: "ending",
      title: "Parfait, {{name}} ! Votre espace est prêt 🚀",
      subtitle: "Nous avons personnalisé Flowly selon vos besoins. Explorez votre nouveau tableau de bord !",
      icon: "check-circle",
      buttonText: "Accéder à mon espace"
    }
  ]
};

// =============================================================================
// TEMPLATE 5: SEGMENTATION AUDIENCE / PERSONA
// Objectif: Segmenter les visiteurs pour personnaliser le parcours
// Angle marketing: Personnalisation + Valeur ciblée + Qualification
// =============================================================================
// PALETTE: Amber Gold (Warmth & Trust) - comme Image 2
export const audienceSegmentationTemplate: FormTemplate = {
  id: "audience-segmentation-1",
  name: "Segmentation Intelligente",
  description: "Identifiez le profil de vos visiteurs pour leur proposer le contenu le plus pertinent.",
  category: "quiz",
  thumbnail: "/templates/segmentation.png",
  color: "#FEF3C7",
  accentColor: "#F59E0B",
  backgroundColor: "#78350F",
  colorPalette: {
    primary: "#78350F",    // Deep amber brown
    secondary: "#F59E0B",  // Bright amber
    tertiary: "#FFFBEB",   // Cream white
  },
  typography: {
    heading: "Cabinet Grotesk",
    body: "Inter",
  },
  gradientStart: "#B45309",
  gradientEnd: "#F59E0B",
  gradientAngle: 45,
  tags: ["segmentation", "persona", "qualification", "personalization"],
  popularity: 91,
  layoutStyle: "bold",
  desktopLayout: "centered",
  mobileLayout: "vertical",
  buttonStyle: "gradient",
  fontStyle: "display",
  brandName: "NEXUS",
  backgroundImages: [
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Trouvons la solution parfaite pour vous",
      subtitle: "3 questions rapides pour vous guider vers les ressources les plus adaptées.",
      buttonText: "Commencer",
      icon: "compass"
    },
    {
      id: "q1",
      type: "choice",
      title: "Vous êtes plutôt...",
      icon: "user",
      number: 1,
      choices: [
        "🚀 Entrepreneur / Startup",
        "🏢 PME en croissance",
        "🌐 Grande entreprise",
        "💼 Freelance / Consultant",
        "🎓 Étudiant / En formation"
      ]
    },
    {
      id: "q2",
      type: "choice",
      title: "Votre priorité du moment ?",
      icon: "flag",
      number: 2,
      choices: [
        "💰 Augmenter mes revenus",
        "⏰ Gagner du temps",
        "📈 Développer ma visibilité",
        "🤝 Trouver des clients",
        "📚 Me former / Monter en compétences"
      ]
    },
    {
      id: "q3",
      type: "choice",
      title: "Quel est votre niveau d'expérience ?",
      icon: "award",
      number: 3,
      choices: [
        "Débutant — Je démarre tout juste",
        "Intermédiaire — J'ai les bases",
        "Avancé — Je maîtrise bien",
        "Expert — Je cherche à optimiser"
      ]
    },
    {
      id: "q4",
      type: "email",
      title: "Où envoyer vos ressources personnalisées ?",
      subtitle: "Recevez un guide adapté à votre profil + des conseils exclusifs.",
      icon: "mail",
      number: 4,
      placeholder: "votre@email.com"
    },
    {
      id: "ending",
      type: "ending",
      title: "Vos ressources arrivent !",
      subtitle: "Consultez votre boîte mail pour accéder à votre contenu personnalisé.",
      icon: "gift",
      buttonText: "Parfait !"
    }
  ]
};

// =============================================================================
// TEMPLATE 6: QUALIFICATION LEAD B2B
// Objectif: Qualifier les leads selon BANT (Budget, Authority, Need, Timeline)
// Angle marketing: Professionnalisme + Valeur + Urgence
// =============================================================================
// PALETTE: Ocean Blue (Corporate & Trust)
export const b2bLeadQualificationTemplate: FormTemplate = {
  id: "b2b-qualification-1",
  name: "Lead Qualification B2B",
  description: "Qualifiez vos prospects B2B selon la méthode BANT pour prioriser vos efforts commerciaux.",
  category: "lead-generation",
  thumbnail: "/templates/b2b-qualification.png",
  color: "#F8FAFC",
  accentColor: "#0EA5E9",
  backgroundColor: "#0C4A6E",
  colorPalette: {
    primary: "#0C4A6E",    // Deep ocean
    secondary: "#0EA5E9",  // Sky blue
    tertiary: "#F0F9FF",   // Ice white
  },
  typography: {
    heading: "DM Sans",
    body: "Inter",
  },
  gradientStart: "#0369A1",
  gradientEnd: "#0EA5E9",
  gradientAngle: 135,
  tags: ["b2b", "qualification", "sales", "bant", "enterprise"],
  popularity: 93,
  isPremium: true,
  layoutStyle: "gradient",
  desktopLayout: "centered",
  mobileLayout: "vertical",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "ENTERPRISE",
  backgroundImages: [
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=900&q=80",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Demandez une démo personnalisée",
      subtitle: "Découvrez comment notre solution peut transformer votre entreprise. Réponse sous 24h.",
      buttonText: "Réserver ma démo",
      icon: "play"
    },
    {
      id: "q1",
      type: "short-text",
      title: "Quel est le nom de votre entreprise ?",
      icon: "building",
      number: 1,
      placeholder: "Nom de l'entreprise"
    },
    {
      id: "q2",
      type: "choice",
      title: "Combien d'employés compte votre entreprise ?",
      icon: "users",
      number: 2,
      choices: [
        "1-10 employés",
        "11-50 employés",
        "51-200 employés",
        "201-1000 employés",
        "1000+ employés"
      ]
    },
    {
      id: "q3",
      type: "choice",
      title: "Quel est votre rôle dans la décision d'achat ?",
      icon: "shield",
      number: 3,
      choices: [
        "Je suis le décideur final",
        "Je fais partie du comité de décision",
        "Je recommande des solutions",
        "J'évalue les options pour mon équipe"
      ]
    },
    {
      id: "q4",
      type: "choice",
      title: "Quel problème cherchez-vous à résoudre ?",
      subtitle: "Sélectionnez votre priorité principale.",
      icon: "target",
      number: 4,
      choices: [
        "Réduire les coûts opérationnels",
        "Améliorer la productivité",
        "Automatiser des processus",
        "Améliorer l'expérience client",
        "Sécuriser nos données",
        "Autre"
      ]
    },
    {
      id: "q5",
      type: "choice",
      title: "Quel est votre budget approximatif ?",
      icon: "dollar-sign",
      number: 5,
      choices: [
        "Moins de 5 000€/an",
        "5 000€ - 20 000€/an",
        "20 000€ - 50 000€/an",
        "50 000€ - 100 000€/an",
        "Plus de 100 000€/an",
        "Budget à définir"
      ]
    },
    {
      id: "q6",
      type: "choice",
      title: "Quel est votre calendrier de décision ?",
      icon: "calendar",
      number: 6,
      choices: [
        "Immédiat (ce mois-ci)",
        "Court terme (1-3 mois)",
        "Moyen terme (3-6 mois)",
        "Long terme (6+ mois)",
        "Juste en veille pour l'instant"
      ]
    },
    {
      id: "q7",
      type: "short-text",
      title: "Votre nom complet",
      icon: "user",
      number: 7,
      placeholder: "Prénom Nom"
    },
    {
      id: "q8",
      type: "email",
      title: "Votre email professionnel",
      icon: "mail",
      number: 8,
      placeholder: "prenom@entreprise.com"
    },
    {
      id: "q9",
      type: "phone",
      title: "Votre numéro de téléphone",
      subtitle: "Pour planifier votre démo au moment qui vous convient.",
      icon: "phone",
      number: 9,
      placeholder: "+33 6 00 00 00 00"
    },
    {
      id: "ending",
      type: "ending",
      title: "Demande reçue !",
      subtitle: "Un expert vous contactera sous 24h pour planifier votre démo personnalisée.",
      icon: "check-circle",
      buttonText: "Parfait !"
    }
  ]
};

// =============================================================================
// TEMPLATE 7: POST-ACHAT / SATISFACTION CLIENT
// Objectif: Mesurer la satisfaction et collecter des témoignages
// Angle marketing: Feedback loop + Social proof + Amélioration continue
// =============================================================================
// PALETTE: Rose Pink (Warmth & Appreciation)
export const postPurchaseSurveyTemplate: FormTemplate = {
  id: "post-purchase-1",
  name: "Enquête Post-Achat",
  description: "Mesurez la satisfaction client et collectez des témoignages authentiques après chaque achat.",
  category: "customer-feedback",
  thumbnail: "/templates/post-purchase.png",
  color: "#FDF2F8",
  accentColor: "#EC4899",
  backgroundColor: "#831843",
  colorPalette: {
    primary: "#831843",    // Deep rose
    secondary: "#EC4899",  // Hot pink
    tertiary: "#FDF2F8",   // Blush white
  },
  typography: {
    heading: "Poppins",
    body: "Inter",
  },
  gradientStart: "#BE185D",
  gradientEnd: "#EC4899",
  gradientAngle: 135,
  tags: ["satisfaction", "feedback", "testimonial", "post-purchase", "review"],
  popularity: 95,
  layoutStyle: "modern",
  desktopLayout: "centered",
  mobileLayout: "vertical",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "BLOOM",
  backgroundImages: [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Comment s'est passée votre expérience ?",
      subtitle: "Votre avis compte énormément pour nous. 2 minutes suffisent !",
      buttonText: "Donner mon avis",
      icon: "heart"
    },
    {
      id: "q1",
      type: "rating",
      title: "Comment évaluez-vous votre expérience globale ?",
      icon: "star",
      number: 1,
      ratingCount: 5,
      ratingType: "stars"
    },
    {
      id: "q2",
      type: "rating",
      title: "La qualité du produit correspond-elle à vos attentes ?",
      icon: "package",
      number: 2,
      ratingCount: 5,
      ratingType: "stars"
    },
    {
      id: "q3",
      type: "rating",
      title: "Comment évaluez-vous la livraison ?",
      subtitle: "Rapidité, emballage, état du colis...",
      icon: "truck",
      number: 3,
      ratingCount: 5,
      ratingType: "stars"
    },
    {
      id: "q4",
      type: "choice",
      title: "Qu'avez-vous le plus apprécié ?",
      subtitle: "Sélectionnez tout ce qui s'applique.",
      icon: "thumbs-up",
      number: 4,
      choices: [
        "La qualité du produit",
        "Le rapport qualité-prix",
        "La rapidité de livraison",
        "L'emballage soigné",
        "Le service client",
        "La facilité de commande"
      ],
      variant: "checkbox"
    },
    {
      id: "q5",
      type: "long-text",
      title: "Avez-vous des suggestions d'amélioration ?",
      subtitle: "Nous lisons chaque retour avec attention.",
      icon: "lightbulb",
      number: 5,
      placeholder: "Partagez vos idées...",
      maxLength: 500
    },
    {
      id: "q6",
      type: "rating",
      title: "Recommanderiez-vous notre marque à vos proches ?",
      subtitle: "0 = Pas du tout, 10 = Absolument",
      icon: "share-2",
      number: 6,
      ratingCount: 10,
      ratingType: "nps"
    },
    {
      id: "q7",
      type: "yesno",
      title: "Acceptez-vous que nous utilisions votre avis comme témoignage ?",
      subtitle: "Votre prénom pourra être affiché sur notre site.",
      icon: "quote",
      number: 7
    },
    {
      id: "q8",
      type: "long-text",
      title: "Partagez votre témoignage !",
      subtitle: "Décrivez votre expérience en quelques mots.",
      icon: "message-circle",
      number: 8,
      placeholder: "J'ai adoré ce produit parce que...",
      maxLength: 300
    },
    {
      id: "ending",
      type: "ending",
      title: "Merci infiniment pour votre retour ! 💖",
      subtitle: "Votre avis nous aide à nous améliorer chaque jour. À très bientôt !",
      icon: "heart",
      buttonText: "Fermer"
    }
  ]
};

// =============================================================================
// TEMPLATE 8: INSCRIPTION WEBINAIRE / MASTERCLASS
// Objectif: Maximiser les inscriptions avec qualification
// Angle marketing: Urgence + Exclusivité + Valeur perçue
// =============================================================================
// PALETTE: Indigo (Knowledge & Premium)
export const webinarRegistrationTemplate: FormTemplate = {
  id: "webinar-registration-1",
  name: "Inscription Webinaire",
  description: "Maximisez vos inscriptions webinaire avec un formulaire optimisé conversion.",
  category: "registration",
  thumbnail: "/templates/webinar.png",
  color: "#EEF2FF",
  accentColor: "#6366F1",
  backgroundColor: "#312E81",
  colorPalette: {
    primary: "#312E81",    // Deep indigo
    secondary: "#6366F1",  // Bright indigo
    tertiary: "#EEF2FF",   // Soft lavender
  },
  typography: {
    heading: "Outfit",
    body: "Inter",
  },
  gradientStart: "#4338CA",
  gradientEnd: "#6366F1",
  gradientAngle: 135,
  tags: ["webinar", "masterclass", "event", "registration", "training"],
  popularity: 96,
  isNew: true,
  layoutStyle: "gradient",
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "ACADEMY",
  backgroundImages: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80",
    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Masterclass Gratuite : Doublez vos ventes en 30 jours",
      subtitle: "🔴 LIVE le 15 décembre à 14h — Places limitées à 100 participants",
      buttonText: "Réserver ma place",
      icon: "video"
    },
    {
      id: "q1",
      type: "short-text",
      title: "Quel est votre prénom ?",
      icon: "user",
      number: 1,
      placeholder: "Votre prénom"
    },
    {
      id: "q2",
      type: "email",
      title: "Où envoyer votre lien d'accès, {{name}} ?",
      subtitle: "Vous recevrez aussi le replay si vous ne pouvez pas assister en direct.",
      icon: "mail",
      number: 2,
      placeholder: "votre@email.com"
    },
    {
      id: "q3",
      type: "choice",
      title: "Quel est votre plus grand défi actuellement ?",
      subtitle: "Nous adapterons le contenu en fonction de vos réponses.",
      icon: "target",
      number: 3,
      choices: [
        "Trouver de nouveaux clients",
        "Convertir mes prospects en clients",
        "Augmenter mon panier moyen",
        "Fidéliser mes clients existants",
        "Automatiser mes ventes"
      ]
    },
    {
      id: "q4",
      type: "choice",
      title: "Quel est votre chiffre d'affaires actuel ?",
      icon: "trending-up",
      number: 4,
      choices: [
        "Je démarre (0-10K€/an)",
        "En croissance (10K-50K€/an)",
        "Établi (50K-200K€/an)",
        "Avancé (200K€+/an)"
      ]
    },
    {
      id: "q5",
      type: "phone",
      title: "Votre numéro pour un rappel SMS avant le live",
      subtitle: "Optionnel — Pour ne pas manquer le début !",
      icon: "phone",
      number: 5,
      placeholder: "+33 6 00 00 00 00"
    },
    {
      id: "ending",
      type: "ending",
      title: "Vous êtes inscrit(e), {{name}} ! 🎉",
      subtitle: "Vérifiez votre boîte mail pour votre lien d'accès. Ajoutez l'événement à votre calendrier !",
      icon: "calendar",
      buttonText: "Ajouter au calendrier"
    }
  ]
};

// =============================================================================
// TEMPLATE 9: PRISE DE RDV COACHING / CONSULTING
// Objectif: Qualifier et convertir en appel découverte
// Angle marketing: Exclusivité + Expertise + Personnalisation
// =============================================================================
// PALETTE: Sage Green (Calm & Growth)
export const coachingBookingTemplate: FormTemplate = {
  id: "coaching-booking-1",
  name: "Réservation Appel Découverte",
  description: "Qualifiez vos prospects et convertissez-les en appels découverte pour votre activité de coaching/consulting.",
  category: "contact",
  thumbnail: "/templates/coaching.png",
  color: "#ECFDF5",
  accentColor: "#059669",
  backgroundColor: "#064E3B",
  colorPalette: {
    primary: "#064E3B",    // Deep forest
    secondary: "#10B981",  // Emerald
    tertiary: "#ECFDF5",   // Mint cream
  },
  typography: {
    heading: "Cormorant Garamond",
    body: "Lato",
  },
  gradientStart: "#047857",
  gradientEnd: "#10B981",
  gradientAngle: 135,
  tags: ["coaching", "consulting", "booking", "call", "discovery"],
  popularity: 92,
  isPremium: true,
  layoutStyle: "elegant",
  desktopLayout: "split-right",
  mobileLayout: "banner",
  buttonStyle: "gradient",
  fontStyle: "serif",
  brandName: "ELEVATE",
  backgroundImages: [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Réservez votre session stratégique gratuite",
      subtitle: "30 minutes pour clarifier vos objectifs et définir votre plan d'action. Sans engagement.",
      buttonText: "Réserver ma session",
      icon: "calendar"
    },
    {
      id: "q1",
      type: "short-text",
      title: "Comment vous appelez-vous ?",
      icon: "user",
      number: 1,
      placeholder: "Prénom Nom"
    },
    {
      id: "q2",
      type: "choice",
      title: "Dans quel domaine puis-je vous aider, {{name}} ?",
      icon: "compass",
      number: 2,
      choices: [
        "Développer mon business",
        "Améliorer mon leadership",
        "Gérer une transition de carrière",
        "Équilibrer vie pro/perso",
        "Développer ma confiance",
        "Autre"
      ]
    },
    {
      id: "q3",
      type: "long-text",
      title: "Décrivez votre situation actuelle",
      subtitle: "Où en êtes-vous ? Quels sont vos blocages ?",
      icon: "edit",
      number: 3,
      placeholder: "Actuellement, je...",
      maxLength: 500
    },
    {
      id: "q4",
      type: "long-text",
      title: "Quel résultat souhaitez-vous atteindre ?",
      subtitle: "Soyez aussi précis que possible.",
      icon: "target",
      number: 4,
      placeholder: "Dans 3 mois, j'aimerais...",
      maxLength: 500
    },
    {
      id: "q5",
      type: "choice",
      title: "Quel est votre niveau d'engagement ?",
      icon: "zap",
      number: 5,
      choices: [
        "Je suis prêt(e) à investir temps et argent",
        "Je suis motivé(e) mais j'ai des contraintes",
        "J'explore mes options pour l'instant"
      ]
    },
    {
      id: "q6",
      type: "choice",
      title: "Avez-vous déjà travaillé avec un coach ?",
      icon: "users",
      number: 6,
      choices: [
        "Oui, plusieurs fois",
        "Oui, une fois",
        "Non, ce serait ma première fois"
      ]
    },
    {
      id: "q7",
      type: "email",
      title: "Votre email pour confirmer le rendez-vous",
      icon: "mail",
      number: 7,
      placeholder: "votre@email.com"
    },
    {
      id: "q8",
      type: "phone",
      title: "Votre numéro pour l'appel",
      icon: "phone",
      number: 8,
      placeholder: "+33 6 00 00 00 00"
    },
    {
      id: "ending",
      type: "ending",
      title: "Parfait, {{name}} ! Votre demande est envoyée",
      subtitle: "Je vous contacte sous 24h pour fixer notre rendez-vous. Préparez-vous à transformer votre situation !",
      icon: "rocket",
      buttonText: "Merci !"
    }
  ]
};

// =============================================================================
// TEMPLATE 10: ESTIMATION IMMOBILIÈRE
// Objectif: Capturer des leads vendeurs qualifiés
// Angle marketing: Valeur gratuite + Expertise locale + Urgence
// =============================================================================
// PALETTE: Warm Terracotta (Luxury Real Estate)
export const realEstateEstimationTemplate: FormTemplate = {
  id: "real-estate-estimation-1",
  name: "Estimation Immobilière Gratuite",
  description: "Capturez des leads vendeurs qualifiés avec une estimation gratuite de leur bien.",
  category: "lead-generation",
  thumbnail: "/templates/real-estate.png",
  color: "#FEF7ED",
  accentColor: "#D97706",
  backgroundColor: "#1C1917",
  colorPalette: {
    primary: "#78350F",    // Deep brown
    secondary: "#D97706",  // Amber gold
    tertiary: "#FFFBEB",   // Warm cream
  },
  typography: {
    heading: "Playfair Display",
    body: "Source Sans Pro",
  },
  tags: ["immobilier", "estimation", "vendeur", "real-estate", "property"],
  popularity: 94,
  isPremium: true,
  layoutStyle: "elegant",
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "rounded",
  fontStyle: "serif",
  brandName: "PRESTIGE IMMO",
  backgroundImages: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Estimez la valeur de votre bien en 2 minutes",
      subtitle: "Recevez une estimation gratuite et sans engagement, réalisée par nos experts locaux.",
      buttonText: "Estimer mon bien",
      icon: "home"
    },
    {
      id: "q1",
      type: "choice",
      title: "Quel type de bien souhaitez-vous estimer ?",
      icon: "home",
      number: 1,
      choices: [
        "🏠 Maison",
        "🏢 Appartement",
        "🏗️ Terrain",
        "🏪 Local commercial",
        "🏛️ Immeuble"
      ]
    },
    {
      id: "q2",
      type: "short-text",
      title: "Quelle est l'adresse du bien ?",
      subtitle: "Ville ou code postal suffisent.",
      icon: "map-pin",
      number: 2,
      placeholder: "Ex: 75008 Paris"
    },
    {
      id: "q3",
      type: "choice",
      title: "Quelle est la surface habitable ?",
      icon: "maximize",
      number: 3,
      choices: [
        "Moins de 30 m²",
        "30 - 50 m²",
        "50 - 80 m²",
        "80 - 120 m²",
        "120 - 200 m²",
        "Plus de 200 m²"
      ]
    },
    {
      id: "q4",
      type: "choice",
      title: "Combien de pièces principales ?",
      icon: "layout",
      number: 4,
      choices: ["Studio", "2 pièces", "3 pièces", "4 pièces", "5 pièces", "6+ pièces"]
    },
    {
      id: "q5",
      type: "choice",
      title: "État général du bien ?",
      icon: "tool",
      number: 5,
      choices: [
        "Neuf / Récent",
        "Très bon état",
        "Bon état",
        "Travaux à prévoir",
        "À rénover entièrement"
      ]
    },
    {
      id: "q6",
      type: "choice",
      title: "Quand envisagez-vous de vendre ?",
      icon: "calendar",
      number: 6,
      choices: [
        "Dès que possible",
        "Dans les 3 prochains mois",
        "Dans les 6 prochains mois",
        "Dans plus de 6 mois",
        "Je me renseigne simplement"
      ]
    },
    {
      id: "q7",
      type: "short-text",
      title: "Votre nom complet",
      icon: "user",
      number: 7,
      placeholder: "Prénom Nom"
    },
    {
      id: "q8",
      type: "email",
      title: "Où envoyer votre estimation ?",
      icon: "mail",
      number: 8,
      placeholder: "votre@email.com"
    },
    {
      id: "q9",
      type: "phone",
      title: "Votre téléphone pour un échange personnalisé",
      subtitle: "Un expert local vous rappelle sous 24h.",
      icon: "phone",
      number: 9,
      placeholder: "+33 6 00 00 00 00"
    },
    {
      id: "ending",
      type: "ending",
      title: "Votre estimation arrive !",
      subtitle: "Un expert de votre secteur vous contactera sous 24h avec une analyse détaillée de votre bien.",
      icon: "check-circle",
      buttonText: "Parfait !"
    }
  ]
};

// =============================================================================
// TEMPLATE 11: BILAN SANTÉ / FITNESS
// Objectif: Qualifier des prospects pour coaching sportif ou nutrition
// Angle marketing: Personnalisation + Transformation + Motivation
// =============================================================================
// PALETTE: Cyan Energy (Health & Vitality)
export const fitnessAssessmentTemplate: FormTemplate = {
  id: "fitness-assessment-1",
  name: "Bilan Forme & Objectifs",
  description: "Qualifiez vos prospects fitness avec un bilan personnalisé de leurs objectifs santé.",
  category: "quiz",
  thumbnail: "/templates/fitness.png",
  color: "#ECFEFF",
  accentColor: "#06B6D4",
  backgroundColor: "#164E63",
  colorPalette: {
    primary: "#164E63",    // Deep teal
    secondary: "#06B6D4",  // Bright cyan
    tertiary: "#ECFEFF",   // Ice blue
  },
  typography: {
    heading: "Montserrat",
    body: "Inter",
  },
  gradientStart: "#0891B2",
  gradientEnd: "#06B6D4",
  gradientAngle: 135,
  tags: ["fitness", "health", "coaching", "nutrition", "sport"],
  popularity: 93,
  isNew: true,
  layoutStyle: "modern",
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "FITPRO",
  backgroundImages: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Découvrez votre programme personnalisé",
      subtitle: "Répondez à quelques questions pour recevoir un plan d'action adapté à VOS objectifs.",
      buttonText: "Commencer mon bilan",
      icon: "activity"
    },
    {
      id: "q1",
      type: "short-text",
      title: "Comment vous appelez-vous ?",
      icon: "user",
      number: 1,
      placeholder: "Votre prénom"
    },
    {
      id: "q2",
      type: "choice",
      title: "Quel est votre objectif principal, {{name}} ?",
      icon: "target",
      number: 2,
      choices: [
        "💪 Perdre du poids",
        "🏋️ Prendre du muscle",
        "🏃 Améliorer mon endurance",
        "🧘 Gagner en souplesse",
        "⚡ Avoir plus d'énergie",
        "🎯 Me remettre en forme globalement"
      ]
    },
    {
      id: "q3",
      type: "choice",
      title: "Quel est votre niveau d'activité actuel ?",
      icon: "trending-up",
      number: 3,
      choices: [
        "Sédentaire (peu ou pas d'exercice)",
        "Légèrement actif (1-2x/semaine)",
        "Modérément actif (3-4x/semaine)",
        "Très actif (5+x/semaine)",
        "Athlète (entraînement intensif)"
      ]
    },
    {
      id: "q4",
      type: "choice",
      title: "Combien de temps pouvez-vous consacrer par séance ?",
      icon: "clock",
      number: 4,
      choices: [
        "15-20 minutes",
        "30-45 minutes",
        "45-60 minutes",
        "Plus d'1 heure"
      ]
    },
    {
      id: "q5",
      type: "choice",
      title: "Où préférez-vous vous entraîner ?",
      icon: "map-pin",
      number: 5,
      choices: [
        "🏠 À la maison",
        "🏋️ En salle de sport",
        "🌳 En extérieur",
        "🔄 Un mix des trois"
      ]
    },
    {
      id: "q6",
      type: "choice",
      title: "Avez-vous des contraintes particulières ?",
      subtitle: "Sélectionnez tout ce qui s'applique.",
      icon: "alert-circle",
      number: 6,
      choices: [
        "Problèmes de dos",
        "Problèmes articulaires",
        "Restrictions alimentaires",
        "Emploi du temps chargé",
        "Aucune contrainte"
      ],
      variant: "checkbox"
    },
    {
      id: "q7",
      type: "choice",
      title: "Qu'est-ce qui vous a empêché d'atteindre vos objectifs jusqu'ici ?",
      icon: "x-circle",
      number: 7,
      choices: [
        "Manque de motivation",
        "Manque de temps",
        "Ne sais pas par où commencer",
        "Résultats trop lents",
        "Blessures / Douleurs",
        "Autre"
      ]
    },
    {
      id: "q8",
      type: "email",
      title: "Où envoyer votre programme personnalisé ?",
      subtitle: "Vous recevrez aussi des conseils exclusifs chaque semaine.",
      icon: "mail",
      number: 8,
      placeholder: "votre@email.com"
    },
    {
      id: "ending",
      type: "ending",
      title: "Votre programme arrive, {{name}} ! 💪",
      subtitle: "Consultez votre boîte mail pour découvrir votre plan d'action personnalisé.",
      icon: "zap",
      buttonText: "Parfait !"
    }
  ]
};

// =============================================================================
// TEMPLATE 12: RÉSERVATION RESTAURANT / TABLE
// Objectif: Simplifier les réservations et collecter des données clients
// Angle marketing: Simplicité + Expérience premium + Personnalisation
// =============================================================================
// PALETTE: Wine Red (Gastronomy & Elegance)
export const restaurantBookingTemplate: FormTemplate = {
  id: "restaurant-booking-1",
  name: "Réservation Restaurant",
  description: "Simplifiez vos réservations de table avec un formulaire élégant et efficace.",
  category: "order-form",
  thumbnail: "/templates/restaurant.png",
  color: "#FEF2F2",
  accentColor: "#DC2626",
  backgroundColor: "#1C1917",
  colorPalette: {
    primary: "#7F1D1D",    // Deep burgundy
    secondary: "#DC2626",  // Bright red
    tertiary: "#FEF2F2",   // Rose white
  },
  typography: {
    heading: "Cormorant Garamond",
    body: "Lato",
  },
  tags: ["restaurant", "booking", "reservation", "table", "hospitality"],
  popularity: 91,
  layoutStyle: "elegant",
  desktopLayout: "split-left",
  mobileLayout: "banner",
  buttonStyle: "rounded",
  fontStyle: "serif",
  brandName: "LA MAISON",
  backgroundImages: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Réservez votre table",
      subtitle: "Une expérience gastronomique vous attend. Réservation en quelques clics.",
      buttonText: "Réserver",
      icon: "utensils"
    },
    {
      id: "q1",
      type: "date",
      title: "Pour quelle date souhaitez-vous réserver ?",
      icon: "calendar",
      number: 1
    },
    {
      id: "q2",
      type: "choice",
      title: "À quelle heure ?",
      icon: "clock",
      number: 2,
      choices: [
        "12:00", "12:30", "13:00", "13:30",
        "19:00", "19:30", "20:00", "20:30", "21:00"
      ]
    },
    {
      id: "q3",
      type: "choice",
      title: "Combien de convives ?",
      icon: "users",
      number: 3,
      choices: ["1 personne", "2 personnes", "3 personnes", "4 personnes", "5 personnes", "6 personnes", "7+ personnes"]
    },
    {
      id: "q4",
      type: "choice",
      title: "Avez-vous une préférence de placement ?",
      icon: "layout",
      number: 4,
      choices: [
        "Terrasse",
        "Salle principale",
        "Coin tranquille",
        "Près de la fenêtre",
        "Pas de préférence"
      ]
    },
    {
      id: "q5",
      type: "choice",
      title: "Est-ce une occasion spéciale ?",
      icon: "gift",
      number: 5,
      choices: [
        "Anniversaire",
        "Dîner romantique",
        "Repas d'affaires",
        "Célébration",
        "Aucune occasion particulière"
      ]
    },
    {
      id: "q6",
      type: "long-text",
      title: "Avez-vous des allergies ou régimes alimentaires ?",
      subtitle: "Optionnel — Notre chef s'adaptera à vos besoins.",
      icon: "alert-circle",
      number: 6,
      placeholder: "Ex: Sans gluten, végétarien, allergie aux fruits de mer...",
      maxLength: 200
    },
    {
      id: "q7",
      type: "short-text",
      title: "Votre nom pour la réservation",
      icon: "user",
      number: 7,
      placeholder: "Prénom Nom"
    },
    {
      id: "q8",
      type: "phone",
      title: "Votre numéro de téléphone",
      subtitle: "Pour confirmer votre réservation.",
      icon: "phone",
      number: 8,
      placeholder: "+33 6 00 00 00 00"
    },
    {
      id: "q9",
      type: "email",
      title: "Votre email pour la confirmation",
      icon: "mail",
      number: 9,
      placeholder: "votre@email.com"
    },
    {
      id: "ending",
      type: "ending",
      title: "Réservation confirmée !",
      subtitle: "Nous avons hâte de vous accueillir. Un email de confirmation vous a été envoyé.",
      icon: "check-circle",
      buttonText: "Parfait !"
    }
  ]
};

// =============================================================================
// TEMPLATE 13: DEMANDE DE DEVIS / CALCULATEUR
// Objectif: Qualifier et capturer des demandes de devis
// Angle marketing: Transparence + Rapidité + Personnalisation
// =============================================================================
// PALETTE: Azure Blue (Trust & Professionalism)
export const quoteRequestTemplate: FormTemplate = {
  id: "quote-request-1",
  name: "Demande de Devis Express",
  description: "Capturez des demandes de devis qualifiées avec un formulaire clair et efficace.",
  category: "lead-generation",
  thumbnail: "/templates/quote.png",
  color: "#F0F9FF",
  accentColor: "#0284C7",
  backgroundColor: "#0C4A6E",
  colorPalette: {
    primary: "#0C4A6E",    // Deep azure
    secondary: "#0EA5E9",  // Sky blue
    tertiary: "#F0F9FF",   // Light azure
  },
  typography: {
    heading: "DM Sans",
    body: "Inter",
  },
  gradientStart: "#0369A1",
  gradientEnd: "#0EA5E9",
  gradientAngle: 135,
  tags: ["devis", "quote", "pricing", "service", "b2b"],
  popularity: 95,
  layoutStyle: "modern",
  desktopLayout: "centered",
  mobileLayout: "vertical",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "PROSERV",
  backgroundImages: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Obtenez votre devis personnalisé en 2 minutes",
      subtitle: "Réponse garantie sous 24h. Sans engagement.",
      buttonText: "Demander mon devis",
      icon: "file-text"
    },
    {
      id: "q1",
      type: "choice",
      title: "Quel type de service recherchez-vous ?",
      icon: "layers",
      number: 1,
      choices: [
        "🌐 Création de site web",
        "📱 Application mobile",
        "🎨 Design & Branding",
        "📈 Marketing digital",
        "🔧 Maintenance & Support",
        "💡 Conseil & Stratégie"
      ]
    },
    {
      id: "q2",
      type: "choice",
      title: "Quelle est l'envergure de votre projet ?",
      icon: "maximize",
      number: 2,
      choices: [
        "Petit projet (< 5K€)",
        "Projet moyen (5K-15K€)",
        "Grand projet (15K-50K€)",
        "Projet d'envergure (50K€+)",
        "Je ne sais pas encore"
      ]
    },
    {
      id: "q3",
      type: "choice",
      title: "Quel est votre délai idéal ?",
      icon: "clock",
      number: 3,
      choices: [
        "Urgent (< 2 semaines)",
        "Court terme (1 mois)",
        "Moyen terme (2-3 mois)",
        "Long terme (3+ mois)",
        "Flexible"
      ]
    },
    {
      id: "q4",
      type: "long-text",
      title: "Décrivez brièvement votre projet",
      subtitle: "Plus vous êtes précis, plus notre devis sera adapté.",
      icon: "edit",
      number: 4,
      placeholder: "Mon projet consiste à...",
      maxLength: 500
    },
    {
      id: "q5",
      type: "short-text",
      title: "Nom de votre entreprise",
      icon: "building",
      number: 5,
      placeholder: "Nom de l'entreprise"
    },
    {
      id: "q6",
      type: "short-text",
      title: "Votre nom complet",
      icon: "user",
      number: 6,
      placeholder: "Prénom Nom"
    },
    {
      id: "q7",
      type: "email",
      title: "Où envoyer votre devis ?",
      icon: "mail",
      number: 7,
      placeholder: "votre@email.com"
    },
    {
      id: "q8",
      type: "phone",
      title: "Votre téléphone pour en discuter",
      subtitle: "Optionnel — Pour clarifier les détails si besoin.",
      icon: "phone",
      number: 8,
      placeholder: "+33 6 00 00 00 00"
    },
    {
      id: "ending",
      type: "ending",
      title: "Demande reçue !",
      subtitle: "Notre équipe prépare votre devis personnalisé. Vous le recevrez sous 24h maximum.",
      icon: "check-circle",
      buttonText: "Parfait !"
    }
  ]
};

// =============================================================================
// TEMPLATE 14: CANDIDATURE EMPLOI SIMPLIFIÉE
// Objectif: Simplifier le processus de candidature
// Angle marketing: Accessibilité + Rapidité + Expérience candidat
// =============================================================================
// PALETTE: Violet (Modern HR & Creativity)
export const jobApplicationSimpleTemplate: FormTemplate = {
  id: "job-application-simple-1",
  name: "Candidature Express",
  description: "Simplifiez vos recrutements avec un formulaire de candidature moderne et engageant.",
  category: "hr",
  thumbnail: "/templates/job-simple.png",
  color: "#FDF4FF",
  accentColor: "#A855F7",
  backgroundColor: "#581C87",
  colorPalette: {
    primary: "#581C87",    // Deep purple
    secondary: "#A855F7",  // Bright violet
    tertiary: "#FAF5FF",   // Lavender white
  },
  typography: {
    heading: "Plus Jakarta Sans",
    body: "Inter",
  },
  gradientStart: "#7C3AED",
  gradientEnd: "#A855F7",
  gradientAngle: 135,
  tags: ["recrutement", "emploi", "candidature", "hr", "hiring"],
  popularity: 90,
  layoutStyle: "gradient",
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "TALENT CO",
  backgroundImages: [
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Rejoignez notre équipe !",
      subtitle: "Candidature en 3 minutes. Pas de CV requis — montrez-nous qui vous êtes vraiment.",
      buttonText: "Postuler maintenant",
      icon: "users"
    },
    {
      id: "q1",
      type: "short-text",
      title: "Comment vous appelez-vous ?",
      icon: "user",
      number: 1,
      placeholder: "Prénom Nom"
    },
    {
      id: "q2",
      type: "email",
      title: "Votre email, {{name}} ?",
      icon: "mail",
      number: 2,
      placeholder: "votre@email.com"
    },
    {
      id: "q3",
      type: "choice",
      title: "Quel poste vous intéresse ?",
      icon: "briefcase",
      number: 3,
      choices: [
        "Développeur(se)",
        "Designer",
        "Marketing",
        "Commercial(e)",
        "Support Client",
        "Autre"
      ]
    },
    {
      id: "q4",
      type: "choice",
      title: "Quelle est votre expérience dans ce domaine ?",
      icon: "award",
      number: 4,
      choices: [
        "Débutant(e) (0-2 ans)",
        "Confirmé(e) (2-5 ans)",
        "Senior (5-10 ans)",
        "Expert(e) (10+ ans)"
      ]
    },
    {
      id: "q5",
      type: "long-text",
      title: "Qu'est-ce qui vous motive à nous rejoindre ?",
      subtitle: "Parlez-nous de vous, de vos passions, de ce qui vous anime.",
      icon: "heart",
      number: 5,
      placeholder: "Ce qui me motive...",
      maxLength: 500
    },
    {
      id: "q6",
      type: "long-text",
      title: "Quelle est votre plus grande réussite professionnelle ?",
      icon: "trophy",
      number: 6,
      placeholder: "Ma plus grande réussite...",
      maxLength: 500
    },
    {
      id: "q7",
      type: "choice",
      title: "Quand pourriez-vous commencer ?",
      icon: "calendar",
      number: 7,
      choices: [
        "Immédiatement",
        "Dans 2 semaines",
        "Dans 1 mois",
        "Dans 2-3 mois",
        "À négocier"
      ]
    },
    {
      id: "q8",
      type: "short-text",
      title: "Lien vers votre LinkedIn ou portfolio",
      subtitle: "Optionnel — Mais ça nous aide à mieux vous connaître !",
      icon: "link",
      number: 8,
      placeholder: "https://"
    },
    {
      id: "q9",
      type: "phone",
      title: "Votre numéro de téléphone",
      icon: "phone",
      number: 9,
      placeholder: "+33 6 00 00 00 00"
    },
    {
      id: "ending",
      type: "ending",
      title: "Candidature envoyée, {{name}} ! 🎉",
      subtitle: "Merci pour votre intérêt. Notre équipe RH vous contactera sous 5 jours ouvrés.",
      icon: "check-circle",
      buttonText: "Parfait !"
    }
  ]
};

// =============================================================================
// TEMPLATE 15: QUIZ PERSONNALITÉ / PROFIL
// Objectif: Engager et segmenter avec un quiz ludique
// Angle marketing: Gamification + Curiosité + Viralité
// =============================================================================
// PALETTE: Sunny Yellow (Fun & Engagement)
export const personalityQuizProTemplate: FormTemplate = {
  id: "personality-quiz-pro-1",
  name: "Quiz Personnalité Viral",
  description: "Engagez votre audience avec un quiz de personnalité ludique et partageable.",
  category: "quiz",
  thumbnail: "/templates/personality-quiz.png",
  color: "#FEF3C7",
  accentColor: "#F59E0B",
  backgroundColor: "#78350F",
  colorPalette: {
    primary: "#92400E",    // Deep amber
    secondary: "#FBBF24",  // Sunny yellow
    tertiary: "#FFFBEB",   // Cream
  },
  typography: {
    heading: "Space Grotesk",
    body: "Inter",
  },
  gradientStart: "#D97706",
  gradientEnd: "#FBBF24",
  gradientAngle: 45,
  tags: ["quiz", "personality", "engagement", "viral", "fun"],
  popularity: 97,
  isNew: true,
  layoutStyle: "bold",
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "gradient",
  fontStyle: "display",
  brandName: "QUIZZY",
  backgroundImages: [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Quel type d'entrepreneur êtes-vous ?",
      subtitle: "Découvrez votre profil en 5 questions et recevez des conseils personnalisés !",
      buttonText: "Découvrir mon profil",
      icon: "sparkles"
    },
    {
      id: "q1",
      type: "picture-choice",
      title: "Face à un nouveau projet, vous êtes plutôt...",
      icon: "zap",
      number: 1,
      choices: [
        "🚀 Je fonce tête baissée",
        "📊 J'analyse tout en détail",
        "🤝 Je consulte mon équipe",
        "💡 Je cherche l'innovation"
      ]
    },
    {
      id: "q2",
      type: "choice",
      title: "Votre journée idéale de travail ?",
      icon: "sun",
      number: 2,
      choices: [
        "Réunions et networking",
        "Deep work en solo",
        "Brainstorming créatif",
        "Résolution de problèmes"
      ]
    },
    {
      id: "q3",
      type: "choice",
      title: "Qu'est-ce qui vous motive le plus ?",
      icon: "heart",
      number: 3,
      choices: [
        "💰 La réussite financière",
        "🌍 L'impact positif",
        "🎨 La créativité",
        "📈 La croissance personnelle",
        "🏆 La reconnaissance"
      ]
    },
    {
      id: "q4",
      type: "choice",
      title: "Comment gérez-vous le stress ?",
      icon: "activity",
      number: 4,
      choices: [
        "Je le transforme en énergie",
        "Je prends du recul",
        "J'en parle à quelqu'un",
        "Je fais du sport",
        "Je médite / respire"
      ]
    },
    {
      id: "q5",
      type: "choice",
      title: "Votre plus grande force ?",
      icon: "star",
      number: 5,
      choices: [
        "Ma détermination",
        "Ma créativité",
        "Mon empathie",
        "Ma logique",
        "Mon adaptabilité"
      ]
    },
    {
      id: "q6",
      type: "short-text",
      title: "Quel est votre prénom ?",
      subtitle: "Pour personnaliser vos résultats !",
      icon: "user",
      number: 6,
      placeholder: "Votre prénom"
    },
    {
      id: "q7",
      type: "email",
      title: "Où envoyer votre profil détaillé, {{name}} ?",
      subtitle: "Vous recevrez aussi des conseils adaptés à votre profil.",
      icon: "mail",
      number: 7,
      placeholder: "votre@email.com"
    },
    {
      id: "ending",
      type: "ending",
      title: "Vous êtes un(e) Visionnaire, {{name}} ! 🌟",
      subtitle: "Consultez votre boîte mail pour découvrir votre profil complet et des conseils personnalisés.",
      icon: "award",
      buttonText: "Voir mes résultats"
    }
  ]
};

// =============================================================================
// TEMPLATE 16: INSCRIPTION FORMATION / COURS
// Objectif: Maximiser les inscriptions à une formation
// Angle marketing: Transformation + Résultats + Urgence
// =============================================================================
// PALETTE: Royal Blue (Education & Excellence)
export const courseRegistrationTemplate: FormTemplate = {
  id: "course-registration-1",
  name: "Inscription Formation",
  description: "Maximisez les inscriptions à vos formations avec un formulaire optimisé conversion.",
  category: "education",
  thumbnail: "/templates/course.png",
  color: "#EFF6FF",
  accentColor: "#2563EB",
  backgroundColor: "#1E3A8A",
  colorPalette: {
    primary: "#1E3A8A",    // Deep royal blue
    secondary: "#3B82F6",  // Bright blue
    tertiary: "#EFF6FF",   // Soft blue white
  },
  typography: {
    heading: "Sora",
    body: "Inter",
  },
  gradientStart: "#1D4ED8",
  gradientEnd: "#3B82F6",
  gradientAngle: 135,
  tags: ["formation", "cours", "education", "learning", "training"],
  popularity: 94,
  isNew: true,
  layoutStyle: "gradient",
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "SKILLUP",
  backgroundImages: [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Formation : Maîtrisez le Marketing Digital en 8 semaines",
      subtitle: "🎓 Prochaine session : 15 janvier — Places limitées à 20 participants",
      buttonText: "Je m'inscris",
      icon: "book-open"
    },
    {
      id: "q1",
      type: "short-text",
      title: "Comment vous appelez-vous ?",
      icon: "user",
      number: 1,
      placeholder: "Prénom Nom"
    },
    {
      id: "q2",
      type: "email",
      title: "Votre email, {{name}} ?",
      subtitle: "Pour recevoir le programme détaillé et votre accès.",
      icon: "mail",
      number: 2,
      placeholder: "votre@email.com"
    },
    {
      id: "q3",
      type: "choice",
      title: "Quel est votre niveau actuel en marketing digital ?",
      icon: "bar-chart",
      number: 3,
      choices: [
        "Débutant — Je découvre",
        "Intermédiaire — J'ai les bases",
        "Avancé — Je veux me perfectionner"
      ]
    },
    {
      id: "q4",
      type: "choice",
      title: "Pourquoi souhaitez-vous suivre cette formation ?",
      icon: "target",
      number: 4,
      choices: [
        "Reconversion professionnelle",
        "Monter en compétences dans mon job",
        "Lancer mon propre business",
        "Gérer le marketing de mon entreprise",
        "Curiosité / Culture générale"
      ]
    },
    {
      id: "q5",
      type: "choice",
      title: "Combien de temps pouvez-vous consacrer par semaine ?",
      icon: "clock",
      number: 5,
      choices: [
        "2-3 heures",
        "4-6 heures",
        "7-10 heures",
        "Plus de 10 heures"
      ]
    },
    {
      id: "q6",
      type: "choice",
      title: "Comment souhaitez-vous financer cette formation ?",
      icon: "credit-card",
      number: 6,
      choices: [
        "Financement personnel",
        "CPF (Compte Personnel de Formation)",
        "Financement entreprise",
        "Pôle Emploi / OPCO",
        "Je ne sais pas encore"
      ]
    },
    {
      id: "q7",
      type: "phone",
      title: "Votre téléphone pour un appel de bienvenue",
      subtitle: "Un conseiller vous appellera pour répondre à vos questions.",
      icon: "phone",
      number: 7,
      placeholder: "+33 6 00 00 00 00"
    },
    {
      id: "ending",
      type: "ending",
      title: "Inscription pré-enregistrée, {{name}} ! 🎉",
      subtitle: "Consultez votre boîte mail pour le programme complet. Un conseiller vous contactera sous 48h.",
      icon: "check-circle",
      buttonText: "Parfait !"
    }
  ]
};

// =============================================================================
// TEMPLATE 17: DEVIS ASSURANCE
// Objectif: Qualifier et capturer des leads assurance
// Angle marketing: Protection + Économies + Simplicité
// =============================================================================
// PALETTE: Forest Green (Trust & Protection)
export const insuranceQuoteTemplate: FormTemplate = {
  id: "insurance-quote-1",
  name: "Devis Assurance Express",
  description: "Capturez des leads assurance qualifiés avec un formulaire simple et rassurant.",
  category: "lead-generation",
  thumbnail: "/templates/insurance.png",
  color: "#F0FDF4",
  accentColor: "#16A34A",
  backgroundColor: "#14532D",
  colorPalette: {
    primary: "#14532D",    // Deep forest
    secondary: "#22C55E",  // Bright green
    tertiary: "#F0FDF4",   // Mint white
  },
  typography: {
    heading: "DM Sans",
    body: "Inter",
  },
  gradientStart: "#15803D",
  gradientEnd: "#22C55E",
  gradientAngle: 135,
  tags: ["assurance", "insurance", "devis", "protection", "finance"],
  popularity: 92,
  isPremium: true,
  layoutStyle: "modern",
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "PROTECT+",
  backgroundImages: [
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&q=80",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Comparez et économisez sur votre assurance",
      subtitle: "Obtenez votre devis personnalisé en 2 minutes. Jusqu'à 40% d'économies.",
      buttonText: "Obtenir mon devis",
      icon: "shield"
    },
    {
      id: "q1",
      type: "choice",
      title: "Quel type d'assurance recherchez-vous ?",
      icon: "shield",
      number: 1,
      choices: [
        "🚗 Auto",
        "🏠 Habitation",
        "❤️ Santé / Mutuelle",
        "💼 Professionnelle",
        "🌍 Voyage",
        "📱 Appareils électroniques"
      ]
    },
    {
      id: "q2",
      type: "choice",
      title: "Êtes-vous actuellement assuré(e) ?",
      icon: "check-circle",
      number: 2,
      choices: [
        "Oui, je souhaite changer",
        "Oui, mais mon contrat arrive à échéance",
        "Non, c'est une première souscription"
      ]
    },
    {
      id: "q3",
      type: "choice",
      title: "Quel niveau de couverture souhaitez-vous ?",
      icon: "layers",
      number: 3,
      choices: [
        "Essentiel — Le minimum légal",
        "Confort — Bonne protection",
        "Premium — Protection maximale"
      ]
    },
    {
      id: "q4",
      type: "date",
      title: "À partir de quelle date souhaitez-vous être couvert(e) ?",
      icon: "calendar",
      number: 4
    },
    {
      id: "q5",
      type: "short-text",
      title: "Votre code postal",
      subtitle: "Pour adapter les tarifs à votre zone.",
      icon: "map-pin",
      number: 5,
      placeholder: "Ex: 75001"
    },
    {
      id: "q6",
      type: "short-text",
      title: "Votre nom complet",
      icon: "user",
      number: 6,
      placeholder: "Prénom Nom"
    },
    {
      id: "q7",
      type: "email",
      title: "Où envoyer votre devis ?",
      icon: "mail",
      number: 7,
      placeholder: "votre@email.com"
    },
    {
      id: "q8",
      type: "phone",
      title: "Votre téléphone pour finaliser",
      subtitle: "Un conseiller vous rappelle sous 24h avec les meilleures offres.",
      icon: "phone",
      number: 8,
      placeholder: "+33 6 00 00 00 00"
    },
    {
      id: "ending",
      type: "ending",
      title: "Votre devis est en préparation !",
      subtitle: "Un conseiller vous contactera sous 24h avec les meilleures offres du marché.",
      icon: "check-circle",
      buttonText: "Parfait !"
    }
  ]
};

// =============================================================================
// TEMPLATE 18: DEMANDE DE VOYAGE / DEVIS VOYAGE
// Objectif: Capturer des demandes de voyage personnalisées
// Angle marketing: Rêve + Personnalisation + Expertise
// =============================================================================
// PALETTE: Ocean Teal (Adventure & Dreams)
export const travelRequestTemplate: FormTemplate = {
  id: "travel-request-1",
  name: "Demande de Voyage Sur-Mesure",
  description: "Capturez des demandes de voyage personnalisées avec un formulaire inspirant.",
  category: "lead-generation",
  thumbnail: "/templates/travel.png",
  color: "#ECFEFF",
  accentColor: "#0891B2",
  backgroundColor: "#164E63",
  colorPalette: {
    primary: "#164E63",    // Deep ocean
    secondary: "#06B6D4",  // Bright cyan
    tertiary: "#ECFEFF",   // Sky white
  },
  typography: {
    heading: "Outfit",
    body: "Inter",
  },
  gradientStart: "#0E7490",
  gradientEnd: "#06B6D4",
  gradientAngle: 135,
  tags: ["voyage", "travel", "vacances", "tourisme", "agence"],
  popularity: 93,
  isNew: true,
  layoutStyle: "modern",
  desktopLayout: "wallpaper",
  mobileLayout: "wallpaper",
  buttonStyle: "gradient",
  fontStyle: "sans",
  brandName: "HORIZONS",
  backgroundImages: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80",
    "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=900&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Créons ensemble votre voyage de rêve ✈️",
      subtitle: "Décrivez-nous vos envies, nous nous occupons du reste.",
      buttonText: "Commencer",
      icon: "map"
    },
    {
      id: "q1",
      type: "choice",
      title: "Quel type de voyage vous fait rêver ?",
      icon: "compass",
      number: 1,
      choices: [
        "🏖️ Plage & Détente",
        "🏔️ Aventure & Nature",
        "🏛️ Culture & Découverte",
        "🍷 Gastronomie & Œnologie",
        "💑 Voyage romantique",
        "👨‍👩‍👧‍👦 Voyage en famille",
        "🎿 Sports & Activités"
      ]
    },
    {
      id: "q2",
      type: "choice",
      title: "Quelle destination vous attire ?",
      icon: "globe",
      number: 2,
      choices: [
        "🇪🇺 Europe",
        "🌴 Caraïbes / Antilles",
        "🗽 Amérique du Nord",
        "🌎 Amérique du Sud",
        "🐘 Afrique",
        "🏯 Asie",
        "🦘 Océanie",
        "❄️ Destinations polaires",
        "💡 Surprise-moi !"
      ]
    },
    {
      id: "q3",
      type: "choice",
      title: "Combien de voyageurs ?",
      icon: "users",
      number: 3,
      choices: [
        "Solo",
        "En couple",
        "En famille (avec enfants)",
        "Entre amis (3-6 personnes)",
        "Groupe (7+ personnes)"
      ]
    },
    {
      id: "q4",
      type: "choice",
      title: "Quelle durée de voyage envisagez-vous ?",
      icon: "calendar",
      number: 4,
      choices: [
        "Week-end (2-3 jours)",
        "Court séjour (4-7 jours)",
        "Séjour classique (8-14 jours)",
        "Long voyage (15+ jours)",
        "Tour du monde"
      ]
    },
    {
      id: "q5",
      type: "choice",
      title: "Quel est votre budget par personne ?",
      icon: "credit-card",
      number: 5,
      choices: [
        "Économique (< 1 000€)",
        "Confort (1 000€ - 2 500€)",
        "Premium (2 500€ - 5 000€)",
        "Luxe (5 000€ - 10 000€)",
        "Sur-mesure (10 000€+)"
      ]
    },
    {
      id: "q6",
      type: "long-text",
      title: "Décrivez-nous votre voyage idéal",
      subtitle: "Vos envies, vos rêves, ce qui compte pour vous...",
      icon: "edit",
      number: 6,
      placeholder: "J'imagine un voyage où...",
      maxLength: 500
    },
    {
      id: "q7",
      type: "short-text",
      title: "Votre prénom",
      icon: "user",
      number: 7,
      placeholder: "Votre prénom"
    },
    {
      id: "q8",
      type: "email",
      title: "Où envoyer votre proposition de voyage, {{name}} ?",
      icon: "mail",
      number: 8,
      placeholder: "votre@email.com"
    },
    {
      id: "q9",
      type: "phone",
      title: "Votre téléphone pour en discuter",
      subtitle: "Un conseiller voyage vous rappelle sous 48h.",
      icon: "phone",
      number: 9,
      placeholder: "+33 6 00 00 00 00"
    },
    {
      id: "ending",
      type: "ending",
      title: "Votre voyage prend forme, {{name}} ! 🌍",
      subtitle: "Notre équipe prépare une proposition sur-mesure. Vous la recevrez sous 48h.",
      icon: "plane",
      buttonText: "Parfait !"
    }
  ]
};
