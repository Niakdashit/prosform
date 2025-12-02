import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CatalogTopToolbar } from "@/components/CatalogTopToolbar";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { CatalogPreview } from "@/components/CatalogPreview";
import { useTheme } from "@/contexts/ThemeContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import { CampaignService } from "@/services/CampaignService";
import { toast } from "sonner";

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  link: string;
  isComingSoon: boolean;
  comingSoonDate?: string;
}

const CatalogBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const campaignId = searchParams.get("id");
  
  const { theme, updateTheme } = useTheme();
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [catalogTitle, setCatalogTitle] = useState("Inspiration, astuces, concours...");
  const [catalogSubtitle, setCatalogSubtitle] = useState("...et de nombreux prix à gagner !");
  const [items, setItems] = useState<CatalogItem[]>([
    {
      id: "1",
      title: "Exemple de campagne 1",
      description: "Participez et tentez votre chance !",
      image: "",
      buttonText: "PARTICIPER !",
      link: "",
      isComingSoon: false,
    },
    {
      id: "2",
      title: "Exemple de campagne 2",
      description: "Découvrez nos offres exclusives",
      image: "",
      buttonText: "PARTICIPER !",
      link: "",
      isComingSoon: false,
    },
    {
      id: "3",
      title: "Prochainement...",
      description: "Bientôt disponible",
      image: "",
      buttonText: "BIENTÔT",
      link: "",
      isComingSoon: true,
      comingSoonDate: "1er Mars",
    },
  ]);

  const handleSave = async () => {
    const campaignData = {
      name: catalogTitle || "Catalogue",
      app_title: catalogTitle || "Catalogue",
      type: "catalog" as const,
      mode: "fullscreen" as const,
      status: "draft" as const,
      is_published: false,
      user_id: "", // Will be set by the service
      config: {
        catalogTitle,
        catalogSubtitle,
        items,
      } as Record<string, unknown>,
      theme: theme as Record<string, unknown>,
      prizes: [],
    };

    try {
      if (campaignId) {
        await CampaignService.update(campaignId, campaignData);
      } else {
        const newCampaign = await CampaignService.create(campaignData);
        if (newCampaign?.id) {
          navigate(`/catalog?id=${newCampaign.id}`, { replace: true });
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const { status } = useAutoSave({
    data: { catalogTitle, catalogSubtitle, items, theme },
    onSave: handleSave,
  });

  useEffect(() => {
    const loadCampaign = async () => {
      if (!campaignId) return;

      try {
        const campaign = await CampaignService.getById(campaignId);
        if (campaign?.config) {
          const config = campaign.config as any;
          setCatalogTitle(config.catalogTitle || catalogTitle);
          setCatalogSubtitle(config.catalogSubtitle || catalogSubtitle);
          setItems(config.items || items);
        }
        if (campaign?.theme) {
          Object.entries(campaign.theme).forEach(([key, value]) => {
            updateTheme(key as any, value);
          });
        }
      } catch (error) {
        console.error("Error loading campaign:", error);
        toast.error("Erreur lors du chargement");
      }
    };

    loadCampaign();
  }, [campaignId]);

  const handlePublish = () => {
    navigate(`/catalog-preview?id=${campaignId}`);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <CatalogTopToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        status={status}
        onPublish={handlePublish}
      />

      <div className="flex-1 flex overflow-hidden">
        <CatalogSidebar
          items={items}
          onItemsChange={setItems}
          catalogTitle={catalogTitle}
          onCatalogTitleChange={setCatalogTitle}
          catalogSubtitle={catalogSubtitle}
          onCatalogSubtitleChange={setCatalogSubtitle}
        />

        <div className="flex-1 overflow-auto bg-muted/30">
          <CatalogPreview
            viewMode={viewMode}
            catalogTitle={catalogTitle}
            catalogSubtitle={catalogSubtitle}
            items={items}
          />
        </div>
      </div>
    </div>
  );
};

export default CatalogBuilder;
