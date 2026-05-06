"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  HardHat,
  Loader2,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  UploadCloud,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { PremiumCard } from "@/components/ui/premium";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusChip } from "@/components/ui/status-chip";
import { cn, formatCurrency, formatDate, percentage } from "@/lib/format";
import { getSupabaseClient } from "@/lib/supabase/client";

type DashboardState = {
  projects: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
  invoices: Record<string, unknown>[];
  quotations: Record<string, unknown>[];
  attendance: Record<string, unknown>[];
  siteVisits: Record<string, unknown>[];
  ncr: Record<string, unknown>[];
  milestones: Record<string, unknown>[];
  authority: Record<string, unknown>[];
  documents: Record<string, unknown>[];
  profiles: Record<string, unknown>[];
};

type SupervisionRow = {
  id: string;
  refNo: string;
  project: string;
  client: string;
  consultant: string;
  engineer: Record<string, unknown> | null;
  progress: number;
  lastVisit: string;
  ncrOpen: number;
  ncrClosed: number;
  qualityLogs: number;
  nextInspection: string;
  status: string;
};

type ActivityItem = {
  title: string;
  meta: string;
  date: string;
  icon: LucideIcon;
  tone: keyof typeof toneMap;
};

const initialState: DashboardState = {
  projects: [],
  tasks: [],
  invoices: [],
  quotations: [],
  attendance: [],
  siteVisits: [],
  ncr: [],
  milestones: [],
  authority: [],
  documents: [],
  profiles: []
};

const pastel = ["#91c8ff", "#8ee5bc", "#f8c471", "#c7a6ff", "#f59aa9", "#9ca3af"];
const qualityPalette = ["#dbeafe", "#dcfce7", "#fef3c7", "#f3e8ff", "#ffe4e6", "#e0f2fe"];

export function ExecutiveDashboard() {
  const supabase = getSupabaseClient();
  const [data, setData] = useState<DashboardState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [projects, tasks, invoices, quotations, attendance, siteVisits, ncr, milestones, authority, documents, profiles] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("quotations").select("*").order("created_at", { ascending: false }),
      supabase.from("attendance").select("*").order("date", { ascending: false }).limit(90),
      supabase.from("site_visits").select("*").order("visit_date", { ascending: false }),
      supabase.from("ncr_logs").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_milestones").select("*").order("due_date", { ascending: true }),
      supabase.from("authority_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("documents").select("*").order("created_at", { ascending: false }).limit(40),
      supabase.from("profiles").select("id, full_name, role, designation, department").order("full_name")
    ]);

    const firstError = [projects, tasks, invoices, quotations, attendance, siteVisits, ncr, milestones, authority, documents, profiles].find((result) => result.error)?.error;
    if (firstError) setError(firstError.message);

    setData({
      projects: projects.data ?? [],
      tasks: tasks.data ?? [],
      invoices: invoices.data ?? [],
      quotations: quotations.data ?? [],
      attendance: attendance.data ?? [],
      siteVisits: siteVisits.data ?? [],
      ncr: ncr.data ?? [],
      milestones: milestones.data ?? [],
      authority: authority.data ?? [],
      documents: documents.data ?? [],
      profiles: profiles.data ?? []
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const profileMap = useMemo(() => new Map(data.profiles.map((profile) => [String(profile.id), profile])), [data.profiles]);
  const rows = useMemo(() => buildSupervisionRows(data, profileMap), [data, profileMap]);

  const metrics = useMemo(() => {
    const totalSites = data.projects.length;
    const totalProgress = rows.reduce((sum, row) => sum + row.progress, 0);
    const ncrRaised = data.ncr.length;
    const ncrClosed = data.ncr.filter((item) => item.status === "Closed").length;
    const openNcr = ncrRaised - ncrClosed;
    const qualityLogs = data.documents.filter((item) => ["Site Report", "Authority Submission", "BOQ", "Tender", "Contract"].includes(String(item.document_type))).length + data.siteVisits.length;
    const pendingInvoices = data.invoices.filter((invoice) => ["Draft", "Issued", "Overdue"].includes(String(invoice.status))).length;
    const outstandingPayments = data.invoices.reduce((sum, invoice) => sum + Number(invoice.balance ?? 0), 0);
    return {
      totalSites,
      progress: percentage(totalProgress, Math.max(rows.length * 100, 1)),
      ncrRaised,
      ncrClosed,
      openNcr,
      qualityLogs,
      pendingInvoices,
      outstandingPayments
    };
  }, [data, rows]);

  const ncrChart = useMemo(
    () => [
      { name: "Closed", value: metrics.ncrClosed },
      { name: "Open", value: metrics.openNcr || 1 }
    ],
    [metrics.ncrClosed, metrics.openNcr]
  );

  const qualityChart = useMemo(
    () => [
      { name: "Inspection", value: data.siteVisits.length || 1 },
      { name: "Material", value: data.documents.filter((item) => String(item.document_type).includes("BOQ")).length || 1 },
      { name: "Authority", value: data.authority.length || 1 }
    ],
    [data.authority.length, data.documents, data.siteVisits.length]
  );

  const activityFeed = useMemo(() => buildActivityFeed(data), [data]);
  const recentNcr = data.ncr.slice(0, 4);
  const recentQuality = data.documents.slice(0, 4);
  const upcomingInspections = rows.filter((row) => row.nextInspection !== "-").slice(0, 4);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-[1.75rem] border border-blue-100 bg-white text-sm font-bold text-slate-500 shadow-card">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-600" />
        Loading ANTCPL supervision ERP
      </div>
    );
  }

  return (
    <section className="space-y-5">
      {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
        <KpiCard title="Total Sites" value={metrics.totalSites} subtitle="Active consultancy sites" icon={Building2} tone="blue" variant="compact" />
        <KpiCard title="Supervision Progress" value={`${metrics.progress}%`} subtitle="Average site progress" icon={HardHat} tone="green" variant="progress" progress={metrics.progress} />
        <KpiCard title="NCR Raised" value={metrics.ncrRaised} subtitle="Total non-conformances" icon={ShieldAlert} tone="rose" variant="icon" />
        <KpiCard title="NCR Closed" value={metrics.ncrClosed} subtitle="Corrective actions closed" icon={CheckCircle2} tone="green" variant="trend" trend="+12%" />
        <KpiCard title="Open NCR" value={metrics.openNcr} subtitle="Needs closeout" icon={AlertTriangle} tone="amber" variant="compact" />
        <KpiCard title="Quality Logs" value={metrics.qualityLogs} subtitle="Reports and inspections" icon={ClipboardCheck} tone="purple" variant="progress" progress={Math.min(metrics.qualityLogs * 8, 100)} />
        <KpiCard title="Pending Invoices" value={metrics.pendingInvoices} subtitle="Finance follow-up" icon={ReceiptText} tone="blue" variant="icon" />
        <KpiCard title="Outstanding" value={formatCurrency(metrics.outstandingPayments)} subtitle="Payments balance" icon={FileCheck2} tone="amber" variant="trend" trend="-4%" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.75fr_0.75fr]">
        <SiteProgressCard rows={rows} />
        <DonutCard title="NCR Status" subtitle="Raised vs closed" center={`${metrics.openNcr}`} centerLabel="open" data={ncrChart} colors={["#7dd3a8", "#f6a6b2"]} />
        <div className="grid gap-5">
          <DonutCard title="Quality Logs" subtitle="Inspection categories" center={`${metrics.qualityLogs}`} centerLabel="logs" data={qualityChart} colors={["#91c8ff", "#8ee5bc", "#c7a6ff"]} compact />
          <TodaySummary rows={rows} visits={data.siteVisits} />
        </div>
      </div>

      <FilterToolbar />

      <SupervisionTable rows={rows} />

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr_22rem]">
        <RecentNcrCard rows={recentNcr} profileMap={profileMap} />
        <QualityLogCard rows={recentQuality} />
        <UpcomingInspectionCard rows={upcomingInspections} />
        <ActivityAndActions items={activityFeed} />
      </div>
    </section>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
  variant,
  progress,
  trend
}: {
  title: string;
  value: ReactNode;
  subtitle: string;
  icon: LucideIcon;
  tone: keyof typeof toneMap;
  variant: "compact" | "progress" | "icon" | "trend";
  progress?: number;
  trend?: string;
}) {
  return (
    <PremiumCard className={cn("animate-rise-in p-4", variant === "progress" && "bg-gradient-to-br from-white to-blue-50/60")} hover>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 truncate text-2xl font-black text-navy-900">{value}</p>
        </div>
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {variant === "progress" ? (
        <div className="mt-4">
          <ProgressBar value={progress ?? 0} />
        </div>
      ) : null}
      {variant === "trend" ? <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">{trend} this month</p> : null}
      <p className="mt-3 text-xs font-bold text-slate-500">{subtitle}</p>
    </PremiumCard>
  );
}

function SiteProgressCard({ rows }: { rows: SupervisionRow[] }) {
  return (
    <PremiumCard className="p-5">
      <CardHeader title="Site Progress" subtitle="Supervision completion by live site" icon={HardHat} />
      <div className="mt-5 space-y-4">
        {rows.slice(0, 6).map((row) => (
          <div key={row.id} className="grid gap-3 rounded-2xl border border-blue-50 bg-slate-50/70 p-3 sm:grid-cols-[1fr_6rem] sm:items-center">
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-navy-900">{row.project}</p>
                  <p className="truncate text-xs font-semibold text-slate-500">{row.client}</p>
                </div>
                <StatusChip value={row.status} />
              </div>
              <ProgressBar value={row.progress} />
            </div>
            <p className="text-right text-xl font-black text-navy-900">{row.progress}%</p>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}

function DonutCard({
  title,
  subtitle,
  center,
  centerLabel,
  data,
  colors,
  compact = false
}: {
  title: string;
  subtitle: string;
  center: string;
  centerLabel: string;
  data: Array<{ name: string; value: number }>;
  colors: string[];
  compact?: boolean;
}) {
  return (
    <PremiumCard className="p-5">
      <CardHeader title={title} subtitle={subtitle} icon={ClipboardList} />
      <div className={cn("relative", compact ? "h-48" : "h-72")}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={compact ? 52 : 76} outerRadius={compact ? 76 : 108} paddingAngle={4}>
              {data.map((_entry, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-3xl font-black text-navy-900">{center}</p>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">{centerLabel}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
            <span className="truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}

function TodaySummary({ rows, visits }: { rows: SupervisionRow[]; visits: Record<string, unknown>[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const todayVisits = visits.filter((visit) => String(visit.visit_date ?? "").startsWith(today)).length;
  const nextRow = rows.find((row) => row.nextInspection !== "-");

  return (
    <PremiumCard className="p-5">
      <CardHeader title="Today's Site Summary" subtitle="Inspection and supervision signal" icon={CalendarClock} />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <SummaryTile label="Visits" value={todayVisits} />
        <SummaryTile label="Open NCR" value={rows.reduce((sum, row) => sum + row.ncrOpen, 0)} />
        <SummaryTile label="Sites" value={rows.length} />
      </div>
      <div className="mt-4 rounded-2xl bg-blue-50 p-3">
        <p className="text-xs font-black uppercase tracking-wide text-brand-700">Next inspection</p>
        <p className="mt-1 text-sm font-black text-navy-900">{nextRow?.project ?? "No inspection scheduled"}</p>
        <p className="text-xs font-bold text-slate-500">{nextRow?.nextInspection ?? "-"}</p>
      </div>
    </PremiumCard>
  );
}

function FilterToolbar() {
  return (
    <PremiumCard className="p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-blue-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
          <Search className="h-4 w-4 shrink-0" />
          <input className="min-w-0 flex-1 bg-transparent font-medium text-navy-900 outline-none placeholder:text-slate-400" placeholder="Search ref no, project, client, consultant, site engineer" />
        </label>
        <div className="flex flex-wrap gap-2">
          {["All Sites", "Open NCR", "This Week", "Authority", "Delayed"].map((item, index) => (
            <button key={item} className={cn("inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-black shadow-sm transition hover:-translate-y-0.5", index === 0 ? "border-brand-100 bg-blue-50 text-brand-700" : "border-blue-100 bg-white text-navy-700 hover:bg-blue-50")}>
              {index === 0 ? <Filter className="h-4 w-4" /> : null}
              {item}
            </button>
          ))}
          <button className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3.5 py-2.5 text-xs font-black text-navy-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50">
            <SlidersHorizontal className="h-4 w-4 text-brand-600" />
            Advanced
          </button>
        </div>
      </div>
    </PremiumCard>
  );
}

function SupervisionTable({ rows }: { rows: SupervisionRow[] }) {
  return (
    <PremiumCard className="overflow-hidden p-0">
      <div className="border-b border-blue-50 px-5 py-4">
        <CardHeader title="Main Supervision Register" subtitle="Site progress, NCR, quality logs, inspections, and assigned engineer ownership" icon={Building2} />
      </div>
      <div className="premium-scroll overflow-x-auto">
        <table className="w-full min-w-[1380px] border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50/95">
              {["Ref No", "Project/Site", "Client", "Consultant", "Assigned Site Engineer", "Progress %", "Last Site Visit", "NCR Open", "NCR Closed", "Quality Logs", "Next Inspection", "Status", "Actions"].map((column) => (
                <th key={column} className="border-b border-blue-50 px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500 first:pl-5">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-blue-50/45">
                <td className="border-b border-blue-50 px-4 py-3 pl-5 text-xs font-black text-brand-700">{row.refNo}</td>
                <td className="border-b border-blue-50 px-4 py-3">
                  <p className="text-sm font-black text-navy-900">{row.project}</p>
                  <p className="text-xs font-semibold text-slate-500">Dubai supervision site</p>
                </td>
                <td className="border-b border-blue-50 px-4 py-3 text-sm font-semibold text-slate-700">{row.client}</td>
                <td className="border-b border-blue-50 px-4 py-3 text-sm font-semibold text-slate-700">{row.consultant}</td>
                <td className="border-b border-blue-50 px-4 py-3">
                  <EngineerCell profile={row.engineer} />
                </td>
                <td className="border-b border-blue-50 px-4 py-3">
                  <div className="min-w-36">
                    <ProgressBar value={row.progress} />
                    <span className="mt-1 block text-xs font-black text-slate-500">{row.progress}%</span>
                  </div>
                </td>
                <td className="border-b border-blue-50 px-4 py-3 text-sm font-semibold text-slate-700">{row.lastVisit}</td>
                <td className="border-b border-blue-50 px-4 py-3"><CountBadge value={row.ncrOpen} tone="rose" /></td>
                <td className="border-b border-blue-50 px-4 py-3"><CountBadge value={row.ncrClosed} tone="green" /></td>
                <td className="border-b border-blue-50 px-4 py-3"><CountBadge value={row.qualityLogs} tone="blue" /></td>
                <td className="border-b border-blue-50 px-4 py-3 text-sm font-semibold text-slate-700">{row.nextInspection}</td>
                <td className="border-b border-blue-50 px-4 py-3"><StatusChip value={row.status} /></td>
                <td className="border-b border-blue-50 px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-brand-700" title="View"><Eye className="h-4 w-4" /></button>
                    <button className="rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-brand-700" title="More"><MoreHorizontal className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PremiumCard>
  );
}

function RecentNcrCard({ rows, profileMap }: { rows: Record<string, unknown>[]; profileMap: Map<string, Record<string, unknown>> }) {
  return (
    <WidgetCard title="Recent NCR" subtitle="Severity, root cause, due date, closeout progress" icon={ShieldAlert}>
      {rows.map((row) => (
        <div key={String(row.id)} className="rounded-2xl border border-blue-50 bg-slate-50/70 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-navy-900">{String(row.title ?? "NCR")}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Root cause: {String(row.corrective_action ?? "Under review").slice(0, 42)}</p>
            </div>
            <StatusChip value={row.severity} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{String(profileMap.get(String(row.assigned_to))?.full_name ?? "Assigned engineer")}</span>
            <span>{formatDate(row.due_date)}</span>
          </div>
          <div className="mt-3"><ProgressBar value={String(row.status) === "Closed" ? 100 : 45} /></div>
        </div>
      ))}
      {rows.length === 0 ? <EmptyWidget label="No NCR raised." /> : null}
    </WidgetCard>
  );
}

function QualityLogCard({ rows }: { rows: Record<string, unknown>[] }) {
  const categories = ["Inspection", "Material", "Workmanship", "Testing", "Safety", "Authority"];
  return (
    <WidgetCard title="Recent Quality Logs" subtitle="Inspection, material, testing, safety, authority" icon={ClipboardCheck}>
      <div className="mb-3 flex flex-wrap gap-2">
        {categories.map((item, index) => (
          <span key={item} className="rounded-full px-2.5 py-1 text-[11px] font-black text-navy-700" style={{ background: qualityPalette[index] }}>
            {item}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div key={String(row.id)} className="flex items-center justify-between gap-3 rounded-2xl border border-blue-50 bg-slate-50/70 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-navy-900">{String(row.title ?? "Quality log")}</p>
            <p className="truncate text-xs font-semibold text-slate-500">{String(row.document_type ?? "Inspection")} / {String(row.revision_no ?? "R0")}</p>
          </div>
          <StatusChip value={row.status ?? "Submitted"} />
        </div>
      ))}
      {rows.length === 0 ? <EmptyWidget label="No quality logs yet." /> : null}
    </WidgetCard>
  );
}

function UpcomingInspectionCard({ rows }: { rows: SupervisionRow[] }) {
  return (
    <WidgetCard title="Upcoming Inspections" subtitle="Next planned site visits and authority checks" icon={CalendarClock}>
      {rows.map((row) => (
        <div key={row.id} className="flex items-center justify-between gap-3 rounded-2xl border border-blue-50 bg-slate-50/70 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-navy-900">{row.project}</p>
            <p className="truncate text-xs font-semibold text-slate-500">{row.engineer?.full_name ? String(row.engineer.full_name) : "Site engineer"}</p>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-brand-700">{row.nextInspection}</span>
        </div>
      ))}
      {rows.length === 0 ? <EmptyWidget label="No upcoming inspections." /> : null}
    </WidgetCard>
  );
}

function ActivityAndActions({ items }: { items: ActivityItem[] }) {
  const actions = [
    { label: "Add Site Visit", icon: CalendarClock, tone: "blue" },
    { label: "Raise NCR", icon: ShieldAlert, tone: "rose" },
    { label: "Upload Document", icon: UploadCloud, tone: "green" },
    { label: "Create Inspection", icon: ClipboardCheck, tone: "purple" },
    { label: "Create Invoice", icon: ReceiptText, tone: "amber" },
    { label: "Add Task", icon: Plus, tone: "blue" }
  ] as const;

  return (
    <div className="space-y-5">
      <WidgetCard title="Quick Actions" subtitle="Supervision workflow shortcuts" icon={Plus}>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white text-center text-[11px] font-black text-navy-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50">
                <span className={cn("grid h-9 w-9 place-items-center rounded-xl", toneMap[action.tone])}><Icon className="h-4 w-4" /></span>
                {action.label}
              </button>
            );
          })}
        </div>
      </WidgetCard>

      <WidgetCard title="Activity / Alerts" subtitle="NCR, authority, invoice, site visit feed" icon={BellRing}>
        {items.slice(0, 5).map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={`${item.title}-${index}`} className="flex gap-3 border-b border-blue-50 pb-3 last:border-b-0">
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", toneMap[item.tone])}><Icon className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-navy-900">{item.title}</p>
                <p className="text-xs font-semibold text-slate-500">{item.meta}</p>
                <p className="text-[11px] font-bold text-slate-400">{formatDate(item.date)}</p>
              </div>
            </div>
          );
        })}
      </WidgetCard>
    </div>
  );
}

function CardHeader({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: LucideIcon }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-black text-navy-900">{title}</h3>
        <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>
      </div>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-brand-700">
        <Icon className="h-5 w-5" />
      </span>
    </div>
  );
}

function WidgetCard({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <PremiumCard className="p-4">
      <CardHeader title={title} subtitle={subtitle} icon={icon} />
      <div className="mt-4 space-y-3">{children}</div>
    </PremiumCard>
  );
}

function EngineerCell({ profile }: { profile: Record<string, unknown> | null }) {
  const name = String(profile?.full_name ?? "Unassigned engineer");
  const designation = String(profile?.designation ?? profile?.role ?? "Site Engineer");
  const online = name.length % 2 === 0;
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-xs font-black text-brand-700">
        {initials(name)}
        <span className={cn("absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full ring-2 ring-white", online ? "bg-emerald-500" : "bg-slate-300")} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-navy-900">{name}</p>
        <p className="truncate text-xs font-semibold text-slate-500">{designation}</p>
      </div>
    </div>
  );
}

function CountBadge({ value, tone }: { value: number; tone: "blue" | "green" | "rose" }) {
  return <span className={cn("inline-flex min-w-8 justify-center rounded-full px-2.5 py-1 text-xs font-black", toneMap[tone])}>{value}</span>;
}

function SummaryTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-blue-50 bg-white p-3 text-center shadow-sm">
      <p className="text-lg font-black text-navy-900">{value}</p>
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function EmptyWidget({ label }: { label: string }) {
  return <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">{label}</p>;
}

const toneMap = {
  blue: "bg-blue-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  purple: "bg-violet-50 text-violet-700"
};

function buildSupervisionRows(data: DashboardState, profileMap: Map<string, Record<string, unknown>>): SupervisionRow[] {
  return data.projects.map((project) => {
    const projectId = String(project.id);
    const projectVisits = data.siteVisits.filter((visit) => String(visit.project_id) === projectId);
    const projectNcr = data.ncr.filter((item) => String(item.project_id) === projectId);
    const projectDocs = data.documents.filter((item) => String(item.project_id) === projectId);
    const latestVisit = projectVisits[0];
    const nextVisit = projectVisits.find((visit) => visit.next_visit_date)?.next_visit_date;
    const engineerId = latestVisit?.site_engineer_id ?? project.project_manager_id;

    return {
      id: projectId,
      refNo: String(project.project_code ?? "ANT-SITE"),
      project: String(project.project_name ?? "Project"),
      client: String(project.client_name ?? "Client"),
      consultant: "ANTCPL",
      engineer: engineerId ? profileMap.get(String(engineerId)) ?? null : null,
      progress: Number(project.overall_progress ?? 0),
      lastVisit: formatDate(latestVisit?.visit_date),
      ncrOpen: projectNcr.filter((item) => item.status !== "Closed").length,
      ncrClosed: projectNcr.filter((item) => item.status === "Closed").length,
      qualityLogs: projectDocs.length + projectVisits.length,
      nextInspection: formatDate(nextVisit),
      status: String(project.status ?? "Active")
    };
  });
}

function buildActivityFeed(data: DashboardState): ActivityItem[] {
  const items: ActivityItem[] = [
    ...data.ncr.map((item) => ({
      title: String(item.title ?? "NCR raised"),
      meta: `NCR / ${String(item.status ?? "Open")}`,
      date: String(item.created_at ?? item.due_date ?? new Date().toISOString()),
      icon: ShieldAlert,
      tone: "rose" as const
    })),
    ...data.siteVisits.map((visit) => ({
      title: "Site visit update",
      meta: `${String(visit.location ?? "Site")} / ${String(visit.status ?? "Scheduled")}`,
      date: String(visit.visit_date ?? new Date().toISOString()),
      icon: HardHat,
      tone: "green" as const
    })),
    ...data.authority.map((item) => ({
      title: `${String(item.authority_name ?? "Authority")} comment`,
      meta: `${String(item.submission_type ?? "Submission")} / ${String(item.status ?? "Pending")}`,
      date: String(item.created_at ?? item.submitted_date ?? new Date().toISOString()),
      icon: FileText,
      tone: "amber" as const
    })),
    ...data.invoices.map((item) => ({
      title: String(item.invoice_no ?? "Invoice update"),
      meta: `${formatCurrency(item.total_amount)} / ${String(item.status ?? "Draft")}`,
      date: String(item.created_at ?? item.due_date ?? new Date().toISOString()),
      icon: ReceiptText,
      tone: "purple" as const
    }))
  ];

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
