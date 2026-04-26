import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["instructor", "student"]);
export const assignmentDifficultyEnum = pgEnum("assignment_difficulty", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "accepted",
  "needs_improvement",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: assignmentDifficultyEnum("difficulty").notNull(),
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    note: text("note"),
    status: submissionStatusEnum("status").notNull().default("pending"),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    studentAssignmentUniqueIdx: uniqueIndex("submissions_student_assignment_idx").on(
      table.assignmentId,
      table.studentId,
    ),
  }),
);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type AssignmentDifficulty =
  (typeof assignmentDifficultyEnum.enumValues)[number];
export type SubmissionStatus =
  (typeof submissionStatusEnum.enumValues)[number];
