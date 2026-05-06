import { cn } from "@/lib/format";

export function ProgressBar({ value, className }: { value?: number | null; className?: string }) {
  const safeValue = Math.max(0, Math.min(100, Number(value ?? 0)));

  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-slate-100", className)} aria-label={`${safeValue}%`}>
      <div
        className="animate-soft-fill h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-400 transition-all duration-700"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
