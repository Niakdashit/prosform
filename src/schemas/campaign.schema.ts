import { z } from 'zod';

/**
 * Schémas de validation Zod pour les campagnes
 * Assure la sécurité et l'intégrité des données
 */

// Validation stricte des entrées utilisateur
export const campaignConfigSchema = z.record(z.unknown());

export const prizeSchema = z.object({
  id: z.string(),
  label: z.string().trim().min(1).max(200),
  probability: z.number().min(0).max(100).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  type: z.enum(['winning', 'losing']).optional(),
});

export const campaignCreateSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(200, "Le nom ne peut pas dépasser 200 caractères"),
  type: z.enum(['wheel', 'quiz', 'scratch', 'jackpot', 'form', 'catalog']),
  mode: z.enum(['fullscreen', 'article', 'embed', 'popup']),
  status: z.enum(['draft', 'online', 'paused', 'ended']),
  config: campaignConfigSchema,
  prizes: z.array(prizeSchema).optional().default([]),
  theme: z.record(z.unknown()).optional().default({}),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  thumbnail_url: z.string().url().optional(),
});

export const campaignUpdateSchema = campaignCreateSchema.partial().omit({
  type: true, // Le type ne peut pas être changé après création
});

// Validation pour la publication
export const publishCampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Le nom est requis pour la publication"),
});

// Validation des données de participation
export const participantDataSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255).optional(),
  name: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  result: z.unknown(),
  timestamp: z.string().datetime().optional(),
});

export type CampaignCreate = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdate = z.infer<typeof campaignUpdateSchema>;
export type ParticipantData = z.infer<typeof participantDataSchema>;
