import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  QrCode,
  ReceiptText,
  XCircle,
  UtensilsCrossed,
  PlusCircle,
  BadgePercent,
  Monitor,
  Store,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useOwnerAuth } from "@/context/OwnerAuthContext";

const NAV_SECTIONS = [
  {
    title: "Home",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "QR Management",
    items: [
      { to: "/qr", label: "Generate QR Code", icon: QrCode },
    ],
  },
  {
    title: "Orders Management",
    items: [
      { to: "/orders", label: "Manage Orders", icon: ReceiptText },
      { to: "/cancellations", label: "Cancellations", icon: XCircle },
    ],
  },
  {
    title: "Menu Management",
    items: [
      { to: "/menu-items", label: "Menu Items", icon: UtensilsCrossed },
      { to: "/menu-management", label: "Add Items", icon: PlusCircle },
    ],
  },
  {
    title: "Coupons & Offers",
    items: [
      { to: "/offers", label: "Create Offers", icon: BadgePercent },
    ],
  },
  {
    title: "Live Monitoring",
    items: [
      { to: "/live-monitor", label: "Visitors Analysis", icon: Monitor },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/staff", label: "Staff Management", icon: Users },
      { to: "/store-settings", label: "Store Settings", icon: Store },
    ],
  },
];

function isActive(pathname, to) {
  if (to === "/dashboard") return pathname === "/" || pathname === "/dashboard";
  return pathname === to;
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-medium text-brand-cream/80 transition-colors hover:bg-brand-cream/10 hover:text-brand-cream",
        active && "bg-brand-cream/10 text-brand-cream",
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
      <span>{label}</span>
    </button>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useOwnerAuth();

  async function handleLogout() {
    await logout();
    navigate("/owner/login", { replace: true });
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[280px] shrink-0 flex-col justify-between overflow-y-auto bg-sidebar-gradient shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)]">
      <div>
        <div className="flex items-center gap-3 px-6 pb-6 pt-6">
          <span className="h-10 w-10 shrink-0 rounded-full bg-brand-dark2" />
          <span className="text-xl text-brand-cream2">Yulo Stores</span>
        </div>

        <nav className="flex flex-col gap-4 px-4 pb-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <p className="px-4 pb-1 text-[10px] uppercase tracking-widest text-brand-cream/40">
                {section.title}
              </p>
              {section.items.map((item) => (
                <NavItem
                  key={item.to + item.label}
                  icon={item.icon}
                  label={item.label}
                  active={isActive(pathname, item.to)}
                  onClick={() => navigate(item.to)}
                />
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-brand-cream/10 p-4">
        <NavItem icon={LogOut} label="Logout" onClick={handleLogout} />
      </div>
    </aside>
  );
}
