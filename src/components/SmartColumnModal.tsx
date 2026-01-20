import { useState, useRef } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles, X, ChevronLeft, ChevronRight, PlayCircle, Zap, Crown, Info, CheckCircle2, Plus, ChevronDown, Globe, MapPin, Clock, FileText, MoreHorizontal } from "lucide-react";
import PromptBuilder from "./smart-column/PromptBuilder";
import PreviewSystem from "./smart-column/PreviewSystem";
import ExecutionMonitor from "./smart-column/ExecutionMonitor";
import ColumnDropdown from "./smart-column/ColumnDropdown";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import BudgetControl from "./smart-search/BudgetControl";
import InfoModal from "./smart-search/InfoModal";
import CostBreakdown from "./smart-search/CostBreakdown";
import { BudgetMode } from "@/services/smart-search/enrichment-orchestrator";
import { analyzeQueryComplexity } from "@/services/smart-search/query-complexity-analyzer";
import { callSmartSearch } from "@/services/smart-search/api-client";

interface SmartColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "configure" | "confirm" | "execute";

const MODELS = [
  {
    id: "sprouts-research",
    name: "Sprouts Research",
    credits: 5,
    icon: Sparkles,
    description: "AI Signals powered research"
  },
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
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("fast_only");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [queryComplexity, setQueryComplexity] = useState<'simple' | 'medium' | 'complex' | undefined>();

  // Optional configuration state
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [dateRange, setDateRange] = useState("");
  const [geolocation, setGeolocation] = useState("");
  const [outputFormat, setOutputFormat] = useState("");

  // Preview state
  const [showPreviewSidebar, setShowPreviewSidebar] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Column insertion state
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [columnDropdownPosition, setColumnDropdownPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const isPromptValid = prompt.trim().length > 0;

  // Handle "/" key for column insertion
  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "/" && !showColumnDropdown) {
      e.preventDefault();
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const cursorPos = target.selectionStart;

      setColumnDropdownPosition({
        top: rect.top + 40,
        left: rect.left + 20,
      });
      setShowColumnDropdown(true);
      setCursorPosition(cursorPos);
    }

    if (e.key === "Escape" && showColumnDropdown) {
      setShowColumnDropdown(false);
    }
  };

  // Handle column selection from dropdown
  const handleColumnSelect = (columnName: string) => {
    if (!selectedColumns.includes(columnName)) {
      setSelectedColumns([...selectedColumns, columnName]);

      // Insert column reference at cursor position
      const newValue =
        prompt.slice(0, cursorPosition) +
        `{{${columnName}}}` +
        prompt.slice(cursorPosition);
      setPrompt(newValue);
    }

    setShowColumnDropdown(false);
    textareaRef.current?.focus();
  };

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

  const handlePreview = async () => {
    setIsLoadingPreview(true);

    // Analyze query complexity
    const complexity = analyzeQueryComplexity(prompt);
    setQueryComplexity(complexity.level);

    try {
      // Use real company names for testing
      const mockCompanies = [
        "TechCorp Inc.",
        "DataFlow Systems",
        "CloudVision Ltd.",
        "InnovateLabs",
        "FutureStack"
      ];

      // Call API for each company
      const results = await Promise.all(
        mockCompanies.map(async (companyName) => {
          try {
            const result = await callSmartSearch({
              query: prompt,
              company_name: companyName,
              budget_mode: budgetMode
            });

            return {
              accountName: companyName,
              tierUsed: result.tierUsed,
              cost: result.cost,
              answer: result.answer,
              upgradeReason: result.upgradeReason
            };
          } catch (error) {
            console.error(`Error for ${companyName}:`, error);
            return {
              accountName: companyName,
              tierUsed: 'tier1_fast' as const,
              cost: 1,
              answer: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
            };
          }
        })
      );

      setPreviewResults(results);
      setShowPreviewSidebar(true);

      // Auto-detect fields from preview
      setDetectedFields([
        { name: "result", type: "text", sample: results[0]?.answer || "N/A" },
        { name: "tier_used", type: "text", sample: results[0]?.tierUsed || "N/A" },
      ]);

    } catch (error) {
      console.error('Preview error:', error);
      // Fallback to mock data on error
      const mockPreviewResults = generateMockPreviewResults(
        prompt,
        budgetMode,
        complexity.level
      );
      setPreviewResults(mockPreviewResults);
      setShowPreviewSidebar(true);
    } finally {
      setIsLoadingPreview(false);
    }
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
              <div className="p-6 space-y-6">
                {/* Intro Text */}
                <div className="text-sm text-muted-foreground">
                  Stay ahead with real-time AI-powered intent signals.
                </div>

                {/* Prompt Input Section with Context Badges */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-foreground">
                      What do you want to know about these accounts?
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Word count: {prompt.split(/\s+/).filter(Boolean).length}
                    </span>
                  </div>

                  {/* Extended White Container - includes textarea + separator + config */}
                  <div className="relative rounded-xl border-2 border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <div className="w-full min-h-[280px] p-4 flex flex-col">
                      <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handlePromptKeyDown}
                        placeholder="e.g. Is {{CONTACT_NAME}} of Indian origin?&#10;e.g. Did {{COMPANY_NAME}} raise funding recently?&#10;e.g. What technologies does {{COMPANY_DOMAIN}} use?&#10;&#10;Type / to insert data columns"
                        className="w-full flex-1 bg-transparent resize-none focus:outline-none text-sm placeholder:text-muted-foreground leading-relaxed"
                      />

                    </div>

                    {/* Help Me Button - Floating in Prompt Area */}
                    <div className="absolute bottom-[68px] left-4">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="bg-background border border-border shadow-md hover:bg-secondary text-foreground h-8 w-8"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Separator Line */}
                    <div className="border-t border-border mx-4 mt-3" />

                    {/* Configuration Section - Plus and Model Selector */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Context Tiles - Show when selected with overflow handling */}
                        {(() => {
                          const MAX_VISIBLE_TILES = 2;
                          const activeTiles = [
                            geolocation && {
                              id: 'geolocation',
                              component: (
                                <Button
                                  key="geolocation"
                                  size="sm"
                                  variant="default"
                                  onClick={() => setGeolocation("")}
                                  className="h-8 gap-2 px-3 bg-orange-500 text-white hover:bg-orange-600"
                                >
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span className="text-xs capitalize">{geolocation.replace(/_/g, ' ')}</span>
                                  <X className="h-3 w-3 ml-1" />
                                </Button>
                              )
                            },
                            dateRange && {
                              id: 'dateRange',
                              component: (
                                <Button
                                  key="dateRange"
                                  size="sm"
                                  variant="default"
                                  onClick={() => setDateRange("")}
                                  className="h-8 gap-2 px-3 bg-purple-500 text-white hover:bg-purple-600"
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                  <span className="text-xs capitalize">{dateRange.replace(/_/g, ' ')}</span>
                                  <X className="h-3 w-3 ml-1" />
                                </Button>
                              )
                            },
                            outputFormat && {
                              id: 'outputFormat',
                              component: (
                                <Button
                                  key="outputFormat"
                                  size="sm"
                                  variant="default"
                                  onClick={() => setOutputFormat("")}
                                  className="h-8 gap-2 px-3 bg-green-500 text-white hover:bg-green-600"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span className="text-xs capitalize">{outputFormat.replace(/_/g, ' ')}</span>
                                  <X className="h-3 w-3 ml-1" />
                                </Button>
                              )
                            },
                            webSearchEnabled && {
                              id: 'webSearch',
                              component: (
                                <Button
                                  key="webSearch"
                                  size="sm"
                                  variant="default"
                                  onClick={() => setWebSearchEnabled(false)}
                                  className="h-8 gap-2 px-3 bg-blue-500 text-white hover:bg-blue-600"
                                >
                                  <Globe className="h-3.5 w-3.5" />
                                  <span className="text-xs">Web Search</span>
                                  <X className="h-3 w-3 ml-1" />
                                </Button>
                              )
                            }
                          ].filter(Boolean);

                          const visibleTiles = activeTiles.slice(0, MAX_VISIBLE_TILES);
                          const remainingCount = activeTiles.length - MAX_VISIBLE_TILES;

                          return (
                            <>
                              {visibleTiles.map(tile => tile.component)}
                              {remainingCount > 0 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-3 gap-1.5 border-border hover:bg-secondary"
                                    >
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                      <span className="text-xs font-medium">+{remainingCount}</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start" className="w-56">
                                    <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                      Hidden context
                                    </DropdownMenuLabel>
                                    {activeTiles.slice(MAX_VISIBLE_TILES).map(tile => {
                                      if (tile.id === 'geolocation') {
                                        return (
                                          <DropdownMenuItem key={tile.id} onSelect={() => setGeolocation("")} className="gap-2">
                                            <MapPin className="h-4 w-4 text-orange-500" />
                                            <span className="text-sm capitalize flex-1">{geolocation.replace(/_/g, ' ')}</span>
                                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                                          </DropdownMenuItem>
                                        );
                                      } else if (tile.id === 'dateRange') {
                                        return (
                                          <DropdownMenuItem key={tile.id} onSelect={() => setDateRange("")} className="gap-2">
                                            <Clock className="h-4 w-4 text-purple-500" />
                                            <span className="text-sm capitalize flex-1">{dateRange.replace(/_/g, ' ')}</span>
                                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                                          </DropdownMenuItem>
                                        );
                                      } else if (tile.id === 'outputFormat') {
                                        return (
                                          <DropdownMenuItem key={tile.id} onSelect={() => setOutputFormat("")} className="gap-2">
                                            <FileText className="h-4 w-4 text-green-500" />
                                            <span className="text-sm capitalize flex-1">{outputFormat.replace(/_/g, ' ')}</span>
                                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                                          </DropdownMenuItem>
                                        );
                                      } else if (tile.id === 'webSearch') {
                                        return (
                                          <DropdownMenuItem key={tile.id} onSelect={() => setWebSearchEnabled(false)} className="gap-2">
                                            <Globe className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm flex-1">Web Search</span>
                                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                                          </DropdownMenuItem>
                                        );
                                      }
                                      return null;
                                    })}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </>
                          );
                        })()}

                        {/* Plus Icon for Additional Options */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Add context
                            </DropdownMenuLabel>

                            {/* Sprouts Research specific options */}
                            {selectedModel === 'sprouts-research' && (
                              <>
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger className="gap-2">
                                    <MapPin className={`h-4 w-4 ${geolocation ? 'text-orange-500' : 'text-muted-foreground'}`} />
                                    <span className="text-sm">Location</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="w-48 p-2">
                                    <div className="relative mb-2" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="text"
                                        placeholder="Search country..."
                                        className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        onKeyDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                    <DropdownMenuItem onSelect={() => setGeolocation("united_states")}>
                                      United States
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setGeolocation("global")}>
                                      Global
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setGeolocation("europe")}>
                                      Europe
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setGeolocation("asia")}>
                                      Asia
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger className="gap-2">
                                    <Clock className={`h-4 w-4 ${dateRange ? 'text-purple-500' : 'text-muted-foreground'}`} />
                                    <span className="text-sm">Time Range</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="w-48">
                                    <DropdownMenuItem onSelect={() => setDateRange("past_6_months")}>
                                      Past 6 Months
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setDateRange("past_year")}>
                                      Past Year
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setDateRange("past_2_years")}>
                                      Past 2 Years
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setDateRange("all_time")}>
                                      All Time
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger className="gap-2">
                                    <FileText className={`h-4 w-4 ${outputFormat ? 'text-green-500' : 'text-muted-foreground'}`} />
                                    <span className="text-sm">Response Format</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="w-40">
                                    <DropdownMenuItem onSelect={() => setOutputFormat("yes_no")}>
                                      Yes/No
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setOutputFormat("detailed")}>
                                      Detailed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setOutputFormat("structured")}>
                                      Structured
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              </>
                            )}

                            {/* Web Search option for all models */}
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onSelect={() => setWebSearchEnabled(!webSearchEnabled)}
                            >
                              <Globe className={`h-4 w-4 ${webSearchEnabled ? 'text-blue-500' : 'text-muted-foreground'}`} />
                              <span className="text-sm">Web Search</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Model Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Model:</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 h-9 min-w-[160px] justify-between font-normal">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-primary" />
                                <span className="text-xs">{MODELS.find(m => m.id === selectedModel)?.name || "Sprouts Research"}</span>
                              </div>
                              <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[240px]">
                            {/* Show first 2 models */}
                            {MODELS.slice(0, 2).map((model) => {
                              const Icon = model.icon;
                              return (
                                <DropdownMenuItem key={model.id} onClick={() => setSelectedModel(model.id)} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-3 w-3 text-primary" />
                                    <span>{model.name}</span>
                                  </div>
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    {model.credits} credits
                                  </Badge>
                                </DropdownMenuItem>
                              );
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-primary font-medium">
                              See all models
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Use / to add data columns from Accounts and Contacts page
                </div>

                <Separator className="my-4" />

                {/* Recommended Prompts */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Recommended:</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: <FileText className="h-4 w-4" />, text: "Check if a company is SaaS or Non-Saas" },
                      { icon: <MapPin className="h-4 w-4" />, text: "Find the location of the contact" },
                      { icon: <FileText className="h-4 w-4" />, text: "Find the Linkedin of the contact" }
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(item.text)}
                        className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-sm bg-card transition-all text-left h-full group"
                      >
                        <div className="p-2 bg-secondary rounded-lg text-muted-foreground group-hover:text-foreground group-hover:bg-primary/10 transition-colors">
                          {item.icon}
                        </div>
                        <div className="flex items-start justify-between w-full">
                          <span className="text-xs font-medium text-muted-foreground leading-snug group-hover:text-foreground">
                            {item.text}
                          </span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-foreground -mr-1 -mt-1 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column Dropdown */}
                {showColumnDropdown && (
                  <div
                    className="fixed z-50"
                    style={{
                      top: `${columnDropdownPosition.top}px`,
                      left: `${columnDropdownPosition.left}px`
                    }}
                  >
                    <ColumnDropdown
                      searchTerm=""
                      onSelect={handleColumnSelect}
                      onClose={() => setShowColumnDropdown(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {currentStep === "confirm" && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Configuration Summary</h3>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3 text-sm">
                    <p><span className="text-muted-foreground">Model:</span> <span className="font-medium">{MODELS.find(m => m.id === selectedModel)?.name || "GPT-4o"}</span></p>
                    <p><span className="text-muted-foreground">Web Search:</span> <span className="font-medium">{webSearchEnabled ? 'Enabled' : 'Disabled'}</span></p>
                    {webSearchEnabled && (
                      <>
                        <p><span className="text-muted-foreground">Date Range:</span> <span className="font-medium capitalize">{dateRange.replace(/_/g, ' ')}</span></p>
                        <p><span className="text-muted-foreground">Geolocation:</span> <span className="font-medium capitalize">{geolocation.replace(/_/g, ' ')}</span></p>
                      </>
                    )}
                    <p><span className="text-muted-foreground">Output Format:</span> <span className="font-medium capitalize">{outputFormat.replace(/_/g, ' ')}</span></p>
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePreview}
                    disabled={!isPromptValid || isLoadingPreview}
                    className="gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isPromptValid}
                    className="gap-2"
                  >
                    Next: Enrich Settings
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
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
