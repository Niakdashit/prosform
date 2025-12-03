# 🚀 Guide de Déploiement Prosplay

## Pré-requis

- [ ] Node.js 18+ installé
- [ ] Compte Supabase configuré
- [ ] Compte Netlify/Vercel (pour le déploiement)

## Configuration Supabase

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_URL=https://your_project_id.supabase.co
```

### 2. Activer l'authentification

Dans votre dashboard Supabase :

1. Allez dans **Authentication** > **Providers**
2. Activez **Email** (déjà activé par défaut)
3. (Optionnel) Activez **Google** :
   - Créez un projet Google Cloud
   - Configurez OAuth 2.0
   - Ajoutez les credentials dans Supabase

### 3. Configurer Row Level Security (RLS)

Exécutez le script SQL dans **SQL Editor** :

```sql
-- Voir le fichier supabase/rls_policies.sql
```

### 4. Configurer les redirections d'auth

Dans **Authentication** > **URL Configuration** :

- Site URL: `https://votre-domaine.com`
- Redirect URLs: 
  - `https://votre-domaine.com/campaigns`
  - `https://votre-domaine.com/reset-password`

## Déploiement

### Option 1: Netlify

1. Connectez votre repo GitHub à Netlify
2. Configurez les variables d'environnement
3. Build command: `npm run build`
4. Publish directory: `dist`

### Option 2: Vercel

1. Importez votre projet depuis GitHub
2. Framework preset: Vite
3. Ajoutez les variables d'environnement
4. Déployez

### Option 3: Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Checklist de déploiement

### Sécurité
- [ ] Variables d'environnement configurées (pas de clés en dur)
- [ ] RLS activé sur toutes les tables Supabase
- [ ] HTTPS activé
- [ ] Headers de sécurité configurés

### Performance
- [ ] Build de production optimisé
- [ ] Images optimisées
- [ ] Lazy loading activé
- [ ] Cache configuré

### Fonctionnalités
- [ ] Authentification fonctionnelle
- [ ] Création de campagne fonctionnelle
- [ ] Publication de campagne fonctionnelle
- [ ] URLs courtes fonctionnelles
- [ ] Intégrations (JS, HTML, QR Code) fonctionnelles

### SEO
- [ ] Meta tags configurés
- [ ] Open Graph configuré
- [ ] Sitemap généré
- [ ] robots.txt configuré

### Monitoring
- [ ] Analytics configuré (Google Analytics, Plausible, etc.)
- [ ] Error tracking configuré (Sentry, etc.)
- [ ] Logs Supabase activés

## Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Tests E2E
npx playwright test

# Lint
npm run lint
```

## Support

Pour toute question, consultez la documentation ou ouvrez une issue sur GitHub.
