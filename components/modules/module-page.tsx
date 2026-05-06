"use client";

import Link from "next/link";
import { FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  Edit3,
  FileDown,
  FileText,
  KanbanSquare,
  Loader2,
  MoreHorizontal,
  Plus,
  Printer,
  Search,
  Table2,
  Trash2,
  UploadCloud,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusChip } from "@/components/ui/status-chip";
import { exportRowsToCsv, printReport } from "@/lib/export";
import { cn, formatCurrency, formatDate, formatDateTime, percentage } from "@/lib/format";
import { getModuleConfig } from "@/lib/modules";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { FormField, ModuleConfig, ModuleKey, ModuleRecord, Profile, SelectOption, TableColumn } from "@/lib/types";

type OptionsState = {
  users: SelectOption[];
  projects: SelectOption[];
  stages: SelectOption[];
  tasks: SelectOption[];
};

const emptyOptions: OptionsState = {
  users: [],
  projects: [],
  stages: [],
  tasks: []
};

export function ModulePage({
  moduleKey,
  titleOverride,
  allowCreate = true
}: {
  moduleKey: ModuleKey;
  titleOverride?: string;
  allowCreate?: boolean;
}) {
  const config = getModuleConfig(moduleKey);
  const supabase = getSupabaseClient();
  const { profile } = useAuth();
  const [rows, setRows] = useState<ModuleRecord[]>([]);
  const [options, setOptions] = useState<OptionsState>(emptyOptions);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [editing, setEditing] = useState<ModuleRecord | null>(null);
  const [open, setOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setRows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [recordsResult, usersResult, projectsResult, stagesResult, tasksResult] = await Promise.all([
      supabase.from(config.table).select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, role, department").order("full_name"),
      supabase.from("projects").select("id, project_name, project_code").order("project_name"),
      supabase.from("project_stages").select("id, stage_name, project_id, stage_order").order("stage_order"),
      supabase.from("tasks").select("id, task_name, project_id").order("created_at", { ascending: false })
    ]);

    if (recordsResult.error) {
      setError(recordsResult.error.message);
      setRows([]);
    } else {
      setRows((recordsResult.data ?? []) as ModuleRecord[]);
    }

    setOptions({
      users: ((usersResult.data ?? []) as Profile[]).map((user) => ({
        value: user.id,
        label: user.full_name,
        meta: user.role
      })),
      projects: ((projectsResult.data ?? []) as Array<{ id: string; project_name: string; project_code: string }>).map((project) => ({
        value: project.id,
        label: project.project_name,
        meta: project.project_code
      })),
      stages: ((stagesResult.data ?? []) as Array<{ id: string; stage_name: string; project_id: string; stage_order: number }>).map((stage) => ({
        value: stage.id,
        label: `${stage.stage_order}. ${stage.stage_name}`,
        meta: stage.project_id
      })),
      tasks: ((tasksResult.data ?? []) as Array<{ id: string; task_name: string; project_id: string }>).map((task) => ({
        value: task.id,
        label: task.task_name,
        meta: task.project_id
      }))
    });

    setLoading(false);
  }, [config.table, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const relationMaps = useMemo(() => {
    return {
      users: new Map(options.users.map((item) => [item.value, item.label])),
      projects: new Map(options.projects.map((item) => [item.value, item.label])),
      stages: new Map(options.stages.map((item) => [item.value, item.label])),
      tasks: new Map(options.tasks.map((item) => [item.value, item.label]))
    };
  }, [options]);

  const statuses = useMemo(() => {
    if (!config.statusField) return [];
    return Array.from(new Set(rows.map((row) => String(row[config.statusField!] ?? "")).filter(Boolean))).sort();
  }, [config.statusField, rows]);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = statusFilter === "All" || String(row[config.statusField ?? ""] ?? "") === statusFilter;
      const matchesSearch =
        !term ||
        config.searchFields.some((field) => {
          const value = row[field];
          return value !== null && value !== undefined && String(value).toLowerCase().includes(term);
        });
      return matchesStatus && matchesSearch;
    });
  }, [config.searchFields, config.statusField, query, rows, statusFilter]);

  async function uploadFile(field: FormField, files: File[]) {
    if (!supabase || files.length === 0) return undefined;

    const urls: string[] = [];
    for (const file of files) {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${config.table}/${crypto.randomUUID()}-${cleanName}`;
      const { error: uploadError } = await supabase.storage.from("erp-documents").upload(path, file, {
        cacheControl: "3600",
        upsert: false
      });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("erp-documents").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    return field.multiple ? urls : urls[0];
  }

  async function handleSubmit(formData: FormData) {
    if (!supabase) return;
    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {};
      for (const field of config.formFields) {
        if (field.readOnly) continue;

        if (field.type === "file") {
          const files = formData.getAll(field.name).filter((item): item is File => item instanceof File && item.size > 0);
          const uploaded = await uploadFile(field, files);
          if (uploaded !== undefined) payload[field.name] = uploaded;
          continue;
        }

        if (field.type === "checkbox") {
          payload[field.name] = formData.get(field.name) === "on";
          continue;
        }

        const value = formData.get(field.name);
        if (value === null || value === "") {
          payload[field.name] = null;
          continue;
        }

        if (field.type === "number") {
          payload[field.name] = Number(value);
        } else {
          payload[field.name] = String(value);
        }
      }

      applySmartDefaults(config, payload, profile);

      const isUpdate = Boolean(editing?.id);
      const result = isUpdate
        ? await supabase.from(config.table).update(payload).eq("id", editing!.id).select("*").single()
        : await supabase.from(config.table).insert(payload).select("*").single();

      if (result.error) throw result.error;

      setOpen(false);
      setEditing(null);
      await fetchData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save record.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: ModuleRecord) {
    if (!supabase || !confirm(`Delete this ${config.singular.toLowerCase()}?`)) return;
    const { error: deleteError } = await supabase.from(config.table).delete().eq("id", row.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await fetchData();
  }

  async function markInvoicePaid(row: ModuleRecord) {
    if (!supabase) return;
    const total = Number(row.total_amount ?? 0);
    const { error: updateError } = await supabase.from("invoices").update({ status: "Paid", payment_received: total }).eq("id", row.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await fetchData();
  }

  async function acknowledgeCircular(row: ModuleRecord) {
    if (!supabase || !profile) return;
    const { error: ackError } = await supabase.from("circular_acknowledgements").insert({ circular_id: row.id, user_id: profile.id });
    if (ackError) {
      setError(ackError.message);
      return;
    }
    await fetchData();
  }

  const headerTitle = titleOverride ?? config.title;
  const ConfigIcon = config.icon;

  return (
    <section className="space-y-5">
      <PremiumCard className="overflow-hidden p-0">
        <div className="relative flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="absolute right-0 top-0 h-28 w-64 rounded-bl-[4rem] bg-gradient-to-br from-blue-50 to-transparent" />
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-brand-100 text-brand-700 shadow-sm">
              <ConfigIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">ANTCPL operations</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-navy-900">{headerTitle}</h2>
              <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-slate-500">{config.description}</p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-2">
          {config.key === "tasks" ? (
            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <button
                className={cn("inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold", view === "table" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500")}
                onClick={() => setView("table")}
              >
                <Table2 className="h-4 w-4" />
                Table
              </button>
              <button
                className={cn("inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold", view === "kanban" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500")}
                onClick={() => setView("kanban")}
              >
                <KanbanSquare className="h-4 w-4" />
                Kanban
              </button>
            </div>
          ) : null}
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-brand-700"
            onClick={() => exportRowsToCsv(`${config.key}-report`, filteredRows, config.columns)}
          >
            <FileDown className="h-4 w-4" />
            CSV
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-brand-700"
            onClick={printReport}
          >
            <Printer className="h-4 w-4" />
            PDF
          </button>
          {allowCreate ? (
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-brand-700"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add {config.singular}
            </button>
          ) : null}
        </div>
        </div>
      </PremiumCard>

      <div className="rounded-[1.75rem] border border-blue-100 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${config.title.toLowerCase()}`}
              className="min-w-0 flex-1 bg-transparent text-navy-900 outline-none placeholder:text-slate-400"
            />
          </label>
          {config.statusField ? (
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            >
              <option>All</option>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!loading && filteredRows.length > 0 ? <ModuleHighlights config={config} rows={filteredRows} relationMaps={relationMaps} /> : null}

      <PremiumCard className="print-surface overflow-hidden p-0">
        {loading ? (
          <div className="flex min-h-80 items-center justify-center text-sm font-semibold text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-600" />
            Loading {config.title.toLowerCase()}
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={FileText}
              title={`No ${config.title.toLowerCase()} found`}
              message="Create the first record or adjust the current filters."
              actionLabel={allowCreate ? `Add ${config.singular}` : undefined}
              onAction={allowCreate ? () => setOpen(true) : undefined}
            />
          </div>
        ) : view === "kanban" && config.key === "tasks" ? (
          <KanbanView rows={filteredRows} config={config} relationMaps={relationMaps} onEdit={(row) => { setEditing(row); setOpen(true); }} />
        ) : (
          <DataTable
            rows={filteredRows}
            config={config}
            relationMaps={relationMaps}
            onEdit={(row) => {
              setEditing(row);
              setOpen(true);
            }}
            onDelete={handleDelete}
            onMarkPaid={markInvoicePaid}
            onAcknowledge={acknowledgeCircular}
          />
        )}
      </PremiumCard>

      {open ? (
        <RecordModal
          config={config}
          editing={editing}
          options={options}
          saving={saving}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  );
}

function DataTable({
  rows,
  config,
  relationMaps,
  onEdit,
  onDelete,
  onMarkPaid,
  onAcknowledge
}: {
  rows: ModuleRecord[];
  config: ModuleConfig;
  relationMaps: RelationMaps;
  onEdit: (row: ModuleRecord) => void;
  onDelete: (row: ModuleRecord) => void;
  onMarkPaid: (row: ModuleRecord) => void;
  onAcknowledge: (row: ModuleRecord) => void;
}) {
  return (
    <div className="premium-scroll overflow-x-auto">
      <table className="w-full min-w-[900px] border-separate border-spacing-0">
        <thead>
          <tr className="bg-slate-50/95">
            {config.columns.map((column) => (
              <th key={column.key} className="border-b border-blue-50 px-4 py-4 text-left text-[11px] font-black uppercase tracking-wide text-slate-500 first:pl-5">
                {column.label}
              </th>
            ))}
            <th className="border-b border-blue-50 px-4 py-4 text-right text-[11px] font-black uppercase tracking-wide text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="group transition hover:bg-blue-50/45">
              {config.columns.map((column) => (
                <td key={column.key} className="border-b border-blue-50 px-4 py-4 text-sm font-medium text-slate-700 first:pl-5">
                  <CellValue row={row} column={column} relationMaps={relationMaps} rowHref={config.rowHref?.(row)} />
                </td>
              ))}
              <td className="border-b border-blue-50 px-4 py-4">
                <div className="flex justify-end gap-2">
                  {config.key === "invoices" && row.status !== "Paid" ? (
                    <button
                      className="rounded-xl p-2 text-emerald-600 transition hover:bg-emerald-50"
                      onClick={() => onMarkPaid(row)}
                      title="Mark invoice paid"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  ) : null}
                  {config.key === "circulars" && row.acknowledgement_required ? (
                    <button
                      className="rounded-xl p-2 text-brand-600 transition hover:bg-blue-50"
                      onClick={() => onAcknowledge(row)}
                      title="Acknowledge circular"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  ) : null}
                  <button className="rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-brand-700" onClick={() => onEdit(row)} title="Edit">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700" onClick={() => onDelete(row)} title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-navy-700" title="More">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type RelationMaps = {
  users: Map<string, string>;
  projects: Map<string, string>;
  stages: Map<string, string>;
  tasks: Map<string, string>;
};

function ModuleHighlights({ config, rows, relationMaps: _relationMaps }: { config: ModuleConfig; rows: ModuleRecord[]; relationMaps: RelationMaps }) {
  if (config.key === "projects") {
    return (
      <div className="grid gap-4 xl:grid-cols-4">
        {rows.slice(0, 4).map((row) => (
          <Link
            key={row.id}
            href={config.rowHref?.(row) ?? "/projects"}
            className="group rounded-[1.45rem] border border-blue-100 bg-white/90 p-4 shadow-card transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-navy-900">{String(row.project_name ?? "Project")}</p>
                <p className="mt-1 truncate text-xs font-bold text-slate-500">{String(row.client_name ?? "Client")} / {String(row.authority ?? "Authority")}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-brand-600 opacity-0 transition group-hover:opacity-100" />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <StatusChip value={row.status} />
              <span className="text-xs font-black text-slate-500">{formatCurrency(row.budget)}</span>
            </div>
            <div className="mt-4">
              <ProgressBar value={Number(row.overall_progress ?? 0)} />
              <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>{Number(row.overall_progress ?? 0)}% lifecycle progress</span>
                <Building2 className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (config.key === "tasks") {
    const delayed = rows.filter((row) => row.status === "Delayed").length;
    const critical = rows.filter((row) => row.priority === "Critical").length;
    const review = rows.filter((row) => row.status === "Review").length;
    const completed = rows.filter((row) => row.status === "Completed").length;
    const completion = percentage(completed, rows.length);

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TaskSignal title="Delayed design actions" value={delayed} helper="Past due or blocked" icon={AlertTriangle} tone="rose" />
        <TaskSignal title="Critical priority" value={critical} helper="Needs project manager focus" icon={FlagIcon} tone="amber" />
        <TaskSignal title="In review" value={review} helper="AOR / authority checks" icon={CheckCircle2} tone="blue" />
        <div className="rounded-[1.45rem] border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Completion</p>
              <p className="mt-1 text-2xl font-black text-navy-900">{completion}%</p>
            </div>
            <CalendarDays className="h-5 w-5 text-brand-600" />
          </div>
          <div className="mt-4">
            <ProgressBar value={completion} />
          </div>
          <p className="mt-2 text-xs font-bold text-slate-500">{completed} of {rows.length} tasks completed</p>
        </div>
      </div>
    );
  }

  return null;
}

function TaskSignal({
  title,
  value,
  helper,
  icon: Icon,
  tone
}: {
  title: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  tone: "blue" | "amber" | "rose";
}) {
  const tones = {
    blue: "bg-blue-50 text-brand-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700"
  };

  return (
    <div className="rounded-[1.45rem] border border-blue-100 bg-white/90 p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-navy-900">{title}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{helper}</p>
        </div>
        <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black text-navy-900">{value}</p>
    </div>
  );
}

const FlagIcon = AlertTriangle;

function CellValue({
  row,
  column,
  relationMaps,
  rowHref
}: {
  row: ModuleRecord;
  column: TableColumn;
  relationMaps: RelationMaps;
  rowHref?: string;
}) {
  const value = row[column.key];
  let content: ReactNode;

  if (column.type === "status") content = <StatusChip value={value} />;
  else if (column.type === "date") content = formatDate(value);
  else if (column.type === "datetime") content = formatDateTime(value);
  else if (column.type === "currency") content = formatCurrency(value);
  else if (column.type === "percent")
    content = (
      <div className="min-w-36">
        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
          <span>{Number(value ?? 0)}%</span>
        </div>
        <ProgressBar value={Number(value ?? 0)} />
      </div>
    );
  else if (column.type === "user") content = value ? relationMaps.users.get(String(value)) ?? "Assigned user" : "-";
  else if (column.type === "project") content = value ? relationMaps.projects.get(String(value)) ?? "Project" : "-";
  else if (column.type === "file")
    content = value ? (
      <a className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700" href={String(Array.isArray(value) ? value[0] : value)} target="_blank">
        <Download className="h-4 w-4" />
        Open
      </a>
    ) : (
      "-"
    );
  else if (column.type === "boolean") content = value ? "Yes" : "No";
  else content = String(value ?? "-");

  if (rowHref && (column.key.includes("name") || column.key.includes("code") || column.key === "title")) {
    return (
      <Link href={rowHref} className="font-semibold text-navy-900 transition hover:text-brand-700">
        {content}
      </Link>
    );
  }

  return <>{content}</>;
}

function KanbanView({
  rows,
  config,
  relationMaps,
  onEdit
}: {
  rows: ModuleRecord[];
  config: ModuleConfig;
  relationMaps: RelationMaps;
  onEdit: (row: ModuleRecord) => void;
}) {
  const columns = ["Not Started", "In Progress", "Review", "Pending", "Delayed", "Completed"];

  return (
    <div className="grid gap-4 overflow-x-auto p-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {columns.map((status) => {
        const cards = rows.filter((row) => row.status === status);
        return (
          <div key={status} className="min-h-96 rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between">
              <StatusChip value={status} />
              <span className="text-xs font-semibold text-slate-400">{cards.length}</span>
            </div>
            <div className="space-y-3">
              {cards.map((row) => (
                <button
                  key={row.id}
                  onClick={() => onEdit(row)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
                >
                  <p className="font-semibold text-navy-900">{String(row.task_name ?? "Task")}</p>
                  <p className="mt-2 text-xs text-slate-500">{relationMaps.projects.get(String(row.project_id)) ?? "Project"}</p>
                  <div className="mt-4">
                    <ProgressBar value={Number(row.progress ?? 0)} />
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{relationMaps.users.get(String(row.assigned_to)) ?? "Unassigned"}</span>
                      <span>{Number(row.progress ?? 0)}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecordModal({
  config,
  editing,
  options,
  saving,
  onClose,
  onSubmit
}: {
  config: ModuleConfig;
  editing: ModuleRecord | null;
  options: OptionsState;
  saving: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(new FormData(event.currentTarget));
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-navy-900/35 p-0 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-hidden bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-blue-50 bg-gradient-to-r from-white to-blue-50/70 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">{editing ? "Edit record" : "New record"}</p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-navy-900">{editing ? `Edit ${config.singular}` : `Add ${config.singular}`}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">Grouped workflow form for ANTCPL operations.</p>
          </div>
          <button className="rounded-2xl p-2 text-slate-500 transition hover:bg-slate-100" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="premium-scroll h-[calc(100%-98px)] overflow-y-auto p-6">
          <div className="mb-5 rounded-2xl border border-blue-100 bg-slate-50/80 p-4">
            <p className="text-sm font-black text-navy-900">Workflow details</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Use clean project, authority, finance, HR, and document fields. Files are uploaded to Supabase Storage when selected.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {config.formFields
              .filter((field) => !(field.hiddenOnCreate && !editing))
              .map((field) => (
                <FieldInput key={field.name} field={field} value={editing?.[field.name] ?? config.defaultValues?.[field.name]} options={options} />
              ))}
          </div>

          <div className="sticky bottom-0 mt-6 flex justify-end gap-3 border-t border-blue-50 bg-white/90 pt-4 backdrop-blur">
            <button type="button" className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldInput({ field, value, options }: { field: FormField; value: unknown; options: OptionsState }) {
  const common =
    "mt-2 w-full rounded-2xl border border-blue-100 bg-slate-50/70 px-4 py-3 text-sm font-medium text-navy-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100";
  const label = (
    <span className="text-sm font-black text-navy-900">
      {field.label}
      {field.required ? <span className="text-rose-500"> *</span> : null}
    </span>
  );

  const stringValue = inputValue(field, value);
  const wrapperClass = field.type === "textarea" || field.type === "file" ? "block sm:col-span-2" : "block";

  if (field.type === "textarea") {
    return (
      <label className={wrapperClass}>
        {label}
        <textarea name={field.name} defaultValue={String(value ?? "")} required={field.required} rows={field.rows ?? 4} placeholder={field.placeholder} className={common} />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className={wrapperClass}>
        {label}
        <select name={field.name} defaultValue={String(value ?? "")} required={field.required} className={common}>
          <option value="">Select</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "user" || field.type === "project" || field.type === "stage" || field.type === "task") {
    const selectOptions =
      field.type === "user" ? options.users : field.type === "project" ? options.projects : field.type === "stage" ? options.stages : options.tasks;
    return (
      <label className={wrapperClass}>
        {label}
        <select name={field.name} defaultValue={String(value ?? "")} required={field.required} className={common}>
          <option value="">Select</option>
          {selectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.meta ? ` / ${option.meta}` : ""}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-navy-900">
        <input name={field.name} type="checkbox" defaultChecked={Boolean(value)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
        {field.label}
      </label>
    );
  }

  if (field.type === "file") {
    return (
      <label className={wrapperClass}>
        {label}
        <div className="relative mt-2 rounded-2xl border border-dashed border-blue-200 bg-blue-50/45 p-5 text-center transition hover:bg-blue-50">
          <UploadCloud className="mx-auto h-6 w-6 text-brand-600" />
          <p className="mt-2 text-sm font-black text-navy-900">Drop or choose file</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Drawings, BOQs, NOC responses, site photos, or reports</p>
          <input name={field.name} type="file" multiple={field.multiple} className="absolute inset-0 cursor-pointer opacity-0" />
        </div>
        {value ? (
          <a href={String(Array.isArray(value) ? value[0] : value)} target="_blank" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600">
            <Download className="h-3.5 w-3.5" />
            Current file
          </a>
        ) : null}
      </label>
    );
  }

  return (
    <label className={wrapperClass}>
      {label}
      <input
        name={field.name}
        type={field.type}
        defaultValue={stringValue}
        required={field.required}
        readOnly={field.readOnly}
        placeholder={field.placeholder}
        className={common}
      />
    </label>
  );
}

function inputValue(field: FormField, value: unknown) {
  if (value === null || value === undefined) return "";
  if (field.type === "datetime-local") {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16);
  }
  return String(value);
}

function applySmartDefaults(config: ModuleConfig, payload: Record<string, unknown>, profile: Profile | null) {
  const profileId = profile?.id;

  if (profileId) {
    if ("created_by" in fieldNames(config) && !payload.created_by) payload.created_by = profileId;
    if ("uploaded_by" in fieldNames(config) && !payload.uploaded_by) payload.uploaded_by = profileId;
    if ("raised_by" in fieldNames(config) && !payload.raised_by) payload.raised_by = profileId;
    if ("user_id" in fieldNames(config) && !payload.user_id) payload.user_id = profileId;
    if ("site_engineer_id" in fieldNames(config) && !payload.site_engineer_id && profile?.role === "Site Engineer") payload.site_engineer_id = profileId;
  }

  if ((config.key === "quotations" || config.key === "invoices") && (!payload.total_amount || Number(payload.total_amount) === 0)) {
    payload.total_amount = Number(payload.amount ?? 0) + Number(payload.vat ?? 0);
  }
}

function fieldNames(config: ModuleConfig) {
  return Object.fromEntries(config.formFields.map((field) => [field.name, true]));
}
