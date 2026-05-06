"use client";

import { useMemo, useState } from "react";
import { Calculator, Plane, WalletCards } from "lucide-react";
import { ModulePage } from "@/components/modules/module-page";
import { formatCurrency } from "@/lib/format";

export function LeaveEosPage() {
  const [salary, setSalary] = useState(10000);
  const [years, setYears] = useState(3);
  const [leaveDays, setLeaveDays] = useState(2);
  const [airfare, setAirfare] = useState(1800);

  const calculation = useMemo(() => {
    const daily = salary / 30;
    const eligibleYears = Math.max(0, years);
    const gratuityDays = eligibleYears <= 5 ? eligibleYears * 21 : 5 * 21 + (eligibleYears - 5) * 30;
    return {
      gratuity: daily * gratuityDays,
      leaveDeduction: daily * Math.max(0, leaveDays),
      airfare
    };
  }, [airfare, leaveDays, salary, years]);

  return (
    <section className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-card lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-navy-900">Leave & EOS Calculator</h2>
              <p className="mt-1 text-sm text-slate-500">Quick UAE gratuity estimate, leave deduction, and airfare tracking for HR review.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            <NumberInput label="Basic salary" value={salary} onChange={setSalary} />
            <NumberInput label="Years served" value={years} onChange={setYears} />
            <NumberInput label="Deduct leave days" value={leaveDays} onChange={setLeaveDays} />
            <NumberInput label="Airfare" value={airfare} onChange={setAirfare} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <CalcCard icon={WalletCards} label="EOS estimate" value={formatCurrency(calculation.gratuity)} />
          <CalcCard icon={Calculator} label="Leave deduction" value={formatCurrency(calculation.leaveDeduction)} />
          <CalcCard icon={Plane} label="Airfare tracker" value={formatCurrency(calculation.airfare)} />
        </div>
      </div>

      <ModulePage moduleKey="leave-eos" />
    </section>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-navy-900">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
    </label>
  );
}

function CalcCard({ icon: Icon, label, value }: { icon: typeof Calculator; label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-semibold text-navy-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
