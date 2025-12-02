import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check, QrCode, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface IntegrationsSectionProps {
  campaignId?: string;
  campaignSlug?: string;
  campaignType: 'wheel' | 'quiz' | 'jackpot' | 'scratch' | 'form' | 'catalog';
  campaignMode?: 'fullscreen' | 'article' | 'embed' | 'popup';
  baseUrl?: string;
}

export const IntegrationsSection = ({
  campaignId,
  campaignSlug,
  campaignType,
  campaignMode = 'fullscreen',
  baseUrl = window.location.origin
}: IntegrationsSectionProps) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Générer les URLs dynamiques basées sur le type et mode
  const getPublicUrl = () => {
    if (campaignSlug) {
      return `${baseUrl}/p/${campaignSlug}`;
    }
    if (campaignId) {
      // Fallback avec ID si pas de slug
      return `${baseUrl}/p/${campaignId}`;
    }
    return `${baseUrl}/p/[slug]`;
  };

  const getEmbedUrl = () => {
    const publicUrl = getPublicUrl();
    return `${publicUrl}?embed=true`;
  };

  const getArticleUrl = () => {
    if (campaignId) {
      return `${baseUrl}/${campaignType}-preview?id=${campaignId}&mode=article`;
    }
    return `${baseUrl}/${campaignType}-preview?mode=article`;
  };

  // Fonction générique pour la copie
  const copyToClipboard = async (text: string, tabName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tabName);
      toast.success("Copié dans le presse-papiers !");
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  // Code JavaScript d'intégration
  const getJavaScriptCode = () => {
    const embedId = `${campaignType}-campaign`;
    const embedUrl = getEmbedUrl();
    return `<div id="${embedId}"></div>
<script type="text/javascript">
  (function(w,d,id){
    var el=d.getElementById(id);
    if(!el){ return; }
    var f=d.createElement('iframe');
    f.src='${embedUrl}';
    f.width='100%';
    f.height='600';
    f.style.border='none';
    el.appendChild(f);
  })(window,document,'${embedId}');
</script>`;
  };

  // Code HTML (iframe direct)
  const getHtmlCode = () => {
    const embedUrl = getEmbedUrl();
    return `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border: none; max-width: 100%;"
  allow="clipboard-write"
  title="${campaignType} campaign"
></iframe>`;
  };

  // Code Webview (pour apps mobiles)
  const getWebviewCode = () => {
    const embedUrl = getEmbedUrl();
    return `// React Native WebView
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: '${embedUrl}' }}
  style={{ flex: 1 }}
  javaScriptEnabled={true}
  domStorageEnabled={true}
/>

// Swift (iOS)
let webView = WKWebView()
if let url = URL(string: "${embedUrl}") {
    webView.load(URLRequest(url: url))
}

// Kotlin (Android)
webView.loadUrl("${embedUrl}")`;
  };

  // oEmbed response
  const getOEmbedJson = () => {
    const publicUrl = getPublicUrl();
    return JSON.stringify({
      version: "1.0",
      type: "rich",
      provider_name: "Prosplay",
      provider_url: baseUrl,
      title: `${campaignType.charAt(0).toUpperCase() + campaignType.slice(1)} Campaign`,
      html: `<iframe src="${getEmbedUrl()}" width="100%" height="600" frameborder="0"></iframe>`,
      width: 600,
      height: 600,
      url: publicUrl
    }, null, 2);
  };

  // Smart URL (lien direct avec paramètres UTM)
  const getSmartUrl = () => {
    const publicUrl = getPublicUrl();
    return `${publicUrl}?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}`;
  };

  // Short URL placeholder
  const getShortUrl = () => {
    // En production, cela serait généré via un service comme bit.ly ou un domaine court personnalisé
    const publicUrl = getPublicUrl();
    if (campaignSlug) {
      return `${baseUrl}/c/${campaignSlug.substring(0, 8)}`;
    }
    return publicUrl;
  };

  // QR Code URL (via API publique)
  const getQrCodeUrl = () => {
    const publicUrl = encodeURIComponent(getPublicUrl());
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${publicUrl}`;
  };

  const renderCopyButton = (text: string, tabName: string) => (
    <Button
      variant="outline"
      size="sm"
      className="absolute top-2 right-2"
      onClick={() => copyToClipboard(text, tabName)}
    >
      {copiedTab === tabName ? (
        <>
          <Check className="w-4 h-4 mr-1" />
          Copié
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-1" />
          Copier
        </>
      )}
    </Button>
  );

  return (
    <div className="space-y-4 bg-card border rounded-lg p-6">
      <h3 className="font-semibold text-lg">Intégrations</h3>
      
      <Tabs defaultValue="javascript" className="w-full">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="javascript">Javascript</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="webview">Webview</TabsTrigger>
          <TabsTrigger value="oembed">oEmbed</TabsTrigger>
          <TabsTrigger value="smarturl">Smart URL</TabsTrigger>
          <TabsTrigger value="shorturl">Short URL</TabsTrigger>
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="javascript" className="mt-4">
          <div className="relative">
            <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all">
              <code>{getJavaScriptCode()}</code>
            </pre>
            {renderCopyButton(getJavaScriptCode(), "javascript")}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Intégrez ce code dans votre site pour afficher la campagne {campaignType}.
          </p>
        </TabsContent>

        <TabsContent value="html" className="mt-4">
          <div className="relative">
            <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all">
              <code>{getHtmlCode()}</code>
            </pre>
            {renderCopyButton(getHtmlCode(), "html")}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Iframe simple à intégrer directement dans votre HTML.
          </p>
        </TabsContent>

        <TabsContent value="webview" className="mt-4">
          <div className="relative">
            <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
              <code>{getWebviewCode()}</code>
            </pre>
            {renderCopyButton(getWebviewCode(), "webview")}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Code pour intégrer dans des applications mobiles (React Native, iOS, Android).
          </p>
        </TabsContent>

        <TabsContent value="oembed" className="mt-4">
          <div className="relative">
            <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
              <code>{getOEmbedJson()}</code>
            </pre>
            {renderCopyButton(getOEmbedJson(), "oembed")}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Réponse oEmbed pour l'intégration automatique sur les plateformes compatibles.
          </p>
        </TabsContent>

        <TabsContent value="smarturl" className="mt-4">
          <div className="relative">
            <div className="bg-muted p-4 rounded-md">
              <code className="text-xs break-all">{getSmartUrl()}</code>
            </div>
            {renderCopyButton(getSmartUrl(), "smarturl")}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            URL avec paramètres UTM pré-configurés. Remplacez {"{source}"}, {"{medium}"} et {"{campaign}"} par vos valeurs.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getPublicUrl(), '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Ouvrir
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="shorturl" className="mt-4">
          <div className="relative">
            <div className="bg-muted p-4 rounded-md">
              <code className="text-xs break-all">{getShortUrl()}</code>
            </div>
            {renderCopyButton(getShortUrl(), "shorturl")}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            URL courte pour le partage sur les réseaux sociaux.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getPublicUrl(), '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Ouvrir
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="qrcode" className="mt-4">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <img 
                src={getQrCodeUrl()} 
                alt="QR Code de la campagne"
                className="w-48 h-48"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = getQrCodeUrl();
                  link.download = `qrcode-${campaignType}-${campaignId || 'campaign'}.png`;
                  link.click();
                }}
              >
                <QrCode className="w-4 h-4 mr-1" />
                Télécharger
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(getPublicUrl(), "qrcode-url")}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copier URL
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Scannez ce QR code pour accéder directement à votre campagne.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
