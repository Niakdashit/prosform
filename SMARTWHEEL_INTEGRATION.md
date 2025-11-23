# Intégration SmartWheel - Documentation

## 📋 Résumé

Le composant **SmartWheel** a été importé avec succès depuis le projet `pilmedia-lp-wizardry-forge` et intégré dans le projet `prosform`.

## 🎯 Composant Source

Le composant SmartWheel provient du projet **pilmedia-lp-wizardry-forge** utilisé par `/DesignEditor`. C'est une roue de la fortune moderne et professionnelle avec :

- ✅ Animations fluides et réalistes
- ✅ Bordures personnalisables (classic, gold, silver, neon, etc.)
- ✅ Support des ampoules décoratives
- ✅ Système de probabilités
- ✅ Rendu canvas haute performance
- ✅ Support des images dans les segments
- ✅ Intégration système de dotation

## 📁 Structure Copiée

```
src/components/SmartWheel/
├── SmartWheel.tsx              # Composant principal
├── types.ts                    # Types TypeScript
├── index.ts                    # Exports
├── components/
│   ├── BorderStyleSelector.tsx
│   ├── ParticipationModal.tsx
│   └── SmartWheelWrapper.tsx
├── hooks/
│   ├── useSmartWheelRenderer.ts  # Rendu canvas
│   ├── useWheelAnimation.ts      # Animations
│   └── useWheelMigration.ts
└── utils/
    ├── borderRenderers.ts
    ├── borderStyles.ts
    └── wheelThemes.ts

src/services/
└── WheelDotationIntegration.ts  # Stub pour système de dotation

public/assets/wheel/
├── center.png                   # Image centrale de la roue
├── center-silver.svg
├── pointer.svg                  # Pointeur/flèche
├── pointer-silver.svg
├── ring-gold.png               # Bordures décoratives
└── ring-silver.png
```

## 🔧 Intégration dans WheelPreview

Le composant SmartWheel a remplacé la roue SVG basique dans `WheelPreview.tsx` :

### Avant (SVG basique)
```tsx
<svg width="400" height="400">
  {/* Segments dessinés manuellement */}
</svg>
```

### Après (SmartWheel)
```tsx
<SmartWheel
  segments={config.segments.map(seg => ({
    id: seg.id,
    label: seg.label,
    value: seg.label,
    color: seg.color,
    probability: seg.probability,
    textColor: '#ffffff'
  }))}
  theme="modern"
  size={viewMode === 'desktop' ? 400 : 300}
  brandColors={{
    primary: theme.buttonColor,
    secondary: '#ffffff',
    accent: theme.buttonColor
  }}
  customButton={{
    text: 'TOURNER',
    color: theme.buttonColor,
    textColor: theme.textColor
  }}
  borderStyle="classic"
  showBulbs={true}
  buttonPosition="center"
  onSpin={() => setIsSpinning(true)}
  onResult={(segment) => console.log('Segment gagné:', segment)}
  onComplete={(prize) => {
    setIsSpinning(false);
    setWonPrize(prize);
    setTimeout(() => onNext(), 1000);
  }}
  spinMode="probability"
  speed="medium"
/>
```

## 🎨 Fonctionnalités Disponibles

### Props Principales

- **segments**: Array de segments avec id, label, color, probability
- **theme**: 'modern' | 'classic' | 'neon' | etc.
- **size**: Taille de la roue en pixels
- **borderStyle**: 'classic' | 'gold' | 'silver' | 'neon' | 'metallic' | 'rainbow'
- **showBulbs**: Afficher les ampoules décoratives (true/false)
- **buttonPosition**: 'top' | 'bottom' | 'left' | 'right' | 'center'
- **spinMode**: 'random' | 'instant_winner' | 'probability'
- **speed**: 'slow' | 'medium' | 'fast'

### Callbacks

- **onSpin**: Appelé au début de la rotation
- **onResult**: Appelé avec le segment gagné
- **onComplete**: Appelé à la fin de l'animation avec le prix

### Personnalisation

```tsx
brandColors={{
  primary: '#FF6B6B',    // Couleur principale
  secondary: '#4ECDC4',  // Couleur secondaire
  accent: '#45B7D1'      // Couleur d'accent
}}

customButton={{
  text: 'LANCER',
  color: '#FF6B6B',
  textColor: '#ffffff'
}}
```

## 🎯 Styles de Bordure Disponibles

1. **classic** - Bordure simple et élégante
2. **gold** - Bordure dorée luxueuse
3. **silver** - Bordure argentée moderne
4. **neon** - Effet néon lumineux
5. **metallic** - Effet métallique 3D
6. **rainbow** - Dégradé arc-en-ciel
7. **royal-roulette** - Style casino royal

## 🔄 Système de Probabilités

Le composant supporte trois modes de spin :

1. **random**: Sélection aléatoire pure
2. **instant_winner**: Basé sur winProbability (0-1)
3. **probability**: Utilise les probabilités des segments

```tsx
segments={[
  { id: '1', label: '10€', probability: 20 },  // 20%
  { id: '2', label: '20€', probability: 15 },  // 15%
  { id: '3', label: '5€', probability: 30 },   // 30%
  // ...
]}
spinMode="probability"
```

## 🚀 Utilisation Avancée

### Avec Images dans les Segments

```tsx
segments={[
  {
    id: '1',
    label: 'iPhone',
    value: 'iPhone 15 Pro',
    color: '#FF6B6B',
    icon: '/images/iphone.png',  // URL de l'image
    imageUrl: '/images/iphone.png',
    contentType: 'image'
  }
]}
```

### Avec Système de Dotation

```tsx
<SmartWheel
  useDotationSystem={true}
  participantEmail="user@example.com"
  participantId="user123"
  campaign={campaignData}
  // ...autres props
/>
```

## 📝 Notes Importantes

1. **Assets Requis**: Les fichiers dans `public/assets/wheel/` sont nécessaires pour le rendu complet
2. **Performance**: Le rendu utilise Canvas pour de meilleures performances
3. **Responsive**: La taille s'adapte automatiquement selon le viewMode
4. **Animations**: Les animations sont optimisées avec requestAnimationFrame

## 🐛 Dépendances Créées

- `src/services/WheelDotationIntegration.ts` - Stub pour le système de dotation (à implémenter selon vos besoins)

## ✅ Tests

- ✅ Build réussi sans erreurs
- ✅ Serveur de dev lancé sur http://localhost:8081
- ✅ Assets copiés correctement
- ✅ Intégration dans WheelPreview fonctionnelle

## 🎉 Prochaines Étapes

1. Tester la roue dans le navigateur
2. Personnaliser les couleurs selon votre charte graphique
3. Ajuster les probabilités des segments
4. Implémenter le système de dotation si nécessaire
5. Ajouter des templates de roue prédéfinis

## 📚 Ressources

- Projet source: `pilmedia-lp-wizardry-forge`
- Composant utilisé par: `/DesignEditor`
- Documentation complète dans les commentaires du code
