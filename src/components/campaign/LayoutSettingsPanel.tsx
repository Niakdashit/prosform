import { useState, useRef } from "react";
import { 
  Layout, 
  PanelTop, 
  PanelBottom,
  Plus,
  Trash2,
  Upload,
  X,
  Image,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  HeaderConfig, 
  FooterConfig, 
  defaultHeaderConfig,
  defaultFooterConfig,
} from "./index";
import { SocialLink, LegalLink } from "./CampaignFooter";

interface LayoutConfig {
  header: HeaderConfig;
  footer: FooterConfig;
}

interface LayoutSettingsPanelProps {
  layout: LayoutConfig | undefined;
  onUpdateLayout: (updates: Partial<LayoutConfig>) => void;
}

export const LayoutSettingsPanel = ({ layout, onUpdateLayout }: LayoutSettingsPanelProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("header");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const header = layout?.header || defaultHeaderConfig;
  const footer = layout?.footer || defaultFooterConfig;

  // Gestion de l'upload du logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateHeader({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    // Reset input pour permettre de re-sélectionner le même fichier
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const removeLogo = () => {
    updateHeader({ logo: undefined });
  };

  const updateHeader = (updates: Partial<HeaderConfig>) => {
    onUpdateLayout({ 
      header: { ...header, ...updates },
      footer,
    });
  };

  const updateFooter = (updates: Partial<FooterConfig>) => {
    onUpdateLayout({ 
      header,
      footer: { ...footer, ...updates },
    });
  };

  // Gestion des liens sociaux
  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: `social-${Date.now()}`,
      platform: 'facebook',
      url: '',
    };
    updateFooter({ 
      socialLinks: [...(footer.socialLinks || []), newLink] 
    });
  };

  const updateSocialLink = (id: string, updates: Partial<SocialLink>) => {
    updateFooter({
      socialLinks: (footer.socialLinks || []).map(link => 
        link.id === id ? { ...link, ...updates } : link
      )
    });
  };

  const removeSocialLink = (id: string) => {
    updateFooter({
      socialLinks: (footer.socialLinks || []).filter(link => link.id !== id)
    });
  };

  // Gestion des liens légaux
  const addLegalLink = () => {
    const newLink: LegalLink = {
      id: `legal-${Date.now()}`,
      label: 'Nouveau lien',
      url: '#',
    };
    updateFooter({ 
      legalLinks: [...(footer.legalLinks || []), newLink] 
    });
  };

  const updateLegalLink = (id: string, updates: Partial<LegalLink>) => {
    updateFooter({
      legalLinks: (footer.legalLinks || []).map(link => 
        link.id === id ? { ...link, ...updates } : link
      )
    });
  };

  const removeLegalLink = (id: string) => {
    updateFooter({
      legalLinks: (footer.legalLinks || []).filter(link => link.id !== id)
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Structure de page</h3>
        </div>

        <Accordion type="single" collapsible value={expandedSection || undefined} onValueChange={setExpandedSection}>
          {/* Header */}
          <AccordionItem value="header" className="border rounded-lg px-3 mb-2">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2 flex-1">
                <PanelTop className="w-4 h-4" />
                <span className="font-medium text-sm">En-tête (Header)</span>
                <Switch
                  checked={header.enabled}
                  onCheckedChange={(checked) => updateHeader({ enabled: checked })}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-auto mr-2"
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-3">
              {/* Logo Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Logo</Label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {header.logo ? (
                  <div className="relative group">
                    <div className="w-full h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                      <img 
                        src={header.logo} 
                        alt="Logo" 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Changer
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={removeLogo}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-16 border-dashed flex flex-col gap-1"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Image className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Cliquez pour uploader</span>
                  </Button>
                )}
              </div>

              {/* Position et taille du logo */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Position</Label>
                  <Select
                    value={header.logoPosition || 'center'}
                    onValueChange={(v) => updateHeader({ logoPosition: v as 'left' | 'center' | 'right' })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Gauche</SelectItem>
                      <SelectItem value="center">Centre</SelectItem>
                      <SelectItem value="right">Droite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Taille: {header.logoSize || 120}px</Label>
                  <Slider
                    value={[header.logoSize || 120]}
                    onValueChange={([v]) => updateHeader({ logoSize: v })}
                    min={40}
                    max={Math.min(200, (header.height || 64) - 16)}
                    step={10}
                    className="mt-2"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Max: {Math.min(200, (header.height || 64) - 16)}px (basé sur hauteur header)
                  </p>
                </div>
              </div>

              {/* Style et hauteur */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Style</Label>
                  <Select
                    value={header.style || 'solid'}
                    onValueChange={(v) => updateHeader({ style: v as 'solid' | 'transparent' | 'gradient' })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solide</SelectItem>
                      <SelectItem value="transparent">Transparent</SelectItem>
                      <SelectItem value="gradient">Dégradé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Hauteur: {header.height || 64}px</Label>
                  <Slider
                    value={[header.height || 64]}
                    onValueChange={([v]) => updateHeader({ height: v })}
                    min={48}
                    max={120}
                    step={4}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Couleurs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Fond</Label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={header.backgroundColor || '#ffffff'}
                      onChange={(e) => updateHeader({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={header.backgroundColor || '#ffffff'}
                      onChange={(e) => updateHeader({ backgroundColor: e.target.value })}
                      className="h-8 text-xs flex-1 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Texte</Label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={header.textColor || '#1f2937'}
                      onChange={(e) => updateHeader({ textColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={header.textColor || '#1f2937'}
                      onChange={(e) => updateHeader({ textColor: e.target.value })}
                      className="h-8 text-xs flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Sticky (fixé en haut)</Label>
                  <Switch
                    checked={header.sticky || false}
                    onCheckedChange={(checked) => updateHeader({ sticky: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Bordure en bas</Label>
                  <Switch
                    checked={header.borderBottom !== false}
                    onCheckedChange={(checked) => updateHeader({ borderBottom: checked })}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Footer */}
          <AccordionItem value="footer" className="border rounded-lg px-3 mb-2">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2 flex-1">
                <PanelBottom className="w-4 h-4" />
                <span className="font-medium text-sm">Pied de page (Footer)</span>
                <Switch
                  checked={footer.enabled}
                  onCheckedChange={(checked) => updateFooter({ enabled: checked })}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-auto mr-2"
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-3">
              {/* Nom entreprise et copyright */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nom de l'entreprise</Label>
                <Input
                  value={footer.companyName || ''}
                  onChange={(e) => updateFooter({ companyName: e.target.value })}
                  placeholder="Ma Société"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Texte copyright</Label>
                <Input
                  value={footer.copyrightText || ''}
                  onChange={(e) => updateFooter({ copyrightText: e.target.value })}
                  placeholder="© 2025 Tous droits réservés"
                  className="h-8 text-xs"
                />
              </div>

              {/* Layout et padding */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Disposition</Label>
                  <Select
                    value={footer.layout || 'centered'}
                    onValueChange={(v) => updateFooter({ layout: v as 'simple' | 'centered' | 'columns' })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="centered">Centré</SelectItem>
                      <SelectItem value="columns">Colonnes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Padding</Label>
                  <Select
                    value={footer.padding || 'medium'}
                    onValueChange={(v) => updateFooter({ padding: v as 'small' | 'medium' | 'large' })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Petit</SelectItem>
                      <SelectItem value="medium">Moyen</SelectItem>
                      <SelectItem value="large">Grand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Couleurs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Fond</Label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={footer.backgroundColor || '#1f2937'}
                      onChange={(e) => updateFooter({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={footer.backgroundColor || '#1f2937'}
                      onChange={(e) => updateFooter({ backgroundColor: e.target.value })}
                      className="h-8 text-xs flex-1 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Texte</Label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={footer.textColor || '#9ca3af'}
                      onChange={(e) => updateFooter({ textColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={footer.textColor || '#9ca3af'}
                      onChange={(e) => updateFooter({ textColor: e.target.value })}
                      className="h-8 text-xs flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Réseaux sociaux</Label>
                  <Switch
                    checked={footer.showSocialLinks || false}
                    onCheckedChange={(checked) => updateFooter({ showSocialLinks: checked })}
                  />
                </div>
                
                {footer.showSocialLinks && (
                  <div className="space-y-2">
                    {(footer.socialLinks || []).map((link) => (
                      <div key={link.id} className="flex gap-1 items-center">
                        <Select
                          value={link.platform}
                          onValueChange={(v) => updateSocialLink(link.id, { platform: v as SocialLink['platform'] })}
                        >
                          <SelectTrigger className="h-7 text-xs w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="twitter">Twitter/X</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="website">Site web</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={link.url}
                          onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                          placeholder="URL"
                          className="h-7 text-xs flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeSocialLink(link.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={addSocialLink}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Ajouter un réseau
                    </Button>
                  </div>
                )}
              </div>

              {/* Liens légaux */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Liens légaux</Label>
                  <Switch
                    checked={footer.showLegalLinks !== false}
                    onCheckedChange={(checked) => updateFooter({ showLegalLinks: checked })}
                  />
                </div>
                
                {footer.showLegalLinks !== false && (
                  <div className="space-y-2">
                    {(footer.legalLinks || []).map((link) => (
                      <div key={link.id} className="flex gap-1 items-center">
                        <Input
                          value={link.label}
                          onChange={(e) => updateLegalLink(link.id, { label: e.target.value })}
                          placeholder="Label"
                          className="h-7 text-xs w-28"
                        />
                        <Input
                          value={link.url}
                          onChange={(e) => updateLegalLink(link.id, { url: e.target.value })}
                          placeholder="URL"
                          className="h-7 text-xs flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeLegalLink(link.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={addLegalLink}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Ajouter un lien
                    </Button>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  );
};
