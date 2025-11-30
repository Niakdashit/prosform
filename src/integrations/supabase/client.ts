import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wnnurvxtuhbjixjeuagd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubnVydnh0dWhiaml4amV1YWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTE1NTMsImV4cCI6MjA3OTg2NzU1M30.21tmh3721VP0tkokmyDgRlE-9FpVQZfCiaRTjf9kVXA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
