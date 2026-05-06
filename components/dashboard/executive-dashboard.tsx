"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileClock,
  Loader2,
  ReceiptText,
  Route,
  ShieldAlert,
  TrendingUp,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { PremiumCard, SectionHeader, StatPill } from "@/components/ui/premium";
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
};

type ActivityItem = {
  title: string;
  meta: string;
  date: string;
  tone: "blue" | "green" | "amber" | "rose" | "purple";
  icon: LucideIcon;
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
  documents: []
};

const chartColors = ["#1267b8", "#31b980", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];

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

    const [projects, tasks, invoices, quotations, attendance, siteVisits, ncr, milestones, authority, documents] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("quotations").select("*").order("created_at", { ascending: false }),
      supabase.from("attendance").select("*").order("date", { ascending: false }).limit(90),
      supabase.from("site_visits").select("*").order("visit_date", { ascending: false }),
      supabase.from("ncr_logs").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_milestones").select("*").order("due_date", { ascending: true }),
      supabase.from("authority_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("documents").select("*").order("created_at", { ascending: false }).limit(20)
    ]);

    const firstError = [projects, tasks, invoices, quotations, attendance, siteVisits, ncr, milestones, authority, documents].find((result) => result.error)?.error;
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
      documents: documents.data ?? []
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekAhead = new Date(Date.now() + 7 * 86400000);
    const activeProjects = data.projects.filter((project) => ["Active", "Delayed"].includes(String(project.status))).length;
    const overdueTasks = data.tasks.filter((task) => task.due_date && new Date(String(task.due_date)) < new Date() && task.status !== "Completed").length;
    const invoicesRaised = data.invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount ?? 0), 0);
    const paymentsReceived = data.invoices.reduce((sum, invoice) => sum + Number(invoice.payment_received ?? 0), 0);
    const staffPresent = data.attendance.filter((item) => item.date === today && ["Present", "Late", "Half Day"].includes(String(item.status))).length;
    const siteVisitsWeek = data.siteVisits.filter((visit) => {
      if (!visit.visit_date) return false;
      const date = new Date(String(visit.visit_date));
      return date >= new Date(Date.now() - 86400000) && date <= weekAhead;
    }).length;
    const pendingQuotations = data.quotations.filter((quote) => ["Sent", "Follow-Up", "LPO Pending"].includes(String(quote.status))).length;
    const ncrOpen = data.ncr.filter((item) => item.status !== "Closed").length;

    return {
      activeProjects,
      totalTasks: data.tasks.length,
      pendingTasks: data.tasks.filter((task) => ["Pending", "Not Started", "Review"].includes(String(task.status))).length,
      overdueTasks,
      invoicesRaised,
      paymentsReceived,
      pendingQuotations,
      staffPresent,
      siteVisitsWeek,
      ncrOpen,
      collectionRate: percentage(paymentsReceived, invoicesRaised)
    };
  }, [data]);

  const projectProgress = useMemo(
    () =>
      data.projects.slice(0, 6).map((project) => ({
        name: String(project.project_name ?? "Project"),
        progress: Number(project.overall_progress ?? 0),
        budget: Number(project.budget ?? 0),
        authority: String(project.authority ?? "Authority"),
        status: String(project.status ?? "Active")
      })),
    [data.projects]
  );

  const taskStatus = useMemo(() => withFallback(groupByStatus(data.tasks, "status"), "No tasks"), [data.tasks]);
  const authorityStatus = useMemo(() => withFallback(groupByStatus(data.authority, "status"), "No submissions"), [data.authority]);
  const attendanceTrend = useMemo(() => groupByStatus(data.attendance, "date").slice(0, 8).reverse(), [data.attendance]);
  const invoiceCollection = useMemo(
    () =>
      data.invoices.slice(0, 8).map((invoice) => ({
        name: String(invoice.invoice_no ?? "Invoice"),
        raised: Number(invoice.total_amount ?? 0),
        received: Number(invoice.payment_received ?? 0)
      })),
    [data.invoices]
  );
  const budgetData = useMemo(
    () =>
      data.projects.slice(0, 5).map((project) => ({
        name: String(project.project_name ?? "Project"),
        budget: Number(project.budget ?? 0),
        spent: Number(project.budget ?? 0) * (Number(project.overall_progress ?? 0) / 100) * 0.72
      })),
    [data.projects]
  );
  const activityFeed = useMemo(() => buildActivityFeed(data), [data]);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-[1.75rem] border border-blue-100 bg-white text-sm font-bold text-slate-500 shadow-card">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-600" />
        Loading executive dashboard
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <PremiumCard className="overflow-hidden p-0">
          <div className="relative p-6 sm:p-7">
            <div className="absolute right-0 top-0 h-36 w-72 rounded-bl-[4rem] bg-gradient-to-br from-blue-50 to-transparent" />
            <SectionHeader
              eyebrow="A N T Engineering Consultants"
              title="Executive Dashboard"
              description="Live operating view for Dubai consultancy projects, authority approvals, AOR coordination, finance, staff attendance, site supervision, and NCR closeout."
              action={<span className="rounded-2xl bg-navy-50 px-4 py-3 text-sm font-black text-navy-800">Today: {formatDate(new Date().toISOString())}</span>}
            />
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <StatPill label="Active projects" value={metrics.activeProjects} icon={Building2} />
              <StatPill label="Collection" value={`${metrics.collectionRate}%`} icon={Banknote} tone="green" />
              <StatPill label="Overdue tasks" value={metrics.overdueTasks} icon={AlertTriangle} tone={metrics.overdueTasks ? "rose" : "green"} />
              <StatPill label="Open NCR" value={metrics.ncrOpen} icon={ShieldAlert} tone={metrics.ncrOpen ? "rose" : "green"} />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Needs Action</p>
              <h3 className="mt-1 text-xl font-black text-navy-900">Priority queue</h3>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
              <FileClock className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <PriorityItem label="Authority submissions pending" value={data.authority.filter((item) => item.status !== "Approved").length} tone="amber" />
            <PriorityItem label="Sales quotations to follow up" value={metrics.pendingQuotations} tone="blue" />
            <PriorityItem label="Site visits this week" value={metrics.siteVisitsWeek} tone="green" />
          </div>
        </PremiumCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Tasks" value={metrics.totalTasks} helper={`${metrics.pendingTasks} pending or review`} icon={ClipboardList} tone="purple" variant="compact" />
        <MetricCard label="Invoices Raised" value={formatCurrency(metrics.invoicesRaised)} helper={`${data.invoices.length} invoices`} icon={ReceiptText} tone="blue" variant="wide" />
        <MetricCard label="Payments Received" value={formatCurrency(metrics.paymentsReceived)} helper={`${metrics.collectionRate}% collected`} icon={Banknote} tone="green" variant="wide" />
        <MetricCard label="Staff Present Today" value={metrics.staffPresent} helper="Office, site, WFH" icon={UsersRound} tone="green" variant="compact" />
        <MetricCard label="Site Visits" value={metrics.siteVisitsWeek} helper="This week" icon={CalendarCheck} tone="amber" variant="compact" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <ProjectProgressBoard projects={projectProgress} />
        <div className="grid gap-5 md:grid-cols-2">
          <ChartCard title="Task status" subtitle="Workload by delivery status">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={taskStatus} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={4}>
                  {taskStatus.map((_entry, index) => (
                    <Cell key={index} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <AuthorityCard data={authorityStatus} total={data.authority.length} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard title="Budget vs spent" subtitle="Estimated utilization by project">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={budgetData}>
              <CartesianGrid vertical={false} stroke="#e8f0fb" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="budget" fill="#dbeafe" radius={[8, 8, 0, 0]} />
              <Bar dataKey="spent" fill="#1267b8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Invoice collection" subtitle="Raised vs received">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={invoiceCollection}>
              <CartesianGrid vertical={false} stroke="#e8f0fb" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area dataKey="raised" fill="#dbeafe" stroke="#1267b8" strokeWidth={2} />
              <Area dataKey="received" fill="#dcfce7" stroke="#31b980" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attendance trend" subtitle="Daily attendance records">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid vertical={false} stroke="#e8f0fb" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1267b8" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_25rem]">
        <PremiumCard className="p-5">
          <SectionHeader
            eyebrow="Consultancy lifecycle"
            title="Current project pulse"
            description="Progress, authority exposure, budgets, and delivery status across active ANTCPL work."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projectProgress.map((project) => (
              <div key={project.name} className="rounded-[1.35rem] border border-blue-100 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black text-navy-900">{project.name}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">{project.authority} authority workflow</p>
                  </div>
                  <StatusChip value={project.status} />
                </div>
                <div className="mt-5">
                  <ProgressBar value={project.progress} />
                  <div className="mt-2 flex justify-between text-xs font-bold text-slate-500">
                    <span>{project.progress}% complete</span>
                    <span>{formatCurrency(project.budget)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>

        <ActivityFeed items={activityFeed} />
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  helper,
  variant
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: "blue" | "green" | "amber" | "rose" | "purple";
  helper: string;
  variant: "compact" | "wide";
}) {
  const toneClass = toneMap[tone];

  return (
    <PremiumCard className={cn("p-4", variant === "wide" && "md:col-span-2 xl:col-span-1")} hover>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-black text-navy-900">{value}</p>
        </div>
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", toneClass)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs font-bold text-slate-400">{helper}</p>
    </PremiumCard>
  );
}

function PriorityItem({ label, value, tone }: { label: string; value: number; tone: "blue" | "green" | "amber" }) {
  const color = tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-brand-700";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
      <span className="text-sm font-bold text-navy-800">{label}</span>
      <span className={cn("rounded-full px-2.5 py-1 text-xs font-black", color)}>{value}</span>
    </div>
  );
}

function ProjectProgressBoard({ projects }: { projects: Array<{ name: string; progress: number; budget: number; authority: string; status: string }> }) {
  const leader = projects[0];

  return (
    <PremiumCard className="overflow-hidden p-0">
      <div className="grid min-h-full md:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-gradient-to-br from-navy-900 via-navy-700 to-brand-700 p-5 text-white">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-100">
            <TrendingUp className="h-4 w-4" />
            Project progress overview
          </div>
          <p className="mt-5 text-4xl font-black">{leader?.progress ?? 0}%</p>
          <p className="mt-2 text-sm font-semibold text-blue-100">{leader?.name ?? "No active project"} leading current delivery</p>
          <div className="mt-6 rounded-2xl bg-white/12 p-4 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-100">Executive signal</p>
            <p className="mt-2 text-sm leading-6 text-white/90">Design stage, authority approvals, site supervision, invoices, and NCR actions are visible in one operating view.</p>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-navy-900">Active projects</h3>
              <p className="text-sm font-medium text-slate-500">Overall completion by project</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-brand-600" />
          </div>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.name}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-navy-900">{project.name}</p>
                    <p className="truncate text-xs font-semibold text-slate-400">{project.authority}</p>
                  </div>
                  <span className="text-sm font-black text-navy-900">{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} />
              </div>
            ))}
            {projects.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No active projects yet.</p> : null}
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}

function AuthorityCard({ data, total }: { data: Array<{ name: string; value: number }>; total: number }) {
  return (
    <ChartCard title="Authority status" subtitle="DCD, Nakheel, Trakhees, DM, DDA">
      <div className="space-y-3">
        {data.map((status, index) => (
          <div key={status.name} className="rounded-2xl border border-blue-100 bg-slate-50/70 p-3">
            <div className="mb-2 flex items-center justify-between">
              <StatusChip value={status.name} />
              <span className="text-sm font-black text-navy-900">{status.value}</span>
            </div>
            <ProgressBar value={percentage(status.value, total || status.value)} />
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <PremiumCard className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Recent Activity</p>
          <h3 className="mt-1 text-xl font-black text-navy-900">Updates feed</h3>
        </div>
        <Route className="h-5 w-5 text-brand-600" />
      </div>
      <div className="mt-5 space-y-4">
        {items.slice(0, 7).map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={`${item.title}-${index}`} className="flex gap-3">
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", toneMap[item.tone])}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 border-b border-blue-50 pb-4 last:border-b-0">
                <p className="truncate text-sm font-black text-navy-900">{item.title}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{item.meta}</p>
                <p className="mt-1 text-[11px] font-bold text-slate-400">{formatDate(item.date)}</p>
              </div>
            </div>
          );
        })}
        {items.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No recent updates yet.</p> : null}
      </div>
    </PremiumCard>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <PremiumCard className="p-5">
      <div className="mb-4">
        <h3 className="text-lg font-black text-navy-900">{title}</h3>
        <p className="text-sm font-medium text-slate-500">{subtitle}</p>
      </div>
      {children}
    </PremiumCard>
  );
}

const toneMap = {
  blue: "bg-blue-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  purple: "bg-violet-50 text-violet-700"
};

function buildActivityFeed(data: DashboardState): ActivityItem[] {
  const items: ActivityItem[] = [
    ...data.documents.map((document) => ({
      title: String(document.title ?? "Document uploaded"),
      meta: `Drawing revision / ${String(document.document_type ?? "Document")}`,
      date: String(document.created_at ?? new Date().toISOString()),
      tone: "blue" as const,
      icon: FileCheck2
    })),
    ...data.siteVisits.map((visit) => ({
      title: String(visit.location ?? "Site visit scheduled"),
      meta: `Supervision report / ${String(visit.status ?? "Scheduled")}`,
      date: String(visit.visit_date ?? new Date().toISOString()),
      tone: "green" as const,
      icon: CalendarCheck
    })),
    ...data.ncr.map((ncr) => ({
      title: String(ncr.title ?? "NCR action"),
      meta: `Quality / ${String(ncr.status ?? "Open")}`,
      date: String(ncr.created_at ?? ncr.due_date ?? new Date().toISOString()),
      tone: "rose" as const,
      icon: ShieldAlert
    })),
    ...data.authority.map((submission) => ({
      title: `${String(submission.authority_name ?? "Authority")} submission`,
      meta: `${String(submission.submission_type ?? "NOC")} / ${String(submission.status ?? "Pending")}`,
      date: String(submission.created_at ?? submission.submitted_date ?? new Date().toISOString()),
      tone: "amber" as const,
      icon: FileClock
    })),
    ...data.tasks.slice(0, 8).map((task) => ({
      title: String(task.task_name ?? "Task update"),
      meta: `Design task / ${String(task.status ?? "Not Started")}`,
      date: String(task.created_at ?? task.due_date ?? new Date().toISOString()),
      tone: "purple" as const,
      icon: CheckCircle2
    }))
  ];

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function groupByStatus(rows: Record<string, unknown>[], key: string) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const label = String(row[key] ?? "Unassigned");
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function withFallback(data: Array<{ name: string; value: number }>, label: string) {
  return data.length ? data : [{ name: label, value: 1 }];
}
