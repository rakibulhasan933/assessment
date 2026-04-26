import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  assignments,
  submissions,
  type AssignmentDifficulty,
  type SubmissionStatus,
} from "@/lib/db/schema";

type StatusSummary = {
  status: SubmissionStatus;
  label: string;
  count: number;
};

type DifficultySummary = {
  difficulty: AssignmentDifficulty;
  label: string;
  totalAssignments: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  pendingSubmissions: number;
  needsImprovementSubmissions: number;
  acceptanceRate: number;
};

type AssignmentInsight = {
  assignmentId: string;
  title: string;
  difficulty: AssignmentDifficulty;
  totalSubmissions: number;
  acceptedSubmissions: number;
  pendingSubmissions: number;
  needsImprovementSubmissions: number;
  acceptanceRate: number;
};

export type InstructorAnalytics = {
  overview: {
    totalAssignments: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    pendingSubmissions: number;
    needsImprovementSubmissions: number;
    acceptanceRate: number;
  };
  statusDistribution: StatusSummary[];
  difficultyPerformance: DifficultySummary[];
  mostDifficultAssignments: AssignmentInsight[];
  assignmentAcceptanceRates: AssignmentInsight[];
};

const statusLabels: Record<SubmissionStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  needs_improvement: "Needs Improvement",
};

const difficultyLabels: Record<AssignmentDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function toRate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(1));
}

export async function getInstructorAnalytics(
  instructorId: string,
): Promise<InstructorAnalytics> {
  const assignmentRows = await db()
    .select({
      id: assignments.id,
      title: assignments.title,
      difficulty: assignments.difficulty,
    })
    .from(assignments)
    .where(eq(assignments.createdBy, instructorId));

  const submissionRows = await db()
    .select({
      id: submissions.id,
      assignmentId: submissions.assignmentId,
      status: submissions.status,
    })
    .from(submissions)
    .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
    .where(eq(assignments.createdBy, instructorId));

  const statusCounts: Record<SubmissionStatus, number> = {
    pending: 0,
    accepted: 0,
    needs_improvement: 0,
  };

  for (const submission of submissionRows) {
    statusCounts[submission.status] += 1;
  }

  const statusDistribution: StatusSummary[] = [
    "accepted",
    "pending",
    "needs_improvement",
  ].map((status) => ({
    status,
    label: statusLabels[status],
    count: statusCounts[status],
  }));

  const assignmentMap = new Map(
    assignmentRows.map((assignment) => [
      assignment.id,
      {
        assignmentId: assignment.id,
        title: assignment.title,
        difficulty: assignment.difficulty,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        pendingSubmissions: 0,
        needsImprovementSubmissions: 0,
        acceptanceRate: 0,
      } satisfies AssignmentInsight,
    ]),
  );

  for (const submission of submissionRows) {
    const current = assignmentMap.get(submission.assignmentId);

    if (!current) {
      continue;
    }

    current.totalSubmissions += 1;

    if (submission.status === "accepted") {
      current.acceptedSubmissions += 1;
    } else if (submission.status === "pending") {
      current.pendingSubmissions += 1;
    } else {
      current.needsImprovementSubmissions += 1;
    }
  }

  const assignmentInsights = Array.from(assignmentMap.values()).map((assignment) => ({
    ...assignment,
    acceptanceRate: toRate(
      assignment.acceptedSubmissions,
      assignment.totalSubmissions,
    ),
  }));

  const difficultyPerformance: DifficultySummary[] = [
    "beginner",
    "intermediate",
    "advanced",
  ].map((difficulty) => {
    const relevantAssignments = assignmentInsights.filter(
      (assignment) => assignment.difficulty === difficulty,
    );

    const totalAssignments = relevantAssignments.length;
    const totalSubmissions = relevantAssignments.reduce(
      (sum, assignment) => sum + assignment.totalSubmissions,
      0,
    );
    const acceptedSubmissions = relevantAssignments.reduce(
      (sum, assignment) => sum + assignment.acceptedSubmissions,
      0,
    );
    const pendingSubmissions = relevantAssignments.reduce(
      (sum, assignment) => sum + assignment.pendingSubmissions,
      0,
    );
    const needsImprovementSubmissions = relevantAssignments.reduce(
      (sum, assignment) => sum + assignment.needsImprovementSubmissions,
      0,
    );

    return {
      difficulty,
      label: difficultyLabels[difficulty],
      totalAssignments,
      totalSubmissions,
      acceptedSubmissions,
      pendingSubmissions,
      needsImprovementSubmissions,
      acceptanceRate: toRate(acceptedSubmissions, totalSubmissions),
    };
  });

  const totalSubmissions = submissionRows.length;
  const acceptedSubmissions = statusCounts.accepted;
  const pendingSubmissions = statusCounts.pending;
  const needsImprovementSubmissions = statusCounts.needs_improvement;

  const sortedByDifficulty = [...assignmentInsights].sort((left, right) => {
    if (left.acceptanceRate !== right.acceptanceRate) {
      return left.acceptanceRate - right.acceptanceRate;
    }

    if (left.needsImprovementSubmissions !== right.needsImprovementSubmissions) {
      return right.needsImprovementSubmissions - left.needsImprovementSubmissions;
    }

    return right.totalSubmissions - left.totalSubmissions;
  });

  const sortedByAcceptance = [...assignmentInsights].sort(
    (left, right) => right.acceptanceRate - left.acceptanceRate,
  );

  return {
    overview: {
      totalAssignments: assignmentRows.length,
      totalSubmissions,
      acceptedSubmissions,
      pendingSubmissions,
      needsImprovementSubmissions,
      acceptanceRate: toRate(acceptedSubmissions, totalSubmissions),
    },
    statusDistribution,
    difficultyPerformance,
    mostDifficultAssignments: sortedByDifficulty.slice(0, 5),
    assignmentAcceptanceRates: sortedByAcceptance,
  };
}
