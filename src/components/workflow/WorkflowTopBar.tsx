import { Button } from "@/components/ui/button";
import { Play, X, Copy, Settings } from "lucide-react";

interface WorkflowTopBarProps {
  activeWorkflowTab?: string;
  onTabChange?: (tab: string) => void;
}

const workflowTabs = [
  { id: 'branching', label: 'Branching' },
  { id: 'scoring', label: 'Scoring' },
  { id: 'tagging', label: 'Tagging' },
  { id: 'outcome-quiz', label: 'Outcome quiz' }
];

export const WorkflowTopBar = ({ 
  activeWorkflowTab = 'branching',
  onTabChange 
}: WorkflowTopBarProps) => {
  return (
    <div className="h-10 bg-card border-b border-border flex items-center justify-between px-3">
      {/* Left: Workflow tabs */}
      <div className="flex items-center gap-1">
        {workflowTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeWorkflowTab === tab.id ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs px-3"
            onClick={() => onTabChange?.(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Play className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <X className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
