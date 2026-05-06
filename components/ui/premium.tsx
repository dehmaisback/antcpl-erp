import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/format";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p> : null}
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function PremiumCard({
  children,
  className,
  hover = false
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return <div className={cn("surface-card rounded-[1.6rem]", hover && "soft-card-hover", className)}>{children}</div>;
}

export function IconButton({
  icon: Icon,
  label,
  tone = "default",
  onClick
}: {
  icon: LucideIcon;
  label: string;
  tone?: "default" | "primary";
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5",
        tone === "primary"
          ? "bg-brand-600 text-white shadow-lg shadow-blue-200 hover:bg-brand-700"
          : "border border-blue-100 bg-white text-navy-700 shadow-sm hover:border-blue-200 hover:text-brand-700"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export function StatPill({
  label,
  value,
  icon: Icon,
  tone = "blue"
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: "blue" | "green" | "amber" | "rose" | "purple";
}) {
  const tones = {
    blue: "bg-blue-50 text-brand-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    purple: "bg-violet-50 text-violet-700"
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-semibold text-navy-900">{value}</p>
        </div>
        <div className={cn("grid h-10 w-10 place-items-center rounded-2xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
