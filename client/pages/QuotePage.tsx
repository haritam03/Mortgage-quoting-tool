import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calculator,
  User,
  Home,
  DollarSign,
  Percent,
  ChevronRight,
  ChevronLeft,
  Share2,
  FileText,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  Mail,
  Settings,
  Link as LinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { sampleLeads, type LeadDetail } from "@/lib/leadData";
import type { QuoteInput, QuoteResult, QuoteScenario, FeeItem } from "@shared/quote";

export default function QuotePage() {
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLeadSelect, setShowLeadSelect] = useState(false);

  const [formData, setFormData] = useState<QuoteInput>({
    leadId: "",
    clientName: "",
    email: "",
    phone: "",
    propertyAddress: "",
    city: "",
    state: "CA",
    zip: "",
    taxRate: 1.25,
    loanPurpose: "purchase",
    loanProgram: "conventional",
    rateType: "fixed",
    loanTerm: 30,
    creditScore: 740,
    purchasePrice: 500000,
    downPaymentPercent: 20,
    downPaymentAmount: 100000,
    loanAmount: 400000,
    ltv: 80,
    propertyType: "single_family",
    propertyUse: "primary",
  });

  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeeModal, setShowFeeModal] = useState<QuoteScenario | null>(null);
  const [sharing, setSharing] = useState(false);

  // Auto-calculate loan amount/LTV
  useEffect(() => {
    const price = formData.purchasePrice || 0;
    const dpPercent = formData.downPaymentPercent || 0;
    const dpAmount = (price * dpPercent) / 100;

    const loanAmount = price - dpAmount;
    const ltv = price > 0 ? (loanAmount / price) * 100 : 0;

    setFormData((prev) => ({
      ...prev,
      downPaymentAmount: Math.round(dpAmount * 100) / 100,
      loanAmount: Math.round(loanAmount * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
    }));
  }, [formData.purchasePrice, formData.downPaymentPercent]);

  // Sync with selected lead
  useEffect(() => {
    if (selectedLead) {
      setFormData((prev) => ({
        ...prev,
        leadId: selectedLead.id,
        clientName: `${selectedLead.firstName} ${selectedLead.lastName}`,
        email: selectedLead.email,
        phone: selectedLead.phone,
        propertyAddress: selectedLead.propertyAddress,
        city: selectedLead.city,
        state: selectedLead.state,
        zip: selectedLead.zip,
        taxRate: selectedLead.taxRate,
        loanPurpose: selectedLead.loanPurpose.toLowerCase() as any,
        loanProgram: selectedLead.loanProgram.toLowerCase() as any,
        rateType: selectedLead.rateType.toLowerCase() as any,
        loanTerm: selectedLead.loanTerm,
        creditScore: selectedLead.creditScore,
        purchasePrice: selectedLead.purchasePrice,
        downPaymentPercent: selectedLead.downPaymentPercent,
        downPaymentAmount: selectedLead.downPaymentAmount,
        loanAmount: selectedLead.loanAmount,
        ltv: selectedLead.ltv,
        propertyType: selectedLead.propertyType.toLowerCase().replace(" ", "_") as any,
        propertyUse: selectedLead.propertyUse.toLowerCase().replace(" ", "_") as any,
      }));
    }
  }, [selectedLead]);

  const handleGenerateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const resp = await fetch("/api/quotes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Failed to generate quote");

      setQuoteResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareQuote = async () => {
    if (!quoteResult) return;
    setSharing(true);
    try {
      const resp = await fetch("/api/quotes/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: quoteResult.quoteId,
          recipientEmail: formData.email,
          recipientName: formData.clientName,
          scenarios: quoteResult.scenarios,
          input: formData,
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        alert("Quote shared successfully!");
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      alert("Failed to share: " + err.message);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = () => {
    if (!quoteResult) return;
    const shareUrl = `${window.location.origin}/quote/shared/${quoteResult.quoteId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert("Shareable link copied to clipboard!"))
      .catch((err) => alert("Failed to copy link: " + err.message));
  };

  const filteredLeads = sampleLeads.filter((l) =>
    `${l.firstName} ${l.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              Mortgage Quote Engine
            </h1>
            <p className="text-muted-foreground mt-2">
              Generate and compare real-time mortgage pricing scenarios for your clients.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/quotes/settings">
              <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
                <Settings className="h-4 w-4" />
                Manage Templates
              </Button>
            </Link>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setQuoteResult(null);
                setSelectedLead(null);
                setFormData({
                  ...formData,
                  leadId: "",
                  clientName: "",
                  email: "",
                  phone: "",
                  propertyAddress: "",
                  city: "",
                  zip: "",
                });
              }}
            >
              Reset All
            </Button>
            {quoteResult && (
              <>
                <Button variant="outline" className="gap-2" onClick={handleCopyLink}>
                  <LinkIcon className="h-4 w-4" />
                  Copy Link
                </Button>
                <Button className="gap-2" onClick={handleShareQuote} disabled={sharing}>
                  {sharing ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                  Email Quote
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel - Inputs (4/12) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* Lead Selector */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  1. Select Client
                </h3>
                {selectedLead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary"
                    onClick={() => setShowLeadSelect(true)}
                  >
                    Change
                  </Button>
                )}
              </div>

              {!selectedLead || showLeadSelect ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by client name..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowLeadSelect(true)}
                  />
                  {showLeadSelect && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
                      {filteredLeads.length > 0 ? (
                        filteredLeads.map((lead) => (
                          <button
                            key={lead.id}
                            className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors group flex items-center justify-between"
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowLeadSelect(false);
                              setSearchTerm("");
                            }}
                          >
                            <div className="truncate">
                              <p className="font-medium truncate">{lead.firstName} {lead.lastName}</p>
                              <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ) )
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">No clients found</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                    {selectedLead.firstName[0]}
                    {selectedLead.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{selectedLead.firstName} {selectedLead.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{selectedLead.id}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Loan Configuration */}
            <form onSubmit={handleGenerateQuote} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  2. Loan Scenarios
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase leading-none">Purpose</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={formData.loanPurpose}
                      onChange={(e) => setFormData({ ...formData, loanPurpose: e.target.value as any })}
                    >
                      <option value="purchase">Purchase</option>
                      <option value="refinance">Refinance</option>
                      <option value="cashout">Cash-Out</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase leading-none">Program</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={formData.loanProgram}
                      onChange={(e) => setFormData({ ...formData, loanProgram: e.target.value as any })}
                    >
                      <option value="conventional">Conventional</option>
                      <option value="fha">FHA</option>
                      <option value="va">VA</option>
                      <option value="usda">USDA</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase leading-none">Term</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={formData.loanTerm}
                      onChange={(e) => setFormData({ ...formData, loanTerm: parseInt(e.target.value) })}
                    >
                      <option value="30">30 Year Fixed</option>
                      <option value="20">20 Year Fixed</option>
                      <option value="15">15 Year Fixed</option>
                      <option value="10">10 Year Fixed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase leading-none">Credit Score</label>
                    <Input
                      type="number"
                      value={formData.creditScore}
                      onChange={(e) => setFormData({ ...formData, creditScore: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <hr className="border-border/50" />

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase leading-none">Purchase Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase leading-none">Down Payment</label>
                    <div className="relative">
                      <Input
                        type="number"
                        className="pr-8"
                        value={formData.downPaymentPercent}
                        onChange={(e) => setFormData({ ...formData, downPaymentPercent: parseFloat(e.target.value) || 0 })}
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase leading-none opacity-0">Calculated</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        disabled
                        className="pl-9 bg-muted/30"
                        value={formData.downPaymentAmount.toLocaleString()}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border border-border/50">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Loan Amount</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(formData.loanAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">LTV</p>
                    <p className={cn(
                      "text-lg font-bold",
                      formData.ltv > 80 ? "text-amber-500" : "text-green-500"
                    )}>{formData.ltv}%</p>
                  </div>
                </div>

                <Button className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-3">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Generating Quotes...
                    </span>
                  ) : (
                    "View Loan Options"
                  )}
                </Button>
              </div>

              {/* Property Info (Minimized) */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  3. Property & State
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase">State</label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      >
                        <option value="CA">California</option>
                        <option value="TX">Texas</option>
                        <option value="NY">New York</option>
                        <option value="FL">Florida</option>
                        <option value="WA">Washington</option>
                        <option value="AZ">Arizona</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase">ZIP</label>
                      <Input
                        className="h-9 px-2 text-sm"
                        value={formData.zip}
                        onChange={(e) => setFormData({...formData, zip: e.target.value})}
                      />
                    </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Panel - Scenarios (8/12) */}
          <div className="lg:col-span-8 space-y-8 min-h-[600px]">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {!quoteResult && !isLoading && (
              <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-2xl text-center space-y-4 opacity-50 grayscale">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <Calculator className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Ready to Quote</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                    Enter valid client and loan details then click <strong>"View Loan Options"</strong> to see live pricing scenarios.
                  </p>
                </div>
              </div>
            )}

            {isLoading && (
               <div className="grid md:grid-cols-3 gap-6">
                 {[1,2,3].map(i => (
                  <div key={i} className="bg-card rounded-2xl border border-border p-6 space-y-6 animate-pulse">
                    <div className="space-y-2">
                       <div className="h-6 w-1/2 bg-muted rounded" />
                       <div className="h-4 w-3/4 bg-muted rounded" />
                    </div>
                    <div className="h-24 bg-primary/5 rounded-xl flex flex-col items-center justify-center gap-2">
                       <div className="h-8 w-1/2 bg-primary/10 rounded" />
                       <div className="h-4 w-1/3 bg-primary/10 rounded" />
                    </div>
                    <div className="space-y-4">
                       <div className="h-10 bg-muted rounded" />
                       <div className="h-10 bg-muted rounded" />
                       <div className="h-10 bg-muted rounded" />
                    </div>
                  </div>
                 ))}
               </div>
            )}

            {quoteResult && !isLoading && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Pricing Scenarios Identified
                   </h2>
                   <p className="text-xs text-muted-foreground font-mono">
                      {quoteResult.quoteId} • {new Date(quoteResult.generatedAt).toLocaleTimeString()}
                   </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-stretch">
                  {quoteResult.scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={cn(
                        "relative bg-card rounded-2xl border-2 p-6 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
                        scenario.isRecommended
                          ? "border-primary shadow-primary/10"
                          : "border-border shadow-sm hover:border-primary/50"
                      )}
                    >
                      {scenario.isRecommended && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                          Best Match
                        </div>
                      )}

                      <div className="text-center space-y-1 mb-6">
                        <h3 className="text-2xl font-black text-foreground">{scenario.name}</h3>
                        <p className="text-xs text-muted-foreground">{scenario.description}</p>
                      </div>

                      <div className="bg-primary/5 rounded-2xl p-5 text-center mb-8 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total Monthly</p>
                        <p className="text-4xl font-black text-foreground tabular-nums">
                          {formatCurrency(scenario.monthly.totalMonthly)}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">P&I: {formatCurrency(scenario.monthly.principalAndInterest)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Rate</p>
                          <p className="text-lg font-black">{scenario.rate}%</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">APR</p>
                          <p className="text-lg font-black">{scenario.apr}%</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-8 flex-1">
                        <div className="flex items-center justify-between text-sm py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Lender Credit</span>
                          <span className={cn("font-bold", scenario.lenderCredit > 0 ? "text-green-500" : "text-foreground")}>
                            {scenario.lenderCredit > 0 ? `-${formatCurrency(scenario.lenderCredit)}` : "$0"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Discount Points</span>
                          <span className={cn("font-bold")}>
                            {formatCurrency(scenario.pointsCost)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-2 border-b border-border/50 font-bold">
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
                          variant="ghost"
                          className="w-full text-xs font-bold text-primary gap-2 h-10 hover:bg-primary/10"
                          onClick={() => setShowFeeModal(scenario)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Full Fee Breakdown
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fee Breakdown Modal */}
      {showFeeModal && (
        <FeeBreakdownModal
          scenario={showFeeModal}
          onClose={() => setShowFeeModal(null)}
          onUpdate={(updatedScenario) => {
            // Update the scenario in the main results if needed
            if (quoteResult) {
              const newScenarios = quoteResult.scenarios.map(s =>
                s.id === updatedScenario.id ? updatedScenario : s
              );
              setQuoteResult({ ...quoteResult, scenarios: newScenarios });
            }
          }}
          formatCurrency={formatCurrency}
        />
      )}
    </MainLayout>
  );
}

interface FeeBreakdownModalProps {
  scenario: QuoteScenario;
  onClose: () => void;
  onUpdate: (s: QuoteScenario) => void;
  formatCurrency: (n: number) => string;
}

function FeeBreakdownModal({ scenario, onClose, onUpdate, formatCurrency }: FeeBreakdownModalProps) {
  const [fees, setFees] = useState<FeeItem[]>([...scenario.fees]);

  // Recalculate totals whenever fees change
  const totals = {
    origination: fees.filter(f => f.category === "origination").reduce((sum, f) => sum + f.amount, 0),
    servicesNoShop: fees.filter(f => f.category === "services_no_shop").reduce((sum, f) => sum + f.amount, 0),
    servicesShop: fees.filter(f => f.category === "services_shop").reduce((sum, f) => sum + f.amount, 0),
    govtTaxes: fees.filter(f => f.category === "govt_taxes").reduce((sum, f) => sum + f.amount, 0),
    prepaids: fees.filter(f => f.category === "prepaids").reduce((sum, f) => sum + f.amount, 0),
    escrow: fees.filter(f => f.category === "escrow").reduce((sum, f) => sum + f.amount, 0),
  };

  const totalLoanCosts = totals.origination + totals.servicesNoShop + totals.servicesShop;
  const totalOtherCosts = totals.govtTaxes + totals.prepaids + totals.escrow;
  const netClosingCosts = totalLoanCosts + totalOtherCosts - (scenario.lenderCredit || 0);
  const cashToClose = netClosingCosts + (scenario.cashToClose - scenario.closing.totalClosingCosts);

  const handleFeeChange = (label: string, newAmount: number) => {
    const nextFees = fees.map(f => f.label === label ? { ...f, amount: newAmount } : f);
    setFees(nextFees);
  };

  const handleSaveAndClose = () => {
    onUpdate({
      ...scenario,
      fees,
      closing: {
        ...scenario.closing,
        totalLoanCosts,
        totalOtherCosts,
        totalClosingCosts: netClosingCosts,
      },
      cashToClose,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h2 className="text-xl font-black text-foreground">Fee Breakdown — {scenario.name}</h2>
            <p className="text-xs text-muted-foreground mt-1">
               Loan Estimate style summary • <span className="text-primary font-bold">{scenario.rate}% Rate</span>
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-8 overflow-y-auto grid md:grid-cols-2 gap-x-12 gap-y-8">
           {/* Loan Costs */}
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Loan Costs
             </h3>

             <div className="space-y-4">
                <FeeCategorySection
                  title="A. Origination Charges"
                  fees={fees.filter(f => f.category === "origination")}
                  onFeeChange={handleFeeChange}
                  formatCurrency={formatCurrency}
                />
                <FeeCategorySection
                  title="B. Services You Cannot Shop For"
                  fees={fees.filter(f => f.category === "services_no_shop")}
                  onFeeChange={handleFeeChange}
                  formatCurrency={formatCurrency}
                />
                <FeeCategorySection
                  title="C. Services You Can Shop For"
                  fees={fees.filter(f => f.category === "services_shop")}
                  onFeeChange={handleFeeChange}
                  formatCurrency={formatCurrency}
                />

                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex justify-between items-center text-sm font-black uppercase">
                   <span className="text-primary">Total Loan Costs</span>
                   <span className="text-lg">{formatCurrency(totalLoanCosts)}</span>
                </div>
             </div>
           </div>

           {/* Other Costs */}
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Other Costs
             </h3>

             <div className="space-y-4">
                <FeeCategorySection
                  title="E. Government Fees"
                  fees={fees.filter(f => f.category === "govt_taxes")}
                  onFeeChange={handleFeeChange}
                  formatCurrency={formatCurrency}
                />
                <FeeCategorySection
                  title="F. Prepaids"
                  fees={fees.filter(f => f.category === "prepaids")}
                  onFeeChange={handleFeeChange}
                  formatCurrency={formatCurrency}
                />
                <FeeCategorySection
                  title="G. Escrows"
                  fees={fees.filter(f => f.category === "escrow")}
                  onFeeChange={handleFeeChange}
                  formatCurrency={formatCurrency}
                />

                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex justify-between items-center text-sm font-black uppercase">
                   <span className="text-primary">Total Other Costs</span>
                   <span className="text-lg">{formatCurrency(totalOtherCosts)}</span>
                </div>
             </div>

             <div className="pt-8">
                <div className="bg-foreground text-background p-6 rounded-2xl flex justify-between items-center shadow-xl">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Net Closing Costs</p>
                      <p className="text-xs opacity-80">(Loan + Other - Credits)</p>
                   </div>
                   <p className="text-3xl font-black">{formatCurrency(netClosingCosts)}</p>
                </div>

                <div className="mt-4 bg-muted p-4 rounded-xl flex justify-between items-center font-bold">
                   <span className="text-sm uppercase tracking-widest text-muted-foreground">Cash to Close</span>
                   <span className="text-xl">{formatCurrency(cashToClose)}</span>
                </div>
             </div>
           </div>
        </div>

        <div className="p-6 bg-muted/20 border-t border-border flex justify-between items-center">
           <p className="text-xs text-muted-foreground italic max-w-lg">
              * Click on fee amounts to edit. Totals will update in real-time.
           </p>
           <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose} className="font-bold">Cancel</Button>
              <Button onClick={handleSaveAndClose} className="font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Use Updated Fees</Button>
           </div>
        </div>
      </div>
    </div>
  );
}

function FeeCategorySection({ title, fees, onFeeChange, formatCurrency }: {
  title: string;
  fees: FeeItem[];
  onFeeChange: (label: string, amount: number) => void;
  formatCurrency: (n: number) => string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="space-y-1.5">
        {fees.map(f => (
          <div key={f.label} className="flex group items-center justify-between text-sm py-1 border-b border-border/10 last:border-0 h-9">
             <span className="text-muted-foreground truncate mr-4">{f.label}</span>
             <div className="flex items-center gap-1">
                {f.editable !== false ? (
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-1 text-xs">$</span>
                    <input
                      type="number"
                      value={f.amount}
                      onChange={(e) => onFeeChange(f.label, parseInt(e.target.value) || 0)}
                      className="w-20 bg-muted/50 focus:bg-background border-0 focus:ring-1 focus:ring-primary h-7 text-right px-2 rounded font-mono text-sm outline-none transition-all"
                    />
                  </div>
                ) : (
                  <span className="font-mono text-right min-w-[80px] px-2">{formatCurrency(f.amount)}</span>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}

