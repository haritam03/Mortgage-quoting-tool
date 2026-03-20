import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  AlertCircle,
  Loader2,
  X,
  Shield,
  ShieldCheck,
} from "lucide-react";
import type {
  User,
  UserRole,
  UserStatus,
  AdminCreateUserRequest,
  UpdateUserRequest,
} from "@shared/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const statusConfig: Record<
  UserStatus,
  { label: string; color: string; bgColor: string }
> = {
  active: {
    label: "Active",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  inactive: {
    label: "Inactive",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-800/50",
  },
  suspended: {
    label: "Suspended",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  pending_approval: {
    label: "Pending",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  deleted: {
    label: "Deleted",
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
};

const roleLabels: Record<UserRole, { label: string; icon: typeof Shield }> = {
  super_admin: { label: "Super Admin", icon: ShieldCheck },
  loan_officer: { label: "Loan Officer", icon: Shield },
};

const emptyForm: AdminCreateUserRequest = {
  name: "",
  email: "",
  contactNumber: "",
  nmlsNumber: "",
  role: "loan_officer",
  status: "active",
  branch: "",
};

export default function UserManagement() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<AdminCreateUserRequest>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formServerError, setFormServerError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch {
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open create modal
  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormServerError("");
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber,
      nmlsNumber: user.nmlsNumber,
      role: user.role,
      status: user.status,
      branch: user.branch || "",
    });
    setFormErrors({});
    setFormServerError("");
    setShowModal(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.email.trim()) {
      errs.email = "Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Invalid email";
    }
    if (!form.contactNumber.trim()) {
      errs.contactNumber = "Required";
    } else {
      const digits = form.contactNumber.replace(/[\s\-\(\)]/g, "");
      if (!/^\d+$/.test(digits)) errs.contactNumber = "Digits only";
      else if (digits.length < 7 || digits.length > 15)
        errs.contactNumber = "7-15 digits";
    }
    if (form.role === "loan_officer" && !form.nmlsNumber.trim()) {
      errs.nmlsNumber = "Required for Loan Officers";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save user
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setFormServerError("");

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";

      const body: AdminCreateUserRequest | UpdateUserRequest = editingUser
        ? {
            name: form.name,
            contactNumber: form.contactNumber,
            nmlsNumber: form.nmlsNumber,
            role: form.role,
            status: form.status as UserStatus,
            branch: form.branch,
          }
        : form;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormServerError(data.message || "Operation failed");
        return;
      }

      setShowModal(false);
      fetchUsers();
    } catch {
      setFormServerError("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete user
  const handleDelete = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeletingUser(null);
        fetchUsers();
      }
    } catch {
      setError("Failed to delete user");
    }
  };

  // Toggle status
  const handleToggleStatus = async (user: User) => {
    const newStatus: UserStatus =
      user.status === "active" ? "inactive" : "active";
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchUsers();
    } catch {
      setError("Failed to update status");
    }
  };

  // Filter users
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateFormField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setFormServerError("");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              User Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: users.length,
              color: "text-primary",
            },
            {
              label: "Active",
              value: users.filter((u) => u.status === "active").length,
              color: "text-green-600",
            },
            {
              label: "Pending",
              value: users.filter((u) => u.status === "pending_approval")
                .length,
              color: "text-amber-600",
            },
            {
              label: "Inactive",
              value: users.filter(
                (u) => u.status === "inactive" || u.status === "suspended"
              ).length,
              color: "text-red-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn("text-2xl font-bold mt-1", stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    NMLS
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => {
                  const statusCfg = statusConfig[user.status];
                  const roleCfg = roleLabels[user.role];
                  const RoleIcon = roleCfg.icon;

                  return (
                    <tr
                      key={user.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30",
                        idx % 2 === 0 ? "bg-background" : "bg-card"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {user.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.contactNumber || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <RoleIcon className="h-4 w-4 text-muted-foreground" />
                          {roleCfg.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground font-mono">
                        {user.nmlsNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-1 rounded-full text-xs font-semibold",
                            statusCfg.bgColor,
                            statusCfg.color
                          )}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Edit user"
                            onClick={() => openEditModal(user)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title={
                              user.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.status === "active" ? (
                              <UserX className="h-4 w-4 text-amber-500" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Delete user"
                            onClick={() => setDeletingUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ──────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingUser ? "Edit User" : "Create User"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formServerError && (
              <div className="mb-4 flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{formServerError}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateFormField("name", e.target.value)}
                  placeholder="John Doe"
                  className={cn(formErrors.name && "border-destructive")}
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateFormField("email", e.target.value)}
                  placeholder="john@example.com"
                  disabled={!!editingUser}
                  className={cn(
                    formErrors.email && "border-destructive",
                    editingUser && "opacity-60"
                  )}
                />
                {formErrors.email && (
                  <p className="text-xs text-destructive">{formErrors.email}</p>
                )}
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Contact Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.contactNumber}
                  onChange={(e) =>
                    updateFormField("contactNumber", e.target.value)
                  }
                  placeholder="5551234567"
                  className={cn(
                    formErrors.contactNumber && "border-destructive"
                  )}
                />
                {formErrors.contactNumber && (
                  <p className="text-xs text-destructive">
                    {formErrors.contactNumber}
                  </p>
                )}
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <select
                    value={form.role}
                    onChange={(e) => updateFormField("role", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none cursor-pointer"
                  >
                    <option value="loan_officer">Loan Officer</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Status</Label>
                  <select
                    value={form.status}
                    onChange={(e) => updateFormField("status", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending_approval">Pending Approval</option>
                  </select>
                </div>
              </div>

              {/* NMLS */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  NMLS Number{" "}
                  {form.role === "loan_officer" && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                <Input
                  value={form.nmlsNumber}
                  onChange={(e) => updateFormField("nmlsNumber", e.target.value)}
                  placeholder="123456"
                  className={cn(formErrors.nmlsNumber && "border-destructive")}
                />
                {formErrors.nmlsNumber && (
                  <p className="text-xs text-destructive">
                    {formErrors.nmlsNumber}
                  </p>
                )}
              </div>

              {/* Branch */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Branch</Label>
                <Input
                  value={form.branch}
                  onChange={(e) => updateFormField("branch", e.target.value)}
                  placeholder="West Branch"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingUser ? (
                  "Update User"
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ──────────────────────────────────── */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Delete User
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete{" "}
                <strong>{deletingUser.name}</strong>? This action will
                deactivate the account.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingUser(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deletingUser)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
