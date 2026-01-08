import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles, X, ChevronLeft, ChevronRight, PlayCircle, Zap, Crown, Info, CheckCircle2 } from "lucide-react";
import PromptBuilder from "./smart-column/PromptBuilder";
import PreviewSystem from "./smart-column/PreviewSystem";
import ExecutionMonitor from "./smart-column/ExecutionMonitor";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import BudgetControl from "./smart-search/BudgetControl";
import InfoModal from "./smart-search/InfoModal";
import CostBreakdown from "./smart-search/CostBreakdown";
import { BudgetMode } from "@/services/smart-search/enrichment-orchestrator";
import { analyzeQueryComplexity } from "@/services/smart-search/query-complexity-analyzer";

interface SmartColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "configure" | "confirm" | "execute";

const MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    credits: 10,
    icon: Sparkles,
    description: "Most capable model"
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    credits: 8,
    icon: Zap,
    description: "Fast and efficient"
  },
  {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    credits: 15,
    icon: Crown,
    description: "Premium reasoning"
  },
];

const SmartColumnModal = ({ open, onOpenChange }: SmartColumnModalProps) => {
  const [currentStep, setCurrentStep] = useState<Step>("configure");
  const [prompt, setPrompt] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [enrichmentScope, setEnrichmentScope] = useState("all");
  const [customCount, setCustomCount] = useState("100");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");

  // Smart Search state
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("auto");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [queryComplexity, setQueryComplexity] = useState<'simple' | 'medium' | 'complex' | undefined>();

  // Preview state
  const [showPreviewSidebar, setShowPreviewSidebar] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Preview results with tier information
  const [previewResults, setPreviewResults] = useState<Array<{
    accountName: string;
    tierUsed: 'tier1_fast' | 'tier2_deep';
    cost: number;
    answer: string;
    upgradeReason?: string;
  }>>([]);

  // Output configuration state - auto-detected after preview
  const [detectedFields, setDetectedFields] = useState([
    { name: "indian_origin", type: "text", sample: "Yes" },
    { name: "confidence", type: "text", sample: "High" },
  ]);

  const isPromptValid = prompt.trim().length > 0 && selectedColumns.length > 0;

  const handleNext = () => {
    if (currentStep === "configure") {
      setCurrentStep("confirm");
    } else if (currentStep === "confirm") {
      setCurrentStep("execute");
    }
  };

  const handleBack = () => {
    if (currentStep === "confirm") {
      setCurrentStep("configure");
    } else if (currentStep === "execute") {
      setCurrentStep("confirm");
    }
  };

  const handlePreview = () => {
    setIsLoadingPreview(true);

    // Analyze query complexity
    const complexity = analyzeQueryComplexity(prompt);
    setQueryComplexity(complexity.level);

    setTimeout(() => {
      setIsLoadingPreview(false);
      setShowPreviewSidebar(true);

      // Simulate Smart Search preview with mixed tier usage
      // Based on budget mode and query complexity
      const mockPreviewResults = generateMockPreviewResults(
        prompt,
        budgetMode,
        complexity.level
      );
      setPreviewResults(mockPreviewResults);

      // Auto-detect fields from preview
      setDetectedFields([
        { name: "indian_origin", type: "text", sample: "Yes" },
        { name: "confidence", type: "text", sample: "High" },
      ]);
    }, 2000);
  };

  // Generate mock preview results based on query and budget mode
  const generateMockPreviewResults = (
    query: string,
    mode: BudgetMode,
    complexity: 'simple' | 'medium' | 'complex'
  ) => {
    const mockAccounts = [
      "TechCorp Inc.",
      "DataFlow Systems",
      "CloudVision Ltd.",
      "InnovateLabs",
      "FutureStack"
    ];

    return mockAccounts.map((accountName, index) => {
      // Determine tier based on mode and complexity
      let tierUsed: 'tier1_fast' | 'tier2_deep';
      let upgradeReason: string | undefined;

      if (mode === 'fast_only') {
        tierUsed = 'tier1_fast';
      } else if (mode === 'deep_only') {
        tierUsed = 'tier2_deep';
      } else {
        // Auto mode - simulate intelligent tier selection
        if (complexity === 'complex') {
          // Complex queries mostly use Deep Search
          tierUsed = index < 4 ? 'tier2_deep' : 'tier1_fast';
          if (tierUsed === 'tier2_deep') {
            upgradeReason = 'Complex query detected - used Deep Search directly';
          }
        } else if (complexity === 'medium') {
          // Medium complexity - mixed usage
          tierUsed = index % 2 === 0 ? 'tier1_fast' : 'tier2_deep';
          if (tierUsed === 'tier2_deep') {
            upgradeReason = 'Fast search found basic info, but query needs more analysis';
          }
        } else {
          // Simple queries mostly use Fast Search
          tierUsed = index < 4 ? 'tier1_fast' : 'tier2_deep';
          if (tierUsed === 'tier2_deep') {
            upgradeReason = 'Insufficient detail in initial results';
          }
        }
      }

      return {
        accountName,
        tierUsed,
        cost: tierUsed === 'tier1_fast' ? 1 : 6,
        answer: `Mock result for ${accountName}`,
        upgradeReason
      };
    });
  };

  const stepTitles = {
    configure: "Configure Your AI Enrichment",
    confirm: "Confirm Enrichment Run",
    execute: "Enrichment in Progress",
  };

  const stepSubtitles = {
    configure: "Write a prompt, preview results, and configure output display",
    confirm: "Select enrichment scope and review settings",
    execute: "Processing your accounts",
  };

  const totalAccounts = 1250;
  const selectedAccounts = 45;
  const costPerAccount = 12.5;

  const getAccountCount = () => {
    if (enrichmentScope === "all") return totalAccounts;
    if (enrichmentScope === "first") return parseInt(customCount) || 100;
    return selectedAccounts;
  };

  const totalCost = currentStep === "confirm" ? getAccountCount() * costPerAccount : 0;

  return (
    <>
      <Sheet open={open} onOpenChange={(newOpen: boolean) => {
        // If preview is open, don't allow Sheet to close via its own backdrop
        if (!newOpen && showPreviewSidebar) {
          return;
        }
        onOpenChange(newOpen);
      }}>
        <SheetContent side="right" className="w-[800px] sm:max-w-[800px] p-0 overflow-hidden flex flex-col [&>button]:hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">AI Enrichment</h2>
                  <p className="text-xs text-muted-foreground">Smart Search with intelligent cost optimization</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfoModal(true)}
                  className="gap-1.5 text-primary hover:text-primary"
                >
                  <Info className="w-4 h-4" />
                  How it works
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`flex items-center gap-2 ${currentStep === "configure" ? "text-primary" : ["confirm", "execute"].includes(currentStep) ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "configure" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}>
                  1
                </div>
                <span className="text-sm font-medium">Configure</span>
              </div>

              <div className={`h-0.5 w-12 ${["confirm", "execute"].includes(currentStep) ? "bg-primary" : "bg-border"}`} />

              <div className={`flex items-center gap-2 ${currentStep === "confirm" ? "text-primary" : currentStep === "execute" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "confirm" ? "bg-primary text-primary-foreground" : currentStep === "execute" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  2
                </div>
                <span className="text-sm font-medium">Confirm</span>
              </div>

              <div className={`h-0.5 w-12 ${currentStep === "execute" ? "bg-primary" : "bg-border"}`} />

              <div className={`flex items-center gap-2 ${currentStep === "execute" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "execute" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  3
                </div>
                <span className="text-sm font-medium">Run</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">{stepTitles[currentStep]}</h3>
              <p className="text-sm text-muted-foreground mt-1">{stepSubtitles[currentStep]}</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {currentStep === "configure" && (
              <div className="p-6 space-y-4">
                {/* Combined Prompt Box with Inline Model Selector */}
                <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
                  {/* Prompt Input Area */}
                  <div className="p-4">
                    <PromptBuilder
                      value={prompt}
                      onChange={setPrompt}
                      selectedColumns={selectedColumns}
                      onColumnsChange={setSelectedColumns}
                    />
                  </div>

                  {/* Bottom Bar: Model Selector + Preview Button */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3 bg-secondary/30 border-t border-border">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-xs text-muted-foreground font-medium">Model:</span>
                      <div className="flex items-center gap-2 flex-1">
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger className="h-9 w-[160px] bg-background border border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MODELS.map((model) => {
                              const Icon = model.icon;
                              return (
                                <SelectItem key={model.id} value={model.id}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{model.name}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-0.5 text-xs font-medium">
                          {MODELS.find(m => m.id === selectedModel)?.credits || 10} credits
                        </Badge>
                      </div>
                    </div>

                    {/* Preview Button */}
                    <Button
                      onClick={handlePreview}
                      disabled={!isPromptValid || isLoadingPreview}
                      size="sm"
                      className="gap-2 bg-gradient-accent hover:shadow-glow-accent"
                    >
                      {isLoadingPreview ? (
                        <>
                          <PlayCircle className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          Preview
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Smart Search Budget Control - Compact Version */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground">
                      Budget Control
                    </Label>
                    <button
                      onClick={() => setShowInfoModal(true)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Info className="w-3 h-3" />
                      How does this work?
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Auto Mode */}
                    <button
                      onClick={() => setBudgetMode('auto')}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        budgetMode === 'auto'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Auto</span>
                        {budgetMode === 'auto' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Smart optimization
                      </p>
                      <div className="text-xs font-medium text-primary">
                        1-6 credits
                      </div>
                    </button>

                    {/* Fast Only Mode */}
                    <button
                      onClick={() => setBudgetMode('fast_only')}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        budgetMode === 'fast_only'
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                          : 'border-border bg-card hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-foreground">Fast Only</span>
                        {budgetMode === 'fast_only' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Budget-conscious
                      </p>
                      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        1 credit
                      </div>
                    </button>

                    {/* Deep Search Mode */}
                    <button
                      onClick={() => setBudgetMode('deep_only')}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        budgetMode === 'deep_only'
                          ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm'
                          : 'border-border bg-card hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Crown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-semibold text-foreground">Deep Search</span>
                        {budgetMode === 'deep_only' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Maximum quality
                      </p>
                      <div className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        6 credits
                      </div>
                    </button>
                  </div>

                  {/* Smart Recommendation */}
                  {queryComplexity && (
                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          {queryComplexity === 'simple' && (
                            <span>Simple query - Auto mode will likely use Fast Search (save up to 83%)</span>
                          )}
                          {queryComplexity === 'medium' && (
                            <span>Medium complexity - Auto mode will try Fast Search first</span>
                          )}
                          {queryComplexity === 'complex' && (
                            <span>Complex query - Auto mode will use Deep Search more often</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === "confirm" && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Configuration Summary</h3>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3 text-sm">
                    <p><span className="text-muted-foreground">Model:</span> <span className="font-medium">{MODELS.find(m => m.id === selectedModel)?.name || "GPT-4o"}</span></p>
                    <p><span className="text-muted-foreground">Budget Mode:</span> <span className="font-medium capitalize">{budgetMode === 'fast_only' ? 'Fast Only' : budgetMode === 'deep_only' ? 'Deep Search' : 'Auto (Recommended)'}</span></p>
                    <div>
                      <p className="text-muted-foreground mb-2">Output Fields:</p>
                      <div className="flex flex-wrap gap-2 ml-0">
                        {detectedFields.map((field) => (
                          <div
                            key={field.name}
                            className="px-2.5 py-1 rounded-md bg-background border border-border text-xs"
                          >
                            <span className="font-medium text-foreground">{field.name}</span>
                            <span className="text-muted-foreground ml-1.5">({field.type})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown based on preview results */}
                {previewResults.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Preview Cost Analysis</h3>
                    <CostBreakdown
                      tier1Count={previewResults.filter(r => r.tierUsed === 'tier1_fast').length}
                      tier2Count={previewResults.filter(r => r.tierUsed === 'tier2_deep').length}
                      totalAccounts={5}
                      showDetails={true}
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Select Enrichment Scope</h3>
                  <RadioGroup value={enrichmentScope} onValueChange={setEnrichmentScope} className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="all" id="all" className="mt-1" />
                      <Label htmlFor="all" className="flex-1 cursor-pointer">
                        <div className="font-medium text-foreground">Enrich all {totalAccounts.toLocaleString()} accounts in this table</div>
                        <div className="text-sm text-muted-foreground mt-1">Total cost: {(totalAccounts * costPerAccount).toLocaleString()} credits</div>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="first" id="first" className="mt-1" />
                      <Label htmlFor="first" className="flex-1 cursor-pointer">
                        <div className="font-medium text-foreground flex items-center gap-2">
                          Enrich first 
                          <Input
                            type="number"
                            value={customCount}
                            onChange={(e) => setCustomCount(e.target.value)}
                            className="w-24 h-8"
                            min="1"
                            max={totalAccounts}
                            onClick={(e) => e.stopPropagation()}
                          />
                          accounts
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Total cost: {((parseInt(customCount) || 100) * costPerAccount).toLocaleString()} credits
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="selected" id="selected" className="mt-1" />
                      <Label htmlFor="selected" className="flex-1 cursor-pointer">
                        <div className="font-medium text-foreground">Enrich selected {selectedAccounts} accounts</div>
                        <div className="text-sm text-muted-foreground mt-1">Total cost: {(selectedAccounts * costPerAccount).toLocaleString()} credits</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="p-6 rounded-xl bg-gradient-primary/5 border-2 border-primary/20">
                  <h3 className="text-sm font-semibold text-foreground mb-3">💳 Final Cost Estimate</h3>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-primary">{totalCost.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-1">credits</div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Accounts: {getAccountCount().toLocaleString()}</span>
                    <span>Per Account: {costPerAccount} credits</span>
                    <span>Tokens: ~{(getAccountCount() * 0.1).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "execute" && (
              <div className="p-6">
                <ExecutionMonitor />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-card flex-shrink-0">
            <div className="px-6 py-4 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={currentStep === "configure" ? () => onOpenChange(false) : handleBack}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {currentStep === "configure" ? "Cancel" : "Back"}
              </Button>

              {currentStep === "configure" && (
                <Button
                  onClick={handleNext}
                  disabled={!isPromptValid || !showPreviewSidebar}
                  className="gap-2"
                >
                  Next: Confirm & Run
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}

              {currentStep === "confirm" && (
                <Button
                  onClick={handleNext}
                  className="gap-2"
                >
                  Run Enrichment →
                </Button>
              )}

              {currentStep === "execute" && (
                <div className="flex gap-2">
                  <Button variant="outline">Pause</Button>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Continue in Background
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Preview Sidebar - Opens to the left, side-by-side with main sidebar */}
      {showPreviewSidebar && (
        <>
          {/* Preview Sidebar */}
          <div
            className="fixed inset-y-0 bg-background border-r border-border shadow-2xl flex flex-col"
            style={{
              right: '800px',
              left: 'auto',
              width: '600px',
              zIndex: 100,
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="px-6 py-4 border-b border-border flex-shrink-0 bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Preview & Configuration</h2>
                  <p className="text-sm text-muted-foreground mt-1">Test and configure your enrichment</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreviewSidebar(false)}
                  className="hover:bg-secondary"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <PreviewSystem
                prompt={prompt}
                selectedColumns={selectedColumns}
                previewResults={previewResults}
                onPreviewComplete={(fields) => {
                  setDetectedFields(fields);
                }}
              />
            </div>

            {/* Preview Footer */}
            <div className="border-t border-border bg-card flex-shrink-0 px-6 py-4">
              <Button
                onClick={() => setShowPreviewSidebar(false)}
                className="w-full gap-2"
              >
                Apply Configuration
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Info Modal */}
      <InfoModal open={showInfoModal} onClose={() => setShowInfoModal(false)} />
    </>
  );
};

export default SmartColumnModal;
