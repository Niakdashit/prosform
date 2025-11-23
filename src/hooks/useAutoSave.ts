import { useEffect, useRef, useState } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void> | void;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = <T,>({
  data,
  onSave,
  delay = 1000,
  enabled = true
}: UseAutoSaveOptions<T>) => {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if data actually changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Set saving status immediately
    setStatus('saving');

    // Debounce the save
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(data);
        setStatus('saved');
        previousDataRef.current = data;

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Auto-save error:', error);
        setStatus('error');

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setStatus('idle');
        }, 3000);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled]);

  return { status };
};
