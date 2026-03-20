import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Filter,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  Percent,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual" | "one-time";
  month: string;
  isRecurring: boolean;
  status: "paid" | "pending" | "unpaid";
}

const expenseCategories = [
  "Salaries & Payroll",
  "Office Rent",
  "Utilities",
  "Technology & Software",
  "Marketing & Advertising",
  "Insurance",
  "Professional Services",
  "Office Supplies",
  "Travel & Transportation",
  "Training & Development",
  "Depreciation",
  "Miscellaneous",
];

const sampleExpenses: Expense[] = [
  {
    id: "EXP-001",
    category: "Salaries & Payroll",
    description: "Monthly employee salaries",
    amount: 45000,
    frequency: "monthly",
    month: "Mar 2024",
    isRecurring: true,
    status: "paid",
  },
  {
    id: "EXP-002",
    category: "Office Rent",
    description: "Downtown office lease",
    amount: 8000,
    frequency: "monthly",
    month: "Mar 2024",
    isRecurring: true,
    status: "paid",
  },
  {
    id: "EXP-003",
    category: "Technology & Software",
    description: "CRM and software subscriptions",
    amount: 3500,
    frequency: "monthly",
    month: "Mar 2024",
    isRecurring: true,
    status: "paid",
  },
  {
    id: "EXP-004",
    category: "Utilities",
    description: "Electric, water, internet",
    amount: 1200,
    frequency: "monthly",
    month: "Mar 2024",
    isRecurring: true,
    status: "pending",
  },
  {
    id: "EXP-005",
    category: "Insurance",
    description: "Business liability insurance",
    amount: 2500,
    frequency: "monthly",
    month: "Mar 2024",
    isRecurring: true,
    status: "paid",
  },
  {
    id: "EXP-006",
    category: "Marketing & Advertising",
    description: "Digital marketing campaign",
    amount: 5000,
    frequency: "monthly",
    month: "Mar 2024",
    isRecurring: false,
    status: "unpaid",
  },
];

const statusConfig = {
  paid: { label: "Paid", color: "bg-status-success text-white" },
  pending: { label: "Pending", color: "bg-status-warning text-white" },
  unpaid: { label: "Unpaid", color: "bg-destructive text-white" },
};

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Expense | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const searchMatch =
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.id.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = !categoryFilter || exp.category === categoryFilter;
      const monthMatch = !monthFilter || exp.month === monthFilter;
      return searchMatch && categoryMatch && monthMatch;
    });
  }, [expenses, searchTerm, categoryFilter, monthFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const paidExpenses = filteredExpenses
      .filter((e) => e.status === "paid")
      .reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = filteredExpenses
      .filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + e.amount, 0);
    const recurringExpenses = filteredExpenses
      .filter((e) => e.isRecurring)
      .reduce((sum, e) => sum + e.amount, 0);
    const avgExpense =
      filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

    return {
      totalExpenses,
      paidExpenses,
      pendingExpenses,
      recurringExpenses,
      avgExpense,
    };
  }, [filteredExpenses]);

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditingData({ ...expense });
  };

  const handleSaveEdit = () => {
    if (editingData && editingId) {
      setExpenses(
        expenses.map((exp) => (exp.id === editingId ? { ...editingData } : exp))
      );
      setEditingId(null);
      setEditingData(null);
    }
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const handleAddExpense = () => {
    const newExpense: Expense = {
      id: `EXP-${String(expenses.length + 1).padStart(3, "0")}`,
      category: "Miscellaneous",
      description: "New Expense",
      amount: 0,
      frequency: "monthly",
      month: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
      isRecurring: false,
      status: "unpaid",
    };
    setExpenses([...expenses, newExpense]);
    handleEdit(newExpense);
  };

  const uniqueMonths = [...new Set(expenses.map((e) => e.month))];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Expense Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track and manage overhead expenses
            </p>
          </div>
          <Button onClick={handleAddExpense} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Total Expenses
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.totalExpenses / 1000).toFixed(1)}K
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
              ${(metrics.paidExpenses / 1000).toFixed(1)}K
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-4 w-4 text-status-warning" />
              <span className="text-xs font-medium text-muted-foreground">
                Pending
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.pendingExpenses / 1000).toFixed(1)}K
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Percent className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">
                Recurring
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.recurringExpenses / 1000).toFixed(1)}K
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-4 w-4 text-secondary" />
              <span className="text-xs font-medium text-muted-foreground">
                Avg. Expense
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(metrics.avgExpense / 1000).toFixed(1)}K
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
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
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">All Categories</option>
                    {expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Month
                  </label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">All Months</option>
                    {uniqueMonths.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  Frequency
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  Recurring
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  Status
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
              {filteredExpenses.map((expense, idx) => (
                <tr
                  key={expense.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    idx % 2 === 0 ? "bg-background" : "bg-card"
                  )}
                >
                  <td className="px-4 py-3">
                    {editingId === expense.id ? (
                      <Input
                        value={editingData?.description || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            description: e.target.value,
                          })
                        }
                        className="text-xs"
                      />
                    ) : (
                      <div>
                        <div className="font-medium text-foreground">
                          {expense.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {expense.id}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === expense.id ? (
                      <select
                        value={editingData?.category || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            category: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                      >
                        {expenseCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary font-medium">
                        {expense.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {editingId === expense.id ? (
                      <Input
                        type="number"
                        value={editingData?.amount || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            amount: parseFloat(e.target.value),
                          })
                        }
                        className="text-xs text-right"
                      />
                    ) : (
                      `$${expense.amount.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === expense.id ? (
                      <select
                        value={editingData?.frequency || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            frequency: e.target.value as any,
                          })
                        }
                        className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annual">Annual</option>
                        <option value="one-time">One-time</option>
                      </select>
                    ) : (
                      <span className="text-xs capitalize text-muted-foreground">
                        {expense.frequency}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === expense.id ? (
                      <input
                        type="checkbox"
                        checked={editingData?.isRecurring || false}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData!,
                            isRecurring: e.target.checked,
                          })
                        }
                        className="h-4 w-4"
                      />
                    ) : (
                      <span
                        className={cn(
                          "inline-block px-2 py-1 rounded text-xs font-medium",
                          expense.isRecurring
                            ? "bg-status-success/20 text-status-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {expense.isRecurring ? "Yes" : "No"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === expense.id ? (
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
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    ) : (
                      <span
                        className={cn(
                          "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                          statusConfig[expense.status].color
                        )}
                      >
                        {statusConfig[expense.status].label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {editingId === expense.id ? (
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
                      expense.month
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === expense.id ? (
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
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(expense.id)}
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

          {filteredExpenses.length === 0 && (
            <div className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No expenses found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
