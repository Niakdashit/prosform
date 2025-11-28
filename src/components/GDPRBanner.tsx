import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Cookie } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const GDPRBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("gdpr_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = async (acceptAll: boolean = false) => {
    const consentData = acceptAll
      ? { functional: true, analytics: true, marketing: true }
      : preferences;

    // Save to localStorage
    localStorage.setItem("gdpr_consent", JSON.stringify(consentData));

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("user_consents").insert({
        user_id: user?.id,
        functional_cookies: consentData.functional,
        analytics_cookies: consentData.analytics,
        marketing_cookies: consentData.marketing,
      });
    } catch (error) {
      console.error("Error saving consent:", error);
    }

    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto p-6 shadow-lg border-2">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Cookie className="w-8 h-8 text-primary shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Nous respectons votre vie privée
              </h3>
              <p className="text-sm text-muted-foreground">
                Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic
                et personnaliser le contenu. Vous pouvez accepter tous les cookies ou
                personnaliser vos préférences.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(true)}
              >
                Personnaliser
              </Button>
              <Button
                size="sm"
                onClick={() => saveConsent(true)}
              >
                Tout accepter
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Préférences des cookies</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreferences(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Checkbox
                  id="functional"
                  checked={preferences.functional}
                  disabled
                />
                <div className="flex-1">
                  <Label htmlFor="functional" className="font-medium cursor-pointer">
                    Cookies fonctionnels (requis)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nécessaires au bon fonctionnement du site. Ne peuvent pas être désactivés.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="analytics" className="font-medium cursor-pointer">
                    Cookies analytiques
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="marketing" className="font-medium cursor-pointer">
                    Cookies marketing
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Utilisés pour personnaliser les publicités et suivre les campagnes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPreferences(false)}
              >
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={() => saveConsent(false)}
              >
                Enregistrer mes préférences
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
