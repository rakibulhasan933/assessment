import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { assignments, submissions, users } from "@/lib/db/schema";
import { StudentWorkspace } from "@/components/dashboard/student-workspace";

export default async function StudentDashboardPage() {
  const user = await requireRole("student");
  const availableAssignments = await db()
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      difficulty: assignments.difficulty,
      deadline: assignments.deadline,
      instructorName: users.name,
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.createdBy, users.id))
    .orderBy(desc(assignments.createdAt));

  const ownSubmissions = await db()
    .select()
    .from(submissions)
    .where(eq(submissions.studentId, user.id))
    .orderBy(desc(submissions.updatedAt));

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Student workspace
        </span>
        <h2 className="text-4xl font-semibold tracking-tight">
          Ready to learn, {user.name}?
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-300">
          Track assignments, submit project links with clearer notes, and follow
          instructor feedback as your work moves from pending to accepted.
        </p>
      </div>

      <StudentWorkspace
        assignments={availableAssignments.map((assignment) => ({
          ...assignment,
          deadline: assignment.deadline.toISOString(),
        }))}
        submissions={ownSubmissions.map((submission) => ({
          ...submission,
          note: submission.note ?? null,
          feedback: submission.feedback ?? null,
          updatedAt: submission.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
