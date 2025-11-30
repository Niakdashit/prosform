/**
 * Utilitaires de validation et sanitization des inputs utilisateur
 * CRITIQUE pour la sécurité - prévient les injections et abus
 */

/**
 * Nettoie et valide un email
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 255);
}

/**
 * Nettoie un texte simple (nom, etc.)
 */
export function sanitizeText(text: string, maxLength: number = 100): string {
  return text.trim().slice(0, maxLength);
}

/**
 * Encode pour URL (WhatsApp, etc.)
 */
export function encodeForUrl(text: string): string {
  return encodeURIComponent(text.trim());
}

/**
 * Génère un slug unique à partir d'un titre et d'un ID
 */
export function generateSlug(title: string, id: string): string {
  // Nettoyer le titre
  let slug = title
    .toLowerCase()
    .trim()
    // Remplacer les accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remplacer les caractères non alphanumériques par des tirets
    .replace(/[^a-z0-9]+/g, '-')
    // Supprimer les tirets multiples
    .replace(/-+/g, '-')
    // Supprimer les tirets au début et à la fin
    .replace(/^-+|-+$/g, '')
    // Limiter à 50 caractères
    .substring(0, 50)
    // Supprimer les tirets à la fin après la coupure
    .replace(/-+$/, '');
  
  // Ajouter les 8 premiers caractères de l'ID pour l'unicité
  const shortId = id.substring(0, 8);
  slug = slug ? `${slug}-${shortId}` : shortId;
  
  return slug;
}

/**
 * Valide un slug (caractères alphanumériques et tirets uniquement)
 */
export function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Limite le taux de requêtes (simple throttle)
 */
export function createRateLimiter(maxCalls: number, windowMs: number) {
  const calls: number[] = [];
  
  return () => {
    const now = Date.now();
    // Nettoyer les appels anciens
    while (calls.length > 0 && calls[0] < now - windowMs) {
      calls.shift();
    }
    
    if (calls.length >= maxCalls) {
      return false; // Rate limit dépassé
    }
    
    calls.push(now);
    return true; // OK
  };
}
