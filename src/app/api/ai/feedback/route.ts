import { jsonError, jsonSuccess } from "@/lib/api";
import { assertNonEmptyString } from "@/lib/auth/validation";
import { generateSubmissionFeedback } from "@/lib/ai/feedback";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const submissionNote = assertNonEmptyString(
      body.submissionNote,
      "Submission note",
      10,
    );
    const assignmentTitle =
      typeof body.assignmentTitle === "string" ? body.assignmentTitle : undefined;
    const assignmentDescription =
      typeof body.assignmentDescription === "string"
        ? body.assignmentDescription
        : undefined;
    const submissionUrl =
      typeof body.submissionUrl === "string" ? body.submissionUrl : undefined;

    const feedback = await generateSubmissionFeedback({
      assignmentTitle,
      assignmentDescription,
      submissionUrl,
      submissionNote,
    });

    return jsonSuccess(feedback);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate feedback";

    return jsonError(message, 400);
  }
}
