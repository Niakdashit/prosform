import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, TrendingUp, Clock, Award } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface Campaign {
  id: string;
  title: string;
  type: string;
}

interface Analytics {
  total_views: number;
  total_participations: number;
  total_completions: number;
  avg_time_spent: number;
  last_participation_at: string;
}

interface Participant {
  id: string;
  email: string;
  city: string;
  country: string;
  completed_at: string;
  created_at: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const campaignId = searchParams.get("id");

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campaignId) {
      loadData();
    }
  }, [campaignId]);

  const loadData = async () => {
    try {
      // Load campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      // Load analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from("campaign_analytics")
        .select("*")
        .eq("campaign_id", campaignId)
        .single();

      if (analyticsError && analyticsError.code !== 'PGRST116') {
        throw analyticsError;
      }
      setAnalytics(analyticsData || {
        total_views: 0,
        total_participations: 0,
        total_completions: 0,
        avg_time_spent: 0,
        last_participation_at: null
      });

      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from("campaign_participants")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);

    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const conversionRate = analytics?.total_views 
    ? ((analytics.total_participations / analytics.total_views) * 100).toFixed(1)
    : "0.0";

  const completionRate = analytics?.total_participations
    ? ((analytics.total_completions / analytics.total_participations) * 100).toFixed(1)
    : "0.0";

  // Group participants by day
  const participationsByDay = participants.reduce((acc, p) => {
    const day = format(new Date(p.created_at), "dd/MM");
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timelineData = Object.entries(participationsByDay).map(([day, count]) => ({
    day,
    participations: count
  }));

  // Group by country
  const participationsByCountry = participants.reduce((acc, p) => {
    if (p.country) {
      acc[p.country] = (acc[p.country] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const countryData = Object.entries(participationsByCountry)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{campaign?.title}</h1>
              <p className="text-sm text-muted-foreground">Analytics de campagne</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Vues totales</p>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{analytics?.total_views || 0}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Participations</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{analytics?.total_participations || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Taux de conversion: {conversionRate}%
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Complétions</p>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{analytics?.total_completions || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Taux de complétion: {completionRate}%
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Temps moyen</p>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold">
              {analytics?.avg_time_spent ? `${Math.round(analytics.avg_time_spent)}s` : "0s"}
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Timeline Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Participations dans le temps</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="participations" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Country Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 5 des pays</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Participants Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Participants récents</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Ville</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Pays</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {participants.slice(0, 10).map((participant) => (
                  <tr key={participant.id} className="border-b border-border">
                    <td className="py-3 px-4 text-sm">{participant.email || "—"}</td>
                    <td className="py-3 px-4 text-sm">{participant.city || "—"}</td>
                    <td className="py-3 px-4 text-sm">{participant.country || "—"}</td>
                    <td className="py-3 px-4 text-sm">
                      {format(new Date(participant.created_at), "dd/MM/yyyy HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {participants.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                Aucun participant pour le moment
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
