import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Grid3x3,
  Plus,
  Mail,
  MessageSquare,
  Users,
  Webhook
} from "lucide-react";

interface WorkflowActionsPanelProps {
  onAddAction?: (type: string) => void;
}

const actionCategories = [
  {
    id: 'connect',
    label: 'Connect',
    icon: Grid3x3,
    iconColor: 'text-gray-600',
    items: [
      { id: 'google-sheets', label: 'Google Sheets', icon: '📊' },
      { id: 'airtable', label: 'Airtable', icon: '🔶' },
      { id: 'zapier', label: 'Zapier', icon: '⚡' }
    ]
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    iconColor: 'text-gray-600',
    items: [
      { id: 'email', label: 'Email notification', icon: '📧' },
      { id: 'slack', label: 'Slack message', icon: '💬' }
    ]
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: Users,
    iconColor: 'text-gray-600',
    description: 'Map form responses to create or update your contacts.',
    items: []
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    icon: Webhook,
    iconColor: 'text-gray-600',
    description: 'Connect with any app to send automatic or trigger actions.',
    items: []
  }
];

export const WorkflowActionsPanel = ({ onAddAction }: WorkflowActionsPanelProps) => {
  return (
    <div className="w-64 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Actions</h3>
      </div>

      {/* Actions list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {actionCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.id} className="space-y-2">
                {/* Category header */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground">
                      {category.label}
                    </div>
                    {category.description && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                        {category.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category items */}
                {category.items.length > 0 ? (
                  <div className="space-y-0.5 pl-9">
                    {category.items.map((item) => {
                      return (
                        <button
                          key={item.id}
                          className="w-full flex items-center gap-1.5 p-1.5 rounded hover:bg-accent transition-colors text-left"
                          onClick={() => onAddAction?.(item.id)}
                        >
                          <span className="text-sm">{item.icon}</span>
                          <span className="text-xs text-foreground flex-1">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pl-9">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-1.5 h-6 text-xs justify-start px-1.5"
                      onClick={() => onAddAction?.(category.id)}
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
