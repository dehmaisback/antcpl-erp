import type { TableColumn } from "@/lib/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

function formatCell(value: unknown, type?: TableColumn["type"]) {
  if (value === null || value === undefined) return "";
  if (type === "currency") return formatCurrency(value);
  if (type === "date") return formatDate(value);
  if (type === "datetime") return formatDateTime(value);
  if (type === "percent") return `${value}%`;
  if (type === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(" | ");
  return String(value).replace(/\s+/g, " ").trim();
}

export function exportRowsToCsv(filename: string, rows: Record<string, unknown>[], columns: TableColumn[]) {
  const header = columns.map((column) => column.label);
  const lines = rows.map((row) =>
    columns.map((column) => `"${formatCell(row[column.key], column.type).replace(/"/g, '""')}"`).join(",")
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function printReport() {
  window.print();
}
