import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-blue-200 bg-gradient-to-b from-white to-blue-50/45 p-8 text-center">
      <div className="rounded-2xl bg-white p-4 text-brand-600 shadow-sm ring-1 ring-blue-100">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-navy-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
