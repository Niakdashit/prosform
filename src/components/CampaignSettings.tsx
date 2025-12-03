import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Gift, Upload, Eye, Save, Trash2, Calendar, Percent, Copy, Check, QrCode, Download } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { PrizeModal } from "./PrizeModal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Prize } from "./WheelBuilder";

// Types pour les éditeurs et modes
type EditorType = 'wheel' | 'jackpot' | 'quiz' | 'scratch' | 'form' | 'catalog';
type EditorMode = 'fullscreen' | 'article';

interface JackpotSymbol {
  id: string;
  emoji: string;
  label: string;
  prizeId?: string;
}

interface CampaignSettingsProps {
  defaultTab?: string;
  prizes: Prize[];
  onSavePrize: (prize: Prize) => void;
  onDeletePrize: (id: string) => void;
  gameType?: 'scratch' | 'wheel' | 'jackpot';
  segments: Array<{ id: string; label: string }>;
  symbols?: JackpotSymbol[]; // Pour Jackpot uniquement
  onAddSymbol?: (emoji: string) => void; // Pour ajouter un symbole depuis le modal
  // Campaign metadata
  campaignName?: string;
  onCampaignNameChange?: (name: string) => void;
  startDate?: string;
  onStartDateChange?: (date: string) => void;
  startTime?: string;
  onStartTimeChange?: (time: string) => void;
  endDate?: string;
  onEndDateChange?: (date: string) => void;
  endTime?: string;
  onEndTimeChange?: (time: string) => void;
  campaignUrl?: string;
  // Nouvelles props pour les intégrations
  editorType?: EditorType;
  editorMode?: EditorMode;
  campaignId?: string;
  publicSlug?: string;
  publishedUrl?: string;
  // Short URL personnalisé
  shortSlug?: string;
  onShortSlugChange?: (slug: string) => void;
}

export const CampaignSettings = ({ 
  defaultTab = "canaux",
  prizes,
  onSavePrize,
  onDeletePrize,
  gameType = 'wheel',
  segments,
  symbols = [],
  onAddSymbol,
  campaignName = '',
  onCampaignNameChange,
  startDate = '',
  onStartDateChange,
  startTime = '',
  onStartTimeChange,
  endDate = '',
  onEndDateChange,
  endTime = '',
  onEndTimeChange,
  campaignUrl = '',
  editorType = 'wheel',
  editorMode = 'fullscreen',
  campaignId = '',
  publicSlug = '',
  publishedUrl = '',
  shortSlug = '',
  onShortSlugChange,
}: CampaignSettingsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [prizeModalOpen, setPrizeModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState(shortSlug);
  
  // Mettre à jour le slug personnalisé quand il change
  const handleSlugChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setCustomSlug(sanitized);
    onShortSlugChange?.(sanitized);
  };

  // Générer les URLs et codes d'intégration basés sur le type d'éditeur et le mode
  const integrationData = useMemo(() => {
    const baseUrl = window.location.origin;
    const previewPath = editorMode === 'article' 
      ? `article-${editorType}-preview` 
      : `${editorType}-preview`;
    
    // URL d'embed pour les iframes (utilise la preview avec embed=true)
    const embedUrl = campaignId 
      ? `${baseUrl}/${previewPath}?id=${campaignId}&embed=true`
      : `${baseUrl}/${previewPath}?embed=true`;
    
    // URL de preview (pour tester et comme fallback)
    const previewUrl = campaignId ? `${baseUrl}/${previewPath}?id=${campaignId}` : '';
    
    // URL publique (pour partage - utilise /p/slug si disponible, sinon l'URL de preview)
    const publicUrl = publishedUrl || (publicSlug ? `${baseUrl}/p/${publicSlug}` : '') || campaignUrl || previewUrl;
    
    // Short URL - utilise le slug personnalisé ou génère un ID court (5 caractères)
    const shortId = customSlug || (campaignId ? campaignId.replace(/-/g, '').slice(0, 5) : '');
    const shortUrl = shortId ? `${baseUrl}/c/${shortId}` : '';
    
    const containerId = `${editorType}-campaign`;
    
    return {
      baseUrl,
      embedUrl,
      previewUrl,
      publicUrl,
      shortUrl,
      containerId,
      previewPath,
    };
  }, [editorType, editorMode, campaignId, publicSlug, publishedUrl, campaignUrl, customSlug]);

  // Fonction pour copier dans le presse-papier
  const copyToClipboard = async (text: string, tabName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tabName);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Générer le code JavaScript
  const javascriptCode = useMemo(() => {
    return `<div id="${integrationData.containerId}"></div>
<script type="text/javascript">
  (function(w,d,id){
    var el=d.getElementById(id);
    if(!el){ return; }
    var f=d.createElement('iframe');
    f.src='${integrationData.embedUrl}';
    f.width='100%';
    f.height='600';
    f.style.border='none';
    el.appendChild(f);
  })(window,document,'${integrationData.containerId}');
</script>`;
  }, [integrationData]);

  // Générer le code HTML (iframe simple)
  const htmlCode = useMemo(() => {
    return `<iframe 
  src="${integrationData.embedUrl}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; max-width: 100%;"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen>
</iframe>`;
  }, [integrationData]);

  // Générer le code Webview (pour apps mobiles)
  const webviewCode = useMemo(() => {
    return `// React Native WebView
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: '${integrationData.embedUrl}' }}
  style={{ flex: 1 }}
  javaScriptEnabled={true}
  domStorageEnabled={true}
/>

// Swift (iOS)
import WebKit

let webView = WKWebView(frame: view.bounds)
if let url = URL(string: "${integrationData.embedUrl}") {
    webView.load(URLRequest(url: url))
}
view.addSubview(webView)

// Kotlin (Android)
val webView = WebView(context)
webView.settings.javaScriptEnabled = true
webView.loadUrl("${integrationData.embedUrl}")`;
  }, [integrationData]);

  // Générer le code oEmbed
  const oembedCode = useMemo(() => {
    const oembedUrl = `${integrationData.baseUrl}/api/oembed?url=${encodeURIComponent(integrationData.publicUrl)}`;
    return `{
  "version": "1.0",
  "type": "rich",
  "provider_name": "Prosplay",
  "provider_url": "${integrationData.baseUrl}",
  "title": "${campaignName || 'Campagne'}",
  "html": "<iframe src=\\"${integrationData.embedUrl}\\" width=\\"100%\\" height=\\"600\\" frameborder=\\"0\\"></iframe>",
  "width": 600,
  "height": 600
}

// URL oEmbed pour auto-découverte:
${oembedUrl}

// Ajoutez cette balise dans le <head> de votre page:
<link rel="alternate" type="application/json+oembed" href="${oembedUrl}" title="${campaignName || 'Campagne'}" />`;
  }, [integrationData, campaignName]);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleAddPrize = () => {
    setEditingPrize(null);
    setPrizeModalOpen(true);
  };

  const handleEditPrize = (prize: Prize) => {
    setEditingPrize(prize);
    setPrizeModalOpen(true);
  };

  const handleSavePrize = (prize: Prize) => {
    onSavePrize(prize);
  };

  const handleDeletePrize = (id: string) => {
    onDeletePrize(id);
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="border-b w-full">
        <div className="px-6 py-4 w-full max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold">Paramètres de la campagne</h2>
        </div>
        
        <div className="px-6 w-full max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-0 h-auto p-0 gap-6">
              <TabsTrigger 
                value="canaux" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3"
              >
                Canaux
              </TabsTrigger>
              <TabsTrigger 
                value="parametres"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3"
              >
                Paramètres
              </TabsTrigger>
              <TabsTrigger 
                value="dotation"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3"
              >
                Dotation
              </TabsTrigger>
              <TabsTrigger 
                value="sortie"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3"
              >
                Sortie
              </TabsTrigger>
              <TabsTrigger 
                value="viralite"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3"
              >
                Viralité
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-200px)] w-full">
              <div className="py-6 space-y-6 w-full max-w-7xl mx-auto px-6">
                <TabsContent value="canaux" className="mt-0 space-y-6">
                  <div className="space-y-4 bg-card border rounded-lg p-6">
                    <h3 className="font-semibold text-lg">Campagne</h3>
                    
                    <div>
                      <Label>Nom de la campagne</Label>
                      <Input 
                        placeholder="Ma Campagne" 
                        className="mt-1.5"
                        value={campaignName}
                        onChange={(e) => onCampaignNameChange?.(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 bg-card border rounded-lg p-6">
                    <h3 className="font-semibold text-lg">Dates et heures de publication</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date de début</Label>
                        <Input 
                          type="date" 
                          className="mt-1.5"
                          value={startDate}
                          onChange={(e) => onStartDateChange?.(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Heure de début</Label>
                        <Input 
                          type="time" 
                          className="mt-1.5"
                          value={startTime}
                          onChange={(e) => onStartTimeChange?.(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date de fin</Label>
                        <Input 
                          type="date" 
                          className="mt-1.5"
                          value={endDate}
                          onChange={(e) => onEndDateChange?.(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Heure de fin</Label>
                        <Input 
                          type="time" 
                          className="mt-1.5"
                          value={endTime}
                          onChange={(e) => onEndTimeChange?.(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 bg-card border rounded-lg p-6">
                    <h3 className="font-semibold text-lg">URL de la campagne</h3>
                    
                    <div>
                      <Input 
                        value={campaignUrl || 'URL générée après publication'}
                        readOnly
                        className="bg-muted"
                      />
                      {campaignUrl && (
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => window.open(campaignUrl, '_blank')}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ouvrir
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 bg-card border rounded-lg p-6">
                    <h3 className="font-semibold text-lg">URL Publique</h3>
                    <p className="text-sm text-muted-foreground">
                      Définissez une URL personnalisée pour votre campagne. Si laissé vide, l'URL générée automatiquement sera utilisée.
                    </p>
                    
                    <Input 
                      placeholder="https://votre-campagne-personnalisee.com"
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-4 bg-card border rounded-lg p-6">
                    <h3 className="font-semibold text-lg">Intégrations</h3>
                    
                    <Tabs defaultValue="javascript" className="w-full">
                      <TabsList>
                        <TabsTrigger value="javascript">Javascript</TabsTrigger>
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="webview">Webview</TabsTrigger>
                        <TabsTrigger value="oembed">oEmbed</TabsTrigger>
                        <TabsTrigger value="smarturl">Smart URL</TabsTrigger>
                        <TabsTrigger value="shorturl">Short URL</TabsTrigger>
                        <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                      </TabsList>
                      
                      {/* JavaScript Integration */}
                      <TabsContent value="javascript" className="mt-4">
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                            <code>{javascriptCode}</code>
                          </pre>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(javascriptCode, 'javascript')}
                          >
                            {copiedTab === 'javascript' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            {copiedTab === 'javascript' ? 'Copié' : 'Copier'}
                          </Button>
                        </div>
                      </TabsContent>

                      {/* HTML Integration */}
                      <TabsContent value="html" className="mt-4">
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                            <code>{htmlCode}</code>
                          </pre>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(htmlCode, 'html')}
                          >
                            {copiedTab === 'html' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            {copiedTab === 'html' ? 'Copié' : 'Copier'}
                          </Button>
                        </div>
                      </TabsContent>

                      {/* Webview Integration */}
                      <TabsContent value="webview" className="mt-4">
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                            <code>{webviewCode}</code>
                          </pre>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(webviewCode, 'webview')}
                          >
                            {copiedTab === 'webview' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            {copiedTab === 'webview' ? 'Copié' : 'Copier'}
                          </Button>
                        </div>
                      </TabsContent>

                      {/* oEmbed Integration */}
                      <TabsContent value="oembed" className="mt-4">
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                            <code>{oembedCode}</code>
                          </pre>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(oembedCode, 'oembed')}
                          >
                            {copiedTab === 'oembed' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            {copiedTab === 'oembed' ? 'Copié' : 'Copier'}
                          </Button>
                        </div>
                      </TabsContent>

                      {/* Smart URL */}
                      <TabsContent value="smarturl" className="mt-4">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Le Smart URL détecte automatiquement l'appareil de l'utilisateur et adapte l'affichage en conséquence.
                          </p>
                          <div className="relative">
                            <Input 
                              value={integrationData.publicUrl || ''}
                              readOnly
                              className="bg-muted pr-24"
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="absolute top-1/2 right-2 -translate-y-1/2"
                              onClick={() => copyToClipboard(integrationData.publicUrl, 'smarturl')}
                              disabled={!integrationData.publicUrl}
                            >
                              {copiedTab === 'smarturl' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                              {copiedTab === 'smarturl' ? 'Copié' : 'Copier'}
                            </Button>
                          </div>
                          {integrationData.publicUrl && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(integrationData.publicUrl, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Tester l'URL
                            </Button>
                          )}
                        </div>
                      </TabsContent>

                      {/* Short URL */}
                      <TabsContent value="shorturl" className="mt-4">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            URL courte pour faciliter le partage de votre campagne.
                          </p>
                          
                          {/* Champ de personnalisation */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Personnaliser le lien</label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{window.location.origin}/c/</span>
                              <Input 
                                value={customSlug}
                                onChange={(e) => handleSlugChange(e.target.value)}
                                placeholder={campaignId ? campaignId.replace(/-/g, '').slice(0, 5) : 'mon-lien'}
                                className="flex-1 max-w-[200px]"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Lettres minuscules, chiffres et tirets uniquement
                            </p>
                          </div>

                          {/* URL finale */}
                          <div className="relative">
                            <Input 
                              value={integrationData.shortUrl || ''}
                              readOnly
                              className="bg-muted pr-24"
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="absolute top-1/2 right-2 -translate-y-1/2"
                              onClick={() => copyToClipboard(integrationData.shortUrl, 'shorturl')}
                              disabled={!integrationData.shortUrl}
                            >
                              {copiedTab === 'shorturl' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                              {copiedTab === 'shorturl' ? 'Copié' : 'Copier'}
                            </Button>
                          </div>
                          {integrationData.shortUrl && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(integrationData.shortUrl, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Tester l'URL
                            </Button>
                          )}
                        </div>
                      </TabsContent>

                      {/* QR Code */}
                      <TabsContent value="qrcode" className="mt-4">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Téléchargez un QR Code pour permettre aux utilisateurs d'accéder à votre campagne depuis leur mobile.
                          </p>
                          {integrationData.publicUrl ? (
                            <div className="flex flex-col items-center gap-4">
                              <div className="bg-white p-4 rounded-lg border">
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(integrationData.publicUrl)}`}
                                  alt="QR Code de la campagne"
                                  className="w-48 h-48"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(integrationData.publicUrl)}`;
                                    link.download = `qrcode-${campaignName || 'campagne'}.png`;
                                    link.click();
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Télécharger PNG
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=svg&data=${encodeURIComponent(integrationData.publicUrl)}`;
                                    link.download = `qrcode-${campaignName || 'campagne'}.svg`;
                                    link.click();
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Télécharger SVG
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p>Le QR Code sera disponible après la publication de la campagne.</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>

                <TabsContent value="parametres" className="mt-0 space-y-4">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Limites</h3>
                      <Button variant="ghost" size="sm">Développer</Button>
                    </div>
                  </div>

                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Règlement, Gagnants et Contact</h3>
                      <Button variant="ghost" size="sm">Développer</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dotation" className="mt-0 space-y-6">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Gestion de la Dotation</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Configurez les lots et les règles d'attribution pour votre campagne wheel
                        </p>
                      </div>
                      <Button variant="default" className="gap-2">
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </Button>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Lots disponibles ({prizes.length})</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleAddPrize}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter un lot
                        </Button>
                      </div>

                      {prizes.length === 0 ? (
                        <div className="border-2 border-dashed rounded-lg p-12 text-center">
                          <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-4">Aucun lot configuré</p>
                          <Button 
                            variant="default"
                            onClick={handleAddPrize}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Créer le premier lot
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {prizes.map((prize) => (
                            <div key={prize.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h5 className="font-medium text-lg">{prize.name}</h5>
                                  <div className="flex items-center gap-2 mt-1">
                                    {prize.attributionMethod === 'calendar' && (
                                      <Badge variant="secondary" className="gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Calendrier
                                      </Badge>
                                    )}
                                    {prize.attributionMethod === 'probability' && (
                                      <Badge variant="secondary" className="gap-1">
                                        <Percent className="w-3 h-3" />
                                        Probabilité {prize.winProbability ? `(${prize.winProbability}%)` : ''}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEditPrize(prize)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeletePrize(prize.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Progression</span>
                                  <span className="font-medium">
                                    {prize.quantity - prize.remaining} / {prize.quantity}
                                  </span>
                                </div>
                                <Progress 
                                  value={((prize.quantity - prize.remaining) / prize.quantity) * 100} 
                                  className="h-2"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {prize.remaining} lots restants
                                </p>
                              </div>

                              <Badge 
                                variant={prize.status === 'active' ? 'default' : 'secondary'}
                                className="mt-3"
                              >
                                {prize.status === 'active' ? 'Actif' : prize.status === 'depleted' ? 'Épuisé' : 'Programmé'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <details className="mt-6 border rounded-lg" open>
                      <summary className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Paramètres avancés (campagne)</span>
                      </summary>
                      <div className="p-4 border-t space-y-6 text-sm">
                        <div>
                          <Label>Ordre de priorité des lots</Label>
                          <Select defaultValue="1">
                            <SelectTrigger className="mt-1.5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Séquentiel (ordre défini)</SelectItem>
                              <SelectItem value="2">Aléatoire</SelectItem>
                              <SelectItem value="3">Par priorité</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Définit l'ordre global dans lequel les lots sont proposés aux participants.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Max gains par IP</Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Illimité"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label>Max gains par email</Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Illimité"
                              className="mt-1.5"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Max gains par appareil</Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Illimité"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label>Période de vérification (heures)</Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="24"
                              className="mt-1.5"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox id="notifyWin-global" />
                            <Label htmlFor="notifyWin-global" className="text-sm">
                              Notifier l'administrateur en cas de gain
                            </Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox id="notifyDepletion-global" />
                            <Label htmlFor="notifyDepletion-global" className="text-sm">
                              Notifier lorsque la dotation est épuisée
                            </Label>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </TabsContent>

                <TabsContent value="sortie" className="mt-0 space-y-6">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-lg">Envoi d'un e-mail aux gagnants</h3>
                      <Button variant="ghost" size="sm">Réduire</Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nom de l'émetteur</Label>
                          <Input 
                            placeholder="Ex: Cuisine Actuelle"
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Adresse e-mail du destinataire</Label>
                          <Input 
                            type="email"
                            placeholder="exemple@domaine.com"
                            className="mt-1.5"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Des virgules peuvent être utilisées pour séparer plusieurs adresses.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Checkbox id="use-participant" />
                            <Label htmlFor="use-participant" className="text-sm font-normal">
                              Utiliser l'adresse e-mail du participant
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>E-mail de réponse</Label>
                        <Input 
                          type="email"
                          placeholder="reponses@domaine.com"
                          className="mt-1.5"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          À qui envoyer l'e-mail de gain ?
                        </p>
                      </div>

                      <div>
                        <Label>Objet</Label>
                        <Input 
                          placeholder="Félicitations pour votre gain !"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label>Contenu de l'e-mail</Label>
                        <Textarea 
                          placeholder="Contenu de l'e-mail (HTML)"
                          className="mt-1.5 min-h-[200px] font-mono text-sm"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button variant="outline" size="sm">Tags</Button>
                          <Button variant="outline" size="sm">Variables dynamiques</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="viralite" className="mt-0 space-y-6">
                  <div className="bg-card border rounded-lg p-6">
                    <Tabs defaultValue="general">
                      <TabsList>
                        <TabsTrigger value="general">Contenu général</TabsTrigger>
                        <TabsTrigger value="boutons">Boutons sociaux</TabsTrigger>
                        <TabsTrigger value="actions">Actions écran de sortie</TabsTrigger>
                        <TabsTrigger value="emails">Emails d'invitation</TabsTrigger>
                      </TabsList>

                      <TabsContent value="general" className="space-y-4 mt-6">
                        <p className="text-sm text-muted-foreground">
                          Toutes les informations remplies ci-dessous pré-rempliront les champs des boutons de partage que vous activerez dans les autres onglets.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <Label>Image de partage (1200×627px)</Label>
                            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:border-primary cursor-pointer transition-colors">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Cliquez pour ajouter une image</p>
                              <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 10MB</p>
                            </div>
                            <div className="mt-2">
                              <Label className="text-sm">Description de l'image</Label>
                              <Input 
                                placeholder="Description de l'image"
                                className="mt-1"
                              />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Checkbox id="xml-feed" />
                              <Label htmlFor="xml-feed" className="text-sm font-normal">
                                Ajouter une image pour le flux XML
                              </Label>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label>Titre</Label>
                              <Input 
                                placeholder="Gagnez votre Plancha..."
                                className="mt-1.5"
                              />
                            </div>

                            <div>
                              <Label>Description</Label>
                              <Textarea 
                                placeholder="Jouez et rejouez jusqu'à ..."
                                className="mt-1.5"
                                rows={4}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="boutons" className="mt-6">
                        <p className="text-sm text-muted-foreground mb-4">
                          Configurez les boutons de partage sur les réseaux sociaux
                        </p>
                      </TabsContent>

                      <TabsContent value="actions" className="mt-6">
                        <p className="text-sm text-muted-foreground mb-4">
                          Configurez les actions disponibles sur l'écran de sortie
                        </p>
                      </TabsContent>

                      <TabsContent value="emails" className="mt-6">
                        <p className="text-sm text-muted-foreground mb-4">
                          Configurez les emails d'invitation à envoyer
                        </p>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </div>

          <PrizeModal 
            open={prizeModalOpen}
            onOpenChange={setPrizeModalOpen}
            prize={editingPrize}
            onSave={handleSavePrize}
            segments={segments}
            gameType={gameType}
            symbols={symbols}
            onAddSymbol={onAddSymbol}
          />
    </div>
  );
};