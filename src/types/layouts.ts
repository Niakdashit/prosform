// Types pour les layouts de chaque page

export type DesktopLayoutType = 
  | 'desktop-left-right'    // Contenu à gauche, visuel à droite
  | 'desktop-right-left'    // Visuel à gauche, contenu à droite
  | 'desktop-centered'      // Contenu centré
  | 'desktop-card'          // Split right - Contenu à gauche, roue à droite
  | 'desktop-panel'         // Split left - Roue à gauche, contenu à droite
  | 'desktop-split';        // Wallpaper - Fond avec overlay

export type MobileLayoutType = 
  | 'mobile-vertical'       // Vertical classique
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
    name: 'Split right',
    description: 'Contenu à gauche, roue à droite',
    preview: '/src/assets/layout-desktop-card.svg'
  },
  {
    id: 'desktop-panel',
    name: 'Split left',
    description: 'Roue à gauche, contenu à droite',
    preview: '/src/assets/layout-desktop-panel.svg'
  },
  {
    id: 'desktop-split',
    name: 'Wallpaper',
    description: 'Fond plein écran avec overlay',
    preview: '/src/assets/layout-desktop-split.svg'
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
    id: 'mobile-centered',
    name: 'Bannière',
    description: 'Contenu centré',
    preview: '/src/assets/layout-mobile-centered.svg'
  },
  {
    id: 'mobile-minimal',
    name: 'Wallpaper',
    description: 'Design épuré',
    preview: '/src/assets/layout-mobile-minimal.svg'
  }
];
