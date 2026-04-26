import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jsonError, jsonSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import {
  assertNonEmptyString,
  isAssignmentDifficulty,
} from "@/lib/auth/validation";
import { assignments, type AssignmentDifficulty } from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{
    assignmentId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const { assignmentId } = await context.params;
  const assignment = await db().query.assignments.findFirst({
    where: eq(assignments.id, assignmentId),
  });

  if (!assignment) {
    return jsonError("Assignment not found", 404);
  }

  return jsonSuccess({ assignment });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (user.role !== "instructor") {
    return jsonError("Forbidden", 403);
  }

  const { assignmentId } = await context.params;
  const existing = await db().query.assignments.findFirst({
    where: and(eq(assignments.id, assignmentId), eq(assignments.createdBy, user.id)),
  });

  if (!existing) {
    return jsonError("Assignment not found", 404);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updates: Partial<{
      title: string;
      description: string;
      difficulty: AssignmentDifficulty;
      deadline: Date;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) {
      updates.title = assertNonEmptyString(body.title, "Title", 3);
    }

    if (body.description !== undefined) {
      updates.description = assertNonEmptyString(body.description, "Description", 10);
    }

    if (body.difficulty !== undefined) {
      const difficultyValue = assertNonEmptyString(body.difficulty, "Difficulty");

      if (!isAssignmentDifficulty(difficultyValue)) {
        return jsonError(
          "Difficulty must be beginner, intermediate, or advanced",
          422,
        );
      }

      updates.difficulty = difficultyValue;
    }

    if (body.deadline !== undefined) {
      const deadlineRaw = assertNonEmptyString(body.deadline, "Deadline");
      const deadline = new Date(deadlineRaw);

      if (Number.isNaN(deadline.getTime())) {
        return jsonError("Deadline must be a valid date", 422);
      }

      updates.deadline = deadline;
    }

    const [assignment] = await db()
      .update(assignments)
      .set(updates)
      .where(eq(assignments.id, assignmentId))
      .returning();

    return jsonSuccess({ assignment });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update assignment";

    return jsonError(message, 400);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (user.role !== "instructor") {
    return jsonError("Forbidden", 403);
  }

  const { assignmentId } = await context.params;
  const [assignment] = await db()
    .delete(assignments)
    .where(and(eq(assignments.id, assignmentId), eq(assignments.createdBy, user.id)))
    .returning({
      id: assignments.id,
      title: assignments.title,
    });

  if (!assignment) {
    return jsonError("Assignment not found", 404);
  }

  return jsonSuccess({ assignment });
}
