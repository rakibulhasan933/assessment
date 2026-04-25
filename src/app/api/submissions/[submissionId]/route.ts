import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jsonError, jsonSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { assertNonEmptyString, assertUrl } from "@/lib/auth/validation";
import { assignments, submissions } from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{
    submissionId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const { submissionId } = await context.params;
  const submission =
    user.role === "student"
      ? await db().query.submissions.findFirst({
          where: and(eq(submissions.id, submissionId), eq(submissions.studentId, user.id)),
        })
      : (
          await db()
            .select({
              id: submissions.id,
              assignmentId: submissions.assignmentId,
              studentId: submissions.studentId,
              url: submissions.url,
              note: submissions.note,
              status: submissions.status,
              feedback: submissions.feedback,
              createdAt: submissions.createdAt,
              updatedAt: submissions.updatedAt,
            })
            .from(submissions)
            .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
            .where(and(eq(submissions.id, submissionId), eq(assignments.createdBy, user.id)))
            .limit(1)
        )[0];

  if (!submission) {
    return jsonError("Submission not found", 404);
  }

  return jsonSuccess({ submission });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (user.role !== "student") {
    return jsonError("Forbidden", 403);
  }

  const { submissionId } = await context.params;
  const existingSubmission = await db().query.submissions.findFirst({
    where: and(eq(submissions.id, submissionId), eq(submissions.studentId, user.id)),
  });

  if (!existingSubmission) {
    return jsonError("Submission not found", 404);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const url =
      body.url !== undefined ? assertUrl(body.url) : existingSubmission.url;
    const note =
      body.note !== undefined
        ? assertNonEmptyString(body.note, "Note", 10)
        : existingSubmission.note;

    const [submission] = await db()
      .update(submissions)
      .set({
        url,
        note,
        status: "pending",
        feedback: null,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, submissionId))
      .returning();

    return jsonSuccess({ submission });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update submission";

    return jsonError(message, 400);
  }
}
