/**
 * Hook pour gérer les participations aux campagnes
 * Sauvegarde automatiquement et synchronise vers les CRM
 */

import { useState, useCallback } from "react";
import { participationsService, ParticipationInput, Participation } from "@/services/participations";
import { useOrganization } from "@/contexts/OrganizationContext";

interface UseParticipationOptions {
  campaignId: string;
  campaignType?: string;
}

interface UseParticipationReturn {
  saveParticipation: (data: Omit<ParticipationInput, "campaign_id" | "organization_id">) => Promise<Participation | null>;
  isLoading: boolean;
  error: string | null;
  lastParticipation: Participation | null;
}

export function useParticipation({ campaignId }: UseParticipationOptions): UseParticipationReturn {
  const { currentOrganization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParticipation, setLastParticipation] = useState<Participation | null>(null);

  const saveParticipation = useCallback(
    async (data: Omit<ParticipationInput, "campaign_id" | "organization_id">): Promise<Participation | null> => {
      if (!currentOrganization?.id) {
        setError("No organization selected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const participation = await participationsService.createParticipation({
          ...data,
          campaign_id: campaignId,
          organization_id: currentOrganization.id,
        });

        setLastParticipation(participation);
        console.log("✅ Participation saved and synced:", participation.id);
        return participation;
      } catch (err) {
        const message = (err as Error).message || "Failed to save participation";
        setError(message);
        console.error("❌ Participation error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [campaignId, currentOrganization?.id]
  );

  return {
    saveParticipation,
    isLoading,
    error,
    lastParticipation,
  };
}

export default useParticipation;
