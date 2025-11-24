import { ReactNode } from "react";
import { DesktopLayoutType, MobileLayoutType } from "@/types/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactField } from "@/components/WheelBuilder";

interface ContactLayoutProps {
  layout: DesktopLayoutType | MobileLayoutType;
  viewMode: 'desktop' | 'mobile';
  title: string;
  subtitle: string;
  fields: ContactField[];
  contactData: { name: string; email: string; phone: string };
  onFieldChange: (type: string, value: string) => void;
  onSubmit: () => void;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
}

export const ContactLayouts = ({
  layout,
  viewMode,
  title,
  subtitle,
  fields,
  contactData,
  onFieldChange,
  onSubmit,
  backgroundColor,
  textColor,
  buttonColor
}: ContactLayoutProps) => {

  const renderForm = () => (
    <div className="w-full max-w-md">
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center" style={{ color: textColor }}>
        {title}
      </h2>
      <p className="text-lg md:text-xl text-center mb-8 opacity-80" style={{ color: textColor }}>
        {subtitle}
      </p>
      
      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.type}>
            <Input
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              placeholder={field.label}
              value={contactData[field.type as keyof typeof contactData]}
              onChange={(e) => onFieldChange(field.type, e.target.value)}
              required={field.required}
              className="h-12 text-base"
            />
          </div>
        ))}
        
        <Button 
          onClick={onSubmit}
          className="w-full h-12 text-lg"
          style={{ backgroundColor: buttonColor, color: textColor }}
        >
          Continuer
        </Button>
      </div>
    </div>
  );

  const renderVisual = () => (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <div className="text-6xl">📝</div>
      </div>
    </div>
  );

  if (viewMode === 'desktop') {
    switch (layout as DesktopLayoutType) {
      case 'desktop-left-right':
        return (
          <>
            <div className="flex items-center justify-center p-12">
              {renderForm()}
            </div>
            {renderVisual()}
          </>
        );

      case 'desktop-right-left':
        return (
          <>
            {renderVisual()}
            <div className="flex items-center justify-center p-12">
              {renderForm()}
            </div>
          </>
        );

      case 'desktop-centered':
        return (
          <div className="flex items-center justify-center p-12">
            {renderForm()}
          </div>
        );

      case 'desktop-card':
        return (
          <div 
            className="max-w-2xl w-full rounded-3xl shadow-2xl p-12"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            {renderForm()}
          </div>
        );

      case 'desktop-panel':
        return (
          <>
            <div 
              className="flex items-center justify-center p-12"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            >
              {renderForm()}
            </div>
            {renderVisual()}
          </>
        );

      case 'desktop-split':
        return (
          <>
            <div className="flex items-center justify-center p-12 border-r border-gray-200">
              {renderForm()}
            </div>
            {renderVisual()}
          </>
        );

      case 'desktop-wallpaper':
        return (
          <>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" />
            <div className="flex items-center justify-center p-12">
              {renderForm()}
            </div>
          </>
        );

      default:
        return renderForm();
    }
  } else {
    switch (layout as MobileLayoutType) {
      case 'mobile-vertical':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center p-6">
              {renderVisual()}
            </div>
            <div className="flex-1 flex items-center justify-center p-6">
              {renderForm()}
            </div>
          </div>
        );

      case 'mobile-horizontal':
        return (
          <div className="flex h-full">
            <div className="min-w-full flex items-center justify-center snap-center p-6">
              {renderVisual()}
            </div>
            <div className="min-w-full flex items-center justify-center snap-center p-6">
              {renderForm()}
            </div>
          </div>
        );

      case 'mobile-centered':
        return (
          <div className="flex items-center justify-center p-6">
            {renderForm()}
          </div>
        );

      case 'mobile-minimal':
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-8">
            <div className="text-6xl">📝</div>
            {renderForm()}
          </div>
        );

      default:
        return renderForm();
    }
  }
};
