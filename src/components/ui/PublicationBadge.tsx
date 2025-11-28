import { Badge } from "@/components/ui/badge";
import { Globe, FileEdit } from "lucide-react";

interface PublicationBadgeProps {
  isPublished: boolean;
  className?: string;
}

export const PublicationBadge = ({ isPublished, className = "" }: PublicationBadgeProps) => {
  if (isPublished) {
    return (
      <Badge 
        variant="default" 
        className={`gap-1 bg-green-600 hover:bg-green-700 ${className}`}
      >
        <Globe className="w-3 h-3" />
        Publié
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className={`gap-1 ${className}`}
    >
      <FileEdit className="w-3 h-3" />
      Brouillon
    </Badge>
  );
};
