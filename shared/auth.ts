/**
 * Shared auth & user types between client and server
 */

// ── Roles ──────────────────────────────────────────────────────────
export type UserRole = "super_admin" | "loan_officer";

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "loan_officer", label: "Loan Officer" },
];

// ── User Status ────────────────────────────────────────────────────
export type UserStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending_approval"
  | "deleted";

export const USER_STATUSES: { value: UserStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "deleted", label: "Deleted / Archived" },
];

// ── User ───────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  nmlsNumber: string;
  role: UserRole;
  status: UserStatus;
  branch?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Registration ───────────────────────────────────────────────────
export interface RegisterRequest {
  name: string;
  email: string;
  contactNumber: string;
  nmlsNumber: string;
  role: UserRole;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
}

// ── Login (OTP) ────────────────────────────────────────────────────
export interface RequestOtpRequest {
  email: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  /** Expose OTP in dev only for testing */
  devOtp?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

// ── User Management (Admin) ────────────────────────────────────────
export interface UpdateUserRequest {
  name?: string;
  contactNumber?: string;
  role?: UserRole;
  status?: UserStatus;
  branch?: string;
  nmlsNumber?: string;
}

export interface AdminCreateUserRequest {
  name: string;
  email: string;
  contactNumber: string;
  nmlsNumber: string;
  role: UserRole;
  status?: UserStatus;
  branch?: string;
}

export interface UserListResponse {
  users: User[];
}

// ── OTP Config (for reference) ─────────────────────────────────────
export interface OtpConfig {
  expirySeconds: number;
  resendLimitPerHour: number;
  maxRetries: number;
  lockoutDurationMinutes: number;
}

export const DEFAULT_OTP_CONFIG: OtpConfig = {
  expirySeconds: 300, // 5 minutes
  resendLimitPerHour: 5,
  maxRetries: 3,
  lockoutDurationMinutes: 30,
};
