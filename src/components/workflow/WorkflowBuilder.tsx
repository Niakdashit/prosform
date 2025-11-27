import { useState } from "react";
import { WorkflowCanvas, WorkflowNode } from "./WorkflowCanvas";
import { WorkflowSidebar } from "./WorkflowSidebar";
import { WorkflowAIPanel } from "./WorkflowAIPanel";
import { WorkflowTopBar } from "./WorkflowTopBar";
import { Question } from "../FormBuilder";
import { getQuestionIcon } from "@/lib/questionIcons";
import { Plus, Wrench, Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WorkflowBuilderProps {
  questions?: Question[];
}

export const WorkflowBuilder = ({ questions = [] }: WorkflowBuilderProps) => {
  // Convert questions to workflow nodes
  const questionsToNodes = (questions: Question[]): WorkflowNode[] => {
    if (questions.length === 0) return [];

    return questions.map((q, index) => {
      const baseX = 140;
      const baseY = 140;
      const horizontalSpacing = 90;

      // Layout en ligne parfaitement droite, comme sur Typeform
      const questionIcon = getQuestionIcon(q);

      return {
        id: q.id,
        type: q.type === 'welcome' ? 'start' : q.type === 'ending' ? 'end' : 'action',
        label: q.number ? `${q.number}` : q.title.substring(0, 8),
        icon: questionIcon.icon,
        color: questionIcon.color,
        position: {
          x: baseX + index * horizontalSpacing,
          y: baseY,
        },
        connections: index < questions.length - 1 ? [questions[index + 1].id] : undefined,
      } as WorkflowNode;
    });
  };

  const [nodes, setNodes] = useState<WorkflowNode[]>(questionsToNodes(questions));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('branching');
  const [branchingNodeId, setBranchingNodeId] = useState<string | null>(null);
  const [showBranchingRules, setShowBranchingRules] = useState(false);

  const handleAddNode = (afterNodeId: string) => {
    const afterNode = nodes.find(n => n.id === afterNodeId);
    if (!afterNode) return;

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: 'action',
      label: 'New action',
      icon: Plus,
      position: { 
        x: afterNode.position.x, 
        y: afterNode.position.y + 80 
      },
      connections: afterNode.connections
    };

    setNodes(prev => {
      const updated = prev.map(n => {
        if (n.id === afterNodeId) {
          return { ...n, connections: [newNode.id] };
        }
        return n;
      });
      return [...updated, newNode];
    });

    toast.success("Node added to workflow");
  };

  const handleDeleteNode = (nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete || nodeToDelete.type === 'start') {
      toast.error("Cannot delete this node");
      return;
    }

    setNodes(prev => {
      // Find the node that connects to the deleted node
      const parentNode = prev.find(n => n.connections?.includes(nodeId));
      
      // Update connections
      const updated = prev.map(n => {
        if (n.id === parentNode?.id) {
          return { 
            ...n, 
            connections: nodeToDelete.connections || [] 
          };
        }
        return n;
      }).filter(n => n.id !== nodeId);

      return updated;
    });

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }

    toast.success("Node deleted from workflow");
  };

  const handleAddWorkflowElement = (type: string) => {
    const elementLabels: { [key: string]: string } = {
      'branching': 'Branching logic',
      'scoring': 'Score calculation',
      'tagging': 'Tag assignment',
      'outcome-quiz': 'Outcome quiz',
      'custom': 'Custom action',
      'pull-data': 'Pull data in'
    };

    const label = elementLabels[type] || 'New element';
    
    // Add to the end of the workflow
    const lastNode = nodes[nodes.length - 1];
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: 'action',
      label,
      icon: Wrench,
      position: { 
        x: lastNode.position.x, 
        y: lastNode.position.y + 80 
      }
    };

    setNodes(prev => {
      const updated = prev.map((n, idx) => {
        if (idx === prev.length - 1) {
          return { ...n, connections: [newNode.id] };
        }
        return n;
      });
      return [...updated, newNode];
    });

    toast.success(`${label} added to workflow`);
  };

  const handleAddAction = (type: string) => {
    const actionLabels: { [key: string]: string } = {
      'google-sheets': 'Google Sheets',
      'airtable': 'Airtable',
      'zapier': 'Zapier',
      'email': 'Email notification',
      'slack': 'Slack message',
      'contacts': 'Update contacts',
      'webhooks': 'Webhook trigger'
    };

    const label = actionLabels[type] || 'New action';
    
    // Add to the end of the workflow
    const lastNode = nodes[nodes.length - 1];
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: 'action',
      label,
      icon: Settings2,
      position: { 
        x: lastNode.position.x, 
        y: lastNode.position.y + 80 
      }
    };

    setNodes(prev => {
      const updated = prev.map((n, idx) => {
        if (idx === prev.length - 1) {
          return { ...n, connections: [newNode.id] };
        }
        return n;
      });
      return [...updated, newNode];
    });

    toast.success(`${label} added to workflow`);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <WorkflowTopBar 
        activeWorkflowTab={activeWorkflowTab}
        onTabChange={setActiveWorkflowTab}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar onAddWorkflowElement={handleAddWorkflowElement} />

        <div className="flex-1 relative flex flex-col overflow-hidden">
          <WorkflowCanvas
            nodes={nodes}
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onNodeClick={setSelectedNodeId}
            selectedNodeId={selectedNodeId || undefined}
            onNodePositionChange={(id, position) => {
              setNodes(prev => prev.map(node =>
                node.id === id ? { ...node, position } : node
              ));
            }}
            onManageBranching={(id) => {
              setShowBranchingRules(false);
              setBranchingNodeId(id);
            }}
            onManageScoring={(_id) => {
              // placeholder pour plus tard
            }}
          />

          <div className="absolute left-1/2 -translate-x-1/2 bottom-6">
            <WorkflowAIPanel />
          </div>
        </div>
      </div>

      {/* Branching logic modal */}
      <Dialog
        open={!!branchingNodeId}
        onOpenChange={(open) => {
          if (!open) {
            setBranchingNodeId(null);
            setShowBranchingRules(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl p-0">
          {branchingNodeId && (() => {
            const node = nodes.find(n => n.id === branchingNodeId);
            const question = questions.find(q => q.id === branchingNodeId);
            const iconInfo = question ? getQuestionIcon(question) : null;
            const Icon = iconInfo?.icon;

            return (
              <div className="flex flex-col">
                <DialogHeader className="px-6 pt-5 pb-3 border-b border-border flex flex-row items-center justify-between">
                  <DialogTitle className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-xs text-muted-foreground mr-1">Logic</span>
                    {Icon && iconInfo && (
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold",
                          iconInfo.color
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span>{question?.title || node?.label}</span>
                  </DialogTitle>
                </DialogHeader>

                <div className="px-6 py-4">
                  {!showBranchingRules ? (
                    <div className="border border-border rounded-xl bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Always go to</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-8 px-3 rounded-md border border-border bg-background flex items-center text-xs text-muted-foreground">
                            Select…
                          </div>
                        </div>
                      </div>
                      <button
                        className="text-xs text-primary mt-2"
                        onClick={() => setShowBranchingRules(true)}
                      >
                        + Add rule
                      </button>
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl bg-muted/30 p-4 space-y-4 text-xs">
                      {/* Rule header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">If</span>
                          {Icon && iconInfo && (
                            <div
                              className={cn(
                                "h-6 px-2 rounded-full flex items-center gap-1 text-[11px]",
                                iconInfo.color
                              )}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{question?.number}</span>
                            </div>
                          )}
                          <span>{question?.title}</span>
                        </div>
                      </div>

                      {/* Condition row */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-8 px-2 rounded-md border border-border bg-background flex items-center justify-between">
                            <span>If</span>
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 h-8 px-3 rounded-md border border-border bg-background flex items-center justify-between">
                              <span className="text-muted-foreground">Select condition…</span>
                            </div>
                            <button className="text-[11px] text-primary">+ Add condition</button>
                          </div>
                        </div>

                        {/* Then row */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-muted-foreground">Then</span>
                          <div className="w-28 h-8 px-2 rounded-md border border-border bg-background flex items-center text-[11px]">
                            Go to
                          </div>
                          <div className="flex-1 h-8 px-3 rounded-md border border-border bg-background flex items-center text-[11px] text-muted-foreground">
                            Select…
                          </div>
                        </div>

                        <button className="text-[11px] text-destructive mt-3">Delete rule</button>
                      </div>

                      {/* All other cases */}
                      <div className="mt-4 pt-3 border-t border-border space-y-2">
                        <div className="text-muted-foreground">All other cases go to</div>
                        <div className="w-60 h-8 px-3 rounded-md border border-border bg-background flex items-center text-[11px] text-muted-foreground">
                          Select…
                        </div>
                        <button className="text-[11px] text-primary mt-1">+ Add rule</button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 text-xs">
                    <button className="text-destructive/80">Delete all rules</button>
                    <div className="flex items-center gap-2">
                      <button
                        className="h-8 px-3 rounded-md border border-border text-xs"
                        onClick={() => setBranchingNodeId(null)}
                      >
                        Cancel
                      </button>
                      <button className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};
