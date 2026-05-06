"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Building2, Database, FileText, Landmark, Mail, RefreshCw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AUTHORITIES, COMPANY, DOCUMENT_CATEGORIES, PROJECT_STAGES, USER_ROLES } from "@/lib/constants";
import { getSupabaseClient } from "@/lib/supabase/client";

const sections = [
  "Company profile",
  "Departments",
  "Roles & permissions",
  "Project stages",
  "Document categories",
  "Authority list",
  "Email templates"
];

export function SettingsPage() {
  const supabase = getSupabaseClient();
  const [active, setActive] = useState(sections[0]);
  const [settings, setSettings] = useState<Record<string, unknown>[]>([]);
  const [departments, setDepartments] = useState<Record<string, unknown>[]>([]);
  const [templates, setTemplates] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const [settingsResult, departmentResult, templateResult] = await Promise.all([
      supabase.from("app_settings").select("*").order("setting_key"),
      supabase.from("departments").select("*").order("name"),
      supabase.from("email_templates").select("*").order("template_key")
    ]);
    setSettings(settingsResult.data ?? []);
    setDepartments(departmentResult.data ?? []);
    setTemplates(templateResult.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveCompanyProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const formData = new FormData(event.currentTarget);
    const setting_value = {
      companyName: formData.get("companyName"),
      fullName: formData.get("fullName"),
      location: formData.get("location"),
      currency: formData.get("currency"),
      vatRate: Number(formData.get("vatRate") ?? 5)
    };
    const { error } = await supabase.from("app_settings").upsert({ setting_key: "company_profile", setting_value }, { onConflict: "setting_key" });
    setMessage(error ? error.message : "Company profile saved.");
    await load();
  }

  const profileSetting = settings.find((item) => item.setting_key === "company_profile")?.setting_value as Record<string, unknown> | undefined;

  return (
    <section className="space-y-5">
      <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">ERP configuration</p>
            <h2 className="mt-1 text-2xl font-semibold text-navy-900">Settings</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Company profile, departments, roles and permissions, project stages, document categories, authorities, and email notification templates.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm" onClick={load}>
            <RefreshCw className="h-4 w-4" />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActive(section)}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                active === section ? "bg-brand-600 text-white shadow-lg shadow-blue-100" : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-brand-700"
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div> : null}

      <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-card">
        {active === "Company profile" ? (
          <form onSubmit={saveCompanyProfile} className="grid gap-4 sm:grid-cols-2">
            <SettingsHeader icon={Building2} title="Company profile" />
            <Input name="companyName" label="Company name" defaultValue={String(profileSetting?.companyName ?? COMPANY.shortName)} />
            <Input name="fullName" label="Full name" defaultValue={String(profileSetting?.fullName ?? COMPANY.fullName)} />
            <Input name="location" label="Location" defaultValue={String(profileSetting?.location ?? COMPANY.location)} />
            <Input name="currency" label="Currency" defaultValue={String(profileSetting?.currency ?? COMPANY.currency)} />
            <Input name="vatRate" label="VAT rate" type="number" defaultValue={String(profileSetting?.vatRate ?? COMPANY.vatRate)} />
            <div className="sm:col-span-2">
              <button className="rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200">Save company profile</button>
            </div>
          </form>
        ) : active === "Departments" ? (
          <ListSection icon={Database} title="Departments" rows={departments.map((item) => String(item.name))} />
        ) : active === "Roles & permissions" ? (
          <ListSection icon={ShieldCheck} title="Roles & permissions" rows={USER_ROLES.map((role) => `${role} permissions are enforced by Supabase RLS policies.`)} />
        ) : active === "Project stages" ? (
          <ListSection icon={SlidersHorizontal} title="Project stages" rows={PROJECT_STAGES.map((stage, index) => `${index + 1}. ${stage}`)} />
        ) : active === "Document categories" ? (
          <ListSection icon={FileText} title="Document categories" rows={DOCUMENT_CATEGORIES} />
        ) : active === "Authority list" ? (
          <ListSection icon={Landmark} title="Authority list" rows={AUTHORITIES} />
        ) : (
          <ListSection icon={Mail} title="Email templates" rows={templates.map((item) => `${String(item.template_key)} / ${String(item.subject)}`)} />
        )}
      </div>
    </section>
  );
}

function SettingsHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="sm:col-span-2">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
      </div>
    </div>
  );
}

function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-navy-900">{label}</span>
      <input {...props} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
    </label>
  );
}

function ListSection({ icon: Icon, title, rows }: { icon: LucideIcon; title: string; rows: string[] }) {
  return (
    <div>
      <SettingsHeader icon={Icon} title={title} />
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div key={row} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-navy-800">
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}
