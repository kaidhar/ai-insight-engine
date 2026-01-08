import { Button } from "@/components/ui/button";
import { X, Zap, Crown, TrendingUp, DollarSign } from "lucide-react";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

const InfoModal = ({ open, onClose }: InfoModalProps) => {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[61] p-4 pointer-events-none">
        <div className="bg-background rounded-2xl shadow-2xl border-2 border-border w-full max-w-3xl max-h-[90vh] flex flex-col my-auto pointer-events-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    How Smart Search Works
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Intelligent two-tier system for optimal cost and quality
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Overview */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Two-Tier Intelligence System
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Smart Search uses a two-tier system to give you the best balance of cost
                and quality. We automatically try the faster, cheaper option first and
                upgrade only when needed for better results.
              </p>
            </div>

            {/* Tier 1: Fast Search */}
            <div className="p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-semibold text-foreground">
                  Tier 1: Fast Search
                </h4>
                <span className="ml-auto px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-medium">
                  1 credit
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Quick web search optimized for straightforward queries
                </p>

                <div className="space-y-2">
                  <p className="font-medium text-foreground">How it works:</p>
                  <ul className="space-y-1.5 text-muted-foreground ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                      <span>Searches web for relevant information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                      <span>Gathers data from multiple sources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                      <span>Provides clear, structured answers</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-foreground">Best for:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-background border border-emerald-200 dark:border-emerald-800 text-xs">
                      "Did they raise funding?"
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-background border border-emerald-200 dark:border-emerald-800 text-xs">
                      "Who is the CEO?"
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-background border border-emerald-200 dark:border-emerald-800 text-xs">
                      "Recent news about company"
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tier 2: Deep Search */}
            <div className="p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-foreground">
                  Tier 2: Deep Search
                </h4>
                <span className="ml-auto px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-xs font-medium">
                  6 credits
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  AI-powered intelligent research with reasoning capabilities
                </p>

                <div className="space-y-2">
                  <p className="font-medium text-foreground">How it works:</p>
                  <ul className="space-y-1.5 text-muted-foreground ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>AI-powered intelligent research</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>Reasons across multiple data points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>Answers complex, multi-part questions</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-foreground">Best for:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-background border border-purple-200 dark:border-purple-800 text-xs">
                      "Analyze competitive position"
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-background border border-purple-200 dark:border-purple-800 text-xs">
                      "Compare strategies"
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-background border border-purple-200 dark:border-purple-800 text-xs">
                      "What's the likelihood..."
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto Mode Explanation */}
            <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">In Auto Mode:</h4>
              </div>

              <ol className="space-y-2 text-sm text-muted-foreground ml-4">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span>Always start with <span className="font-medium text-foreground">Fast Search</span> (cheaper)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span>Evaluate if the answer is complete and accurate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  <span>Upgrade to <span className="font-medium text-foreground">Deep Search</span> only if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">4.</span>
                  <span>Show you exactly which tier was used</span>
                </li>
              </ol>

              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-foreground text-center">
                  💰 You only pay for what you use!
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Average savings: 40-60% compared to always using Deep Search
                </p>
              </div>
            </div>

            {/* Example Scenario */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Example Scenario
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Query:</span> "Did {'{COMPANY_NAME}'} raise funding recently?"
                </p>
                <div className="pl-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">→</span>
                    <p>
                      <span className="font-medium text-foreground">Step 1:</span> Fast Search finds: "Yes, $50M Series B"
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">→</span>
                    <p>
                      <span className="font-medium text-foreground">Step 2:</span> System evaluates: High confidence, complete answer
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    <p>
                      <span className="font-medium text-foreground">Result:</span> Uses Fast Search only - <span className="font-semibold text-emerald-600 dark:text-emerald-400">1 credit</span> (saved 5 credits!)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-end flex-shrink-0">
            <Button onClick={onClose} className="gap-2">
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoModal;
