import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jsonError, jsonSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { assignments, submissions, users } from "@/lib/db/schema";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (user.role !== "instructor") {
    return jsonError("Forbidden", 403);
  }

  const rows = await db()
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

  return jsonSuccess({ submissions: rows });
}
