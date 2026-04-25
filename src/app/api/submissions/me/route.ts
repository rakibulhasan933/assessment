import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jsonError, jsonSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { assignments, submissions } from "@/lib/db/schema";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (user.role !== "student") {
    return jsonError("Forbidden", 403);
  }

  const rows = await db()
    .select({
      id: submissions.id,
      assignmentId: submissions.assignmentId,
      assignmentTitle: assignments.title,
      assignmentDeadline: assignments.deadline,
      url: submissions.url,
      note: submissions.note,
      status: submissions.status,
      feedback: submissions.feedback,
      createdAt: submissions.createdAt,
      updatedAt: submissions.updatedAt,
    })
    .from(submissions)
    .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
    .where(eq(submissions.studentId, user.id))
    .orderBy(desc(submissions.updatedAt));

  return jsonSuccess({ submissions: rows });
}
