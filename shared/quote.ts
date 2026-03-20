/**
 * Shared types for the Mortgage Quote & Pricing Engine
 */

// ── Fee item ──────────────────────────────────────────────────────
export interface FeeItem {
  label: string;
  amount: number;
  category: "origination" | "services_no_shop" | "services_shop" | "govt_taxes" | "prepaids" | "escrow";
  editable?: boolean;
  overridden?: boolean;
}

// ── Monthly payment breakdown ────────────────────────────────────
export interface MonthlyBreakdown {
  principalAndInterest: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  totalMonthly: number;
}

// ── Closing cost summary ────────────────────────────────────────
export interface ClosingCostSummary {
  originationCharges: number;
  servicesNoShop: number;
  servicesShop: number;
  govtTaxes: number;
  prepaids: number;
  escrowAtClosing: number;
  totalLoanCosts: number;
  totalOtherCosts: number;
  totalClosingCosts: number;
  lenderCredit: number;
  discountPoints: number;
}

// ── Quote scenario ──────────────────────────────────────────────
export interface QuoteScenario {
  id: string;
  name: string;
  description: string;
  rate: number;
  apr: number;
  pointsPercent: number;
  pointsCost: number;
  lenderCredit: number;
  monthly: MonthlyBreakdown;
  closing: ClosingCostSummary;
  cashToClose: number;
  fees: FeeItem[];
  isRecommended?: boolean;
}

// ── Quote input ─────────────────────────────────────────────────
export interface QuoteInput {
  leadId: string;
  clientName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;
  taxRate: number;
  loanPurpose: "purchase" | "refinance" | "cashout";
  loanProgram: "conventional" | "fha" | "va" | "usda";
  rateType: "fixed" | "arm";
  loanTerm: number;
  creditScore: number;
  purchasePrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  loanAmount: number;
  ltv: number;
  propertyType: "single_family" | "condo" | "townhouse" | "multi_family";
  propertyUse: "primary" | "secondary" | "investment";
}

// ── Quote result ────────────────────────────────────────────────
export interface QuoteResult {
  success: boolean;
  message?: string;
  scenarios: QuoteScenario[];
  input: QuoteInput;
  generatedAt: string;
  quoteId: string;
}

// ── Monthly escrow ──────────────────────────────────────────────
export interface MonthlyEscrow {
  propertyTax: number;
  homeInsurance: number;
  totalMonthlyEscrow: number;
}

// ── Share quote request ─────────────────────────────────────────
export interface ShareQuoteRequest {
  quoteId: string;
  recipientEmail: string;
  recipientName: string;
  scenarios: QuoteScenario[];
  input: QuoteInput;
  selectedScenarioId?: string;
  nmls?: string;
  branding?: string;
}

export interface ShareQuoteResponse {
  success: boolean;
  message: string;
  documentUrl?: string;
}

// ── Quote Settings & Templates ───────────────────────────────────
export interface LoanOfficerProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  nmls: string;
  photoUrl?: string;
  applicationUrl?: string;
}

export interface FeeTemplate {
  id: string;
  name: string;
  origination: {
    adminFee: number;
    underwritingFee: number;
  };
  servicesNoShop: {
    appraisal: number;
    creditReport: number;
    processing: number;
    floodCert: number;
    taxService: number;
  };
  servicesShop: {
    notaryFee: number;
    settlementFee: number;
    recordingService: number;
  };
  govtTaxes: {
    recordingFeeDefault: number;
  };
  prepaids: {
    insuranceMonths: number;
    taxesMonths: number;
    interestDays: number;
  };
  escrow: {
    insuranceMonths: number;
    taxesMonths: number;
  };
}

export interface StateLookup {
  state: string;
  stateFull: string;
  propertyTaxRate: number;
  titleInsurancePer1k: number;
  transferTaxPer1k: number;
  recordingFee: number;
}

export interface PmiRateLookup {
  scoreRange: string;
  minScore: number;
  annualRate: number;
}

export interface QuoteSettings {
  profile: LoanOfficerProfile;
  purchaseTemplate: FeeTemplate;
  helocTemplate: FeeTemplate;
  stateLookups: StateLookup[];
  pmiRates: PmiRateLookup[];
}


