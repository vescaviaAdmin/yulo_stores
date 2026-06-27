// Shared shell for the owner-facing screens: Sidebar + top app bar + content.
// The top app bar chrome is identical across screens (Figma header 88px).

import Sidebar from "@/components/Sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useOwnerAuthSafe } from "@/context/OwnerAuthContext";

export function Topbar({ profile }) {
  // Pull live data from owner auth context; fall back to explicit profile prop (manager screens)
  const ownerCtx = useOwnerAuthSafe();
  const user         = ownerCtx?.user;
  const restaurant   = ownerCtx?.restaurant;

  const displayName    = user?.name ?? profile?.name ?? profile?.userName ?? "Owner";
  const displayRole    = user?.role ?? profile?.role ?? "Owner";
  const restaurantName = restaurant?.name ?? profile?.restaurantName ?? "Yulo Stores";
  const initials       = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between rounded-xl border border-brand-cream/60 bg-[#FAFAF8] px-5 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
      <div className="flex items-center gap-3">
        <span className="h-9 w-9 rounded-full bg-brand-dark2" />
        <span className="text-xl font-bold text-brand-red">
          {restaurantName}
        </span>
      </div>
      <div className="flex items-center gap-3.5">
        <Avatar>
          <AvatarFallback className="bg-brand-gradient text-xs font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">{displayName}</span>
          <span className="text-xs text-muted-foreground">{displayRole}</span>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children, profile }) {
  return (
    <div className="flex min-h-screen bg-brand-page font-sans text-[#24190f]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 bg-brand-page px-6 py-3 lg:px-7">
          <Topbar profile={profile} />
        </div>
        <main className="flex flex-col gap-5 px-6 pb-12 pt-2 lg:px-7">
          {children}
        </main>
      </div>
    </div>
  );
}
