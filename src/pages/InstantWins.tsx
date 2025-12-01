import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Trophy, Calendar, Users, Gift, Filter, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { toast } from "sonner";
import { ExportService } from "@/services/ExportService";

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  background: '#f3f4f6',
  card: '#ffffff',
  border: '#e5e7eb',
  white: '#ffffff',
  success: '#22c55e',
  muted: '#6b7280',
};

interface Prize {
  id: string;
  prize_name: string;
  total_quantity: number;
  remaining_quantity: number;
  win_probability: number;
  active_from: string | null;
  active_until: string | null;
  is_active: boolean;
}

interface Winner {
  id: string;
  email: string;
  prize_won: any;
  completed_at: string;
  participation_data: any;
}

interface Participation {
  id: string;
  email: string;
  created_at: string;
  completed_at: string;
  ip_address: string;
  user_agent: string;
  device_type: string;
  browser: string;
  os: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  prize_won: any;
  participation_data: any;
}

interface OptIn {
  id: string;
  label: string;
  count: number;
}

interface OptInParticipant {
  id: string;
  email: string;
  created_at: string;
  participation_data: any;
  device_type: string;
  browser: string;
  os: string;
  city: string;
  country: string;
}

export default function InstantWins() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('id');
  
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [allParticipations, setAllParticipations] = useState<Participation[]>([]);
  const [uniqueParticipations, setUniqueParticipations] = useState<Participation[]>([]);
  const [optIns, setOptIns] = useState<OptIn[]>([]);
  const [selectedOptIn, setSelectedOptIn] = useState<OptIn | null>(null);
  const [optInParticipants, setOptInParticipants] = useState<OptInParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignName, setCampaignName] = useState('');

  const [formFields, setFormFields] = useState<string[]>([]);

  const flattenParticipationData = (data: any): Record<string, any> => {
    if (!data || typeof data !== 'object') return {};
    const flat: Record<string, any> = {};

    // Flatten contactData object first to get all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'contactData' && value && typeof value === 'object') {
        Object.entries(value as Record<string, any>).forEach(([subKey, subVal]) => {
          flat[subKey] = subVal;
        });
      } else if (key === 'result') {
        flat['result'] = value;
      } else if (typeof value !== 'object' || value === null) {
        flat[key] = value;
      }
    });

    return flat;
  };

  // Extract unique form fields from all participations
  const extractFormFields = (participations: Participation[]) => {
    const fieldsSet = new Set<string>();
    const excludedFields = [
      'prize',
      'prizeWon',
      'prize_won',
      'prize_name',
      // Champs techniques déjà affichés dans des colonnes dédiées
      'browser',
      'country',
      'device_type',
      'os',
      'referrer',
      'timestamp',
      'user_agent',
      'ip_address',
    ];
    
    participations.forEach(part => {
      const flatData = flattenParticipationData(part.participation_data);
      Object.keys(flatData).forEach(key => {
        if (!excludedFields.includes(key)) {
          fieldsSet.add(key);
        }
      });
    });
    
    const fields = Array.from(fieldsSet).sort();
    console.log('Extracted form fields:', fields);
    return fields;
  };

  useEffect(() => {
    if (!campaignId) {
      toast.error('ID de campagne manquant');
      navigate('/campaigns');
      return;
    }
    loadData();
  }, [campaignId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger le nom de la campagne
      const { data: campaign } = await externalSupabase
        .from('campaigns')
        .select('app_title')
        .eq('id', campaignId)
        .single();
      
      if (campaign) setCampaignName(campaign.app_title);

      // Charger les lots
      const { data: prizesData } = await externalSupabase
        .from('instant_win_prizes')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('display_order', { ascending: true });
      
      setPrizes(prizesData || []);

      // Charger les gagnants
      const { data: winnersData } = await externalSupabase
        .from('campaign_participants')
        .select('*')
        .eq('campaign_id', campaignId)
        .not('prize_won', 'is', null)
        .order('completed_at', { ascending: false });
      
      setWinners(winnersData || []);

      // Charger toutes les participations
      const { data: allPartData } = await externalSupabase
        .from('campaign_participants')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      
      setAllParticipations(allPartData || []);
      
      // Extract form fields from participations
      if (allPartData) {
        console.log('Sample participation data:', allPartData[0]);
        console.log('First participation_data:', allPartData[0]?.participation_data);
        const fields = extractFormFields(allPartData as Participation[]);
        console.log('Final form fields:', fields);
        setFormFields(fields);
      }

      // Charger les participations uniques (1 par IP)
      const { data: uniquePartData } = await externalSupabase
        .from('campaign_participants')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      
      // Filtrer pour garder 1 seule participation par IP
      const uniqueByIP = uniquePartData?.reduce((acc: Participation[], part) => {
        if (!acc.find(p => p.ip_address === part.ip_address)) {
          acc.push(part as Participation);
        }
        return acc;
      }, []) || [];
      
      setUniqueParticipations(uniqueByIP);

      // Charger les opt-ins
      loadOptIns();

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadOptIns = async () => {
    try {
      // Récupérer toutes les participations avec leurs données
      const { data: participations } = await externalSupabase
        .from('campaign_participants')
        .select('participation_data')
        .eq('campaign_id', campaignId)
        .not('participation_data', 'is', null);

      // Extraire tous les opt-ins uniques
      const optInsMap = new Map<string, number>();
      
      participations?.forEach((part) => {
        const data = part.participation_data;
        if (data && typeof data === 'object') {
          Object.keys(data).forEach((key) => {
            // Chercher les champs qui sont des opt-ins (boolean true ou string "on")
            if (key.startsWith('optin_') || key.includes('accepte') || key.includes('consent')) {
              const value = data[key];
              if (value === true || value === 'on' || value === 'yes' || value === 'oui') {
                const label = key.replace('optin_', '').replace(/_/g, ' ');
                optInsMap.set(key, (optInsMap.get(key) || 0) + 1);
              }
            }
          });
        }
      });

      const optInsList: OptIn[] = Array.from(optInsMap.entries()).map(([key, count]) => ({
        id: key,
        label: key.replace('optin_', '').replace(/_/g, ' '),
        count
      }));

      setOptIns(optInsList);
    } catch (error) {
      console.error('Error loading opt-ins:', error);
    }
  };

  const loadOptInParticipants = async (optIn: OptIn) => {
    try {
      const { data: participants } = await externalSupabase
        .from('campaign_participants')
        .select('*')
        .eq('campaign_id', campaignId)
        .not('participation_data', 'is', null);

      // Filtrer les participants qui ont accepté cet opt-in
      const filtered = participants?.filter((part) => {
        const data = part.participation_data;
        if (data && typeof data === 'object') {
          const value = data[optIn.id];
          return value === true || value === 'on' || value === 'yes' || value === 'oui';
        }
        return false;
      }) || [];

      setOptInParticipants(filtered as OptInParticipant[]);
      setSelectedOptIn(optIn);
    } catch (error) {
      console.error('Error loading opt-in participants:', error);
      toast.error('Erreur lors du chargement des participants');
    }
  };

  const handleExportOptIn = async () => {
    if (!selectedOptIn) return;
    try {
      const data = optInParticipants.map(p => ({
        participant_id: p.id,
        campaign_id: campaignId || '',
        campaign_title: campaignName,
        email: p.email,
        created_at: p.created_at,
        device_type: p.device_type,
        browser: p.browser,
        os: p.os,
        country: p.country,
        city: p.city,
        ...p.participation_data
      }));
      const csvContent = ExportService.convertToCSV(data);
      ExportService.downloadCSV(`optin_${selectedOptIn.label}_${campaignName}_${Date.now()}.csv`, csvContent);
      toast.success('Export réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleExportWinners = async () => {
    try {
      const data = winners.map(w => ({
        participant_id: w.id,
        campaign_id: campaignId || '',
        campaign_title: campaignName,
        email: w.email,
        created_at: w.completed_at,
        completed_at: w.completed_at,
        device_type: null,
        browser: null,
        os: null,
        country: null,
        city: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        referrer: null,
        participation_data: { prize: w.prize_won?.name || 'N/A', ...w.participation_data }
      }));
      const csvContent = ExportService.convertToCSV(data);
      ExportService.downloadCSV(`gagnants_${campaignName}_${Date.now()}.csv`, csvContent);
      toast.success('Export des gagnants réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleExportAll = async () => {
    try {
      const data = allParticipations.map(p => {
        const formData = p.participation_data || {};
        return {
          participant_id: p.id,
          campaign_id: campaignId || '',
          campaign_title: campaignName,
          date_heure: new Date(p.created_at).toLocaleString('fr-FR'),
          ip_address: p.ip_address,
          email: p.email,
          device_type: p.device_type,
          browser: p.browser,
          os: p.os,
          utm_source: p.utm_source,
          utm_medium: p.utm_medium,
          utm_campaign: p.utm_campaign,
          referrer: p.referrer,
          prize: p.prize_won?.name || '',
          ...formData
        };
      });
      const csvContent = ExportService.convertToCSV(data);
      ExportService.downloadCSV(`participations_completes_${campaignName}_${Date.now()}.csv`, csvContent);
      toast.success('Export réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleExportUnique = async () => {
    try {
      const data = uniqueParticipations.map(p => {
        const formData = p.participation_data || {};
        return {
          participant_id: p.id,
          campaign_id: campaignId || '',
          campaign_title: campaignName,
          date_heure: new Date(p.created_at).toLocaleString('fr-FR'),
          ip_address: p.ip_address,
          email: p.email,
          device_type: p.device_type,
          browser: p.browser,
          os: p.os,
          utm_source: p.utm_source,
          utm_medium: p.utm_medium,
          utm_campaign: p.utm_campaign,
          referrer: p.referrer,
          ...formData
        };
      });
      const csvContent = ExportService.convertToCSV(data);
      ExportService.downloadCSV(`participations_uniques_${campaignName}_${Date.now()}.csv`, csvContent);
      toast.success('Export réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div 
          className="flex flex-col items-center justify-center"
          style={{ 
            fontFamily: "'DM Sans', sans-serif",
            minHeight: 'calc(100vh - 120px)',
          }}
        >
          <Loader2 
            className="w-10 h-10 animate-spin mb-4" 
            style={{ color: colors.gold }} 
          />
          <p className="text-sm" style={{ color: colors.muted }}>
            Chargement des données...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/campaigns')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: colors.dark }}>
                Instants Gagnants
              </h1>
              <p className="text-sm mt-1" style={{ color: colors.muted }}>
                {campaignName}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Lots configurés', value: prizes.length, icon: Gift },
            { label: 'Lots gagnés', value: prizes.reduce((acc, p) => acc + (p.total_quantity - p.remaining_quantity), 0), icon: Trophy },
            { label: 'Lots restants', value: prizes.reduce((acc, p) => acc + p.remaining_quantity, 0), icon: Calendar },
            { label: 'Gagnants', value: winners.length, icon: Users },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 bg-white rounded-lg border"
              style={{ borderColor: colors.border }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: colors.muted }}>
                  {stat.label}
                </span>
                <stat.icon className="w-4 h-4" style={{ color: colors.gold }} />
              </div>
              <p className="text-2xl font-semibold" style={{ color: colors.dark }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="prizes" className="w-full">
          <TabsList>
            <TabsTrigger value="prizes">Lots</TabsTrigger>
            <TabsTrigger value="winners">Gagnants</TabsTrigger>
            <TabsTrigger value="optins">Opt-ins</TabsTrigger>
            <TabsTrigger value="all">Toutes participations</TabsTrigger>
            <TabsTrigger value="unique">Participations uniques</TabsTrigger>
          </TabsList>

          {/* Lots */}
          <TabsContent value="prizes" className="mt-4">
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: colors.border }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du lot</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Gagnés</TableHead>
                    <TableHead>Restants</TableHead>
                    <TableHead>Probabilité</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prizes.map((prize) => (
                    <TableRow key={prize.id}>
                      <TableCell className="font-medium">{prize.prize_name}</TableCell>
                      <TableCell>{prize.total_quantity}</TableCell>
                      <TableCell>{prize.total_quantity - prize.remaining_quantity}</TableCell>
                      <TableCell>{prize.remaining_quantity}</TableCell>
                      <TableCell>{prize.win_probability ? `${(prize.win_probability * 100).toFixed(2)}%` : '-'}</TableCell>
                      <TableCell className="text-xs">
                        {prize.active_from && prize.active_until 
                          ? `${new Date(prize.active_from).toLocaleDateString('fr-FR')} - ${new Date(prize.active_until).toLocaleDateString('fr-FR')}`
                          : 'Toujours actif'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${prize.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {prize.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Gagnants */}
          <TabsContent value="winners" className="mt-4">
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: colors.border }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Liste des gagnants ({winners.length})</h3>
                <Button onClick={handleExportWinners} size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Prix gagné</TableHead>
                    <TableHead>Date</TableHead>
                    {formFields.map(field => (
                      <TableHead key={field} className="capitalize">{field}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winners.map((winner) => {
                    const formData = winner.participation_data || {};
                    
                    return (
                      <TableRow key={winner.id}>
                        <TableCell>{winner.email}</TableCell>
                        <TableCell className="font-medium">{winner.prize_won?.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(winner.completed_at).toLocaleString('fr-FR')}</TableCell>
                        {formFields.map(field => {
                          const value = formData[field];
                          const displayValue = value != null ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : '-';
                          return <TableCell key={field} className="text-xs">{displayValue}</TableCell>;
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Opt-ins */}
          <TabsContent value="optins" className="mt-4">
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: colors.border }}>
              {!selectedOptIn ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Liste des opt-ins ({optIns.length})</h3>
                  </div>
                  <div className="grid gap-3">
                    {optIns.map((optIn) => (
                      <div
                        key={optIn.id}
                        onClick={() => loadOptInParticipants(optIn)}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        style={{ borderColor: colors.border }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium capitalize" style={{ color: colors.dark }}>
                              {optIn.label}
                            </h4>
                            <p className="text-sm mt-1" style={{ color: colors.muted }}>
                              {optIn.count} participant{optIn.count > 1 ? 's' : ''} ont accepté
                            </p>
                          </div>
                          <div className="text-2xl font-semibold" style={{ color: colors.gold }}>
                            {optIn.count}
                          </div>
                        </div>
                      </div>
                    ))}
                    {optIns.length === 0 && (
                      <p className="text-center py-8" style={{ color: colors.muted }}>
                        Aucun opt-in trouvé dans les participations
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOptIn(null)}
                        className="gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                      </Button>
                      <div>
                        <h3 className="font-semibold capitalize">{selectedOptIn.label}</h3>
                        <p className="text-sm" style={{ color: colors.muted }}>
                          {optInParticipants.length} participant{optInParticipants.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleExportOptIn} size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Exporter
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Appareil</TableHead>
                        <TableHead>Navigateur</TableHead>
                        <TableHead>OS</TableHead>
                        <TableHead>Localisation</TableHead>
                        {formFields.map(field => (
                          <TableHead key={field} className="capitalize">{field}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {optInParticipants.map((part) => {
                        const formData = part.participation_data || {};
                        
                        return (
                          <TableRow key={part.id}>
                            <TableCell>{part.email || '-'}</TableCell>
                            <TableCell className="text-xs">
                              {new Date(part.created_at).toLocaleString('fr-FR')}
                            </TableCell>
                            <TableCell className="text-xs">{part.device_type || '-'}</TableCell>
                            <TableCell className="text-xs">{part.browser || '-'}</TableCell>
                            <TableCell className="text-xs">{part.os || '-'}</TableCell>
                            <TableCell className="text-xs">
                              {part.city && part.country ? `${part.city}, ${part.country}` : part.country || '-'}
                            </TableCell>
                            {formFields.map(field => {
                              const value = formData[field];
                              const displayValue = value != null ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : '-';
                              return <TableCell key={field} className="text-xs">{displayValue}</TableCell>;
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
              )}
            </div>
          </TabsContent>

          {/* Toutes les participations */}
          <TabsContent value="all" className="mt-4">
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: colors.border }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Toutes les participations ({allParticipations.length})</h3>
                <Button onClick={handleExportAll} size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Heure</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Appareil</TableHead>
                      <TableHead>Navigateur</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>UTM Source</TableHead>
                      <TableHead>UTM Medium</TableHead>
                      <TableHead>UTM Campaign</TableHead>
                      <TableHead>Referrer</TableHead>
                      {formFields.map(field => (
                        <TableHead key={field} className="capitalize">{field}</TableHead>
                      ))}
                      <TableHead>Prix</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allParticipations.slice(0, 100).map((part) => {
                      const formData = flattenParticipationData(part.participation_data);
                      const createdAt = new Date(part.created_at);
                      const browser = part.browser || formData.browser;
                      const os = part.os || formData.os;
                      const deviceType = part.device_type || formData.device_type;
                      const referrer = part.referrer || formData.referrer;
                      const ip = part.ip_address || formData.ip_address;
                      
                      return (
                        <TableRow key={part.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {createdAt.toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {createdAt.toLocaleTimeString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-xs">{ip || '-'}</TableCell>
                          <TableCell className="text-xs">{part.email || '-'}</TableCell>
                          <TableCell className="text-xs">{deviceType || '-'}</TableCell>
                          <TableCell className="text-xs">{browser || '-'}</TableCell>
                          <TableCell className="text-xs">{os || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_source || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_medium || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_campaign || '-'}</TableCell>
                          <TableCell className="text-xs max-w-xs truncate">{referrer || '-'}</TableCell>
                          {formFields.map(field => {
                            const value = formData[field];
                            const displayValue = value != null
                              ? (typeof value === 'object' ? JSON.stringify(value) : String(value))
                              : '-';
                            return <TableCell key={field} className="text-xs">{displayValue}</TableCell>;
                          })}
                          <TableCell className="text-xs">{(part as any).prize_won?.name || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {allParticipations.length > 100 && (
                <p className="text-xs text-center mt-4" style={{ color: colors.muted }}>
                  Affichage des 100 premières participations. Exportez pour voir toutes les données.
                </p>
              )}
            </div>
          </TabsContent>

          {/* Participations uniques */}
          <TabsContent value="unique" className="mt-4">
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: colors.border }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Participations uniques par IP ({uniqueParticipations.length})</h3>
                <Button onClick={handleExportUnique} size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Heure</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Appareil</TableHead>
                      <TableHead>Navigateur</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>UTM Source</TableHead>
                      <TableHead>UTM Medium</TableHead>
                      <TableHead>UTM Campaign</TableHead>
                      <TableHead>Referrer</TableHead>
                      {formFields.map(field => (
                        <TableHead key={field} className="capitalize">{field}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uniqueParticipations.slice(0, 100).map((part) => {
                      const formData = flattenParticipationData(part.participation_data);
                      const createdAt = new Date(part.created_at);
                      const browser = part.browser || formData.browser;
                      const os = part.os || formData.os;
                      const deviceType = part.device_type || formData.device_type;
                      const referrer = part.referrer || formData.referrer;
                      const ip = part.ip_address || formData.ip_address;
                      
                      return (
                        <TableRow key={part.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {createdAt.toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {createdAt.toLocaleTimeString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-xs">{ip || '-'}</TableCell>
                          <TableCell className="text-xs">{part.email || '-'}</TableCell>
                          <TableCell className="text-xs">{deviceType || '-'}</TableCell>
                          <TableCell className="text-xs">{browser || '-'}</TableCell>
                          <TableCell className="text-xs">{os || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_source || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_medium || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_campaign || '-'}</TableCell>
                          <TableCell className="text-xs max-w-xs truncate">{referrer || '-'}</TableCell>
                          {formFields.map(field => {
                            const value = formData[field];
                            const displayValue = value != null
                              ? (typeof value === 'object' ? JSON.stringify(value) : String(value))
                              : '-';
                            return <TableCell key={field} className="text-xs">{displayValue}</TableCell>;
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
