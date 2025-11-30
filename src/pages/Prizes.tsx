import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Gift, ArrowLeft } from 'lucide-react';
import { DrawsSection } from '@/components/prizes/DrawsSection';
import { InstantWinSection } from '@/components/prizes/InstantWinSection';
import { TimelineSection } from '@/components/prizes/TimelineSection';
import { CampaignsList } from '@/components/prizes/CampaignsList';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  background: '#f3f4f6',
  card: '#ffffff',
  border: '#e5e7eb',
  muted: '#6b7280',
};

const Prizes = () => {
  const [activeTab, setActiveTab] = useState('draws');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const { campaigns, isLoading } = useCampaigns();

  const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {selectedCampaign && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCampaign(null)}
                className="p-1 h-auto"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: colors.gold }} />
              </Button>
            )}
            <h1 className="text-2xl font-semibold flex items-center gap-2" style={{ color: colors.dark }}>
              <Trophy className="w-6 h-6" style={{ color: colors.gold }} />
              Gains & Tirages
            </h1>
          </div>
          <p className="text-sm" style={{ color: colors.muted }}>
            {selectedCampaign 
              ? `Campagne : ${selectedCampaignData?.name || 'Chargement...'}`
              : 'Sélectionnez une campagne pour voir ses gains et tirages'
            }
          </p>
        </div>

        {/* Main Container */}
        <div
          className="relative overflow-hidden p-5"
          style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)',
          }}
        >
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)',
            }}
          />

          {/* Content */}
          {!selectedCampaign ? (
            <div className="relative z-10">
              {isLoading ? (
                <div className="text-center py-12" style={{ color: colors.muted }}>
                  Chargement des campagnes...
                </div>
              ) : (
                <CampaignsList 
                  campaigns={campaigns} 
                  onSelectCampaign={setSelectedCampaign}
                />
              )}
            </div>
          ) : (
            /* Tabs */
            <Tabs value={activeTab} onValueChange={setActiveTab} className="relative z-10">
              <TabsList
                className="mb-6 p-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
              >
                <TabsTrigger
                  value="draws"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Tirages au sort
                </TabsTrigger>
                <TabsTrigger
                  value="instant-win"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Instants gagnants
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="draws">
                <DrawsSection campaignId={selectedCampaign} />
              </TabsContent>

              <TabsContent value="instant-win">
                <InstantWinSection campaignId={selectedCampaign} />
              </TabsContent>

              <TabsContent value="timeline">
                <TimelineSection campaignId={selectedCampaign} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Prizes;
