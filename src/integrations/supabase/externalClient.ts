import { supabase } from '@/integrations/supabase/client';

// Alias client pour l'ancien "backend externe".
// On réutilise désormais le backend principal (Lovable Cloud)
// tout en conservant la même API dans le code existant.
export const externalSupabase = supabase;
