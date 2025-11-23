// Types pour les layouts de chaque page

export type DesktopLayoutType = 
  | 'desktop-left-right'    // Contenu à gauche, visuel à droite
  | 'desktop-right-left'    // Visuel à gauche, contenu à droite
  | 'desktop-centered'      // Contenu centré
  | 'desktop-card'          // Carte centrée avec background
  | 'desktop-panel'         // Panel latéral
  | 'desktop-split'         // Split 50/50
  | 'desktop-wallpaper';    // Fond plein écran avec overlay

export type MobileLayoutType = 
  | 'mobile-vertical'       // Vertical classique
  | 'mobile-horizontal'     // Horizontal scroll
  | 'mobile-centered'       // Centré
  | 'mobile-minimal';       // Minimal sans distraction

export interface LayoutConfig {
  desktop: DesktopLayoutType;
  mobile: MobileLayoutType;
}

export interface PageLayouts {
  welcome: LayoutConfig;
  contact: LayoutConfig;
  wheel: LayoutConfig;
  ending: LayoutConfig;
}

export const DESKTOP_LAYOUTS: Array<{
  id: DesktopLayoutType;
  name: string;
  description: string;
  preview: string;
}> = [
  {
    id: 'desktop-left-right',
    name: 'Gauche-Droite',
    description: 'Contenu à gauche, visuel à droite',
    preview: '/src/assets/layout-desktop-left-right.svg'
  },
  {
    id: 'desktop-right-left',
    name: 'Droite-Gauche',
    description: 'Visuel à gauche, contenu à droite',
    preview: '/src/assets/layout-desktop-right-left.svg'
  },
  {
    id: 'desktop-centered',
    name: 'Centré',
    description: 'Contenu centré au milieu',
    preview: '/src/assets/layout-desktop-centered.svg'
  },
  {
    id: 'desktop-card',
    name: 'Carte',
    description: 'Carte centrée avec fond',
    preview: '/src/assets/layout-desktop-card.svg'
  },
  {
    id: 'desktop-panel',
    name: 'Panel',
    description: 'Panel latéral élégant',
    preview: '/src/assets/layout-desktop-panel.svg'
  },
  {
    id: 'desktop-split',
    name: 'Split 50/50',
    description: 'Division égale de l\'écran',
    preview: '/src/assets/layout-desktop-split.svg'
  },
  {
    id: 'desktop-wallpaper',
    name: 'Wallpaper',
    description: 'Fond plein écran avec overlay',
    preview: '/src/assets/layout-desktop-wallpaper.svg'
  }
];

export const MOBILE_LAYOUTS: Array<{
  id: MobileLayoutType;
  name: string;
  description: string;
  preview: string;
}> = [
  {
    id: 'mobile-vertical',
    name: 'Vertical',
    description: 'Layout vertical classique',
    preview: '/src/assets/layout-mobile-vertical.svg'
  },
  {
    id: 'mobile-horizontal',
    name: 'Horizontal',
    description: 'Scroll horizontal',
    preview: '/src/assets/layout-mobile-horizontal.svg'
  },
  {
    id: 'mobile-centered',
    name: 'Centré',
    description: 'Contenu centré',
    preview: '/src/assets/layout-mobile-centered.svg'
  },
  {
    id: 'mobile-minimal',
    name: 'Minimal',
    description: 'Design épuré',
    preview: '/src/assets/layout-mobile-minimal.svg'
  }
];
