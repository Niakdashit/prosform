import { ReactNode } from "react";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";

interface LayoutWrapperProps {
  children: ReactNode;
  layout: DesktopLayoutType | MobileLayoutType;
  viewMode: 'desktop' | 'mobile';
  backgroundColor?: string;
  backgroundImage?: string;
}

export const LayoutWrapper = ({ 
  children, 
  layout, 
  viewMode,
  backgroundColor = '#ffffff',
  backgroundImage 
}: LayoutWrapperProps) => {
  
  const getLayoutClasses = () => {
    if (viewMode === 'desktop') {
      switch (layout as DesktopLayoutType) {
        case 'desktop-left-right':
          return 'grid grid-cols-2 gap-0';
        case 'desktop-right-left':
          return 'grid grid-cols-2 gap-0';
        case 'desktop-centered':
          return 'flex items-center justify-center';
        case 'desktop-card':
          return 'flex items-center justify-center p-12';
        case 'desktop-panel':
          return 'grid grid-cols-[400px_1fr] gap-0';
        case 'desktop-split':
          return 'relative flex items-center justify-center';
        default:
          return 'flex items-center justify-center';
      }
    } else {
      switch (layout as MobileLayoutType) {
        case 'mobile-vertical':
          return 'flex flex-col';
        case 'mobile-horizontal':
          return 'flex overflow-x-auto snap-x snap-mandatory';
        case 'mobile-centered':
          return 'flex items-center justify-center';
        case 'mobile-minimal':
          return 'flex flex-col items-center justify-center p-4';
        default:
          return 'flex flex-col';
      }
    }
  };

  const backgroundStyle = backgroundImage 
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor };

  return (
    <div 
      className={`w-full h-full ${getLayoutClasses()}`}
      style={backgroundStyle}
    >
      {children}
    </div>
  );
};
