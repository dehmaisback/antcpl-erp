"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, UserPlus } from "lucide-react";
import { ModulePage } from "@/components/modules/module-page";
import type { ModuleKey } from "@/lib/types";

const tabs: Array<{ label: string; module: ModuleKey; allowCreate?: boolean }> = [
  { label: "Details", module: "hr", allowCreate: false },
  { label: "Tasks", module: "tasks" },
  { label: "Attendance", module: "attendance" },
  { label: "Leave & EOS", module: "leave-eos" },
  { label: "Payroll", module: "payroll" },
  { label: "Expenses", module: "expenses" },
  { label: "Assets", module: "assets" },
  { label: "Circulars", module: "circulars" },
  { label: "Forms & Formats", module: "forms-formats" }
];

const hrWorkflowTabs = ["Employee Files", "Bonus", "Onboarding", "Offboarding", "Performance"];

export function HrDashboard() {
  const [active, setActive] = useState(tabs[0]);

  return (
    <section className="space-y-5">
      <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">Employee operations</p>
            <h2 className="mt-1 text-2xl font-semibold text-navy-900">HR Dashboard</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Central view for employee records, attendance, leave approvals, EOS estimates, payroll, assets, onboarding, files, circulars, and performance.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-brand-700"
          >
            <UserPlus className="h-4 w-4" />
            Create Employee Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActive(tab)}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                active.label === tab.label ? "bg-brand-600 text-white shadow-lg shadow-blue-100" : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-brand-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {hrWorkflowTabs.map((label) => (
            <span key={label} className="whitespace-nowrap rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">
              {label}
            </span>
          ))}
        </div>
      </div>

      <ModulePage moduleKey={active.module} titleOverride={active.label} allowCreate={active.allowCreate ?? true} />
    </section>
  );
}
