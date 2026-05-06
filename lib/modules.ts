import {
  Archive,
  BadgeDollarSign,
  Banknote,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  CreditCard,
  FileArchive,
  FileCheck2,
  FileText,
  FolderKanban,
  Landmark,
  LayoutDashboard,
  Megaphone,
  ReceiptText,
  Settings,
  ShieldAlert,
  UsersRound
} from "lucide-react";
import {
  ADMIN_ROLES,
  AUTHORITIES,
  DOCUMENT_CATEGORIES,
  ENGINEERING_ROLES,
  FINANCE_ROLES,
  HR_ROLES,
  PROJECT_STAGES,
  USER_ROLES
} from "@/lib/constants";
import type { ModuleConfig, ModuleKey, UserRole } from "@/lib/types";

const ALL_ROLES = USER_ROLES;
const PROJECT_ROLES: UserRole[] = [...ENGINEERING_ROLES, "Client Viewer"];
const SALES_ROLES: UserRole[] = ["Managing Director", "Admin", "Sales / Quotation Manager"];

export const sidebarItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permissions: ALL_ROLES },
  { title: "Projects", href: "/projects", icon: FolderKanban, permissions: PROJECT_ROLES },
  { title: "Tasks", href: "/tasks", icon: ClipboardList, permissions: PROJECT_ROLES },
  { title: "Time Tracking", href: "/time-tracking", icon: Clock3, permissions: PROJECT_ROLES },
  { title: "Attendance", href: "/attendance", icon: CalendarCheck, permissions: ALL_ROLES },
  { title: "Site Visits", href: "/site-visits", icon: Building2, permissions: PROJECT_ROLES },
  { title: "Quality / NCR", href: "/quality-ncr", icon: ShieldAlert, permissions: PROJECT_ROLES },
  { title: "Documents", href: "/documents", icon: FileArchive, permissions: ALL_ROLES },
  { title: "Quotations", href: "/quotations", icon: FileCheck2, permissions: [...SALES_ROLES, "Accountant"] },
  { title: "Invoices", href: "/invoices", icon: ReceiptText, permissions: [...FINANCE_ROLES, "Project Manager"] },
  { title: "Payments", href: "/payments", icon: CreditCard, permissions: [...FINANCE_ROLES, "Project Manager"] },
  { title: "HR", href: "/hr", icon: UsersRound, permissions: [...HR_ROLES, "Employee"] },
  { title: "Leave & EOS", href: "/leave-eos", icon: Landmark, permissions: ALL_ROLES },
  { title: "Payroll", href: "/payroll", icon: BadgeDollarSign, permissions: [...HR_ROLES, "Accountant", "Employee"] },
  { title: "Expenses", href: "/expenses", icon: Banknote, permissions: ALL_ROLES },
  { title: "Assets", href: "/assets", icon: Archive, permissions: [...HR_ROLES, "Employee"] },
  { title: "Forms & Formats", href: "/forms-formats", icon: FileText, permissions: ALL_ROLES },
  { title: "Circulars", href: "/circulars", icon: Megaphone, permissions: ALL_ROLES },
  { title: "Reports", href: "/reports", icon: ClipboardCheck, permissions: [...ADMIN_ROLES, "Project Manager", "Accountant", "HR", "Sales / Quotation Manager"] },
  { title: "Settings", href: "/settings", icon: Settings, permissions: ADMIN_ROLES }
] as const;

export const moduleConfigs: Record<ModuleKey, ModuleConfig> = {
  projects: {
    key: "projects",
    title: "Projects",
    singular: "Project",
    description: "Manage consultancy projects, client records, authority scope, budget, team, and delivery progress.",
    table: "projects",
    href: "/projects",
    icon: FolderKanban,
    permissions: PROJECT_ROLES,
    statusField: "status",
    searchFields: ["project_code", "project_name", "client_name", "location", "authority"],
    rowHref: (row) => `/projects/${row.id}`,
    columns: [
      { key: "project_code", label: "Code" },
      { key: "project_name", label: "Project" },
      { key: "client_name", label: "Client" },
      { key: "location", label: "Location" },
      { key: "authority", label: "Authority" },
      { key: "status", label: "Status", type: "status" },
      { key: "overall_progress", label: "Progress", type: "percent" },
      { key: "budget", label: "Budget", type: "currency" }
    ],
    formFields: [
      { name: "project_code", label: "Project code", type: "text", required: true },
      { name: "project_name", label: "Project name", type: "text", required: true },
      { name: "client_name", label: "Client", type: "text", required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "authority", label: "Authority", type: "select", options: AUTHORITIES },
      { name: "plot_no", label: "Plot number", type: "text" },
      { name: "project_type", label: "Project type", type: "text" },
      { name: "project_manager_id", label: "Project manager", type: "user" },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "budget", label: "Budget", type: "number" },
      { name: "status", label: "Status", type: "select", options: ["Lead", "Active", "On Hold", "Delayed", "Completed", "Closed", "Cancelled"] },
      { name: "overall_progress", label: "Overall progress", type: "number" },
      { name: "cover_image_url", label: "Project image URL", type: "text" },
      { name: "description", label: "Description", type: "textarea", rows: 4 }
    ],
    defaultValues: { status: "Active", overall_progress: 0, budget: 0 }
  },
  tasks: {
    key: "tasks",
    title: "Tasks",
    singular: "Task",
    description: "Track design, authority, tender, supervision, and closeout actions in Kanban or table view.",
    table: "tasks",
    href: "/tasks",
    icon: ClipboardList,
    permissions: PROJECT_ROLES,
    statusField: "status",
    projectScoped: true,
    searchFields: ["task_name", "description", "priority", "status"],
    columns: [
      { key: "task_name", label: "Task" },
      { key: "project_id", label: "Project", type: "project" },
      { key: "assigned_to", label: "Assigned", type: "user" },
      { key: "priority", label: "Priority", type: "status" },
      { key: "status", label: "Status", type: "status" },
      { key: "due_date", label: "Due", type: "date" },
      { key: "progress", label: "Progress", type: "percent" }
    ],
    formFields: [
      { name: "project_id", label: "Project", type: "project", required: true },
      { name: "stage_id", label: "Stage", type: "stage" },
      { name: "task_name", label: "Task name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", rows: 4 },
      { name: "assigned_to", label: "Assigned to", type: "user" },
      { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { name: "status", label: "Status", type: "select", options: ["Not Started", "In Progress", "Review", "Completed", "Pending", "Delayed"] },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "due_date", label: "Due date", type: "date" },
      { name: "progress", label: "Progress", type: "number" },
      { name: "attachments", label: "Attachments", type: "file", multiple: true }
    ],
    defaultValues: { status: "Not Started", priority: "Medium", progress: 0 }
  },
  "time-tracking": {
    key: "time-tracking",
    title: "Time Tracking",
    singular: "Time Log",
    description: "Log hours against projects and tasks for delivery, billing, and productivity reporting.",
    table: "time_logs",
    href: "/time-tracking",
    icon: Clock3,
    permissions: PROJECT_ROLES,
    projectScoped: true,
    searchFields: ["remarks"],
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "user_id", label: "Employee", type: "user" },
      { key: "project_id", label: "Project", type: "project" },
      { key: "hours", label: "Hours" },
      { key: "remarks", label: "Remarks" }
    ],
    formFields: [
      { name: "user_id", label: "Employee", type: "user", required: true },
      { name: "project_id", label: "Project", type: "project", required: true },
      { name: "task_id", label: "Task", type: "task" },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "hours", label: "Hours", type: "number", required: true },
      { name: "remarks", label: "Remarks", type: "textarea", rows: 3 }
    ]
  },
  attendance: {
    key: "attendance",
    title: "Attendance",
    singular: "Attendance Record",
    description: "Office, site, app, tablet, late check-in, and work-from-home attendance records.",
    table: "attendance",
    href: "/attendance",
    icon: CalendarCheck,
    permissions: ALL_ROLES,
    statusField: "status",
    searchFields: ["work_location", "status", "remarks"],
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "user_id", label: "Employee", type: "user" },
      { key: "work_location", label: "Location", type: "status" },
      { key: "status", label: "Status", type: "status" },
      { key: "check_in", label: "Check in", type: "datetime" },
      { key: "check_out", label: "Check out", type: "datetime" }
    ],
    formFields: [
      { name: "user_id", label: "Employee", type: "user", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "check_in", label: "Check in", type: "datetime-local" },
      { name: "check_out", label: "Check out", type: "datetime-local" },
      { name: "work_location", label: "Work location", type: "select", options: ["Office", "Site", "Work From Home"] },
      { name: "status", label: "Status", type: "select", options: ["Present", "Absent", "Late", "Half Day", "Leave"] },
      { name: "remarks", label: "Remarks", type: "textarea", rows: 3 }
    ],
    defaultValues: { work_location: "Office", status: "Present" }
  },
  "site-visits": {
    key: "site-visits",
    title: "Site Visits",
    singular: "Site Visit",
    description: "Schedule and export site supervision reports with observations, photos, actions, and next visits.",
    table: "site_visits",
    href: "/site-visits",
    icon: Building2,
    permissions: PROJECT_ROLES,
    statusField: "status",
    projectScoped: true,
    searchFields: ["location", "observations", "action_required", "status"],
    columns: [
      { key: "visit_date", label: "Visit date", type: "date" },
      { key: "project_id", label: "Project", type: "project" },
      { key: "site_engineer_id", label: "Site engineer", type: "user" },
      { key: "status", label: "Status", type: "status" },
      { key: "next_visit_date", label: "Next visit", type: "date" }
    ],
    formFields: [
      { name: "project_id", label: "Project", type: "project", required: true },
      { name: "visit_date", label: "Visit date", type: "date", required: true },
      { name: "site_engineer_id", label: "Site engineer", type: "user" },
      { name: "location", label: "Location", type: "text" },
      { name: "observations", label: "Observations", type: "textarea", rows: 4 },
      { name: "action_required", label: "Action required", type: "textarea", rows: 3 },
      { name: "assigned_to", label: "Assigned person", type: "user" },
      { name: "photos", label: "Photos", type: "file", multiple: true },
      { name: "status", label: "Status", type: "select", options: ["Scheduled", "Completed", "Action Pending", "Closed"] },
      { name: "next_visit_date", label: "Next visit date", type: "date" }
    ],
    defaultValues: { status: "Scheduled" }
  },
  "quality-ncr": {
    key: "quality-ncr",
    title: "Quality / NCR",
    singular: "NCR",
    description: "Non-conformance tracking for supervision, corrective actions, severity, and closeout evidence.",
    table: "ncr_logs",
    href: "/quality-ncr",
    icon: ShieldAlert,
    permissions: PROJECT_ROLES,
    statusField: "status",
    projectScoped: true,
    searchFields: ["title", "description", "severity", "status", "corrective_action"],
    columns: [
      { key: "title", label: "NCR title" },
      { key: "project_id", label: "Project", type: "project" },
      { key: "severity", label: "Severity", type: "status" },
      { key: "status", label: "Status", type: "status" },
      { key: "assigned_to", label: "Assigned", type: "user" },
      { key: "due_date", label: "Due", type: "date" }
    ],
    formFields: [
      { name: "project_id", label: "Project", type: "project", required: true },
      { name: "title", label: "NCR title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", rows: 4 },
      { name: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { name: "raised_by", label: "Raised by", type: "user" },
      { name: "assigned_to", label: "Assigned to", type: "user" },
      { name: "status", label: "Status", type: "select", options: ["Open", "In Review", "Corrective Action", "Closed", "Rejected"] },
      { name: "corrective_action", label: "Corrective action", type: "textarea", rows: 3 },
      { name: "due_date", label: "Due date", type: "date" },
      { name: "closed_date", label: "Close date", type: "date" },
      { name: "photos", label: "Photos", type: "file", multiple: true }
    ],
    defaultValues: { severity: "Medium", status: "Open" }
  },
  documents: {
    key: "documents",
    title: "Documents",
    singular: "Document",
    description: "Upload and manage revisions for authority submissions, drawings, BOQs, contracts, and reports.",
    table: "documents",
    href: "/documents",
    icon: FileArchive,
    permissions: ALL_ROLES,
    statusField: "status",
    projectScoped: true,
    searchFields: ["title", "document_type", "revision_no", "status"],
    columns: [
      { key: "title", label: "Document" },
      { key: "project_id", label: "Project", type: "project" },
      { key: "document_type", label: "Type", type: "status" },
      { key: "revision_no", label: "Revision" },
      { key: "uploaded_by", label: "Uploaded by", type: "user" },
      { key: "status", label: "Status", type: "status" },
      { key: "file_url", label: "File", type: "file" },
      { key: "created_at", label: "Uploaded", type: "date" }
    ],
    formFields: [
      { name: "project_id", label: "Project", type: "project" },
      { name: "title", label: "Document title", type: "text", required: true },
      { name: "document_type", label: "Document type", type: "select", options: DOCUMENT_CATEGORIES },
      { name: "stage_id", label: "Stage", type: "stage" },
      { name: "uploaded_by", label: "Uploaded by", type: "user" },
      { name: "file_url", label: "Upload file", type: "file" },
      { name: "revision_no", label: "Revision", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["Draft", "Submitted", "Approved", "For Revision", "Rejected", "Archived"] },
      { name: "authority_submission", label: "Authority submission", type: "checkbox" }
    ],
    defaultValues: { revision_no: "R0", status: "Draft", authority_submission: false }
  },
  quotations: {
    key: "quotations",
    title: "Quotations",
    singular: "Quotation",
    description: "Sales pipeline for consultancy fees, VAT, LPO follow-up, and status-triggered notifications.",
    table: "quotations",
    href: "/quotations",
    icon: FileCheck2,
    permissions: [...SALES_ROLES, "Accountant"],
    statusField: "status",
    searchFields: ["quotation_no", "client_name", "project_name", "scope", "status"],
    columns: [
      { key: "quotation_no", label: "Quotation no." },
      { key: "client_name", label: "Client" },
      { key: "project_name", label: "Project" },
      { key: "total_amount", label: "Total", type: "currency" },
      { key: "status", label: "Status", type: "status" },
      { key: "sales_rep_id", label: "Sales rep", type: "user" },
      { key: "follow_up_date", label: "Follow-up", type: "date" }
    ],
    formFields: [
      { name: "quotation_no", label: "Quotation no.", type: "text", required: true },
      { name: "client_name", label: "Client", type: "text", required: true },
      { name: "project_name", label: "Project name", type: "text", required: true },
      { name: "scope", label: "Scope of work", type: "textarea", rows: 4 },
      { name: "amount", label: "Fee", type: "number" },
      { name: "vat", label: "VAT", type: "number" },
      { name: "total_amount", label: "Total", type: "number" },
      { name: "status", label: "Status", type: "select", options: ["Draft", "Sent", "Follow-Up", "Accepted", "Rejected", "LPO Pending"] },
      { name: "sales_rep_id", label: "Sales representative", type: "user" },
      { name: "follow_up_date", label: "Follow-up date", type: "date" }
    ],
    defaultValues: { status: "Draft", amount: 0, vat: 0, total_amount: 0 }
  },
  invoices: {
    key: "invoices",
    title: "Invoices",
    singular: "Invoice",
    description: "Create, update, collect, and export invoices linked to projects and payment milestones.",
    table: "invoices",
    href: "/invoices",
    icon: ReceiptText,
    permissions: [...FINANCE_ROLES, "Project Manager"],
    statusField: "status",
    projectScoped: true,
    searchFields: ["invoice_no", "client_name", "status"],
    columns: [
      { key: "invoice_no", label: "Invoice no." },
      { key: "project_id", label: "Project", type: "project" },
      { key: "client_name", label: "Client" },
      { key: "total_amount", label: "Total", type: "currency" },
      { key: "payment_received", label: "Received", type: "currency" },
      { key: "balance", label: "Balance", type: "currency" },
      { key: "status", label: "Status", type: "status" },
      { key: "due_date", label: "Due", type: "date" }
    ],
    formFields: [
      { name: "invoice_no", label: "Invoice no.", type: "text", required: true },
      { name: "project_id", label: "Project", type: "project" },
      { name: "client_name", label: "Client", type: "text", required: true },
      { name: "amount", label: "Amount", type: "number" },
      { name: "vat", label: "VAT", type: "number" },
      { name: "total_amount", label: "Total", type: "number" },
      { name: "payment_received", label: "Payment received", type: "number" },
      { name: "status", label: "Status", type: "select", options: ["Draft", "Issued", "Paid", "Overdue", "Cancelled"] },
      { name: "due_date", label: "Due date", type: "date" },
      { name: "created_by", label: "Created by", type: "user" }
    ],
    defaultValues: { status: "Draft", amount: 0, vat: 0, total_amount: 0, payment_received: 0 }
  },
  payments: {
    key: "payments",
    title: "Payments",
    singular: "Payment Milestone",
    description: "Track contract payment milestones, invoicing status, due dates, and collections by project.",
    table: "payment_milestones",
    href: "/payments",
    icon: CreditCard,
    permissions: [...FINANCE_ROLES, "Project Manager"],
    statusField: "status",
    projectScoped: true,
    searchFields: ["milestone_name", "status"],
    columns: [
      { key: "milestone_name", label: "Milestone" },
      { key: "project_id", label: "Project", type: "project" },
      { key: "percentage", label: "Percentage", type: "percent" },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "due_date", label: "Due", type: "date" },
      { key: "status", label: "Status", type: "status" }
    ],
    formFields: [
      { name: "project_id", label: "Project", type: "project", required: true },
      { name: "milestone_name", label: "Milestone name", type: "text", required: true },
      { name: "percentage", label: "Percentage", type: "number" },
      { name: "amount", label: "Amount", type: "number" },
      { name: "due_date", label: "Due date", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["Pending", "Invoiced", "Paid", "Overdue", "On Hold"] }
    ],
    defaultValues: { status: "Pending", percentage: 0, amount: 0 }
  },
  hr: {
    key: "hr",
    title: "HR",
    singular: "Employee",
    description: "Employee records, assignments, attendance, leave, files, onboarding, offboarding, and performance.",
    table: "profiles",
    href: "/hr",
    icon: UsersRound,
    permissions: [...HR_ROLES, "Employee"],
    statusField: "status",
    searchFields: ["full_name", "email", "department", "designation", "employee_code"],
    columns: [
      { key: "full_name", label: "Employee" },
      { key: "employee_code", label: "Code" },
      { key: "role", label: "Role", type: "status" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "status", label: "Status", type: "status" }
    ],
    formFields: [
      { name: "full_name", label: "Full name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "role", label: "Role", type: "select", options: USER_ROLES },
      { name: "department", label: "Department", type: "text" },
      { name: "designation", label: "Designation", type: "text" },
      { name: "employee_code", label: "Employee code", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["Active", "Inactive", "On Leave", "Terminated"] }
    ]
  },
  "leave-eos": {
    key: "leave-eos",
    title: "Leave & EOS",
    singular: "Leave Request",
    description: "Leave workflow, balances, UAE gratuity/EOS estimates, deductions, and airfare reimbursements.",
    table: "leave_requests",
    href: "/leave-eos",
    icon: Landmark,
    permissions: ALL_ROLES,
    statusField: "status",
    searchFields: ["leave_type", "reason", "status"],
    columns: [
      { key: "user_id", label: "Employee", type: "user" },
      { key: "leave_type", label: "Type", type: "status" },
      { key: "start_date", label: "Start", type: "date" },
      { key: "end_date", label: "End", type: "date" },
      { key: "total_days", label: "Days" },
      { key: "status", label: "Status", type: "status" },
      { key: "approved_by", label: "Approved by", type: "user" }
    ],
    formFields: [
      { name: "user_id", label: "Employee", type: "user", required: true },
      { name: "leave_type", label: "Leave type", type: "select", options: ["Annual Leave", "Sick Leave", "Emergency Leave", "Unpaid Leave", "Maternity Leave", "Compensatory Off"] },
      { name: "start_date", label: "Start date", type: "date", required: true },
      { name: "end_date", label: "End date", type: "date", required: true },
      { name: "total_days", label: "Total days", type: "number", required: true },
      { name: "reason", label: "Reason", type: "textarea", rows: 3 },
      { name: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Rejected", "Cancelled"] },
      { name: "approved_by", label: "Approved by", type: "user" }
    ],
    defaultValues: { status: "Pending" }
  },
  payroll: {
    key: "payroll",
    title: "Payroll",
    singular: "Payroll Item",
    description: "Monthly payroll items with salary, allowances, deductions, leave deductions, bonus, and approval status.",
    table: "payroll_items",
    href: "/payroll",
    icon: BadgeDollarSign,
    permissions: [...HR_ROLES, "Accountant", "Employee"],
    statusField: "status",
    searchFields: ["status"],
    columns: [
      { key: "employee_id", label: "Employee", type: "user" },
      { key: "basic_salary", label: "Basic", type: "currency" },
      { key: "allowances", label: "Allowances", type: "currency" },
      { key: "deductions", label: "Deductions", type: "currency" },
      { key: "leave_deduction", label: "Leave deduction", type: "currency" },
      { key: "bonus", label: "Bonus", type: "currency" },
      { key: "net_salary", label: "Net salary", type: "currency" },
      { key: "status", label: "Status", type: "status" }
    ],
    formFields: [
      { name: "employee_id", label: "Employee", type: "user", required: true },
      { name: "basic_salary", label: "Basic salary", type: "number" },
      { name: "allowances", label: "Allowances", type: "number" },
      { name: "deductions", label: "Deductions", type: "number" },
      { name: "leave_deduction", label: "Leave deduction", type: "number" },
      { name: "bonus", label: "Bonus", type: "number" },
      { name: "status", label: "Status", type: "select", options: ["Draft", "Review", "Approved", "Paid"] }
    ],
    defaultValues: { status: "Draft", basic_salary: 0, allowances: 0, deductions: 0, leave_deduction: 0, bonus: 0 }
  },
  expenses: {
    key: "expenses",
    title: "Expenses",
    singular: "Expense",
    description: "Transport, IT, site, project, and receipt-based expense approval workflow.",
    table: "expenses",
    href: "/expenses",
    icon: Banknote,
    permissions: ALL_ROLES,
    statusField: "status",
    projectScoped: true,
    searchFields: ["category", "status"],
    columns: [
      { key: "user_id", label: "Employee", type: "user" },
      { key: "project_id", label: "Project", type: "project" },
      { key: "category", label: "Category", type: "status" },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "status", label: "Status", type: "status" },
      { key: "receipt_url", label: "Receipt", type: "file" },
      { key: "approved_by", label: "Approved by", type: "user" }
    ],
    formFields: [
      { name: "user_id", label: "Employee", type: "user", required: true },
      { name: "project_id", label: "Project", type: "project" },
      { name: "category", label: "Category", type: "select", options: ["Transport expenses", "IT expenses", "Site expenses", "Project expenses", "Other"] },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "receipt_url", label: "Receipt", type: "file" },
      { name: "status", label: "Status", type: "select", options: ["Submitted", "Manager Review", "Accounts Review", "Approved", "Rejected", "Paid"] },
      { name: "approved_by", label: "Approved by", type: "user" }
    ],
    defaultValues: { status: "Submitted", amount: 0 }
  },
  assets: {
    key: "assets",
    title: "Assets",
    singular: "Asset",
    description: "Track laptops, tablets, site equipment, serial numbers, ownership, and maintenance status.",
    table: "assets",
    href: "/assets",
    icon: Archive,
    permissions: [...HR_ROLES, "Employee"],
    statusField: "status",
    searchFields: ["asset_name", "asset_type", "serial_no", "status"],
    columns: [
      { key: "asset_name", label: "Asset" },
      { key: "asset_type", label: "Type", type: "status" },
      { key: "assigned_to", label: "Assigned to", type: "user" },
      { key: "serial_no", label: "Serial" },
      { key: "purchase_date", label: "Purchased", type: "date" },
      { key: "status", label: "Status", type: "status" }
    ],
    formFields: [
      { name: "asset_name", label: "Asset name", type: "text", required: true },
      { name: "asset_type", label: "Asset type", type: "text", required: true },
      { name: "assigned_to", label: "Assigned to", type: "user" },
      { name: "serial_no", label: "Serial no.", type: "text" },
      { name: "purchase_date", label: "Purchase date", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["Available", "Assigned", "Under Maintenance", "Retired", "Lost"] }
    ],
    defaultValues: { status: "Available" }
  },
  "forms-formats": {
    key: "forms-formats",
    title: "Forms & Formats",
    singular: "Form / Format",
    description: "Company standard templates for authority submissions, reports, HR, expense, quotation, and invoice formats.",
    table: "forms_formats",
    href: "/forms-formats",
    icon: FileText,
    permissions: ALL_ROLES,
    searchFields: ["title", "category"],
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category", type: "status" },
      { key: "uploaded_by", label: "Uploaded by", type: "user" },
      { key: "file_url", label: "File", type: "file" },
      { key: "created_at", label: "Uploaded", type: "date" }
    ],
    formFields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["Authority submission forms", "Site visit format", "NCR format", "Quotation format", "Invoice format", "HR forms", "Leave forms", "Expense forms"] },
      { name: "file_url", label: "Upload file", type: "file" },
      { name: "uploaded_by", label: "Uploaded by", type: "user" }
    ]
  },
  circulars: {
    key: "circulars",
    title: "Circulars",
    singular: "Circular",
    description: "Issue HR, IT, security, attendance, and general circulars with acknowledgement tracking.",
    table: "circulars",
    href: "/circulars",
    icon: Megaphone,
    permissions: ALL_ROLES,
    statusField: "category",
    searchFields: ["title", "message", "category", "target_department"],
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category", type: "status" },
      { key: "target_department", label: "Target" },
      { key: "acknowledgement_required", label: "Ack required", type: "boolean" },
      { key: "created_by", label: "Created by", type: "user" },
      { key: "created_at", label: "Issued", type: "date" }
    ],
    formFields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "message", label: "Message", type: "textarea", rows: 5, required: true },
      { name: "category", label: "Category", type: "select", options: ["HR", "IT", "Security", "Attendance", "General"] },
      { name: "target_department", label: "Target department", type: "text" },
      { name: "created_by", label: "Created by", type: "user" },
      { name: "acknowledgement_required", label: "Acknowledgement required", type: "checkbox" }
    ],
    defaultValues: { category: "General", acknowledgement_required: false }
  }
};

export const reportModules: ModuleConfig[] = [
  moduleConfigs.projects,
  moduleConfigs.tasks,
  moduleConfigs.attendance,
  moduleConfigs.documents,
  moduleConfigs.invoices,
  moduleConfigs.quotations,
  moduleConfigs["site-visits"],
  moduleConfigs["quality-ncr"],
  moduleConfigs.payments,
  moduleConfigs.hr
];

export function getModuleConfig(key: ModuleKey) {
  return moduleConfigs[key];
}

export function stageFields() {
  return PROJECT_STAGES.map((stage, index) => ({
    name: stage,
    order: index + 1
  }));
}
