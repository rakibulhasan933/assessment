type FeedbackInput = {
  assignmentTitle?: string;
  assignmentDescription?: string;
  submissionUrl?: string;
  submissionNote: string;
};

type FeedbackOutput = {
  feedback: string;
  strengths: string[];
  improvements: string[];
  statusSuggestion: "pending" | "accepted" | "needs_improvement";
  provider: "gateway" | "mock";
};

function buildPrompt(input: FeedbackInput) {
  return [
    "You are assisting an instructor on an assignment platform.",
    "Generate concise, practical feedback about the student's submission note.",
    "Return strict JSON with keys: feedback, strengths, improvements, statusSuggestion.",
    `Assignment Title: ${input.assignmentTitle ?? "Unknown assignment"}`,
    `Assignment Description: ${input.assignmentDescription ?? "No description provided"}`,
    `Submission URL: ${input.submissionUrl ?? "No URL provided"}`,
    `Submission Note: ${input.submissionNote}`,
    "Allowed statusSuggestion values: pending, accepted, needs_improvement.",
  ].join("\n");
}

function buildMockFeedback(input: FeedbackInput): FeedbackOutput {
  const note = input.submissionNote.trim();
  const lowerNote = note.toLowerCase();
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (note.length > 80) {
    strengths.push("The note provides useful implementation context instead of a one-line summary.");
  } else {
    improvements.push("Expand the note with implementation details, approach, and any tradeoffs.");
  }

  if (/(tested|verified|validated|checked)/.test(lowerNote)) {
    strengths.push("The student mentions some verification work, which helps instructor review.");
  } else {
    improvements.push("Mention how the work was tested so the instructor can review it faster.");
  }

  if (/(challenge|issue|limitation|tradeoff|next)/.test(lowerNote)) {
    strengths.push("The note surfaces constraints or next steps, which shows thoughtful reflection.");
  } else {
    improvements.push("Call out any limitations, blockers, or next steps to make the update more actionable.");
  }

  const statusSuggestion =
    improvements.length >= 2 ? "needs_improvement" : "accepted";

  return {
    feedback:
      statusSuggestion === "accepted"
        ? "The submission note is clear and gives enough context for review. It explains the work with reasonable detail and helps an instructor understand what was completed."
        : "The submission note has a workable start, but it needs more concrete detail before review is efficient. Add implementation context, validation steps, and any remaining limitations.",
    strengths: strengths.length > 0 ? strengths : ["The student provided a submission note and supporting URL."],
    improvements:
      improvements.length > 0
        ? improvements
        : ["Consider adding a short summary of verification results to make the review even easier."],
    statusSuggestion,
    provider: "mock",
  };
}

export async function generateSubmissionFeedback(
  input: FeedbackInput,
): Promise<FeedbackOutput> {
  const apiKey = process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return buildMockFeedback(input);
  }

  try {
    const baseUrl = "https://ai-gateway.vercel.sh/v1";
    const model = process.env.AI_MODEL ?? "openai/gpt-5.2";

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You generate structured instructor feedback for student assignment submissions.",
          },
          {
            role: "user",
            content: buildPrompt(input),
          },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      return buildMockFeedback(input);
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return buildMockFeedback(input);
    }

    const parsed = JSON.parse(content) as Omit<FeedbackOutput, "provider">;

    return {
      feedback: parsed.feedback,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      statusSuggestion:
        parsed.statusSuggestion === "accepted" ||
        parsed.statusSuggestion === "needs_improvement" ||
        parsed.statusSuggestion === "pending"
          ? parsed.statusSuggestion
          : "pending",
      provider: "gateway",
    };
  } catch {
    return buildMockFeedback(input);
  }
}
