import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Filter,
  Edit2,
  Trash2,
  Search,
  DollarSign,
  Calendar,
  User,
  Paperclip,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  borrowerName: string;
  loanOfficer: string;
  loanAmount: number;
  entryDate: string;
  fundedDate: string;
  grossRevenue: number;
  loCommission: number;
  processorCommission: number;
  netRevenue: number;
  status: "pending" | "funded" | "completed";
  documents: string[];
  notes: string;
}

const sampleDeals: Deal[] = [
  {
    id: "DEAL-001",
    borrowerName: "John Smith",
    loanOfficer: "Sarah Johnson",
    loanAmount: 450000,
    entryDate: "2024-02-15",
    fundedDate: "2024-02-28",
    grossRevenue: 18600,
    loCommission: 6450,
    processorCommission: 930,
    netRevenue: 11220,
    status: "completed",
    documents: ["Closing Disclosure", "Note", "Mortgage"],
    notes: "Conventional loan, quick closing process",
  },
  {
    id: "DEAL-002",
    borrowerName: "Sarah Johnson",
    loanOfficer: "Michael Chen",
    loanAmount: 280000,
    entryDate: "2024-03-01",
    fundedDate: "2024-03-10",
    grossRevenue: 11650,
    loCommission: 4032,
    processorCommission: 583,
    netRevenue: 7035,
    status: "completed",
    documents: ["Closing Disclosure", "Note", "Mortgage", "Title Insurance"],
    notes: "FHA loan with mortgage insurance",
  },
  {
    id: "DEAL-003",
    borrowerName: "Michael Chen",
    loanOfficer: "Emily Rodriguez",
    loanAmount: 385000,
    entryDate: "2024-03-10",
    fundedDate: "2024-03-15",
    grossRevenue: 15950,
    loCommission: 5482,
    processorCommission: 798,
    netRevenue: 9670,
    status: "funded",
    documents: ["Closing Disclosure", "Note"],
    notes: "VA loan, expedited processing",
  },
  {
    id: "DEAL-004",
    borrowerName: "Emily Rodriguez",
    loanOfficer: "David Wilson",
    loanAmount: 220000,
    entryDate: "2024-03-05",
    fundedDate: null,
    grossRevenue: 9200,
    loCommission: 3160,
    processorCommission: 460,
    netRevenue: 5580,
    status: "pending",
    documents: ["Pre-Approval"],
    notes: "Pending underwriting review",
  },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-status-warning text-white" },
  funded: { label: "Funded", color: "bg-status-info text-white" },
  completed: { label: "Completed", color: "bg-status-success text-white" },
};

export default function DealManagement() {
  const [deals, setDeals] = useState<Deal[]>(sampleDeals);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loFilter, setLoFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Deal | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter deals
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const searchMatch =
        deal.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.id.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = !statusFilter || deal.status === statusFilter;
      const loMatch = !loFilter || deal.loanOfficer === loFilter;
      return searchMatch && statusMatch && loMatch;
    });
  }, [deals, searchTerm, statusFilter, loFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const totalDeals = filteredDeals.length;
    const totalLoanVolume = filteredDeals.reduce(
      (sum, d) => sum + d.loanAmount,
      0
    );
    const totalGrossRevenue = filteredDeals.reduce(
      (sum, d) => sum + d.grossRevenue,
      0
    );
    const totalNetRevenue = filteredDeals.reduce(
      (sum, d) => sum + d.netRevenue,
      0
    );
    const fundedCount = filteredDeals.filter((d) => d.status !== "pending").length;

    return {
      totalDeals,
      totalLoanVolume,
      totalGrossRevenue,
      totalNetRevenue,
      fundedCount,
    };
  }, [filteredDeals]);

  const uniqueLOs = [...new Set(deals.map((d) => d.loanOfficer))];

  const handleEdit = (deal: Deal) => {
    setEditingId(deal.id);
    setEditingData({ ...deal });
  };

  const handleSaveEdit = () => {
    if (editingData && editingId) {
      setDeals(
        deals.map((d) => (d.id === editingId ? { ...editingData } : d))
      );
      setEditingId(null);
      setEditingData(null);
    }
  };

  const handleDelete = (id: string) => {
    setDeals(deals.filter((d) => d.id !== id));
  };

  const handleAddDeal = () => {
    const newDeal: Deal = {
      id: `DEAL-${String(deals.length + 1).padStart(3, "0")}`,
      borrowerName: "New Borrower",
      loanOfficer: uniqueLOs[0] || "Unassigned",
      loanAmount: 0,
      entryDate: new Date().toISOString().split("T")[0],
      fundedDate: null,
      grossRevenue: 0,
      loCommission: 0,
      processorCommission: 0,
      netRevenue: 0,
      status: "pending",
      documents: [],
      notes: "",
    };
    setDeals([...deals, newDeal]);
    handleEdit(newDeal);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Deal Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track deal entries, revenue, and deal history
            </p>
          </div>
          <Button onClick={handleAddDeal} className="gap-2">
            <Plus className="h-4 w-4" />
            New Deal
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Total Deals
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.totalDeals}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-4 w-4 text-status-success" />
              <span className="text-xs font-medium text-muted-foreground">
                Funded
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.fundedCount}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-status-info" />
              <span className="text-xs font-medium text-muted-foreground">
                Loan Volume
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.totalLoanVolume / 1000000).toFixed(1)}M
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-status-warning" />
              <span className="text-xs font-medium text-muted-foreground">
                Gross Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.totalGrossRevenue / 1000).toFixed(0)}K
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">
                Net Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.totalNetRevenue / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by borrower or deal ID..."
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
            <div className="rounded-lg border border-border bg-card p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="funded">Funded</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Loan Officer
                  </label>
                  <select
                    value={loFilter}
                    onChange={(e) => setLoFilter(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">All Officers</option>
                    {uniqueLOs.map((lo) => (
                      <option key={lo} value={lo}>
                        {lo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deals List */}
        <div className="space-y-3">
          {filteredDeals.length === 0 ? (
            <div className="py-12 text-center rounded-lg border border-border">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No deals found</p>
            </div>
          ) : (
            filteredDeals.map((deal) => (
              <div
                key={deal.id}
                className="rounded-lg border border-border bg-card overflow-hidden transition-all"
              >
                {/* Deal Header */}
                <div className="p-4">
                  {editingId === deal.id ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Borrower Name
                          </label>
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
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Loan Officer
                          </label>
                          <select
                            value={editingData?.loanOfficer || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                loanOfficer: e.target.value,
                              })
                            }
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                          >
                            {uniqueLOs.map((lo) => (
                              <option key={lo} value={lo}>
                                {lo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-4">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Loan Amount
                          </label>
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
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Entry Date
                          </label>
                          <Input
                            type="date"
                            value={editingData?.entryDate || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                entryDate: e.target.value,
                              })
                            }
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Funded Date
                          </label>
                          <Input
                            type="date"
                            value={editingData?.fundedDate || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                fundedDate: e.target.value || null,
                              })
                            }
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Status
                          </label>
                          <select
                            value={editingData?.status || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                status: e.target.value as any,
                              })
                            }
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                          >
                            <option value="pending">Pending</option>
                            <option value="funded">Funded</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Gross Revenue
                          </label>
                          <Input
                            type="number"
                            value={editingData?.grossRevenue || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                grossRevenue: parseFloat(e.target.value),
                              })
                            }
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            LO Commission
                          </label>
                          <Input
                            type="number"
                            value={editingData?.loCommission || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                loCommission: parseFloat(e.target.value),
                              })
                            }
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Processor Commission
                          </label>
                          <Input
                            type="number"
                            value={editingData?.processorCommission || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                processorCommission: parseFloat(e.target.value),
                              })
                            }
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Notes
                        </label>
                        <Input
                          value={editingData?.notes || ""}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData!,
                              notes: e.target.value,
                            })
                          }
                          placeholder="Add notes about this deal..."
                          className="text-sm"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="flex-1"
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {deal.borrowerName}
                          </h3>
                          <span
                            className={cn(
                              "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                              statusConfig[deal.status].color
                            )}
                          >
                            {statusConfig[deal.status].label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {deal.id}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {deal.loanOfficer}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {deal.entryDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${(deal.loanAmount / 1000).toFixed(0)}K
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(deal)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(deal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setExpandedId(expandedId === deal.id ? null : deal.id)
                          }
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedId === deal.id ? "rotate-180" : ""
                            )}
                          />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Deal Details */}
                {expandedId === deal.id && editingId !== deal.id && (
                  <div className="border-t border-border bg-muted/30 p-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Loan Amount
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          ${(deal.loanAmount / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Gross Revenue
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          ${deal.grossRevenue.toFixed(0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Net Revenue
                        </p>
                        <p className="text-lg font-semibold text-status-success">
                          ${deal.netRevenue.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          LO Commission
                        </p>
                        <p className="text-foreground">
                          ${deal.loCommission.toFixed(0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Processor Commission
                        </p>
                        <p className="text-foreground">
                          ${deal.processorCommission.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {deal.fundedDate && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Funded Date
                        </p>
                        <p className="text-foreground">{deal.fundedDate}</p>
                      </div>
                    )}

                    {deal.documents.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Documents
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {deal.documents.map((doc) => (
                            <span
                              key={doc}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 text-primary text-xs"
                            >
                              <Paperclip className="h-3 w-3" />
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {deal.notes && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Notes
                        </p>
                        <p className="text-sm text-foreground">{deal.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
