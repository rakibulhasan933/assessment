import Link from "next/link";
import { AuthPanel } from "@/components/auth/auth-panel";

export default function LoginPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(140deg,#081122_0%,#0d1830_35%,#12213f_100%)] px-6 py-10 text-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-fuchsia-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400 text-sm font-black text-slate-950">
              PH
            </span>
            <div>
              <p className="text-sm font-semibold tracking-wide">Programming Hero</p>
              <p className="text-xs text-slate-400">
                Assignment & Learning Analytics Platform
              </p>
            </div>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Back to home
          </Link>
        </header>

        <section className="grid items-center gap-10 lg:grid-cols-[1fr_520px]">
          <div className="space-y-8">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Secure access for instructors and students
              </span>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                Welcome back to the modern classroom operating system.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300">
                Programming Hero combines assignment delivery, submission review,
                AI-assisted feedback, and learning analytics in one focused
                platform for technical education teams.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Role-based access", "Separate instructor and student workspaces with protected routes."],
                ["Submission review", "Track status, feedback, and assignment-level learning progress."],
                ["Analytics engine", "Measure acceptance rates and identify difficult assignments quickly."],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Built for instructors
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Create assignments, review submissions, monitor analytics, and
                  respond faster with AI-assisted instructional workflows.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Built for students
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Submit work confidently, track review status, and understand
                  exactly what to improve on the next iteration.
                </p>
              </div>
            </div>
          </div>

          <AuthPanel />
        </section>
      </div>
    </main>
  );
}
