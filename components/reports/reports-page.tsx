"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileDown, Loader2, Printer, RefreshCw } from "lucide-react";
import { StatusChip } from "@/components/ui/status-chip";
import { exportRowsToCsv, printReport } from "@/lib/export";
import { formatCurrency, formatDate } from "@/lib/format";
import { reportModules } from "@/lib/modules";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ModuleConfig } from "@/lib/types";

export function ReportsPage() {
  const supabase = getSupabaseClient();
  const [active, setActive] = useState<ModuleConfig>(reportModules[0]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase.from(active.table).select("*").order("created_at", { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
      setRows([]);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }, [active.table, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const amountFields = ["budget", "amount", "vat", "total_amount", "payment_received", "balance"];
    return amountFields
      .map((field) => ({
        field,
        value: rows.reduce((sum, row) => sum + Number(row[field] ?? 0), 0)
      }))
      .filter((item) => item.value > 0);
  }, [rows]);

  return (
    <section className="space-y-5">
      <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">Operational reporting</p>
            <h2 className="mt-1 text-2xl font-semibold text-navy-900">Reports</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Generate project, task, attendance, employee, invoice, quotation, site visit, NCR, and authority approval reports with CSV and print/PDF export.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm" onClick={load}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm" onClick={() => exportRowsToCsv(`${active.key}-report`, rows, active.columns)}>
              <FileDown className="h-4 w-4" />
              Excel/CSV
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200" onClick={printReport}>
              <Printer className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {reportModules.map((module) => (
            <button
              key={module.key}
              onClick={() => setActive(module)}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                active.key === module.key ? "bg-brand-600 text-white shadow-lg shadow-blue-100" : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-brand-700"
              }`}
            >
              {module.title}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStat label="Records" value={rows.length} />
        {totals.slice(0, 3).map((total) => (
          <ReportStat key={total.field} label={total.field.replace(/_/g, " ")} value={formatCurrency(total.value)} />
        ))}
      </div>

      <div className="print-surface rounded-[1.75rem] border border-blue-100 bg-white shadow-card">
        <div className="border-b border-blue-50 p-5">
          <h3 className="text-lg font-semibold text-navy-900">{active.title} Report</h3>
          <p className="text-sm text-slate-500">Generated from Supabase table `{active.table}`.</p>
        </div>
        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-sm font-semibold text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-600" />
            Loading report
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-0">
              <thead>
                <tr>
                  {active.columns.map((column) => (
                    <th key={column.key} className="border-b border-blue-50 px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.id)} className="hover:bg-blue-50/45">
                    {active.columns.map((column) => (
                      <td key={column.key} className="border-b border-blue-50 px-4 py-4 text-sm text-slate-700">
                        {column.type === "status" ? (
                          <StatusChip value={row[column.key]} />
                        ) : column.type === "currency" ? (
                          formatCurrency(row[column.key])
                        ) : column.type === "date" ? (
                          formatDate(row[column.key])
                        ) : column.type === "percent" ? (
                          `${Number(row[column.key] ?? 0)}%`
                        ) : (
                          String(row[column.key] ?? "-")
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function ReportStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-card">
      <p className="text-sm font-medium capitalize text-slate-500">{label}</p>
      <p className="mt-2 truncate text-2xl font-semibold text-navy-900">{value}</p>
    </div>
  );
}
