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
  DollarSign,
  TrendingUp,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RevenueEntry {
  id: string;
  borrowerName: string;
  loanAmount: number;
  closingDate: string;
  ysp: number; // Yield Spread Premium
  lenderFees: number;
  originationFee: number;
  appraisalFee: number;
  loCommission: number;
  grossRevenue: number;
  netRevenue: number;
  status: "pending" | "funded" | "paid";
}

const sampleRevenue: RevenueEntry[] = [
  {
    id: "REV-001",
    borrowerName: "John Smith",
    loanAmount: 450000,
    closingDate: "2024-02-28",
    ysp: 4500,
    lenderFees: 2250,
    originationFee: 4500,
    appraisalFee: 600,
    loCommission: 6750,
    grossRevenue: 18600,
    netRevenue: 14400,
    status: "paid",
  },
  {
    id: "REV-002",
    borrowerName: "Sarah Johnson",
    loanAmount: 280000,
    closingDate: "2024-03-10",
    ysp: 2800,
    lenderFees: 1400,
    originationFee: 2800,
    appraisalFee: 450,
    loCommission: 4200,
    grossRevenue: 11650,
    netRevenue: 8900,
    status: "funded",
  },
  {
    id: "REV-003",
    borrowerName: "Michael Chen",
    loanAmount: 385000,
    closingDate: "2024-03-15",
    ysp: 3850,
    lenderFees: 1925,
    originationFee: 3850,
    appraisalFee: 550,
    loCommission: 5775,
    grossRevenue: 15950,
    netRevenue: 12200,
    status: "pending",
  },
  {
    id: "REV-004",
    borrowerName: "Emily Rodriguez",
    loanAmount: 220000,
    closingDate: "2024-02-15",
    ysp: 2200,
    lenderFees: 1100,
    originationFee: 2200,
    appraisalFee: 400,
    loCommission: 3300,
    grossRevenue: 9200,
    netRevenue: 7100,
    status: "paid",
  },
  {
    id: "REV-005",
    borrowerName: "David Wilson",
    loanAmount: 520000,
    closingDate: "2024-03-20",
    ysp: 5200,
    lenderFees: 2600,
    originationFee: 5200,
    appraisalFee: 700,
    loCommission: 7800,
    grossRevenue: 21500,
    netRevenue: 16500,
    status: "pending",
  },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-status-warning text-white" },
  funded: { label: "Funded", color: "bg-status-info text-white" },
  paid: { label: "Paid", color: "bg-status-success text-white" },
};

export default function RevenueDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [revenues, setRevenues] = useState<RevenueEntry[]>(sampleRevenue);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<RevenueEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter revenues
  const filteredRevenues = useMemo(() => {
    return revenues.filter((rev) => {
      const searchMatch =
        rev.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.id.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = !statusFilter || rev.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [revenues, searchTerm, statusFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalGrossRevenue = revenues.reduce(
      (sum, rev) => sum + rev.grossRevenue,
      0
    );
    const totalNetRevenue = revenues.reduce(
      (sum, rev) => sum + rev.netRevenue,
      0
    );
    const totalLoans = revenues.filter((r) => r.status !== "pending").length;
    const avgNetRevenue = totalLoans > 0 ? totalNetRevenue / totalLoans : 0;
    const paidRevenue = revenues
      .filter((r) => r.status === "paid")
      .reduce((sum, rev) => sum + rev.netRevenue, 0);

    return {
      totalGrossRevenue,
      totalNetRevenue,
      paidRevenue,
      avgNetRevenue,
      closedLoans: totalLoans,
    };
  }, [revenues]);

  const handleEdit = (revenue: RevenueEntry) => {
    setEditingId(revenue.id);
    setEditingData({ ...revenue });
  };

  const handleSaveEdit = () => {
    if (editingData && editingId) {
      setRevenues(
        revenues.map((rev) =>
          rev.id === editingId ? { ...editingData } : rev
        )
      );
      setEditingId(null);
      setEditingData(null);
    }
  };

  const handleDelete = (id: string) => {
    setRevenues(revenues.filter((rev) => rev.id !== id));
  };

  const handleAddRevenue = () => {
    const newRevenue: RevenueEntry = {
      id: `REV-${String(revenues.length + 1).padStart(3, "0")}`,
      borrowerName: "New Borrower",
      loanAmount: 0,
      closingDate: new Date().toISOString().split("T")[0],
      ysp: 0,
      lenderFees: 0,
      originationFee: 0,
      appraisalFee: 0,
      loCommission: 0,
      grossRevenue: 0,
      netRevenue: 0,
      status: "pending",
    };
    setRevenues([...revenues, newRevenue]);
    handleEdit(newRevenue);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Revenue & Deal Accounting
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track revenue, fees, and deal profitability
            </p>
          </div>
          <Button onClick={handleAddRevenue} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
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
              <TrendingUp className="h-4 w-4 text-status-success" />
              <span className="text-xs font-medium text-muted-foreground">
                Net Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.totalNetRevenue / 1000).toFixed(0)}K
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-status-info" />
              <span className="text-xs font-medium text-muted-foreground">
                Paid Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.paidRevenue / 1000).toFixed(0)}K
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Percent className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">
                Avg. Net/Loan
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.avgNetRevenue / 1000).toFixed(1)}K
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              <span className="text-xs font-medium text-muted-foreground">
                Closed Deals
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics.closedLoans}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by borrower name or deal ID..."
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
                Payment Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground md:w-48"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="funded">Funded</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          )}
        </div>

        {/* Revenue Table */}
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
                  YSP
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Lender Fees
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Origination Fee
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  LO Commission
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Gross Revenue
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Net Revenue
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRevenues.map((revenue, idx) => (
                <tr
                  key={revenue.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    idx % 2 === 0 ? "bg-background" : "bg-card"
                  )}
                >
                  <td className="px-4 py-3">
                    {editingId === revenue.id ? (
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
                          {revenue.borrowerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {revenue.id}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground font-medium">
                    {editingId === revenue.id ? (
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
                      `$${(revenue.loanAmount / 1000).toFixed(0)}K`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {editingId === revenue.id ? (
                      <Input
                        type="number"
                        value={editingData?.ysp || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            ysp: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${revenue.ysp.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {editingId === revenue.id ? (
                      <Input
                        type="number"
                        value={editingData?.lenderFees || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            lenderFees: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${revenue.lenderFees.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {editingId === revenue.id ? (
                      <Input
                        type="number"
                        value={editingData?.originationFee || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            originationFee: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${revenue.originationFee.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {editingId === revenue.id ? (
                      <Input
                        type="number"
                        value={editingData?.loCommission || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            loCommission: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${revenue.loCommission.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground font-medium">
                    {editingId === revenue.id ? (
                      <span className="text-xs">
                        ${editingData?.grossRevenue.toFixed(0)}
                      </span>
                    ) : (
                      `$${revenue.grossRevenue.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground font-medium text-status-success">
                    {editingId === revenue.id ? (
                      <span className="text-xs">
                        ${editingData?.netRevenue.toFixed(0)}
                      </span>
                    ) : (
                      `$${revenue.netRevenue.toFixed(0)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === revenue.id ? (
                      <select
                        value={editingData?.status || "pending"}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            status: e.target.value as any,
                          })
                        }
                        className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                      >
                        <option value="pending">Pending</option>
                        <option value="funded">Funded</option>
                        <option value="paid">Paid</option>
                      </select>
                    ) : (
                      <span
                        className={cn(
                          "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                          statusConfig[revenue.status].color
                        )}
                      >
                        {statusConfig[revenue.status].label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === revenue.id ? (
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
                            onClick={() => handleEdit(revenue)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(revenue.id)}
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

          {filteredRevenues.length === 0 && (
            <div className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No deals found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
