import type { LucideIcon } from "lucide-react";

export type UserRole =
  | "Managing Director"
  | "Admin"
  | "Project Manager"
  | "Architect"
  | "Structural Engineer"
  | "MEP Engineer"
  | "Site Engineer"
  | "Quantity Surveyor"
  | "Accountant"
  | "HR"
  | "Sales / Quotation Manager"
  | "Employee"
  | "Client Viewer";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  department?: string | null;
  designation?: string | null;
  employee_code?: string | null;
  status?: string | null;
  avatar_url?: string | null;
  created_at?: string;
};

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "number"
  | "date"
  | "datetime-local"
  | "select"
  | "checkbox"
  | "file"
  | "user"
  | "project"
  | "stage"
  | "task";

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  rows?: number;
  multiple?: boolean;
  hiddenOnCreate?: boolean;
  readOnly?: boolean;
};

export type TableColumn = {
  key: string;
  label: string;
  type?: "text" | "date" | "datetime" | "currency" | "percent" | "status" | "user" | "project" | "file" | "boolean";
  className?: string;
};

export type ModuleKey =
  | "projects"
  | "tasks"
  | "time-tracking"
  | "attendance"
  | "site-visits"
  | "quality-ncr"
  | "documents"
  | "quotations"
  | "invoices"
  | "payments"
  | "hr"
  | "leave-eos"
  | "payroll"
  | "expenses"
  | "assets"
  | "forms-formats"
  | "circulars";

export type ModuleConfig = {
  key: ModuleKey;
  title: string;
  singular: string;
  description: string;
  table: string;
  href: string;
  icon: LucideIcon;
  permissions: UserRole[];
  columns: TableColumn[];
  formFields: FormField[];
  searchFields: string[];
  statusField?: string;
  projectScoped?: boolean;
  defaultValues?: Record<string, unknown>;
  rowHref?: (row: Record<string, unknown>) => string;
  exportTitle?: string;
};

export type SelectOption = {
  value: string;
  label: string;
  meta?: string;
};

export type ModuleRecord = Record<string, unknown> & {
  id: string;
  created_at?: string;
  updated_at?: string;
};
