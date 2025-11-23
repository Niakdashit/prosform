# 🎨 Guide Rapide - Système de Layouts

## 🚀 Démarrage Rapide

### 1. Lancer l'application
```bash
npm run dev
```
Ouvrir http://localhost:8081/wheel

### 2. Naviguer dans l'interface

#### Interface Desktop
- **Sidebar gauche** : Navigation entre les pages (Welcome, Contact, Wheel, Ending)
- **Centre** : Preview en temps réel
- **Panel droit** : Configuration et sélection des layouts

#### Interface Mobile
- **Boutons flottants** : Ouvrir les drawers gauche/droite
- **Preview** : Plein écran
- **Swipe** : Navigation tactile

### 3. Changer un layout

1. Sélectionner une page dans la sidebar (ex: Welcome)
2. Ouvrir le panel de droite
3. Cliquer sur l'onglet **Desktop** ou **Mobile**
4. Choisir un layout en cliquant sur sa preview
5. Le changement est instantané dans la preview centrale

## 📐 Layouts Recommandés par Page

### 🏠 Welcome Screen (Page d'accueil)

**Desktop:**
- ✅ **Left-Right** - Classique et efficace
- ✅ **Card** - Moderne et élégant
- ⚠️ Éviter: Wallpaper (trop distrayant pour l'accueil)

**Mobile:**
- ✅ **Vertical** - Standard et familier
- ✅ **Minimal** - Focus sur le message
- ⚠️ Éviter: Horizontal (navigation confuse)

### 📝 Contact Form (Formulaire)

**Desktop:**
- ✅ **Centered** - Focus sur le formulaire
- ✅ **Panel** - Professionnel
- ⚠️ Éviter: Split (trop de distraction)

**Mobile:**
- ✅ **Vertical** - Optimal pour la saisie
- ⚠️ Éviter: Horizontal (difficile de remplir)

### 🎡 Wheel Screen (Roue)

**Desktop:**
- ✅ **Centered** - La roue est le point focal
- ✅ **Left-Right** - Avec infos à côté
- ⚠️ Éviter: Panel (roue trop petite)

**Mobile:**
- ✅ **Vertical** - Roue + infos empilées
- ✅ **Centered** - Roue seule
- ⚠️ Éviter: Horizontal (roue trop petite)

### 🎉 Ending Screen (Félicitations)

**Desktop:**
- ✅ **Centered** - Célébration maximale
- ✅ **Card** - Élégant
- ✅ **Wallpaper** - Immersif

**Mobile:**
- ✅ **Vertical** - Message clair
- ✅ **Minimal** - Focus sur le gain
- ⚠️ Éviter: Horizontal (navigation inutile)

## 🎯 Cas d'Usage

### E-commerce
```
Welcome: desktop-card / mobile-vertical
Contact: desktop-centered / mobile-vertical
Wheel: desktop-centered / mobile-vertical
Ending: desktop-card / mobile-vertical
```
**Pourquoi:** Professionnel, focus sur la conversion

### Gaming / Fun
```
Welcome: desktop-wallpaper / mobile-minimal
Contact: desktop-panel / mobile-vertical
Wheel: desktop-left-right / mobile-vertical
Ending: desktop-wallpaper / mobile-minimal
```
**Pourquoi:** Immersif, expérience ludique

### Corporate / B2B
```
Welcome: desktop-left-right / mobile-vertical
Contact: desktop-panel / mobile-vertical
Wheel: desktop-centered / mobile-centered
Ending: desktop-centered / mobile-vertical
```
**Pourquoi:** Sérieux, professionnel, épuré

### Event / Promotion
```
Welcome: desktop-card / mobile-vertical
Contact: desktop-centered / mobile-vertical
Wheel: desktop-centered / mobile-vertical
Ending: desktop-card / mobile-minimal
```
**Pourquoi:** Équilibré, focus sur l'action

## 🎨 Personnalisation

### Modifier les couleurs
1. Aller dans le ThemeContext
2. Modifier `backgroundColor`, `textColor`, `buttonColor`
3. Les layouts s'adaptent automatiquement

### Ajouter du contenu
Chaque layout affiche automatiquement:
- Textes configurables (titre, sous-titre)
- Boutons personnalisables
- Visuels adaptatifs
- Formulaires dynamiques

### Édition en direct
- **Cliquer sur un titre** pour l'éditer
- **Cliquer sur un sous-titre** pour l'éditer
- **Modifier dans le panel** pour les autres éléments

## 🔧 Dépannage

### Le layout ne change pas
1. Vérifier que vous êtes sur la bonne page
2. Rafraîchir le navigateur (F5)
3. Vider le cache (Ctrl+Shift+R)

### La roue ne s'affiche pas
1. Vérifier que les assets sont dans `public/assets/wheel/`
2. Ouvrir la console (F12) pour voir les erreurs
3. Vérifier que SmartWheel est bien importé

### Erreur de build
```bash
# Nettoyer et rebuilder
rm -rf node_modules dist
npm install
npm run build
```

### Preview décalée
1. Vérifier le viewMode (Desktop/Mobile)
2. Ajuster la taille de la fenêtre
3. Tester dans un autre navigateur

## 📱 Test Multi-Device

### Desktop
- Chrome, Firefox, Safari, Edge
- Résolutions: 1920x1080, 1366x768, 1440x900

### Mobile
- iPhone (Safari)
- Android (Chrome)
- Tablette (iPad)

### Outils
- DevTools (F12) → Device Toolbar
- BrowserStack pour tests réels
- Preview mode dans l'app

## 🎓 Tutoriel Vidéo

### Créer votre premier funnel

1. **Page Welcome** (2 min)
   - Choisir layout `desktop-left-right`
   - Éditer titre et sous-titre
   - Personnaliser le bouton

2. **Page Contact** (2 min)
   - Choisir layout `desktop-centered`
   - Configurer les champs
   - Tester le formulaire

3. **Page Wheel** (3 min)
   - Choisir layout `desktop-centered`
   - Configurer les segments
   - Ajuster les probabilités
   - Tester la roue

4. **Page Ending** (1 min)
   - Choisir layout `desktop-card`
   - Personnaliser le message
   - Tester le flow complet

**Temps total:** ~8 minutes

## 📊 Métriques de Performance

### Layouts Desktop
- **Centered**: Le plus rapide (flex simple)
- **Card**: Léger overhead (shadow, backdrop)
- **Wallpaper**: Plus lourd (backdrop-blur)

### Layouts Mobile
- **Vertical**: Le plus performant
- **Horizontal**: Snap scroll (GPU)
- **Minimal**: Ultra-léger

### Optimisations
- Lazy loading des assets
- Canvas rendering pour la roue
- CSS transforms (GPU-accelerated)
- Debounced updates

## 🔗 Liens Utiles

- **Documentation complète:** `LAYOUTS_DOCUMENTATION.md`
- **SmartWheel:** `SMARTWHEEL_INTEGRATION.md`
- **Changelog:** `CHANGELOG.md`
- **Types:** `src/types/layouts.ts`
- **Composants:** `src/components/layouts/`

## 💡 Tips & Astuces

### Raccourcis Clavier
- `Ctrl+S` : Sauvegarder (auto)
- `F11` : Plein écran
- `F12` : DevTools
- `Ctrl+Shift+M` : Toggle device mode

### Best Practices
1. Tester sur mobile ET desktop
2. Garder les textes courts et impactants
3. Utiliser des couleurs contrastées
4. Tester le flow complet avant de publier
5. Optimiser les images (< 500KB)

### Erreurs Courantes
❌ Trop de texte dans le titre
✅ Titre court et percutant

❌ Layout horizontal sur mobile pour formulaire
✅ Layout vertical pour une meilleure UX

❌ Wallpaper partout
✅ Wallpaper uniquement pour l'impact (welcome/ending)

❌ Trop de segments (>12)
✅ 6-8 segments pour une bonne lisibilité

## 🎉 C'est Parti !

Vous êtes prêt à créer des funnels magnifiques ! 

**Prochaine étape:** Ouvrez `/wheel` et commencez à créer 🚀

---

**Questions ?** Consultez la documentation complète ou les exemples dans le code.
