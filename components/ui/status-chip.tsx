import { cn } from "@/lib/format";

const palette: Record<string, string> = {
  active: "bg-blue-50 text-blue-700 ring-blue-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  present: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  accepted: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  issued: "bg-blue-50 text-blue-700 ring-blue-100",
  submitted: "bg-blue-50 text-blue-700 ring-blue-100",
  sent: "bg-blue-50 text-blue-700 ring-blue-100",
  review: "bg-violet-50 text-violet-700 ring-violet-100",
  "in progress": "bg-blue-50 text-blue-700 ring-blue-100",
  "under review": "bg-violet-50 text-violet-700 ring-violet-100",
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  "lpo pending": "bg-amber-50 text-amber-700 ring-amber-100",
  "on hold": "bg-slate-100 text-slate-700 ring-slate-200",
  delayed: "bg-rose-50 text-rose-700 ring-rose-100",
  overdue: "bg-rose-50 text-rose-700 ring-rose-100",
  critical: "bg-rose-50 text-rose-700 ring-rose-100",
  rejected: "bg-rose-50 text-rose-700 ring-rose-100",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  high: "bg-rose-50 text-rose-700 ring-rose-100",
  medium: "bg-amber-50 text-amber-700 ring-amber-100",
  low: "bg-slate-100 text-slate-700 ring-slate-200"
};

export function StatusChip({ value, className }: { value?: unknown; className?: string }) {
  const label = value === null || value === undefined || value === "" ? "-" : String(value);
  const tone = palette[label.toLowerCase()] ?? "bg-sky-50 text-sky-700 ring-sky-100";

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold leading-none ring-1", tone, className)}>
      {label}
    </span>
  );
}
