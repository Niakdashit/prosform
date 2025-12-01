import { cn } from "@/lib/utils";
import { ThemeSettings } from "@/contexts/ThemeContext";

const BORDER_STYLES: Array<{
  id: ThemeSettings["wheelBorderStyle"];
  label: string;
  colors: string[];
  accentDots?: string[];
  isTemplate?: boolean;
}> = [
  {
    id: "gold",
    label: "Or (Template)",
    colors: ["#facc15", "#fef3c7"],
    accentDots: ["#facc15"],
    isTemplate: true,
  },
  {
    id: "silver",
    label: "Argent (Template)",
    colors: ["#e5e7eb", "#f9fafb"],
    accentDots: ["#9ca3af"],
    isTemplate: true,
  },
  {
    id: "neonBlue",
    label: "Néon Bleu",
    colors: ["#0ea5e9", "#22c1ff"],
    accentDots: ["#facc15", "#ec4899"],
  },
  {
    id: "neonPink",
    label: "Néon Rose",
    colors: ["#ec4899", "#fb7185"],
    accentDots: ["#facc15", "#22c1ff"],
  },
  {
    id: "rainbow",
    label: "Arc-en-ciel",
    colors: [
      "#f97316",
      "#facc15",
      "#22c55e",
      "#22c1ff",
      "#6366f1",
      "#ec4899",
    ],
    accentDots: ["#facc15", "#ec4899"],
  },
  {
    id: "custom",
    label: "Personnalisée",
    colors: ["#1F2937"],
  },
];

interface WheelBorderStyleSelectorProps {
  value: ThemeSettings["wheelBorderStyle"];
  onChange: (value: ThemeSettings["wheelBorderStyle"]) => void;
}

export const WheelBorderStyleSelector = ({
  value,
  onChange,
}: WheelBorderStyleSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {BORDER_STYLES.map((style) => {
        const isActive = value === style.id;

        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onChange(style.id)}
            className={cn(
              "group relative flex flex-col items-stretch justify-between rounded-md border bg-card px-2 py-1.5 text-left shadow-sm transition-all",
              "hover:shadow-md hover:border-primary/40",
              isActive &&
                "border-primary ring-2 ring-primary/30 shadow-md bg-primary/5",
            )}
          >
            {/* Preview : simple bande horizontale compacte */}
            <div className="mt-0.5 mb-1 flex h-5 w-full items-center justify-center">
              <div
                className="h-3 w-full rounded-full shadow-inner"
                style={{
                  background:
                    style.id === "rainbow"
                      ? `linear-gradient(90deg, ${style.colors.join(",")})`
                      : style.colors.length > 1
                      ? `linear-gradient(90deg, ${style.colors[0]}, ${style.colors[1]})`
                      : style.colors[0],
                }}
              />
            </div>

            {/* Label */}
            <div className="mb-0.5 text-[11px] font-medium text-foreground text-center leading-snug line-clamp-2">
              {style.label}
            </div>

            {/* Accents / dots */}
            {style.accentDots && style.accentDots.length > 0 && (
              <div className="mb-0.5 flex items-center justify-center gap-1">
                {style.accentDots.map((c, idx) => (
                  <span
                    key={idx}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}

            {style.isTemplate && (
              <span className="mb-0.5 text-[9px] text-muted-foreground">
                Template
              </span>
            )}

            {/* Active indicator */}
            <div className="mt-0.5 mb-0 flex justify-center">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full border border-muted-foreground/30",
                  isActive && "bg-primary border-primary",
                )}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};
