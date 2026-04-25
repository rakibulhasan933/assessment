import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.24),transparent_38%)]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute right-0 top-12 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-sm font-black text-slate-950">
              PH
            </span>
            <div>
              <p className="text-sm font-semibold tracking-wide">Programming Hero</p>
              <p className="text-xs text-slate-400">
                Assignment & Learning Analytics Platform
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
            <a href="#platform" className="transition hover:text-white">
              Platform
            </a>
            <a href="#analytics" className="transition hover:text-white">
              Analytics
            </a>
            <a href="#roles" className="transition hover:text-white">
              Roles
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="rounded-full border border-white/10 bg-white/5 px-5 text-slate-200 hover:bg-white/10 hover:text-white"
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
            >
              <Link href="/login">Get started</Link>
            </Button>
          </div>
        </header>

        <section className="grid items-center gap-14 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="space-y-8">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200">
                Built for modern coding programs
              </span>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl xl:text-7xl">
                The command center for assignments, submissions, and learning outcomes.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Programming Hero helps instructors deliver better technical
                education with structured assignment operations, AI-assisted
                review, and actionable analytics that reveal where students are
                stuck and where they are thriving.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300"
              >
                <Link href="/login">Launch workspace</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/10 bg-white/5 px-6 text-slate-100 hover:bg-white/10"
              >
                <Link href="/dashboard/instructor/analytics">
                  View analytics area
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["98%", "review clarity", "Structured instructor feedback makes iteration faster."],
                ["3x", "faster insights", "Analytics highlight risk areas without manual spreadsheets."],
                ["24/7", "platform access", "Students and instructors stay aligned in one system."],
              ].map(([value, label, copy]) => (
                <div
                  key={label}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <p className="text-3xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    {label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-cyan-400/20 via-transparent to-emerald-300/10 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_rgba(2,8,24,0.55)] backdrop-blur xl:p-8">
              <div className="grid gap-5">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Weekly learning snapshot
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        Instructor performance pulse
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                      Live
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <InsightTile label="Accepted" value="146" tone="emerald" />
                    <InsightTile label="Pending" value="29" tone="slate" />
                    <InsightTile
                      label="Needs Improvement"
                      value="17"
                      tone="amber"
                    />
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Assignment difficulty analysis
                    </p>
                    <div className="mt-5 space-y-4">
                      <ProgressRow label="Beginner" value={88} color="bg-emerald-400" />
                      <ProgressRow label="Intermediate" value={67} color="bg-cyan-400" />
                      <ProgressRow label="Advanced" value={42} color="bg-orange-400" />
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Most difficult assignment
                    </p>
                    <h3 className="mt-3 text-xl font-semibold">
                      Type-Safe API Architecture
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Lower acceptance rate detected among advanced students.
                      Instructors can intervene quickly with targeted feedback.
                    </p>
                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Acceptance rate
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-orange-300">
                        41%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="grid gap-6 py-8 lg:grid-cols-3">
          {[
            {
              title: "Assignment operations",
              copy:
                "Publish structured assignments, manage deadlines, and segment challenge levels from beginner to advanced.",
            },
            {
              title: "Submission intelligence",
              copy:
                "Track submission URLs, notes, review status, and instructor guidance in one traceable workflow.",
            },
            {
              title: "Learning analytics",
              copy:
                "Measure acceptance rates, difficulty performance, and the assignments creating the most friction.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <p className="text-xl font-semibold text-white">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.copy}</p>
            </article>
          ))}
        </section>

        <section id="roles" className="grid gap-6 py-10 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-cyan-400/15 bg-cyan-400/10 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Instructor experience
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Make faster, better teaching decisions.
            </h2>
            <p className="mt-4 text-sm leading-7 text-cyan-50/90">
              Instructors create assignments, review submissions, update status,
              publish feedback, and monitor cohort performance without leaving the platform.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Student experience
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Understand what to submit and what to improve next.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Students get a clear assignment feed, structured submission flow,
              visible review status, and actionable feedback aligned with the work they shipped.
            </p>
          </div>
        </section>

        <section
          id="analytics"
          className="mb-8 rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(16,24,40,0.8))] p-8 lg:p-10"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Production-ready education analytics
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                See where learners succeed, stall, and need support.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-200">
                Programming Hero turns raw submission activity into instructor-facing
                charts and acceptance insights, helping teams respond with clarity instead
                of intuition alone.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100"
            >
              <Link href="/login">Start using Programming Hero</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

function InsightTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "slate" | "amber";
}) {
  const toneClass = {
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    slate: "border-slate-400/20 bg-slate-400/10 text-slate-100",
    amber: "border-orange-400/20 bg-orange-400/10 text-orange-100",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClass[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-200">{label}</span>
        <span className="font-medium text-white">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
