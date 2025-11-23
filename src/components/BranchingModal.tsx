import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface BranchingRule {
  id: string;
  condition: {
    questionId: string;
    operator: string;
    value: string;
  };
  action: {
    type: string;
    targetQuestionId: string;
  };
}

interface BranchingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionTitle: string;
  questionId: string;
  choices: string[];
  availableQuestions: { id: string; title: string; number: string }[];
}

export const BranchingModal = ({ 
  open, 
  onOpenChange, 
  questionTitle,
  questionId,
  choices,
  availableQuestions 
}: BranchingModalProps) => {
  const [rules, setRules] = useState<BranchingRule[]>([]);
  const [defaultAction, setDefaultAction] = useState<string>("");

  const addRule = () => {
    const newRule: BranchingRule = {
      id: Math.random().toString(36).substr(2, 9),
      condition: {
        questionId: questionId,
        operator: "is",
        value: choices[0] || ""
      },
      action: {
        type: "goto",
        targetQuestionId: ""
      }
    };
    setRules([...rules, newRule]);
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const updateRule = (ruleId: string, field: string, value: string) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        if (field === "value") {
          return { ...rule, condition: { ...rule.condition, value } };
        } else if (field === "target") {
          return { ...rule, action: { ...rule.action, targetQuestionId: value } };
        }
      }
      return rule;
    }));
  };

  const handleSave = () => {
    // Save logic here
    console.log("Rules:", rules, "Default:", defaultAction);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: '#3D3731' }}>
            Edit logic for <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm" style={{ backgroundColor: '#F5F3F0', color: '#6B6254' }}>
              {questionTitle}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* See all rules link */}
          <button 
            className="text-sm flex items-center gap-2 hover:underline"
            style={{ color: '#6B6254' }}
          >
            <span>⚡</span> See all rules
          </button>

          {/* Rules */}
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4" style={{ borderColor: '#E5E5E5' }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    {/* Condition */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: '#6B6254' }}>If</span>
                      <Select value="is">
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="is">is</SelectItem>
                          <SelectItem value="is_not">is not</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={rule.condition.value} 
                        onValueChange={(value) => updateRule(rule.id, "value", value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {choices.map((choice, index) => (
                            <SelectItem key={index} value={choice}>
                              {String.fromCharCode(65 + index)} {choice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <button 
                      className="text-xs flex items-center gap-1 hover:underline"
                      style={{ color: '#6B6254' }}
                    >
                      <Plus className="w-3 h-3" /> Add condition
                    </button>

                    {/* Action */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: '#6B6254' }}>Then</span>
                      <Select value="goto">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="goto">Go to</SelectItem>
                          <SelectItem value="skip">Skip to</SelectItem>
                          <SelectItem value="end">End form</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={rule.action.targetQuestionId}
                        onValueChange={(value) => updateRule(rule.id, "target", value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableQuestions.map((q) => (
                            <SelectItem key={q.id} value={q.id}>
                              {q.number} {q.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <button 
                      onClick={() => deleteRule(rule.id)}
                      className="text-xs flex items-center gap-1 hover:underline"
                      style={{ color: '#EF4444' }}
                    >
                      <Trash2 className="w-3 h-3" /> Delete rule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add rule button */}
          <button
            onClick={addRule}
            className="text-sm flex items-center gap-2 hover:underline"
            style={{ color: '#6B6254' }}
          >
            <Plus className="w-4 h-4" /> Add rule
          </button>

          {/* Default action */}
          <div className="border-t pt-4" style={{ borderColor: '#E5E5E5' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium" style={{ color: '#6B6254' }}>All other cases go to</span>
              <Select value={defaultAction} onValueChange={setDefaultAction}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Next question</SelectItem>
                  {availableQuestions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.number} {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Delete all rules */}
          <button
            onClick={() => setRules([])}
            className="text-sm flex items-center gap-2 hover:underline"
            style={{ color: '#EF4444' }}
          >
            <Trash2 className="w-4 h-4" /> Delete all rules
          </button>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            style={{ color: '#6B6254', borderColor: '#E5E5E5' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            style={{ backgroundColor: '#F5B800', color: '#3D3731' }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
