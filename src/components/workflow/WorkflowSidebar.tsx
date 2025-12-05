import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GitBranch, 
  Star, 
  Tag, 
  Trophy,
  Play,
  X,
  Grid3x3,
  MessageSquare,
  Users,
  Webhook,
  Building2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowSidebarProps {
  onAddWorkflowElement?: (type: string) => void;
}

// CRM Integrations
const crmIntegrations = [
  { id: 'hubspot', name: 'HubSpot', icon: 'https://cdn.simpleicons.org/hubspot/FF7A59', color: '#FF7A59' },
  { id: 'salesforce', name: 'Salesforce', icon: 'https://cdn.simpleicons.org/salesforce/00A1E0', color: '#00A1E0' },
  { id: 'pipedrive', name: 'Pipedrive', icon: 'https://cdn.simpleicons.org/pipedrive/1A1A1A', color: '#1A1A1A' },
  { id: 'zoho_crm', name: 'Zoho CRM', icon: 'https://cdn.simpleicons.org/zoho/C8202B', color: '#C8202B' },
  { id: 'freshsales', name: 'Freshsales', icon: 'https://cdn.simpleicons.org/freshworks/F26722', color: '#F26722' },
  { id: 'copper', name: 'Copper', icon: 'https://cdn.simpleicons.org/copper/F8A01A', color: '#F8A01A' },
  { id: 'close', name: 'Close', icon: 'https://cdn.simpleicons.org/close/1A1A1A', color: '#1A1A1A' },
  { id: 'insightly', name: 'Insightly', icon: 'https://cdn.simpleicons.org/insightly/5C2D91', color: '#5C2D91' },
];

// Marketing Automation
const marketingIntegrations = [
  { id: 'mailchimp', name: 'Mailchimp', icon: 'https://cdn.simpleicons.org/mailchimp/FFE01B', color: '#FFE01B' },
  { id: 'klaviyo', name: 'Klaviyo', icon: 'https://cdn.simpleicons.org/klaviyo/000000', color: '#000000' },
  { id: 'activecampaign', name: 'ActiveCampaign', icon: 'https://cdn.simpleicons.org/activecampaign/356AE6', color: '#356AE6' },
  { id: 'sendinblue', name: 'Brevo', icon: 'https://cdn.simpleicons.org/brevo/0B996E', color: '#0B996E' },
  { id: 'convertkit', name: 'ConvertKit', icon: 'https://cdn.simpleicons.org/convertkit/FB6970', color: '#FB6970' },
];

// E-commerce
const ecommerceIntegrations = [
  { id: 'shopify', name: 'Shopify', icon: 'https://cdn.simpleicons.org/shopify/7AB55C', color: '#7AB55C' },
  { id: 'woocommerce', name: 'WooCommerce', icon: 'https://cdn.simpleicons.org/woocommerce/96588A', color: '#96588A' },
];

// Communication
const communicationIntegrations = [
  { id: 'intercom', name: 'Intercom', icon: 'https://cdn.simpleicons.org/intercom/6AFDEF', color: '#6AFDEF' },
  { id: 'zendesk', name: 'Zendesk', icon: 'https://cdn.simpleicons.org/zendesk/03363D', color: '#03363D' },
  { id: 'crisp', name: 'Crisp', icon: 'https://cdn.simpleicons.org/crisp/1972F5', color: '#1972F5' },
];

const workflowElements = [
  {
    id: 'branching',
    label: 'Branching',
    icon: GitBranch,
    description: 'Create conditional paths'
  },
  {
    id: 'scoring',
    label: 'Scoring',
    icon: Star,
    description: 'Add scoring logic'
  },
  {
    id: 'tagging',
    label: 'Tagging',
    icon: Tag,
    description: 'Tag responses'
  },
  {
    id: 'outcome-quiz',
    label: 'Outcome quiz',
    icon: Trophy,
    description: 'Calculate outcomes'
  }
];

export const WorkflowSidebar = ({ onAddWorkflowElement }: WorkflowSidebarProps) => {
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null);

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Workflow</h3>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Elements list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {workflowElements.map((element) => {
            const Icon = element.icon;
            return (
              <button
                key={element.id}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left"
                onClick={() => onAddWorkflowElement?.(element.id)}
              >
                <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground">
                    {element.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {element.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions section */}
        <div className="p-2 mt-3">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-2">
            Actions
          </div>
          <button 
            className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left"
            onClick={() => onAddWorkflowElement?.('pull-data')}
          >
            <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <Play className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground">
                Pull data in
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                Track sources, identify responde...
              </div>
            </div>
          </button>
        </div>

        {/* CRM Integrations */}
        <div className="p-2 mt-2">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-2">
            CRM
          </div>

          <div className="space-y-0.5">
            <button
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left"
              onClick={() =>
                setExpandedIntegration((prev) => (prev === "crm" ? null : "crm"))
              }
            >
              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground flex items-center gap-1">
                  CRM
                  {expandedIntegration === "crm" ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  HubSpot, Salesforce, Pipedrive...
                </div>
              </div>
            </button>

            {expandedIntegration === "crm" && (
              <div className="ml-8 mt-0.5 mb-1 space-y-0.5">
                {crmIntegrations.map((integration) => (
                  <button
                    key={integration.id}
                    className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                    onClick={() => onAddWorkflowElement?.(integration.id)}
                  >
                    <img
                      src={integration.icon}
                      alt={integration.name}
                      className="w-3.5 h-3.5 rounded-[2px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span>{integration.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Marketing Automation */}
        <div className="p-2">
          <div className="space-y-0.5">
            <button
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left"
              onClick={() =>
                setExpandedIntegration((prev) => (prev === "marketing" ? null : "marketing"))
              }
            >
              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground flex items-center gap-1">
                  Marketing
                  {expandedIntegration === "marketing" ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Mailchimp, Klaviyo, ActiveCampaign...
                </div>
              </div>
            </button>

            {expandedIntegration === "marketing" && (
              <div className="ml-8 mt-0.5 mb-1 space-y-0.5">
                {marketingIntegrations.map((integration) => (
                  <button
                    key={integration.id}
                    className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                    onClick={() => onAddWorkflowElement?.(integration.id)}
                  >
                    <img
                      src={integration.icon}
                      alt={integration.name}
                      className="w-3.5 h-3.5 rounded-[2px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span>{integration.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Integrations section (Connect / Messages / Contacts / Webhooks) */}
        <div className="p-2 pb-4">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-2">
            Autres intégrations
          </div>

          <div className="space-y-0.5">
            <button
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left"
              onClick={() =>
                setExpandedIntegration((prev) => (prev === "connect" ? null : "connect"))
              }
            >
              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <Grid3x3 className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground flex items-center gap-1">
                  Connect
                  {expandedIntegration === "connect" ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Google Sheets, Airtable, Zapier...
                </div>
              </div>
            </button>

            {expandedIntegration === "connect" && (
              <div className="ml-8 mt-0.5 mb-1 space-y-0.5">
                <button
                  className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                  onClick={() => onAddWorkflowElement?.("google-sheets")}
                >
                  <img
                    src="https://cdn.simpleicons.org/googlesheets"
                    alt="Google Sheets"
                    className="w-3.5 h-3.5 rounded-[2px]"
                  />
                  <span>Google Sheets</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                  onClick={() => onAddWorkflowElement?.("airtable")}
                >
                  <img
                    src="https://cdn.simpleicons.org/airtable"
                    alt="Airtable"
                    className="w-3.5 h-3.5 rounded-[2px]"
                  />
                  <span>Airtable</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                  onClick={() => onAddWorkflowElement?.("zapier")}
                >
                  <img
                    src="https://cdn.simpleicons.org/zapier"
                    alt="Zapier"
                    className="w-3.5 h-3.5 rounded-[2px]"
                  />
                  <span>Zapier</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                  onClick={() => onAddWorkflowElement?.("make")}
                >
                  <img
                    src="https://cdn.simpleicons.org/integromat"
                    alt="Make"
                    className="w-3.5 h-3.5 rounded-[2px]"
                  />
                  <span>Make (Integromat)</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                  onClick={() => onAddWorkflowElement?.("n8n")}
                >
                  <img
                    src="https://cdn.simpleicons.org/n8n"
                    alt="n8n"
                    className="w-3.5 h-3.5 rounded-[2px]"
                  />
                  <span>n8n</span>
                </button>
              </div>
            )}

            {/* E-commerce */}
            <button
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left"
              onClick={() =>
                setExpandedIntegration((prev) => (prev === "ecommerce" ? null : "ecommerce"))
              }
            >
              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <img
                  src="https://cdn.simpleicons.org/shopify/7AB55C"
                  alt="E-commerce"
                  className="w-3.5 h-3.5"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground flex items-center gap-1">
                  E-commerce
                  {expandedIntegration === "ecommerce" ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Shopify, WooCommerce...
                </div>
              </div>
            </button>

            {expandedIntegration === "ecommerce" && (
              <div className="ml-8 mt-0.5 mb-1 space-y-0.5">
                {ecommerceIntegrations.map((integration) => (
                  <button
                    key={integration.id}
                    className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                    onClick={() => onAddWorkflowElement?.(integration.id)}
                  >
                    <img
                      src={integration.icon}
                      alt={integration.name}
                      className="w-3.5 h-3.5 rounded-[2px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span>{integration.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Communication */}
            <button
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left"
              onClick={() =>
                setExpandedIntegration((prev) => (prev === "communication" ? null : "communication"))
              }
            >
              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground flex items-center gap-1">
                  Communication
                  {expandedIntegration === "communication" ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Intercom, Zendesk, Crisp...
                </div>
              </div>
            </button>

            {expandedIntegration === "communication" && (
              <div className="ml-8 mt-0.5 mb-1 space-y-0.5">
                {communicationIntegrations.map((integration) => (
                  <button
                    key={integration.id}
                    className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                    onClick={() => onAddWorkflowElement?.(integration.id)}
                  >
                    <img
                      src={integration.icon}
                      alt={integration.name}
                      className="w-3.5 h-3.5 rounded-[2px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span>{integration.name}</span>
                  </button>
                ))}
                <button
                  className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                  onClick={() => onAddWorkflowElement?.("email")}
                >
                  <img
                    src="https://cdn.simpleicons.org/gmail"
                    alt="Email"
                    className="w-3.5 h-3.5 rounded-[2px]"
                  />
                  <span>Email notification</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                  onClick={() => onAddWorkflowElement?.("slack")}
                >
                  <img
                    src="https://cdn.simpleicons.org/slack"
                    alt="Slack"
                    className="w-3.5 h-3.5 rounded-[2px]"
                  />
                  <span>Slack message</span>
                </button>
              </div>
            )}

            {/* Webhooks */}
            <button
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left"
              onClick={() =>
                setExpandedIntegration((prev) => (prev === "webhooks" ? null : "webhooks"))
              }
            >
              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <Webhook className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground flex items-center gap-1">
                  Webhooks
                  {expandedIntegration === "webhooks" ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Connect with any app
                </div>
              </div>
            </button>
            {expandedIntegration === "webhooks" && (
              <div className="ml-8 mt-0.5 mb-1 space-y-0.5">
                <button
                  className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                  onClick={() => onAddWorkflowElement?.("webhook")}
                >
                  <Webhook className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Custom webhook</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer with add button */}
      <div className="p-2 border-t border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full gap-1.5 h-7 text-xs justify-start px-2"
          onClick={() => onAddWorkflowElement?.('custom')}
        >
          <Play className="h-3 w-3" />
          Add action
        </Button>
      </div>
    </div>
  );
};
