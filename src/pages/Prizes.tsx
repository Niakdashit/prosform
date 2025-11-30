import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Gift } from 'lucide-react';
import { DrawsSection } from '@/components/prizes/DrawsSection';
import { InstantWinSection } from '@/components/prizes/InstantWinSection';
import { TimelineSection } from '@/components/prizes/TimelineSection';

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

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2" style={{ color: colors.dark }}>
            <Trophy className="w-6 h-6" style={{ color: colors.gold }} />
            Gains & Tirages
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.muted }}>
            Gérez vos tirages au sort et suivez vos instants gagnants
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

          {/* Tabs */}
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
              <DrawsSection />
            </TabsContent>

            <TabsContent value="instant-win">
              <InstantWinSection />
            </TabsContent>

            <TabsContent value="timeline">
              <TimelineSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Prizes;
