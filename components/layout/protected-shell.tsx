"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SetupNotice } from "@/components/ui/setup-notice";
import { canAccess } from "@/lib/constants";
import { sidebarItems } from "@/lib/modules";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && configured && !user) {
      router.replace("/login");
    }
  }, [configured, loading, router, user]);

  const activeItem = useMemo(() => {
    return sidebarItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  }, [pathname]);

  const hasRouteAccess = useMemo(() => {
    if (!activeItem || pathname === "/dashboard") return true;
    return canAccess([...activeItem.permissions], profile?.role);
  }, [activeItem, pathname, profile?.role]);

  if (loading || (configured && !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-navy-700 shadow-card">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          Loading ANTCPL ERP
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="min-w-0 flex-1 lg:pl-[19rem]">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1540px] px-4 py-5 sm:px-6 lg:px-8">
          {!configured ? (
            <div className="mb-5">
              <SetupNotice />
            </div>
          ) : null}
          {!hasRouteAccess ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm leading-6 text-amber-800 shadow-card">
              This role does not have access to this module. The sidebar only shows modules available for the current role after profile loading.
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
