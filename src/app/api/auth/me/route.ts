import { getCurrentUser } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/api";

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return jsonError("Unauthorized", 401);
    }

    return jsonSuccess({ user });
}
