import { createClient } from '@supabase/supabase-js';

// Backend externe avec les fonctions SQL avancées
const EXTERNAL_SUPABASE_URL = 'https://wnnurvxtuhbjixjeuagd.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubnVydnh0dWhiaml4amV1YWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTE1NTMsImV4cCI6MjA3OTg2NzU1M30.21tmh3721VP0tkokmyDgRlE-9FpVQZfCiaRTjf9kVXA';

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
