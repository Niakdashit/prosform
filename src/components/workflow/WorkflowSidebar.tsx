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
  Webhook
} from "lucide-react";

interface WorkflowSidebarProps {
  onAddWorkflowElement?: (type: string) => void;
}

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

        {/* Integrations section (Connect / Messages / Contacts / Webhooks) */}
        <div className="p-2 mt-2 pb-4">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-2">
            Integrations
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
                <div className="text-xs font-medium text-foreground">Connect</div>
                <div className="text-[10px] text-muted-foreground">
                  Connect Google Sheets, Airtable...
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
              </div>
            )}

            <button
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left"
              onClick={() =>
                setExpandedIntegration((prev) => (prev === "messages" ? null : "messages"))
              }
            >
              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground">Messages</div>
                <div className="text-[10px] text-muted-foreground">
                  Send email or Slack notifications
                </div>
              </div>
            </button>

            {expandedIntegration === "messages" && (
              <div className="ml-8 mt-0.5 mb-1 space-y-0.5">
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

            <button
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left"
              onClick={() =>
                setExpandedIntegration((prev) => (prev === "contacts" ? null : "contacts"))
              }
            >
              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground">Contacts</div>
                <div className="text-[10px] text-muted-foreground">
                  Create or update your contacts
                </div>
              </div>
            </button>

            {expandedIntegration === "contacts" && (
              <div className="ml-8 mt-0.5 mb-1 space-y-0.5">
                <button
                  className="w-full flex items-center gap-2 text-[11px] text-foreground px-1 py-1 rounded hover:bg-accent/70"
                  onClick={() => onAddWorkflowElement?.("contacts-sync")}
                >
                  <img
                    src="https://cdn.simpleicons.org/microsoftexcel"
                    alt="Excel"
                    className="w-3.5 h-3.5 rounded-[2px]"
                  />
                  <span>Sync contacts</span>
                </button>
              </div>
            )}

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
                <div className="text-xs font-medium text-foreground">Webhooks</div>
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
