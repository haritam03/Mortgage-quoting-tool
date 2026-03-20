import { useParams, Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit2,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Building2,
  CreditCard,
  DollarSign,
  Percent,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  Hash,
  Target,
  BadgePercent,
  Landmark,
} from "lucide-react";
import { getLeadById } from "@/lib/leadData";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: {
    label: "Active",
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  pending: {
    label: "Pending",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  funded: {
    label: "Funded",
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  closed: {
    label: "Closed",
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800/50",
  },
};

/** Single detail row inside a card */
function DetailRow({
  icon: Icon,
  label,
  value,
  highlight,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-primary flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-medium text-foreground mt-0.5",
            highlight && "text-primary text-base font-bold",
            mono && "font-mono"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lead = getLeadById(id || "");

  if (!lead) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-destructive/10 p-6 mb-6">
            <FileText className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Lead Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The lead with ID "{id}" does not exist.
          </p>
          <Button onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </Button>
        </div>
      </MainLayout>
    );
  }

  const statusCfg = statusConfig[lead.status];
  const fullName = `${lead.firstName} ${lead.lastName}`;
  const fullAddress = `${lead.propertyAddress}, ${lead.city}, ${lead.state} ${lead.zip}`;
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="mb-3 gap-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leads
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                {lead.firstName[0]}
                {lead.lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {fullName}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground font-mono">
                    {lead.id}
                  </span>
                  <span
                    className={cn(
                      "inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold",
                      statusCfg.bg,
                      statusCfg.color
                    )}
                  >
                    {statusCfg.label}
                  </span>
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded-full text-xs font-semibold",
                      lead.type === "inbound"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    )}
                  >
                    {lead.type === "inbound" ? "📥 Inbound" : "📤 Outbound"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Link to={`/leads/${lead.id}/edit`}>
            <Button className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Lead
            </Button>
          </Link>
        </div>

        {/* ── Content Grid ────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Client Information ──────────────────────────── */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Client Information
            </h2>
            <div className="space-y-0">
              <DetailRow
                icon={User}
                label="Client Name"
                value={fullName}
              />
              <DetailRow
                icon={Mail}
                label="Email Address"
                value={lead.email}
              />
              <DetailRow
                icon={Phone}
                label="Phone Number"
                value={lead.phone}
              />
            </div>
          </section>

          {/* ── Property Information ────────────────────────── */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Property Information
            </h2>
            <div className="space-y-0">
              <DetailRow
                icon={MapPin}
                label="Property Address"
                value={lead.propertyAddress}
              />
              <DetailRow
                icon={Building2}
                label="City / State / ZIP"
                value={`${lead.city}, ${lead.state} ${lead.zip}`}
              />
              <DetailRow
                icon={Home}
                label="Property Type"
                value={lead.propertyType}
              />
              <DetailRow
                icon={Target}
                label="Property Use / Occupancy"
                value={lead.propertyUse}
              />
              <DetailRow
                icon={BadgePercent}
                label="Tax Rate"
                value={`${lead.taxRate}%`}
              />
            </div>
          </section>

          {/* ── Loan Configuration ─────────────────────────── */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Loan Configuration
            </h2>
            <div className="space-y-0">
              <DetailRow
                icon={FileText}
                label="Loan Purpose"
                value={lead.loanPurpose}
              />
              <DetailRow
                icon={Landmark}
                label="Loan Program"
                value={lead.loanProgram}
              />
              <DetailRow
                icon={TrendingUp}
                label="Rate Type"
                value={lead.rateType}
              />
              <DetailRow
                icon={Clock}
                label="Loan Term"
                value={`${lead.loanTerm} Years`}
              />
              <DetailRow
                icon={Percent}
                label="Interest Rate"
                value={`${lead.interestRate}%`}
              />
            </div>
          </section>

          {/* ── Financial Summary ──────────────────────────── */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Financial Summary
            </h2>
            <div className="space-y-0">
              <DetailRow
                icon={CreditCard}
                label="Credit Score"
                value={lead.creditScore}
                highlight
              />
              <DetailRow
                icon={DollarSign}
                label="Purchase Price"
                value={fmt(lead.purchasePrice)}
                mono
              />
              <DetailRow
                icon={Percent}
                label="Down Payment %"
                value={`${lead.downPaymentPercent}%`}
              />
              <DetailRow
                icon={DollarSign}
                label="Down Payment Amount"
                value={fmt(lead.downPaymentAmount)}
                mono
              />
              <DetailRow
                icon={DollarSign}
                label="Loan Amount"
                value={fmt(lead.loanAmount)}
                highlight
                mono
              />
              <DetailRow
                icon={Hash}
                label="LTV (Loan‑to‑Value)"
                value={`${lead.ltv}%`}
                highlight
              />
            </div>
          </section>
        </div>

        {/* ── Quick Stats Bar ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Purchase Price",
              value: fmt(lead.purchasePrice),
              color: "text-foreground",
            },
            {
              label: "Loan Amount",
              value: fmt(lead.loanAmount),
              color: "text-primary",
            },
            {
              label: "LTV",
              value: `${lead.ltv}%`,
              color:
                lead.ltv >= 90
                  ? "text-amber-600"
                  : lead.ltv >= 80
                    ? "text-blue-600"
                    : "text-green-600",
            },
            {
              label: "Credit Score",
              value: lead.creditScore.toString(),
              color:
                lead.creditScore >= 740
                  ? "text-green-600"
                  : lead.creditScore >= 670
                    ? "text-amber-600"
                    : "text-red-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4 text-center shadow-sm"
            >
              <p className="text-xs text-muted-foreground mb-1">
                {stat.label}
              </p>
              <p className={cn("text-xl font-bold", stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Notes & Meta ────────────────────────────────────── */}
        {lead.notes && (
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Notes
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lead.notes}
            </p>
          </section>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pb-6">
          <span>
            Assigned to: <strong className="text-foreground">{lead.assignedTo}</strong>
          </span>
          <span>
            Created {lead.createdAt} · Updated {lead.updatedAt}
          </span>
        </div>
      </div>
    </MainLayout>
  );
}
