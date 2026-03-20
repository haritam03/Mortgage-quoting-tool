import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Property Details
  propertyType: string;
  propertyUsage: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  
  // Loan Configuration
  loanProgram: string;
  loanTerm: string;
  interestRate: string;
  
  // Financial Details
  creditScore: string;
  purchasePrice: string;
  downPayment: string;
  loanAmount: string;
  ltv: string;
}

export default function LeadFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    propertyType: "single-family",
    propertyUsage: "primary",
    propertyAddress: "",
    propertyCity: "",
    propertyState: "CA",
    propertyZip: "",
    loanProgram: "conventional",
    loanTerm: "30",
    interestRate: "",
    creditScore: "",
    purchasePrice: "",
    downPayment: "",
    loanAmount: "",
    ltv: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Auto-calculate loan amount and LTV
  useEffect(() => {
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const downPayment = parseFloat(formData.downPayment) || 0;

    if (purchasePrice > 0 && downPayment >= 0) {
      const loanAmount = purchasePrice - downPayment;
      const ltv = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;

      setFormData((prev) => ({
        ...prev,
        loanAmount: loanAmount.toFixed(0),
        ltv: ltv.toFixed(2),
      }));
    }
  }, [formData.purchasePrice, formData.downPayment]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }
    if (!formData.propertyAddress.trim()) {
      newErrors.propertyAddress = "Property address is required";
    }
    if (!formData.creditScore) {
      newErrors.creditScore = "Credit score is required";
    } else if (
      parseInt(formData.creditScore) < 300 ||
      parseInt(formData.creditScore) > 850
    ) {
      newErrors.creditScore = "Credit score must be between 300 and 850";
    }
    if (!formData.purchasePrice) {
      newErrors.purchasePrice = "Purchase price is required";
    }
    if (!formData.downPayment) {
      newErrors.downPayment = "Down payment is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate("/");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? "Edit Lead" : "Create New Lead"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isEditing
              ? "Update lead information and loan details"
              : "Enter client and property information to create a new lead"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Personal Information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name *
                </label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name *
                </label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Smith"
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email *
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone *
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>
          </section>

          {/* Property Details Section */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Property Details
            </h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Street Address *
                </label>
                <Input
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  className={errors.propertyAddress ? "border-destructive" : ""}
                />
                {errors.propertyAddress && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.propertyAddress}
                  </p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City
                  </label>
                  <Input
                    name="propertyCity"
                    value={formData.propertyCity}
                    onChange={handleChange}
                    placeholder="San Francisco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    State
                  </label>
                  <select
                    name="propertyState"
                    value={formData.propertyState}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="CA">CA</option>
                    <option value="TX">TX</option>
                    <option value="NY">NY</option>
                    <option value="FL">FL</option>
                    <option value="WA">WA</option>
                    <option value="AZ">AZ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Zip Code
                  </label>
                  <Input
                    name="propertyZip"
                    value={formData.propertyZip}
                    onChange={handleChange}
                    placeholder="94105"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Property Type
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="single-family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="multi-family">Multi-Family</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Property Usage
                  </label>
                  <select
                    name="propertyUsage"
                    value={formData.propertyUsage}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="primary">Primary Residence</option>
                    <option value="secondary">Secondary Home</option>
                    <option value="investment">Investment Property</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Financial Information Section */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Financial Information
            </h2>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Credit Score *
                </label>
                <Input
                  name="creditScore"
                  type="number"
                  value={formData.creditScore}
                  onChange={handleChange}
                  placeholder="750"
                  min="300"
                  max="850"
                  className={errors.creditScore ? "border-destructive" : ""}
                />
                {errors.creditScore && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.creditScore}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-muted/30 p-4 mb-6 space-y-4">
              <h3 className="font-medium text-foreground text-sm">
                Loan Calculator
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Purchase Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      name="purchasePrice"
                      type="number"
                      value={formData.purchasePrice}
                      onChange={handleChange}
                      placeholder="450000"
                      className={cn(
                        "pl-7",
                        errors.purchasePrice ? "border-destructive" : ""
                      )}
                    />
                  </div>
                  {errors.purchasePrice && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.purchasePrice}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Down Payment *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      name="downPayment"
                      type="number"
                      value={formData.downPayment}
                      onChange={handleChange}
                      placeholder="112500"
                      className={cn(
                        "pl-7",
                        errors.downPayment ? "border-destructive" : ""
                      )}
                    />
                  </div>
                  {errors.downPayment && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.downPayment}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Loan Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      name="loanAmount"
                      type="number"
                      value={formData.loanAmount}
                      readOnly
                      className="pl-7 bg-muted"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Auto-calculated
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    LTV (Loan-to-Value)
                  </label>
                  <div className="relative">
                    <Input
                      name="ltv"
                      type="number"
                      value={formData.ltv}
                      readOnly
                      className="bg-muted"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Auto-calculated
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Loan Configuration Section */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Loan Configuration
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Loan Program
                </label>
                <select
                  name="loanProgram"
                  value={formData.loanProgram}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="conventional">Conventional</option>
                  <option value="fha">FHA</option>
                  <option value="va">VA</option>
                  <option value="usda">USDA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Loan Term (Years)
                </label>
                <select
                  name="loanTerm"
                  value={formData.loanTerm}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="15">15 Years</option>
                  <option value="20">20 Years</option>
                  <option value="30">30 Years</option>
                  <option value="40">40 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Interest Rate (%)
                </label>
                <Input
                  name="interestRate"
                  type="number"
                  value={formData.interestRate}
                  onChange={handleChange}
                  placeholder="6.5"
                  step="0.01"
                />
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? "Update Lead" : "Create Lead"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
