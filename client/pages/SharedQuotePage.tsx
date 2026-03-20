import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  FileText,
  X,
  Building,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuoteResult, QuoteScenario, FeeItem } from "@shared/quote";

export default function SharedQuotePage() {
  const { id } = useParams<{ id: string }>();
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFeeModal, setShowFeeModal] = useState<QuoteScenario | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/quotes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuoteResult(data);
        } else {
          setError(data.message || "Failed to load quote");
        }
      })
      .catch(() => setError("Failed to load quote"))
      .finally(() => setLoading(false));
  }, [id]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex bg-background items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin border-4 border-primary rounded-full border-t-transparent" />
      </div>
    );
  }

  if (error || !quoteResult) {
    return (
      <div className="flex bg-background items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Quote Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Shared Nav */}
      <nav className="border-b bg-card w-full shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
               <h1 className="text-lg font-black tracking-tight leading-none text-foreground">VNM Loans</h1>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 block">Quote Proposal</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 flex items-end justify-between border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Your Mortgage Options
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ref: {quoteResult.quoteId} • Generated: {new Date(quoteResult.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">Client: {quoteResult.input.clientName || "Valued Client"}</p>
            <p className="text-xs text-muted-foreground">Loan Amount: {formatCurrency(quoteResult.input.loanAmount)}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {quoteResult.scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={cn(
                "relative bg-card rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                scenario.isRecommended
                  ? "border-primary border-2 shadow-primary/10"
                  : "border-border shadow-sm hover:border-primary/50"
              )}
            >
              {scenario.isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  Recommended
                </div>
              )}

              <div className="text-center space-y-1 mb-6">
                <h3 className="text-2xl font-black text-foreground">{scenario.name}</h3>
                <p className="text-xs text-muted-foreground">{scenario.description}</p>
              </div>

              <div className="bg-primary/5 rounded-2xl p-5 text-center mb-8 border border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Estimated Monthly</p>
                <p className="text-4xl font-black text-foreground tabular-nums">
                  {formatCurrency(scenario.monthly.totalMonthly)}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-1">P&I: {formatCurrency(scenario.monthly.principalAndInterest)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8 text-center bg-muted/30 p-4 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Rate</p>
                  <p className="text-lg font-black">{scenario.rate}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">APR</p>
                  <p className="text-lg font-black">{scenario.apr}%</p>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-center justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Lender Credit</span>
                  <span className={cn("font-bold", scenario.lenderCredit > 0 ? "text-green-500" : "text-foreground")}>
                    {scenario.lenderCredit > 0 ? `-${formatCurrency(scenario.lenderCredit)}` : "$0"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Discount Points</span>
                  <span className="font-bold">{formatCurrency(scenario.pointsCost)}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b font-bold">
                  <span>Total Closing Costs</span>
                  <span>{formatCurrency(scenario.closing.totalClosingCosts)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-foreground text-background p-4 rounded-xl text-center shadow-inner">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Est. Cash to Close</p>
                   <p className="text-2xl font-black tabular-nums">{formatCurrency(scenario.cashToClose)}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold gap-2 h-10 hover:bg-muted"
                  onClick={() => setShowFeeModal(scenario)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  View Full Breakdown
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showFeeModal && (
        <SharedFeeBreakdownModal
          scenario={showFeeModal}
          onClose={() => setShowFeeModal(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

function SharedFeeBreakdownModal({ 
  scenario, 
  onClose, 
  formatCurrency 
}: { 
  scenario: QuoteScenario; 
  onClose: () => void; 
  formatCurrency: (v: number) => string;
}) {
  const getCatFees = (cat: string) => scenario.fees.filter((f) => f.category === cat);
  const sumCat = (cat: string) => getCatFees(cat).reduce((s, f) => s + f.amount, 0);

  const FeeRow = ({ label, amount }: { label: string; amount: number }) => (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{formatCurrency(amount)}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border shadow-2xl rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200">
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-foreground">Fee Breakdown</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{scenario.name} Scenario</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b pb-2">A. Origination Charges</h3>
            <div className="space-y-1">
              {getCatFees("origination").map((f, i) => <FeeRow key={i} label={f.label} amount={f.amount} />)}
              <div className="flex justify-between font-bold text-sm pt-2 border-t mt-2">
                <span>Total Origination</span>
                <span>{formatCurrency(sumCat("origination"))}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b pb-2">B. Services Cannot Shop For</h3>
            <div className="space-y-1">
              {getCatFees("services_no_shop").map((f, i) => <FeeRow key={i} label={f.label} amount={f.amount} />)}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b pb-2">C. Services Can Shop For</h3>
            <div className="space-y-1">
              {getCatFees("services_shop").map((f, i) => <FeeRow key={i} label={f.label} amount={f.amount} />)}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b pb-2">Total Loan Costs (A+B+C)</h3>
            <div className="flex justify-between font-bold text-lg text-primary">
              <span>Total Loan Costs</span>
              <span>{formatCurrency(scenario.closing.totalLoanCosts)}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b pb-2">E. Taxes and Other Government Fees</h3>
            <div className="space-y-1">
              {getCatFees("govt_taxes").map((f, i) => <FeeRow key={i} label={f.label} amount={f.amount} />)}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b pb-2">F. Prepaids</h3>
            <div className="space-y-1">
              {getCatFees("prepaids").map((f, i) => <FeeRow key={i} label={f.label} amount={f.amount} />)}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b pb-2">G. Initial Escrow Payment</h3>
            <div className="space-y-1">
              {getCatFees("escrow").map((f, i) => <FeeRow key={i} label={f.label} amount={f.amount} />)}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b pb-2">Total Other Costs (E+F+G)</h3>
             <div className="flex justify-between font-bold text-lg text-primary">
              <span>Total Other Costs</span>
              <span>{formatCurrency(scenario.closing.totalOtherCosts)}</span>
            </div>
          </div>           
        </div>
      </div>
    </div>
  );
}
