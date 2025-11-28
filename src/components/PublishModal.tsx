import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Globe, 
  Copy, 
  ExternalLink, 
  Calendar,
  Users,
  Check
} from "lucide-react";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
}

export const PublishModal = ({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
}: PublishModalProps) => {
  const [slug, setSlug] = useState("");
  const [participationLimit, setParticipationLimit] = useState<number | null>(null);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadPublishStatus();
      generateSlug();
    }
  }, [isOpen, campaignId]);

  const loadPublishStatus = async () => {
    try {
      const { data } = await supabase
        .from("campaigns")
        .select("is_published, public_url_slug, participation_limit, starts_at, ends_at")
        .eq("id", campaignId)
        .single();

      if (data) {
        setIsPublished(data.is_published || false);
        setSlug(data.public_url_slug || "");
        setParticipationLimit(data.participation_limit);
        setStartsAt(data.starts_at ? new Date(data.starts_at).toISOString().slice(0, 16) : "");
        setEndsAt(data.ends_at ? new Date(data.ends_at).toISOString().slice(0, 16) : "");
        
        if (data.is_published && data.public_url_slug) {
          setPublicUrl(`${window.location.origin}/p/${data.public_url_slug}`);
        }
      }
    } catch (error) {
      console.error("Error loading publish status:", error);
    }
  };

  const generateSlug = () => {
    if (!slug) {
      const baseSlug = campaignTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 50);
      
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      setSlug(`${baseSlug}-${randomSuffix}`);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);

    try {
      const updates: any = {
        is_published: true,
        public_url_slug: slug,
        published_at: new Date().toISOString(),
        participation_limit: participationLimit || null,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
      };

      const { error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", campaignId);

      if (error) throw error;

      const newPublicUrl = `${window.location.origin}/p/${slug}`;
      setPublicUrl(newPublicUrl);
      setIsPublished(true);

      toast.success("Campagne publiée avec succès !");
    } catch (error: any) {
      console.error("Error publishing:", error);
      if (error.code === "23505") {
        toast.error("Cette URL est déjà utilisée. Veuillez en choisir une autre.");
      } else {
        toast.error("Erreur lors de la publication");
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ is_published: false })
        .eq("id", campaignId);

      if (error) throw error;

      setIsPublished(false);
      setPublicUrl("");
      toast.success("Campagne dépubliée");
    } catch (error) {
      console.error("Error unpublishing:", error);
      toast.error("Erreur lors de la dépublication");
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("URL copiée !");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {isPublished ? "Campagne publiée" : "Publier la campagne"}
          </DialogTitle>
          <DialogDescription>
            {isPublished 
              ? "Votre campagne est en ligne et accessible au public"
              : "Configurez et publiez votre campagne pour la rendre accessible"
            }
          </DialogDescription>
        </DialogHeader>

        {isPublished ? (
          <div className="space-y-4">
            {/* Published URL */}
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Campagne active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input value={publicUrl} readOnly className="flex-1" />
                <Button size="icon" variant="outline" onClick={copyUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => window.open(publicUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {participationLimit && (
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Users className="w-4 h-4" />
                    Limite de participations
                  </div>
                  <p className="text-lg font-semibold">{participationLimit}</p>
                </div>
              )}
              {(startsAt || endsAt) && (
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    Période
                  </div>
                  <p className="text-xs">
                    {startsAt && `Du ${new Date(startsAt).toLocaleDateString()}`}
                    {endsAt && ` au ${new Date(endsAt).toLocaleDateString()}`}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleUnpublish}
              >
                Dépublier
              </Button>
              <Button className="flex-1" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* URL Slug */}
            <div className="space-y-2">
              <Label>URL de la campagne</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border bg-muted text-sm">
                  <span className="text-muted-foreground">
                    {window.location.origin}/p/
                  </span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="flex-1 h-auto p-0 border-0 bg-transparent"
                    placeholder="mon-jeu-concours"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Cette URL sera utilisée pour accéder à votre campagne
              </p>
            </div>

            {/* Participation Limit */}
            <div className="space-y-2">
              <Label>Limite de participations (optionnel)</Label>
              <Input
                type="number"
                value={participationLimit || ""}
                onChange={(e) => setParticipationLimit(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Illimité"
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Laissez vide pour un nombre illimité de participations
              </p>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début (optionnel)</Label>
                <Input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin (optionnel)</Label>
                <Input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={handlePublish}
                disabled={publishing || !slug}
              >
                {publishing ? "Publication..." : "Publier"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
