import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Gift, Check, X, Filter } from 'lucide-react';
import { PrizesService, type InstantWinWinner, type PrizeStatus } from '@/services/PrizesService';
import { useCampaigns } from '@/hooks/useCampaigns';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  muted: '#6b7280',
  success: '#22c55e',
  border: '#e5e7eb',
};

interface InstantWinSectionProps {
  campaignId: string;
}

export const InstantWinSection = ({ campaignId }: InstantWinSectionProps) => {
  const [winners, setWinners] = useState<InstantWinWinner[]>([]);
  const [prizesStatus, setPrizesStatus] = useState<PrizeStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [winnersData, statusData] = await Promise.all([
      PrizesService.getInstantWinWinners(campaignId),
      PrizesService.getPrizesStatus(campaignId)
    ]);
    setWinners(winnersData);
    setPrizesStatus(statusData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [campaignId]);

  const handleClaimToggle = async (participantId: string, currentStatus: boolean) => {
    const success = await PrizesService.updateClaimStatus(participantId, !currentStatus);
    if (success) {
      toast.success(currentStatus ? 'Lot marqué comme non réclamé' : 'Lot marqué comme réclamé');
      loadData();
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleExport = () => {
    PrizesService.exportWinnersToCSV(
      winners,
      `gagnants-campagne-${new Date().toISOString().split('T')[0]}.csv`
    );
    toast.success('Export réussi');
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
          onClick={handleExport}
          variant="outline"
          disabled={winners.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Prizes status */}
      {prizesStatus.length > 0 && (
        <div
          className="p-4 space-y-4"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          <h3 className="font-semibold" style={{ color: colors.dark }}>
            Statut des lots
          </h3>
          <div className="space-y-3">
            {prizesStatus.map(prize => (
              <div key={prize.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: colors.dark }}>
                        {prize.prize_name}
                      </span>
                      {!prize.is_active && (
                        <Badge variant="outline" className="text-xs">Inactif</Badge>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: colors.muted }}>
                      {prize.distributed} / {prize.total_quantity} distribués
                    </p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: colors.gold }}>
                    {prize.distribution_rate}%
                  </span>
                </div>
                <Progress value={prize.distribution_rate} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Winners list */}
      <div
        className="overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        {isLoading ? (
          <div className="text-center py-8" style={{ color: colors.muted }}>
            Chargement...
          </div>
        ) : winners.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-12 h-12 mx-auto mb-3" style={{ color: colors.muted }} />
            <p style={{ color: colors.muted }}>Aucun gagnant</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: colors.muted }}>
                    EMAIL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: colors.muted }}>
                    LOT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: colors.muted }}>
                    VALEUR
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: colors.muted }}>
                    DATE
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: colors.muted }}>
                    RÉCLAMÉ
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: colors.muted }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {winners.map((winner) => (
                  <tr
                    key={winner.participant_id}
                    style={{ borderBottom: `1px solid ${colors.border}` }}
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm" style={{ color: colors.dark }}>
                      {winner.email}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: colors.dark }}>
                      {winner.prize_name}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: colors.gold }}>
                      {winner.prize_value ? `${winner.prize_value}€` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: colors.muted }}>
                      {new Date(winner.won_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {winner.claimed ? (
                        <div className="flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" style={{ color: colors.success }} />
                          <span className="text-xs" style={{ color: colors.success }}>
                            Oui
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <X className="w-4 h-4" style={{ color: colors.muted }} />
                          <span className="text-xs" style={{ color: colors.muted }}>
                            Non
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClaimToggle(winner.participant_id, winner.claimed)}
                      >
                        {winner.claimed ? 'Annuler' : 'Marquer réclamé'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
