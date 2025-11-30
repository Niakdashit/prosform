import { z } from 'zod';

/**
 * Schémas de validation Zod pour les formulaires de participation
 */

// Validation email stricte
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "L'email est requis" })
  .email({ message: "Email invalide" })
  .max(255, { message: "L'email doit faire moins de 255 caractères" })
  .toLowerCase();

// Validation téléphone (format français et international)
export const phoneSchema = z
  .string()
  .trim()
  .min(1, { message: "Le téléphone est requis" })
  .regex(
    /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$|^\+?\d{10,15}$/,
    { message: "Numéro de téléphone invalide" }
  )
  .max(20, { message: "Le téléphone doit faire moins de 20 caractères" });

// Validation nom/prénom
export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Ce champ est requis" })
  .max(100, { message: "Maximum 100 caractères" })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { 
    message: "Caractères invalides (lettres uniquement)" 
  });

// Validation texte général
export const textSchema = z
  .string()
  .trim()
  .min(1, { message: "Ce champ est requis" })
  .max(1000, { message: "Maximum 1000 caractères" });

// Validation texte court (titre, etc.)
export const shortTextSchema = z
  .string()
  .trim()
  .min(1, { message: "Ce champ est requis" })
  .max(200, { message: "Maximum 200 caractères" });

// Validation code postal
export const postalCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, { message: "Code postal invalide (5 chiffres)" });

// Validation ville
export const citySchema = z
  .string()
  .trim()
  .min(1, { message: "La ville est requise" })
  .max(100, { message: "Maximum 100 caractères" })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { 
    message: "Caractères invalides (lettres uniquement)" 
  });

// Validation URL
export const urlSchema = z
  .string()
  .trim()
  .url({ message: "URL invalide" })
  .max(500, { message: "L'URL doit faire moins de 500 caractères" });

// Validation consentement RGPD
export const consentSchema = z
  .boolean()
  .refine((val) => val === true, {
    message: "Vous devez accepter les conditions",
  });

// Schéma complet pour un formulaire de participation standard
export const participationFormSchema = z.object({
  email: emailSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  city: citySchema.optional(),
  postalCode: postalCodeSchema.optional(),
  consent: consentSchema,
  message: textSchema.optional(),
});

export type ParticipationFormData = z.infer<typeof participationFormSchema>;

// Schéma pour valider les réponses de quiz
export const quizAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.union([
    z.string(),
    z.array(z.string()),
    z.number(),
  ]),
});

// Schéma pour valider les données de participation
export const participationDataSchema = z.object({
  campaignId: z.string().uuid(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  consent: z.boolean(),
  answers: z.array(quizAnswerSchema).optional(),
  prizeWon: z.string().optional(),
  completedAt: z.string().datetime().optional(),
});

export type ParticipationData = z.infer<typeof participationDataSchema>;
