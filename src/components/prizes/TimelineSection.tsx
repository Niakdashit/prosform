import { useState, useEffect } from 'react';
import { PrizesService, type PrizeTimelineDay } from '@/services/PrizesService';
import { useCampaigns } from '@/hooks/useCampaigns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Filter, TrendingUp, Award } from 'lucide-react';
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

interface TimelineSectionProps {
  campaignId: string;
}

export const TimelineSection = ({ campaignId }: TimelineSectionProps) => {
  const [timeline, setTimeline] = useState<PrizeTimelineDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  const loadTimeline = async () => {
    setIsLoading(true);
    const data = await PrizesService.getPrizesTimeline(campaignId, days);
    setTimeline(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTimeline();
  }, [campaignId, days]);

  const chartData = timeline.map(day => ({
    date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    gagnants: day.total_winners,
    valeur: day.total_prize_value,
  })).reverse();

  const totalWinners = timeline.reduce((sum, day) => sum + day.total_winners, 0);
  const totalValue = timeline.reduce((sum, day) => sum + day.total_prize_value, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div
        className="flex items-center justify-end p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4" style={{ color: colors.muted }} />
          <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-4"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5" style={{ color: colors.gold }} />
            <span className="text-sm" style={{ color: colors.muted }}>
              Total gagnants
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ color: colors.dark }}>
            {totalWinners}
          </p>
        </div>

        <div
          className="p-4"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" style={{ color: colors.gold }} />
            <span className="text-sm" style={{ color: colors.muted }}>
              Valeur totale
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ color: colors.dark }}>
            {totalValue.toFixed(2)}€
          </p>
        </div>
      </div>

      {/* Charts */}
      {isLoading ? (
        <div className="text-center py-8" style={{ color: colors.muted }}>
          Chargement...
        </div>
      ) : chartData.length === 0 ? (
        <div
          className="text-center py-12"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          <p style={{ color: colors.muted }}>Aucune donnée disponible</p>
        </div>
      ) : (
        <>
          {/* Gagnants par jour */}
          <div
            className="p-4"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <h3 className="font-semibold mb-4" style={{ color: colors.dark }}>
              Gagnants par jour
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="date" stroke={colors.muted} />
                <YAxis stroke={colors.muted} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="gagnants" fill={colors.gold} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Valeur des lots par jour */}
          <div
            className="p-4"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <h3 className="font-semibold mb-4" style={{ color: colors.dark }}>
              Valeur des lots par jour
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="date" stroke={colors.muted} />
                <YAxis stroke={colors.muted} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="valeur" 
                  stroke={colors.gold} 
                  strokeWidth={2}
                  dot={{ fill: colors.gold }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};
