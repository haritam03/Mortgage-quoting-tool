import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  User,
  Table,
  FileText,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MapPin,
  DollarSign,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuoteSettings, LoanOfficerProfile, FeeTemplate, StateLookup, PmiRateLookup } from "@shared/quote";
import { ChevronRight, X } from "lucide-react";

export default function QuoteSettingsPage() {
  const [settings, setSettings] = useState<QuoteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "templates" | "states">("profile");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/quotes/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/quotes/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setStatus({ type: "success", msg: "Settings saved successfully" });
      } else {
        throw new Error("Failed to save");
      }
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
     return (
       <MainLayout>
          <div className="p-8 flex items-center justify-center min-h-[400px]">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
       </MainLayout>
     );
  }

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
           <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                 <Settings className="h-8 w-8 text-primary" />
                 Quote Engine Configuration
              </h1>
              <p className="text-muted-foreground mt-2">Manage loan officer profiles, state-level pricing rules, and fee templates.</p>
           </div>
           <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2" onClick={() => window.location.reload()}>
                 <RotateCcw className="h-4 w-4" />
                 Reset Changes
              </Button>
              <Button className="gap-2 bg-primary hover:bg-primary/90 min-w-[140px]" onClick={handleSave} disabled={saving}>
                 {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <Save className="h-4 w-4" />}
                 Save All Settings
              </Button>
           </div>
        </div>

        {status && (
          <div className={cn(
             "p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
             status.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
          )}>
             {status.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
             <p className="font-medium">{status.msg}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
           {/* Sidebar Tabs */}
           <div className="space-y-2">
              <button
                 onClick={() => setActiveTab("profile")}
                 className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    activeTab === "profile" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"
                 )}
              >
                 <User className="h-5 w-5" />
                 LO Profile
              </button>
              <button
                 onClick={() => setActiveTab("templates")}
                 className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    activeTab === "templates" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"
                 )}
              >
                 <FileText className="h-5 w-5" />
                 Fee Templates
              </button>
              <button
                 onClick={() => setActiveTab("states")}
                 className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    activeTab === "states" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"
                 )}
              >
                 <Table className="h-5 w-5" />
                 State Lookups
              </button>
           </div>

           {/* Content Area */}
           <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
              {activeTab === "profile" && <ProfileSection profile={settings.profile} onChange={(p) => setSettings({...settings, profile: p})} />}
              {activeTab === "templates" && <TemplatesSection template={settings.purchaseTemplate} onChange={(t) => setSettings({...settings, purchaseTemplate: t})} />}
               {activeTab === "states" && (
                 <StatesSection 
                   states={settings.stateLookups} 
                   pmiRates={settings.pmiRates}
                   onStatesChange={(s) => setSettings({...settings, stateLookups: s})} 
                   onPmiChange={(p) => setSettings({...settings, pmiRates: p})}
                 />
               )}
           </div>
        </div>
      </div>
    </MainLayout>
  );
}

function ProfileSection({ profile, onChange }: { profile: LoanOfficerProfile; onChange: (p: LoanOfficerProfile) => void }) {
   return (
      <div className="p-8 space-y-8 animate-in fade-in duration-300">
         <div className="flex items-center gap-4 text-primary">
            <User className="h-6 w-6" />
            <h2 className="text-xl font-bold">Loan Officer Profile</h2>
         </div>
         <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
               <Input value={profile.name} onChange={(e) => onChange({...profile, name: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Title</label>
               <Input value={profile.title} onChange={(e) => onChange({...profile, title: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</label>
               <Input value={profile.email} onChange={(e) => onChange({...profile, email: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Phone</label>
               <Input value={profile.phone} onChange={(e) => onChange({...profile, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">NMLS Number</label>
               <Input value={profile.nmls} onChange={(e) => onChange({...profile, nmls: e.target.value})} />
            </div>
         </div>
      </div>
   )
}

function TemplatesSection({ template, onChange }: { template: FeeTemplate; onChange: (t: FeeTemplate) => void }) {
   return (
      <div className="p-8 space-y-12 animate-in fade-in duration-300">
         <div className="flex items-center gap-4 text-primary">
            <FileText className="h-6 w-6" />
            <h2 className="text-xl font-bold">Fee Templates — {template.name}</h2>
         </div>

         <div className="space-y-8">
            {/* Origination */}
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground border-b border-border pb-2">A. Origination Charges</h3>
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground">Admin Fee</label>
                     <Input type="number" value={template.origination.adminFee} onChange={(e) => onChange({...template, origination: {...template.origination, adminFee: parseInt(e.target.value) || 0}})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground">Underwriting Fee</label>
                     <Input type="number" value={template.origination.underwritingFee} onChange={(e) => onChange({...template, origination: {...template.origination, underwritingFee: parseInt(e.target.value) || 0}})} />
                  </div>
               </div>
            </div>

            {/* No Shop */}
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground border-b border-border pb-2">B. Services You Cannot Shop For</h3>
               <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground">Appraisal</label>
                     <Input type="number" value={template.servicesNoShop.appraisal} onChange={(e) => onChange({...template, servicesNoShop: {...template.servicesNoShop, appraisal: parseInt(e.target.value) || 0}})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground">Credit Report</label>
                     <Input type="number" value={template.servicesNoShop.creditReport} onChange={(e) => onChange({...template, servicesNoShop: {...template.servicesNoShop, creditReport: parseInt(e.target.value) || 0}})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground">Processing</label>
                     <Input type="number" value={template.servicesNoShop.processing} onChange={(e) => onChange({...template, servicesNoShop: {...template.servicesNoShop, processing: parseInt(e.target.value) || 0}})} />
                  </div>
               </div>
            </div>

            {/* Shop */}
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground border-b border-border pb-2">C. Title & Settlement (Defaults)</h3>
               <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground">Notary Fee</label>
                     <Input type="number" value={template.servicesShop.notaryFee} onChange={(e) => onChange({...template, servicesShop: {...template.servicesShop, notaryFee: parseInt(e.target.value) || 0}})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground">Settlement Fee</label>
                     <Input type="number" value={template.servicesShop.settlementFee} onChange={(e) => onChange({...template, servicesShop: {...template.servicesShop, settlementFee: parseInt(e.target.value) || 0}})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground">Recording Service</label>
                     <Input type="number" value={template.servicesShop.recordingService} onChange={(e) => onChange({...template, servicesShop: {...template.servicesShop, recordingService: parseInt(e.target.value) || 0}})} />
                  </div>
               </div>
            </div>

            {/* Prepaids */}
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground border-b border-border pb-2">F. Prepaids (Months/Days Defaults)</h3>
               <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground">Insurance (Mo)</label>
                     <Input type="number" value={template.prepaids.insuranceMonths} onChange={(e) => onChange({...template, prepaids: {...template.prepaids, insuranceMonths: parseInt(e.target.value) || 0}})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground">Taxes (Mo)</label>
                     <Input type="number" value={template.prepaids.taxesMonths} onChange={(e) => onChange({...template, prepaids: {...template.prepaids, taxesMonths: parseInt(e.target.value) || 0}})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground">Interest (Days)</label>
                     <Input type="number" value={template.prepaids.interestDays} onChange={(e) => onChange({...template, prepaids: {...template.prepaids, interestDays: parseInt(e.target.value) || 0}})} />
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

function StatesSection({ 
  states, 
  pmiRates, 
  onStatesChange, 
  onPmiChange 
}: { 
  states: StateLookup[]; 
  pmiRates: PmiRateLookup[];
  onStatesChange: (s: StateLookup[]) => void;
  onPmiChange: (p: PmiRateLookup[]) => void;
}) {
   const [activeModal, setActiveModal] = useState<"propertyTax" | "titleInsurance" | "transferTax" | "recordingFee" | "pmi" | null>(null);

   const categories = [
      { id: "propertyTax", label: "Property Tax Rates by State", sub: "50 states + DC", type: "percent" },
      { id: "titleInsurance", label: "Title Insurance per $1,000", sub: "50 states + DC", type: "currency" },
      { id: "transferTax", label: "Transfer Tax Rates per $1,000", sub: "50 states + DC", type: "currency" },
      { id: "recordingFee", label: "Recording Fees (Flat)", sub: "50 states + DC", type: "currency_flat" },
      { id: "pmi", label: "PMI Rates by Credit Score", sub: "620-800+", type: "percent" },
   ];

   return (
      <div className="p-8 space-y-8 animate-in fade-in duration-300">
         <div className="flex items-center justify-between text-primary">
            <div className="flex items-center gap-4">
              <Table className="h-6 w-6" />
              <h2 className="text-xl font-bold">State Lookup Tables</h2>
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-8 text-[10px] uppercase font-black tracking-widest">
               <RotateCcw className="h-3 w-3" /> Reset to Defaults
            </Button>
         </div>

         <div className="grid gap-3">
            {categories.map((cat) => (
               <button
                  key={cat.id}
                  onClick={() => setActiveModal(cat.id as any)}
                  className="group flex items-center justify-between p-5 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-all text-left"
               >
                  <div className="space-y-1">
                     <p className="font-bold text-foreground group-hover:text-primary transition-colors">{cat.label}</p>
                     <p className="text-xs text-muted-foreground">{cat.sub} — Click to view/edit.</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
               </button>
            ))}
         </div>

         {activeModal === "pmi" ? (
            <PmiModal 
               pmiRates={pmiRates} 
               onClose={() => setActiveModal(null)} 
               onChange={onPmiChange} 
            />
         ) : activeModal ? (
            <StateDataModal
               category={activeModal}
               title={categories.find(c => c.id === activeModal)?.label || ""}
               states={states}
               onClose={() => setActiveModal(null)}
               onChange={onStatesChange}
            />
         ) : null}
      </div>
   )
}

function StateDataModal({ 
  category, 
  title, 
  states, 
  onClose, 
  onChange 
}: { 
  category: "propertyTax" | "titleInsurance" | "transferTax" | "recordingFee";
  title: string;
  states: StateLookup[];
  onClose: () => void;
  onChange: (s: StateLookup[]) => void;
}) {
   const fieldMap = {
      propertyTax: "propertyTaxRate",
      titleInsurance: "titleInsurancePer1k",
      transferTax: "transferTaxPer1k",
      recordingFee: "recordingFee",
   };

   // We'll define some hardcoded defaults to compare against for the purple highlight
   const defaultsMap: Record<string, number> = {
      propertyTaxRate: 1.25,
      titleInsurancePer1k: 3.50,
      transferTaxPer1k: 1.50,
      recordingFee: 65,
   };

   const field = fieldMap[category] as keyof StateLookup;
   const isPercent = category === "propertyTax";
   const isPer1k = category === "titleInsurance" || category === "transferTax";

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
         <div className="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
               <div className="flex items-center gap-3">
                  <Table className="h-5 w-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-black text-foreground leading-none">{title}</h2>
                    <p className="text-[10px] text-muted-foreground mt-1 tracking-tight">Click any value to edit. Modified values shown in <span className="text-purple-500 font-bold uppercase">purple.</span></p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-2 bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">
                     <RotateCcw className="h-3 w-3" /> Reset to Defaults
                  </Button>
                  <Button variant="outline" size="sm" onClick={onClose} className="h-8 gap-2 px-3">
                     <X className="h-4 w-4" /> Close
                  </Button>
               </div>
            </div>

            <div className="p-0 overflow-y-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground sticky top-0 z-10">
                     <tr>
                        <th className="px-8 py-4 w-1/2">STATE</th>
                        <th className="px-8 py-4 text-center">ANNUAL RATE</th>
                        <th className="px-8 py-4 text-right">EXAMPLE ($500K)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {states.map((s, idx) => {
                        const val = s[field] as number;
                        const isModified = val !== defaultsMap[field];
                        
                        let example = "";
                        if (isPercent) example = `$${(Math.round(500000 * val / 100)).toLocaleString()}/yr`;
                        else if (isPer1k) example = `$${(Math.round(500000 / 1000 * val)).toLocaleString()}`;
                        else example = `$${val.toLocaleString()}`;

                        return (
                           <tr key={s.state} className="hover:bg-muted/20 transition-colors group">
                              <td className="px-8 py-4">
                                 <p className="font-bold text-foreground group-hover:text-primary transition-colors">{s.state} — {s.stateFull}</p>
                              </td>
                              <td className="px-8 py-4">
                                 <div className="flex justify-center">
                                   <div className="relative w-28">
                                      <input
                                         type="number"
                                         step="0.01"
                                         className={cn(
                                            "h-8 w-full bg-background border border-border group-hover:border-primary/30 rounded text-center font-mono text-sm outline-none transition-all focus:ring-1 focus:ring-primary",
                                            isModified && "text-purple-500 font-black border-purple-500/30"
                                         )}
                                         value={val}
                                         onChange={(e) => {
                                            const next = [...states];
                                            next[idx] = { ...s, [field]: parseFloat(e.target.value) || 0 };
                                            onChange(next);
                                         }}
                                      />
                                      <span className={cn(
                                        "absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase",
                                        isModified ? "text-purple-500/60" : "text-muted-foreground/50"
                                      )}>
                                         {isPercent ? "%" : isPer1k ? "/1K" : "$"}
                                      </span>
                                   </div>
                                 </div>
                              </td>
                              <td className="px-8 py-4 text-right">
                                 <p className="font-mono text-muted-foreground text-[11px] group-hover:text-foreground transition-colors">
                                    {example}
                                 </p>
                              </td>
                           </tr>
                        )
                     })}
                  </tbody>
               </table>
            </div>


            <div className="p-6 bg-muted/30 border-t border-border flex justify-end">
               <Button onClick={onClose} className="font-black h-10 px-8 shadow-lg shadow-primary/10">Close & Confirm</Button>
            </div>
         </div>
      </div>
   );
}

function PmiModal({ pmiRates, onClose, onChange }: { pmiRates: PmiRateLookup[]; onClose: () => void; onChange: (p: PmiRateLookup[]) => void }) {
   const defaultPmi: Record<string, number> = {
      "620+": 0.94, "640+": 0.91, "660+": 0.80, "680+": 0.46, "700+": 0.36, "720+": 0.31, "740+": 0.26, "760+": 0.18, "780+": 0.16, "800+": 0.15
   };

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
         <div className="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
               <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-black text-foreground">PMI Rates by Credit Score</h2>
                    <p className="text-[10px] text-muted-foreground mt-1 tracking-tight">Click any value to edit. Modified values shown in <span className="text-purple-500 font-bold uppercase">purple.</span></p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-2 bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">
                     <RotateCcw className="h-3 w-3" /> Reset to Defaults
                  </Button>
                  <Button variant="outline" size="sm" onClick={onClose} className="h-8 gap-2 px-3">
                     <X className="h-4 w-4" /> Close
                  </Button>
               </div>
            </div>

            <div className="p-0 overflow-y-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground sticky top-0 z-10">
                     <tr>
                        <th className="px-8 py-4">CREDIT SCORE</th>
                        <th className="px-8 py-4 text-center">ANNUAL RATE</th>
                        <th className="px-8 py-4 text-right">EXAMPLE ($500K)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {pmiRates.map((r, idx) => {
                        const isModified = r.annualRate !== defaultPmi[r.scoreRange];
                        return (
                           <tr key={r.scoreRange} className="hover:bg-muted/20 transition-colors group">
                              <td className="px-8 py-4 font-bold text-foreground group-hover:text-primary transition-colors">{r.scoreRange}</td>
                              <td className="px-8 py-4">
                                 <div className="flex justify-center">
                                   <div className="relative w-28">
                                      <input
                                         type="number"
                                         step="0.01"
                                         className={cn(
                                            "h-8 w-full bg-background border border-border group-hover:border-primary/30 rounded text-center font-mono text-sm outline-none transition-all focus:ring-1 focus:ring-primary",
                                            isModified && "text-purple-500 font-black border-purple-500/30"
                                         )}
                                         value={r.annualRate}
                                         onChange={(e) => {
                                            const next = [...pmiRates];
                                            next[idx] = { ...r, annualRate: parseFloat(e.target.value) || 0 };
                                            onChange(next);
                                         }}
                                      />
                                      <span className={cn(
                                        "absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase",
                                        isModified ? "text-purple-500/60" : "text-muted-foreground/50"
                                      )}>%</span>
                                   </div>
                                 </div>
                              </td>
                              <td className="px-8 py-4 text-right text-[11px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                                 ${(Math.round(500000 * r.annualRate / 100 / 12)).toLocaleString()}/mo
                              </td>
                           </tr>
                        )
                     })}
                  </tbody>
               </table>
            </div>

            <div className="p-6 bg-muted/30 border-t border-border flex justify-end">
               <Button onClick={onClose} className="font-black h-10 px-8 shadow-lg shadow-primary/10">Close & Confirm</Button>
            </div>
         </div>
      </div>
   );
}

