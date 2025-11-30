import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MigrateData() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleMigrate = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🚀 Calling migration function...');
      
      const { data, error } = await supabase.functions.invoke('migrate-data', {
        body: {}
      });

      if (error) {
        console.error('Migration error:', error);
        toast.error(`Erreur : ${error.message}`);
        setResult({ success: false, error: error.message });
      } else {
        console.log('Migration result:', data);
        toast.success('Migration réussie !');
        setResult(data);
      }
    } catch (err) {
      console.error('Migration exception:', err);
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
              <Database className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Migration des données</CardTitle>
            </div>
            <CardDescription className="text-base">
              Cette opération va migrer toutes tes campagnes, participants et statistiques 
              depuis l'ancien backend vers le nouveau backend Lovable Cloud.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Ce qui sera migré :</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Toutes les campagnes (wheel, quiz, jackpot, scratch, form)</li>
                <li>• Historique des participants</li>
                <li>• Statistiques et analytics</li>
              </ul>
            </div>

            <Button 
              onClick={handleMigrate}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Migration en cours...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-5 w-5" />
                  Lancer la migration
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
                      {result.success ? 'Migration réussie !' : 'Erreur de migration'}
                    </p>
                    {result.success && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>✅ {result.migratedCampaigns} / {result.totalCampaigns} campagnes migrées</p>
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
