import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, ExternalLink, Download } from "lucide-react";

type CampaignType = 'wheel' | 'jackpot' | 'quiz' | 'scratch' | 'form' | 'catalog';
type CampaignMode = 'fullscreen' | 'article';

interface IntegrationsSectionProps {
  campaignType: CampaignType;
  campaignId?: string;
  campaignMode?: CampaignMode;
  baseUrl?: string;
  publicSlug?: string;
}

export const IntegrationsSection = ({
  campaignType,
  campaignId,
  campaignMode = 'fullscreen',
  baseUrl = window.location.origin,
  publicSlug
}: IntegrationsSectionProps) => {
  const [activeTab, setActiveTab] = useState("javascript");

  // Determine the embed path based on type and mode
  const getEmbedPath = () => {
    const typePrefix = campaignMode === 'article' ? `article-${campaignType}` : campaignType;
    const previewSuffix = '-preview';
    return `/${typePrefix}${previewSuffix}`;
  };

  // Build the embed URL with campaign ID
  const getEmbedUrl = () => {
    const path = getEmbedPath();
    const idParam = campaignId ? `?id=${campaignId}` : '';
    return `${baseUrl}${path}${idParam}`;
  };

  // Get public URL (for published campaigns)
  const getPublicUrl = () => {
    if (publicSlug) {
      return `${baseUrl}/p/${publicSlug}`;
    }
    return null;
  };

  // Get Smart URL - uses full campaign ID for reliability
  const getSmartUrl = () => {
    if (publicSlug) {
      return `${baseUrl}/p/${publicSlug}`;
    }
    if (campaignId) {
      return getEmbedUrl();
    }
    return null;
  };

  // Get Short URL - uses public slug or embed URL
  const getShortUrl = () => {
    if (publicSlug) {
      return `${baseUrl}/p/${publicSlug}`;
    }
    if (campaignId) {
      return getEmbedUrl();
    }
    return null;
  };

  // Generate container ID based on type
  const getContainerId = () => {
    return `${campaignType}-campaign`;
  };

  // Get human-readable type name
  const getTypeName = () => {
    const names: Record<CampaignType, string> = {
      wheel: 'Roue',
      jackpot: 'Jackpot',
      quiz: 'Quiz',
      scratch: 'Scratch',
      form: 'Formulaire',
      catalog: 'Catalogue'
    };
    return names[campaignType] || campaignType;
  };

  // Get recommended height based on type
  const getRecommendedHeight = () => {
    const heights: Record<CampaignType, number> = {
      wheel: 700,
      jackpot: 600,
      quiz: 800,
      scratch: 600,
      form: 800,
      catalog: 900
    };
    return heights[campaignType] || 600;
  };

  const embedUrl = getEmbedUrl();
  const containerId = getContainerId();
  const height = getRecommendedHeight();
  const publicUrl = getPublicUrl();
  const smartUrl = getSmartUrl();
  const shortUrl = getShortUrl();

  // JavaScript embed code
  const jsCode = `<div id="${containerId}"></div>
<script type="text/javascript">
  (function(w,d,id){
    var el=d.getElementById(id);
    if(!el){ return; }
    var f=d.createElement('iframe');
    f.src='${embedUrl}';
    f.width='100%';
    f.height='${height}';
    f.style.border='none';
    el.appendChild(f);
  })(window,document,'${containerId}');
</script>`;

  // HTML iframe code
  const htmlCode = `<iframe
  src="${embedUrl}"
  width="100%"
  height="${height}"
  frameborder="0"
  style="border: none;"
  title="${getTypeName()} - Campagne"
  allow="clipboard-write"
></iframe>`;

  // Webview code (for mobile apps)
  const webviewCode = `// React Native WebView
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: '${embedUrl}' }}
  style={{ flex: 1 }}
  javaScriptEnabled={true}
  domStorageEnabled={true}
/>

// Android WebView (Java)
WebView webView = findViewById(R.id.webview);
webView.getSettings().setJavaScriptEnabled(true);
webView.getSettings().setDomStorageEnabled(true);
webView.loadUrl("${embedUrl}");

// iOS WKWebView (Swift)
let webView = WKWebView(frame: view.bounds)
if let url = URL(string: "${embedUrl}") {
    webView.load(URLRequest(url: url))
}
view.addSubview(webView)`;

  // oEmbed JSON
  const oEmbedCode = `{
  "version": "1.0",
  "type": "rich",
  "provider_name": "Prosplay",
  "provider_url": "${baseUrl}",
  "title": "${getTypeName()} Campaign",
  "width": "100%",
  "height": ${height},
  "html": "<iframe src='${embedUrl}' width='100%' height='${height}' frameborder='0'></iframe>"
}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papier`);
  };

  const renderCodeBlock = (code: string, label: string) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
      <Button 
        variant="outline" 
        size="sm" 
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, label)}
      >
        Copier
      </Button>
    </div>
  );

  const renderUrlBlock = (url: string | null, label: string, placeholder: string) => {
    if (!url) {
      return (
        <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
          {placeholder}
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input 
            value={url} 
            readOnly 
            className="flex-1 bg-muted"
          />
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => copyToClipboard(url, label)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => window.open(url, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderQRCode = () => {
    const qrUrl = publicUrl || embedUrl;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <img 
            src={qrApiUrl} 
            alt="QR Code" 
            className="border rounded-lg p-2 bg-white"
            width={200}
            height={200}
          />
        </div>
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              const link = document.createElement('a');
              link.href = qrApiUrl;
              link.download = `qrcode-${campaignType}-${campaignId || 'campaign'}.png`;
              link.click();
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger PNG
          </Button>
          <Button 
            variant="outline"
            onClick={() => copyToClipboard(qrUrl, 'URL du QR Code')}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copier l'URL
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Scannez ce QR code pour accéder à la campagne
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-4 bg-card border rounded-lg p-6">
      <h3 className="font-semibold text-lg">Intégrations</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="javascript">Javascript</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="webview">Webview</TabsTrigger>
          <TabsTrigger value="oembed">oEmbed</TabsTrigger>
          <TabsTrigger value="smarturl">Smart URL</TabsTrigger>
          <TabsTrigger value="shorturl">Short URL</TabsTrigger>
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="javascript" className="mt-4">
          {renderCodeBlock(jsCode, 'Code Javascript')}
        </TabsContent>

        <TabsContent value="html" className="mt-4">
          {renderCodeBlock(htmlCode, 'Code HTML')}
        </TabsContent>

        <TabsContent value="webview" className="mt-4">
          {renderCodeBlock(webviewCode, 'Code Webview')}
        </TabsContent>

        <TabsContent value="oembed" className="mt-4">
          {renderCodeBlock(oEmbedCode, 'oEmbed JSON')}
        </TabsContent>

        <TabsContent value="smarturl" className="mt-4">
          {renderUrlBlock(smartUrl, 'Smart URL', 'Smart URL sera disponible après sauvegarde de la campagne.')}
        </TabsContent>

        <TabsContent value="shorturl" className="mt-4">
          {renderUrlBlock(shortUrl, 'Short URL', 'Short URL sera disponible après sauvegarde de la campagne.')}
        </TabsContent>

        <TabsContent value="qrcode" className="mt-4">
          {renderQRCode()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
