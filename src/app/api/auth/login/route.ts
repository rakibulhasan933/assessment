import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { assertEmail, assertPassword } from "@/lib/auth/validation";
import { verifyPassword } from "@/lib/auth/password";
import { jsonError, jsonSuccess } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Record<string, unknown>;
        const email = assertEmail(body.email);
        const password = assertPassword(body.password);

        const user = await db().query.users.findFirst({
            where: eq(users.email, email),
            columns: {
                id: true,
                name: true,
                email: true,
                passwordHash: true,
                role: true,
            },
        });

        if (!user || !verifyPassword(password, user.passwordHash)) {
            return jsonError("Invalid email or password", 401);
        }

        await setSessionCookie({ userId: user.id, role: user.role });

        return jsonSuccess({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to login";

        return jsonError(message, 400);
    }
}
