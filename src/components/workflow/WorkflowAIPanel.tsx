import { useState } from "react";
import { Send, Mic } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const WorkflowAIPanel = () => {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setExpanded(true);
    setInput("");
    setMessages([userMessage, { id: `m-thinking-${Date.now()}`, role: "assistant", content: "Thinking..." }]);
  };

  // Version compacte : uniquement le champ en bas
  if (!expanded) {
    return (
      <div className="pointer-events-auto w-[380px] max-w-full">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-primary/30 bg-background/80 p-[3px]"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-background px-3 h-10">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
            >
              <Mic className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-border" />
            <input
              className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground"
              placeholder="Chat to create"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Version ouverte : carte complète avec historique
  return (
    <div className="pointer-events-auto w-[520px] max-w-full rounded-2xl border border-border bg-background shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary">
            AI
          </div>
          <span className="font-medium text-foreground">Workflow AI</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Beta</span>
        </div>
      </div>

      {/* Messages */}
      <div className="px-4 pt-3 pb-2 space-y-2 max-h-64 overflow-y-auto text-xs bg-background">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "self-end inline-flex max-w-[85%] rounded-xl bg-primary/5 px-3 py-2 text-foreground"
                : "self-start inline-flex max-w-[85%] rounded-xl bg-muted px-3 py-2 text-muted-foreground"
            }
          >
            {m.content}
          </div>
        ))}
      </div>

      {/* Input en bas de la carte */}
      <form onSubmit={handleSubmit} className="px-3 pb-3 pt-1">
        <div className="rounded-2xl border border-primary/30 bg-background/80 p-[3px]">
          <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-background px-3 h-10">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
            >
              <Mic className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-border" />
            <input
              className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground"
              placeholder="Chat to create"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
