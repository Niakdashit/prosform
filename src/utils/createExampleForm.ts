import { FormTemplateService } from '@/services/FormTemplateService';
import type { ContactField } from '@/components/WheelBuilder';
import { toast } from 'sonner';

export const exampleFormData: ContactField[] = [
  {
    id: 'civilite',
    type: 'select',
    label: 'Civilité',
    required: true,
    options: ['Homme', 'Femme'],
  },
  {
    id: 'nom',
    type: 'text',
    label: 'Nom',
    required: true,
  },
  {
    id: 'prenom',
    type: 'text',
    label: 'Prénom',
    required: true,
  },
  {
    id: 'adresse',
    type: 'text',
    label: 'Adresse',
    required: true,
  },
  {
    id: 'code_postal',
    type: 'text',
    label: 'Code Postal',
    required: true,
  },
  {
    id: 'ville',
    type: 'text',
    label: 'Ville',
    required: true,
  },
  {
    id: 'pays',
    type: 'select',
    label: 'Pays',
    required: true,
    options: ['France', 'Belgique', 'Suisse', 'Canada', 'Luxembourg', 'Autre'],
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    required: true,
  },
  {
    id: 'date_naissance',
    type: 'text',
    label: 'Date de naissance',
    required: true,
    placeholder: 'JJ/MM/AAAA',
  },
  {
    id: 'reglement',
    type: 'checkbox',
    label: "J'accepte le règlement du jeu (disponible en haut de cette page).",
    required: true,
  },
];

export async function createExampleForm(): Promise<void> {
  try {
    await FormTemplateService.create('Formulaire Complet - Exemple', exampleFormData);
    toast.success('Formulaire exemple créé avec succès');
  } catch (error) {
    console.error('Erreur lors de la création du formulaire exemple:', error);
    toast.error('Erreur lors de la création du formulaire exemple');
    throw error;
  }
}
