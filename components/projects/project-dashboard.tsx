"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  MoreHorizontal,
  FilePlus2,
  FileText,
  Flag,
  Landmark,
  Loader2,
  MapPin,
  Milestone,
  NotebookPen,
  Pencil,
  Plus,
  ReceiptText,
  Send,
  Settings2,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { PremiumCard, SectionHeader } from "@/components/ui/premium";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusChip } from "@/components/ui/status-chip";
import { AOR_SCOPE_ITEMS } from "@/lib/constants";
import { cn, formatCurrency, formatDate, percentage } from "@/lib/format";
import { getSupabaseClient } from "@/lib/supabase/client";

type ProjectData = {
  project: Record<string, unknown> | null;
  stages: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
  timeLogs: Record<string, unknown>[];
  invoices: Record<string, unknown>[];
  quotations: Record<string, unknown>[];
  documents: Record<string, unknown>[];
  siteVisits: Record<string, unknown>[];
  milestones: Record<string, unknown>[];
  authority: Record<string, unknown>[];
  ncr: Record<string, unknown>[];
  notes: Record<string, unknown>[];
  members: Record<string, unknown>[];
  profiles: Record<string, unknown>[];
  aor: Record<string, unknown>[];
};

type ActivityItem = {
  title: string;
  meta: string;
  date: string;
  tone: "blue" | "green" | "amber" | "rose" | "purple";
  icon: LucideIcon;
};

const emptyProjectData: ProjectData = {
  project: null,
  stages: [],
  tasks: [],
  timeLogs: [],
  invoices: [],
  quotations: [],
  documents: [],
  siteVisits: [],
  milestones: [],
  authority: [],
  ncr: [],
  notes: [],
  members: [],
  profiles: [],
  aor: []
};

const canonicalStages = [
  "Pre-Planning",
  "Concept Design",
  "Schematic Design",
  "Design Development",
  "Detailed Design",
  "Authority Approval",
  "Tender & Procurement",
  "Construction",
  "Handover & Closeout"
];

const tabLabels = [
  "Tasks",
  "Time Logs",
  "Invoices",
  "Quotations",
  "Site Visits",
  "Documents",
  "Payment Milestones",
  "Notes",
  "Authority Submissions",
  "NCR Logs",
  "AOR Checklist"
];

const quickActions: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Add Task", href: "/tasks", icon: Plus },
  { label: "Log Time", href: "/time-tracking", icon: Clock3 },
  { label: "Upload Document", href: "/documents", icon: FilePlus2 },
  { label: "Create Invoice", href: "/invoices", icon: ReceiptText },
  { label: "Create Quotation", href: "/quotations", icon: FileText },
  { label: "Schedule Visit", href: "/site-visits", icon: CalendarDays },
  { label: "Add Milestone", href: "/payments", icon: Milestone },
  { label: "Add Note", href: "#notes", icon: NotebookPen }
];

const chartColors = ["#1267b8", "#31b980", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];

export function ProjectDashboard({ projectId }: { projectId: string }) {
  const supabase = getSupabaseClient();
  const [data, setData] = useState<ProjectData>(emptyProjectData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabLabels[0]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const projectResult = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
    if (projectResult.error) {
      setError(projectResult.error.message);
      setLoading(false);
      return;
    }

    const project = projectResult.data as Record<string, unknown> | null;
    const projectName = String(project?.project_name ?? "");

    const [stages, tasks, timeLogs, invoices, quotations, documents, siteVisits, milestones, authority, ncr, notes, members, profiles, aor] =
      await Promise.all([
        supabase.from("project_stages").select("*").eq("project_id", projectId).order("stage_order"),
        supabase.from("tasks").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
        supabase.from("time_logs").select("*").eq("project_id", projectId).order("date", { ascending: false }),
        supabase.from("invoices").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
        supabase.from("quotations").select("*").ilike("project_name", `%${projectName}%`).order("created_at", { ascending: false }),
        supabase.from("documents").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
        supabase.from("site_visits").select("*").eq("project_id", projectId).order("visit_date", { ascending: false }),
        supabase.from("payment_milestones").select("*").eq("project_id", projectId).order("due_date", { ascending: true }),
        supabase.from("authority_submissions").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
        supabase.from("ncr_logs").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
        supabase.from("project_notes").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
        supabase.from("project_members").select("*").eq("project_id", projectId),
        supabase.from("profiles").select("id, full_name, role, department, designation").order("full_name"),
        supabase.from("aor_checklists").select("*").eq("project_id", projectId).order("created_at", { ascending: true })
      ]);

    const firstError = [stages, tasks, timeLogs, invoices, quotations, documents, siteVisits, milestones, authority, ncr, notes, members, profiles, aor].find(
      (result) => result.error
    )?.error;
    if (firstError) setError(firstError.message);

    setData({
      project,
      stages: stages.data ?? [],
      tasks: tasks.data ?? [],
      timeLogs: timeLogs.data ?? [],
      invoices: invoices.data ?? [],
      quotations: quotations.data ?? [],
      documents: documents.data ?? [],
      siteVisits: siteVisits.data ?? [],
      milestones: milestones.data ?? [],
      authority: authority.data ?? [],
      ncr: ncr.data ?? [],
      notes: notes.data ?? [],
      members: members.data ?? [],
      profiles: profiles.data ?? [],
      aor: aor.data ?? []
    });
    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const profileMap = useMemo(() => new Map(data.profiles.map((profile) => [String(profile.id), profile])), [data.profiles]);
  const stageMap = useMemo(() => new Map(data.stages.map((stage) => [String(stage.id), stage])), [data.stages]);

  const summary = useMemo(() => {
    const totalHours = data.timeLogs.reduce((sum, log) => sum + Number(log.hours ?? 0), 0);
    const invoiceTotal = data.invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount ?? 0), 0);
    const received = data.invoices.reduce((sum, invoice) => sum + Number(invoice.payment_received ?? 0), 0);
    const budget = Number(data.project?.budget ?? 0);
    const spent = budget * (Number(data.project?.overall_progress ?? 0) / 100) * 0.72;
    return {
      totalHours,
      invoiceTotal,
      received,
      spent,
      budget,
      taskComplete: data.tasks.filter((task) => task.status === "Completed").length,
      overdueTasks: data.tasks.filter((task) => task.due_date && new Date(String(task.due_date)) < new Date() && task.status !== "Completed").length,
      upcomingMilestones: data.milestones.filter((milestone) => String(milestone.status ?? "") !== "Paid").length,
      openNcr: data.ncr.filter((item) => item.status !== "Closed").length,
      pendingAuthority: data.authority.filter((item) => item.status !== "Approved").length
    };
  }, [data]);

  const stages = useMemo(() => normalizeStages(data.stages), [data.stages]);
  const taskStatus = useMemo(() => withFallback(group(data.tasks, "status"), "No tasks"), [data.tasks]);
  const timeTrend = useMemo(() => buildTimeTrend(summary.totalHours), [summary.totalHours]);
  const budgetGauge = useMemo(() => [{ name: "Spent", value: percentage(summary.spent, summary.budget), fill: "#f59e0b" }], [summary.budget, summary.spent]);
  const activityFeed = useMemo(() => buildActivity(data), [data]);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-[1.75rem] border border-blue-100 bg-white text-sm font-bold text-slate-500 shadow-card">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-600" />
        Loading project dashboard
      </div>
    );
  }

  if (!data.project) {
    return <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-semibold text-rose-700">{error ?? "Project not found."}</div>;
  }

  const manager = profileMap.get(String(data.project.project_manager_id));
  const thumbnail = String(data.project.cover_image_url ?? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80");
  const overallProgress = Number(data.project.overall_progress ?? 0);

  return (
    <section className="space-y-5">
      {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <ProjectHeader project={data.project} manager={manager} thumbnail={thumbnail} />

      <StageTracker stages={stages} progress={overallProgress} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Overall Progress" value={`${overallProgress}%`} helper={summary.overdueTasks ? `${summary.overdueTasks} delayed tasks` : "On track"} icon={BarChart3} tone="blue" highlight />
        <KpiCard label="Total Tasks" value={data.tasks.length} helper={`${summary.taskComplete} completed`} icon={CheckCircle2} tone="green" />
        <KpiCard label="Time Spent" value={`${Math.round(summary.totalHours)} hrs`} helper="Logged design hours" icon={Clock3} tone="purple" />
        <KpiCard label="Budget" value={formatCurrency(summary.budget)} helper={`Spent ${formatCurrency(summary.spent)}`} icon={Landmark} tone="green" wide />
        <KpiCard label="Invoices" value={formatCurrency(summary.invoiceTotal)} helper={`Paid ${formatCurrency(summary.received)}`} icon={ReceiptText} tone="purple" wide />
        <KpiCard label="Milestones" value={summary.upcomingMilestones} helper="Upcoming payments" icon={Flag} tone="rose" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_0.7fr_1.1fr_0.55fr]">
        <ChartCard title="Progress Overview" subtitle="Completion vs remaining">
          <div className="relative h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Completed", value: overallProgress },
                    { name: "Remaining", value: Math.max(100 - overallProgress, 0) }
                  ]}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  <Cell fill="#31b980" />
                  <Cell fill="#dbeafe" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-3xl font-black text-navy-900">{overallProgress}%</p>
                <p className="text-xs font-bold text-slate-400">complete</p>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Task Status" subtitle="Design and site workload">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={taskStatus}>
              <CartesianGrid vertical={false} stroke="#e8f0fb" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {taskStatus.map((_entry, index) => (
                  <Cell key={index} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Time Spent vs Planned" subtitle="Cumulative hours">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={timeTrend}>
              <CartesianGrid vertical={false} stroke="#e8f0fb" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="planned" stroke="#93c5fd" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="actual" stroke="#1267b8" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Budget" subtitle="Spent vs contract">
          <div className="relative h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="72%" outerRadius="95%" data={budgetGauge} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "#e8f0fb" }} />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-x-0 bottom-8 text-center">
              <p className="text-2xl font-black text-navy-900">{percentage(summary.spent, summary.budget)}%</p>
              <p className="text-xs font-bold text-slate-500">{formatCurrency(summary.spent)}</p>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr_0.8fr_1fr]">
        <ListWidget title="Recent Tasks" rows={data.tasks.slice(0, 5)} fields={["task_name", "status", "due_date"]} />
        <ListWidget title="Recent Documents" rows={data.documents.slice(0, 5)} fields={["title", "document_type", "revision_no"]} />
        <ListWidget title="Upcoming Milestones" rows={data.milestones.slice(0, 5)} fields={["milestone_name", "status", "due_date"]} />
        <TeamWidget members={data.members} profiles={profileMap} />
        <ActivityFeed items={activityFeed} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_29rem]">
        <PremiumCard className="overflow-hidden p-0">
          <div className="border-b border-blue-50 px-5 pt-4">
            <div className="premium-scroll flex gap-2 overflow-x-auto pb-3">
              {tabLabels.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-black transition",
                    activeTab === tab ? "bg-brand-600 text-white shadow-lg shadow-blue-100" : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-brand-700"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <ProjectTab activeTab={activeTab} data={data} profileMap={profileMap} stageMap={stageMap} />
        </PremiumCard>

        <QuickActionsPanel stages={stages} />
      </div>
    </section>
  );
}

function ProjectHeader({ project, manager, thumbnail }: { project: Record<string, unknown>; manager?: Record<string, unknown>; thumbnail: string }) {
  return (
    <PremiumCard className="overflow-hidden p-0">
      <div className="border-b border-blue-50 bg-gradient-to-r from-white via-white to-blue-50/60 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <Image src={thumbnail} alt="" width={256} height={192} unoptimized className="h-24 w-full rounded-[1.25rem] object-cover shadow-sm ring-1 ring-blue-100 sm:w-32" />
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="truncate text-2xl font-black tracking-tight text-navy-900">{String(project.project_name)}</h2>
              <StatusChip value={project.status} />
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-brand-700">{String(project.project_code ?? "ANTCPL")}</span>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <InfoInline icon={UsersRound} label="Client" value={String(project.client_name ?? "-")} />
              <InfoInline icon={UsersRound} label="Project Manager" value={String(manager?.full_name ?? "-")} />
              <InfoInline icon={CalendarDays} label="Start Date" value={formatDate(project.start_date)} />
              <InfoInline icon={CalendarDays} label="End Date" value={formatDate(project.end_date)} />
              <InfoInline icon={MapPin} label="Location" value={String(project.location ?? "-")} />
              <InfoInline icon={Landmark} label="Authority" value={String(project.authority ?? "-")} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-black text-navy-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-brand-700"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
          <Link className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-black text-navy-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-brand-700" href="/projects">
            <Pencil className="h-4 w-4" />
            Edit Project
          </Link>
          <Link className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-brand-700" href="/tasks">
            <Plus className="h-4 w-4" />
            New Task
          </Link>
          <button className="grid h-10 w-10 place-items-center rounded-2xl border border-blue-100 bg-white text-navy-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-brand-700" title="Project settings">
            <Settings2 className="h-4 w-4" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-2xl border border-blue-100 bg-white text-navy-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-brand-700" title="More actions">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      </div>
      <div className="grid gap-0 divide-y divide-blue-50 bg-slate-50/60 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <ProjectSignal label="Authority Status" value={String(project.authority ?? "Dubai Municipality")} helper="NOC / comments tracker" />
        <ProjectSignal label="Design Stage" value={String(project.project_type ?? "Engineering Consultancy")} helper="AOR and supervision scope" />
        <ProjectSignal label="Plot / Location" value={String(project.plot_no ?? project.location ?? "-")} helper="Dubai, UAE" />
        <ProjectSignal label="Budget Exposure" value={formatCurrency(project.budget)} helper="Contract and invoice baseline" />
      </div>
    </PremiumCard>
  );
}

function ProjectSignal({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-navy-900">{value}</p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-500">{helper}</p>
    </div>
  );
}

function StageTracker({ stages, progress }: { stages: Record<string, unknown>[]; progress: number }) {
  const nextIndex = stages.findIndex((stage) => String(stage.status) !== "Completed" && Number(stage.progress ?? 0) < 100);
  const currentIndex = nextIndex >= 0 ? nextIndex : Math.max(0, stages.length - 1);

  return (
    <PremiumCard className="overflow-hidden p-0">
      <div className="p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Project Stages</p>
          <h3 className="mt-1 text-lg font-black text-navy-900">Authority and delivery lifecycle</h3>
        </div>
        <div className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-black text-brand-700">Overall Progress: {progress}%</div>
      </div>

      <div className="premium-scroll overflow-x-auto pb-2">
        <div className="relative min-w-[1040px] px-2 pb-2">
          <div className="absolute left-10 right-10 top-[2.35rem] h-1 rounded-full bg-slate-200" />
          <div className="absolute left-10 top-[2.35rem] h-1 rounded-full bg-brand-600 transition-all duration-700" style={{ width: `calc((100% - 5rem) * ${progress / 100})` }} />
          <div className="relative grid grid-cols-9 gap-3">
            {stages.map((stage, index) => (
              <StageNode key={String(stage.stage_name)} stage={stage} index={index} active={index === currentIndex} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ProgressBar value={progress} />
      </div>
      </div>
    </PremiumCard>
  );
}

function StageNode({ stage, index, active }: { stage: Record<string, unknown>; index: number; active: boolean }) {
  const status = String(stage.status ?? "Pending");
  const completed = status === "Completed" || Number(stage.progress ?? 0) >= 100;
  const pendingTone = index === 5 ? "bg-amber-50 text-amber-700 ring-amber-100" : index === 6 ? "bg-violet-50 text-violet-700 ring-violet-100" : "bg-slate-100 text-slate-600 ring-slate-200";
  const circleClass = completed ? "bg-emerald-100 text-emerald-700 ring-emerald-200" : active ? "bg-blue-100 text-brand-700 ring-blue-200 shadow-lg shadow-blue-100" : pendingTone;

  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div className={cn("z-10 grid h-12 w-12 place-items-center rounded-full text-sm font-black ring-4 ring-offset-4 ring-offset-white transition", circleClass)}>
        {index + 1}
      </div>
      <p className="mt-3 h-8 text-[11px] font-black leading-4 text-navy-800">{String(stage.stage_name)}</p>
      <p className={cn("mt-1 text-[11px] font-bold", completed ? "text-emerald-600" : active ? "text-brand-600" : "text-slate-400")}>{status}</p>
    </div>
  );
}

function InfoInline({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 border-r border-blue-50 pr-3 last:border-r-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-brand-600">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold text-slate-400">{label}</span>
        <span className="block truncate text-xs font-black text-navy-900">{value}</span>
      </span>
    </div>
  );
}

function KpiCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
  wide = false,
  highlight = false
}: {
  label: string;
  value: ReactNode;
  helper: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "amber" | "rose" | "purple";
  wide?: boolean;
  highlight?: boolean;
}) {
  return (
    <PremiumCard className={cn("p-4", wide && "md:col-span-2 xl:col-span-1", highlight && "bg-gradient-to-br from-white to-blue-50")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-black text-navy-900">{value}</p>
        </div>
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs font-bold text-slate-400">{helper}</p>
    </PremiumCard>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <PremiumCard className="p-4">
      <div className="mb-3">
        <h3 className="text-base font-black text-navy-900">{title}</h3>
        <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
      </div>
      {children}
    </PremiumCard>
  );
}

function ListWidget({ title, rows, fields }: { title: string; rows: Record<string, unknown>[]; fields: string[] }) {
  return (
    <PremiumCard className="p-4">
      <h3 className="text-base font-black text-navy-900">{title}</h3>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={String(row.id)} className="rounded-2xl border border-blue-50 bg-slate-50/80 p-3 transition hover:bg-white hover:shadow-sm">
            <p className="truncate text-sm font-black text-navy-900">{String(row[fields[0]] ?? "Record")}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
              {fields.slice(1).map((field) =>
                field.includes("status") ? <StatusChip key={field} value={row[field]} /> : <span key={field}>{String(field.includes("date") ? formatDate(row[field]) : row[field] ?? "-")}</span>
              )}
            </div>
          </div>
        ))}
        {rows.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No records yet.</p> : null}
      </div>
    </PremiumCard>
  );
}

function TeamWidget({ members, profiles }: { members: Record<string, unknown>[]; profiles: Map<string, Record<string, unknown>> }) {
  return (
    <PremiumCard className="p-4">
      <h3 className="text-base font-black text-navy-900">Project Team</h3>
      <div className="mt-3 space-y-2">
        {members.slice(0, 5).map((member) => {
          const profile = profiles.get(String(member.user_id));
          return (
            <div key={String(member.id)} className="flex items-center gap-3 rounded-2xl border border-blue-50 bg-slate-50/80 p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-xs font-black text-brand-700">
                {initials(String(profile?.full_name ?? "AN"))}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-navy-900">{String(profile?.full_name ?? "Team member")}</p>
                <p className="truncate text-xs font-semibold text-slate-500">{String(member.project_role ?? profile?.role ?? "Role")}</p>
              </div>
            </div>
          );
        })}
        {members.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No team members assigned.</p> : null}
      </div>
    </PremiumCard>
  );
}

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <PremiumCard className="p-4">
      <h3 className="text-base font-black text-navy-900">Updates</h3>
      <div className="mt-3 space-y-3">
        {items.slice(0, 4).map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={`${item.title}-${index}`} className="flex gap-3">
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", toneMap[item.tone])}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 border-b border-blue-50 pb-3 last:border-b-0">
                <p className="truncate text-sm font-black text-navy-900">{item.title}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{item.meta}</p>
                <p className="mt-1 text-[11px] font-bold text-slate-400">{formatDate(item.date)}</p>
              </div>
            </div>
          );
        })}
        {items.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No updates yet.</p> : null}
      </div>
    </PremiumCard>
  );
}

function QuickActionsPanel({ stages }: { stages: Record<string, unknown>[] }) {
  return (
    <PremiumCard className="p-5">
      <SectionHeader eyebrow="Quick Actions" title="Project controls" description="Common actions for tasks, documents, invoices, authority coordination, and site supervision." />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white p-3 text-center text-xs font-black text-navy-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-brand-700"
            >
              <Icon className="h-5 w-5" />
              {action.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-5 border-t border-blue-50 pt-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Stage legend</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {stages.map((stage, index) => (
            <div key={String(stage.stage_name)} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <span className={cn("grid h-5 w-5 place-items-center rounded-full text-[10px] font-black", index < 2 ? "bg-emerald-100 text-emerald-700" : index === 5 ? "bg-amber-100 text-amber-700" : index === 6 ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-brand-700")}>
                {index + 1}
              </span>
              <span className="truncate">{String(stage.stage_name)}</span>
            </div>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
}

function ProjectTab({
  activeTab,
  data,
  profileMap,
  stageMap
}: {
  activeTab: string;
  data: ProjectData;
  profileMap: Map<string, Record<string, unknown>>;
  stageMap: Map<string, Record<string, unknown>>;
}) {
  const tabRows: Record<string, { rows: Record<string, unknown>[]; fields: string[] }> = {
    Tasks: { rows: data.tasks, fields: ["task_name", "stage_id", "assigned_to", "status", "priority", "due_date", "progress"] },
    "Time Logs": { rows: data.timeLogs, fields: ["date", "user_id", "hours", "remarks"] },
    Invoices: { rows: data.invoices, fields: ["invoice_no", "status", "total_amount", "payment_received", "balance"] },
    Quotations: { rows: data.quotations, fields: ["quotation_no", "status", "total_amount", "follow_up_date"] },
    "Site Visits": { rows: data.siteVisits, fields: ["visit_date", "status", "site_engineer_id", "next_visit_date"] },
    Documents: { rows: data.documents, fields: ["title", "document_type", "revision_no", "status"] },
    "Payment Milestones": { rows: data.milestones, fields: ["milestone_name", "status", "amount", "due_date"] },
    Notes: { rows: data.notes, fields: ["note", "created_by", "created_at"] },
    "Authority Submissions": { rows: data.authority, fields: ["authority_name", "submission_type", "status", "response_due_date"] },
    "NCR Logs": { rows: data.ncr, fields: ["title", "severity", "status", "due_date"] },
    "AOR Checklist": {
      rows: data.aor.length ? data.aor : AOR_SCOPE_ITEMS.map((item, index) => ({ id: index, checklist_item: item, status: "Pending" })),
      fields: ["checklist_item", "status", "assigned_to", "due_date"]
    }
  };

  const active = tabRows[activeTab];

  return (
    <div className="premium-scroll overflow-x-auto">
      <table className="w-full min-w-[920px] border-separate border-spacing-0">
        <thead>
          <tr className="bg-slate-50/90">
            {active.fields.map((field) => (
              <th key={field} className="border-b border-blue-50 px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500 first:pl-5">
                {field.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {active.rows.map((row) => (
            <tr key={String(row.id)} className="transition hover:bg-blue-50/45">
              {active.fields.map((field) => (
                <td key={field} className="border-b border-blue-50 px-4 py-3 text-sm font-medium text-slate-700 first:pl-5">
                  {renderTabCell(row[field], field, profileMap, stageMap)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {active.rows.length === 0 ? <p className="p-5 text-sm font-semibold text-slate-500">No records yet.</p> : null}
    </div>
  );
}

function renderTabCell(value: unknown, field: string, profileMap: Map<string, Record<string, unknown>>, stageMap: Map<string, Record<string, unknown>>) {
  if (field.includes("status") || field === "severity" || field === "priority" || field === "document_type") return <StatusChip value={value} />;
  if (field.includes("date") || field === "created_at") return formatDate(value);
  if (field.includes("amount") || field.includes("balance") || field.includes("total") || field.includes("payment")) return formatCurrency(value);
  if (field === "progress") {
    return (
      <div className="min-w-32">
        <ProgressBar value={Number(value ?? 0)} />
        <span className="mt-1 block text-xs font-bold text-slate-500">{Number(value ?? 0)}%</span>
      </div>
    );
  }
  if (field === "stage_id") return value ? String(stageMap.get(String(value))?.stage_name ?? "Stage") : "-";
  if (field.endsWith("_to") || field.endsWith("_by") || field === "user_id" || field === "site_engineer_id") {
    return value ? String(profileMap.get(String(value))?.full_name ?? "User") : "-";
  }
  return String(value ?? "-");
}

const toneMap = {
  blue: "bg-blue-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  purple: "bg-violet-50 text-violet-700"
};

function normalizeStages(rows: Record<string, unknown>[]) {
  return canonicalStages.map((name, index) => {
    const row = rows.find((stage) => String(stage.stage_name) === name || Number(stage.stage_order) === index + 1);
    return row ?? { id: name, stage_name: name, stage_order: index + 1, status: index < 2 ? "Completed" : index === 2 ? "In Progress" : "Pending", progress: index < 2 ? 100 : index === 2 ? 55 : 0 };
  });
}

function buildTimeTrend(totalHours: number) {
  const labels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return labels.map((name, index) => {
    const planned = Math.round((index + 1) * 250);
    const actual = Math.round((totalHours / labels.length) * (index + 1));
    return { name, planned, actual };
  });
}

function buildActivity(data: ProjectData): ActivityItem[] {
  const items: ActivityItem[] = [
    ...data.documents.map((document) => ({
      title: String(document.title ?? "Document uploaded"),
      meta: `Revision ${String(document.revision_no ?? "R0")} / ${String(document.document_type ?? "Document")}`,
      date: String(document.created_at ?? new Date().toISOString()),
      tone: "blue" as const,
      icon: FileText
    })),
    ...data.siteVisits.map((visit) => ({
      title: "Site inspection updated",
      meta: `${String(visit.location ?? "Site")} / ${String(visit.status ?? "Scheduled")}`,
      date: String(visit.visit_date ?? new Date().toISOString()),
      tone: "green" as const,
      icon: CalendarDays
    })),
    ...data.authority.map((authority) => ({
      title: `${String(authority.authority_name ?? "Authority")} response`,
      meta: `${String(authority.submission_type ?? "NOC")} / ${String(authority.status ?? "Pending")}`,
      date: String(authority.created_at ?? authority.submitted_date ?? new Date().toISOString()),
      tone: "amber" as const,
      icon: Send
    })),
    ...data.ncr.map((ncr) => ({
      title: String(ncr.title ?? "NCR action"),
      meta: `Corrective action / ${String(ncr.status ?? "Open")}`,
      date: String(ncr.created_at ?? ncr.due_date ?? new Date().toISOString()),
      tone: "rose" as const,
      icon: Flag
    })),
    ...data.invoices.map((invoice) => ({
      title: String(invoice.invoice_no ?? "Invoice generated"),
      meta: `${formatCurrency(invoice.total_amount)} / ${String(invoice.status ?? "Draft")}`,
      date: String(invoice.created_at ?? invoice.due_date ?? new Date().toISOString()),
      tone: "purple" as const,
      icon: ReceiptText
    }))
  ];

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function group(rows: Record<string, unknown>[], key: string) {
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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
