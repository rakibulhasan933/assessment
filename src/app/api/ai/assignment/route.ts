import { jsonError, jsonSuccess } from "@/lib/api";
import {
  assertNonEmptyString,
  isAssignmentDifficulty,
} from "@/lib/auth/validation";
import { refineAssignmentCopy } from "@/lib/ai/assignment";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const title = assertNonEmptyString(body.title, "Title", 3);
    const description = assertNonEmptyString(body.description, "Description", 10);
    const difficultyValue = assertNonEmptyString(body.difficulty, "Difficulty");

    if (!isAssignmentDifficulty(difficultyValue)) {
      return jsonError("Difficulty must be beginner, intermediate, or advanced", 422);
    }

    const result = await refineAssignmentCopy({
      title,
      description,
      difficulty: difficultyValue,
    });

    return jsonSuccess(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to refine assignment";

    return jsonError(message, 400);
  }
}
