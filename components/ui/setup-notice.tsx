import { Database } from "lucide-react";

export function SetupNotice() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-navy-700 shadow-card">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white p-2 text-brand-600 shadow-sm">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-navy-900">Connect Supabase to activate live ERP data</p>
          <p className="mt-1 leading-6 text-slate-600">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`, then run the schema and seed SQL in
            Supabase. The app is wired for live Auth, Database, Storage, and RLS.
          </p>
        </div>
      </div>
    </div>
  );
}
