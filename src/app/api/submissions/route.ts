import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jsonError, jsonSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { assertNonEmptyString, assertUrl } from "@/lib/auth/validation";
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
    .where(eq(submissions.studentId, user.id));

  return jsonSuccess({ submissions: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (user.role !== "student") {
    return jsonError("Forbidden", 403);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const assignmentId = assertNonEmptyString(body.assignmentId, "Assignment id");
    const url = assertUrl(body.url);
    const note = assertNonEmptyString(body.note, "Note", 10);

    const assignment = await db().query.assignments.findFirst({
      where: eq(assignments.id, assignmentId),
      columns: {
        id: true,
      },
    });

    if (!assignment) {
      return jsonError("Assignment not found", 404);
    }

    const existingSubmission = await db().query.submissions.findFirst({
      where: and(
        eq(submissions.assignmentId, assignmentId),
        eq(submissions.studentId, user.id),
      ),
    });

    if (existingSubmission) {
      const [submission] = await db()
        .update(submissions)
        .set({
          url,
          note,
          status: "pending",
          feedback: null,
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, existingSubmission.id))
        .returning();

      return jsonSuccess({ submission });
    }

    const [submission] = await db()
      .insert(submissions)
      .values({
        assignmentId,
        studentId: user.id,
        url,
        note,
        status: "pending",
      })
      .returning();

    return jsonSuccess({ submission }, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit assignment";

    return jsonError(message, 400);
  }
}
