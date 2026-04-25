import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { assignments, submissions, users } from "@/lib/db/schema";
import { InstructorWorkspace } from "@/components/dashboard/instructor-workspace";

export default async function InstructorDashboardPage() {
  const user = await requireRole("instructor");
  const ownAssignments = await db()
    .select()
    .from(assignments)
    .where(eq(assignments.createdBy, user.id))
    .orderBy(desc(assignments.createdAt));

  const reviewQueue = await db()
    .select({
      id: submissions.id,
      assignmentId: assignments.id,
      assignmentTitle: assignments.title,
      assignmentDescription: assignments.description,
      studentId: users.id,
      studentName: users.name,
      studentEmail: users.email,
      url: submissions.url,
      note: submissions.note,
      status: submissions.status,
      feedback: submissions.feedback,
      createdAt: submissions.createdAt,
      updatedAt: submissions.updatedAt,
    })
    .from(submissions)
    .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
    .innerJoin(users, eq(submissions.studentId, users.id))
    .where(eq(assignments.createdBy, user.id))
    .orderBy(desc(submissions.updatedAt));

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Instructor workspace
        </span>
        <h2 className="text-4xl font-semibold tracking-tight">
          Welcome back, {user.name}
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-300">
          Build and manage assignments, review work with structured feedback, and
          use AI to speed up teaching operations without reducing review quality.
        </p>
      </div>

      <InstructorWorkspace
        assignments={ownAssignments.map((assignment) => ({
          ...assignment,
          deadline: assignment.deadline.toISOString(),
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
        }))}
        submissions={reviewQueue.map((submission) => ({
          ...submission,
          note: submission.note ?? null,
          feedback: submission.feedback ?? null,
          createdAt: submission.createdAt.toISOString(),
          updatedAt: submission.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
