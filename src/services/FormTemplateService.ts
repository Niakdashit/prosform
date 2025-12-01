import { externalSupabase } from '@/integrations/supabase/externalClient';
import type { ContactField } from '@/components/WheelBuilder';

export interface SavedForm {
  id: string;
  name: string;
  fields: ContactField[];
  created_at: string;
  updated_at: string;
}

export const FormTemplateService = {
  async getAll(): Promise<SavedForm[]> {
    const { data, error } = await externalSupabase
      .from('saved_forms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved forms:', error);
      throw new Error('Erreur lors du chargement des formulaires');
    }

    return data || [];
  },

  async getById(id: string): Promise<SavedForm | null> {
    const { data, error } = await externalSupabase
      .from('saved_forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching saved form:', error);
      return null;
    }

    return data;
  },

  async create(name: string, fields: ContactField[]): Promise<SavedForm> {
    const { data, error } = await externalSupabase
      .from('saved_forms')
      .insert({ name, fields })
      .select()
      .single();

    if (error) {
      console.error('Error creating saved form:', error);
      throw new Error('Erreur lors de la sauvegarde du formulaire');
    }

    return data;
  },

  async update(id: string, name: string, fields: ContactField[]): Promise<SavedForm> {
    const { data, error } = await externalSupabase
      .from('saved_forms')
      .update({ name, fields })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating saved form:', error);
      throw new Error('Erreur lors de la mise à jour du formulaire');
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await externalSupabase
      .from('saved_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting saved form:', error);
      throw new Error('Erreur lors de la suppression du formulaire');
    }
  },

  async search(query: string): Promise<SavedForm[]> {
    const { data, error } = await externalSupabase
      .from('saved_forms')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching saved forms:', error);
      throw new Error('Erreur lors de la recherche');
    }

    return data || [];
  },
};
