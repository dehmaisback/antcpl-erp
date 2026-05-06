"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Building2, LockKeyhole } from "lucide-react";
import { COMPANY, roleLandingPath } from "@/lib/constants";
import { getSupabaseClient } from "@/lib/supabase/client";
import { SetupNotice } from "@/components/ui/setup-notice";

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("md@antcpl.ae");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    router.replace(roleLandingPath(profile?.role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-soft lg:grid-cols-[1fr_0.9fr]">
        <section className="relative hidden bg-navy-900 p-10 text-white lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(27,120,208,.78),rgba(11,31,58,.94)),url('https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="inline-flex w-fit items-center gap-3 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur">
              <Building2 className="h-6 w-6" />
              <div>
                <p className="text-lg font-semibold leading-tight">{COMPANY.shortName}</p>
                <p className="text-xs text-blue-100">{COMPANY.location}</p>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-blue-100">Engineering Consultancy ERP</p>
              <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight">
                Calm control for projects, approvals, sites, finance, and people.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-blue-50">
                Designed around Dubai authority workflows, AOR coordination, supervision reports, quotations, invoices, and HR operations.
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="rounded-2xl bg-brand-600 p-3 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-navy-900">{COMPANY.shortName}</p>
              <p className="text-sm text-slate-500">{COMPANY.fullName}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-brand-600">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold text-navy-900">Sign in to ANTCPL ERP</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use the seeded account after running the Supabase seed file, or create a new account.
            </p>
          </div>

          {!supabase ? (
            <div className="mt-8">
              <SetupNotice />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-navy-900">Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  type="email"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-navy-900">Password</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  type="password"
                  required
                />
              </label>

              {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LockKeyhole className="h-4 w-4" />
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-sm text-slate-500">
                New to the ERP?{" "}
                <Link className="font-semibold text-brand-600" href="/signup">
                  Create an account
                </Link>
              </p>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
