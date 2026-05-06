"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Building2, UserPlus } from "lucide-react";
import { COMPANY, roleLandingPath, USER_ROLES } from "@/lib/constants";
import { getSupabaseClient } from "@/lib/supabase/client";
import { SetupNotice } from "@/components/ui/setup-notice";
import type { UserRole } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Employee");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          department
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.replace(roleLandingPath(role));
    } else {
      setMessage("Account created. Please confirm the email address if Supabase email confirmation is enabled, then sign in.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white bg-white p-6 shadow-soft sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-brand-600 p-3 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-navy-900">{COMPANY.shortName}</p>
            <p className="text-sm text-slate-500">{COMPANY.fullName}</p>
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-navy-900">Create ERP account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          New users are stored in Supabase Auth and a matching role profile is created through the database trigger.
        </p>

        {!supabase ? (
          <div className="mt-8">
            <SetupNotice />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-navy-900">Full name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-navy-900">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                type="email"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-navy-900">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                type="password"
                minLength={8}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-navy-900">Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              >
                {USER_ROLES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-navy-900">Department</span>
              <input
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:col-span-2">{error}</p> : null}
            {message ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:col-span-2">{message}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-brand-700 disabled:opacity-60 sm:col-span-2"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-sm text-slate-500 sm:col-span-2">
              Already have access?{" "}
              <Link className="font-semibold text-brand-600" href="/login">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
