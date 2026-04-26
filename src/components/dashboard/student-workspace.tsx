"use client";

import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getSubmissionStatusClasses,
  getSubmissionStatusLabel,
} from "@/lib/submissions";
import type { SubmissionStatus } from "@/lib/db/schema";

type AssignmentRecord = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  deadline: string;
  instructorName: string;
};

type SubmissionRecord = {
  id: string;
  assignmentId: string;
  url: string;
  note: string | null;
  status: SubmissionStatus;
  feedback: string | null;
  updatedAt: string;
};

type StudentWorkspaceProps = {
  assignments: AssignmentRecord[];
  submissions: SubmissionRecord[];
};

export function StudentWorkspace({
  assignments,
  submissions: initialSubmissions,
}: StudentWorkspaceProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [formState, setFormState] = useState<
    Record<string, { url: string; note: string }>
  >(() =>
    Object.fromEntries(
      assignments.map((assignment) => {
        const existing = initialSubmissions.find(
          (submission) => submission.assignmentId === assignment.id,
        );

        return [
          assignment.id,
          {
            url: existing?.url ?? "",
            note: existing?.note ?? "",
          },
        ];
      }),
    ),
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submissionsByAssignment = new Map(
    submissions.map((submission) => [submission.assignmentId, submission]),
  );

  function updateField(
    assignmentId: string,
    key: "url" | "note",
    value: string,
  ) {
    setFormState((current) => ({
      ...current,
      [assignmentId]: {
        url: key === "url" ? value : current[assignmentId]?.url ?? "",
        note: key === "note" ? value : current[assignmentId]?.note ?? "",
      },
    }));
  }

  async function handleAiAssist(assignment: AssignmentRecord) {
    const current = formState[assignment.id];

    if (!current || current.note.trim().length < 10) {
      setError("Write a bit more detail in your note before asking for AI help.");
      setMessage(null);
      return;
    }

    setAssistantId(assignment.id);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentTitle: assignment.title,
          assignmentDescription: assignment.description,
          submissionUrl: current.url,
          submissionNote: current.note,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        feedback?: string;
        strengths?: string[];
        improvements?: string[];
      };

      if (!response.ok) {
        setError(data.error ?? "Unable to get AI suggestions.");
        return;
      }

      const suggestedNote = [
        current.note.trim(),
        data.strengths?.length
          ? `Strengths already shown: ${data.strengths.join(" ")}`
          : null,
        data.improvements?.length
          ? `Add this context before submitting: ${data.improvements.join(" ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      setFormState((currentState) => ({
        ...currentState,
        [assignment.id]: {
          ...currentState[assignment.id],
          note: suggestedNote,
        },
      }));
      setMessage("AI suggestions were added to your note draft. Edit them before sending.");
    } catch {
      setError("Unable to get AI suggestions right now.");
    } finally {
      setAssistantId(null);
    }
  }

  function handleSubmit(assignment: AssignmentRecord) {
    const current = formState[assignment.id];

    if (!current) {
      return;
    }

    setSavingId(assignment.id);
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignmentId: assignment.id,
            url: current.url,
            note: current.note,
          }),
        });
        const data = (await response.json()) as {
          error?: string;
          submission?: SubmissionRecord;
        };

        if (!response.ok || !data.submission) {
          setError(data.error ?? "Unable to submit assignment.");
          return;
        }

        const normalized = {
          ...data.submission,
          updatedAt: new Date(data.submission.updatedAt).toISOString(),
        };

        setSubmissions((currentSubmissions) => {
          const existingIndex = currentSubmissions.findIndex(
            (submission) => submission.assignmentId === assignment.id,
          );

          if (existingIndex === -1) {
            return [normalized, ...currentSubmissions];
          }

          const next = [...currentSubmissions];
          next[existingIndex] = normalized;
          return next;
        });
        setMessage("Submission saved. Your instructor can now review the latest version.");
      } catch {
        setError("Unable to submit assignment right now.");
      } finally {
        setSavingId(null);
      }
    });
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Available assignments" value={assignments.length} />
        <MetricCard label="Submitted" value={submissions.length} />
        <MetricCard
          label="Accepted"
          value={submissions.filter((item) => item.status === "accepted").length}
        />
      </section>

      {error ? <Notice tone="error">{error}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}

      <section className="grid gap-6">
        {assignments.length === 0 ? (
          <Card className="border-white/10 bg-white/5">
            <CardContent className="pt-6 text-sm text-slate-300">
              There are no assignments available yet.
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => {
            const submission = submissionsByAssignment.get(assignment.id);
            const form = formState[assignment.id] ?? { url: "", note: "" };

            return (
              <Card key={assignment.id} className="border-white/10 bg-white/5">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>{assignment.title}</CardTitle>
                      <CardDescription className="mt-2 max-w-3xl text-slate-300">
                        {assignment.description}
                      </CardDescription>
                    </div>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                      {assignment.difficulty}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoTile label="Instructor" value={assignment.instructorName} />
                    <InfoTile
                      label="Deadline"
                      value={new Date(assignment.deadline).toLocaleString()}
                    />
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Current status
                      </p>
                      {submission ? (
                        <span
                          className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getSubmissionStatusClasses(
                            submission.status,
                          )}`}
                        >
                          {getSubmissionStatusLabel(submission.status)}
                        </span>
                      ) : (
                        <p className="mt-3 text-sm text-slate-200">Not submitted yet</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
                    <div className="space-y-4">
                      <Field label="Project URL">
                        <Input
                          value={form.url}
                          onChange={(event) =>
                            updateField(assignment.id, "url", event.target.value)
                          }
                          placeholder="https://github.com/username/repo or deployed app URL"
                        />
                      </Field>

                      <Field label="Submission note">
                        <Textarea
                          value={form.note}
                          onChange={(event) =>
                            updateField(assignment.id, "note", event.target.value)
                          }
                          placeholder="Explain what you built, how you tested it, and any known limitations."
                        />
                      </Field>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAiAssist(assignment)}
                          disabled={assistantId === assignment.id}
                          className="h-11 rounded-2xl border-white/10 bg-white/5 px-5 text-slate-100 hover:bg-white/10"
                        >
                          {assistantId === assignment.id
                            ? "Improving..."
                            : "Improve note with AI"}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleSubmit(assignment)}
                          disabled={savingId === assignment.id}
                          className="h-11 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                        >
                          {savingId === assignment.id
                            ? "Submitting..."
                            : submission
                              ? "Update submission"
                              : "Submit work"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[1.75rem] border border-white/10 bg-black/10 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Progress snapshot
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-200">
                          {submission
                            ? `Last updated ${new Date(
                                submission.updatedAt,
                              ).toLocaleString()}.`
                            : "Use the note field to document your approach before you submit."}
                        </p>
                        {submission?.feedback ? (
                          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                              Instructor feedback
                            </p>
                            <p className="mt-2 text-sm leading-6 text-cyan-50">
                              {submission.feedback}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-4 text-sm leading-6 text-slate-400">
                            Instructor feedback will appear here after review.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function Notice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "success" | "error";
}) {
  return (
    <div
      className={
        tone === "success"
          ? "rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
          : "rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
      }
    >
      {children}
    </div>
  );
}
