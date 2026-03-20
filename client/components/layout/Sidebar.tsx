import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, Settings, X, Calculator } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      label: "Leads",
      href: "/",
      icon: Users,
      description: "Lead management & search",
    },
    {
      label: "Quoting Tool",
      href: "/quotes",
      icon: Calculator,
      description: "Generate pricing scenarios",
    },
    // Admin-only items
    ...(user?.role === "super_admin"
      ? [
          {
            label: "User Management",
            href: "/users",
            icon: Settings,
            description: "Manage users & roles",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar overflow-y-auto transition-transform duration-200 md:relative md:top-0 md:z-0 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 md:hidden">
          <span className="font-semibold text-sidebar-foreground">Menu</span>
          <button onClick={onClose} className="p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "group flex flex-col gap-1 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                <span
                  className={cn(
                    "ml-8 text-xs transition-colors",
                    isActive
                      ? "text-sidebar-primary-foreground/70"
                      : "text-sidebar-foreground/60"
                  )}
                >
                  {item.description}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
