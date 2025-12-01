import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Dices, History, Filter, Users, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { toast } from "sonner";
import { ExportService } from "@/services/ExportService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  participation_data: any;
}

interface PrizeDraw {
  id: string;
  draw_name: string;
  draw_date: string;
  winners_count: number;
  total_participants: number;
  winners: any[];
  notes: string;
  selection_criteria: any;
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

export default function PrizeDraws() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('id');
  
  const [allParticipations, setAllParticipations] = useState<Participation[]>([]);
  const [uniqueParticipations, setUniqueParticipations] = useState<Participation[]>([]);
  const [prizeDraws, setPrizeDraws] = useState<PrizeDraw[]>([]);
  const [optIns, setOptIns] = useState<OptIn[]>([]);
  const [selectedOptIn, setSelectedOptIn] = useState<OptIn | null>(null);
  const [optInParticipants, setOptInParticipants] = useState<OptInParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignName, setCampaignName] = useState('');
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [winnersCount, setWinnersCount] = useState(1);
  const [drawName, setDrawName] = useState('');
  const [useUnique, setUseUnique] = useState(false);
  const [formFields, setFormFields] = useState<string[]>([]);

  // Extract unique form fields from all participations
  const extractFormFields = (participations: Participation[]) => {
    const fieldsSet = new Set<string>();
    
    // Fields already displayed as fixed columns
    const fixedFields = [
      'email', 'ip_address', 'device_type', 'browser', 'os', 
      'utm_source', 'utm_medium', 'utm_campaign', 'referrer',
      'city', 'country', 'user_agent', 'created_at', 'completed_at'
    ];
    
    participations.forEach(part => {
      if (part.participation_data) {
        const data = part.participation_data;
        
        // Check if data is an object
        if (typeof data === 'object' && data !== null) {
          Object.keys(data).forEach(key => {
            // Exclude internal fields, fixed fields, and already displayed data
            const excludedPrefixes = ['prize_', 'segment_', 'timestamp', 'device_fingerprint'];
            const isExcluded = excludedPrefixes.some(prefix => key.startsWith(prefix));
            const isFixedField = fixedFields.includes(key.toLowerCase());
            
            // Include all user-facing form fields that aren't already shown
            if (!isExcluded && !isFixedField && key !== 'prizeWon' && key !== 'hasPlayed') {
              fieldsSet.add(key);
            }
          });
        }
      }
    });
    
    const fields = Array.from(fieldsSet).sort();
    console.log('Extracted form fields (excluding fixed columns):', fields);
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

      // Charger toutes les participations
      const { data: allPartData } = await externalSupabase
        .from('campaign_participants')
        .select('*')
        .eq('campaign_id', campaignId)
        .not('completed_at', 'is', null)
        .order('created_at', { ascending: false });
      
      console.log('All participations loaded:', allPartData?.length);
      console.log('Sample participation:', allPartData?.[0]);
      
      setAllParticipations(allPartData || []);
      
      // Extract form fields from participations
      if (allPartData) {
        const fields = extractFormFields(allPartData as Participation[]);
        console.log('Form fields extracted:', fields);
        setFormFields(fields);
      }

      // Charger les participations uniques (1 par IP)
      const uniqueByIP = allPartData?.reduce((acc: Participation[], part) => {
        if (!acc.find(p => p.ip_address === part.ip_address)) {
          acc.push(part as Participation);
        }
        return acc;
      }, []) || [];
      
      setUniqueParticipations(uniqueByIP);

      // Charger l'historique des tirages
      const { data: drawsData } = await externalSupabase
        .from('prize_draws')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('draw_date', { ascending: false });
      
      setPrizeDraws(drawsData || []);

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

  const handleDraw = async () => {
    if (!drawName.trim()) {
      toast.error('Veuillez saisir un nom pour le tirage');
      return;
    }

    if (winnersCount < 1) {
      toast.error('Le nombre de gagnants doit être supérieur à 0');
      return;
    }

    const participants = useUnique ? uniqueParticipations : allParticipations;

    if (participants.length < winnersCount) {
      toast.error(`Pas assez de participants (${participants.length} disponibles)`);
      return;
    }

    try {
      // Tirage aléatoire
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const winners = shuffled.slice(0, winnersCount);

      // Enregistrer le tirage
      const { error } = await externalSupabase
        .from('prize_draws')
        .insert({
          campaign_id: campaignId,
          draw_name: drawName,
          winners_count: winnersCount,
          total_participants: participants.length,
          winners: winners.map(w => ({
            id: w.id,
            email: w.email,
            created_at: w.created_at,
            ip_address: w.ip_address
          })),
          selection_criteria: {
            type: useUnique ? 'unique_by_ip' : 'all_participations',
            date: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast.success(`Tirage effectué ! ${winnersCount} gagnant(s) sélectionné(s)`);
      setDrawDialogOpen(false);
      setDrawName('');
      setWinnersCount(1);
      loadData();
    } catch (error) {
      console.error('Error during draw:', error);
      toast.error('Erreur lors du tirage');
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

  const handleExportDraw = async (draw: PrizeDraw) => {
    try {
      const data = draw.winners.map((w: any) => ({
        participant_id: w.id,
        campaign_id: campaignId || '',
        campaign_title: campaignName,
        email: w.email,
        created_at: w.created_at,
        completed_at: null,
        device_type: null,
        browser: null,
        os: null,
        country: null,
        city: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        referrer: null,
        participation_data: { ip: w.ip_address }
      }));
      const csvContent = ExportService.convertToCSV(data);
      ExportService.downloadCSV(`tirage_${draw.draw_name}_${Date.now()}.csv`, csvContent);
      toast.success('Export réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

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
                Tirages au Sort
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
            { label: 'Total participations', value: allParticipations.length, icon: Users },
            { label: 'Participations uniques', value: uniqueParticipations.length, icon: Filter },
            { label: 'Tirages effectués', value: prizeDraws.length, icon: History },
            { label: 'Total gagnants', value: prizeDraws.reduce((acc, d) => acc + d.winners_count, 0), icon: Dices },
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
        <Tabs defaultValue="draw" className="w-full">
          <TabsList>
            <TabsTrigger value="draw">Nouveau tirage</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="optins">Opt-ins</TabsTrigger>
            <TabsTrigger value="all">Toutes participations</TabsTrigger>
            <TabsTrigger value="unique">Participations uniques</TabsTrigger>
          </TabsList>

          {/* Nouveau tirage */}
          <TabsContent value="draw" className="mt-4">
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: colors.border }}>
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold mb-4">Effectuer un tirage au sort</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Participations disponibles :</strong>
                      <br />• Toutes : {allParticipations.length} participations
                      <br />• Uniques (par IP) : {uniqueParticipations.length} participations
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="unique"
                      checked={useUnique}
                      onChange={(e) => setUseUnique(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="unique">
                      Utiliser les participations uniques (1 par IP)
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={() => setDrawDialogOpen(true)}
                  className="w-full gap-2"
                  size="lg"
                  disabled={allParticipations.length === 0}
                >
                  <Dices className="w-5 h-5" />
                  Lancer le tirage au sort
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Historique */}
          <TabsContent value="history" className="mt-4">
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: colors.border }}>
              <h3 className="font-semibold mb-4">Historique des tirages ({prizeDraws.length})</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du tirage</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Gagnants</TableHead>
                    <TableHead>Total participants</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prizeDraws.map((draw) => (
                    <TableRow key={draw.id}>
                      <TableCell className="font-medium">{draw.draw_name}</TableCell>
                      <TableCell>{new Date(draw.draw_date).toLocaleString('fr-FR')}</TableCell>
                      <TableCell>{draw.winners_count}</TableCell>
                      <TableCell>{draw.total_participants}</TableCell>
                      <TableCell className="text-xs">
                        {draw.selection_criteria?.type === 'unique_by_ip' ? 'Unique par IP' : 'Toutes'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportDraw(draw)}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Exporter
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
                              let displayValue = '-';
                              
                              if (value != null) {
                                if (typeof value === 'object') {
                                  displayValue = JSON.stringify(value);
                                } else if (typeof value === 'boolean') {
                                  displayValue = value ? 'Oui' : 'Non';
                                } else {
                                  displayValue = String(value);
                                }
                              }
                              
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
                      <TableHead>Date & Heure</TableHead>
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
                    {allParticipations.slice(0, 100).map((part) => {
                      const formData = part.participation_data || {};
                      
                      return (
                        <TableRow key={part.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(part.created_at).toLocaleString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-xs">{part.ip_address || '-'}</TableCell>
                          <TableCell className="text-xs">{part.email || '-'}</TableCell>
                          <TableCell className="text-xs">{part.device_type || '-'}</TableCell>
                          <TableCell className="text-xs">{part.browser || '-'}</TableCell>
                          <TableCell className="text-xs">{part.os || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_source || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_medium || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_campaign || '-'}</TableCell>
                          <TableCell className="text-xs max-w-xs truncate">{part.referrer || '-'}</TableCell>
                          {formFields.map(field => {
                            const value = formData[field];
                            let displayValue = '-';
                            
                            if (value != null) {
                              if (typeof value === 'object') {
                                displayValue = JSON.stringify(value);
                              } else if (typeof value === 'boolean') {
                                displayValue = value ? 'Oui' : 'Non';
                              } else {
                                displayValue = String(value);
                              }
                            }
                            
                            return <TableCell key={field} className="text-xs">{displayValue}</TableCell>;
                          })}
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
                      <TableHead>Date & Heure</TableHead>
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
                      const formData = part.participation_data || {};
                      
                      return (
                        <TableRow key={part.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(part.created_at).toLocaleString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-xs">{part.ip_address || '-'}</TableCell>
                          <TableCell className="text-xs">{part.email || '-'}</TableCell>
                          <TableCell className="text-xs">{part.device_type || '-'}</TableCell>
                          <TableCell className="text-xs">{part.browser || '-'}</TableCell>
                          <TableCell className="text-xs">{part.os || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_source || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_medium || '-'}</TableCell>
                          <TableCell className="text-xs">{part.utm_campaign || '-'}</TableCell>
                          <TableCell className="text-xs max-w-xs truncate">{part.referrer || '-'}</TableCell>
                          {formFields.map(field => {
                            const value = formData[field];
                            let displayValue = '-';
                            
                            if (value != null) {
                              if (typeof value === 'object') {
                                displayValue = JSON.stringify(value);
                              } else if (typeof value === 'boolean') {
                                displayValue = value ? 'Oui' : 'Non';
                              } else {
                                displayValue = String(value);
                              }
                            }
                            
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

        {/* Draw Dialog */}
        <AlertDialog open={drawDialogOpen} onOpenChange={setDrawDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Configurer le tirage au sort</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="drawName">Nom du tirage</Label>
                    <Input
                      id="drawName"
                      value={drawName}
                      onChange={(e) => setDrawName(e.target.value)}
                      placeholder="Ex: Tirage hebdomadaire"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="winnersCount">Nombre de gagnants</Label>
                    <Input
                      id="winnersCount"
                      type="number"
                      min="1"
                      value={winnersCount}
                      onChange={(e) => setWinnersCount(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    <p>Pool de participants : <strong>{useUnique ? uniqueParticipations.length : allParticipations.length}</strong></p>
                    <p className="text-xs text-gray-600 mt-1">
                      {useUnique ? 'Participations uniques (1 par IP)' : 'Toutes les participations'}
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDraw}>
                Effectuer le tirage
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
