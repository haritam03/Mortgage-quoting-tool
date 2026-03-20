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
  Users,
  DollarSign,
  Percent,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LoanOfficer {
  id: string;
  name: string;
  email: string;
  phone: string;
  commissionSplit: number;
  status: "active" | "inactive";
  loansProcessed: number;
  totalCommission: number;
  paidCommission: number;
  unpaidCommission: number;
  hireDate: string;
  branch: string;
}

interface ProcessorCommission {
  id: string;
  processorName: string;
  loanId: string;
  borrowerName: string;
  commission: number;
  fundedDate: string;
  status: "pending" | "paid";
}

const sampleOfficers: LoanOfficer[] = [
  {
    id: "LO-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "(555) 123-4567",
    commissionSplit: 60,
    status: "active",
    loansProcessed: 24,
    totalCommission: 18500,
    paidCommission: 15200,
    unpaidCommission: 3300,
    hireDate: "2022-03-15",
    branch: "Downtown",
  },
  {
    id: "LO-002",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    phone: "(555) 234-5678",
    commissionSplit: 55,
    status: "active",
    loansProcessed: 19,
    totalCommission: 12800,
    paidCommission: 12800,
    unpaidCommission: 0,
    hireDate: "2023-01-10",
    branch: "Westside",
  },
  {
    id: "LO-003",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    phone: "(555) 345-6789",
    commissionSplit: 50,
    status: "active",
    loansProcessed: 31,
    totalCommission: 21500,
    paidCommission: 20000,
    unpaidCommission: 1500,
    hireDate: "2021-06-20",
    branch: "Downtown",
  },
  {
    id: "LO-004",
    name: "David Wilson",
    email: "david.wilson@company.com",
    phone: "(555) 456-7890",
    commissionSplit: 65,
    status: "active",
    loansProcessed: 15,
    totalCommission: 9700,
    paidCommission: 8200,
    unpaidCommission: 1500,
    hireDate: "2023-07-01",
    branch: "Eastside",
  },
  {
    id: "LO-005",
    name: "Jessica Martinez",
    email: "jessica.martinez@company.com",
    phone: "(555) 567-8901",
    commissionSplit: 50,
    status: "inactive",
    loansProcessed: 8,
    totalCommission: 5200,
    paidCommission: 5200,
    unpaidCommission: 0,
    hireDate: "2023-11-15",
    branch: "Northside",
  },
];

const sampleProcessors: ProcessorCommission[] = [
  {
    id: "PROC-001",
    processorName: "Jennifer Lee",
    loanId: "LOAN-001",
    borrowerName: "John Smith",
    commission: 750,
    fundedDate: "2024-02-28",
    status: "paid",
  },
  {
    id: "PROC-002",
    processorName: "Robert Thompson",
    loanId: "LOAN-002",
    borrowerName: "Sarah Johnson",
    commission: 560,
    fundedDate: "2024-03-10",
    status: "paid",
  },
  {
    id: "PROC-003",
    processorName: "Jennifer Lee",
    loanId: "LOAN-003",
    borrowerName: "Michael Chen",
    commission: 650,
    fundedDate: "2024-03-15",
    status: "pending",
  },
  {
    id: "PROC-004",
    processorName: "Maria Garcia",
    loanId: "LOAN-004",
    borrowerName: "Emily Rodriguez",
    commission: 440,
    fundedDate: "2024-02-15",
    status: "paid",
  },
];

export default function LoanOfficerManagement() {
  const [activeTab, setActiveTab] = useState<"officers" | "compensation" | "processors">(
    "officers"
  );
  const [officers, setOfficers] = useState<LoanOfficer[]>(sampleOfficers);
  const [processors, setProcessors] = useState<ProcessorCommission[]>(
    sampleProcessors
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<LoanOfficer | null>(null);
  const [editingProcId, setEditingProcId] = useState<string | null>(null);
  const [editingProcData, setEditingProcData] = useState<ProcessorCommission | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter officers
  const filteredOfficers = useMemo(() => {
    return officers.filter((officer) => {
      const searchMatch =
        officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.email.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = !statusFilter || officer.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [officers, searchTerm, statusFilter]);

  // Filter processors
  const filteredProcessors = useMemo(() => {
    return processors.filter((proc) => {
      const searchMatch =
        proc.processorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    });
  }, [processors, searchTerm]);

  // Calculate metrics for officers
  const officerMetrics = useMemo(() => {
    const totalOfficers = filteredOfficers.length;
    const activeOfficers = filteredOfficers.filter(
      (o) => o.status === "active"
    ).length;
    const totalCommissions = filteredOfficers.reduce(
      (sum, o) => sum + o.totalCommission,
      0
    );
    const totalPaid = filteredOfficers.reduce(
      (sum, o) => sum + o.paidCommission,
      0
    );
    const totalUnpaid = filteredOfficers.reduce(
      (sum, o) => sum + o.unpaidCommission,
      0
    );
    const avgLoansPerOfficer =
      totalOfficers > 0
        ? filteredOfficers.reduce((sum, o) => sum + o.loansProcessed, 0) /
          totalOfficers
        : 0;

    return {
      totalOfficers,
      activeOfficers,
      totalCommissions,
      totalPaid,
      totalUnpaid,
      avgLoansPerOfficer,
    };
  }, [filteredOfficers]);

  // Calculate metrics for processors
  const processorMetrics = useMemo(() => {
    const totalCommissions = filteredProcessors.reduce(
      (sum, p) => sum + p.commission,
      0
    );
    const paidCommissions = filteredProcessors
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.commission, 0);
    const pendingCommissions = filteredProcessors
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.commission, 0);

    return {
      totalCommissions,
      paidCommissions,
      pendingCommissions,
    };
  }, [filteredProcessors]);

  // Officer CRUD
  const handleEditOfficer = (officer: LoanOfficer) => {
    setEditingId(officer.id);
    setEditingData({ ...officer });
  };

  const handleSaveOfficer = () => {
    if (editingData && editingId) {
      setOfficers(
        officers.map((o) =>
          o.id === editingId ? { ...editingData } : o
        )
      );
      setEditingId(null);
      setEditingData(null);
    }
  };

  const handleDeleteOfficer = (id: string) => {
    setOfficers(officers.filter((o) => o.id !== id));
  };

  const handleAddOfficer = () => {
    const newOfficer: LoanOfficer = {
      id: `LO-${String(officers.length + 1).padStart(3, "0")}`,
      name: "New Officer",
      email: "",
      phone: "",
      commissionSplit: 50,
      status: "active",
      loansProcessed: 0,
      totalCommission: 0,
      paidCommission: 0,
      unpaidCommission: 0,
      hireDate: new Date().toISOString().split("T")[0],
      branch: "",
    };
    setOfficers([...officers, newOfficer]);
    handleEditOfficer(newOfficer);
  };

  // Processor CRUD
  const handleEditProcessor = (proc: ProcessorCommission) => {
    setEditingProcId(proc.id);
    setEditingProcData({ ...proc });
  };

  const handleSaveProcessor = () => {
    if (editingProcData && editingProcId) {
      setProcessors(
        processors.map((p) =>
          p.id === editingProcId ? { ...editingProcData } : p
        )
      );
      setEditingProcId(null);
      setEditingProcData(null);
    }
  };

  const handleDeleteProcessor = (id: string) => {
    setProcessors(processors.filter((p) => p.id !== id));
  };

  const handleAddProcessor = () => {
    const newProcessor: ProcessorCommission = {
      id: `PROC-${String(processors.length + 1).padStart(3, "0")}`,
      processorName: "New Processor",
      loanId: "",
      borrowerName: "",
      commission: 0,
      fundedDate: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    setProcessors([...processors, newProcessor]);
    handleEditProcessor(newProcessor);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Loan Officer & Workforce Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage officers, compensation, and processor assignments
            </p>
          </div>
          <Button onClick={() => {
            if (activeTab === "officers") handleAddOfficer();
            else if (activeTab === "processors") handleAddProcessor();
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab("officers")}
            className={cn(
              "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
              activeTab === "officers"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="inline mr-2 h-4 w-4" />
            Loan Officers
          </button>
          <button
            onClick={() => setActiveTab("compensation")}
            className={cn(
              "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
              activeTab === "compensation"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <DollarSign className="inline mr-2 h-4 w-4" />
            Compensation
          </button>
          <button
            onClick={() => setActiveTab("processors")}
            className={cn(
              "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
              activeTab === "processors"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="inline mr-2 h-4 w-4" />
            Processor Comm.
          </button>
        </div>

        {/* Officers Tab */}
        {activeTab === "officers" && (
          <div className="space-y-6">
            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Officers
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {officerMetrics.totalOfficers}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-4 w-4 text-status-success" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Active
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {officerMetrics.activeOfficers}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-4 w-4 text-status-info" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Comm.
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(officerMetrics.totalCommissions / 1000).toFixed(1)}K
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Percent className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Avg Loans
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {officerMetrics.avgLoansPerOfficer.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
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
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground md:w-48"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            {/* Officers Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      Comm. Split %
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                      Loans
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                      Total Comm.
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                      Paid
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                      Unpaid
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
                  {filteredOfficers.map((officer, idx) => (
                    <tr
                      key={officer.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30",
                        idx % 2 === 0 ? "bg-background" : "bg-card"
                      )}
                    >
                      <td className="px-4 py-3">
                        {editingId === officer.id ? (
                          <Input
                            value={editingData?.name || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                name: e.target.value,
                              })
                            }
                            className="text-xs"
                          />
                        ) : (
                          <div>
                            <div className="font-medium text-foreground">
                              {officer.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {officer.branch}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {editingId === officer.id ? (
                          <div className="space-y-1">
                            <Input
                              type="email"
                              value={editingData?.email || ""}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData!,
                                  email: e.target.value,
                                })
                              }
                              placeholder="Email"
                              className="text-xs"
                            />
                            <Input
                              value={editingData?.phone || ""}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData!,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="Phone"
                              className="text-xs"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {officer.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {officer.phone}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingId === officer.id ? (
                          <Input
                            type="number"
                            value={editingData?.commissionSplit || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                commissionSplit: parseFloat(e.target.value),
                              })
                            }
                            className="text-xs text-center"
                          />
                        ) : (
                          <span className="font-medium">
                            {officer.commissionSplit}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {editingId === officer.id ? (
                          <Input
                            type="number"
                            value={editingData?.loansProcessed || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                loansProcessed: parseInt(e.target.value),
                              })
                            }
                            className="text-xs text-right"
                          />
                        ) : (
                          officer.loansProcessed
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {editingId === officer.id ? (
                          <Input
                            type="number"
                            value={editingData?.totalCommission || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                totalCommission: parseFloat(e.target.value),
                              })
                            }
                            className="text-xs text-right"
                          />
                        ) : (
                          `$${officer.totalCommission.toFixed(0)}`
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-status-success font-medium">
                        {editingId === officer.id ? (
                          <Input
                            type="number"
                            value={editingData?.paidCommission || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                paidCommission: parseFloat(e.target.value),
                              })
                            }
                            className="text-xs text-right"
                          />
                        ) : (
                          `$${officer.paidCommission.toFixed(0)}`
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-status-warning font-medium">
                        {editingId === officer.id ? (
                          <Input
                            type="number"
                            value={editingData?.unpaidCommission || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                unpaidCommission: parseFloat(e.target.value),
                              })
                            }
                            className="text-xs text-right"
                          />
                        ) : (
                          `$${officer.unpaidCommission.toFixed(0)}`
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingId === officer.id ? (
                          <select
                            value={editingData?.status || ""}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                status: e.target.value as any,
                              })
                            }
                            className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span
                            className={cn(
                              "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                              officer.status === "active"
                                ? "bg-status-success text-white"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {officer.status === "active" ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {editingId === officer.id ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={handleSaveOfficer}
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
                                onClick={() => handleEditOfficer(officer)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteOfficer(officer.id)}
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
            </div>
          </div>
        )}

        {/* Compensation Tab */}
        {activeTab === "compensation" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Compensation
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(officerMetrics.totalCommissions / 1000).toFixed(1)}K
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-4 w-4 text-status-success" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Paid Out
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(officerMetrics.totalPaid / 1000).toFixed(1)}K
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Percent className="h-4 w-4 text-status-warning" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Outstanding
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(officerMetrics.totalUnpaid / 1000).toFixed(1)}K
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Compensation Summary by Officer
              </h3>
              <div className="space-y-3">
                {filteredOfficers.map((officer) => (
                  <div
                    key={officer.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">{officer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {officer.loansProcessed} loans | {officer.commissionSplit}%
                        split
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${officer.totalCommission.toFixed(0)}
                      </p>
                      <p className="text-xs text-status-success">
                        Paid: ${officer.paidCommission.toFixed(0)}
                      </p>
                      <p className="text-xs text-status-warning">
                        Pending: ${officer.unpaidCommission.toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Processors Tab */}
        {activeTab === "processors" && (
          <div className="space-y-6">
            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Commission
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(processorMetrics.totalCommissions / 1000).toFixed(1)}K
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-4 w-4 text-status-success" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Paid
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(processorMetrics.paidCommissions / 1000).toFixed(1)}K
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Percent className="h-4 w-4 text-status-warning" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Pending
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(processorMetrics.pendingCommissions / 1000).toFixed(1)}K
                </p>
              </div>
            </div>

            {/* Processors Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Processor Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Loan / Borrower
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                      Commission
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Funded Date
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
                  {filteredProcessors.map((proc, idx) => (
                    <tr
                      key={proc.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30",
                        idx % 2 === 0 ? "bg-background" : "bg-card"
                      )}
                    >
                      <td className="px-4 py-3">
                        {editingProcId === proc.id ? (
                          <Input
                            value={editingProcData?.processorName || ""}
                            onChange={(e) =>
                              setEditingProcData({
                                ...editingProcData!,
                                processorName: e.target.value,
                              })
                            }
                            className="text-xs"
                          />
                        ) : (
                          <div className="font-medium text-foreground">
                            {proc.processorName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {editingProcId === proc.id ? (
                          <div className="space-y-1">
                            <Input
                              value={editingProcData?.loanId || ""}
                              onChange={(e) =>
                                setEditingProcData({
                                  ...editingProcData!,
                                  loanId: e.target.value,
                                })
                              }
                              placeholder="Loan ID"
                              className="text-xs"
                            />
                            <Input
                              value={editingProcData?.borrowerName || ""}
                              onChange={(e) =>
                                setEditingProcData({
                                  ...editingProcData!,
                                  borrowerName: e.target.value,
                                })
                              }
                              placeholder="Borrower"
                              className="text-xs"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">
                              {proc.loanId}
                            </div>
                            <div className="text-muted-foreground">
                              {proc.borrowerName}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {editingProcId === proc.id ? (
                          <Input
                            type="number"
                            value={editingProcData?.commission || ""}
                            onChange={(e) =>
                              setEditingProcData({
                                ...editingProcData!,
                                commission: parseFloat(e.target.value),
                              })
                            }
                            className="text-xs text-right"
                          />
                        ) : (
                          `$${proc.commission.toFixed(0)}`
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {editingProcId === proc.id ? (
                          <Input
                            type="date"
                            value={editingProcData?.fundedDate || ""}
                            onChange={(e) =>
                              setEditingProcData({
                                ...editingProcData!,
                                fundedDate: e.target.value,
                              })
                            }
                            className="text-xs"
                          />
                        ) : (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {proc.fundedDate}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingProcId === proc.id ? (
                          <select
                            value={editingProcData?.status || ""}
                            onChange={(e) =>
                              setEditingProcData({
                                ...editingProcData!,
                                status: e.target.value as any,
                              })
                            }
                            className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                          </select>
                        ) : (
                          <span
                            className={cn(
                              "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                              proc.status === "paid"
                                ? "bg-status-success text-white"
                                : "bg-status-warning text-white"
                            )}
                          >
                            {proc.status === "paid" ? "Paid" : "Pending"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {editingProcId === proc.id ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={handleSaveProcessor}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => setEditingProcId(null)}
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
                                onClick={() => handleEditProcessor(proc)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteProcessor(proc.id)}
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
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
