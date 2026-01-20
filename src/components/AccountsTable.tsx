import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sparkles, ChevronDown } from "lucide-react";
import { useState } from "react";
import EnrichmentDetailSidebar from "./EnrichmentDetailSidebar";

interface AccountsTableProps {
  onAskAIClick: () => void;
}

const AccountsTable = ({ onAskAIClick }: AccountsTableProps) => {
  const [detailSidebarOpen, setDetailSidebarOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const mockAccounts = [
    { 
      id: 1, 
      name: "Rahul Sharma", 
      industry: "SaaS", 
      funding: "Series B", 
      employees: "100-500",
      enrichment: {
        indian_origin: "Yes",
        confidence: "High",
        reasoning: "Name pattern typical of Indian origin. \"Rahul\" is a common Indian first name, and \"Sharma\" is a common Indian surname of Brahmin origin."
      }
    },
    { id: 2, name: "John Smith", industry: "FinTech", funding: "Seed", employees: "10-50" },
    { id: 3, name: "Priya Patel", industry: "Enterprise", funding: "Series A", employees: "50-100" },
  ];

  const handleEnrichmentClick = (account: any) => {
    setSelectedAccount(account);
    setDetailSidebarOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Account List</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Smart Columns
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px] bg-popover border-2 border-border">
              <DropdownMenuItem
                onClick={onAskAIClick}
                className="flex flex-col items-start gap-1 cursor-pointer hover:bg-secondary/80 p-3 bg-primary/5"
              >
                <div className="flex items-center gap-2 w-full">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-medium">AI Researcher</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-auto">NEW</Badge>
                </div>
                <span className="text-xs text-muted-foreground ml-6">Research and analyze with AI</span>
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-xl border-2 border-border bg-card shadow-elegant overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="font-semibold">Company Name</TableHead>
                <TableHead className="font-semibold">Industry</TableHead>
                <TableHead className="font-semibold">Funding Stage</TableHead>
                <TableHead className="font-semibold">Employees</TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Indian Origin
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAccounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-secondary/30 transition-colors">
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.industry}</TableCell>
                  <TableCell>{account.funding}</TableCell>
                  <TableCell>{account.employees}</TableCell>
                  <TableCell>
                    {account.enrichment ? (
                      <button
                        onClick={() => handleEnrichmentClick(account)}
                        className="text-sm text-primary hover:underline cursor-pointer"
                      >
                        {account.enrichment.indian_origin || "Yes"}
                      </button>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <EnrichmentDetailSidebar
        open={detailSidebarOpen}
        onOpenChange={setDetailSidebarOpen}
        account={selectedAccount}
      />
    </>
  );
};

export default AccountsTable;
