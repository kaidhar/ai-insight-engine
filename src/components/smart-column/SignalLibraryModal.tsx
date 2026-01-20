import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, X, Search } from "lucide-react";

export interface SignalLibraryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  template?: string;
}

interface SignalLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (signal: SignalLibraryItem) => void;
}

const SIGNAL_LIBRARY: SignalLibraryItem[] = [
  {
    id: "funding-recent",
    name: "Recent Funding Event",
    category: "Funding",
    description: "Detect if the company raised funding in the last 12 months.",
    template: "Research: Recent Funding Event — has the company raised funding in the last 12 months?"
  },
  {
    id: "tech-stack",
    name: "Primary Tech Stack",
    category: "Technology",
    description: "Identify the main technologies used by the company."
  },
  {
    id: "hiring-growth",
    name: "Hiring Growth",
    category: "Hiring",
    description: "Check if hiring velocity has increased in the last 90 days."
  },
  {
    id: "intent-buying",
    name: "Buying Intent",
    category: "Intent",
    description: "Detect intent signals indicating active purchase evaluation."
  },
  {
    id: "leadership-change",
    name: "Leadership Change",
    category: "Org",
    description: "Identify recent executive or leadership changes."
  },
  {
    id: "product-launch",
    name: "Product Launch",
    category: "Product",
    description: "Detect recent product or feature launches."
  }
];

const SignalLibraryModal = ({ open, onClose, onSelect }: SignalLibraryModalProps) => {
  const [query, setQuery] = useState("");

  const filteredSignals = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return SIGNAL_LIBRARY;
    return SIGNAL_LIBRARY.filter((signal) =>
      [signal.name, signal.category, signal.description].some((value) =>
        value.toLowerCase().includes(needle)
      )
    );
  }, [query]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]" onClick={onClose} />
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
        <div className="w-full max-w-4xl max-h-[85vh] rounded-3xl border-2 border-border bg-background shadow-2xl flex flex-col">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Research Templates</h2>
                <p className="text-sm text-muted-foreground">5,500+ research templates</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-secondary">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-6 py-4 border-b border-border">
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates by name, category, or intent..."
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 grid gap-3 md:grid-cols-2">
              {filteredSignals.map((signal) => (
                <button
                  key={signal.id}
                  onClick={() => onSelect(signal)}
                  className="rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{signal.name}</h3>
                    <Badge variant="secondary" className="text-[10px]">{signal.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{signal.description}</p>
                </button>
              ))}

              {filteredSignals.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground md:col-span-2">
                  No templates match that search yet.
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Tip: choose a template to insert it directly into your prompt.</span>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              View all templates
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignalLibraryModal;
