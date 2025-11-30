import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function InitAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleInit = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🚀 Initializing analytics...');
      
      // 1. Récupérer toutes les campagnes
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, app_title');

      if (campaignsError) {
        throw campaignsError;
      }

      console.log(`Found ${campaigns?.length || 0} campaigns`);

      // 2. Récupérer les analytics existantes
      const { data: existingAnalytics, error: analyticsError } = await supabase
        .from('campaign_analytics')
        .select('campaign_id');

      if (analyticsError) {
        throw analyticsError;
      }

      const existingIds = new Set(existingAnalytics?.map(a => a.campaign_id) || []);
      console.log(`Found ${existingIds.size} existing analytics entries`);

      // 3. Créer les analytics manquantes
      const missingCampaigns = campaigns?.filter(c => !existingIds.has(c.id)) || [];
      console.log(`Need to create ${missingCampaigns.length} analytics entries`);

      let created = 0;
      const errors = [];

      for (const campaign of missingCampaigns) {
        const { error } = await supabase
          .from('campaign_analytics')
          .insert({
            campaign_id: campaign.id,
            total_views: 0,
            total_participations: 0,
            total_completions: 0,
            avg_time_spent: 0
          });

        if (error) {
          console.error(`Error creating analytics for ${campaign.app_title}:`, error);
          errors.push({ campaign: campaign.app_title, error: error.message });
        } else {
          created++;
          console.log(`✅ Created analytics for ${campaign.app_title}`);
        }
      }

      toast.success(`${created} entrées analytics créées !`);
      setResult({
        success: true,
        totalCampaigns: campaigns?.length || 0,
        existingAnalytics: existingIds.size,
        created,
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (err) {
      console.error('Init error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(`Erreur : ${errorMessage}`);
      setResult({ success: false, error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Initialiser les analytics</CardTitle>
            </div>
            <CardDescription className="text-base">
              Cette opération va créer les entrées analytics manquantes pour tes campagnes existantes 
              sur ton backend Supabase.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Ce qui sera fait :</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Vérifier toutes tes campagnes existantes</li>
                <li>• Créer les entrées analytics manquantes</li>
                <li>• Initialiser les compteurs à zéro</li>
              </ul>
            </div>

            <Button 
              onClick={handleInit}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Initialisation en cours...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Initialiser les analytics
                </>
              )}
            </Button>

            {result && (
              <div className={`rounded-lg p-4 ${result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">
                      {result.success ? 'Initialisation réussie !' : 'Erreur d\'initialisation'}
                    </p>
                    {result.success && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>📊 {result.totalCampaigns} campagnes trouvées</p>
                        <p>✅ {result.existingAnalytics} analytics déjà présentes</p>
                        <p>🆕 {result.created} nouvelles entrées créées</p>
                        {result.errors && result.errors.length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-yellow-600">
                              {result.errors.length} erreur(s) détectée(s)
                            </summary>
                            <pre className="mt-2 text-xs bg-background/50 p-2 rounded">
                              {JSON.stringify(result.errors, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                    {result.error && (
                      <p className="text-sm text-red-500">{result.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result?.success && (
              <div className="text-center">
                <Button
                  onClick={() => window.location.href = '/campaigns'}
                  variant="outline"
                >
                  Voir mes campagnes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
