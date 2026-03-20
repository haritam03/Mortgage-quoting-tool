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
  Eye,
  TrendingUp,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineEntry {
  id: string;
  borrowerName: string;
  loanAmount: number;
  stage: "pre-approval" | "processing" | "underwriting" | "clear-to-close" | "funded";
  submissionDate: string;
  expectedFundingDate: string;
  lenderAssigned: string;
  loanOfficer: string;
  progress: number;
}

const samplePipeline: PipelineEntry[] = [
  {
    id: "PIPE-001",
    borrowerName: "John Smith",
    loanAmount: 450000,
    stage: "clear-to-close",
    submissionDate: "2024-02-15",
    expectedFundingDate: "2024-03-20",
    lenderAssigned: "Bank of America",
    loanOfficer: "Sarah Johnson",
    progress: 95,
  },
  {
    id: "PIPE-002",
    borrowerName: "Sarah Johnson",
    loanAmount: 280000,
    stage: "underwriting",
    submissionDate: "2024-03-01",
    expectedFundingDate: "2024-04-15",
    lenderAssigned: "Chase",
    loanOfficer: "Mike Chen",
    progress: 70,
  },
  {
    id: "PIPE-003",
    borrowerName: "Michael Chen",
    loanAmount: 385000,
    stage: "processing",
    submissionDate: "2024-03-10",
    expectedFundingDate: "2024-04-20",
    lenderAssigned: "Wells Fargo",
    loanOfficer: "Emily Rodriguez",
    progress: 45,
  },
  {
    id: "PIPE-004",
    borrowerName: "Emily Rodriguez",
    loanAmount: 220000,
    stage: "funded",
    submissionDate: "2024-01-20",
    expectedFundingDate: "2024-02-28",
    lenderAssigned: "U.S. Bank",
    loanOfficer: "David Wilson",
    progress: 100,
  },
  {
    id: "PIPE-005",
    borrowerName: "David Wilson",
    loanAmount: 520000,
    stage: "pre-approval",
    submissionDate: "2024-03-15",
    expectedFundingDate: "2024-05-10",
    lenderAssigned: "Pending",
    loanOfficer: "Jessica Martinez",
    progress: 15,
  },
];

const stageConfig = {
  "pre-approval": {
    label: "Pre-Approval",
    color: "bg-status-info text-white",
    order: 1,
  },
  processing: {
    label: "Processing",
    color: "bg-status-warning text-white",
    order: 2,
  },
  underwriting: {
    label: "Underwriting",
    color: "bg-accent text-accent-foreground",
    order: 3,
  },
  "clear-to-close": {
    label: "Clear to Close",
    color: "bg-status-success text-white",
    order: 4,
  },
  funded: { label: "Funded", color: "bg-secondary text-white", order: 5 },
};

export default function PipelineDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [loans, setLoans] = useState<PipelineEntry[]>(samplePipeline);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<PipelineEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter loans
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const searchMatch =
        loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id.toLowerCase().includes(searchTerm.toLowerCase());
      const stageMatch = !stageFilter || loan.stage === stageFilter;
      return searchMatch && stageMatch;
    });
  }, [loans, searchTerm, stageFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalLoans = loans.length;
    const fundedLoans = loans.filter((l) => l.stage === "funded").length;
    const totalVolume = loans.reduce((sum, l) => sum + l.loanAmount, 0);
    const avgLoanAmount = totalVolume / totalLoans;
    const closingRate = ((fundedLoans / totalLoans) * 100).toFixed(1);

    return {
      totalLoans,
      fundedLoans,
      totalVolume,
      avgLoanAmount,
      closingRate,
    };
  }, [loans]);

  const handleEdit = (loan: PipelineEntry) => {
    setEditingId(loan.id);
    setEditingData({ ...loan });
  };

  const handleSaveEdit = () => {
    if (editingData && editingId) {
      setLoans(
        loans.map((loan) =>
          loan.id === editingId ? { ...editingData } : loan
        )
      );
      setEditingId(null);
      setEditingData(null);
    }
  };

  const handleDelete = (id: string) => {
    setLoans(loans.filter((loan) => loan.id !== id));
  };

  const handleAddLoan = () => {
    const newLoan: PipelineEntry = {
      id: `PIPE-${String(loans.length + 1).padStart(3, "0")}`,
      borrowerName: "New Borrower",
      loanAmount: 0,
      stage: "pre-approval",
      submissionDate: new Date().toISOString().split("T")[0],
      expectedFundingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      lenderAssigned: "Pending",
      loanOfficer: "",
      progress: 0,
    };
    setLoans([...loans, newLoan]);
    handleEdit(newLoan);
  };

  const getStageColor = (stage: keyof typeof stageConfig) => {
    return stageConfig[stage].color;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Loan Pipeline
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track loan submissions, processing, and funding status
            </p>
          </div>
          <Button onClick={handleAddLoan} className="gap-2">
            <Plus className="h-4 w-4" />
            Add to Pipeline
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Total Loans
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.totalLoans}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-status-success" />
              <span className="text-xs font-medium text-muted-foreground">
                Total Volume
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.totalVolume / 1000000).toFixed(1)}M
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-4 w-4 text-status-warning" />
              <span className="text-xs font-medium text-muted-foreground">
                Funded
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.fundedLoans}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              <span className="text-xs font-medium text-muted-foreground">
                Closing Rate
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.closingRate}%
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">
                Avg. Loan
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.avgLoanAmount / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by borrower name or loan ID..."
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
                Pipeline Stage
              </label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground md:w-48"
              >
                <option value="">All Stages</option>
                {Object.entries(stageConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pipeline Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Borrower
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Loan Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Stage
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Lender
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  LO
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Expected Funding
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan, idx) => (
                <tr
                  key={loan.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    idx % 2 === 0 ? "bg-background" : "bg-card"
                  )}
                >
                  <td className="px-4 py-3">
                    {editingId === loan.id ? (
                      <Input
                        value={editingData?.borrowerName || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            borrowerName: e.target.value,
                          })
                        }
                        className="text-sm"
                      />
                    ) : (
                      <div>
                        <div className="font-medium text-foreground">
                          {loan.borrowerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {loan.id}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground font-medium">
                    {editingId === loan.id ? (
                      <Input
                        type="number"
                        value={editingData?.loanAmount || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            loanAmount: parseFloat(e.target.value),
                          })
                        }
                        className="text-sm"
                      />
                    ) : (
                      `$${(loan.loanAmount / 1000).toFixed(0)}K`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === loan.id ? (
                      <select
                        value={editingData?.stage || "pre-approval"}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            stage: e.target.value as any,
                          })
                        }
                        className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                      >
                        {Object.entries(stageConfig).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={cn(
                          "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                          getStageColor(loan.stage)
                        )}
                      >
                        {stageConfig[loan.stage].label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${editingId === loan.id ? editingData?.progress || 0 : loan.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {editingId === loan.id ? editingData?.progress || 0 : loan.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === loan.id ? (
                      <Input
                        value={editingData?.lenderAssigned || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            lenderAssigned: e.target.value,
                          })
                        }
                        className="text-sm"
                      />
                    ) : (
                      <span
                        className={cn(
                          "text-sm",
                          loan.lenderAssigned === "Pending"
                            ? "text-status-warning"
                            : "text-foreground"
                        )}
                      >
                        {loan.lenderAssigned}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {editingId === loan.id ? (
                      <Input
                        value={editingData?.loanOfficer || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            loanOfficer: e.target.value,
                          })
                        }
                        className="text-sm"
                      />
                    ) : (
                      loan.loanOfficer
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {editingId === loan.id ? (
                      <Input
                        type="date"
                        value={editingData?.expectedFundingDate || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            expectedFundingDate: e.target.value,
                          })
                        }
                        className="text-sm"
                      />
                    ) : (
                      loan.expectedFundingDate
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === loan.id ? (
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
                            onClick={() => handleEdit(loan)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(loan.id)}
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

          {filteredLoans.length === 0 && (
            <div className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No loans found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
