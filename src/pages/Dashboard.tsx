import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
  LogOut,
  Pencil,
  BarChart3,
  Settings as SettingsIcon,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PublishModal } from "@/components/PublishModal";

interface Campaign {
  id: string;
  title: string;
  type: "form" | "wheel" | "quiz" | "jackpot" | "scratch";
  config: any;
  thumbnail_url: string | null;
  status: string;
  updated_at: string;
  created_at: string;
}

const campaignTypeLabels = {
  form: "Formulaire",
  wheel: "Roue",
  quiz: "Quiz",
  jackpot: "Jackpot",
  scratch: "Grattage",
};

const campaignTypeColors = {
  form: "bg-blue-500",
  wheel: "bg-purple-500",
  quiz: "bg-green-500",
  jackpot: "bg-yellow-500",
  scratch: "bg-pink-500",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedCampaignForPublish, setSelectedCampaignForPublish] = useState<Campaign | null>(null);

  useEffect(() => {
    checkUser();
    loadCampaigns();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
  };

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      toast.error("Erreur lors du chargement des campagnes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = (type: Campaign["type"]) => {
    const routes = {
      form: "/form",
      wheel: "/wheel",
      quiz: "/quiz",
      jackpot: "/jackpot",
      scratch: "/scratch",
    };
    navigate(routes[type]);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    const routes = {
      form: "/form",
      wheel: "/wheel",
      quiz: "/quiz",
      jackpot: "/jackpot",
      scratch: "/scratch",
    };
    navigate(`${routes[campaign.type]}?id=${campaign.id}`);
  };

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          title: `${campaign.title} (copie)`,
          type: campaign.type,
          config: campaign.config,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Campagne dupliquée avec succès");
      loadCampaigns();
    } catch (error) {
      console.error("Error duplicating campaign:", error);
      toast.error("Erreur lors de la duplication");
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette campagne ?")) return;

    try {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
      toast.success("Campagne supprimée");
      loadCampaigns();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handlePublishClick = (campaign: Campaign) => {
    setSelectedCampaignForPublish(campaign);
    setPublishModalOpen(true);
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mes Campagnes</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/settings")}
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              RGPD
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une campagne..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle campagne
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleCreateCampaign("form")}>
                📝 Formulaire
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateCampaign("wheel")}>
                🎡 Roue de la fortune
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateCampaign("quiz")}>
                ❓ Quiz
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateCampaign("jackpot")}>
                🎰 Jackpot
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateCampaign("scratch")}>
                🎫 Carte à gratter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "Aucune campagne trouvée" : "Aucune campagne"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Essayez avec un autre terme de recherche"
                : "Créez votre première campagne pour commencer"}
            </p>
            {!searchQuery && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une campagne
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={() => handleCreateCampaign("form")}>
                    📝 Formulaire
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateCampaign("wheel")}>
                    🎡 Roue de la fortune
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateCampaign("quiz")}>
                    ❓ Quiz
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateCampaign("jackpot")}>
                    🎰 Jackpot
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateCampaign("scratch")}>
                    🎫 Carte à gratter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleEditCampaign(campaign)}
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                  {campaign.thumbnail_url ? (
                    <img
                      src={campaign.thumbnail_url}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`w-16 h-16 rounded-full ${
                          campaignTypeColors[campaign.type]
                        } opacity-20`}
                      />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCampaign(campaign);
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishClick(campaign);
                          }}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Publier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/analytics?id=${campaign.id}`);
                          }}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateCampaign(campaign);
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCampaign(campaign.id);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold truncate flex-1">{campaign.title}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {campaignTypeLabels[campaign.type]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Modifiée {format(new Date(campaign.updated_at), "dd/MM/yyyy")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Publish Modal */}
      {selectedCampaignForPublish && (
        <PublishModal
          isOpen={publishModalOpen}
          onClose={() => {
            setPublishModalOpen(false);
            setSelectedCampaignForPublish(null);
            loadCampaigns(); // Reload to get updated publish status
          }}
          campaignId={selectedCampaignForPublish.id}
          campaignTitle={selectedCampaignForPublish.title}
        />
      )}
    </div>
  );
}
