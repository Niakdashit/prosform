import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Calendar, Users, Trophy, Filter } from 'lucide-react';
import { PrizesService, type PrizeDrawHistory } from '@/services/PrizesService';
import { useCampaigns } from '@/hooks/useCampaigns';
import { toast } from 'sonner';
import { DrawModal } from './DrawModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  muted: '#6b7280',
  border: '#e5e7eb',
};

interface DrawsSectionProps {
  campaignId: string;
}

export const DrawsSection = ({ campaignId }: DrawsSectionProps) => {
  const [draws, setDraws] = useState<PrizeDrawHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const { campaigns } = useCampaigns();

  const loadDraws = async () => {
    setIsLoading(true);
    const data = await PrizesService.getDrawsHistory(campaignId);
    setDraws(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadDraws();
  }, [campaignId]);

  const handleDrawComplete = () => {
    loadDraws();
    setIsDrawModalOpen(false);
    toast.success('Tirage effectué avec succès');
  };

  const exportDrawResults = (draw: PrizeDrawHistory) => {
    const headers = ['Email', 'Date de participation', 'Lot gagné'];
    const rows = draw.winners.map(w => [
      w.email,
      new Date(w.created_at).toLocaleString('fr-FR'),
      w.prize_won?.name || 'N/A',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tirage-${draw.draw_name}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div
        className="flex items-center justify-end p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <Button
          onClick={() => setIsDrawModalOpen(true)}
          style={{ backgroundColor: colors.gold, color: colors.dark }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau tirage
        </Button>
      </div>

      {/* Draws list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8" style={{ color: colors.muted }}>
            Chargement...
          </div>
        ) : draws.length === 0 ? (
          <div
            className="text-center py-12"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: colors.muted }} />
            <p style={{ color: colors.muted }}>Aucun tirage effectué</p>
            <Button
              onClick={() => setIsDrawModalOpen(true)}
              className="mt-4"
              variant="outline"
            >
              Effectuer votre premier tirage
            </Button>
          </div>
        ) : (
          draws.map(draw => (
            <div
              key={draw.id}
              className="p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1" style={{ color: colors.dark }}>
                    {draw.draw_name}
                  </h3>
                  <p className="text-sm mb-3" style={{ color: colors.muted }}>
                    {draw.campaign_name}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" style={{ color: colors.gold }} />
                      <span style={{ color: colors.muted }}>
                        {new Date(draw.draw_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" style={{ color: colors.gold }} />
                      <span style={{ color: colors.muted }}>
                        {draw.total_participants} participants
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" style={{ color: colors.gold }} />
                      <span style={{ color: colors.muted }}>
                        {draw.winners_count} gagnants
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportDrawResults(draw)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>

              {/* Winners preview */}
              {draw.winners && draw.winners.length > 0 && (
                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <p className="text-xs font-medium mb-2" style={{ color: colors.muted }}>
                    GAGNANTS
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {draw.winners.slice(0, 5).map((winner, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 text-xs"
                        style={{
                          background: 'rgba(245, 202, 60, 0.1)',
                          color: colors.dark,
                          borderRadius: '6px',
                        }}
                      >
                        {winner.email}
                      </div>
                    ))}
                    {draw.winners.length > 5 && (
                      <div
                        className="px-3 py-1.5 text-xs"
                        style={{ color: colors.muted }}
                      >
                        +{draw.winners.length - 5} autres
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Draw Modal */}
      <DrawModal
        isOpen={isDrawModalOpen}
        onClose={() => setIsDrawModalOpen(false)}
        onDrawComplete={handleDrawComplete}
        campaigns={campaigns}
        preselectedCampaignId={campaignId}
      />
    </div>
  );
};
