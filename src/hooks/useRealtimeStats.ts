import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeParticipation {
  id: string;
  campaign_id: string;
  email?: string;
  country?: string;
  city?: string;
  device_type?: string;
  created_at: string;
  participation_data?: any;
}

export function useRealtimeStats() {
  const [recentParticipations, setRecentParticipations] = useState<RealtimeParticipation[]>([]);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    // Charger les 10 dernières participations au démarrage
    const loadRecent = async () => {
      const { data } = await supabase
        .from('campaign_participants')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setRecentParticipations(data);
      }
    };

    loadRecent();

    // S'abonner aux nouvelles participations en temps réel
    const channel: RealtimeChannel = supabase
      .channel('campaign_participations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_participants',
        },
        (payload) => {
          const newParticipation = payload.new as RealtimeParticipation;
          
          // Ajouter au début et limiter à 10
          setRecentParticipations((prev) => [newParticipation, ...prev].slice(0, 10));
          
          // Incrémenter le compteur live
          setLiveCount((prev) => prev + 1);
          
          // Réinitialiser après 3 secondes
          setTimeout(() => {
            setLiveCount((prev) => Math.max(0, prev - 1));
          }, 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { recentParticipations, liveCount };
}
