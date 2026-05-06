"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronRight, Dot, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { COMPANY, canAccess } from "@/lib/constants";
import { cn } from "@/lib/format";
import { sidebarItems } from "@/lib/modules";

const groups = [
  { label: "Main", hrefs: ["/dashboard"] },
  { label: "Projects", hrefs: ["/projects", "/tasks", "/time-tracking", "/site-visits", "/quality-ncr", "/documents"] },
  { label: "Finance", hrefs: ["/quotations", "/invoices", "/payments", "/expenses"] },
  { label: "HR & Admin", hrefs: ["/attendance", "/hr", "/leave-eos", "/payroll", "/assets", "/forms-formats", "/circulars", "/reports", "/settings"] }
];

const projectShortcuts = [
  { name: "Tower 26", status: "Active", dotClass: "text-emerald-500" },
  { name: "Marina View", status: "Authority review", dotClass: "text-blue-500" },
  { name: "Al Barsha Villas", status: "Design", dotClass: "text-amber-500" },
  { name: "City Center Mall", status: "Tender", dotClass: "text-violet-500" },
  { name: "Emirates Office", status: "Closeout", dotClass: "text-slate-400" }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { profile } = useAuth();
  const visibleItems = sidebarItems.filter((item) => canAccess([...item.permissions], profile?.role));

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
          "fixed inset-y-0 left-0 z-50 flex w-[18.5rem] flex-col border-r border-blue-100/80 bg-white/95 shadow-[18px_0_45px_rgba(15,48,88,0.08)] backdrop-blur-xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <div className="grid h-11 w-11 place-items-center rounded-[1.1rem] bg-gradient-to-br from-brand-600 to-navy-700 text-white shadow-lg shadow-blue-200">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-tight text-navy-900">{COMPANY.shortName}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{COMPANY.location}</p>
            </div>
          </Link>
          <button className="rounded-2xl p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="premium-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-5">
          <div className="space-y-6">
            {groups.map((group) => {
              const items = visibleItems.filter((item) => group.hrefs.includes(item.href));
              if (items.length === 0) return null;

              return (
                <div key={group.label}>
                  <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{group.label}</p>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition duration-200",
                            active
                              ? "bg-blue-50 text-brand-700 shadow-sm ring-1 ring-blue-100"
                              : "text-navy-700/80 hover:bg-slate-50 hover:text-navy-900"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full transition",
                              active ? "bg-brand-600 opacity-100" : "bg-transparent opacity-0"
                            )}
                          />
                          <span
                            className={cn(
                              "grid h-9 w-9 place-items-center rounded-xl transition",
                              active
                                ? "bg-white text-brand-600 shadow-sm"
                                : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-brand-600 group-hover:shadow-sm"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          {active ? <ChevronRight className="h-4 w-4 text-brand-500" /> : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div>
              <div className="mb-2 flex items-center justify-between px-3">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Projects</p>
                <Link href="/projects" onClick={onClose} className="text-[11px] font-bold text-brand-600 hover:text-brand-700">
                  View all
                </Link>
              </div>
              <div className="space-y-1">
                {projectShortcuts.map((project) => (
                  <Link
                    key={project.name}
                    href="/projects"
                    onClick={onClose}
                    className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition hover:bg-slate-50"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-50 text-brand-600 transition group-hover:bg-white group-hover:shadow-sm">
                      <Dot className={cn("h-8 w-8", project.dotClass)} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-navy-800">{project.name}</span>
                      <span className="block truncate text-[11px] font-semibold text-slate-400">{project.status}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="border-t border-blue-50 p-4">
          <div className="rounded-[1.35rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Signed in as</p>
            <p className="mt-2 truncate text-sm font-black text-navy-900">{profile?.full_name ?? "Setup mode"}</p>
            <p className="truncate text-xs font-semibold text-slate-500">{profile?.role ?? "Connect Supabase"}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
