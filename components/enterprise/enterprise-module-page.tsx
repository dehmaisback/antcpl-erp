"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileArchive,
  FileText,
  Filter,
  GitBranch,
  Landmark,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  TrendingUp,
  UploadCloud,
  UsersRound
} from "lucide-react";
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
import { PremiumCard } from "@/components/ui/premium";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusChip } from "@/components/ui/status-chip";
import type { EnterpriseNavItem } from "@/lib/enterprise-nav";
import { cn, formatCurrency } from "@/lib/format";

const siteRows = [
  {
    ref: "SUP-026",
    project: "Tower 26",
    client: "Shaikh Zayed Properties",
    consultant: "ANTCPL AOR",
    engineer: "Sana Ibrahim",
    role: "Site Engineer",
    progress: 72,
    lastVisit: "05 May 2026",
    next: "09 May 2026",
    ncrOpen: 3,
    ncrClosed: 14,
    quality: 28,
    status: "Active"
  },
  {
    ref: "SUP-041",
    project: "Marina View",
    client: "Harborline Developments",
    consultant: "ANTCPL Supervision",
    engineer: "Rashid Ahmed",
    role: "Resident Engineer",
    progress: 54,
    lastVisit: "04 May 2026",
    next: "08 May 2026",
    ncrOpen: 1,
    ncrClosed: 9,
    quality: 17,
    status: "In Progress"
  },
  {
    ref: "SUP-018",
    project: "Al Barsha Villas",
    client: "Nad Al Hamar Holdings",
    consultant: "ANTCPL Site Team",
    engineer: "Fatima Ali",
    role: "MEP Engineer",
    progress: 88,
    lastVisit: "06 May 2026",
    next: "12 May 2026",
    ncrOpen: 0,
    ncrClosed: 22,
    quality: 35,
    status: "On Track"
  },
  {
    ref: "SUP-073",
    project: "City Center Mall",
    client: "City Retail Group",
    consultant: "ANTCPL QA/QC",
    engineer: "Mohammed Saad",
    role: "Structural Engineer",
    progress: 41,
    lastVisit: "02 May 2026",
    next: "07 May 2026",
    ncrOpen: 5,
    ncrClosed: 11,
    quality: 21,
    status: "Action Pending"
  }
];

const lifecycle = [
  { name: "Pre-Planning", value: 100, status: "Completed" },
  { name: "Concept Design", value: 100, status: "Completed" },
  { name: "Schematic Design", value: 82, status: "In Progress" },
  { name: "Design Development", value: 56, status: "In Progress" },
  { name: "Detailed Design", value: 38, status: "Review" },
  { name: "Authority Approval", value: 24, status: "Pending" },
  { name: "Tender & Procurement", value: 0, status: "Pending" },
  { name: "Construction", value: 0, status: "Pending" },
  { name: "Handover & Closeout", value: 0, status: "Pending" }
];

const taskColumns = [
  {
    title: "Not Started",
    tone: "bg-slate-100 text-slate-700",
    cards: ["Tender clarification matrix", "Authority fee reconciliation", "Civil Defense checklist"]
  },
  {
    title: "In Progress",
    tone: "bg-blue-50 text-brand-700",
    cards: ["MEP coordination package", "Structural design review", "Drainage drawing response"]
  },
  {
    title: "Review",
    tone: "bg-violet-50 text-violet-700",
    cards: ["BOQ Rev 02 audit", "AOR compliance review"]
  },
  {
    title: "Delayed",
    tone: "bg-rose-50 text-rose-700",
    cards: ["Nakheel comment closeout"]
  },
  {
    title: "Completed",
    tone: "bg-emerald-50 text-emerald-700",
    cards: ["Site survey report", "Material submittal log"]
  }
];

const cashFlow = [
  { month: "Jan", expected: 480, collected: 420 },
  { month: "Feb", expected: 620, collected: 540 },
  { month: "Mar", expected: 710, collected: 580 },
  { month: "Apr", expected: 830, collected: 690 },
  { month: "May", expected: 960, collected: 780 },
  { month: "Jun", expected: 1100, collected: 870 }
];

const qualityTrend = [
  { name: "Inspection", value: 36 },
  { name: "Material", value: 22 },
  { name: "Workmanship", value: 18 },
  { name: "Testing", value: 14 },
  { name: "Safety", value: 10 }
];

const ncrBreakdown = [
  { name: "Closed", value: 46, color: "#34c38f" },
  { name: "Corrective", value: 18, color: "#1b78d0" },
  { name: "Open", value: 14, color: "#fb923c" },
  { name: "Critical", value: 6, color: "#fb7185" }
];

const documentMatrix = [
  { discipline: "Architectural", r0: "Approved", r1: "Submitted", r2: "In Review", authority: "DM" },
  { discipline: "Structural", r0: "Approved", r1: "Approved", r2: "Submitted", authority: "DDA" },
  { discipline: "MEP", r0: "For Revision", r1: "Submitted", r2: "Pending", authority: "DCD" },
  { discipline: "BOQ", r0: "Draft", r1: "Review", r2: "Pending", authority: "Client" }
];

const activity = [
  { title: "Trakhees comments received", meta: "Tower 26 / Authority approval", tone: "amber", time: "18m ago" },
  { title: "NCR-026 corrective action uploaded", meta: "City Center Mall / QA closeout", tone: "rose", time: "1h ago" },
  { title: "BOQ Rev 02 submitted to client", meta: "Marina View / Document control", tone: "blue", time: "3h ago" },
  { title: "Monthly supervision invoice generated", meta: "Al Barsha Villas / Accounts", tone: "green", time: "Yesterday" }
];

const pastel = ["#1b78d0", "#34c38f", "#fb923c", "#a78bfa", "#f472b6", "#94a3b8"];

export function EnterpriseModulePage({ module }: { module: EnterpriseNavItem }) {
  const Icon = module.icon;

  return (
    <section className="space-y-5 animate-rise-in">
      <PremiumCard className="overflow-hidden p-0">
        <div className="relative grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="absolute right-0 top-0 h-28 w-72 rounded-bl-[5rem] bg-gradient-to-br from-blue-50 via-sky-50 to-transparent" />
          <div className="relative flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[1.35rem] bg-gradient-to-br from-blue-50 to-brand-100 text-brand-700 shadow-sm">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">ANTCPL enterprise workspace</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-navy-900 sm:text-3xl">{module.title}</h2>
              <p className="mt-1 max-w-4xl text-sm font-semibold leading-6 text-slate-500">{module.description}</p>
            </div>
          </div>
          <div className="relative flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-black text-navy-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50">
              <Download className="h-4 w-4 text-brand-600" />
              Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-brand-700">
              <Plus className="h-4 w-4" />
              New Entry
            </button>
          </div>
        </div>
      </PremiumCard>

      {renderModuleLayout(module)}
    </section>
  );
}

function renderModuleLayout(module: EnterpriseNavItem) {
  if (module.type === "projects") return <ProjectOperations module={module} />;
  if (module.type === "supervision") return <SupervisionOperations module={module} />;
  if (module.type === "qaqc") return <QaqcOperations module={module} />;
  if (module.type === "tasks") return <TaskOperations module={module} />;
  if (module.type === "documents") return <DocumentOperations module={module} />;
  if (module.type === "accounts") return <AccountsOperations module={module} />;
  if (module.type === "hr") return <HrOperations module={module} />;
  if (module.type === "clients") return <ClientOperations module={module} />;
  if (module.type === "automation") return <AutomationOperations module={module} />;
  if (module.type === "alerts") return <AlertsOperations module={module} />;
  if (module.type === "reports") return <ReportsOperations module={module} />;
  return <SettingsOperations module={module} />;
}

function ProjectOperations({ module }: { module: EnterpriseNavItem }) {
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <PremiumCard className="p-5">
          <div className="flex flex-col gap-5 xl:flex-row">
            <div className="min-h-56 overflow-hidden rounded-[1.4rem] bg-[linear-gradient(135deg,#eaf5ff,#ffffff)] xl:w-72">
              <div className="h-full bg-[radial-gradient(circle_at_30%_22%,rgba(27,120,208,0.22),transparent_14rem),linear-gradient(140deg,#f8fbff,#dceeff)] p-5">
                <div className="grid h-full place-items-center rounded-[1.2rem] border border-white/80 bg-white/45 text-brand-700 shadow-inner">
                  <Building2 className="h-16 w-16" />
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-black text-navy-900">Tower 26 Project Control</h3>
                    <StatusChip value="Active" />
                  </div>
                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                    AOR compliance, design coordination, authority submission, tender issue, construction milestones, and client invoicing in one portfolio view.
                  </p>
                </div>
                <button className="rounded-2xl border border-blue-100 bg-white px-4 py-2 text-xs font-black text-brand-700 shadow-sm">Portfolio View</button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoTile icon={UsersRound} label="Client" value="Shaikh Zayed" />
                <InfoTile icon={ClipboardCheck} label="Project Manager" value="Nadia Khan" />
                <InfoTile icon={Landmark} label="Authority" value="DCD + DM" />
                <InfoTile icon={Building2} label="Location" value="Dubai, UAE" />
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Budget health</p>
              <p className="mt-2 text-3xl font-black text-navy-900">{formatCurrency(2850000)}</p>
              <p className="mt-1 text-sm font-bold text-slate-500">46% spent, 63% invoiced</p>
            </div>
            <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">On Track</span>
          </div>
          <div className="mt-5 space-y-4">
            <ProgressMetric label="Authority package" value={62} />
            <ProgressMetric label="Invoice collection" value={63} />
            <ProgressMetric label="Design closeout" value={78} />
          </div>
        </PremiumCard>
      </div>

      <PremiumCard className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">{module.title}</p>
            <h3 className="mt-1 text-xl font-black text-navy-900">Engineering lifecycle tracker</h3>
          </div>
          <p className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-black text-brand-700">Overall Progress: 42%</p>
        </div>
        <StageTracker />
      </PremiumCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]">
        <ChartPanel title="Stage progress curve" subtitle="Planned vs actual design delivery">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={cashFlow}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e7eefb" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="expected" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="collected" stroke="#1b78d0" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
        <TimelinePanel />
        <QuickActionPanel />
      </div>
    </>
  );
}

function SupervisionOperations({ module }: { module: EnterpriseNavItem }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard title="Total Sites" value="18" helper="12 active, 6 mobilizing" icon={Building2} tone="blue" />
        <MetricCard title="Supervision Progress" value="71%" helper="Across active sites" icon={TrendingUp} tone="green" progress={71} />
        <MetricCard title="NCR Raised" value="84" helper="This quarter" icon={ShieldAlert} tone="amber" />
        <MetricCard title="NCR Closed" value="62" helper="74% closure" icon={CheckCircle2} tone="green" progress={74} />
        <MetricCard title="Open NCR" value="22" helper="6 high priority" icon={AlertTriangle} tone="rose" />
        <MetricCard title="Quality Logs" value="146" helper="Inspections and tests" icon={ClipboardCheck} tone="purple" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.8fr_0.9fr]">
        <PremiumCard className="p-5">
          <SectionTitle title={`${module.title} progress`} subtitle="Site progress by assigned supervision team" />
          <div className="mt-5 space-y-4">
            {siteRows.map((site) => (
              <div key={site.ref} className="rounded-2xl border border-blue-50 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-navy-900">{site.project}</p>
                    <p className="truncate text-xs font-bold text-slate-500">{site.client}</p>
                  </div>
                  <span className="text-sm font-black text-brand-700">{site.progress}%</span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={site.progress} />
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>

        <DonutPanel title="NCR closure" center="74%" data={ncrBreakdown} />

        <PremiumCard className="p-5">
          <SectionTitle title="Today's site summary" subtitle="Inspection cadence and actions" />
          <div className="mt-5 grid gap-3">
            <SummaryRow label="Visits completed" value="7" />
            <SummaryRow label="Photos uploaded" value="126" />
            <SummaryRow label="Open actions" value="19" />
            <SummaryRow label="Next inspections" value="11" />
          </div>
          <div className="mt-5 rounded-2xl bg-blue-50 p-4">
            <p className="text-sm font-black text-navy-900">Critical watch</p>
            <p className="mt-1 text-xs font-bold leading-5 text-slate-600">City Center Mall structural NCR requires closeout evidence before next consultant inspection.</p>
          </div>
        </PremiumCard>
      </div>

      <Toolbar label="Supervision register" />
      <SupervisionTable />

      <div className="grid gap-4 xl:grid-cols-4">
        <ActivityCard title="Recent NCR" icon={ShieldAlert} items={["Concrete honeycomb near core wall", "MEP sleeve conflict at Level 6", "Waterproofing test failed"]} />
        <ActivityCard title="Recent Site Visits" icon={Building2} items={["Tower 26 podium inspection", "Marina View site progress walk", "Al Barsha Villas MEP route check"]} />
        <ActivityCard title="Upcoming Inspections" icon={CalendarDays} items={["DCD fire pump room", "Trakhees facade review", "DM drainage inspection"]} />
        <EngineerWorkload />
      </div>
    </>
  );
}

function QaqcOperations({ module }: { module: EnterpriseNavItem }) {
  const heatmap = [
    ["Low", 8, 12, 7, 4],
    ["Medium", 12, 16, 10, 8],
    ["High", 6, 9, 13, 5],
    ["Critical", 1, 2, 4, 1]
  ];

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr_0.9fr]">
        <PremiumCard className="p-5">
          <SectionTitle title="NCR heatmap" subtitle="Severity by discipline" />
          <div className="mt-5 space-y-2">
            {heatmap.map((row) => (
              <div key={row[0]} className="grid grid-cols-[5rem_repeat(4,minmax(0,1fr))] gap-2 text-xs font-black">
                <span className="self-center text-slate-500">{row[0]}</span>
                {row.slice(1).map((value, index) => (
                  <span
                    key={`${row[0]}-${index}`}
                    className={cn(
                      "grid h-11 place-items-center rounded-2xl",
                      Number(value) > 12 ? "bg-rose-100 text-rose-700" : Number(value) > 8 ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-brand-700"
                    )}
                  >
                    {value}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[10px] font-black uppercase tracking-wide text-slate-400">
            <span>Arch</span>
            <span>Struct</span>
            <span>MEP</span>
            <span>Site</span>
          </div>
        </PremiumCard>

        <ChartPanel title={`${module.title} trend`} subtitle="Quality logs by category">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={qualityTrend}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e7eefb" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {qualityTrend.map((_, index) => (
                  <Cell key={index} fill={pastel[index % pastel.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <PremiumCard className="p-5">
          <SectionTitle title="Corrective action flow" subtitle="Root cause to closeout" />
          <div className="mt-5 space-y-3">
            {["Root cause logged", "Corrective action assigned", "Evidence uploaded", "Consultant verified"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-blue-50 bg-slate-50/70 p-3">
                <span className={cn("grid h-9 w-9 place-items-center rounded-full text-xs font-black", index < 2 ? "bg-blue-100 text-brand-700" : "bg-slate-100 text-slate-500")}>
                  {index + 1}
                </span>
                <span className="text-sm font-black text-navy-900">{item}</span>
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>
      <Toolbar label="NCR and quality action register" />
      <SpecializedTable variant="qaqc" />
    </>
  );
}

function TaskOperations({ module }: { module: EnterpriseNavItem }) {
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr_0.8fr]">
        <PremiumCard className="p-5 xl:row-span-2">
          <SectionTitle title={`${module.title} kanban`} subtitle="Workflow board by action status" />
          <div className="premium-scroll mt-5 flex gap-3 overflow-x-auto pb-1">
            {taskColumns.map((column) => (
              <div key={column.title} className="min-w-64 rounded-[1.35rem] border border-blue-50 bg-slate-50/80 p-3">
                <div className="flex items-center justify-between">
                  <span className={cn("rounded-full px-3 py-1 text-xs font-black", column.tone)}>{column.title}</span>
                  <span className="text-xs font-black text-slate-400">{column.cards.length}</span>
                </div>
                <div className="mt-3 space-y-3">
                  {column.cards.map((card, index) => (
                    <div key={card} className="rounded-2xl border border-blue-50 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">
                      <p className="text-sm font-black text-navy-900">{card}</p>
                      <p className="mt-2 text-xs font-bold text-slate-500">{index % 2 ? "MEP Engineer" : "Project Manager"} / Due {index + 12} May</p>
                      <div className="mt-3">
                        <ProgressBar value={30 + index * 18} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
        <ChartPanel title="Team utilization" subtitle="Planned vs logged hours">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cashFlow}>
              <defs>
                <linearGradient id="taskFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1b78d0" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#1b78d0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e7eefb" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="collected" stroke="#1b78d0" fill="url(#taskFill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ActivityCard title="Overdue alerts" icon={AlertTriangle} items={["Nakheel response overdue", "BOQ check pending", "DCD drawings need revision"]} />
        <ActivityCard title="Engineer focus" icon={UsersRound} items={["Sana: 8 active site tasks", "Omar: 5 design reviews", "Bilal: 4 MEP coordination actions"]} />
        <QuickActionPanel />
      </div>
    </>
  );
}

function DocumentOperations({ module }: { module: EnterpriseNavItem }) {
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <PremiumCard className="p-5">
          <SectionTitle title={`${module.title} status flow`} subtitle="Draft to authority approval chain" />
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {["Draft", "Discipline Review", "AOR Check", "Client Submission", "Authority Approval"].map((step, index) => (
              <div key={step} className="relative rounded-[1.25rem] border border-blue-50 bg-slate-50/70 p-4 text-center">
                <span className={cn("mx-auto grid h-10 w-10 place-items-center rounded-full text-xs font-black", index < 3 ? "bg-blue-100 text-brand-700" : "bg-slate-100 text-slate-500")}>
                  {index + 1}
                </span>
                <p className="mt-3 text-xs font-black text-navy-900">{step}</p>
              </div>
            ))}
          </div>
        </PremiumCard>
        <PremiumCard className="p-5">
          <SectionTitle title="Upload timeline" subtitle="Latest controlled documents" />
          <div className="mt-5 space-y-3">
            {["Tower 26 Structural Drawings R2", "DCD Fire Alarm NOC Package", "BOQ Rev 02 Commercial Set", "Site Visit Report SV-044"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-blue-50 bg-white p-3 shadow-sm">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-brand-700">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-navy-900">{item}</p>
                  <p className="text-xs font-bold text-slate-500">{index + 1}d ago / Document Controller</p>
                </div>
                <StatusChip value={index === 1 ? "Submitted" : "Review"} />
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>
      <Toolbar label="Submission and revision matrix" />
      <DocumentMatrix />
    </>
  );
}

function AccountsOperations({ module }: { module: EnterpriseNavItem }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinancialCard title="Invoices Raised" value={formatCurrency(4280000)} helper="AED 980k due in 30 days" tone="blue" />
        <FinancialCard title="Payments Received" value={formatCurrency(2650000)} helper="62% collection this cycle" tone="green" />
        <FinancialCard title="Outstanding" value={formatCurrency(1630000)} helper="AED 410k over 60 days" tone="rose" />
        <FinancialCard title="Pending Quotations" value={formatCurrency(1420000)} helper="8 LPO follow-ups" tone="amber" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartPanel title={`${module.title} cash flow`} subtitle="Expected vs collected receivables">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlow}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e7eefb" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => `${value}k AED`} />
              <Line type="monotone" dataKey="expected" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="collected" stroke="#1b78d0" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
        <PremiumCard className="p-5">
          <SectionTitle title="Client aging exposure" subtitle="Collection priority ranking" />
          <div className="mt-5 space-y-4">
            {[
              ["City Retail Group", 68, "Overdue"],
              ["Harborline Developments", 42, "Follow-Up"],
              ["Shaikh Zayed Properties", 28, "Issued"],
              ["Nad Al Hamar Holdings", 12, "On Track"]
            ].map(([name, value, status]) => (
              <div key={name}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-navy-900">{name}</p>
                  <StatusChip value={status} />
                </div>
                <ProgressBar value={Number(value)} />
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>
      <Toolbar label="Invoice and collection register" />
      <SpecializedTable variant="accounts" />
    </>
  );
}

function HrOperations({ module }: { module: EnterpriseNavItem }) {
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr_0.9fr]">
        <PremiumCard className="p-5">
          <SectionTitle title={`${module.title} attendance heatmap`} subtitle="Office, site, tablet, app, WFH" />
          <div className="mt-5 grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-9 rounded-xl",
                  index % 11 === 0 ? "bg-rose-100" : index % 7 === 0 ? "bg-amber-100" : index % 3 === 0 ? "bg-blue-100" : "bg-emerald-100"
                )}
              />
            ))}
          </div>
        </PremiumCard>
        <PremiumCard className="p-5">
          <SectionTitle title="Employee cards" subtitle="Role, department, location, and workload" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {["Nadia Khan", "Sana Ibrahim", "Bilal Farooq", "Meera Joseph"].map((person, index) => (
              <div key={person} className="rounded-[1.25rem] border border-blue-50 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar name={person} />
                  <div>
                    <p className="text-sm font-black text-navy-900">{person}</p>
                    <p className="text-xs font-bold text-slate-500">{["Project Manager", "Site Engineer", "MEP Engineer", "Accountant"][index]}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressMetric label="Monthly utilization" value={[82, 76, 69, 88][index]} />
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
        <ActivityCard title="Leave and EOS actions" icon={Landmark} items={["2 leave requests pending HR", "1 airfare claim ready", "EOS estimate prepared for review"]} />
      </div>
      <Toolbar label="HR and admin register" />
      <SpecializedTable variant="hr" />
    </>
  );
}

function ClientOperations({ module }: { module: EnterpriseNavItem }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <PremiumCard className="p-5">
        <SectionTitle title={`${module.title} pipeline`} subtitle="Lead to LPO and project onboarding" />
        <div className="mt-5 space-y-3">
          {["Lead Qualified", "Proposal Drafted", "Quotation Sent", "LPO Pending", "Project Onboarded"].map((stage, index) => (
            <div key={stage} className="rounded-2xl border border-blue-50 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-navy-900">{stage}</p>
                <span className="text-xs font-black text-brand-700">{[9, 6, 5, 3, 2][index]}</span>
              </div>
            </div>
          ))}
        </div>
      </PremiumCard>
      <div className="space-y-4">
        <Toolbar label="Client and meeting action board" />
        <SpecializedTable variant="clients" />
      </div>
    </div>
  );
}

function AutomationOperations({ module }: { module: EnterpriseNavItem }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <PremiumCard className="p-5">
        <SectionTitle title={`${module.title} builder`} subtitle="Trigger, condition, action, and escalation" />
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            ["Trigger", "Quotation marked Sent"],
            ["Condition", "LPO not received in 5 days"],
            ["Action", "Notify Sales, MD, Accounts"],
            ["Escalation", "Create follow-up task"]
          ].map(([label, value], index) => (
            <div key={label} className="rounded-[1.25rem] border border-blue-50 bg-slate-50/70 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-brand-700">
                {index === 0 ? <Bell className="h-4 w-4" /> : index === 1 ? <SlidersHorizontal className="h-4 w-4" /> : index === 2 ? <Mail className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
              </span>
              <p className="mt-4 text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-black leading-5 text-navy-900">{value}</p>
            </div>
          ))}
        </div>
      </PremiumCard>
      <ActivityCard title="Automation timeline" icon={ActivityIcon} items={["Invoice overdue reminder sent", "Authority comment task created", "NCR due-date escalation triggered", "Leave approval notification delivered"]} />
      <Toolbar label="Automation and event logs" />
      <SpecializedTable variant="automation" />
    </div>
  );
}

function AlertsOperations({ module }: { module: EnterpriseNavItem }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
      <PremiumCard className="p-5">
        <SectionTitle title={`${module.title} severity bands`} subtitle="Operational items needing attention" />
        <div className="mt-5 space-y-3">
          <AlertBand label="Critical" value="6" tone="rose" />
          <AlertBand label="High" value="14" tone="amber" />
          <AlertBand label="Normal" value="31" tone="blue" />
          <AlertBand label="Resolved today" value="18" tone="green" />
        </div>
      </PremiumCard>
      <PremiumCard className="p-5">
        <SectionTitle title="Executive alert stream" subtitle="Authority, NCR, invoice, HR, and task events" />
        <ActivityTimeline />
      </PremiumCard>
    </div>
  );
}

function ReportsOperations({ module }: { module: EnterpriseNavItem }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]">
      <ReportCard title="Project Report" icon={FolderKanbanIcon} items={["Lifecycle progress", "Authority status", "Budget health", "Team responsibilities"]} />
      <ReportCard title="Supervision Report" icon={Building2} items={["Site visits", "NCR register", "Quality logs", "Inspection calendar"]} />
      <ReportCard title={`${module.title} exports`} icon={Download} items={["PDF packages", "Excel registers", "Client snapshots", "MD dashboards"]} />
      <ReportCard title="Accounts Report" icon={Banknote} items={["Invoice aging", "Collections", "Cash flow", "Quotation pipeline"]} />
      <ReportCard title="HR Report" icon={UsersRound} items={["Attendance", "Leave", "Payroll", "Assets"]} />
      <ReportCard title="Authority Report" icon={Landmark} items={["DCD", "Trakhees", "Nakheel", "DM/DDA"]} />
    </div>
  );
}

function SettingsOperations({ module }: { module: EnterpriseNavItem }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
      <PremiumCard className="p-5">
        <SectionTitle title={`${module.title} control panel`} subtitle="Company, permissions, authority, email, and audit settings" />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {["Company profile", "Departments", "Roles matrix", "Authority SLA", "Email templates", "System audit"].map((item, index) => (
            <div key={item} className="rounded-[1.25rem] border border-blue-50 bg-slate-50/70 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm">
                  {index % 2 ? <Settings className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
                </span>
                <div>
                  <p className="text-sm font-black text-navy-900">{item}</p>
                  <p className="text-xs font-bold text-slate-500">Configured for ANTCPL workflows</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PremiumCard>
      <ActivityCard title="System logs" icon={ActivityIcon} items={["RLS policy checked", "Quotation trigger updated", "New authority template published", "Payroll role reviewed"]} />
    </div>
  );
}

function StageTracker() {
  return (
    <div className="mt-6">
      <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-9">
        <div className="absolute left-4 right-4 top-5 hidden h-1 rounded-full bg-slate-100 lg:block" />
        <div className="absolute left-4 top-5 hidden h-1 w-[42%] rounded-full bg-gradient-to-r from-emerald-400 to-brand-500 lg:block" />
        {lifecycle.map((stage, index) => {
          const done = stage.status === "Completed";
          const active = stage.status === "In Progress";
          return (
            <div key={stage.name} className="relative rounded-[1.25rem] bg-white/80 p-3 lg:bg-transparent lg:p-0">
              <span
                className={cn(
                  "relative z-10 grid h-10 w-10 place-items-center rounded-full text-sm font-black shadow-sm ring-4 ring-white",
                  done ? "bg-emerald-100 text-emerald-700" : active ? "bg-blue-100 text-brand-700" : "bg-slate-100 text-slate-500"
                )}
              >
                {index + 1}
              </span>
              <p className="mt-3 text-xs font-black leading-4 text-navy-900">{stage.name}</p>
              <p className={cn("mt-1 text-[11px] font-bold", done ? "text-emerald-600" : active ? "text-brand-600" : "text-slate-400")}>{stage.status}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <ProgressBar value={42} />
      </div>
    </div>
  );
}

function SupervisionTable() {
  return (
    <PremiumCard className="overflow-hidden p-0">
      <div className="premium-scroll overflow-x-auto">
        <table className="w-full min-w-[1220px] border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50/95">
              {["Ref No", "Project/Site", "Client", "Consultant", "Assigned Site Engineer", "Progress %", "Last Site Visit", "NCR Open", "NCR Closed", "Quality Logs", "Next Inspection", "Status", "Actions"].map((head) => (
                <th key={head} className="border-b border-blue-50 px-4 py-4 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {siteRows.map((site) => (
              <tr key={site.ref} className="group transition hover:bg-blue-50/45">
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-black text-brand-700">{site.ref}</td>
                <td className="border-b border-blue-50 px-4 py-4">
                  <p className="text-sm font-black text-navy-900">{site.project}</p>
                  <p className="text-xs font-bold text-slate-500">Dubai, UAE</p>
                </td>
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-bold text-slate-600">{site.client}</td>
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-bold text-slate-600">{site.consultant}</td>
                <td className="border-b border-blue-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={site.engineer} online={site.progress > 60} />
                    <div>
                      <p className="text-sm font-black text-navy-900">{site.engineer}</p>
                      <p className="text-xs font-bold text-slate-500">{site.role}</p>
                    </div>
                  </div>
                </td>
                <td className="border-b border-blue-50 px-4 py-4">
                  <div className="w-32">
                    <ProgressBar value={site.progress} />
                    <p className="mt-1 text-xs font-black text-slate-500">{site.progress}%</p>
                  </div>
                </td>
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-bold text-slate-600">{site.lastVisit}</td>
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-black text-rose-600">{site.ncrOpen}</td>
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-black text-emerald-600">{site.ncrClosed}</td>
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-black text-brand-700">{site.quality}</td>
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-bold text-slate-600">{site.next}</td>
                <td className="border-b border-blue-50 px-4 py-4"><StatusChip value={site.status} /></td>
                <td className="border-b border-blue-50 px-4 py-4 text-right">
                  <button className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-brand-700">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationFooter total={siteRows.length} />
    </PremiumCard>
  );
}

function SpecializedTable({ variant }: { variant: "qaqc" | "accounts" | "hr" | "clients" | "automation" }) {
  const rows = {
    qaqc: [
      ["NCR-026", "Tower 26", "MEP sleeve conflict", "High", "Corrective Action", "Sana Ibrahim", "68%"],
      ["NCR-031", "City Center Mall", "Concrete finish defect", "Critical", "Open", "Mohammed Saad", "22%"],
      ["QL-018", "Marina View", "Material sample approved", "Medium", "Closed", "Bilal Farooq", "100%"]
    ],
    accounts: [
      ["INV-045", "Tower 26", "Shaikh Zayed", "AED 620,000", "Issued", "AED 250,000", "40%"],
      ["INV-052", "City Center Mall", "City Retail", "AED 410,000", "Overdue", "AED 0", "0%"],
      ["QTN-088", "Marina View", "Harborline", "AED 320,000", "LPO Pending", "AED 0", "65%"]
    ],
    hr: [
      ["EMP-001", "Nadia Khan", "Projects", "Project Manager", "Present", "Dubai Office", "82%"],
      ["EMP-007", "Sana Ibrahim", "Supervision", "Site Engineer", "Site", "Tower 26", "76%"],
      ["EMP-009", "Meera Joseph", "Accounts", "Accountant", "Present", "Dubai Office", "88%"]
    ],
    clients: [
      ["CL-021", "Shaikh Zayed Properties", "Tower 26", "Active", "Authority follow-up", "Nadia Khan", "82%"],
      ["CL-034", "Harborline Developments", "Marina View", "Proposal", "LPO follow-up", "Karim Haddad", "55%"],
      ["CL-011", "City Retail Group", "Mall Expansion", "Collection", "Invoice follow-up", "Meera Joseph", "42%"]
    ],
    automation: [
      ["TRG-001", "Quotation Sent", "Sales + MD Reminder", "Active", "Every 3 days", "Karim Haddad", "98%"],
      ["TRG-006", "Invoice Overdue", "Accounts Follow-up", "Active", "Daily", "Meera Joseph", "91%"],
      ["TRG-011", "NCR Due Soon", "Engineer Escalation", "Paused", "48 hours before due", "Sana Ibrahim", "34%"]
    ]
  }[variant];

  return (
    <PremiumCard className="overflow-hidden p-0">
      <div className="premium-scroll overflow-x-auto">
        <table className="w-full min-w-[920px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/95">
              {["Reference", "Primary", "Context", "Status", "Current Action", "Owner", "Progress", "Actions"].map((head) => (
                <th key={head} className="border-b border-blue-50 px-4 py-4 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="transition hover:bg-blue-50/45">
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-black text-brand-700">{row[0]}</td>
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-black text-navy-900">{row[1]}</td>
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-bold text-slate-600">{row[2]}</td>
                <td className="border-b border-blue-50 px-4 py-4"><StatusChip value={row[3]} /></td>
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-bold text-slate-600">{row[4]}</td>
                <td className="border-b border-blue-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={row[5]} />
                    <span className="text-sm font-black text-navy-900">{row[5]}</span>
                  </div>
                </td>
                <td className="border-b border-blue-50 px-4 py-4">
                  <div className="w-28">
                    <ProgressBar value={Number(String(row[6]).replace("%", ""))} />
                    <p className="mt-1 text-xs font-black text-slate-500">{row[6]}</p>
                  </div>
                </td>
                <td className="border-b border-blue-50 px-4 py-4 text-right">
                  <button className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-brand-700">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationFooter total={rows.length} />
    </PremiumCard>
  );
}

function DocumentMatrix() {
  return (
    <PremiumCard className="overflow-hidden p-0">
      <div className="premium-scroll overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/95">
              {["Discipline", "R0", "R1", "R2", "Authority", "Upload", "Actions"].map((head) => (
                <th key={head} className="border-b border-blue-50 px-4 py-4 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {documentMatrix.map((row) => (
              <tr key={row.discipline} className="transition hover:bg-blue-50/45">
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-black text-navy-900">{row.discipline}</td>
                <td className="border-b border-blue-50 px-4 py-4"><StatusChip value={row.r0} /></td>
                <td className="border-b border-blue-50 px-4 py-4"><StatusChip value={row.r1} /></td>
                <td className="border-b border-blue-50 px-4 py-4"><StatusChip value={row.r2} /></td>
                <td className="border-b border-blue-50 px-4 py-4 text-sm font-bold text-slate-600">{row.authority}</td>
                <td className="border-b border-blue-50 px-4 py-4">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-brand-700">
                    <UploadCloud className="h-3.5 w-3.5" />
                    Upload Rev
                  </button>
                </td>
                <td className="border-b border-blue-50 px-4 py-4 text-right">
                  <button className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-brand-700">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationFooter total={documentMatrix.length} />
    </PremiumCard>
  );
}

function Toolbar({ label }: { label: string }) {
  return (
    <PremiumCard className="p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-brand-700">
            <Filter className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-black text-navy-900">{label}</p>
            <p className="text-xs font-bold text-slate-500">Search, sort, filter, export, and review actions</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex min-w-0 items-center gap-2 rounded-2xl border border-blue-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-500">
            <Search className="h-4 w-4" />
            <input className="min-w-0 bg-transparent font-semibold text-navy-900 outline-none placeholder:text-slate-400" placeholder="Search register" />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-2 text-sm font-black text-navy-700 shadow-sm">
            <SlidersHorizontal className="h-4 w-4 text-brand-600" />
            Filters
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-2 text-sm font-black text-navy-700 shadow-sm">
            <ChevronDown className="h-4 w-4 text-brand-600" />
            Sort
          </button>
        </div>
      </div>
    </PremiumCard>
  );
}

function MetricCard({ title, value, helper, icon: Icon, tone, progress }: { title: string; value: string; helper: string; icon: LucideIcon; tone: "blue" | "green" | "amber" | "rose" | "purple"; progress?: number }) {
  const tones = {
    blue: "from-blue-50 to-white text-brand-700",
    green: "from-emerald-50 to-white text-emerald-700",
    amber: "from-amber-50 to-white text-amber-700",
    rose: "from-rose-50 to-white text-rose-700",
    purple: "from-violet-50 to-white text-violet-700"
  };

  return (
    <div className="rounded-[1.45rem] border border-blue-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-black text-navy-900">{value}</p>
        </div>
        <span className={cn("grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-xs font-bold text-slate-500">{helper}</p>
      {typeof progress === "number" ? (
        <div className="mt-3">
          <ProgressBar value={progress} />
        </div>
      ) : null}
    </div>
  );
}

function FinancialCard({ title, value, helper, tone }: { title: string; value: string; helper: string; tone: "blue" | "green" | "amber" | "rose" }) {
  return (
    <PremiumCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-black text-navy-900">{value}</p>
          <p className="mt-2 text-xs font-bold text-slate-500">{helper}</p>
        </div>
        <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : tone === "rose" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-brand-700")}>
          <Banknote className="h-5 w-5" />
        </span>
      </div>
    </PremiumCard>
  );
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <PremiumCard className="p-5">
      <SectionTitle title={title} subtitle={subtitle} />
      <div className="mt-4">{children}</div>
    </PremiumCard>
  );
}

function DonutPanel({ title, center, data }: { title: string; center: string; data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <PremiumCard className="p-5">
      <SectionTitle title={title} subtitle="Status mix and closure pressure" />
      <div className="relative mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={72} outerRadius={102} paddingAngle={4} dataKey="value">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-3xl font-black text-navy-900">{center}</p>
            <p className="text-xs font-bold text-slate-500">closure</p>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}

function QuickActionPanel() {
  const actions: Array<[LucideIcon, string]> = [
    [Plus, "Add Site Visit"],
    [ShieldAlert, "Raise NCR"],
    [UploadCloud, "Upload Document"],
    [ClipboardCheck, "Create Inspection"],
    [ReceiptIcon, "Create Invoice"],
    [ClipboardList, "Add Task"]
  ];

  return (
    <PremiumCard className="p-5">
      <SectionTitle title="Quick actions" subtitle="Operational shortcuts" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map(([Icon, label]) => (
          <button key={String(label)} className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white p-4 text-center text-xs font-black text-navy-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-brand-700">
            <Icon className="h-5 w-5 text-brand-600" />
            {label}
          </button>
        ))}
      </div>
    </PremiumCard>
  );
}

function TimelinePanel() {
  return (
    <PremiumCard className="p-5">
      <SectionTitle title="Upcoming milestones" subtitle="Design, authority, tender, and construction" />
      <div className="mt-5 space-y-4">
        {["Design Development Complete", "Authority Submission", "Tender Issue", "Construction Start"].map((item, index) => (
          <div key={item} className="flex gap-3">
            <span className="mt-1 h-3 w-3 rounded-full bg-brand-500 shadow-[0_0_0_5px_rgba(27,120,208,0.12)]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-navy-900">{item}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">{31 - index * 6} May 2026 / Owner assigned</p>
            </div>
            <StatusChip value={index < 2 ? "In Progress" : "Pending"} />
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}

function ActivityCard({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  return (
    <PremiumCard className="p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-brand-700">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-base font-black text-navy-900">{title}</h3>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={item} className="rounded-2xl border border-blue-50 bg-slate-50/70 p-3">
            <p className="text-sm font-black text-navy-900">{item}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{index + 1}h ago / ANTCPL workflow</p>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}

function EngineerWorkload() {
  return (
    <PremiumCard className="p-5">
      <SectionTitle title="Engineer workload" subtitle="Assignments and pressure" />
      <div className="mt-5 space-y-4">
        {siteRows.slice(0, 3).map((site) => (
          <div key={site.engineer}>
            <div className="mb-2 flex items-center gap-3">
              <Avatar name={site.engineer} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-navy-900">{site.engineer}</p>
                <p className="truncate text-xs font-bold text-slate-500">{site.role}</p>
              </div>
              <span className="text-xs font-black text-brand-700">{site.progress}%</span>
            </div>
            <ProgressBar value={site.progress} />
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}

function ActivityTimeline() {
  return (
    <div className="mt-5 space-y-4">
      {activity.map((item) => (
        <div key={item.title} className="flex gap-3">
          <span className={cn("mt-1 h-3 w-3 rounded-full shadow-[0_0_0_5px_rgba(27,120,208,0.10)]", item.tone === "green" ? "bg-emerald-500" : item.tone === "rose" ? "bg-rose-500" : item.tone === "amber" ? "bg-amber-500" : "bg-brand-500")} />
          <div className="min-w-0 flex-1 rounded-2xl border border-blue-50 bg-slate-50/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-navy-900">{item.title}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{item.meta}</p>
              </div>
              <span className="text-[11px] font-black text-slate-400">{item.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportCard({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  return (
    <PremiumCard className="p-5" hover>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-brand-700">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-lg font-black text-navy-900">{title}</h3>
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-300" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
            {item}
          </span>
        ))}
      </div>
    </PremiumCard>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-lg font-black text-navy-900">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-50 bg-slate-50/70 p-3">
      <Icon className="h-4 w-4 text-brand-600" />
      <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-navy-900">{value}</p>
    </div>
  );
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-black text-navy-900">{label}</p>
        <p className="text-xs font-black text-brand-700">{value}%</p>
      </div>
      <ProgressBar value={value} />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-blue-50 bg-slate-50/70 px-4 py-3">
      <span className="text-sm font-black text-navy-900">{label}</span>
      <span className="text-sm font-black text-brand-700">{value}</span>
    </div>
  );
}

function AlertBand({ label, value, tone }: { label: string; value: string; tone: "rose" | "amber" | "blue" | "green" }) {
  return (
    <div className={cn("rounded-[1.25rem] p-4", tone === "rose" ? "bg-rose-50 text-rose-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-brand-700")}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-black">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}

function Avatar({ name, online = true }: { name: string; online?: boolean }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-xs font-black text-brand-700">
      {initials}
      <span className={cn("absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full ring-2 ring-white", online ? "bg-emerald-500" : "bg-slate-300")} />
    </span>
  );
}

function PaginationFooter({ total }: { total: number }) {
  return (
    <div className="flex items-center justify-between border-t border-blue-50 bg-white px-4 py-3 text-xs font-bold text-slate-500">
      <span>Showing 1-{total} of {total} records</span>
      <div className="flex items-center gap-2">
        <button className="rounded-xl border border-blue-100 px-3 py-1.5 text-slate-400">Prev</button>
        <button className="rounded-xl bg-blue-50 px-3 py-1.5 text-brand-700">1</button>
        <button className="rounded-xl border border-blue-100 px-3 py-1.5 text-slate-600">Next</button>
      </div>
    </div>
  );
}

const ActivityIcon = BarChart3;
const FolderKanbanIcon = FileArchive;
const ReceiptIcon = FileText;
