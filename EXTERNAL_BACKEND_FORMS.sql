-- ============================================================================
-- TABLE POUR SAUVEGARDER LES FORMULAIRES DE CONTACT
-- À EXÉCUTER SUR VOTRE BACKEND EXTERNE SUPABASE
-- ============================================================================

-- Créer la table saved_forms
CREATE TABLE IF NOT EXISTS public.saved_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_saved_forms_name ON public.saved_forms(name);
CREATE INDEX IF NOT EXISTS idx_saved_forms_created_at ON public.saved_forms(created_at DESC);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_saved_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_forms_updated_at
  BEFORE UPDATE ON public.saved_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_forms_updated_at();

-- Activer RLS (optionnel - désactivé par défaut pour accès public)
ALTER TABLE public.saved_forms ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'accès public (vous pouvez la modifier selon vos besoins)
CREATE POLICY "Allow public access to saved_forms" 
  ON public.saved_forms 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
