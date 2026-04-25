import { requireRole } from "@/lib/auth/guards";
import { getInstructorAnalytics } from "@/lib/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusPieChart } from "@/components/analytics/status-pie-chart";
import { DifficultyBarChart } from "@/components/analytics/difficulty-bar-chart";

export default async function InstructorAnalyticsPage() {
  const user = await requireRole("instructor");
  const analytics = await getInstructorAnalytics(user.id);

  return (
    <div className="flex w-full max-w-7xl flex-col gap-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Instructor analytics
        </span>
        <h1 className="text-4xl font-semibold tracking-tight">
          Learning analytics for {user.name}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-300">
          This dashboard is instructor-only and summarizes submission status,
          assignment difficulty performance, acceptance rates, and the most
          challenging assignments from your current dataset.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Assignments"
          value={analytics.overview.totalAssignments}
          tone="cyan"
        />
        <MetricCard
          label="Submissions"
          value={analytics.overview.totalSubmissions}
          tone="blue"
        />
        <MetricCard
          label="Accepted"
          value={analytics.overview.acceptedSubmissions}
          tone="emerald"
        />
        <MetricCard
          label="Pending"
          value={analytics.overview.pendingSubmissions}
          tone="slate"
        />
        <MetricCard
          label="Acceptance Rate"
          value={`${analytics.overview.acceptanceRate}%`}
          tone="amber"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Submission distribution</CardTitle>
            <CardDescription>
              Pie chart of accepted, pending, and needs-improvement submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={analytics.statusDistribution} />
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {analytics.statusDistribution.map((item) => (
                <div
                  key={item.status}
                  className="rounded-2xl border border-white/10 bg-black/10 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{item.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Difficulty vs success</CardTitle>
            <CardDescription>
              Bar chart comparing performance across beginner, intermediate, and
              advanced assignments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DifficultyBarChart data={analytics.difficultyPerformance} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Difficulty analysis</CardTitle>
            <CardDescription>
              Aggregated performance by assignment difficulty.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.difficultyPerformance.map((item) => (
              <div
                key={item.difficulty}
                className="rounded-2xl border border-white/10 bg-black/10 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.totalAssignments} assignments - {item.totalSubmissions} submissions
                    </p>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                    {item.acceptanceRate}% accepted
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Accepted" value={item.acceptedSubmissions} />
                  <MiniStat label="Pending" value={item.pendingSubmissions} />
                  <MiniStat
                    label="Needs Improvement"
                    value={item.needsImprovementSubmissions}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Most difficult assignments</CardTitle>
            <CardDescription>
              Lowest acceptance rate first, weighted by review outcomes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.mostDifficultAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-5 text-sm text-slate-400">
                No submission data yet. Analytics will populate as students submit work.
              </div>
            ) : (
              analytics.mostDifficultAssignments.map((assignment, index) => (
                <div
                  key={assignment.assignmentId}
                  className="rounded-2xl border border-white/10 bg-black/10 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Rank #{index + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">
                        {assignment.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {assignment.difficulty} - {assignment.totalSubmissions} submissions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Acceptance rate
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-amber-300">
                        {assignment.acceptanceRate}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Assignment acceptance rates</CardTitle>
          <CardDescription>
            All assignments ranked by acceptance rate for quick instructor review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-white/10 bg-white/5 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>Assignment</span>
              <span>Difficulty</span>
              <span>Submissions</span>
              <span>Acceptance</span>
            </div>
            {analytics.assignmentAcceptanceRates.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-400">
                No assignment analytics available yet.
              </div>
            ) : (
              analytics.assignmentAcceptanceRates.map((assignment) => (
                <div
                  key={assignment.assignmentId}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-t border-white/10 px-5 py-4 text-sm text-slate-200"
                >
                  <span className="font-medium">{assignment.title}</span>
                  <span className="capitalize text-slate-400">
                    {assignment.difficulty}
                  </span>
                  <span>{assignment.totalSubmissions}</span>
                  <span>{assignment.acceptanceRate}%</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "cyan" | "blue" | "emerald" | "slate" | "amber";
}) {
  const toneClasses = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
    blue: "border-blue-400/20 bg-blue-400/10 text-blue-100",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    slate: "border-slate-400/20 bg-slate-400/10 text-slate-100",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  };

  return (
    <div className={`rounded-3xl border p-5 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}
