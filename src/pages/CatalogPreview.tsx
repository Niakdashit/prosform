import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CampaignService } from "@/services/CampaignService";
import { CatalogItem } from "@/components/CatalogBuilder";

const CatalogPreview = () => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("id");
  const [catalogTitle, setCatalogTitle] = useState("Inspiration, astuces, concours...");
  const [catalogSubtitle, setCatalogSubtitle] = useState("...et de nombreux prix à gagner !");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [theme, setTheme] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCampaign = async () => {
      if (!campaignId) {
        setIsLoading(false);
        return;
      }

      try {
        const campaign = await CampaignService.getById(campaignId);
        if (campaign?.config) {
          const config = campaign.config as any;
          setCatalogTitle(config.catalogTitle || catalogTitle);
          setCatalogSubtitle(config.catalogSubtitle || catalogSubtitle);
          setItems(config.items || []);
        }
        if (campaign?.theme) {
          setTheme(campaign.theme);
        }
      } catch (error) {
        console.error("Error loading campaign:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaign();
  }, [campaignId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: theme.backgroundColor || "#f3f4f6" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1
            className="text-4xl font-bold mb-3"
            style={{ color: theme.textColor || "#1f2937" }}
          >
            {catalogTitle}
          </h1>
          <p
            className="text-xl"
            style={{ color: theme.textColor || "#1f2937", opacity: 0.8 }}
          >
            {catalogSubtitle}
          </p>
        </div>

        {/* Grid of items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105 ${
                item.isComingSoon ? "opacity-60" : ""
              }`}
            >
              {/* Image */}
              <div
                className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                style={item.image ? { backgroundImage: `url(${item.image})`, backgroundSize: "cover" } : {}}
              >
                {!item.image && (
                  <span className="text-gray-400 text-lg">Image</span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-5 min-h-[48px]">
                  {item.description}
                </p>

                {/* Button */}
                <a
                  href={item.isComingSoon ? undefined : item.link}
                  className={`block w-full py-3 rounded-lg font-semibold text-white text-center transition-colors ${
                    item.isComingSoon ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  style={{
                    backgroundColor: item.isComingSoon ? "#9ca3af" : theme.buttonColor || "#f5ca3c",
                    opacity: item.isComingSoon ? 0.7 : 1,
                  }}
                  onClick={(e) => item.isComingSoon && e.preventDefault()}
                >
                  {item.buttonText}
                </a>

                {/* Coming soon date */}
                {item.isComingSoon && item.comingSoonDate && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Commence le {item.comingSoonDate}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogPreview;
