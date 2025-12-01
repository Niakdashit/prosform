/**
 * Logger utilitaire qui n'affiche les logs qu'en développement
 * En production, les logs sont silencieux
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  
  error: (...args: unknown[]) => {
    // Les erreurs sont toujours loggées
    console.error(...args);
  },
  
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
  
  // Pour les logs de tracking/analytics
  track: (message: string, data?: unknown) => {
    if (isDev) {
      console.log(`📊 ${message}`, data ?? '');
    }
  },
  
  // Pour les logs de succès
  success: (message: string, data?: unknown) => {
    if (isDev) {
      console.log(`✅ ${message}`, data ?? '');
    }
  },
};

export default logger;
