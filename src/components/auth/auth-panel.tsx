"use client";

import { startTransition, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register";
type AuthRole = "instructor" | "student";

type AuthResponse = {
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: AuthRole;
  };
};

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "student" as AuthRole,
};

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function updateField<Key extends keyof typeof initialForm>(
    key: Key,
    value: (typeof initialForm)[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function redirectForRole(role: AuthRole) {
    router.push(
      role === "instructor"
        ? "/dashboard/instructor"
        : "/dashboard/student",
    );
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsPending(true);

    startTransition(async () => {
      try {
        const endpoint =
          mode === "login" ? "/api/auth/login" : "/api/auth/register";
        const payload =
          mode === "login"
            ? {
                email: form.email,
                password: form.password,
              }
            : {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
              };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as AuthResponse;

        if (!response.ok || !data.user) {
          setError(data.error ?? "Unable to complete authentication.");
          setIsPending(false);
          return;
        }

        setMessage(
          mode === "login"
            ? "Login successful. Redirecting to your workspace..."
            : "Account created successfully. Redirecting to your workspace...",
        );

        redirectForRole(data.user.role);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 text-slate-50 shadow-[0_30px_120px_rgba(8,15,40,0.45)] backdrop-blur xl:p-8">
      <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
            setMessage(null);
          }}
          className={`rounded-full px-4 py-2 transition ${
            mode === "login"
              ? "bg-cyan-400 text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
            setMessage(null);
          }}
          className={`rounded-full px-4 py-2 transition ${
            mode === "register"
              ? "bg-cyan-400 text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Create account
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-3xl font-semibold tracking-tight">
          {mode === "login"
            ? "Access your Programming Hero workspace"
            : "Create your Programming Hero account"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {mode === "login"
            ? "Sign in to manage assignments, review submissions, and unlock learning analytics."
            : "Join as a student or instructor and start using the assignment and analytics platform immediately."}
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <Field label="Full name">
            <Input
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Programming Hero User"
              required
            />
          </Field>
        ) : null}

        <Field label="Email address">
          <Input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>

        <Field label="Password">
          <Input
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="At least 8 characters"
            required
          />
        </Field>

        {mode === "register" ? (
          <Field label="Role">
            <div className="grid grid-cols-2 gap-3">
              {(["student", "instructor"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => updateField("role", role)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    form.role === role
                      ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <p className="text-sm font-semibold capitalize">{role}</p>
                  <p className="mt-1 text-xs leading-5 opacity-80">
                    {role === "student"
                      ? "Submit work and track review outcomes."
                      : "Create assignments and review performance analytics."}
                  </p>
                </button>
              ))}
            </div>
          </Field>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {message}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          disabled={isPending}
        >
          {isPending
            ? "Please wait..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
        <p className="font-medium text-white">Production note</p>
        <p className="mt-2">
          This UI is connected to the existing custom auth routes, so login and
          account creation already work against your backend contract.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}
