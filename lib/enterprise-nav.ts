import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Archive,
  BadgeDollarSign,
  Banknote,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  CreditCard,
  FileArchive,
  FileCheck2,
  FileText,
  FolderKanban,
  Landmark,
  Mail,
  Megaphone,
  ReceiptText,
  Settings,
  ShieldAlert,
  UsersRound
} from "lucide-react";

export type EnterpriseModuleType =
  | "dashboard"
  | "alerts"
  | "reports"
  | "projects"
  | "supervision"
  | "qaqc"
  | "tasks"
  | "documents"
  | "accounts"
  | "hr"
  | "clients"
  | "automation"
  | "settings";

export type EnterpriseNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  type: EnterpriseModuleType;
  description: string;
};

export type EnterpriseNavGroup = {
  label: string;
  items: EnterpriseNavItem[];
};

export const enterpriseNavGroups: EnterpriseNavGroup[] = [
  {
    label: "MAIN",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Activity, type: "dashboard", description: "Executive command center across projects, sites, finance, HR, and alerts." },
      { title: "Alerts", href: "/alerts", icon: Bell, type: "alerts", description: "Priority alerts for authority comments, overdue tasks, NCR closeout, and invoice risk." },
      { title: "Reports", href: "/reports", icon: ClipboardCheck, type: "reports", description: "Operational report center for projects, supervision, QA/QC, finance, HR, and submissions." }
    ]
  },
  {
    label: "PROJECTS",
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanban, type: "projects", description: "Project portfolio lifecycle view with authority, budget, stage, and milestone signals." },
      { title: "Project Stages", href: "/project-stages", icon: CheckCircle2, type: "projects", description: "Design lifecycle tracker from pre-planning through handover and closeout." },
      { title: "Milestones", href: "/milestones", icon: AlertTriangle, type: "projects", description: "Contract, design, authority, tender, and construction milestone control." },
      { title: "Authority Approvals", href: "/authority-approvals", icon: Landmark, type: "projects", description: "DCD, Trakhees, Nakheel, DM, DDA, NOC, and authority comment follow-up." },
      { title: "Design Review", href: "/design-review", icon: FileCheck2, type: "projects", description: "AOR and discipline review board for drawings, BOQs, and compliance comments." },
      { title: "BIM Coordination", href: "/bim-coordination", icon: Building2, type: "projects", description: "BIM clash, model coordination, MEP interface, and design issue tracking." }
    ]
  },
  {
    label: "SUPERVISION",
    items: [
      { title: "Supervision Dashboard", href: "/supervision-dashboard", icon: Building2, type: "supervision", description: "Site supervision control with engineer assignments, NCR counts, inspections, and daily logs." },
      { title: "Site Visits", href: "/site-visits", icon: CalendarCheck, type: "supervision", description: "Site visit reports, observations, photos, actions, and next inspection planning." },
      { title: "Daily Logs", href: "/daily-logs", icon: ClipboardList, type: "supervision", description: "Daily site supervision logbook for manpower, progress, weather, and critical issues." },
      { title: "Inspections", href: "/inspections", icon: CheckCircle2, type: "supervision", description: "Inspection planning, assignment, result tracking, and open action closure." },
      { title: "Site Instructions", href: "/site-instructions", icon: FileText, type: "supervision", description: "Formal site instructions, response status, and contractor action tracking." },
      { title: "Material Approval", href: "/material-approval", icon: Archive, type: "supervision", description: "Material submittals, sample approvals, comments, and resubmission cycle." },
      { title: "MIR/WIR", href: "/mir-wir", icon: ClipboardCheck, type: "supervision", description: "Material inspection requests and work inspection requests with approval flow." },
      { title: "Snagging", href: "/snagging", icon: ShieldAlert, type: "supervision", description: "Snag list, closeout status, assigned engineers, evidence, and handover readiness." },
      { title: "Site Photos", href: "/site-photos", icon: FileArchive, type: "supervision", description: "Site photo register organized by project, date, location, and inspection package." }
    ]
  },
  {
    label: "QA/QC",
    items: [
      { title: "NCR Register", href: "/ncr-register", icon: ShieldAlert, type: "qaqc", description: "Non-conformance register with severity, root cause, corrective action, and closure progress." },
      { title: "Quality Logs", href: "/quality-logs", icon: ClipboardCheck, type: "qaqc", description: "Inspection, material, workmanship, testing, safety, and authority quality events." },
      { title: "Checklist Library", href: "/checklist-library", icon: ClipboardList, type: "qaqc", description: "Inspection checklist library by discipline, stage, project type, and authority requirement." },
      { title: "Method Statements", href: "/method-statements", icon: FileText, type: "qaqc", description: "Method statement submissions, review comments, approval status, and revisions." },
      { title: "ITP Tracker", href: "/itp-tracker", icon: CheckCircle2, type: "qaqc", description: "Inspection and test plan tracker with hold points, witnesses, and approvals." },
      { title: "Root Cause Analysis", href: "/root-cause-analysis", icon: AlertTriangle, type: "qaqc", description: "Root cause patterns, recurring issues, impact, and discipline ownership." },
      { title: "Corrective Actions", href: "/corrective-actions", icon: CheckCircle2, type: "qaqc", description: "Corrective action ownership, evidence, due dates, and closeout verification." },
      { title: "Preventive Actions", href: "/preventive-actions", icon: ShieldAlert, type: "qaqc", description: "Preventive action planning based on recurring site and design quality patterns." }
    ]
  },
  {
    label: "TASK MANAGEMENT",
    items: [
      { title: "All Tasks", href: "/all-tasks", icon: ClipboardList, type: "tasks", description: "Kanban, workload, overdue, and productivity control across engineering teams." },
      { title: "Routine Tasks", href: "/routine-tasks", icon: Clock3, type: "tasks", description: "Recurring AOR, document control, supervision, and coordination routines." },
      { title: "Updated Tasks", href: "/updated-tasks", icon: Activity, type: "tasks", description: "Recently changed actions, status movements, comment updates, and revised due dates." },
      { title: "Site Tasks", href: "/site-tasks", icon: Building2, type: "tasks", description: "Site supervision tasks tied to inspections, NCR, site visits, and contractor actions." },
      { title: "Engineer Tasks", href: "/engineer-tasks", icon: UsersRound, type: "tasks", description: "Engineer workload, discipline ownership, utilization, and blocked actions." },
      { title: "Time Tracking", href: "/time-tracking", icon: Clock3, type: "tasks", description: "Hours logged by project, task, discipline, billing bucket, and productivity trend." }
    ]
  },
  {
    label: "DOCUMENT CONTROL",
    items: [
      { title: "Documents", href: "/documents", icon: FileArchive, type: "documents", description: "Document library for drawings, NOCs, BOQs, tenders, invoices, and supervision reports." },
      { title: "Drawing Register", href: "/drawing-register", icon: FileText, type: "documents", description: "Architectural, structural, MEP, and authority drawing register with revision control." },
      { title: "Revision Tracker", href: "/revision-tracker", icon: Activity, type: "documents", description: "Revision comparison, comment response, approval chain, and resubmission tracker." },
      { title: "Submission Logs", href: "/submission-logs", icon: FileCheck2, type: "documents", description: "Client, authority, tender, and contractor submission log with response due dates." },
      { title: "Authority Documents", href: "/authority-documents", icon: Landmark, type: "documents", description: "Authority submission package matrix for DCD, Trakhees, Nakheel, DM, and DDA." },
      { title: "Templates & Forms", href: "/templates-forms", icon: FileText, type: "documents", description: "Company templates, forms, standard registers, and discipline formats." }
    ]
  },
  {
    label: "ACCOUNTS",
    items: [
      { title: "Accounts Dashboard", href: "/accounts-dashboard", icon: BadgeDollarSign, type: "accounts", description: "Financial command center for invoices, collections, aging, supervision billing, and cash flow." },
      { title: "Quotations", href: "/quotations", icon: FileCheck2, type: "accounts", description: "Quotation pipeline, LPO follow-up, VAT, scope, and sales action tracking." },
      { title: "Progress Invoices", href: "/progress-invoices", icon: ReceiptText, type: "accounts", description: "Progress invoice health, linked milestones, issued amounts, and client balances." },
      { title: "Monthly Supervision Invoices", href: "/monthly-supervision-invoices", icon: ReceiptText, type: "accounts", description: "Monthly supervision billing tied to active sites, site visits, and staff allocation." },
      { title: "Payments", href: "/payments", icon: CreditCard, type: "accounts", description: "Payment milestones, received values, balance, and collection status." },
      { title: "Client Aging", href: "/client-aging", icon: Landmark, type: "accounts", description: "Client aging, overdue exposure, follow-up priority, and collection risk." },
      { title: "Cash Flow", href: "/cash-flow", icon: Banknote, type: "accounts", description: "Expected receivables, actual collections, supervision billing, and expense movement." },
      { title: "Expenses", href: "/expenses", icon: Banknote, type: "accounts", description: "Site, transport, project, IT, and receipt-based approval workflow." }
    ]
  },
  {
    label: "HR & ADMIN",
    items: [
      { title: "Employees", href: "/hr", icon: UsersRound, type: "hr", description: "Employee directory, roles, department assignments, files, and workflow access." },
      { title: "Attendance", href: "/attendance", icon: CalendarCheck, type: "hr", description: "Office, site, tablet, app, WFH, late check-in, and monthly attendance reporting." },
      { title: "Leave & EOS", href: "/leave-eos", icon: Landmark, type: "hr", description: "Leave balance, approval workflow, EOS calculator, deductions, and airfare tracking." },
      { title: "Payroll", href: "/payroll", icon: BadgeDollarSign, type: "hr", description: "Payroll approvals, salary structure, allowances, deductions, bonus, and net salary." },
      { title: "Assets", href: "/assets", icon: Archive, type: "hr", description: "Employee asset assignment, serial numbers, status, and custody tracking." },
      { title: "Circulars", href: "/circulars", icon: Megaphone, type: "hr", description: "HR, IT, security, attendance, and general circulars with acknowledgement." },
      { title: "Forms & Formats", href: "/forms-formats", icon: FileText, type: "hr", description: "HR, leave, expense, onboarding, offboarding, and admin form library." },
      { title: "Performance Reviews", href: "/performance-reviews", icon: ClipboardCheck, type: "hr", description: "Employee performance, goal status, review cycle, and training actions." }
    ]
  },
  {
    label: "CLIENT MANAGEMENT",
    items: [
      { title: "Clients", href: "/clients", icon: BriefcaseBusiness, type: "clients", description: "Client portfolio, active projects, submissions, invoices, and meeting cadence." },
      { title: "CRM", href: "/crm", icon: UsersRound, type: "clients", description: "Sales pipeline, leads, client relationships, and proposal opportunities." },
      { title: "Follow-Ups", href: "/follow-ups", icon: Clock3, type: "clients", description: "Commercial, authority, LPO, collection, and client action follow-up board." },
      { title: "Leads", href: "/leads", icon: Activity, type: "clients", description: "Lead intake, qualification, proposal estimate, and conversion tracking." },
      { title: "Meeting Logs", href: "/meeting-logs", icon: FileText, type: "clients", description: "Client meeting minutes, actions, decisions, attendees, and next follow-up." }
    ]
  },
  {
    label: "AUTOMATION",
    items: [
      { title: "Email Triggers", href: "/email-triggers", icon: Mail, type: "automation", description: "Quotation, invoice, authority, NCR, leave, and site visit email automation." },
      { title: "Notification Center", href: "/notification-center", icon: Bell, type: "automation", description: "Task, document, invoice, quotation, leave, site visit, and authority notifications." },
      { title: "Event Logs", href: "/event-logs", icon: Activity, type: "automation", description: "System event log for automation, auth, approvals, and workflow transitions." },
      { title: "Workflow Engine", href: "/workflow-engine", icon: ClipboardList, type: "automation", description: "Workflow builder for approvals, escalations, reminders, and stage gates." }
    ]
  },
  {
    label: "SETTINGS",
    items: [
      { title: "Company Settings", href: "/company-settings", icon: Settings, type: "settings", description: "Company profile, branding, location, departments, and operational defaults." },
      { title: "Roles & Permissions", href: "/roles-permissions", icon: UsersRound, type: "settings", description: "Role matrix, module permissions, client viewer access, and approval authority." },
      { title: "Authorities", href: "/authorities", icon: Landmark, type: "settings", description: "Authority list, submission categories, NOC stages, SLA, and response templates." },
      { title: "Email Templates", href: "/email-templates", icon: Mail, type: "settings", description: "Email templates for quotations, invoices, authority comments, NCR, and HR workflows." },
      { title: "System Logs", href: "/system-logs", icon: Activity, type: "settings", description: "Audit trail, system events, failed triggers, RLS access checks, and admin changes." }
    ]
  }
];

export const enterpriseModules = enterpriseNavGroups.flatMap((group) => group.items);

export function getEnterpriseModule(slug: string) {
  const href = `/${slug}`;
  return enterpriseModules.find((item) => item.href === href);
}
