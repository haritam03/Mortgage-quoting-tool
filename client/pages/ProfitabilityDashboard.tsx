import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfitabilityEntry {
  id: string;
  borrowerName: string;
  loanAmount: number;
  closingDate: string;
  grossRevenue: number;
  loCompensation: number;
  overheadAllocation: number;
  leadCost: number;
  netProfit: number;
  profitMargin: number;
  costPerFundedLoan: number;
  month: string;
}

const sampleProfitability: ProfitabilityEntry[] = [
  {
    id: "PROF-001",
    borrowerName: "John Smith",
    loanAmount: 450000,
    closingDate: "2024-02-28",
    grossRevenue: 18600,
    loCompensation: 5580,
    overheadAllocation: 3720,
    leadCost: 500,
    netProfit: 8800,
    profitMargin: 47.3,
    costPerFundedLoan: 1250,
    month: "Feb 2024",
  },
  {
    id: "PROF-002",
    borrowerName: "Sarah Johnson",
    loanAmount: 280000,
    closingDate: "2024-03-10",
    grossRevenue: 11650,
    loCompensation: 3495,
    overheadAllocation: 2330,
    leadCost: 400,
    netProfit: 5425,
    profitMargin: 46.6,
    costPerFundedLoan: 850,
    month: "Mar 2024",
  },
  {
    id: "PROF-003",
    borrowerName: "Michael Chen",
    loanAmount: 385000,
    closingDate: "2024-03-15",
    grossRevenue: 15950,
    loCompensation: 4785,
    overheadAllocation: 3190,
    leadCost: 600,
    netProfit: 7375,
    profitMargin: 46.2,
    costPerFundedLoan: 1100,
    month: "Mar 2024",
  },
  {
    id: "PROF-004",
    borrowerName: "Emily Rodriguez",
    loanAmount: 220000,
    closingDate: "2024-02-15",
    grossRevenue: 9200,
    loCompensation: 2760,
    overheadAllocation: 1840,
    leadCost: 350,
    netProfit: 4250,
    profitMargin: 46.2,
    costPerFundedLoan: 750,
    month: "Feb 2024",
  },
  {
    id: "PROF-005",
    borrowerName: "David Wilson",
    loanAmount: 520000,
    closingDate: "2024-03-20",
    grossRevenue: 21500,
    loCompensation: 6450,
    overheadAllocation: 4300,
    leadCost: 650,
    netProfit: 10100,
    profitMargin: 46.9,
    costPerFundedLoan: 1400,
    month: "Mar 2024",
  },
];

export default function ProfitabilityDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [profitability, setProfitability] = useState<ProfitabilityEntry[]>(
    sampleProfitability
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<ProfitabilityEntry | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return profitability.filter((entry) => {
      const searchMatch =
        entry.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.id.toLowerCase().includes(searchTerm.toLowerCase());
      const monthMatch = !monthFilter || entry.month === monthFilter;
      return searchMatch && monthMatch;
    });
  }, [profitability, searchTerm, monthFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const fundedLoansCount = filteredEntries.length;
    const grossRevenue = filteredEntries.reduce(
      (sum, e) => sum + e.grossRevenue,
      0
    );
    const totalCosts = filteredEntries.reduce(
      (sum, e) =>
        sum + e.loCompensation + e.overheadAllocation + e.leadCost,
      0
    );
    const netProfit = filteredEntries.reduce((sum, e) => sum + e.netProfit, 0);
    const avgProfitMargin =
      filteredEntries.length > 0
        ? filteredEntries.reduce((sum, e) => sum + e.profitMargin, 0) /
          filteredEntries.length
        : 0;
    const avgCostPerLoan =
      filteredEntries.length > 0
        ? filteredEntries.reduce((sum, e) => sum + e.costPerFundedLoan, 0) /
          filteredEntries.length
        : 0;

    return {
      fundedLoansCount,
      grossRevenue,
      totalCosts,
      netProfit,
      avgProfitMargin,
      avgCostPerLoan,
    };
  }, [filteredEntries]);

  const handleEdit = (entry: ProfitabilityEntry) => {
    setEditingId(entry.id);
    setEditingData({ ...entry });
  };

  const handleSaveEdit = () => {
    if (editingData && editingId) {
      setProfitability(
        profitability.map((entry) =>
          entry.id === editingId ? { ...editingData } : entry
        )
      );
      setEditingId(null);
      setEditingData(null);
    }
  };

  const handleDelete = (id: string) => {
    setProfitability(profitability.filter((entry) => entry.id !== id));
  };

  const handleAddEntry = () => {
    const newEntry: ProfitabilityEntry = {
      id: `PROF-${String(profitability.length + 1).padStart(3, "0")}`,
      borrowerName: "New Borrower",
      loanAmount: 0,
      closingDate: new Date().toISOString().split("T")[0],
      grossRevenue: 0,
      loCompensation: 0,
      overheadAllocation: 0,
      leadCost: 0,
      netProfit: 0,
      profitMargin: 0,
      costPerFundedLoan: 0,
      month: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
    };
    setProfitability([...profitability, newEntry]);
    handleEdit(newEntry);
  };

  const uniqueMonths = [...new Set(profitability.map((e) => e.month))];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Profitability & Margin Analytics
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor margins, costs, and profitability by loan
            </p>
          </div>
          <Button onClick={handleAddEntry} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Funded Loans
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.fundedLoansCount}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-status-success" />
              <span className="text-xs font-medium text-muted-foreground">
                Gross Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.grossRevenue / 1000).toFixed(1)}K
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-4 w-4 text-status-warning" />
              <span className="text-xs font-medium text-muted-foreground">
                Total Costs
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.totalCosts / 1000).toFixed(1)}K
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-4 w-4 text-status-success" />
              <span className="text-xs font-medium text-muted-foreground">
                Net Profit
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.netProfit / 1000).toFixed(1)}K
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Percent className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">
                Avg. Margin
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.avgProfitMargin.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-secondary" />
              <span className="text-xs font-medium text-muted-foreground">
                Cost Per Loan
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${metrics.avgCostPerLoan.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by borrower name or entry ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="rounded-lg border border-border bg-card p-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Month
              </label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground md:w-48"
              >
                <option value="">All Months</option>
                {uniqueMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Profitability Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Borrower
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Loan Amount
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Gross Revenue
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  LO Comp
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Overhead
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Lead Cost
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Net Profit
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Margin %
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Cost/Loan
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  Month
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    idx % 2 === 0 ? "bg-background" : "bg-card"
                  )}
                >
                  <td className="px-4 py-3">
                    {editingId === entry.id ? (
                      <Input
                        value={editingData?.borrowerName || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            borrowerName: e.target.value,
                          })
                        }
                        className="text-xs"
                      />
                    ) : (
                      <div>
                        <div className="font-medium text-foreground">
                          {entry.borrowerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.id}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {editingId === entry.id ? (
                      <Input
                        type="number"
                        value={editingData?.loanAmount || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            loanAmount: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${(entry.loanAmount / 1000).toFixed(0)}K`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground font-medium">
                    {editingId === entry.id ? (
                      <Input
                        type="number"
                        value={editingData?.grossRevenue || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            grossRevenue: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${entry.grossRevenue.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {editingId === entry.id ? (
                      <Input
                        type="number"
                        value={editingData?.loCompensation || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            loCompensation: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${entry.loCompensation.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {editingId === entry.id ? (
                      <Input
                        type="number"
                        value={editingData?.overheadAllocation || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            overheadAllocation: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${entry.overheadAllocation.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {editingId === entry.id ? (
                      <Input
                        type="number"
                        value={editingData?.leadCost || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            leadCost: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${entry.leadCost.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground font-medium text-status-success">
                    {editingId === entry.id ? (
                      <Input
                        type="number"
                        value={editingData?.netProfit || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            netProfit: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${entry.netProfit.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {editingId === entry.id ? (
                      <Input
                        type="number"
                        step="0.1"
                        value={editingData?.profitMargin || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            profitMargin: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      <span className="text-status-success">
                        {entry.profitMargin.toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {editingId === entry.id ? (
                      <Input
                        type="number"
                        value={editingData?.costPerFundedLoan || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            costPerFundedLoan: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${entry.costPerFundedLoan.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-foreground text-xs">
                    {editingId === entry.id ? (
                      <Input
                        value={editingData?.month || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            month: e.target.value,
                          })
                        }
                        className="text-xs"
                      />
                    ) : (
                      entry.month
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === entry.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={handleSaveEdit}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEntries.length === 0 && (
            <div className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No entries found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
