# Workflow Tab Implementation

## Vue d'ensemble

L'onglet **Workflow** a été ajouté à l'interface `/forma` en reproduisant **exactement** l'interface et les fonctionnalités visibles dans la référence Typeform, avec une attention particulière aux détails visuels.

## Structure des composants

### 1. **TopToolbar** (Modifié)
- Ajout de l'onglet "Workflow" à côté de "Add content" et "Design"
- Gestion de l'état actif des onglets
- Navigation entre les différentes vues

### 2. **WorkflowBuilder** 
Composant principal qui orchestre l'interface Workflow complète :
- Gestion de l'état des nœuds du workflow
- Logique d'ajout/suppression de nœuds
- Coordination entre les 3 panneaux (sidebar gauche, canvas, actions droite)

### 3. **WorkflowCanvas**
Zone centrale de dessin du workflow :
- Affichage des nœuds avec leurs connexions visuelles (SVG)
- Support du drag & drop (prévu)
- Boutons d'ajout (+) et de suppression (X) sur chaque nœud
- Mise en surbrillance au survol
- Sélection de nœuds

### 4. **WorkflowSidebar**
Panneau gauche avec les éléments de workflow :
- **Branching** : Logique de branchement conditionnel
- **Scoring** : Calcul de scores
- **Tagging** : Attribution de tags
- **Outcome quiz** : Quiz avec résultats
- Section "Actions" avec "Pull data in"

### 5. **WorkflowActionsPanel**
Panneau droit avec les actions disponibles :
- **Connect** : Intégrations (Google Sheets, Airtable, Zapier)
- **Messages** : Notifications (Email, Slack)
- **Contacts** : Gestion des contacts
- **Webhooks** : Déclencheurs webhook

## Fonctionnalités implémentées

### ✅ Interface visuelle
- Layout à 3 colonnes identique à la référence
- Sidebar gauche avec éléments de workflow
- Canvas central avec nœuds connectés
- Panneau d'actions à droite
- Design cohérent avec l'éditeur de base

### ✅ Nœuds de workflow
- Nœud de départ "Pull data in"
- Nœuds d'action avec icônes et couleurs personnalisées
- Connexions visuelles entre nœuds (lignes SVG)
- Boutons d'ajout (+) au survol
- Boutons de suppression (X) au survol
- Sélection visuelle des nœuds

### ✅ Interactions
- Ajout de nœuds depuis la sidebar
- Ajout de nœuds depuis le panneau d'actions
- Ajout de nœuds entre deux nœuds existants
- Suppression de nœuds
- Notifications toast pour les actions

## Workflow par défaut

Le workflow initial contient :
1. **Pull data in** - Point de départ
2. **Track sources** - Suivi des sources
3. **Email notification** - Notification email
4. **Google Sheets** - Intégration Google Sheets
5. **Airtable** - Intégration Airtable
6. **Zapier** - Intégration Zapier
7. **Slack notification** - Notification Slack
8. **Update contacts** - Mise à jour des contacts

## Cohérence visuelle

L'interface reproduit **pixel-perfect** le design de la référence Typeform :

### Canvas
- ✅ Fond blanc avec grille de points subtile (radial-gradient)
- ✅ Nœuds compacts (150px de largeur)
- ✅ Connexions avec courbes Bézier fluides
- ✅ Boutons noirs (bg-gray-900) pour add/delete
- ✅ Espacement de 80px entre nœuds

### Sidebar gauche (192px)
- ✅ Sections "Workflow" et "ACTIONS" séparées
- ✅ Icônes dans carrés arrondis (28px)
- ✅ Texte compact (text-xs et text-[10px])
- ✅ Pas de chevrons à droite
- ✅ Bouton "Add action" en bas

### Panneau Actions (256px)
- ✅ Sections avec icônes et descriptions
- ✅ Emojis pour les items (📊, 🔷, ⚡, ✉️, 💬)
- ✅ Texte très compact (text-xs et text-[10px])
- ✅ Boutons "+ Add" pour sections vides
- ✅ Espacement réduit entre items

### Nœuds
- ✅ Largeur fixe de 150px
- ✅ Padding réduit (p-2.5)
- ✅ Icônes emoji (📥, 🎯, ✉️, etc.)
- ✅ Texte tronqué avec ellipsis
- ✅ Couleurs pastel pour différenciation

## Prochaines améliorations possibles

- Drag & drop pour réorganiser les nœuds
- Édition inline des labels de nœuds
- Panneau de configuration pour chaque type de nœud
- Sauvegarde et chargement de workflows
- Export/Import de workflows
- Validation de workflow
- Prévisualisation du workflow
