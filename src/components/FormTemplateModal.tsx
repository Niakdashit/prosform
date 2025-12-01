import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { useFormTemplates } from '@/hooks/useFormTemplates';
import type { SavedForm } from '@/services/FormTemplateService';
import { createExampleForm } from '@/utils/createExampleForm';

interface FormTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'load' | 'save';
  currentFields?: any[];
  onLoad?: (fields: any[]) => void;
  onSave?: () => void;
  selectedFormId?: string | null;
}

export function FormTemplateModal({
  open,
  onOpenChange,
  mode,
  currentFields = [],
  onLoad,
  onSave,
  selectedFormId,
}: FormTemplateModalProps) {
  const { forms, isLoading, searchForms, createForm, updateForm } = useFormTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredForms, setFilteredForms] = useState<SavedForm[]>([]);
  const [formName, setFormName] = useState('');
  const [updateExisting, setUpdateExisting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingExample, setIsCreatingExample] = useState(false);

  useEffect(() => {
    if (mode === 'load') {
      if (searchQuery) {
        searchForms(searchQuery).then(setFilteredForms);
      } else {
        setFilteredForms(forms);
      }
    }
  }, [searchQuery, forms, mode, searchForms]);

  const handleLoadForm = (form: SavedForm) => {
    if (onLoad) {
      onLoad(form.fields);
      onOpenChange(false);
    }
  };

  const handleSaveForm = async () => {
    if (!formName.trim()) return;

    setIsSaving(true);
    try {
      if (updateExisting && selectedFormId) {
        await updateForm(selectedFormId, formName, currentFields);
      } else {
        await createForm(formName, currentFields);
      }
      
      if (onSave) onSave();
      onOpenChange(false);
      setFormName('');
      setUpdateExisting(false);
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateExample = async () => {
    setIsCreatingExample(true);
    try {
      await createExampleForm();
      // Rafraîchir la liste
      window.location.reload();
    } catch (error) {
      console.error('Error creating example form:', error);
    } finally {
      setIsCreatingExample(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'load' ? 'Chercher un questionnaire existant' : 'Enregistrer le formulaire'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'load' ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Chercher un questionnaire existant"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleCreateExample}
                disabled={isCreatingExample}
                className="shrink-0"
              >
                {isCreatingExample ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Créer exemple
                  </>
                )}
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                  Dernières créations
                </div>
                {filteredForms.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun résultat
                  </div>
                ) : (
                  filteredForms.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => handleLoadForm(form)}
                      className="w-full text-left p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      <div className="font-medium">{form.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {form.fields.length} champ{form.fields.length > 1 ? 's' : ''}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-name">Nom du formulaire</Label>
              <Input
                id="form-name"
                placeholder="Ex: Formulaire Prospect"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {selectedFormId && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="update-existing"
                  checked={updateExisting}
                  onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
                />
                <Label htmlFor="update-existing" className="cursor-pointer">
                  Mettre à jour le formulaire sélectionné
                </Label>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveForm}
                disabled={!formName.trim() || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
