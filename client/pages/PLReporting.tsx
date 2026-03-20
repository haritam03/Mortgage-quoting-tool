import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PLData {
  month: string;
  totalRevenue: number;
  yspRevenue: number;
  originationFees: number;
  lenderFees: number;
  otherRevenue: number;
  loCompensation: number;
  processorCompensation: number;
  officeRent: number;
  utilities: number;
  salaries: number;
  technology: number;
  marketing: number;
  insurance: number;
  otherExpenses: number;
}

const samplePLData: PLData[] = [
  {
    month: "January 2024",
    totalRevenue: 125000,
    yspRevenue: 45000,
    originationFees: 35000,
    lenderFees: 25000,
    otherRevenue: 20000,
    loCompensation: 37500,
    processorCompensation: 6250,
    officeRent: 8000,
    utilities: 1200,
    salaries: 45000,
    technology: 3500,
    marketing: 5000,
    insurance: 2500,
    otherExpenses: 2000,
  },
  {
    month: "February 2024",
    totalRevenue: 142000,
    yspRevenue: 51000,
    originationFees: 40000,
    lenderFees: 30000,
    otherRevenue: 21000,
    loCompensation: 42600,
    processorCompensation: 7100,
    officeRent: 8000,
    utilities: 1200,
    salaries: 45000,
    technology: 3500,
    marketing: 5500,
    insurance: 2500,
    otherExpenses: 2200,
  },
  {
    month: "March 2024",
    totalRevenue: 156000,
    yspRevenue: 58000,
    originationFees: 45000,
    lenderFees: 32000,
    otherRevenue: 21000,
    loCompensation: 46800,
    processorCompensation: 7800,
    officeRent: 8000,
    utilities: 1200,
    salaries: 45000,
    technology: 3500,
    marketing: 6000,
    insurance: 2500,
    otherExpenses: 2300,
  },
];

export default function PLReporting() {
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(
    new Set(samplePLData.map((d) => d.month))
  );
  const [viewType, setViewType] = useState<"summary" | "detailed" | "breakdown">("summary");

  // Calculate aggregated metrics for selected months
  const plMetrics = useMemo(() => {
    const selected = samplePLData.filter((d) => selectedMonths.has(d.month));

    const totalRevenue = selected.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalExpenses = selected.reduce((sum, d) => {
      return (
        sum +
        d.loCompensation +
        d.processorCompensation +
        d.officeRent +
        d.utilities +
        d.salaries +
        d.technology +
        d.marketing +
        d.insurance +
        d.otherExpenses
      );
    }, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Revenue breakdown
    const yspRevenue = selected.reduce((sum, d) => sum + d.yspRevenue, 0);
    const originationFees = selected.reduce((sum, d) => sum + d.originationFees, 0);
    const lenderFees = selected.reduce((sum, d) => sum + d.lenderFees, 0);
    const otherRevenue = selected.reduce((sum, d) => sum + d.otherRevenue, 0);

    // Expense breakdown
    const loCompensation = selected.reduce((sum, d) => sum + d.loCompensation, 0);
    const processorCompensation = selected.reduce(
      (sum, d) => sum + d.processorCompensation,
      0
    );
    const officeRent = selected.reduce((sum, d) => sum + d.officeRent, 0);
    const utilities = selected.reduce((sum, d) => sum + d.utilities, 0);
    const salaries = selected.reduce((sum, d) => sum + d.salaries, 0);
    const technology = selected.reduce((sum, d) => sum + d.technology, 0);
    const marketing = selected.reduce((sum, d) => sum + d.marketing, 0);
    const insurance = selected.reduce((sum, d) => sum + d.insurance, 0);
    const otherExpenses = selected.reduce((sum, d) => sum + d.otherExpenses, 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      // Revenue
      yspRevenue,
      originationFees,
      lenderFees,
      otherRevenue,
      // Expenses
      loCompensation,
      processorCompensation,
      officeRent,
      utilities,
      salaries,
      technology,
      marketing,
      insurance,
      otherExpenses,
    };
  }, [selectedMonths]);

  const toggleMonth = (month: string) => {
    const newSelected = new Set(selectedMonths);
    if (newSelected.has(month)) {
      newSelected.delete(month);
    } else {
      newSelected.add(month);
    }
    setSelectedMonths(newSelected);
  };

  const selectAll = () => {
    setSelectedMonths(new Set(samplePLData.map((d) => d.month)));
  };

  const clearAll = () => {
    setSelectedMonths(new Set());
  };

  // Revenue breakdown items
  const revenueItems = [
    { label: "YSP", value: plMetrics.yspRevenue },
    { label: "Origination Fees", value: plMetrics.originationFees },
    { label: "Lender Fees", value: plMetrics.lenderFees },
    { label: "Other", value: plMetrics.otherRevenue },
  ];

  // Expense breakdown items
  const expenseItems = [
    { label: "LO Compensation", value: plMetrics.loCompensation },
    { label: "Processor Comp.", value: plMetrics.processorCompensation },
    { label: "Salaries", value: plMetrics.salaries },
    { label: "Office Rent", value: plMetrics.officeRent },
    { label: "Technology", value: plMetrics.technology },
    { label: "Marketing", value: plMetrics.marketing },
    { label: "Insurance", value: plMetrics.insurance },
    { label: "Utilities", value: plMetrics.utilities },
    { label: "Other", value: plMetrics.otherExpenses },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              P&L Reporting Engine
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Revenue accounting, expense tracking, and profitability analysis
            </p>
          </div>
          <div className="flex gap-2">
            {(["summary", "detailed", "breakdown"] as const).map((type) => (
              <Button
                key={type}
                variant={viewType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType(type)}
              >
                {type === "summary"
                  ? "Summary"
                  : type === "detailed"
                  ? "Detailed"
                  : "Breakdown"}
              </Button>
            ))}
          </div>
        </div>

        {/* Month Filter */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Select Periods</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePLData.map((data) => (
              <button
                key={data.month}
                onClick={() => toggleMonth(data.month)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                  selectedMonths.has(data.month)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted"
                )}
              >
                {data.month.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Metrics */}
        {viewType === "summary" && (
          <div className="space-y-6">
            {/* Top KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-4 w-4 text-status-success" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Revenue
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(plMetrics.totalRevenue / 1000).toFixed(1)}K
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="h-4 w-4 text-status-warning" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Expenses
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(plMetrics.totalExpenses / 1000).toFixed(1)}K
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Net Profit
                  </span>
                </div>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    plMetrics.netProfit >= 0 ? "text-status-success" : "text-destructive"
                  )}
                >
                  ${(plMetrics.netProfit / 1000).toFixed(1)}K
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Percent className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Profit Margin
                  </span>
                </div>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    plMetrics.profitMargin >= 0 ? "text-status-success" : "text-destructive"
                  )}
                >
                  {plMetrics.profitMargin.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Revenue vs Expenses */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Revenue Breakdown */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Breakdown
                </h3>
                <div className="space-y-3">
                  {revenueItems.map((item) => {
                    const percent =
                      plMetrics.totalRevenue > 0
                        ? (item.value / plMetrics.totalRevenue) * 100
                        : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {item.label}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            ${(item.value / 1000).toFixed(1)}K ({percent.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-foreground">
                      ${(plMetrics.totalRevenue / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Expense Breakdown
                </h3>
                <div className="space-y-3">
                  {expenseItems.map((item) => {
                    const percent =
                      plMetrics.totalExpenses > 0
                        ? (item.value / plMetrics.totalExpenses) * 100
                        : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {item.label}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            ${(item.value / 1000).toFixed(1)}K ({percent.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-status-warning transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-foreground">
                      ${(plMetrics.totalExpenses / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* P&L Summary */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                P&L Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-foreground">Total Revenue</span>
                  <span className="font-semibold text-foreground">
                    ${(plMetrics.totalRevenue / 1000).toFixed(1)}K
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-foreground">Total Expenses</span>
                  <span className="font-semibold text-foreground">
                    ${(plMetrics.totalExpenses / 1000).toFixed(1)}K
                  </span>
                </div>
                <div
                  className={cn(
                    "flex items-center justify-between py-2 border-b-2 border-border font-semibold",
                    plMetrics.netProfit >= 0 ? "text-status-success" : "text-destructive"
                  )}
                >
                  <span>Net Profit</span>
                  <span className="text-lg">
                    ${(plMetrics.netProfit / 1000).toFixed(1)}K
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-foreground">Profit Margin</span>
                  <span
                    className={cn(
                      "font-semibold",
                      plMetrics.profitMargin >= 0 ? "text-status-success" : "text-destructive"
                    )}
                  >
                    {plMetrics.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed View */}
        {viewType === "detailed" && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Month
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                      Expenses
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                      Net Profit
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                      Margin %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {samplePLData
                    .filter((d) => selectedMonths.has(d.month))
                    .map((data, idx) => {
                      const expenses =
                        data.loCompensation +
                        data.processorCompensation +
                        data.officeRent +
                        data.utilities +
                        data.salaries +
                        data.technology +
                        data.marketing +
                        data.insurance +
                        data.otherExpenses;
                      const netProfit = data.totalRevenue - expenses;
                      const margin =
                        data.totalRevenue > 0
                          ? (netProfit / data.totalRevenue) * 100
                          : 0;

                      return (
                        <tr
                          key={data.month}
                          className={cn(
                            "border-b border-border transition-colors hover:bg-muted/30",
                            idx % 2 === 0 ? "bg-background" : "bg-card"
                          )}
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {data.month}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">
                            ${(data.totalRevenue / 1000).toFixed(1)}K
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">
                            ${(expenses / 1000).toFixed(1)}K
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3 text-right font-semibold",
                              netProfit >= 0 ? "text-status-success" : "text-destructive"
                            )}
                          >
                            ${(netProfit / 1000).toFixed(1)}K
                          </td>
                          <td
                            className={cn(
                              "px-4 py-3 text-right font-semibold",
                              margin >= 0 ? "text-status-success" : "text-destructive"
                            )}
                          >
                            {margin.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Breakdown View */}
        {viewType === "breakdown" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Revenue Details */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Revenue Details
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "YSP Revenue", value: plMetrics.yspRevenue },
                    { label: "Origination Fees", value: plMetrics.originationFees },
                    { label: "Lender Fees", value: plMetrics.lenderFees },
                    { label: "Other Revenue", value: plMetrics.otherRevenue },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">
                        ${(item.value / 1000).toFixed(1)}K
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-lg font-bold text-foreground">
                        ${(plMetrics.totalRevenue / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expense Details */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Expense Details
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "LO Compensation", value: plMetrics.loCompensation },
                    { label: "Processor Comp.", value: plMetrics.processorCompensation },
                    { label: "Salaries", value: plMetrics.salaries },
                    { label: "Office Rent", value: plMetrics.officeRent },
                    { label: "Technology", value: plMetrics.technology },
                    { label: "Marketing", value: plMetrics.marketing },
                    { label: "Insurance", value: plMetrics.insurance },
                    { label: "Utilities", value: plMetrics.utilities },
                    { label: "Other", value: plMetrics.otherExpenses },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span className="text-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">
                        ${(item.value / 1000).toFixed(1)}K
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-lg font-bold text-foreground">
                        ${(plMetrics.totalExpenses / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
