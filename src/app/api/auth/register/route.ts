import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jsonError, jsonSuccess } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import {
    assertEmail,
    assertNonEmptyString,
    assertPassword,
    isUserRole,
} from "@/lib/auth/validation";
import { users } from "@/lib/db/schema";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Record<string, unknown>;
        const name = assertNonEmptyString(body.name, "Name", 2);
        const email = assertEmail(body.email);
        const password = assertPassword(body.password);
        const roleValue = assertNonEmptyString(body.role, "Role");

        if (!isUserRole(roleValue)) {
            return jsonError("Role must be instructor or student", 422);
        }

        const existingUser = await db().query.users.findFirst({
            where: eq(users.email, email),
            columns: { id: true },
        });

        if (existingUser) {
            return jsonError("An account with this email already exists", 409);
        }

        const [user] = await db()
            .insert(users)
            .values({
                name,
                email,
                passwordHash: hashPassword(password),
                role: roleValue,
            })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
            });

        await setSessionCookie({ userId: user.id, role: user.role });

        return jsonSuccess({ user }, 201);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unable to create account";

        return jsonError(message, 400);
    }
}
