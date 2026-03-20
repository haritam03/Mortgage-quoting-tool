import { RequestHandler } from "express";
import type {
  User,
  UserRole,
  UserStatus,
  RegisterRequest,
  RegisterResponse,
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  UpdateUserRequest,
  AdminCreateUserRequest,
  UserListResponse,
  DEFAULT_OTP_CONFIG,
} from "@shared/auth";

// ── In-memory store ────────────────────────────────────────────────
const users: User[] = [
  {
    id: "usr_admin_001",
    name: "System Admin",
    email: "admin@vnmloans.com",
    contactNumber: "5551234567",
    nmlsNumber: "",
    role: "super_admin",
    status: "active",
    branch: "HQ",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_lo_001",
    name: "Jane Smith",
    email: "jane@vnmloans.com",
    contactNumber: "5559876543",
    nmlsNumber: "123456",
    role: "loan_officer",
    status: "active",
    branch: "West Branch",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface OtpRecord {
  otp: string;
  expiresAt: number;
  consumed: boolean;
  attempts: number;
}

const otpStore = new Map<string, OtpRecord>();
const otpRequestCounts = new Map<string, { count: number; resetAt: number }>();

// Config
const OTP_CONFIG = {
  expirySeconds: 300,
  resendLimitPerHour: 5,
  maxRetries: 3,
  lockoutDurationMinutes: 30,
};

// ── Helpers ────────────────────────────────────────────────────────
function generateId(): string {
  return "usr_" + Math.random().toString(36).substring(2, 12);
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Registration ───────────────────────────────────────────────────
export const handleRegister: RequestHandler = (req, res) => {
  const body = req.body as RegisterRequest;
  const errors: string[] = [];

  // Required fields
  if (!body.name?.trim()) errors.push("Name is required");
  if (!body.email?.trim()) errors.push("Email is required");
  if (!body.contactNumber?.trim()) errors.push("Contact number is required");
  if (!body.role) errors.push("Role is required");

  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (body.email && !emailRegex.test(body.email)) {
    errors.push("Invalid email format");
  }

  // Contact number: digits only, 7-15 chars
  if (body.contactNumber) {
    const digits = body.contactNumber.replace(/[\s\-\(\)]/g, "");
    if (!/^\d+$/.test(digits)) {
      errors.push("Contact number must contain only digits");
    } else if (digits.length < 7 || digits.length > 15) {
      errors.push("Contact number must be 7-15 digits");
    }
  }

  // NMLS required for loan officers
  if (body.role === "loan_officer" && !body.nmlsNumber?.trim()) {
    errors.push("NMLS number is required for Loan Officer role");
  }

  // Prevent duplicate super_admin
  if (body.role === "super_admin") {
    const existingAdmin = users.find(
      (u) => u.role === "super_admin" && u.status !== "deleted"
    );
    if (existingAdmin) {
      errors.push("Super Admin role is limited to one user");
    }
  }

  // Duplicate email check
  const existingUser = users.find(
    (u) =>
      u.email.toLowerCase() === body.email?.toLowerCase() &&
      u.status !== "deleted"
  );
  if (existingUser) {
    errors.push("An account with this email already exists");
  }

  if (errors.length > 0) {
    const response: RegisterResponse = {
      success: false,
      message: errors.join(". "),
    };
    res.status(400).json(response);
    return;
  }

  const newUser: User = {
    id: generateId(),
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    contactNumber: body.contactNumber.replace(/[\s\-\(\)]/g, ""),
    nmlsNumber: body.nmlsNumber?.trim() || "",
    role: body.role,
    status: "pending_approval",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);

  const response: RegisterResponse = {
    success: true,
    message:
      "Registration successful. Your account is pending admin approval.",
    user: newUser,
  };
  res.status(201).json(response);
};

// ── Request OTP ────────────────────────────────────────────────────
export const handleRequestOtp: RequestHandler = (req, res) => {
  const body = req.body as RequestOtpRequest;

  if (!body.email?.trim()) {
    const response: RequestOtpResponse = {
      success: false,
      message: "Email is required",
    };
    res.status(400).json(response);
    return;
  }

  const email = body.email.trim().toLowerCase();
  const user = users.find((u) => u.email === email);

  if (!user) {
    const response: RequestOtpResponse = {
      success: false,
      message: "No account found with this email",
    };
    res.status(404).json(response);
    return;
  }

  // Check user status
  if (user.status === "inactive" || user.status === "suspended") {
    const response: RequestOtpResponse = {
      success: false,
      message: "Your account is " + user.status + ". Please contact admin.",
    };
    res.status(403).json(response);
    return;
  }

  if (user.status === "deleted") {
    const response: RequestOtpResponse = {
      success: false,
      message: "No account found with this email",
    };
    res.status(404).json(response);
    return;
  }

  if (user.status === "pending_approval") {
    const response: RequestOtpResponse = {
      success: false,
      message: "Your account is pending admin approval",
    };
    res.status(403).json(response);
    return;
  }

  // Rate limiting
  const now = Date.now();
  const rateLimit = otpRequestCounts.get(email);
  if (rateLimit) {
    if (now < rateLimit.resetAt) {
      if (rateLimit.count >= OTP_CONFIG.resendLimitPerHour) {
        const response: RequestOtpResponse = {
          success: false,
          message: "Too many OTP requests. Please try again later.",
        };
        res.status(429).json(response);
        return;
      }
      rateLimit.count++;
    } else {
      otpRequestCounts.set(email, {
        count: 1,
        resetAt: now + 60 * 60 * 1000,
      });
    }
  } else {
    otpRequestCounts.set(email, { count: 1, resetAt: now + 60 * 60 * 1000 });
  }

  // Generate OTP
  const otp = generateOtp();
  otpStore.set(email, {
    otp,
    expiresAt: now + OTP_CONFIG.expirySeconds * 1000,
    consumed: false,
    attempts: 0,
  });

  console.log(`[DEV] OTP for ${email}: ${otp}`);

  const response: RequestOtpResponse = {
    success: true,
    message: "OTP sent to your email address",
    devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
  };
  res.json(response);
};

// ── Verify OTP ─────────────────────────────────────────────────────
export const handleVerifyOtp: RequestHandler = (req, res) => {
  const body = req.body as VerifyOtpRequest;

  if (!body.email?.trim() || !body.otp?.trim()) {
    const response: VerifyOtpResponse = {
      success: false,
      message: "Email and OTP are required",
    };
    res.status(400).json(response);
    return;
  }

  const email = body.email.trim().toLowerCase();
  const user = users.find((u) => u.email === email);

  if (!user || user.status !== "active") {
    const response: VerifyOtpResponse = {
      success: false,
      message: "Invalid credentials",
    };
    res.status(401).json(response);
    return;
  }

  const record = otpStore.get(email);

  if (!record) {
    const response: VerifyOtpResponse = {
      success: false,
      message: "No OTP requested. Please request a new one.",
    };
    res.status(400).json(response);
    return;
  }

  if (record.consumed) {
    const response: VerifyOtpResponse = {
      success: false,
      message: "OTP has already been used. Request a new one.",
    };
    res.status(400).json(response);
    return;
  }

  if (Date.now() > record.expiresAt) {
    const response: VerifyOtpResponse = {
      success: false,
      message: "OTP has expired. Request a new one.",
    };
    res.status(400).json(response);
    return;
  }

  if (record.attempts >= OTP_CONFIG.maxRetries) {
    const response: VerifyOtpResponse = {
      success: false,
      message: "Too many failed attempts. Request a new OTP.",
    };
    res.status(429).json(response);
    return;
  }

  if (record.otp !== body.otp.trim()) {
    record.attempts++;
    const response: VerifyOtpResponse = {
      success: false,
      message: `Invalid OTP. ${OTP_CONFIG.maxRetries - record.attempts} attempt(s) remaining.`,
    };
    res.status(401).json(response);
    return;
  }

  // Mark consumed
  record.consumed = true;

  // Simple token (in production, use JWT)
  const token = `tok_${user.id}_${Date.now()}`;

  const response: VerifyOtpResponse = {
    success: true,
    message: "Login successful",
    user,
    token,
  };
  res.json(response);
};

// ── Get current user (by token) ────────────────────────────────────
export const handleGetMe: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  // Extract user id from simple token format
  const parts = token.split("_");
  if (parts.length < 3) {
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }
  const userId = parts.slice(1, -1).join("_");
  const user = users.find((u) => u.id === userId && u.status === "active");

  if (!user) {
    res.status(401).json({ success: false, message: "Session expired" });
    return;
  }

  res.json({ success: true, user });
};

// ── Admin: List users ──────────────────────────────────────────────
export const handleListUsers: RequestHandler = (_req, res) => {
  const activeUsers = users.filter((u) => u.status !== "deleted");
  const response: UserListResponse = { users: activeUsers };
  res.json(response);
};

// ── Admin: Create user ─────────────────────────────────────────────
export const handleAdminCreateUser: RequestHandler = (req, res) => {
  const body = req.body as AdminCreateUserRequest;
  const errors: string[] = [];

  if (!body.name?.trim()) errors.push("Name is required");
  if (!body.email?.trim()) errors.push("Email is required");
  if (!body.contactNumber?.trim()) errors.push("Contact number is required");
  if (!body.role) errors.push("Role is required");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (body.email && !emailRegex.test(body.email)) {
    errors.push("Invalid email format");
  }

  if (body.contactNumber) {
    const digits = body.contactNumber.replace(/[\s\-\(\)]/g, "");
    if (!/^\d+$/.test(digits)) {
      errors.push("Contact number must contain only digits");
    } else if (digits.length < 7 || digits.length > 15) {
      errors.push("Contact number must be 7-15 digits");
    }
  }

  if (body.role === "loan_officer" && !body.nmlsNumber?.trim()) {
    errors.push("NMLS number is required for Loan Officer role");
  }

  if (body.role === "super_admin") {
    const existing = users.find(
      (u) => u.role === "super_admin" && u.status !== "deleted"
    );
    if (existing) {
      errors.push("Super Admin role is limited to one user");
    }
  }

  const existing = users.find(
    (u) =>
      u.email.toLowerCase() === body.email?.toLowerCase() &&
      u.status !== "deleted"
  );
  if (existing) {
    errors.push("An account with this email already exists");
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: errors.join(". ") });
    return;
  }

  const newUser: User = {
    id: generateId(),
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    contactNumber: body.contactNumber.replace(/[\s\-\(\)]/g, ""),
    nmlsNumber: body.nmlsNumber?.trim() || "",
    role: body.role,
    status: body.status || "active",
    branch: body.branch?.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  res.status(201).json({ success: true, user: newUser });
};

// ── Admin: Update user ─────────────────────────────────────────────
export const handleUpdateUser: RequestHandler = (req, res) => {
  const { id } = req.params;
  const body = req.body as UpdateUserRequest;
  const user = users.find((u) => u.id === id);

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  if (body.role === "super_admin" && user.role !== "super_admin") {
    const existing = users.find(
      (u) => u.role === "super_admin" && u.status !== "deleted" && u.id !== id
    );
    if (existing) {
      res
        .status(400)
        .json({
          success: false,
          message: "Super Admin role is limited to one user",
        });
      return;
    }
  }

  if (body.name !== undefined) user.name = body.name.trim();
  if (body.contactNumber !== undefined)
    user.contactNumber = body.contactNumber.replace(/[\s\-\(\)]/g, "");
  if (body.role !== undefined) user.role = body.role;
  if (body.status !== undefined) user.status = body.status;
  if (body.branch !== undefined) user.branch = body.branch?.trim();
  if (body.nmlsNumber !== undefined) user.nmlsNumber = body.nmlsNumber.trim();
  user.updatedAt = new Date().toISOString();

  res.json({ success: true, user });
};

// ── Admin: Delete user (soft) ──────────────────────────────────────
export const handleDeleteUser: RequestHandler = (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  user.status = "deleted";
  user.updatedAt = new Date().toISOString();
  res.json({ success: true, message: "User deleted" });
};
