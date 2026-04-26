"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getSubmissionStatusClasses,
  getSubmissionStatusLabel,
  submissionStatusOptions,
} from "@/lib/submissions";
import type {
  AssignmentDifficulty,
  SubmissionStatus,
} from "@/lib/db/schema";

type AssignmentRecord = {
  id: string;
  title: string;
  description: string;
  difficulty: AssignmentDifficulty;
  deadline: string;
  createdAt: string;
  updatedAt: string;
};

type SubmissionRecord = {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  assignmentDescription: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  url: string;
  note: string | null;
  status: SubmissionStatus;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
};

type InstructorWorkspaceProps = {
  assignments: AssignmentRecord[];
  submissions: SubmissionRecord[];
};

type AssignmentFormState = {
  title: string;
  description: string;
  difficulty: AssignmentDifficulty;
  deadline: string;
};

const emptyAssignmentForm: AssignmentFormState = {
  title: "",
  description: "",
  difficulty: "beginner",
  deadline: "",
};

export function InstructorWorkspace({
  assignments: initialAssignments,
  submissions: initialSubmissions,
}: InstructorWorkspaceProps) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignmentForm);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);
  const [isRefiningAssignment, setIsRefiningAssignment] = useState(false);
  const [reviewState, setReviewState] = useState<
    Record<string, { status: SubmissionStatus; feedback: string }>
  >(() =>
    Object.fromEntries(
      initialSubmissions.map((submission) => [
        submission.id,
        {
          status: submission.status,
          feedback: submission.feedback ?? "",
        },
      ]),
    ),
  );
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [savingReviewId, setSavingReviewId] = useState<string | null>(null);
  const [aiDraftId, setAiDraftId] = useState<string | null>(null);

  const overview = useMemo(() => {
    const accepted = submissions.filter((item) => item.status === "accepted").length;
    const pending = submissions.filter((item) => item.status === "pending").length;
    const needsImprovement = submissions.filter(
      (item) => item.status === "needs_improvement",
    ).length;

    return {
      assignments: assignments.length,
      submissions: submissions.length,
      accepted,
      pending,
      needsImprovement,
    };
  }, [assignments, submissions]);

  function updateAssignmentField<Key extends keyof AssignmentFormState>(
    key: Key,
    value: AssignmentFormState[Key],
  ) {
    setAssignmentForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function beginEditAssignment(assignment: AssignmentRecord) {
    setEditingAssignmentId(assignment.id);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      difficulty: assignment.difficulty,
      deadline: toDateTimeLocalValue(assignment.deadline),
    });
    setAssignmentError(null);
    setAssignmentMessage("Editing assignment details.");
  }

  function resetAssignmentForm() {
    setEditingAssignmentId(null);
    setAssignmentForm(emptyAssignmentForm);
    setAssignmentError(null);
  }

  async function handleAssignmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAssignmentError(null);
    setAssignmentMessage(null);
    setIsSavingAssignment(true);

    try {
      const endpoint = editingAssignmentId
        ? `/api/assignments/${editingAssignmentId}`
        : "/api/assignments";
      const method = editingAssignmentId ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...assignmentForm,
          deadline: new Date(assignmentForm.deadline).toISOString(),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        assignment?: AssignmentRecord;
      };

      if (!response.ok || !data.assignment) {
        setAssignmentError(data.error ?? "Unable to save assignment.");
        return;
      }

      const normalized = normalizeAssignment(data.assignment);
      setAssignments((current) =>
        editingAssignmentId
          ? current.map((item) => (item.id === normalized.id ? normalized : item))
          : [normalized, ...current],
      );
      resetAssignmentForm();
      setAssignmentMessage(
        editingAssignmentId
          ? "Assignment updated successfully."
          : "Assignment created successfully.",
      );
    } catch {
      setAssignmentError("Unable to save assignment right now.");
    } finally {
      setIsSavingAssignment(false);
    }
  }

  async function handleAssignmentDelete(assignmentId: string) {
    setAssignmentError(null);
    setAssignmentMessage(null);

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setAssignmentError(data.error ?? "Unable to delete assignment.");
        return;
      }

      setAssignments((current) => current.filter((item) => item.id !== assignmentId));
      setSubmissions((current) =>
        current.filter((item) => item.assignmentId !== assignmentId),
      );
      setAssignmentMessage("Assignment deleted.");

      if (editingAssignmentId === assignmentId) {
        resetAssignmentForm();
      }
    } catch {
      setAssignmentError("Unable to delete assignment right now.");
    }
  }

  async function handleRefineAssignment() {
    setAssignmentError(null);
    setAssignmentMessage(null);
    setIsRefiningAssignment(true);

    try {
      const response = await fetch("/api/ai/assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: assignmentForm.title,
          description: assignmentForm.description,
          difficulty: assignmentForm.difficulty,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        refinedTitle?: string;
        refinedDescription?: string;
        provider?: string;
      };

      if (!response.ok || !data.refinedDescription) {
        setAssignmentError(data.error ?? "Unable to refine assignment.");
        return;
      }

      setAssignmentForm((current) => ({
        ...current,
        title: data.refinedTitle ?? current.title,
        description: data.refinedDescription ?? current.description,
      }));
      setAssignmentMessage(
        `Assignment copy refined with ${data.provider ?? "AI"} assistance.`,
      );
    } catch {
      setAssignmentError("Unable to refine assignment right now.");
    } finally {
      setIsRefiningAssignment(false);
    }
  }

  function updateReviewField(
    submissionId: string,
    key: "status" | "feedback",
    value: string,
  ) {
    setReviewState((current) => ({
      ...current,
      [submissionId]: {
        status:
          key === "status"
            ? (value as SubmissionStatus)
            : current[submissionId]?.status ?? "pending",
        feedback:
          key === "feedback" ? value : current[submissionId]?.feedback ?? "",
      },
    }));
  }

  async function handleDraftFeedback(submission: SubmissionRecord) {
    setReviewError(null);
    setReviewMessage(null);
    setAiDraftId(submission.id);

    try {
      const response = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentTitle: submission.assignmentTitle,
          assignmentDescription: submission.assignmentDescription,
          submissionUrl: submission.url,
          submissionNote:
            submission.note ??
            "Student submitted work without a note. Provide concise feedback for a first review.",
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        feedback?: string;
        strengths?: string[];
        improvements?: string[];
        statusSuggestion?: SubmissionStatus;
      };

      if (!response.ok || !data.feedback) {
        setReviewError(data.error ?? "Unable to generate feedback draft.");
        return;
      }

      const draft = [
        data.feedback,
        data.strengths?.length ? `Strengths: ${data.strengths.join(" ")}` : null,
        data.improvements?.length
          ? `Improvements: ${data.improvements.join(" ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      setReviewState((current) => ({
        ...current,
        [submission.id]: {
          status: data.statusSuggestion ?? current[submission.id]?.status ?? "pending",
          feedback: draft,
        },
      }));
      setReviewMessage("AI drafted a review you can edit before publishing.");
    } catch {
      setReviewError("Unable to generate feedback right now.");
    } finally {
      setAiDraftId(null);
    }
  }

  async function handleReviewSubmit(submissionId: string) {
    const current = reviewState[submissionId];

    if (!current) {
      return;
    }

    setReviewError(null);
    setReviewMessage(null);
    setSavingReviewId(submissionId);

    try {
      const response = await fetch(
        `/api/instructor/submissions/${submissionId}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(current),
        },
      );
      const data = (await response.json()) as {
        error?: string;
        submission?: {
          id: string;
          status: SubmissionStatus;
          feedback: string | null;
          updatedAt: string;
        };
      };

      if (!response.ok || !data.submission) {
        setReviewError(data.error ?? "Unable to publish review.");
        return;
      }

      setSubmissions((currentSubmissions) =>
        currentSubmissions.map((item) =>
          item.id === submissionId
            ? {
                ...item,
                status: data.submission?.status ?? item.status,
                feedback: data.submission?.feedback ?? item.feedback,
                updatedAt: data.submission?.updatedAt ?? item.updatedAt,
              }
            : item,
        ),
      );
      setReviewMessage("Review updated successfully.");
    } catch {
      setReviewError("Unable to save review right now.");
    } finally {
      setSavingReviewId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Assignments" value={overview.assignments} />
        <MetricCard label="Submissions" value={overview.submissions} />
        <MetricCard label="Accepted" value={overview.accepted} />
        <MetricCard label="Pending" value={overview.pending} />
        <MetricCard label="Needs improvement" value={overview.needsImprovement} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>
              {editingAssignmentId ? "Edit assignment" : "Create assignment"}
            </CardTitle>
            <CardDescription>
              Publish structured work with a title, clarity-focused description,
              difficulty, and deadline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleAssignmentSubmit}>
              <Field label="Assignment title">
                <Input
                  value={assignmentForm.title}
                  onChange={(event) =>
                    updateAssignmentField("title", event.target.value)
                  }
                  placeholder="Build a full-stack typed API"
                  required
                />
              </Field>

              <Field label="Assignment description">
                <Textarea
                  value={assignmentForm.description}
                  onChange={(event) =>
                    updateAssignmentField("description", event.target.value)
                  }
                  placeholder="Describe the deliverable, expectations, and how success should be evaluated."
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Difficulty">
                  <select
                    value={assignmentForm.difficulty}
                    onChange={(event) =>
                      updateAssignmentField(
                        "difficulty",
                        event.target.value as AssignmentDifficulty,
                      )
                    }
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </Field>

                <Field label="Deadline">
                  <Input
                    type="datetime-local"
                    value={assignmentForm.deadline}
                    onChange={(event) =>
                      updateAssignmentField("deadline", event.target.value)
                    }
                    required
                  />
                </Field>
              </div>

              {assignmentError ? <Notice tone="error">{assignmentError}</Notice> : null}
              {assignmentMessage ? (
                <Notice tone="success">{assignmentMessage}</Notice>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRefineAssignment}
                  disabled={
                    isRefiningAssignment ||
                    assignmentForm.title.trim().length < 3 ||
                    assignmentForm.description.trim().length < 10
                  }
                  className="h-11 rounded-2xl border-white/10 bg-white/5 px-5 text-slate-100 hover:bg-white/10"
                >
                  {isRefiningAssignment ? "Refining copy..." : "Refine with AI"}
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingAssignment}
                  className="h-11 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                >
                  {isSavingAssignment
                    ? "Saving..."
                    : editingAssignmentId
                      ? "Update assignment"
                      : "Create assignment"}
                </Button>
                {editingAssignmentId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetAssignmentForm}
                    className="h-11 rounded-2xl px-5 text-slate-200 hover:bg-white/10"
                  >
                    Cancel editing
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Assignment library</CardTitle>
            <CardDescription>
              Maintain live assignments and adjust them as the cohort needs change.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignments.length === 0 ? (
              <EmptyState copy="No assignments yet. Your first published assignment will appear here." />
            ) : (
              assignments.map((assignment) => (
                <article
                  key={assignment.id}
                  className="rounded-[1.75rem] border border-white/10 bg-black/10 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{assignment.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {assignment.description}
                      </p>
                    </div>
                    <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                      {assignment.difficulty}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-400">
                      Deadline: {formatDateTime(assignment.deadline)}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => beginEditAssignment(assignment)}
                        className="h-10 rounded-2xl border-white/10 bg-white/5 px-4 text-slate-100 hover:bg-white/10"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleAssignmentDelete(assignment.id)}
                        className="h-10 rounded-2xl px-4"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Submission review queue</CardTitle>
          <CardDescription>
            Review student work, draft feedback with AI, and publish the final
            instructional response in real time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviewError ? <Notice tone="error">{reviewError}</Notice> : null}
          {reviewMessage ? <Notice tone="success">{reviewMessage}</Notice> : null}

          {submissions.length === 0 ? (
            <EmptyState copy="Student submissions will appear here once learners start turning in work." />
          ) : (
            submissions.map((submission) => {
              const currentReview = reviewState[submission.id] ?? {
                status: submission.status,
                feedback: submission.feedback ?? "",
              };

              return (
                <article
                  key={submission.id}
                  className="rounded-[1.9rem] border border-white/10 bg-black/10 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {submission.assignmentTitle}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {submission.studentName} · {submission.studentEmail}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getSubmissionStatusClasses(
                        submission.status,
                      )}`}
                    >
                      {getSubmissionStatusLabel(submission.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Submission URL
                        </p>
                        <a
                          href={submission.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block break-all text-sm text-cyan-200 underline-offset-4 hover:underline"
                        >
                          {submission.url}
                        </a>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Student note
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          {submission.note || "No student note provided."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Field label="Review status">
                        <select
                          value={currentReview.status}
                          onChange={(event) =>
                            updateReviewField(
                              submission.id,
                              "status",
                              event.target.value,
                            )
                          }
                          className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                        >
                          {submissionStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {getSubmissionStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Instructor feedback">
                        <Textarea
                          value={currentReview.feedback}
                          onChange={(event) =>
                            updateReviewField(
                              submission.id,
                              "feedback",
                              event.target.value,
                            )
                          }
                          placeholder="Share what was strong, what to improve, and what the student should do next."
                        />
                      </Field>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDraftFeedback(submission)}
                          disabled={aiDraftId === submission.id}
                          className="h-11 rounded-2xl border-white/10 bg-white/5 px-4 text-slate-100 hover:bg-white/10"
                        >
                          {aiDraftId === submission.id
                            ? "Drafting..."
                            : "Draft feedback with AI"}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleReviewSubmit(submission.id)}
                          disabled={savingReviewId === submission.id}
                          className="h-11 rounded-2xl bg-cyan-400 px-4 text-slate-950 hover:bg-cyan-300"
                        >
                          {savingReviewId === submission.id
                            ? "Publishing..."
                            : "Publish review"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
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

function EmptyState({ copy }: { copy: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-black/10 p-5 text-sm leading-6 text-slate-400">
      {copy}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60_000);

  return normalized.toISOString().slice(0, 16);
}

function normalizeAssignment(assignment: AssignmentRecord) {
  return {
    ...assignment,
    deadline: new Date(assignment.deadline).toISOString(),
    createdAt: new Date(assignment.createdAt).toISOString(),
    updatedAt: new Date(assignment.updatedAt).toISOString(),
  };
}
