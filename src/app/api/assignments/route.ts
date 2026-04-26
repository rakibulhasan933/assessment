import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jsonError, jsonSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import {
  assertNonEmptyString,
  isAssignmentDifficulty,
} from "@/lib/auth/validation";
import { assignments, users } from "@/lib/db/schema";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const rows = await db()
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      difficulty: assignments.difficulty,
      deadline: assignments.deadline,
      createdAt: assignments.createdAt,
      updatedAt: assignments.updatedAt,
      instructorId: users.id,
      instructorName: users.name,
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.createdBy, users.id))
    .orderBy(desc(assignments.deadline));

  return jsonSuccess({ assignments: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (user.role !== "instructor") {
    return jsonError("Forbidden", 403);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const title = assertNonEmptyString(body.title, "Title", 3);
    const description = assertNonEmptyString(body.description, "Description", 10);
    const difficultyValue = assertNonEmptyString(body.difficulty, "Difficulty");
    const deadlineRaw = assertNonEmptyString(body.deadline, "Deadline");

    if (!isAssignmentDifficulty(difficultyValue)) {
      return jsonError("Difficulty must be beginner, intermediate, or advanced", 422);
    }

    const deadline = new Date(deadlineRaw);

    if (Number.isNaN(deadline.getTime())) {
      return jsonError("Deadline must be a valid date", 422);
    }

    const [assignment] = await db()
      .insert(assignments)
      .values({
        title,
        description,
        difficulty: difficultyValue,
        deadline,
        createdBy: user.id,
      })
      .returning();

    return jsonSuccess({ assignment }, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create assignment";

    return jsonError(message, 400);
  }
}
