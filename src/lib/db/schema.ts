import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});