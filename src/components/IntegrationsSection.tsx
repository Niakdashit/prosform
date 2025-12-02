import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CampaignType = 'wheel' | 'jackpot' | 'quiz' | 'scratch' | 'form' | 'catalog';
type CampaignMode = 'fullscreen' | 'article';

interface IntegrationsSectionProps {
  campaignType: CampaignType;
  campaignId?: string;
  campaignMode?: CampaignMode;
  baseUrl?: string;
}

export const IntegrationsSection = ({
  campaignType,
  campaignId,
  campaignMode = 'fullscreen',
  baseUrl = window.location.origin
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
          <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
            Smart URL sera disponible après publication de la campagne.
          </div>
        </TabsContent>

        <TabsContent value="shorturl" className="mt-4">
          <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
            Short URL sera disponible après publication de la campagne.
          </div>
        </TabsContent>

        <TabsContent value="qrcode" className="mt-4">
          <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
            QR Code sera disponible après publication de la campagne.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
