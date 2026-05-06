import type { UserRole } from "@/lib/types";

export const COMPANY = {
  shortName: "ANTCPL",
  fullName: "A N T Engineering Consultants",
  location: "Dubai, UAE",
  currency: "AED",
  vatRate: 5
};

export const USER_ROLES: UserRole[] = [
  "Managing Director",
  "Admin",
  "Project Manager",
  "Architect",
  "Structural Engineer",
  "MEP Engineer",
  "Site Engineer",
  "Quantity Surveyor",
  "Accountant",
  "HR",
  "Sales / Quotation Manager",
  "Employee",
  "Client Viewer"
];

export const ADMIN_ROLES: UserRole[] = ["Managing Director", "Admin"];
export const FINANCE_ROLES: UserRole[] = ["Managing Director", "Admin", "Accountant"];
export const HR_ROLES: UserRole[] = ["Managing Director", "Admin", "HR"];

export const ENGINEERING_ROLES: UserRole[] = [
  "Managing Director",
  "Admin",
  "Project Manager",
  "Architect",
  "Structural Engineer",
  "MEP Engineer",
  "Site Engineer",
  "Quantity Surveyor"
];

export const PROJECT_STAGES = [
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

export const DOCUMENT_CATEGORIES = [
  "Architectural",
  "Structural",
  "MEP",
  "Authority Submission",
  "BOQ",
  "Tender",
  "Contract",
  "Site Report",
  "Invoice",
  "Quotation",
  "Forms & Formats"
];

export const AUTHORITIES = ["DCD", "Nakheel", "Trakhees", "Dubai Municipality", "DDA", "Other"];

export const AOR_SCOPE_ITEMS = [
  "Review Architectural drawings for authority compliance",
  "Review drainage drawings",
  "Review water supply drawings",
  "Review Civil Defense drawings",
  "Review HVAC drawings",
  "Prepare authority submission documents",
  "Submit to authorities",
  "Liaise with DCD, Nakheel, Trakhees, DM, DDA",
  "Track NOCs",
  "Address authority comments",
  "Coordinate with client/design team",
  "Obtain final approvals"
];

export function roleLandingPath(role?: string | null) {
  switch (role) {
    case "Accountant":
      return "/invoices";
    case "HR":
      return "/hr";
    case "Sales / Quotation Manager":
      return "/quotations";
    case "Client Viewer":
      return "/projects";
    case "Site Engineer":
      return "/site-visits";
    default:
      return "/dashboard";
  }
}

export function canAccess(required: UserRole[] | undefined, role?: UserRole | null) {
  if (!required || required.length === 0) return true;
  if (!role) return false;
  return required.includes(role);
}
