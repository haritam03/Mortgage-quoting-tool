/**
 * Shared lead data model and sample data used by LeadsPage and LeadDetailsPage.
 */

export interface LeadDetail {
  id: string;
  // Client info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Property address
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;

  // Property details
  propertyType: string;
  propertyUse: string;
  taxRate: number;

  // Loan configuration
  loanPurpose: string;
  loanProgram: string;
  rateType: string;
  loanTerm: number;
  interestRate: number;

  // Financial
  creditScore: number;
  purchasePrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  loanAmount: number;
  ltv: number;

  // Meta
  status: "active" | "pending" | "funded" | "closed";
  type: "inbound" | "outbound";
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  notes: string;
}

export const sampleLeads: LeadDetail[] = [
  {
    id: "LEAD-001",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "(555) 234-5678",
    propertyAddress: "4521 Sunset Blvd",
    city: "Los Angeles",
    state: "CA",
    zip: "90027",
    propertyType: "Single Family",
    propertyUse: "Primary Residence",
    taxRate: 1.25,
    loanPurpose: "Purchase",
    loanProgram: "Conventional",
    rateType: "Fixed",
    loanTerm: 30,
    interestRate: 6.875,
    creditScore: 750,
    purchasePrice: 600000,
    downPaymentPercent: 25,
    downPaymentAmount: 150000,
    loanAmount: 450000,
    ltv: 75,
    status: "active",
    type: "inbound",
    createdAt: "2024-03-15",
    updatedAt: "2024-03-18",
    assignedTo: "Jane Smith",
    notes: "Pre-qualified buyer. Looking to close within 45 days.",
  },
  {
    id: "LEAD-002",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 876-5432",
    propertyAddress: "8900 Ranch Road 620",
    city: "Austin",
    state: "TX",
    zip: "78734",
    propertyType: "Condo",
    propertyUse: "Primary Residence",
    taxRate: 2.18,
    loanPurpose: "Purchase",
    loanProgram: "FHA",
    rateType: "Fixed",
    loanTerm: 30,
    interestRate: 6.5,
    creditScore: 680,
    purchasePrice: 295000,
    downPaymentPercent: 5,
    downPaymentAmount: 14750,
    loanAmount: 280250,
    ltv: 95,
    status: "pending",
    type: "outbound",
    createdAt: "2024-03-14",
    updatedAt: "2024-03-16",
    assignedTo: "Jane Smith",
    notes: "First-time homebuyer. FHA eligible.",
  },
  {
    id: "LEAD-003",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@email.com",
    phone: "(555) 321-9876",
    propertyAddress: "200 Park Avenue South",
    city: "New York",
    state: "NY",
    zip: "10003",
    propertyType: "Condo",
    propertyUse: "Secondary Home",
    taxRate: 1.92,
    loanPurpose: "Purchase",
    loanProgram: "VA",
    rateType: "Adjustable (5/1 ARM)",
    loanTerm: 30,
    interestRate: 6.25,
    creditScore: 710,
    purchasePrice: 481250,
    downPaymentPercent: 20,
    downPaymentAmount: 96250,
    loanAmount: 385000,
    ltv: 80,
    status: "active",
    type: "inbound",
    createdAt: "2024-03-13",
    updatedAt: "2024-03-15",
    assignedTo: "Jane Smith",
    notes: "Veteran. VA loan benefit eligible. Needs COE.",
  },
  {
    id: "LEAD-004",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "(555) 654-3210",
    propertyAddress: "3200 NW 7th Ave",
    city: "Miami",
    state: "FL",
    zip: "33127",
    propertyType: "Townhouse",
    propertyUse: "Primary Residence",
    taxRate: 1.02,
    loanPurpose: "Purchase",
    loanProgram: "USDA",
    rateType: "Fixed",
    loanTerm: 30,
    interestRate: 6.375,
    creditScore: 720,
    purchasePrice: 258824,
    downPaymentPercent: 15,
    downPaymentAmount: 38824,
    loanAmount: 220000,
    ltv: 85,
    status: "funded",
    type: "inbound",
    createdAt: "2024-03-12",
    updatedAt: "2024-03-20",
    assignedTo: "Jane Smith",
    notes: "Rural area. USDA eligible property confirmed.",
  },
  {
    id: "LEAD-005",
    firstName: "David",
    lastName: "Wilson",
    email: "david.w@email.com",
    phone: "(555) 789-0123",
    propertyAddress: "14500 136th Pl NE",
    city: "Woodinville",
    state: "WA",
    zip: "98072",
    propertyType: "Single Family",
    propertyUse: "Primary Residence",
    taxRate: 0.84,
    loanPurpose: "Purchase",
    loanProgram: "Conventional",
    rateType: "Fixed",
    loanTerm: 15,
    interestRate: 6.125,
    creditScore: 790,
    purchasePrice: 743000,
    downPaymentPercent: 30,
    downPaymentAmount: 222900,
    loanAmount: 520100,
    ltv: 70,
    status: "active",
    type: "outbound",
    createdAt: "2024-03-11",
    updatedAt: "2024-03-14",
    assignedTo: "Jane Smith",
    notes: "Excellent credit. Wants aggressive rate. Considering 15-year term.",
  },
  {
    id: "LEAD-006",
    firstName: "Jessica",
    lastName: "Martinez",
    email: "jessica.m@email.com",
    phone: "(555) 456-7890",
    propertyAddress: "7020 E Indian School Rd",
    city: "Scottsdale",
    state: "AZ",
    zip: "85251",
    propertyType: "Single Family",
    propertyUse: "Investment Property",
    taxRate: 0.62,
    loanPurpose: "Refinance",
    loanProgram: "FHA",
    rateType: "Fixed",
    loanTerm: 30,
    interestRate: 7.0,
    creditScore: 700,
    purchasePrice: 344444,
    downPaymentPercent: 10,
    downPaymentAmount: 34444,
    loanAmount: 310000,
    ltv: 90,
    status: "closed",
    type: "inbound",
    createdAt: "2024-03-10",
    updatedAt: "2024-03-22",
    assignedTo: "Jane Smith",
    notes: "Investment property refinance. Rate/term refi.",
  },
];

/** Lookup a lead by ID */
export function getLeadById(id: string): LeadDetail | undefined {
  return sampleLeads.find((l) => l.id === id);
}
