import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, LucideIcon, GitBranch, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkflowNode {
  id: string;
  type: 'start' | 'action' | 'condition' | 'end';
  label: string;
  icon?: LucideIcon;
  color?: string;
  position: { x: number; y: number };
  connections?: string[];
}

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  onAddNode?: (afterNodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string;
  onNodePositionChange?: (id: string, position: { x: number; y: number }) => void;
  onManageBranching?: (nodeId: string) => void;
  onManageScoring?: (nodeId: string) => void;
}

export const WorkflowCanvas = ({ 
  nodes, 
  onAddNode, 
  onDeleteNode,
  onNodeClick,
  selectedNodeId,
  onNodePositionChange,
  onManageBranching,
  onManageScoring,
}: WorkflowCanvasProps) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredControl, setHoveredControl] = useState<null | { nodeId: string; type: "branching" | "scoring" }>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  const getNodeIcon = (node: WorkflowNode) => {
    if (node.icon) {
      const Icon = node.icon;
      return (
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", node.color)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      );
    }
    return null;
  };

  // Gestion globale du drag pour suivre la souris même en dehors du nœud
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (draggingId && dragOffset && onNodePositionChange && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left - dragOffset.x;
        const y = event.clientY - rect.top - dragOffset.y;
        onNodePositionChange(draggingId, { x, y });
      } else if (isPanning && panStart && containerRef.current) {
        const dx = event.clientX - panStart.x;
        const dy = event.clientY - panStart.y;
        containerRef.current.scrollLeft = panStart.scrollLeft - dx;
        containerRef.current.scrollTop = panStart.scrollTop - dy;
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      setDragOffset(null);
      setIsPanning(false);
      setPanStart(null);
    };

    if (draggingId || isPanning) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, dragOffset, isPanning, panStart, onNodePositionChange]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-white overflow-auto"
      style={{
      backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}
      onMouseDown={(e) => {
        // clic gauche seulement, les nœuds stoppent déjà la propagation
        if (e.button !== 0 || !containerRef.current) return;
        setIsPanning(true);
        setPanStart({
          x: e.clientX,
          y: e.clientY,
          scrollLeft: containerRef.current.scrollLeft,
          scrollTop: containerRef.current.scrollTop,
        });
      }}
    >
      <div className="absolute inset-0 p-8">
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {nodes.map((node) => {
            if (!node.connections) return null;
            return node.connections.map((targetId) => {
              const targetNode = nodes.find((n) => n.id === targetId);
              if (!targetNode) return null;

              const startX = node.position.x + 30;
              const startY = node.position.y + 25;
              const endX = targetNode.position.x + 30;
              const endY = targetNode.position.y + 25;

              const verticalDistance = Math.abs(endY - startY);
              const controlOffset = Math.min(verticalDistance / 2, 60);

              return (
                <g key={`${node.id}-${targetId}`}>
                  <path
                    d={`M ${startX} ${startY} C ${startX} ${startY + controlOffset}, ${endX} ${endY - controlOffset}, ${endX} ${endY}`}
                    stroke="#D1D5DB"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx={endX} cy={endY} r={3} fill="#D1D5DB" />
                </g>
              );
            });
          })}
        </svg>

        {/* Workflow nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: node.position.x,
              top: node.position.y,
              zIndex: 1,
            }}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
          >
            {/* Node container */}
            <div
              className={cn(
                "relative w-[60px] h-[50px] rounded-lg border bg-white cursor-pointer transition-all flex flex-col items-center justify-center gap-0.5",
                selectedNodeId === node.id && "ring-2 ring-blue-500",
                hoveredNodeId === node.id ? "shadow-md" : "shadow-sm"
              )}
              onClick={() => onNodeClick?.(node.id)}
              onMouseDown={(e) => {
                // clic gauche uniquement
                if (e.button !== 0) return;
                e.stopPropagation();
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                setDraggingId(node.id);
                setDragOffset({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
            >
              {/* Delete button */}
              {node.type !== 'start' && node.type !== 'end' && hoveredNodeId === node.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 rounded-full bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNode?.(node.id);
                  }}
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              )}

              {/* Node content */}
              {getNodeIcon(node)}
              <div className="text-[10px] font-medium text-gray-700 text-center leading-tight">
                {node.label}
              </div>

              {selectedNodeId === node.id && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
                  <div className="flex items-center rounded-2xl bg-gray-50 border border-gray-200 px-1.5 py-1 shadow-sm">
                    <button
                      className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                      onMouseEnter={() => setHoveredControl({ nodeId: node.id, type: "branching" })}
                      onMouseLeave={() => setHoveredControl((prev) => (prev?.nodeId === node.id && prev.type === "branching" ? null : prev))}
                      onClick={(e) => {
                        e.stopPropagation();
                        onManageBranching?.(node.id);
                      }}
                    >
                      <GitBranch className="w-3.5 h-3.5 text-gray-700" />
                    </button>
                    <div className="w-px h-5 bg-gray-200 mx-1" />
                    <button
                      className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                      onMouseEnter={() => setHoveredControl({ nodeId: node.id, type: "scoring" })}
                      onMouseLeave={() => setHoveredControl((prev) => (prev?.nodeId === node.id && prev.type === "scoring" ? null : prev))}
                      onClick={(e) => {
                        e.stopPropagation();
                        onManageScoring?.(node.id);
                      }}
                    >
                      <Calculator className="w-3.5 h-3.5 text-gray-700" />
                    </button>
                  </div>

                  {hoveredControl?.nodeId === node.id && (
                    <div className="relative mt-1 rounded-full bg-[#3F3744] text-white text-[11px] px-3 py-1.5 leading-none whitespace-nowrap">
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#3F3744] rotate-45" />
                      {hoveredControl.type === "branching" ? "Manage branching" : "Manage scoring"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
