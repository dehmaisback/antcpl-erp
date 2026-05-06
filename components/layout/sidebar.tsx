"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronDown, Dot, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { COMPANY } from "@/lib/constants";
import { enterpriseNavGroups } from "@/lib/enterprise-nav";
import { cn } from "@/lib/format";

const projectShortcuts = [
  { name: "Tower 26", status: "Authority review", dotClass: "text-blue-500" },
  { name: "Marina View", status: "MEP coordination", dotClass: "text-violet-500" },
  { name: "Al Barsha Villas", status: "Site supervision", dotClass: "text-emerald-500" },
  { name: "City Center Mall", status: "NCR closeout", dotClass: "text-amber-500" }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-navy-900/35 backdrop-blur-sm transition lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[19rem] flex-col border-r border-blue-100/80 bg-white/95 shadow-[16px_0_38px_rgba(15,48,88,0.07)] backdrop-blur-2xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-18 items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <div className="grid h-11 w-11 place-items-center rounded-[1.15rem] bg-gradient-to-br from-navy-900 to-brand-700 text-white shadow-lg shadow-blue-100">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-tight text-navy-900">{COMPANY.shortName}</p>
              <p className="truncate text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Consultancy ERP</p>
            </div>
          </Link>
          <button className="rounded-2xl p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="premium-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-4">
            {enterpriseNavGroups.map((group) => (
              <div key={group.label} className="border-t border-blue-50 pt-3 first:border-t-0 first:pt-0">
                <div className="mb-1 flex items-center justify-between px-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{group.label}</p>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-300" />
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-[12.5px] font-black transition duration-200",
                          active
                            ? "bg-blue-50 text-brand-700 shadow-[0_10px_22px_rgba(18,103,184,0.09)] ring-1 ring-blue-100"
                            : "text-navy-700/78 hover:bg-slate-50 hover:text-navy-900"
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-xl transition",
                            active
                              ? "bg-white text-brand-600 shadow-sm"
                              : "bg-transparent text-slate-500 group-hover:bg-white group-hover:text-brand-600 group-hover:shadow-sm"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                        {active ? <span className="h-1.5 w-1.5 rounded-full bg-brand-600 shadow-[0_0_0_4px_rgba(18,103,184,0.12)]" /> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="border-t border-blue-50 pt-3">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pinned Sites</p>
                <Link href="/projects" onClick={onClose} className="text-[10px] font-black text-brand-600">
                  All
                </Link>
              </div>
              <div className="space-y-1">
                {projectShortcuts.map((project) => (
                  <Link
                    key={project.name}
                    href="/projects"
                    onClick={onClose}
                    className="group flex items-center gap-2 rounded-2xl px-2.5 py-2 text-xs transition hover:bg-slate-50"
                  >
                    <Dot className={cn("h-7 w-7 shrink-0", project.dotClass)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-black text-navy-800">{project.name}</span>
                      <span className="block truncate font-bold text-slate-400">{project.status}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="border-t border-blue-50 p-3">
          <div className="rounded-[1.25rem] border border-blue-100 bg-gradient-to-br from-slate-50 to-white p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Active session</p>
            <p className="mt-2 truncate text-sm font-black text-navy-900">{profile?.full_name ?? "Setup mode"}</p>
            <p className="truncate text-xs font-semibold text-slate-500">{profile?.role ?? "No profile"}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
