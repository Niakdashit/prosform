import { CatalogItem } from "./CatalogBuilder";
import { useTheme } from "@/contexts/ThemeContext";

interface CatalogPreviewProps {
  viewMode: "desktop" | "mobile";
  catalogTitle: string;
  catalogSubtitle: string;
  items: CatalogItem[];
}

export const CatalogPreview = ({
  viewMode,
  catalogTitle,
  catalogSubtitle,
  items,
}: CatalogPreviewProps) => {
  const { theme } = useTheme();

  const containerClass = viewMode === "desktop"
    ? "w-full max-w-6xl mx-auto"
    : "w-[375px] mx-auto";

  return (
    <div className="min-h-full flex items-start justify-center p-8">
      <div
        className={`${containerClass} rounded-2xl shadow-2xl overflow-hidden`}
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: theme.textColor }}
            >
              {catalogTitle}
            </h1>
            <p
              className="text-lg"
              style={{ color: theme.textColor, opacity: 0.8 }}
            >
              {catalogSubtitle}
            </p>
          </div>

          {/* Grid of items */}
          <div className={`grid ${viewMode === "desktop" ? "grid-cols-3" : "grid-cols-1"} gap-6`}>
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105 ${
                  item.isComingSoon ? "opacity-60" : ""
                }`}
              >
                {/* Image placeholder */}
                <div
                  className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                  style={item.image ? { backgroundImage: `url(${item.image})`, backgroundSize: "cover" } : {}}
                >
                  {!item.image && (
                    <span className="text-gray-400 text-sm">Image</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {item.description}
                  </p>

                  {/* Button */}
                  <button
                    className="w-full py-2.5 rounded-lg font-semibold text-white transition-colors"
                    style={{
                      backgroundColor: item.isComingSoon ? "#9ca3af" : theme.buttonColor,
                      opacity: item.isComingSoon ? 0.7 : 1,
                    }}
                    disabled={item.isComingSoon}
                  >
                    {item.buttonText}
                  </button>

                  {/* Coming soon date */}
                  {item.isComingSoon && item.comingSoonDate && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Commence le {item.comingSoonDate}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
