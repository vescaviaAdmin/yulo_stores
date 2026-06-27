// Platform Admin shell — a dark platform sidebar (distinct branding from the
// owner portal) + top bar. Used across all /admin/* screens (PRD §14).

import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  QrCode,
  ScrollText,
  Settings,
  ShieldCheck,
  Store,
  Tag,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/restaurants", label: "Restaurants", icon: Store },
  { to: "/admin/users", label: "Users & Customers", icon: Users },
  { to: "/admin/roles", label: "Staff & Roles", icon: ShieldCheck },
  { to: "/admin/qr", label: "QR Management", icon: QrCode },
  { to: "/admin/orders", label: "Order Monitoring", icon: ClipboardList },
  { to: "/admin/offers", label: "Offer Monitoring", icon: Tag },
  { to: "/admin/activity", label: "Activity Logs", icon: ScrollText },
  { to: "/admin/settings", label: "System Settings", icon: Settings },
];

export function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default function AdminLayout({ children, title, subtitle, action }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (item) => (item.exact ? pathname === item.to : pathname.startsWith(item.to));

  return (
    <div className="flex min-h-screen bg-brand-page font-sans text-[#24190f]">
      <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col bg-sidebar-gradient">
        <div className="flex items-center gap-3 px-6 pb-8 pt-6">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="font-bold text-brand-cream2">Yulo Admin</p>
            <p className="text-[11px] text-brand-cream/50">Platform Console</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => navigate(item.to)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors",
                  isActive(item)
                    ? "bg-brand-gradient text-white"
                    : "text-brand-cream hover:bg-brand-cream/10",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-brand-cream/10 p-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-cream hover:bg-brand-cream/10"
          >
            <LogOut className="h-[18px] w-[18px]" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col gap-5 p-6 pb-12 lg:px-7">
        <header className="flex items-center justify-between rounded-2xl border border-brand-cream/60 bg-[#FAFAF8] px-5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <span className="text-xl font-bold text-brand-red">Platform Console</span>
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-brand-cream/60 bg-white text-[#5f5f5f]"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-orange" />
            </button>
            <Avatar>
              <AvatarFallback className="bg-brand-gradient text-xs font-semibold text-white">AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Platform Admin</span>
              <span className="text-xs text-muted-foreground">Super Admin</span>
            </div>
          </div>
        </header>

        {(title || action) && (
          <div className="flex items-start justify-between">
            <div>
              {title ? <h1 className="text-2xl font-bold">{title}</h1> : null}
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            {action}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
