# 📐 Système de Layouts - Documentation Complète

## 🎯 Vue d'ensemble

Le système de layouts permet de personnaliser la mise en page de chaque étape du funnel (Welcome, Contact, Wheel, Ending) avec des options différentes pour desktop et mobile.

## 🏗️ Architecture

### Structure des fichiers

```
src/
├── types/
│   └── layouts.ts                    # Types et définitions des layouts
├── components/
│   ├── layouts/
│   │   ├── LayoutWrapper.tsx         # Wrapper principal
│   │   ├── WelcomeLayouts.tsx        # Layouts page d'accueil
│   │   ├── ContactLayouts.tsx        # Layouts formulaire contact
│   │   ├── WheelLayouts.tsx          # Layouts roue de la fortune
│   │   └── EndingLayouts.tsx         # Layouts page de fin
│   ├── LayoutSelector.tsx            # Sélecteur de layout (UI)
│   ├── WheelBuilder.tsx              # Builder principal (mis à jour)
│   ├── WheelPreview.tsx              # Preview (mis à jour)
│   └── WheelSettingsPanel.tsx        # Panel de settings (mis à jour)
└── assets/
    ├── layout-desktop-*.svg          # Previews desktop
    └── layout-mobile-*.svg           # Previews mobile
```

## 📋 Layouts Disponibles

### Desktop Layouts

1. **desktop-left-right** 
   - Contenu à gauche, visuel à droite
   - Idéal pour: Welcome screen, Contact form
   - Grid 50/50

2. **desktop-right-left**
   - Visuel à gauche, contenu à droite
   - Variante inversée du précédent
   - Grid 50/50

3. **desktop-centered**
   - Contenu centré au milieu
   - Idéal pour: Wheel, Ending
   - Flex center

4. **desktop-card**
   - Carte centrée avec fond
   - Style élégant et moderne
   - Carte avec shadow et backdrop

5. **desktop-panel**
   - Panel latéral avec fond différent
   - Grid 400px + flex
   - Idéal pour formulaires

6. **desktop-split**
   - Division égale 50/50
   - Avec bordure de séparation
   - Symétrique

7. **desktop-wallpaper**
   - Fond plein écran avec overlay
   - Effet backdrop-blur
   - Immersif

### Mobile Layouts

1. **mobile-vertical**
   - Layout vertical classique
   - Scroll naturel
   - Flex column

2. **mobile-horizontal**
   - Scroll horizontal
   - Snap scroll
   - Expérience swipe

3. **mobile-centered**
   - Contenu centré
   - Minimal et épuré
   - Flex center

4. **mobile-minimal**
   - Design ultra-épuré
   - Sans distractions
   - Padding optimisé

## 🎨 Configuration

### Dans WheelConfig

```typescript
export interface WheelConfig {
  welcomeScreen: {
    title: string;
    subtitle: string;
    buttonText: string;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
  };
  contactForm: {
    enabled: boolean;
    title: string;
    subtitle: string;
    fields: ContactField[];
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
  };
  wheelScreen: {
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
  };
  segments: WheelSegment[];
  endingScreen: {
    title: string;
    subtitle: string;
    mobileLayout: MobileLayoutType;
    desktopLayout: DesktopLayoutType;
  };
}
```

### Configuration par défaut

```typescript
const defaultWheelConfig: WheelConfig = {
  welcomeScreen: {
    // ...
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-left-right"
  },
  contactForm: {
    // ...
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  },
  wheelScreen: {
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  },
  endingScreen: {
    // ...
    mobileLayout: "mobile-vertical",
    desktopLayout: "desktop-centered"
  }
};
```

## 🎯 Utilisation

### 1. Sélection via UI

Le composant `LayoutSelector` est intégré dans `WheelSettingsPanel` pour chaque page:

```tsx
<LayoutSelector
  desktopLayout={config.welcomeScreen.desktopLayout}
  mobileLayout={config.welcomeScreen.mobileLayout}
  onDesktopLayoutChange={(layout) => onUpdateConfig({
    welcomeScreen: { ...config.welcomeScreen, desktopLayout: layout }
  })}
  onMobileLayoutChange={(layout) => onUpdateConfig({
    welcomeScreen: { ...config.welcomeScreen, mobileLayout: layout }
  })}
/>
```

### 2. Rendu automatique

Le `WheelPreview` utilise automatiquement le bon layout:

```tsx
const getCurrentLayout = () => {
  const layoutKey = viewMode === 'desktop' ? 'desktopLayout' : 'mobileLayout';
  switch (activeView) {
    case 'welcome':
      return config.welcomeScreen[layoutKey];
    case 'contact':
      return config.contactForm[layoutKey];
    case 'wheel':
      return config.wheelScreen[layoutKey];
    case 'ending':
      return config.endingScreen[layoutKey];
  }
};
```

## 🎨 Personnalisation des Layouts

### WelcomeLayouts

Chaque layout affiche:
- Titre (éditable)
- Sous-titre (éditable)
- Bouton d'action
- Visuel optionnel (emoji ou image)

```tsx
<WelcomeLayouts
  layout={currentLayout}
  viewMode={viewMode}
  title={config.welcomeScreen.title}
  subtitle={config.welcomeScreen.subtitle}
  buttonText={config.welcomeScreen.buttonText}
  onButtonClick={onNext}
  backgroundColor={theme.backgroundColor}
  textColor={theme.textColor}
  buttonColor={theme.buttonColor}
/>
```

### ContactLayouts

Formulaire adaptatif avec:
- Titre et sous-titre
- Champs dynamiques
- Validation
- Bouton de soumission

```tsx
<ContactLayouts
  layout={currentLayout}
  viewMode={viewMode}
  title={config.contactForm.title}
  subtitle={config.contactForm.subtitle}
  fields={config.contactForm.fields}
  contactData={contactData}
  onFieldChange={(type, value) => setContactData(prev => ({ ...prev, [type]: value }))}
  onSubmit={onNext}
/>
```

### WheelLayouts

Roue de la fortune avec:
- SmartWheel intégré
- Informations contextuelles
- Liste des prix
- Taille adaptative

```tsx
<WheelLayouts
  layout={currentLayout}
  viewMode={viewMode}
  segments={config.segments}
  isSpinning={isSpinning}
  onSpin={() => setIsSpinning(true)}
  onResult={(segment) => console.log('Gagné:', segment)}
  onComplete={(prize) => {
    setWonPrize(prize);
    onNext();
  }}
/>
```

### EndingLayouts

Page de félicitations avec:
- Animation confetti
- Icône de célébration
- Message personnalisé
- Bouton rejouer (optionnel)

```tsx
<EndingLayouts
  layout={currentLayout}
  viewMode={viewMode}
  title={config.endingScreen.title}
  subtitle={config.endingScreen.subtitle}
  wonPrize={wonPrize}
  onRestart={() => {
    // Reset et rejouer
  }}
/>
```

## 🎯 Recommandations par Page

### Welcome Screen
- **Desktop**: `desktop-left-right` ou `desktop-card`
- **Mobile**: `mobile-vertical` ou `mobile-minimal`
- **Pourquoi**: Première impression, besoin d'espace pour le message

### Contact Form
- **Desktop**: `desktop-centered` ou `desktop-panel`
- **Mobile**: `mobile-vertical`
- **Pourquoi**: Focus sur le formulaire, éviter les distractions

### Wheel Screen
- **Desktop**: `desktop-centered`
- **Mobile**: `mobile-vertical` ou `mobile-centered`
- **Pourquoi**: La roue doit être le point focal

### Ending Screen
- **Desktop**: `desktop-centered` ou `desktop-card`
- **Mobile**: `mobile-vertical` ou `mobile-minimal`
- **Pourquoi**: Célébration, message clair et visible

## 🔧 Personnalisation Avancée

### Ajouter un nouveau layout

1. **Définir le type** dans `types/layouts.ts`:
```typescript
export type DesktopLayoutType = 
  | 'desktop-left-right'
  | 'desktop-your-new-layout'; // Ajouter ici
```

2. **Ajouter la définition**:
```typescript
export const DESKTOP_LAYOUTS = [
  // ...
  {
    id: 'desktop-your-new-layout',
    name: 'Votre Layout',
    description: 'Description',
    preview: '/src/assets/layout-desktop-your-new-layout.svg'
  }
];
```

3. **Implémenter le rendu** dans chaque composant de layout:
```tsx
case 'desktop-your-new-layout':
  return (
    <div className="your-custom-classes">
      {/* Votre layout personnalisé */}
    </div>
  );
```

### Modifier les styles

Les styles sont définis dans `LayoutWrapper.tsx`:

```tsx
const getLayoutClasses = () => {
  if (viewMode === 'desktop') {
    switch (layout as DesktopLayoutType) {
      case 'desktop-left-right':
        return 'grid grid-cols-2 gap-0';
      // Ajouter vos classes ici
    }
  }
};
```

## 🎨 Thèmes et Couleurs

Tous les layouts respectent le thème global:
- `backgroundColor`: Couleur de fond
- `textColor`: Couleur du texte
- `buttonColor`: Couleur des boutons

Les couleurs sont passées via props et appliquées avec `style`:

```tsx
<div style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
  {/* Contenu */}
</div>
```

## 📱 Responsive

Le système détecte automatiquement le `viewMode`:
- **Desktop**: Utilise `desktopLayout`
- **Mobile**: Utilise `mobileLayout`

Le switch est géré dans `WheelPreview`:

```tsx
const getCurrentLayout = () => {
  const layoutKey = viewMode === 'desktop' ? 'desktopLayout' : 'mobileLayout';
  return config[activeView][layoutKey];
};
```

## ✅ Tests et Validation

Pour tester un layout:

1. Ouvrir `/wheel` dans le navigateur
2. Sélectionner une page (Welcome, Contact, Wheel, Ending)
3. Ouvrir le panel de droite
4. Choisir un layout dans l'onglet Desktop ou Mobile
5. Basculer entre Desktop/Mobile avec le bouton en haut à droite

## 🚀 Prochaines Améliorations

- [ ] Ajouter des animations de transition entre layouts
- [ ] Permettre l'upload d'images de fond personnalisées
- [ ] Créer des templates de layouts prédéfinis
- [ ] Ajouter un mode preview 3D des layouts
- [ ] Système de drag & drop pour réorganiser les éléments

## 📚 Ressources

- Types: `src/types/layouts.ts`
- Composants: `src/components/layouts/`
- Sélecteur: `src/components/LayoutSelector.tsx`
- Assets: `src/assets/layout-*.svg`

---

**Note**: Tous les layouts sont responsive et s'adaptent automatiquement à la taille de l'écran. Les previews SVG dans les assets servent uniquement de référence visuelle dans le sélecteur.
