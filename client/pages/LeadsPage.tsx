import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Edit2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sampleLeads, type LeadDetail } from "@/lib/leadData";

const statusConfig = {
  active: { label: "Active", color: "bg-status-success text-white" },
  pending: { label: "Pending", color: "bg-status-warning text-white" },
  funded: { label: "Funded", color: "bg-status-info text-white" },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground" },
};

const loanProgramOptions = ["Conventional", "FHA", "VA", "USDA"];
const stateOptions = ["CA", "TX", "NY", "FL", "WA", "AZ"];

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    status: "" as string,
    type: "" as string,
    loanProgram: "" as string,
    state: "" as string,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search leads
  const filteredLeads = useMemo(() => {
    return sampleLeads.filter((lead) => {
      const fullName = `${lead.firstName} ${lead.lastName}`;
      const searchMatch =
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = !filters.status || lead.status === filters.status;
      const typeMatch = !filters.type || lead.type === filters.type;
      const programMatch =
        !filters.loanProgram || lead.loanProgram === filters.loanProgram;
      const stateMatch = !filters.state || lead.state === filters.state;

      return searchMatch && statusMatch && typeMatch && programMatch && stateMatch;
    });
  }, [searchTerm, filters]);

  const toggleLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const toggleAllLeads = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((lead) => lead.id)));
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      type: "",
      loanProgram: "",
      state: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and track your leads
            </p>
          </div>
          <Link to="/leads/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Lead
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
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

          {/* Filter Options */}
          {showFilters && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="funded">Funded</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">All Types</option>
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Loan Program
                  </label>
                  <select
                    value={filters.loanProgram}
                    onChange={(e) =>
                      setFilters({ ...filters, loanProgram: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">All Programs</option>
                    {loanProgramOptions.map((program) => (
                      <option key={program} value={program}>
                        {program}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    State
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) =>
                      setFilters({ ...filters, state: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">All States</option>
                    {stateOptions.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedLeads.size > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <span className="text-sm font-medium text-foreground">
              {selectedLeads.size} lead{selectedLeads.size !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedLeads.size === filteredLeads.length &&
                      filteredLeads.length > 0
                    }
                    onChange={toggleAllLeads}
                    className="h-4 w-4 rounded border-input"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  State
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Loan Program
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                  LTV
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, idx) => (
                <tr
                  key={lead.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    idx % 2 === 0 ? "bg-background" : "bg-card"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={() => toggleLead(lead.id)}
                      className="h-4 w-4 rounded border-input"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{lead.firstName} {lead.lastName}</div>
                    <div className="text-xs text-muted-foreground">{lead.id}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{lead.state}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {lead.loanProgram}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground font-medium">
                    ${(lead.loanAmount / 1000).toFixed(0)}K
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    <span
                      className={cn(
                        "inline-block px-2 py-1 rounded text-sm font-medium",
                        lead.ltv >= 90
                          ? "bg-status-warning/20 text-status-warning"
                          : "bg-status-success/20 text-status-success"
                      )}
                    >
                      {lead.ltv}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                        statusConfig[lead.status].color
                      )}
                    >
                      {statusConfig[lead.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                        lead.type === "inbound"
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary/20 text-secondary"
                      )}
                    >
                      {lead.type === "inbound" ? "📥 In" : "📤 Out"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link to={`/leads/${lead.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/leads/${lead.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLeads.length === 0 && (
            <div className="py-12 text-center">
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No leads found</p>
                <p className="text-xs mt-1">
                  {searchTerm || hasActiveFilters ? "Try adjusting your filters" : "Create your first lead"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        {filteredLeads.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredLeads.length} of {sampleLeads.length} leads
            </span>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
