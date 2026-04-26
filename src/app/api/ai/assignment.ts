import type { AssignmentDifficulty } from "@/lib/db/schema";

type AssignmentRefinementInput = {
  title: string;
  description: string;
  difficulty: AssignmentDifficulty;
};

type AssignmentRefinementOutput = {
  refinedTitle: string;
  refinedDescription: string;
  teachingNotes: string[];
  provider: "gateway" | "mock";
};

function buildPrompt(input: AssignmentRefinementInput) {
  return [
    "You are helping a technical instructor publish a clearer programming assignment.",
    "Rewrite the assignment so expectations are concrete, teachable, and easy to evaluate.",
    "Return strict JSON with keys: refinedTitle, refinedDescription, teachingNotes.",
    `Difficulty: ${input.difficulty}`,
    `Title: ${input.title}`,
    `Description: ${input.description}`,
    "The refinedDescription should stay concise, structured, and practical.",
  ].join("\n");
}

function buildMockRefinement(
  input: AssignmentRefinementInput,
): AssignmentRefinementOutput {
  const refinedTitle =
    input.title.trim().length >= 8
      ? input.title.trim()
      : `${input.difficulty[0].toUpperCase()}${input.difficulty.slice(1)} assignment`;

  const refinedDescription = [
    `Build a ${input.difficulty}-level solution for "${refinedTitle}".`,
    input.description.trim(),
    "Your submission should explain the approach, include a working deliverable link, and mention how you tested the final result.",
    "Evaluation should focus on correctness, code quality, and how clearly the implementation decisions are documented.",
  ].join("\n\n");

  return {
    refinedTitle,
    refinedDescription,
    teachingNotes: [
      "Clarify the expected deliverable so students know what to submit.",
      "Ask for testing evidence to make review faster and more consistent.",
      "Mention evaluation criteria so feedback aligns with the assignment goals.",
    ],
    provider: "mock",
  };
}

export async function refineAssignmentCopy(
  input: AssignmentRefinementInput,
): Promise<AssignmentRefinementOutput> {
  const apiKey = process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return buildMockRefinement(input);
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
              "You improve assignment descriptions for instructors and return JSON only.",
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
      return buildMockRefinement(input);
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
      return buildMockRefinement(input);
    }

    const parsed = JSON.parse(content) as {
      refinedTitle?: string;
      refinedDescription?: string;
      teachingNotes?: string[];
    };

    return {
      refinedTitle: parsed.refinedTitle?.trim() || input.title.trim(),
      refinedDescription:
        parsed.refinedDescription?.trim() || buildMockRefinement(input).refinedDescription,
      teachingNotes: Array.isArray(parsed.teachingNotes) ? parsed.teachingNotes : [],
      provider: "gateway",
    };
  } catch {
    return buildMockRefinement(input);
  }
}
