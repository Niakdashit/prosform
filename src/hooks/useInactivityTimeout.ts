import { useEffect, useRef, useCallback, useState } from 'react';

const INACTIVITY_WARNING_MS = 15 * 60 * 1000; // 15 minutes avant alerte
const INACTIVITY_LOGOUT_MS = 17 * 60 * 1000;  // 17 minutes avant déconnexion (2 min après alerte)
const STORAGE_KEY = 'prosform_last_activity';
const CHECK_INTERVAL_MS = 10 * 1000; // Vérifier toutes les 10 secondes

interface UseInactivityTimeoutOptions {
  onWarning: () => void;
  onLogout: () => void;
  enabled?: boolean;
}

export function useInactivityTimeout({
  onWarning,
  onLogout,
  enabled = true,
}: UseInactivityTimeoutOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const warningShownRef = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mettre à jour l'activité
  const updateActivity = useCallback(() => {
    if (!enabled) return;
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());
    
    // Si on était en mode alerte, on la cache
    if (warningShownRef.current) {
      warningShownRef.current = false;
      setShowWarning(false);
    }
  }, [enabled]);

  // Réinitialiser le timer (appelé depuis le modal "Rester connecté")
  const resetTimer = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  // Vérifier l'inactivité
  const checkInactivity = useCallback(() => {
    if (!enabled) return;

    const lastActivityStr = localStorage.getItem(STORAGE_KEY);
    if (!lastActivityStr) {
      updateActivity();
      return;
    }

    const lastActivity = parseInt(lastActivityStr, 10);
    const now = Date.now();
    const elapsed = now - lastActivity;

    // Déconnexion
    if (elapsed >= INACTIVITY_LOGOUT_MS) {
      onLogout();
      return;
    }

    // Alerte
    if (elapsed >= INACTIVITY_WARNING_MS && !warningShownRef.current) {
      warningShownRef.current = true;
      setShowWarning(true);
      onWarning();
    }
  }, [enabled, onWarning, onLogout, updateActivity]);

  // Écouter les événements d'activité
  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Throttle pour éviter trop d'appels
    let lastUpdate = 0;
    const throttledUpdate = () => {
      const now = Date.now();
      if (now - lastUpdate > 5000) { // Max 1 update toutes les 5 secondes
        lastUpdate = now;
        updateActivity();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, throttledUpdate, { passive: true });
    });

    // Écouter les changements de localStorage (multi-onglets)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        // Un autre onglet a mis à jour l'activité
        if (warningShownRef.current) {
          warningShownRef.current = false;
          setShowWarning(false);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Initialiser l'activité
    updateActivity();

    // Vérifier périodiquement
    checkIntervalRef.current = setInterval(checkInactivity, CHECK_INTERVAL_MS);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledUpdate);
      });
      window.removeEventListener('storage', handleStorageChange);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [enabled, updateActivity, checkInactivity]);

  return {
    showWarning,
    resetTimer,
    dismissWarning: () => {
      warningShownRef.current = false;
      setShowWarning(false);
    },
  };
}
