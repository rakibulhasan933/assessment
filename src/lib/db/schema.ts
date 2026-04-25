import { pgEnum, pgTable, text, timestamp, uuid, } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["instructor", "student"]);

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


export type UserRole = (typeof userRoleEnum.enumValues)[number];
