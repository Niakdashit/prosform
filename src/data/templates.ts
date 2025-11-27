// Template data for the Form Builder Template Library
import { Question } from "@/components/FormBuilder";
import { LayoutStyle, ButtonStyle, FontStyle } from "@/lib/design-tokens";
import {
  ecommerceDiscountTemplate,
  freeAuditTemplate,
  productQuizTemplate,
  saasOnboardingTemplate,
  audienceSegmentationTemplate,
  b2bLeadQualificationTemplate,
  postPurchaseSurveyTemplate,
  webinarRegistrationTemplate,
  coachingBookingTemplate,
  realEstateEstimationTemplate,
  fitnessAssessmentTemplate,
  restaurantBookingTemplate,
  quoteRequestTemplate,
  jobApplicationSimpleTemplate,
  personalityQuizProTemplate,
  courseRegistrationTemplate,
  insuranceQuoteTemplate,
  travelRequestTemplate,
} from "./templates-pro";

// Color Palette System - 3 harmonious tints per template
export interface ColorPalette {
  primary: string;    // Main brand color (buttons, accents)
  secondary: string;  // Supporting color (hover states, highlights)
  tertiary: string;   // Neutral/light color (backgrounds, subtle elements)
}

// Typography System - Google Fonts combinations
export interface TypographyConfig {
  heading: string;    // Google Font for titles (e.g., "Playfair Display")
  body: string;       // Google Font for body text (e.g., "Inter")
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  color: string;
  accentColor: string;
  backgroundColor: string;
  questions: Question[];
  tags: string[];
  popularity: number;
  isNew?: boolean;
  isPremium?: boolean;
  // Layout & Design options
  layoutStyle?: LayoutStyle;
  buttonStyle?: ButtonStyle;
  fontStyle?: FontStyle;
  brandName?: string;
  backgroundImages?: string[];
  // Gradient support
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  // Picture choice images
  pictureChoiceImages?: string[];
  // Desktop/Mobile layout options
  desktopLayout?: 'left-right' | 'right-left' | 'centered' | 'split-right' | 'split-left' | 'wallpaper';
  mobileLayout?: 'vertical' | 'banner' | 'wallpaper';
  // NEW: Professional Color Palette System (3 tints)
  colorPalette?: ColorPalette;
  // NEW: Typography Configuration (Google Fonts)
  typography?: TypographyConfig;
}

export type TemplateCategory = 
  | "product-recommendation"
  | "customer-feedback"
  | "lead-generation"
  | "quiz"
  | "survey"
  | "registration"
  | "order-form"
  | "contact"
  | "hr"
  | "education";

export const templateCategories: { id: TemplateCategory; name: string; icon: string; description: string }[] = [
  { id: "product-recommendation", name: "Product Recommendation", icon: "", description: "Help customers find the perfect product" },
  { id: "customer-feedback", name: "Customer Feedback", icon: "", description: "Collect valuable customer insights" },
  { id: "lead-generation", name: "Lead Generation", icon: "", description: "Capture and qualify leads" },
  { id: "quiz", name: "Quiz", icon: "", description: "Engage users with interactive quizzes" },
  { id: "survey", name: "Survey", icon: "", description: "Gather data and opinions" },
  { id: "registration", name: "Registration", icon: "", description: "Event and signup forms" },
  { id: "order-form", name: "Order Form", icon: "", description: "Process orders and payments" },
  { id: "contact", name: "Contact", icon: "", description: "Get in touch forms" },
  { id: "hr", name: "HR & Recruitment", icon: "", description: "Hiring and employee forms" },
  { id: "education", name: "Education", icon: "", description: "Learning and assessment forms" },
];

// Product Recommendation Template - Split Left-Right with Image
// PALETTE: Warm Earth Tones (Caramel/Terracotta) - comme Image 2
export const productRecommendationTemplate: FormTemplate = {
  id: "product-recommendation-1",
  name: "Skincare Routine Finder",
  description: "Beautiful split-screen quiz to recommend personalized skincare products.",
  category: "product-recommendation",
  thumbnail: "/templates/product-recommendation.png",
  color: "#FDF6F0",
  accentColor: "#C4915C",
  backgroundColor: "#2D2A26",
  // NEW: 3-Tint Color Palette (Earth Tones)
  colorPalette: {
    primary: "#4A3728",    // Dark brown (buttons, headings)
    secondary: "#C4915C",  // Caramel (accents, hover)
    tertiary: "#F5EBE0",   // Cream white (backgrounds)
  },
  // NEW: Google Fonts Typography
  typography: {
    heading: "Playfair Display",  // Elegant serif for titles
    body: "Inter",                 // Clean sans for body
  },
  tags: ["skincare", "beauty", "recommendation", "e-commerce"],
  popularity: 98,
  isNew: true,
  layoutStyle: "typeform" as const,
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "rounded",
  fontStyle: "serif",
  brandName: "GLOW",
  backgroundImages: [
    "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=900&q=80",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80",
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900&q=80",
    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=900&q=80",
  ],
  pictureChoiceImages: [
    "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
  ],
  questions: [
    {
      id: "welcome",
      type: "welcome",
      title: "Discover your perfect skincare routine",
      subtitle: "Take our 2-minute quiz for personalized product recommendations.",
      buttonText: "Find my routine",
      icon: "sparkles"
    },
    {
      id: "q1",
      type: "picture-choice",
      title: "What's your skin type?",
      icon: "image",
      number: 1,
      choices: ["Oily", "Dry", "Combination", "Sensitive"]
    },
    {
      id: "q2",
      type: "choice",
      title: "What's your main skin concern?",
      icon: "target",
      number: 2,
      choices: ["Acne & breakouts", "Fine lines & wrinkles", "Dark spots", "Dullness", "Redness"]
    },
    {
      id: "q3",
      type: "choice",
      title: "How would you describe your current routine?",
      icon: "clock",
      number: 3,
      choices: ["Minimal (cleanser only)", "Basic (cleanser + moisturizer)", "Complete (5+ products)"]
    },
    {
      id: "q4",
      type: "email",
      title: "Where should we send your routine?",
      icon: "mail",
      number: 4,
      placeholder: "your@email.com"
    },
    { 
      id: "ending", 
      type: "ending", 
      title: "Your personalized routine is ready!", 
      subtitle: "Check your inbox for your custom skincare recommendations.", 
      icon: "check-circle", 
      buttonText: "View products" 
    }
  ]
};

// NPS Survey Template - Wallpaper Style with Image Background
// PALETTE: Forest Green (Professional & Trustworthy)
export const npsSurveyTemplate: FormTemplate = {
  id: "nps-survey-1",
  name: "NPS Feedback Survey",
  description: "Stunning wallpaper-style NPS survey with full-screen imagery.",
  category: "customer-feedback",
  thumbnail: "/templates/nps-survey.png",
  color: "#FFFFFF",
  accentColor: "#10B981",
  backgroundColor: "#065F46",
  // NEW: 3-Tint Color Palette (Forest Green)
  colorPalette: {
    primary: "#065F46",    // Deep forest green
    secondary: "#10B981",  // Emerald accent
    tertiary: "#ECFDF5",   // Mint white
  },
  typography: {
    heading: "DM Sans",
    body: "Inter",
  },
  gradientStart: "#065F46",
  gradientEnd: "#10B981",
  gradientAngle: 135,
  tags: ["nps", "customer-loyalty", "feedback"],
  popularity: 98,
  layoutStyle: "gradient",
  desktopLayout: "wallpaper",
  mobileLayout: "wallpaper",
  buttonStyle: "soft",
  fontStyle: "sans",
  brandName: "ACME",
  backgroundImages: [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
    "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=900&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
  ],
  questions: [
    { 
      id: "welcome", 
      type: "welcome", 
      title: "Your opinion shapes our future", 
      subtitle: "Take 2 minutes to help us serve you better.", 
      buttonText: "Share feedback", 
      icon: "heart" 
    },
    { 
      id: "q1", 
      type: "rating", 
      title: "On a scale of 0-10, how likely are you to recommend us?", 
      subtitle: "0 = Not at all likely, 10 = Extremely likely",
      icon: "star", 
      number: 1, 
      variant: "scale", 
      ratingCount: 10, 
      ratingType: "nps" 
    },
    { 
      id: "q2", 
      type: "long-text", 
      title: "What's the main reason for your score?", 
      subtitle: "Be as specific as you'd like.",
      icon: "message-circle", 
      number: 2, 
      variant: "long", 
      placeholder: "I gave this score because...", 
      maxLength: 500 
    },
    { 
      id: "q3", 
      type: "choice", 
      title: "Which aspects matter most to you?", 
      icon: "check-square", 
      number: 3, 
      choices: ["Product Quality", "Customer Support", "Value for Money", "Ease of Use", "Reliability", "Innovation"], 
      variant: "checkbox" 
    },
    { 
      id: "q4", 
      type: "long-text", 
      title: "Any suggestions for improvement?", 
      subtitle: "We read every response.",
      icon: "lightbulb", 
      number: 4, 
      variant: "long", 
      placeholder: "I wish you would...", 
      maxLength: 500 
    },
    { 
      id: "ending", 
      type: "ending", 
      title: "Thank you for your feedback!", 
      subtitle: "Your insights help us build something better.", 
      icon: "check-circle",
      buttonText: "Done"
    }
  ]
};

// CSAT Survey Template - Right-Left Split with Elegant Style
// PALETTE: Royal Gold & Navy (Luxury feel)
export const csatSurveyTemplate: FormTemplate = {
  id: "csat-survey-1",
  name: "Customer Experience Survey",
  description: "Elegant split-screen survey with image on left, premium feel.",
  category: "customer-feedback",
  thumbnail: "/templates/csat-survey.png",
  color: "#F8FAFC",
  accentColor: "#C9A962",
  backgroundColor: "#1A1A2E",
  colorPalette: {
    primary: "#1A1A2E",    // Deep navy
    secondary: "#C9A962",  // Royal gold
    tertiary: "#F8F6F0",   // Ivory white
  },
  typography: {
    heading: "Cormorant Garamond",
    body: "Lato",
  },
  tags: ["csat", "satisfaction", "experience", "luxury"],
  popularity: 92,
  layoutStyle: "elegant",
  desktopLayout: "right-left",
  mobileLayout: "banner",
  buttonStyle: "soft",
  fontStyle: "serif",
  brandName: "MAISON",
  backgroundImages: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80",
  ],
  questions: [
    { 
      id: "welcome", 
      type: "welcome", 
      title: "We'd love to hear about your experience", 
      subtitle: "Your feedback is invaluable to us.", 
      buttonText: "Begin", 
      icon: "smile" 
    },
    { 
      id: "q1", 
      type: "rating", 
      title: "How would you rate your overall experience?", 
      icon: "star", 
      number: 1, 
      variant: "stars", 
      ratingCount: 5, 
      ratingType: "stars" 
    },
    { 
      id: "q2", 
      type: "rating", 
      title: "Quality of our product or service?", 
      icon: "award", 
      number: 2, 
      variant: "stars", 
      ratingCount: 5, 
      ratingType: "stars" 
    },
    { 
      id: "q3", 
      type: "rating", 
      title: "How responsive was our support team?", 
      icon: "headphones", 
      number: 3, 
      variant: "stars", 
      ratingCount: 5, 
      ratingType: "stars" 
    },
    { 
      id: "q4", 
      type: "choice", 
      title: "What stood out to you?", 
      subtitle: "Select all that apply.",
      icon: "thumbs-up", 
      number: 4, 
      choices: ["Exceptional Quality", "Seamless Experience", "Outstanding Service", "Great Value", "Fast Delivery", "Beautiful Design"], 
      variant: "checkbox" 
    },
    { 
      id: "q5", 
      type: "long-text", 
      title: "How could we elevate your experience?", 
      icon: "edit", 
      number: 5, 
      variant: "long", 
      placeholder: "Share your thoughts...", 
      maxLength: 500 
    },
    { 
      id: "q6", 
      type: "yesno", 
      title: "Would you choose us again?", 
      icon: "repeat", 
      number: 6 
    },
    { 
      id: "ending", 
      type: "ending", 
      title: "Thank you for your time", 
      subtitle: "Your feedback helps us deliver excellence.", 
      icon: "heart",
      buttonText: "Close"
    }
  ]
};

// Lead Generation Template - Bold Style
// PALETTE: Sunset Orange (Energy & Conversion)
export const leadGenerationTemplate: FormTemplate = {
  id: "lead-gen-1",
  name: "Growth Accelerator",
  description: "High-converting lead capture with bold design and gradient accents.",
  category: "lead-generation",
  thumbnail: "/templates/lead-gen.png",
  color: "#FAFAF9",
  accentColor: "#F97316",
  backgroundColor: "#1C1917",
  colorPalette: {
    primary: "#EA580C",    // Deep orange
    secondary: "#F97316",  // Bright orange
    tertiary: "#FFF7ED",   // Warm white
  },
  typography: {
    heading: "Space Grotesk",
    body: "Inter",
  },
  gradientStart: "#F97316",
  gradientEnd: "#FBBF24",
  gradientAngle: 45,
  tags: ["leads", "sales", "conversion"],
  popularity: 90,
  isPremium: true,
  layoutStyle: "bold",
  desktopLayout: "centered",
  mobileLayout: "vertical",
  buttonStyle: "gradient",
  fontStyle: "display",
  brandName: "ROCKET",
  backgroundImages: [
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80",
  ],
  questions: [
    { 
      id: "welcome", 
      type: "welcome", 
      title: "Ready to 10x your growth?", 
      subtitle: "Get a free strategy session with our experts.", 
      buttonText: "Let's go", 
      icon: "rocket" 
    },
    { 
      id: "q1", 
      type: "short-text", 
      title: "What should we call you?", 
      icon: "user", 
      number: 1, 
      placeholder: "Your name" 
    },
    { 
      id: "q2", 
      type: "email", 
      title: "Best email to reach you?", 
      icon: "mail", 
      number: 2, 
      placeholder: "name@company.com" 
    },
    { 
      id: "q3", 
      type: "phone", 
      title: "Phone for a quick call?", 
      subtitle: "We'll only call if needed.",
      icon: "phone", 
      number: 3, 
      placeholder: "+1 (555) 000-0000" 
    },
    { 
      id: "q4", 
      type: "short-text", 
      title: "What's your company?", 
      icon: "building", 
      number: 4, 
      placeholder: "Company name" 
    },
    { 
      id: "q5", 
      type: "choice", 
      title: "How big is your team?", 
      icon: "users", 
      number: 5, 
      choices: ["Just me", "2-10", "11-50", "51-200", "200+"] 
    },
    { 
      id: "q6", 
      type: "choice", 
      title: "What's your biggest challenge?", 
      icon: "target", 
      number: 6, 
      choices: ["Getting more leads", "Closing deals faster", "Scaling operations", "Reducing costs", "Building brand"] 
    },
    { 
      id: "q7", 
      type: "long-text", 
      title: "Anything else we should know?", 
      icon: "message-square", 
      number: 7, 
      placeholder: "Tell us about your goals...", 
      maxLength: 1000 
    },
    { 
      id: "ending", 
      type: "ending", 
      title: "You're all set!", 
      subtitle: "Expect a call from our team within 24 hours.", 
      icon: "check-circle",
      buttonText: "Done"
    }
  ]
};

// Quiz Template - Modern Style
// PALETTE: Purple/Violet (comme Image 1 - Creativity & Fun)
export const personalityQuizTemplate: FormTemplate = {
  id: "quiz-personality-1",
  name: "Work Style Quiz",
  description: "Vibrant, modern quiz with picture choices and engaging animations.",
  category: "quiz",
  thumbnail: "/templates/personality-quiz.png",
  color: "#FAFAFA",
  accentColor: "#8B5CF6",
  backgroundColor: "#18181B",
  colorPalette: {
    primary: "#5B4B8A",    // Deep violet (comme Image 1)
    secondary: "#9B8BC4",  // Medium lavender
    tertiary: "#F5F3FF",   // Light violet white
  },
  typography: {
    heading: "Outfit",
    body: "Inter",
  },
  gradientStart: "#7C3AED",
  gradientEnd: "#EC4899",
  gradientAngle: 135,
  tags: ["quiz", "personality", "engagement"],
  popularity: 88,
  isNew: true,
  layoutStyle: "modern",
  desktopLayout: "centered",
  mobileLayout: "vertical",
  buttonStyle: "rounded",
  fontStyle: "sans",
  brandName: "MINDSET",
  backgroundImages: [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80",
    "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=900&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80",
  ],
  pictureChoiceImages: [
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80",
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  ],
  questions: [
    { 
      id: "welcome", 
      type: "welcome", 
      title: "Discover your work personality", 
      subtitle: "A 2-minute quiz to unlock your productivity superpowers.", 
      buttonText: "Start quiz", 
      icon: "brain" 
    },
    { 
      id: "q1", 
      type: "picture-choice", 
      title: "Where do you do your best work?", 
      icon: "home", 
      number: 1, 
      choices: ["Home Office", "Coffee Shop", "Open Office", "Library"] 
    },
    { 
      id: "q2", 
      type: "choice", 
      title: "When does your brain fire on all cylinders?", 
      icon: "clock", 
      number: 2, 
      choices: ["Early bird (6-9am)", "Morning (9-12pm)", "Afternoon (12-5pm)", "Night owl (after 8pm)"] 
    },
    { 
      id: "q3", 
      type: "choice", 
      title: "How do you prefer to communicate?", 
      icon: "message-circle", 
      number: 3, 
      choices: ["In person", "Video call", "Voice message", "Text/Chat", "Email"] 
    },
    { 
      id: "q4", 
      type: "rating", 
      title: "How comfortable are you juggling multiple tasks?", 
      subtitle: "1 = One thing at a time, 5 = Bring it on!",
      icon: "layers", 
      number: 4, 
      variant: "scale", 
      ratingCount: 5, 
      ratingType: "scale" 
    },
    { 
      id: "q5", 
      type: "choice", 
      title: "What drives you to do great work?", 
      icon: "zap", 
      number: 5, 
      choices: ["Recognition & praise", "Money & rewards", "Learning new things", "Helping the team", "Freedom & autonomy"] 
    },
    { 
      id: "q6", 
      type: "email", 
      title: "Where should we send your results?", 
      subtitle: "We'll include personalized tips.",
      icon: "mail", 
      number: 6, 
      placeholder: "you@email.com" 
    },
    { 
      id: "ending", 
      type: "ending", 
      title: "You're a Creative Innovator!", 
      subtitle: "Check your inbox for your full personality breakdown.", 
      icon: "award",
      buttonText: "See results"
    }
  ]
};

// Contact Form Template - Minimal Style
// PALETTE: Slate Gray (Professional & Clean)
export const contactFormTemplate: FormTemplate = {
  id: "contact-form-1",
  name: "Contact Us",
  description: "Clean, minimal contact form with focus on simplicity and clarity.",
  category: "contact",
  thumbnail: "/templates/contact-form.png",
  color: "#0F172A",
  accentColor: "#475569",
  backgroundColor: "#FFFFFF",
  colorPalette: {
    primary: "#0F172A",    // Dark slate
    secondary: "#475569",  // Medium slate
    tertiary: "#F8FAFC",   // Light gray
  },
  typography: {
    heading: "Geist",
    body: "Geist",
  },
  tags: ["contact", "support", "inquiry"],
  popularity: 94,
  layoutStyle: "minimal",
  desktopLayout: "centered",
  mobileLayout: "vertical",
  buttonStyle: "sharp",
  fontStyle: "sans",
  brandName: "STUDIO",
  questions: [
    { 
      id: "welcome", 
      type: "welcome", 
      title: "Let's talk", 
      subtitle: "We typically respond within 24 hours.", 
      buttonText: "Start", 
      icon: "mail" 
    },
    { 
      id: "q1", 
      type: "short-text", 
      title: "What's your name?", 
      icon: "user", 
      number: 1, 
      variant: "short", 
      placeholder: "Jane Doe" 
    },
    { 
      id: "q2", 
      type: "email", 
      title: "Your email address", 
      icon: "mail", 
      number: 2, 
      placeholder: "jane@company.com" 
    },
    { 
      id: "q3", 
      type: "choice", 
      title: "What can we help with?", 
      icon: "help-circle", 
      number: 3, 
      choices: ["General inquiry", "Technical support", "Sales question", "Partnership", "Press & media"] 
    },
    { 
      id: "q4", 
      type: "long-text", 
      title: "Tell us more", 
      icon: "message-square", 
      number: 4, 
      variant: "long", 
      placeholder: "Describe your question or request...", 
      maxLength: 2000 
    },
    { 
      id: "ending", 
      type: "ending", 
      title: "Message received", 
      subtitle: "We'll be in touch shortly.", 
      icon: "check-circle",
      buttonText: "Done"
    }
  ]
};

// Event Registration Template - Glassmorphism Style
// PALETTE: Teal/Cyan (Fresh & Modern)
export const eventRegistrationTemplate: FormTemplate = {
  id: "event-registration-1",
  name: "Event Registration",
  description: "Stunning glassmorphism design for premium event signups.",
  category: "registration",
  thumbnail: "/templates/event-registration.png",
  color: "#FFFFFF",
  accentColor: "#06B6D4",
  backgroundColor: "#0E7490",
  colorPalette: {
    primary: "#155E75",    // Deep teal
    secondary: "#06B6D4",  // Bright cyan
    tertiary: "#ECFEFF",   // Ice white
  },
  typography: {
    heading: "Sora",
    body: "Inter",
  },
  gradientStart: "#0E7490",
  gradientEnd: "#164E63",
  gradientAngle: 180,
  tags: ["event", "registration", "conference"],
  popularity: 85,
  layoutStyle: "glassmorphism",
  desktopLayout: "centered",
  mobileLayout: "vertical",
  buttonStyle: "soft",
  fontStyle: "sans",
  brandName: "SUMMIT 2024",
  backgroundImages: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&q=80",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=900&q=80",
  ],
  questions: [
    { 
      id: "welcome", 
      type: "welcome", 
      title: "Join us at Summit 2024", 
      subtitle: "The future of innovation starts here. Secure your seat.", 
      buttonText: "Register now", 
      icon: "calendar" 
    },
    { 
      id: "q1", 
      type: "short-text", 
      title: "Your full name", 
      icon: "user", 
      number: 1, 
      variant: "short", 
      placeholder: "As it should appear on your badge" 
    },
    { 
      id: "q2", 
      type: "email", 
      title: "Email address", 
      subtitle: "We'll send your ticket here.",
      icon: "mail", 
      number: 2, 
      placeholder: "you@company.com" 
    },
    { 
      id: "q3", 
      type: "short-text", 
      title: "Company or organization", 
      icon: "building", 
      number: 3, 
      variant: "short", 
      placeholder: "Where do you work?" 
    },
    { 
      id: "q4", 
      type: "choice", 
      title: "Which sessions interest you?", 
      subtitle: "Select all that apply.",
      icon: "clock", 
      number: 4, 
      choices: ["Keynote (9am)", "Workshop A (11am)", "Workshop B (2pm)", "Networking (5pm)", "After-party (7pm)"],
      variant: "checkbox"
    },
    { 
      id: "q5", 
      type: "choice", 
      title: "Any dietary preferences?", 
      icon: "coffee", 
      number: 5, 
      choices: ["No restrictions", "Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher"] 
    },
    { 
      id: "q6", 
      type: "yesno", 
      title: "Keep me updated about future events?", 
      icon: "bell", 
      number: 6 
    },
    { 
      id: "ending", 
      type: "ending", 
      title: "You're in!", 
      subtitle: "Check your inbox for your confirmation and ticket.", 
      icon: "check-circle",
      buttonText: "Done"
    }
  ]
};

// Job Application Template - Bold Style
// PALETTE: Rose/Red (Energy & Ambition)
export const jobApplicationTemplate: FormTemplate = {
  id: "job-application-1",
  name: "Career Application",
  description: "Bold, professional job application form with strong visual identity.",
  category: "hr",
  thumbnail: "/templates/job-application.png",
  color: "#FAFAFA",
  accentColor: "#E11D48",
  backgroundColor: "#18181B",
  colorPalette: {
    primary: "#9F1239",    // Deep rose
    secondary: "#E11D48",  // Bright rose
    tertiary: "#FFF1F2",   // Soft pink white
  },
  typography: {
    heading: "Manrope",
    body: "Inter",
  },
  tags: ["hr", "recruitment", "careers"],
  popularity: 82,
  isPremium: true,
  layoutStyle: "bold",
  desktopLayout: "left-right",
  mobileLayout: "banner",
  buttonStyle: "soft",
  fontStyle: "sans",
  brandName: "CAREERS",
  backgroundImages: [
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80",
  ],
  questions: [
    { 
      id: "welcome", 
      type: "welcome", 
      title: "Build your future with us", 
      subtitle: "We're always looking for exceptional talent.", 
      buttonText: "Apply now", 
      icon: "briefcase" 
    },
    { 
      id: "q1", 
      type: "short-text", 
      title: "What's your name?", 
      icon: "user", 
      number: 1, 
      variant: "short", 
      placeholder: "Full name" 
    },
    { 
      id: "q2", 
      type: "email", 
      title: "Best email to reach you?", 
      icon: "mail", 
      number: 2, 
      placeholder: "you@email.com" 
    },
    { 
      id: "q3", 
      type: "phone", 
      title: "Phone number", 
      subtitle: "For scheduling interviews.",
      icon: "phone", 
      number: 3, 
      placeholder: "+1 (555) 000-0000" 
    },
    { 
      id: "q4", 
      type: "choice", 
      title: "Which role interests you?", 
      icon: "briefcase", 
      number: 4, 
      choices: ["Engineering", "Design", "Product", "Marketing", "Sales", "Operations", "Other"] 
    },
    { 
      id: "q5", 
      type: "choice", 
      title: "Years of relevant experience?", 
      icon: "clock", 
      number: 5, 
      choices: ["0-2 years", "3-5 years", "6-10 years", "10+ years"] 
    },
    { 
      id: "q6", 
      type: "file", 
      title: "Upload your resume", 
      subtitle: "PDF or Word document, max 10MB.",
      icon: "file-text", 
      number: 6, 
      fileTypes: ["PDF", "DOC", "DOCX"], 
      maxFileSize: 10 
    },
    { 
      id: "q7", 
      type: "long-text", 
      title: "Why do you want to join us?", 
      subtitle: "What excites you about this opportunity?",
      icon: "heart", 
      number: 7, 
      variant: "long", 
      placeholder: "Share your motivation...", 
      maxLength: 1000 
    },
    { 
      id: "q8", 
      type: "short-text", 
      title: "Link to your portfolio or LinkedIn", 
      icon: "link", 
      number: 8, 
      variant: "short", 
      placeholder: "https://" 
    },
    { 
      id: "ending", 
      type: "ending", 
      title: "Application received!", 
      subtitle: "Our team will review and reach out within 5 business days.", 
      icon: "check-circle",
      buttonText: "Done"
    }
  ]
};


// All templates export
export const allTemplates: FormTemplate[] = [
  // Original templates
  productRecommendationTemplate,
  npsSurveyTemplate,
  csatSurveyTemplate,
  leadGenerationTemplate,
  personalityQuizTemplate,
  contactFormTemplate,
  eventRegistrationTemplate,
  jobApplicationTemplate,
  // Pro templates - Lead Generation
  ecommerceDiscountTemplate,
  freeAuditTemplate,
  b2bLeadQualificationTemplate,
  quoteRequestTemplate,
  realEstateEstimationTemplate,
  // Pro templates - Product & Quiz
  productQuizTemplate,
  audienceSegmentationTemplate,
  personalityQuizProTemplate,
  fitnessAssessmentTemplate,
  // Pro templates - Registration & Onboarding
  saasOnboardingTemplate,
  webinarRegistrationTemplate,
  // Pro templates - Feedback & Satisfaction
  postPurchaseSurveyTemplate,
  // Pro templates - Booking & Contact
  coachingBookingTemplate,
  restaurantBookingTemplate,
  // Pro templates - HR
  jobApplicationSimpleTemplate,
  // Pro templates - Education
  courseRegistrationTemplate,
  // Pro templates - Insurance & Travel
  insuranceQuoteTemplate,
  travelRequestTemplate,
];

export const getTemplatesByCategory = (category: TemplateCategory): FormTemplate[] => {
  return allTemplates.filter(t => t.category === category);
};

export const getTemplateById = (id: string): FormTemplate | undefined => {
  return allTemplates.find(t => t.id === id);
};

export const searchTemplates = (query: string): FormTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return allTemplates.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
