import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  X,
  ExternalLink,
  Key,
  Link2,
  Settings2,
  Zap,
  ArrowRight,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntegrationProvider, Integration } from "./IntegrationsPanel";

// Types pour la configuration
interface FieldMapping {
  id: string;
  sourceField: string;
  sourceType: "form_field" | "participant" | "campaign" | "prize";
  destinationField: string;
  destinationObject: string;
  isActive: boolean;
}

interface IntegrationAction {
  id: string;
  actionType: string;
  triggerEvent: string;
  config: Record<string, any>;
  isActive: boolean;
}

interface IntegrationConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: Integration | null;
  provider: IntegrationProvider;
  onSave?: (config: IntegrationConfig) => void;
  onDisconnect?: () => void;
  formFields?: Array<{ id: string; label: string; type: string }>;
}

interface IntegrationConfig {
  credentials: {
    apiKey?: string;
    accessToken?: string;
    refreshToken?: string;
    instanceUrl?: string;
    portalId?: string;
  };
  fieldMappings: FieldMapping[];
  actions: IntegrationAction[];
}

// Configuration par provider
const providerConfigs: Record<
  IntegrationProvider,
  {
    name: string;
    icon: string;
    color: string;
    authType: "oauth" | "api_key" | "credentials";
    objects: Array<{ id: string; label: string; fields: string[] }>;
    actions: Array<{ id: string; label: string; description: string }>;
    triggers: Array<{ id: string; label: string }>;
    docsUrl?: string;
  }
> = {
  hubspot: {
    name: "HubSpot",
    icon: "https://cdn.simpleicons.org/hubspot/FF7A59",
    color: "#FF7A59",
    authType: "oauth",
    objects: [
      {
        id: "contact",
        label: "Contact",
        fields: ["email", "firstname", "lastname", "phone", "company", "jobtitle", "website"],
      },
      {
        id: "deal",
        label: "Deal",
        fields: ["dealname", "amount", "dealstage", "closedate", "pipeline"],
      },
      {
        id: "company",
        label: "Company",
        fields: ["name", "domain", "industry", "phone", "city", "country"],
      },
    ],
    actions: [
      { id: "create_contact", label: "Créer un contact", description: "Crée un nouveau contact dans HubSpot" },
      { id: "update_contact", label: "Mettre à jour un contact", description: "Met à jour un contact existant" },
      { id: "create_deal", label: "Créer un deal", description: "Crée une nouvelle opportunité" },
      { id: "add_to_list", label: "Ajouter à une liste", description: "Ajoute le contact à une liste statique" },
      { id: "enroll_workflow", label: "Inscrire au workflow", description: "Inscrit le contact dans un workflow" },
    ],
    triggers: [
      { id: "on_submit", label: "À la soumission du formulaire" },
      { id: "on_win", label: "Quand le participant gagne" },
      { id: "on_lose", label: "Quand le participant perd" },
      { id: "on_complete", label: "À la fin de la campagne" },
      { id: "on_optin", label: "Quand le participant accepte l'opt-in" },
    ],
    docsUrl: "https://developers.hubspot.com/docs/api/overview",
  },
  salesforce: {
    name: "Salesforce",
    icon: "https://cdn.simpleicons.org/salesforce/00A1E0",
    color: "#00A1E0",
    authType: "oauth",
    objects: [
      {
        id: "lead",
        label: "Lead",
        fields: ["Email", "FirstName", "LastName", "Phone", "Company", "Title", "Status"],
      },
      {
        id: "contact",
        label: "Contact",
        fields: ["Email", "FirstName", "LastName", "Phone", "Title", "Department"],
      },
      {
        id: "opportunity",
        label: "Opportunity",
        fields: ["Name", "Amount", "StageName", "CloseDate", "Type"],
      },
      {
        id: "campaign",
        label: "Campaign",
        fields: ["Name", "Status", "Type", "StartDate", "EndDate"],
      },
    ],
    actions: [
      { id: "create_lead", label: "Créer un lead", description: "Crée un nouveau lead dans Salesforce" },
      { id: "create_contact", label: "Créer un contact", description: "Crée un nouveau contact" },
      { id: "create_opportunity", label: "Créer une opportunité", description: "Crée une nouvelle opportunité" },
      { id: "add_to_campaign", label: "Ajouter à une campagne", description: "Ajoute le lead/contact à une campagne" },
    ],
    triggers: [
      { id: "on_submit", label: "À la soumission du formulaire" },
      { id: "on_win", label: "Quand le participant gagne" },
      { id: "on_lose", label: "Quand le participant perd" },
      { id: "on_complete", label: "À la fin de la campagne" },
    ],
    docsUrl: "https://developer.salesforce.com/docs",
  },
  pipedrive: {
    name: "Pipedrive",
    icon: "https://cdn.simpleicons.org/pipedrive/1A1A1A",
    color: "#1A1A1A",
    authType: "oauth",
    objects: [
      {
        id: "person",
        label: "Person",
        fields: ["name", "email", "phone", "org_id"],
      },
      {
        id: "deal",
        label: "Deal",
        fields: ["title", "value", "currency", "stage_id", "pipeline_id"],
      },
      {
        id: "organization",
        label: "Organization",
        fields: ["name", "address", "owner_id"],
      },
    ],
    actions: [
      { id: "create_person", label: "Créer une personne", description: "Crée un nouveau contact" },
      { id: "create_deal", label: "Créer un deal", description: "Crée une nouvelle opportunité" },
      { id: "create_activity", label: "Créer une activité", description: "Crée une nouvelle activité" },
    ],
    triggers: [
      { id: "on_submit", label: "À la soumission" },
      { id: "on_win", label: "Quand le participant gagne" },
      { id: "on_complete", label: "À la fin" },
    ],
  },
  zoho_crm: {
    name: "Zoho CRM",
    icon: "https://cdn.simpleicons.org/zoho/C8202B",
    color: "#C8202B",
    authType: "oauth",
    objects: [
      {
        id: "lead",
        label: "Lead",
        fields: ["Email", "First_Name", "Last_Name", "Phone", "Company"],
      },
      {
        id: "contact",
        label: "Contact",
        fields: ["Email", "First_Name", "Last_Name", "Phone", "Account_Name"],
      },
      {
        id: "deal",
        label: "Deal",
        fields: ["Deal_Name", "Amount", "Stage", "Closing_Date"],
      },
    ],
    actions: [
      { id: "create_lead", label: "Créer un lead", description: "Crée un nouveau lead" },
      { id: "create_contact", label: "Créer un contact", description: "Crée un nouveau contact" },
      { id: "create_deal", label: "Créer un deal", description: "Crée une nouvelle opportunité" },
    ],
    triggers: [
      { id: "on_submit", label: "À la soumission" },
      { id: "on_win", label: "Quand le participant gagne" },
    ],
  },
  // Autres providers avec config par défaut
  freshsales: {
    name: "Freshsales",
    icon: "https://cdn.simpleicons.org/freshworks/F26722",
    color: "#F26722",
    authType: "api_key",
    objects: [{ id: "contact", label: "Contact", fields: ["email", "first_name", "last_name", "phone"] }],
    actions: [{ id: "create_contact", label: "Créer un contact", description: "Crée un nouveau contact" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  copper: {
    name: "Copper",
    icon: "https://cdn.simpleicons.org/copper/F8A01A",
    color: "#F8A01A",
    authType: "api_key",
    objects: [{ id: "person", label: "Person", fields: ["email", "name", "phone"] }],
    actions: [{ id: "create_person", label: "Créer une personne", description: "Crée un nouveau contact" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  close: {
    name: "Close",
    icon: "https://cdn.simpleicons.org/close/1A1A1A",
    color: "#1A1A1A",
    authType: "api_key",
    objects: [{ id: "lead", label: "Lead", fields: ["email", "name", "phone"] }],
    actions: [{ id: "create_lead", label: "Créer un lead", description: "Crée un nouveau lead" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  insightly: {
    name: "Insightly",
    icon: "https://cdn.simpleicons.org/insightly/5C2D91",
    color: "#5C2D91",
    authType: "api_key",
    objects: [{ id: "contact", label: "Contact", fields: ["EMAIL_ADDRESS", "FIRST_NAME", "LAST_NAME"] }],
    actions: [{ id: "create_contact", label: "Créer un contact", description: "Crée un nouveau contact" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  mailchimp: {
    name: "Mailchimp",
    icon: "https://cdn.simpleicons.org/mailchimp/FFE01B",
    color: "#FFE01B",
    authType: "oauth",
    objects: [{ id: "member", label: "Member", fields: ["email_address", "merge_fields.FNAME", "merge_fields.LNAME"] }],
    actions: [
      { id: "add_to_list", label: "Ajouter à une liste", description: "Ajoute le contact à une liste" },
      { id: "add_tag", label: "Ajouter un tag", description: "Ajoute un tag au contact" },
    ],
    triggers: [{ id: "on_submit", label: "À la soumission" }, { id: "on_optin", label: "À l'opt-in" }],
  },
  klaviyo: {
    name: "Klaviyo",
    icon: "https://cdn.simpleicons.org/klaviyo/000000",
    color: "#000000",
    authType: "api_key",
    objects: [{ id: "profile", label: "Profile", fields: ["email", "first_name", "last_name", "phone_number"] }],
    actions: [
      { id: "create_profile", label: "Créer un profil", description: "Crée un nouveau profil" },
      { id: "add_to_list", label: "Ajouter à une liste", description: "Ajoute à une liste" },
    ],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  activecampaign: {
    name: "ActiveCampaign",
    icon: "https://cdn.simpleicons.org/activecampaign/356AE6",
    color: "#356AE6",
    authType: "api_key",
    objects: [{ id: "contact", label: "Contact", fields: ["email", "firstName", "lastName", "phone"] }],
    actions: [
      { id: "create_contact", label: "Créer un contact", description: "Crée un nouveau contact" },
      { id: "add_to_list", label: "Ajouter à une liste", description: "Ajoute à une liste" },
      { id: "add_tag", label: "Ajouter un tag", description: "Ajoute un tag" },
    ],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  sendinblue: {
    name: "Brevo",
    icon: "https://cdn.simpleicons.org/brevo/0B996E",
    color: "#0B996E",
    authType: "api_key",
    objects: [{ id: "contact", label: "Contact", fields: ["email", "attributes.FIRSTNAME", "attributes.LASTNAME"] }],
    actions: [
      { id: "create_contact", label: "Créer un contact", description: "Crée un nouveau contact" },
      { id: "add_to_list", label: "Ajouter à une liste", description: "Ajoute à une liste" },
    ],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  convertkit: {
    name: "ConvertKit",
    icon: "https://cdn.simpleicons.org/convertkit/FB6970",
    color: "#FB6970",
    authType: "api_key",
    objects: [{ id: "subscriber", label: "Subscriber", fields: ["email", "first_name"] }],
    actions: [
      { id: "create_subscriber", label: "Créer un abonné", description: "Crée un nouvel abonné" },
      { id: "add_tag", label: "Ajouter un tag", description: "Ajoute un tag" },
    ],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  drip: {
    name: "Drip",
    icon: "https://cdn.simpleicons.org/drip/EA5F8B",
    color: "#EA5F8B",
    authType: "api_key",
    objects: [{ id: "subscriber", label: "Subscriber", fields: ["email", "first_name", "last_name"] }],
    actions: [{ id: "create_subscriber", label: "Créer un abonné", description: "Crée un nouvel abonné" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  shopify: {
    name: "Shopify",
    icon: "https://cdn.simpleicons.org/shopify/7AB55C",
    color: "#7AB55C",
    authType: "oauth",
    objects: [{ id: "customer", label: "Customer", fields: ["email", "first_name", "last_name", "phone"] }],
    actions: [
      { id: "create_customer", label: "Créer un client", description: "Crée un nouveau client" },
      { id: "create_discount", label: "Créer un code promo", description: "Génère un code promo" },
    ],
    triggers: [{ id: "on_win", label: "Quand le participant gagne" }],
  },
  woocommerce: {
    name: "WooCommerce",
    icon: "https://cdn.simpleicons.org/woocommerce/96588A",
    color: "#96588A",
    authType: "api_key",
    objects: [{ id: "customer", label: "Customer", fields: ["email", "first_name", "last_name"] }],
    actions: [
      { id: "create_customer", label: "Créer un client", description: "Crée un nouveau client" },
      { id: "create_coupon", label: "Créer un coupon", description: "Génère un coupon" },
    ],
    triggers: [{ id: "on_win", label: "Quand le participant gagne" }],
  },
  bigcommerce: {
    name: "BigCommerce",
    icon: "https://cdn.simpleicons.org/bigcommerce/121118",
    color: "#121118",
    authType: "oauth",
    objects: [{ id: "customer", label: "Customer", fields: ["email", "first_name", "last_name"] }],
    actions: [{ id: "create_customer", label: "Créer un client", description: "Crée un nouveau client" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  magento: {
    name: "Adobe Commerce",
    icon: "https://cdn.simpleicons.org/magento/EE672F",
    color: "#EE672F",
    authType: "api_key",
    objects: [{ id: "customer", label: "Customer", fields: ["email", "firstname", "lastname"] }],
    actions: [{ id: "create_customer", label: "Créer un client", description: "Crée un nouveau client" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  intercom: {
    name: "Intercom",
    icon: "https://cdn.simpleicons.org/intercom/6AFDEF",
    color: "#6AFDEF",
    authType: "oauth",
    objects: [{ id: "user", label: "User", fields: ["email", "name", "phone"] }],
    actions: [
      { id: "create_user", label: "Créer un utilisateur", description: "Crée un nouvel utilisateur" },
      { id: "track_event", label: "Tracker un événement", description: "Enregistre un événement" },
    ],
    triggers: [{ id: "on_submit", label: "À la soumission" }, { id: "on_win", label: "Quand le participant gagne" }],
  },
  zendesk: {
    name: "Zendesk",
    icon: "https://cdn.simpleicons.org/zendesk/03363D",
    color: "#03363D",
    authType: "oauth",
    objects: [{ id: "user", label: "User", fields: ["email", "name", "phone"] }],
    actions: [{ id: "create_user", label: "Créer un utilisateur", description: "Crée un nouvel utilisateur" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  freshdesk: {
    name: "Freshdesk",
    icon: "https://cdn.simpleicons.org/freshdesk/00A65A",
    color: "#00A65A",
    authType: "api_key",
    objects: [{ id: "contact", label: "Contact", fields: ["email", "name", "phone"] }],
    actions: [{ id: "create_contact", label: "Créer un contact", description: "Crée un nouveau contact" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  crisp: {
    name: "Crisp",
    icon: "https://cdn.simpleicons.org/crisp/1972F5",
    color: "#1972F5",
    authType: "api_key",
    objects: [{ id: "people", label: "People", fields: ["email", "person.nickname"] }],
    actions: [{ id: "create_people", label: "Créer une personne", description: "Crée un nouveau profil" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  segment: {
    name: "Segment",
    icon: "https://cdn.simpleicons.org/segment/52BD95",
    color: "#52BD95",
    authType: "api_key",
    objects: [{ id: "user", label: "User", fields: ["email", "name", "traits"] }],
    actions: [
      { id: "identify", label: "Identify", description: "Identifie un utilisateur" },
      { id: "track", label: "Track", description: "Enregistre un événement" },
    ],
    triggers: [{ id: "on_submit", label: "À la soumission" }, { id: "on_win", label: "Quand le participant gagne" }],
  },
  mixpanel: {
    name: "Mixpanel",
    icon: "https://cdn.simpleicons.org/mixpanel/7856FF",
    color: "#7856FF",
    authType: "api_key",
    objects: [{ id: "user", label: "User", fields: ["$email", "$name"] }],
    actions: [{ id: "track", label: "Track Event", description: "Enregistre un événement" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  amplitude: {
    name: "Amplitude",
    icon: "https://cdn.simpleicons.org/amplitude/1E61F0",
    color: "#1E61F0",
    authType: "api_key",
    objects: [{ id: "user", label: "User", fields: ["user_id", "email"] }],
    actions: [{ id: "track", label: "Track Event", description: "Enregistre un événement" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  google_analytics: {
    name: "Google Analytics 4",
    icon: "https://cdn.simpleicons.org/googleanalytics/E37400",
    color: "#E37400",
    authType: "oauth",
    objects: [{ id: "event", label: "Event", fields: ["event_name", "parameters"] }],
    actions: [{ id: "track_event", label: "Track Event", description: "Enregistre un événement" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  zapier: {
    name: "Zapier",
    icon: "https://cdn.simpleicons.org/zapier/FF4A00",
    color: "#FF4A00",
    authType: "api_key",
    objects: [],
    actions: [{ id: "trigger_zap", label: "Déclencher un Zap", description: "Envoie les données à Zapier" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }, { id: "on_win", label: "Quand le participant gagne" }],
  },
  make: {
    name: "Make",
    icon: "https://cdn.simpleicons.org/integromat/6D00CC",
    color: "#6D00CC",
    authType: "api_key",
    objects: [],
    actions: [{ id: "trigger_scenario", label: "Déclencher un scénario", description: "Envoie les données à Make" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  n8n: {
    name: "n8n",
    icon: "https://cdn.simpleicons.org/n8n/EA4B71",
    color: "#EA4B71",
    authType: "api_key",
    objects: [],
    actions: [{ id: "trigger_workflow", label: "Déclencher un workflow", description: "Envoie les données à n8n" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
  webhook: {
    name: "Webhook",
    icon: "https://cdn.simpleicons.org/webhook/000000",
    color: "#000000",
    authType: "api_key",
    objects: [],
    actions: [{ id: "send_webhook", label: "Envoyer un webhook", description: "Envoie les données à une URL" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }, { id: "on_win", label: "Quand le participant gagne" }],
  },
  api: {
    name: "API personnalisée",
    icon: "https://cdn.simpleicons.org/api/000000",
    color: "#000000",
    authType: "api_key",
    objects: [],
    actions: [{ id: "call_api", label: "Appeler l'API", description: "Envoie une requête à votre API" }],
    triggers: [{ id: "on_submit", label: "À la soumission" }],
  },
};

// Champs source disponibles
const sourceFields = [
  { id: "email", label: "Email", type: "form_field" },
  { id: "first_name", label: "Prénom", type: "form_field" },
  { id: "last_name", label: "Nom", type: "form_field" },
  { id: "phone", label: "Téléphone", type: "form_field" },
  { id: "company", label: "Entreprise", type: "form_field" },
  { id: "participant_id", label: "ID Participant", type: "participant" },
  { id: "participation_date", label: "Date de participation", type: "participant" },
  { id: "has_won", label: "A gagné", type: "participant" },
  { id: "prize_name", label: "Nom du lot", type: "prize" },
  { id: "prize_code", label: "Code du lot", type: "prize" },
  { id: "campaign_name", label: "Nom de la campagne", type: "campaign" },
  { id: "campaign_url", label: "URL de la campagne", type: "campaign" },
];

export const IntegrationConfigModal = ({
  open,
  onOpenChange,
  integration,
  provider,
  onSave,
  onDisconnect,
  formFields = [],
}: IntegrationConfigModalProps) => {
  const config = providerConfigs[provider];
  const [activeTab, setActiveTab] = useState("connection");
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [actions, setActions] = useState<IntegrationAction[]>([]);
  const [selectedObject, setSelectedObject] = useState(config?.objects[0]?.id || "");

  if (!config) return null;

  const isConnected = integration?.status === "connected";

  const addFieldMapping = () => {
    setFieldMappings([
      ...fieldMappings,
      {
        id: `mapping-${Date.now()}`,
        sourceField: "",
        sourceType: "form_field",
        destinationField: "",
        destinationObject: selectedObject,
        isActive: true,
      },
    ]);
  };

  const removeFieldMapping = (id: string) => {
    setFieldMappings(fieldMappings.filter((m) => m.id !== id));
  };

  const updateFieldMapping = (id: string, updates: Partial<FieldMapping>) => {
    setFieldMappings(fieldMappings.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const addAction = () => {
    setActions([
      ...actions,
      {
        id: `action-${Date.now()}`,
        actionType: config.actions[0]?.id || "",
        triggerEvent: config.triggers[0]?.id || "on_submit",
        config: {},
        isActive: true,
      },
    ]);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter((a) => a.id !== id));
  };

  const updateAction = (id: string, updates: Partial<IntegrationAction>) => {
    setActions(actions.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const handleSave = () => {
    onSave?.({
      credentials: {
        apiKey: config.authType === "api_key" ? apiKey : undefined,
      },
      fieldMappings,
      actions,
    });
    onOpenChange(false);
  };

  const [apiKeyError, setApiKeyError] = useState("");
  const [showOAuthInfo, setShowOAuthInfo] = useState(false);

  const handleConnect = () => {
    if (config.authType === "oauth") {
      // Pour OAuth, afficher les instructions
      setShowOAuthInfo(true);
    } else {
      // Vérifier que la clé API est fournie
      if (!apiKey.trim()) {
        setApiKeyError("Veuillez entrer une clé API valide");
        return;
      }
      setApiKeyError("");
      // Sauvegarder la clé API
      handleSave();
    }
  };

  const selectedObjectConfig = config.objects.find((o) => o.id === selectedObject);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <img src={config.icon} alt={config.name} className="w-6 h-6" />
            </div>
            <div>
              <span>{config.name}</span>
              {isConnected && (
                <Badge variant="outline" className="ml-2 text-green-600 border-green-500/50">
                  <Check className="w-3 h-3 mr-1" />
                  Connecté
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Configurez l'intégration avec {config.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection" className="gap-1.5">
              <Key className="h-3.5 w-3.5" />
              Connexion
            </TabsTrigger>
            <TabsTrigger value="mapping" className="gap-1.5" disabled={!isConnected}>
              <Link2 className="h-3.5 w-3.5" />
              Mapping
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-1.5" disabled={!isConnected}>
              <Zap className="h-3.5 w-3.5" />
              Actions
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {/* Onglet Connexion */}
            <TabsContent value="connection" className="space-y-4 mt-0">
              {config.authType === "oauth" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Cliquez sur le bouton ci-dessous pour vous connecter à {config.name} via OAuth.
                      Vous serez redirigé vers {config.name} pour autoriser l'accès.
                    </p>
                    {!isConnected ? (
                      <Button onClick={handleConnect} className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Se connecter à {config.name}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600">
                          <Check className="w-3 h-3 mr-1" />
                          Connecté
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => onDisconnect?.()}>
                          Déconnecter
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Clé API</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Entrez votre clé API"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Vous pouvez trouver votre clé API dans les paramètres de votre compte {config.name}.
                    </p>
                  </div>

                  {provider === "webhook" && (
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">URL du Webhook</Label>
                      <Input
                        id="webhook-url"
                        type="url"
                        placeholder="https://votre-api.com/webhook"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {config.docsUrl && (
                <a
                  href={config.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Documentation {config.name}
                </a>
              )}
            </TabsContent>

            {/* Onglet Mapping */}
            <TabsContent value="mapping" className="space-y-4 mt-0">
              {config.objects.length > 0 && (
                <div className="space-y-2">
                  <Label>Objet de destination</Label>
                  <Select value={selectedObject} onValueChange={setSelectedObject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.objects.map((obj) => (
                        <SelectItem key={obj.id} value={obj.id}>
                          {obj.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Mapping des champs</Label>
                  <Button variant="outline" size="sm" onClick={addFieldMapping} className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter
                  </Button>
                </div>

                {fieldMappings.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                    Aucun mapping configuré. Cliquez sur "Ajouter" pour créer un mapping.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fieldMappings.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="flex items-center gap-2 p-2 rounded-lg border bg-card"
                      >
                        <Select
                          value={mapping.sourceField}
                          onValueChange={(v) => updateFieldMapping(mapping.id, { sourceField: v })}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Champ source" />
                          </SelectTrigger>
                          <SelectContent>
                            {sourceFields.map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.label}
                              </SelectItem>
                            ))}
                            {formFields.map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                        <Select
                          value={mapping.destinationField}
                          onValueChange={(v) => updateFieldMapping(mapping.id, { destinationField: v })}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Champ destination" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedObjectConfig?.fields.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Switch
                          checked={mapping.isActive}
                          onCheckedChange={(v) => updateFieldMapping(mapping.id, { isActive: v })}
                        />

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500"
                          onClick={() => removeFieldMapping(mapping.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Onglet Actions */}
            <TabsContent value="actions" className="space-y-4 mt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Actions automatiques</Label>
                  <Button variant="outline" size="sm" onClick={addAction} className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter
                  </Button>
                </div>

                {actions.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                    Aucune action configurée. Cliquez sur "Ajouter" pour créer une action.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {actions.map((action) => (
                      <div
                        key={action.id}
                        className="p-3 rounded-lg border bg-card space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={action.isActive}
                              onCheckedChange={(v) => updateAction(action.id, { isActive: v })}
                            />
                            <span className="text-sm font-medium">
                              {config.actions.find((a) => a.id === action.actionType)?.label}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500"
                            onClick={() => removeAction(action.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Action</Label>
                            <Select
                              value={action.actionType}
                              onValueChange={(v) => updateAction(action.id, { actionType: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {config.actions.map((a) => (
                                  <SelectItem key={a.id} value={a.id}>
                                    {a.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs">Déclencheur</Label>
                            <Select
                              value={action.triggerEvent}
                              onValueChange={(v) => updateAction(action.id, { triggerEvent: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {config.triggers.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {config.actions.find((a) => a.id === action.actionType)?.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="gap-1.5">
            <Check className="h-4 w-4" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationConfigModal;
