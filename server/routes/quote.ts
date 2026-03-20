import { RequestHandler } from "express";
import type {
  QuoteInput,
  QuoteResult,
  QuoteScenario,
  FeeItem,
  MonthlyBreakdown,
  ClosingCostSummary,
  ShareQuoteRequest,
  ShareQuoteResponse,
  QuoteSettings,
} from "@shared/quote";
export const activeQuotes = new Map<string, QuoteResult>();

// ── Quote Settings (In-memory) ───────────────────────────────────
let quoteSettings: QuoteSettings = {
  profile: {
    name: "System Admin",
    title: "Loan Officer",
    email: "admin@vnmloans.com",
    phone: "+1 (555) 123-4567",
    nmls: "123456",
  },
  purchaseTemplate: {
    id: "purchase-refi-default",
    name: "Purchase / Refinance Defaults",
    origination: { adminFee: 1895, underwritingFee: 995 },
    servicesNoShop: { appraisal: 675, creditReport: 50, processing: 995, floodCert: 8, taxService: 85 },
    servicesShop: { notaryFee: 225, settlementFee: 1950, recordingService: 13 },
    govtTaxes: { recordingFeeDefault: 115 },
    prepaids: { insuranceMonths: 12, taxesMonths: 12, interestDays: 15 },
    escrow: { insuranceMonths: 3, taxesMonths: 6 },
  },
  helocTemplate: {
    id: "heloc-default",
    name: "Home Equity Defaults",
    origination: { adminFee: 0, underwritingFee: 995 },
    servicesNoShop: { appraisal: 550, creditReport: 50, processing: 0, floodCert: 8, taxService: 0 },
    servicesShop: { notaryFee: 0, settlementFee: 500, recordingService: 0 },
    govtTaxes: { recordingFeeDefault: 115 },
    prepaids: { insuranceMonths: 0, taxesMonths: 0, interestDays: 0 },
    escrow: { insuranceMonths: 0, taxesMonths: 0 },
  },
  stateLookups: [
    { state: "AL", stateFull: "Alabama", propertyTaxRate: 0.41, titleInsurancePer1k: 2.50, transferTaxPer1k: 0.50, recordingFee: 50 },
    { state: "AK", stateFull: "Alaska", propertyTaxRate: 1.21, titleInsurancePer1k: 3.00, transferTaxPer1k: 0, recordingFee: 75 },
    { state: "AZ", stateFull: "Arizona", propertyTaxRate: 0.64, titleInsurancePer1k: 3.20, transferTaxPer1k: 2.20, recordingFee: 55 },
    { state: "AR", stateFull: "Arkansas", propertyTaxRate: 0.62, titleInsurancePer1k: 2.80, transferTaxPer1k: 0, recordingFee: 45 },
    { state: "CA", stateFull: "California", propertyTaxRate: 0.74, titleInsurancePer1k: 3.00, transferTaxPer1k: 1.10, recordingFee: 75 },
    { state: "CO", stateFull: "Colorado", propertyTaxRate: 0.51, titleInsurancePer1k: 2.75, transferTaxPer1k: 0.10, recordingFee: 50 },
    { state: "CT", stateFull: "Connecticut", propertyTaxRate: 2.13, titleInsurancePer1k: 4.50, transferTaxPer1k: 7.50, recordingFee: 110 },
    { state: "DE", stateFull: "Delaware", propertyTaxRate: 0.57, titleInsurancePer1k: 3.80, transferTaxPer1k: 30.00, recordingFee: 80 },
    { state: "DC", stateFull: "Dist. of Columbia", propertyTaxRate: 0.85, titleInsurancePer1k: 5.00, transferTaxPer1k: 11.00, recordingFee: 100 },
    { state: "FL", stateFull: "Florida", propertyTaxRate: 0.86, titleInsurancePer1k: 5.75, transferTaxPer1k: 7.00, recordingFee: 60 },
    { state: "GA", stateFull: "Georgia", propertyTaxRate: 0.91, titleInsurancePer1k: 3.50, transferTaxPer1k: 1.00, recordingFee: 55 },
    { state: "HI", stateFull: "Hawaii", propertyTaxRate: 0.28, titleInsurancePer1k: 2.50, transferTaxPer1k: 1.00, recordingFee: 65 },
    { state: "ID", stateFull: "Idaho", propertyTaxRate: 0.66, titleInsurancePer1k: 2.80, transferTaxPer1k: 0, recordingFee: 40 },
    { state: "IL", stateFull: "Illinois", propertyTaxRate: 2.24, titleInsurancePer1k: 4.00, transferTaxPer1k: 0.50, recordingFee: 110 },
    { state: "IN", stateFull: "Indiana", propertyTaxRate: 0.84, titleInsurancePer1k: 3.00, transferTaxPer1k: 0, recordingFee: 50 },
    { state: "IA", stateFull: "Iowa", propertyTaxRate: 1.52, titleInsurancePer1k: 2.50, transferTaxPer1k: 0.80, recordingFee: 45 },
    { state: "KS", stateFull: "Kansas", propertyTaxRate: 1.39, titleInsurancePer1k: 3.20, transferTaxPer1k: 0, recordingFee: 50 },
    { state: "KY", stateFull: "Kentucky", propertyTaxRate: 0.85, titleInsurancePer1k: 2.80, transferTaxPer1k: 0.50, recordingFee: 45 },
    { state: "LA", stateFull: "Louisiana", propertyTaxRate: 0.55, titleInsurancePer1k: 3.50, transferTaxPer1k: 0, recordingFee: 80 },
    { state: "ME", stateFull: "Maine", propertyTaxRate: 1.27, titleInsurancePer1k: 2.80, transferTaxPer1k: 2.20, recordingFee: 50 },
    { state: "MD", stateFull: "Maryland", propertyTaxRate: 1.07, titleInsurancePer1k: 5.00, transferTaxPer1k: 11.00, recordingFee: 90 },
    { state: "MA", stateFull: "Massachusetts", propertyTaxRate: 1.17, titleInsurancePer1k: 4.50, transferTaxPer1k: 4.56, recordingFee: 125 },
    { state: "MI", stateFull: "Michigan", propertyTaxRate: 1.45, titleInsurancePer1k: 3.80, transferTaxPer1k: 7.50, recordingFee: 60 },
    { state: "MN", stateFull: "Minnesota", propertyTaxRate: 1.11, titleInsurancePer1k: 3.50, transferTaxPer1k: 3.30, recordingFee: 70 },
    { state: "MS", stateFull: "Mississippi", propertyTaxRate: 0.79, titleInsurancePer1k: 2.50, transferTaxPer1k: 0, recordingFee: 40 },
    { state: "MO", stateFull: "Missouri", propertyTaxRate: 0.98, titleInsurancePer1k: 3.20, transferTaxPer1k: 0, recordingFee: 50 },
    { state: "MT", stateFull: "Montana", propertyTaxRate: 0.75, titleInsurancePer1k: 2.80, transferTaxPer1k: 0, recordingFee: 45 },
    { state: "NE", stateFull: "Nebraska", propertyTaxRate: 1.67, titleInsurancePer1k: 3.00, transferTaxPer1k: 2.25, recordingFee: 50 },
    { state: "NV", stateFull: "Nevada", propertyTaxRate: 0.59, titleInsurancePer1k: 3.20, transferTaxPer1k: 3.90, recordingFee: 60 },
    { state: "NH", stateFull: "New Hampshire", propertyTaxRate: 2.13, titleInsurancePer1k: 2.80, transferTaxPer1k: 7.50, recordingFee: 110 },
    { state: "NJ", stateFull: "New Jersey", propertyTaxRate: 2.47, titleInsurancePer1k: 5.50, transferTaxPer1k: 4.00, recordingFee: 120 },
    { state: "NM", stateFull: "New Mexico", propertyTaxRate: 0.79, titleInsurancePer1k: 3.00, transferTaxPer1k: 0, recordingFee: 50 },
    { state: "NY", stateFull: "New York", propertyTaxRate: 1.92, titleInsurancePer1k: 4.50, transferTaxPer1k: 4.00, recordingFee: 120 },
    { state: "NC", stateFull: "North Carolina", propertyTaxRate: 0.78, titleInsurancePer1k: 2.50, transferTaxPer1k: 2.00, recordingFee: 60 },
    { state: "ND", stateFull: "North Dakota", propertyTaxRate: 0.99, titleInsurancePer1k: 2.50, transferTaxPer1k: 0, recordingFee: 40 },
    { state: "OH", stateFull: "Ohio", propertyTaxRate: 1.53, titleInsurancePer1k: 3.50, transferTaxPer1k: 0, recordingFee: 55 },
    { state: "OK", stateFull: "Oklahoma", propertyTaxRate: 0.89, titleInsurancePer1k: 3.00, transferTaxPer1k: 0.75, recordingFee: 45 },
    { state: "OR", stateFull: "Oregon", propertyTaxRate: 0.93, titleInsurancePer1k: 3.20, transferTaxPer1k: 0, recordingFee: 80 },
    { state: "PA", stateFull: "Pennsylvania", propertyTaxRate: 1.50, titleInsurancePer1k: 5.50, transferTaxPer1k: 10.00, recordingFee: 100 },
    { state: "RI", stateFull: "Rhode Island", propertyTaxRate: 1.53, titleInsurancePer1k: 4.00, transferTaxPer1k: 4.60, recordingFee: 100 },
    { state: "SC", stateFull: "South Carolina", propertyTaxRate: 0.56, titleInsurancePer1k: 3.00, transferTaxPer1k: 3.70, recordingFee: 60 },
    { state: "SD", stateFull: "South Dakota", propertyTaxRate: 1.22, titleInsurancePer1k: 2.50, transferTaxPer1k: 0, recordingFee: 40 },
    { state: "TN", stateFull: "Tennessee", propertyTaxRate: 0.67, titleInsurancePer1k: 2.50, transferTaxPer1k: 0.37, recordingFee: 50 },
    { state: "TX", stateFull: "Texas", propertyTaxRate: 2.18, titleInsurancePer1k: 2.80, transferTaxPer1k: 0, recordingFee: 50 },
    { state: "UT", stateFull: "Utah", propertyTaxRate: 0.58, titleInsurancePer1k: 3.20, transferTaxPer1k: 0, recordingFee: 45 },
    { state: "VT", stateFull: "Vermont", propertyTaxRate: 1.86, titleInsurancePer1k: 2.80, transferTaxPer1k: 12.50, recordingFee: 70 },
    { state: "VA", stateFull: "Virginia", propertyTaxRate: 0.81, titleInsurancePer1k: 3.50, transferTaxPer1k: 2.50, recordingFee: 65 },
    { state: "WA", stateFull: "Washington", propertyTaxRate: 0.84, titleInsurancePer1k: 3.25, transferTaxPer1k: 1.28, recordingFee: 85 },
    { state: "WV", stateFull: "West Virginia", propertyTaxRate: 0.57, titleInsurancePer1k: 2.80, transferTaxPer1k: 5.50, recordingFee: 50 },
    { state: "WI", stateFull: "Wisconsin", propertyTaxRate: 1.73, titleInsurancePer1k: 3.50, transferTaxPer1k: 3.00, recordingFee: 60 },
    { state: "WY", stateFull: "Wyoming", propertyTaxRate: 0.57, titleInsurancePer1k: 2.50, transferTaxPer1k: 0, recordingFee: 40 },
  ],
  pmiRates: [
    { scoreRange: "620+", minScore: 620, annualRate: 0.94 },
    { scoreRange: "640+", minScore: 640, annualRate: 0.91 },
    { scoreRange: "660+", minScore: 660, annualRate: 0.80 },
    { scoreRange: "680+", minScore: 680, annualRate: 0.46 },
    { scoreRange: "700+", minScore: 700, annualRate: 0.36 },
    { scoreRange: "720+", minScore: 720, annualRate: 0.31 },
    { scoreRange: "740+", minScore: 740, annualRate: 0.26 },
    { scoreRange: "760+", minScore: 760, annualRate: 0.18 },
    { scoreRange: "780+", minScore: 780, annualRate: 0.16 },
    { scoreRange: "800+", minScore: 800, annualRate: 0.15 },
  ],
};

function getStateCosts(state: string) {
  return quoteSettings.stateLookups.find(s => s.state === state) || {
    state,
    stateFull: "Unknown State",
    propertyTaxRate: 1.25,
    titleInsurancePer1k: 3.50,
    transferTaxPer1k: 1.50,
    recordingFee: 65
  };
}

// ── Rate lookup (keep previous logic) ───────────────────────────


// ── PMI rate lookup (annual % of loan) by credit score ─────────
function getPmiRate(creditScore: number, ltv: number): number {
  if (ltv <= 80) return 0;
  
  // Sort PMI rates descending by score so we find the highest bracket the user fits into
  const sorted = [...quoteSettings.pmiRates].sort((a,b) => b.minScore - a.minScore);
  const match = sorted.find(r => creditScore >= r.minScore);
  
  return match ? match.annualRate : (sorted[sorted.length-1]?.annualRate || 1.05);
}


// ── Monthly P&I calculation (amortization) ──────────────────────
function monthlyPI(principal: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const payments = termYears * 12;
  if (monthlyRate === 0) return principal / payments;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
}

// ── Generate fee breakdown ──────────────────────────────────────
function generateFees(input: QuoteInput, pointsPercent: number, stateCosts: ReturnType<typeof getStateCosts>): FeeItem[] {
  const fees: FeeItem[] = [];
  const t = quoteSettings.purchaseTemplate;

  // A. Origination charges
  if (pointsPercent > 0) {
    fees.push({ label: `Points (${pointsPercent.toFixed(2)}%)`, amount: Math.round(input.loanAmount * pointsPercent / 100), category: "origination" });
  }
  fees.push({ label: "Administration Fee", amount: t.origination.adminFee, category: "origination", editable: true });
  fees.push({ label: "Underwriting Fee", amount: t.origination.underwritingFee, category: "origination", editable: true });

  // B. Services you cannot shop for
  fees.push({ label: "Appraisal Fee", amount: t.servicesNoShop.appraisal, category: "services_no_shop", editable: true });
  fees.push({ label: "Credit Report", amount: t.servicesNoShop.creditReport, category: "services_no_shop", editable: true });
  fees.push({ label: "Flood Determination Fee", amount: t.servicesNoShop.floodCert, category: "services_no_shop", editable: true });
  fees.push({ label: "Processing Fee", amount: t.servicesNoShop.processing, category: "services_no_shop", editable: true });
  fees.push({ label: "Tax Service Fee", amount: t.servicesNoShop.taxService, category: "services_no_shop", editable: true });

  // C. Services you can shop for
  const titleInsuranceAmt = Math.round((input.loanAmount / 1000) * stateCosts.titleInsurancePer1k);
  fees.push({ label: "Title - Lender's Title Policy", amount: titleInsuranceAmt, category: "services_shop", editable: true });
  fees.push({ label: "Title - Notary Fees", amount: t.servicesShop.notaryFee, category: "services_shop", editable: true });
  fees.push({ label: "Title - Recording Service", amount: t.servicesShop.recordingService, category: "services_shop", editable: true });
  fees.push({ label: "Title - Settlement / Closing Fee", amount: t.servicesShop.settlementFee, category: "services_shop", editable: true });

  // E. Government taxes
  fees.push({ label: "Recording Fees", amount: stateCosts.recordingFee, category: "govt_taxes", editable: true });
  const transferTaxAmount = Math.round((input.purchasePrice / 1000) * stateCosts.transferTaxPer1k);
  fees.push({ label: "Transfer Taxes", amount: transferTaxAmount, category: "govt_taxes", editable: true });

  // F. Prepaids
  const annualInsurance = 2350;
  fees.push({ label: `Homeowner's Insurance Premium (${t.prepaids.insuranceMonths} mo)`, amount: Math.round(annualInsurance / 12 * t.prepaids.insuranceMonths), category: "prepaids", editable: true });
  const dailyInterest = (input.loanAmount * 6.5 / 100) / 365;
  fees.push({ label: `Prepaid Interest (${t.prepaids.interestDays} days)`, amount: Math.round(dailyInterest * t.prepaids.interestDays), category: "prepaids", editable: true });
  const annualTax = Math.round(input.purchasePrice * input.taxRate / 100);
  fees.push({ label: `Property Taxes (${t.prepaids.taxesMonths} mo)`, amount: Math.round(annualTax / 12 * t.prepaids.taxesMonths), category: "prepaids", editable: true });

  // G. Escrow
  fees.push({ label: `Homeowner's Insurance (${t.escrow.insuranceMonths} mo)`, amount: Math.round(annualInsurance / 12 * t.escrow.insuranceMonths), category: "escrow", editable: true });
  fees.push({ label: `Property Taxes (${t.escrow.taxesMonths} mo)`, amount: Math.round(annualTax / 12 * t.escrow.taxesMonths), category: "escrow", editable: true });

  return fees;
}

// ── Sum fees by category ────────────────────────────────────────
function sumByCategory(fees: FeeItem[], cat: string): number {
  return fees.filter((f) => f.category === cat).reduce((s, f) => s + f.amount, 0);
}

// ── Build a scenario ────────────────────────────────────────────
function buildScenario(
  id: string,
  name: string,
  description: string,
  rate: number,
  pointsPercent: number,
  lenderCredit: number,
  input: QuoteInput,
  stateCosts: ReturnType<typeof getStateCosts>
): QuoteScenario {
  const fees = generateFees(input, pointsPercent, stateCosts);

  // Monthly calculations
  const pi = monthlyPI(input.loanAmount, rate, input.loanTerm);
  const monthlyTax = Math.round((input.purchasePrice * input.taxRate / 100) / 12);
  const monthlyInsurance = Math.round(2350 / 12);
  const pmiRate = getPmiRate(input.creditScore, input.ltv);
  const monthlyPmi = Math.round((input.loanAmount * pmiRate / 100) / 12);

  const monthly: MonthlyBreakdown = {
    principalAndInterest: Math.round(pi),
    propertyTax: monthlyTax,
    homeInsurance: monthlyInsurance,
    pmi: monthlyPmi,
    totalMonthly: Math.round(pi) + monthlyTax + monthlyInsurance + monthlyPmi,
  };

  // Closing cost summary
  const originationCharges = sumByCategory(fees, "origination");
  const servicesNoShop = sumByCategory(fees, "services_no_shop");
  const servicesShop = sumByCategory(fees, "services_shop");
  const govtTaxes = sumByCategory(fees, "govt_taxes");
  const prepaids = sumByCategory(fees, "prepaids");
  const escrowAtClosing = sumByCategory(fees, "escrow");

  const totalLoanCosts = originationCharges + servicesNoShop + servicesShop;
  const totalOtherCosts = govtTaxes + prepaids + escrowAtClosing;
  const lenderCreditAmount = Math.round(input.loanAmount * lenderCredit / 100);
  const discountPointsCost = pointsPercent > 0 ? Math.round(input.loanAmount * pointsPercent / 100) : 0;
  const totalClosingCosts = totalLoanCosts + totalOtherCosts - lenderCreditAmount;

  const closing: ClosingCostSummary = {
    originationCharges,
    servicesNoShop,
    servicesShop,
    govtTaxes,
    prepaids,
    escrowAtClosing,
    totalLoanCosts,
    totalOtherCosts,
    totalClosingCosts,
    lenderCredit: lenderCreditAmount,
    discountPoints: discountPointsCost,
  };

  // Cash to close = down payment + total closing costs
  const cashToClose = input.downPaymentAmount + totalClosingCosts;

  // Simple APR approximation (rate + amortized cost of fees over loan term)
  const totalFinanceCost = discountPointsCost - lenderCreditAmount;
  const aprAdder = (totalFinanceCost / input.loanAmount) * (12 / (input.loanTerm * 12)) * 100;
  const apr = Math.round((rate + Math.max(0, aprAdder)) * 1000) / 1000;

  return {
    id,
    name,
    description,
    rate,
    apr,
    pointsPercent,
    pointsCost: discountPointsCost,
    lenderCredit: lenderCreditAmount,
    monthly,
    closing,
    cashToClose,
    fees,
  };
}

// ── API: Generate quotes ────────────────────────────────────────
export const handleGenerateQuote: RequestHandler = (req, res) => {
  const input = req.body as QuoteInput;
  const errors: string[] = [];

  if (!input.loanAmount || input.loanAmount <= 0) errors.push("Loan amount must be positive");
  if (!input.purchasePrice || input.purchasePrice <= 0) errors.push("Purchase price must be positive");
  if (input.downPaymentAmount > input.purchasePrice) errors.push("Down payment cannot exceed purchase price");
  if (!input.creditScore || input.creditScore < 300 || input.creditScore > 850) errors.push("Credit score must be 300-850");
  if (!input.loanTerm) errors.push("Loan term is required");

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: errors.join(". "), scenarios: [], input, generatedAt: "", quoteId: "" });
    return;
  }

  const stateCosts = getStateCosts(input.state);

  // Generate 3 scenarios with different pricing strategies
  const baseRate = getBaseRate(input);

  const scenarios: QuoteScenario[] = [
    buildScenario("scenario-buydown", "Buy Down", "Lower rate via discount points", baseRate - 0.25, 1.0, 0, input, stateCosts),
    buildScenario("scenario-nopoints", "No Points", "Par pricing, no extra fees", baseRate, 0, 0, input, stateCosts),
    buildScenario("scenario-nocost", "No Cost", "Lender credit covers closing costs", baseRate + 0.5, 0, 1.0, input, stateCosts),
  ];

  // Mark the middle option as recommended
  scenarios[1].isRecommended = true;

  const result: QuoteResult = {
    success: true,
    scenarios,
    input,
    generatedAt: new Date().toISOString(),
    quoteId: `QT-${Date.now().toString(36).toUpperCase()}`,
  };

  activeQuotes.set(result.quoteId, result);

  res.json(result);
};

export const handleGetQuote: RequestHandler = (req, res) => {
  const { id } = req.params;
  const quote = activeQuotes.get(id as string);
  if (quote) {
    res.json(quote);
  } else {
    res.status(404).json({ success: false, message: "Quote not found" });
  }
};

// ── Base rate lookup ────────────────────────────────────────────
function getBaseRate(input: QuoteInput): number {
  let baseRate = 6.75;

  // Adjustments by credit score
  if (input.creditScore >= 780) baseRate -= 0.375;
  else if (input.creditScore >= 740) baseRate -= 0.25;
  else if (input.creditScore >= 700) baseRate -= 0.125;
  else if (input.creditScore < 660) baseRate += 0.25;

  // Adjustments by LTV
  if (input.ltv > 90) baseRate += 0.125;
  else if (input.ltv <= 60) baseRate -= 0.125;

  // Adjustments by loan program
  if (input.loanProgram === "va") baseRate -= 0.125;
  if (input.loanProgram === "fha") baseRate -= 0.0625;

  // Term adjustment
  if (input.loanTerm === 15) baseRate -= 0.5;

  // Property use adjustment
  if (input.propertyUse === "investment") baseRate += 0.375;
  else if (input.propertyUse === "secondary") baseRate += 0.125;

  return Math.round(baseRate * 1000) / 1000;
}

// ── API: Share quote (email simulation) ─────────────────────────
export const handleShareQuote: RequestHandler = (req, res) => {
  const body = req.body as ShareQuoteRequest;

  if (!body.recipientEmail || !body.recipientName) {
    res.status(400).json({ success: false, message: "Recipient email and name are required" });
    return;
  }

  // In production this would generate a PDF and send via email service
  console.log(`[DEV] Quote ${body.quoteId} shared with ${body.recipientName} (${body.recipientEmail})`);

  const response: ShareQuoteResponse = {
    success: true,
    message: `Quote document sent to ${body.recipientEmail}`,
    documentUrl: `/api/quotes/document/${body.quoteId}`,
  };

  res.json(response);
};

// ── API: Settings ──────────────────────────────────────────────
export const handleGetQuoteSettings: RequestHandler = (req, res) => {
  res.json(quoteSettings);
};

export const handleUpdateQuoteSettings: RequestHandler = (req, res) => {
  const newSettings = req.body as QuoteSettings;
  quoteSettings = { ...quoteSettings, ...newSettings };
  res.json({ success: true, settings: quoteSettings });
};

