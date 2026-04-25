import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jsonError, jsonSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import {
  assertNonEmptyString,
  isSubmissionStatus,
} from "@/lib/auth/validation";
import { assignments, submissions } from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{
    submissionId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (user.role !== "instructor") {
    return jsonError("Forbidden", 403);
  }

  const { submissionId } = await context.params;
  console.log(submissionId, "submissionId");
  const submission = await db()
    .select({
      id: submissions.id,
    })
    .from(submissions)
    .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
    .where(and(eq(submissions.id, submissionId), eq(assignments.createdBy, user.id)))
    .limit(1);

  if (submission.length === 0) {
    return jsonError("Submission not found", 404);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const statusValue = assertNonEmptyString(body.status, "Status");
    const feedback = assertNonEmptyString(body.feedback, "Feedback", 8);

    if (!isSubmissionStatus(statusValue)) {
      return jsonError("Status must be pending, accepted, or needs_improvement", 422);
    }

    const [updatedSubmission] = await db()
      .update(submissions)
      .set({
        status: statusValue,
        feedback,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, submissionId))
      .returning();

    return jsonSuccess({ submission: updatedSubmission });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to review submission";

    return jsonError(message, 400);
  }
}
