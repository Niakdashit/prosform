import { useState, useEffect, useCallback } from 'react';
import { FormTemplateService, type SavedForm } from '@/services/FormTemplateService';

interface UseFormTemplatesReturn {
  forms: SavedForm[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchForms: (query: string) => Promise<SavedForm[]>;
  createForm: (name: string, fields: any[]) => Promise<SavedForm>;
  updateForm: (id: string, name: string, fields: any[]) => Promise<SavedForm>;
  deleteForm: (id: string) => Promise<void>;
}

export function useFormTemplates(): UseFormTemplatesReturn {
  const [forms, setForms] = useState<SavedForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await FormTemplateService.getAll();
      setForms(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const searchForms = useCallback(async (query: string): Promise<SavedForm[]> => {
    try {
      return await FormTemplateService.search(query);
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }, []);

  const createForm = useCallback(async (name: string, fields: any[]): Promise<SavedForm> => {
    const form = await FormTemplateService.create(name, fields);
    setForms(prev => [form, ...prev]);
    return form;
  }, []);

  const updateForm = useCallback(async (id: string, name: string, fields: any[]): Promise<SavedForm> => {
    const form = await FormTemplateService.update(id, name, fields);
    setForms(prev => prev.map(f => f.id === id ? form : f));
    return form;
  }, []);

  const deleteForm = useCallback(async (id: string): Promise<void> => {
    await FormTemplateService.delete(id);
    setForms(prev => prev.filter(f => f.id !== id));
  }, []);

  return {
    forms,
    isLoading,
    error,
    refetch: fetchForms,
    searchForms,
    createForm,
    updateForm,
    deleteForm,
  };
}
