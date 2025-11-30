import { createClient } from '@supabase/supabase-js';

// Backend externe avec les fonctions SQL avancées
const EXTERNAL_SUPABASE_URL = 'https://nnzmjphdodqkzclhbdyl.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uem1qcGhkb2Rxa3pjbGhiZHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyODQwMzQsImV4cCI6MjA3OTg2MDAzNH0.tKVmVWooMVRdkTRnG95kx1cOi9sCGGT34nqYq5iS8ZQ';

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
