import type { SubmissionStatus } from "@/lib/db/schema";

export const submissionStatusOptions: SubmissionStatus[] = [
  "pending",
  "accepted",
  "needs_improvement",
];

export function getSubmissionStatusLabel(status: SubmissionStatus) {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "needs_improvement":
      return "Needs Improvement";
    case "pending":
    default:
      return "Pending";
  }
}

export function getSubmissionStatusClasses(status: SubmissionStatus) {
  switch (status) {
    case "accepted":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "needs_improvement":
      return "border-amber-300 bg-amber-50 text-amber-700";
    case "pending":
    default:
      return "border-slate-300 bg-slate-100 text-slate-700";
  }
}
