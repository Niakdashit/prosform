import { Campaign } from '@/types/campaign';
import { Trophy, Users, Gift, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  muted: '#6b7280',
  border: '#e5e7eb',
};

interface CampaignsListProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaignId: string) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  wheel: '🎡',
  quiz: '❓',
  jackpot: '🎰',
  scratch: '🎫',
  form: '📋',
};

export const CampaignsList = ({ campaigns, onSelectCampaign }: CampaignsListProps) => {
  // Filter campaigns that can have prizes (not forms)
  const prizeCampaigns = campaigns.filter(c => c.type !== 'form');

  if (prizeCampaigns.length === 0) {
    return (
      <div
        className="text-center py-12"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <Gift className="w-12 h-12 mx-auto mb-3" style={{ color: colors.muted }} />
        <p style={{ color: colors.muted }}>Aucune campagne avec des lots</p>
        <p className="text-sm mt-1" style={{ color: colors.muted }}>
          Créez une roue, un quiz, un jackpot ou un scratch pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {prizeCampaigns.map(campaign => (
        <div
          key={campaign.id}
          className="p-4 cursor-pointer hover:bg-white/60 transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
          }}
          onClick={() => onSelectCampaign(campaign.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">
                {typeIcons[campaign.type] || '🎯'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: colors.dark }}>
                  {campaign.name}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm" style={{ color: colors.muted }}>
                  <span className="capitalize">{campaign.type}</span>
                  <span>•</span>
                  <span>
                    Créée le {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: colors.gold }} />
          </div>
        </div>
      ))}
    </div>
  );
};
