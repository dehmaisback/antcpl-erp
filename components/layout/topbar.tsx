"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, CalendarDays, ChevronRight, LogOut, Menu, Search, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { initials, toTitleCase } from "@/lib/format";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const crumbs = pathname.split("/").filter(Boolean);
  const title = crumbs.length ? toTitleCase(crumbs[crumbs.length - 1]) : "Dashboard";

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-blue-100/80 bg-white/92 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button className="rounded-2xl border border-blue-100 bg-white p-2.5 text-navy-700 shadow-sm transition hover:bg-blue-50 lg:hidden" onClick={onMenu} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <span>ANTCPL ERP</span>
              {crumbs.map((crumb) => (
                <span key={crumb} className="flex min-w-0 items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  <span className="truncate">{toTitleCase(crumb)}</span>
                </span>
              ))}
            </div>
            <h1 className="mt-0.5 truncate text-[1.65rem] font-black tracking-tight text-navy-900">{title}</h1>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-3 xl:flex">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3.5 py-2.5 text-xs font-black text-navy-700 shadow-sm transition hover:bg-blue-50">
            <CalendarDays className="h-4 w-4 text-brand-600" />
            May 2026
          </button>
          <label className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-blue-100 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-500 shadow-inner">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              className="min-w-0 flex-1 bg-transparent font-medium text-navy-900 outline-none placeholder:text-slate-400"
              placeholder="Search sites, NCR, inspections, invoices"
            />
          </label>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3.5 py-2.5 text-xs font-black text-navy-700 shadow-sm transition hover:bg-blue-50">
            <SlidersHorizontal className="h-4 w-4 text-brand-600" />
            Filters
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative rounded-2xl border border-blue-100 bg-white p-2.5 text-navy-700 shadow-sm transition hover:bg-blue-50 hover:text-brand-700" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <div className="hidden items-center gap-3 rounded-2xl border border-blue-100 bg-white px-3 py-2 shadow-sm sm:flex">
            <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-sm font-black text-brand-700">
              {initials(profile?.full_name)}
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="max-w-44">
              <p className="truncate text-sm font-black text-navy-900">{profile?.full_name ?? "Setup mode"}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{profile?.role ?? "No profile"}</p>
            </div>
          </div>
          <button
            className="rounded-2xl border border-blue-100 bg-white p-2.5 text-navy-700 shadow-sm transition hover:bg-rose-50 hover:text-rose-700"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
