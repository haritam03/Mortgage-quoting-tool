import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Mail,
  Phone,
  User as UserIcon,
  Hash,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { UserRole, RegisterResponse } from "@shared/auth";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    contactNumber: "",
    nmlsNumber: "",
    role: "loan_officer" as UserRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else {
      const digits = form.contactNumber.replace(/[\s\-\(\)]/g, "");
      if (!/^\d+$/.test(digits)) {
        newErrors.contactNumber = "Must contain only digits";
      } else if (digits.length < 7 || digits.length > 15) {
        newErrors.contactNumber = "Must be 7-15 digits";
      }
    }

    if (form.role === "loan_officer" && !form.nmlsNumber.trim()) {
      newErrors.nmlsNumber = "NMLS is required for Loan Officers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data: RegisterResponse = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.message);
        return;
      }

      setSuccess(true);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setServerError("");
  };

  // ── Success screen ───────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Registration Successful
            </h2>
            <p className="text-muted-foreground mb-6">
              Your account has been created and is pending admin approval.
              You'll be able to log in once your account is activated.
            </p>
            <Button onClick={() => navigate("/login")} className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <UserPlus className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Register to get started with VNM Loans
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          {serverError && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="reg-name" className="text-sm font-medium">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={cn("pl-10", errors.name && "border-destructive")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-sm font-medium">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={cn("pl-10", errors.email && "border-destructive")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="reg-contact" className="text-sm font-medium">
                Contact Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-contact"
                  placeholder="5551234567"
                  value={form.contactNumber}
                  onChange={(e) => updateField("contactNumber", e.target.value)}
                  className={cn(
                    "pl-10",
                    errors.contactNumber && "border-destructive"
                  )}
                />
              </div>
              {errors.contactNumber && (
                <p className="text-xs text-destructive">{errors.contactNumber}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="reg-role" className="text-sm font-medium">
                Role <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                <select
                  id="reg-role"
                  value={form.role}
                  onChange={(e) =>
                    updateField("role", e.target.value)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none cursor-pointer"
                >
                  <option value="loan_officer">Loan Officer</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                Super Admin accounts can only be created by existing admins
              </p>
            </div>

            {/* NMLS Number */}
            <div className="space-y-2">
              <Label htmlFor="reg-nmls" className="text-sm font-medium">
                NMLS Number{" "}
                {form.role === "loan_officer" && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-nmls"
                  placeholder="123456"
                  value={form.nmlsNumber}
                  onChange={(e) => updateField("nmlsNumber", e.target.value)}
                  className={cn(
                    "pl-10",
                    errors.nmlsNumber && "border-destructive"
                  )}
                />
              </div>
              {errors.nmlsNumber && (
                <p className="text-xs text-destructive">{errors.nmlsNumber}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gap-2 h-11 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
