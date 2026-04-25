import { clearSessionCookie } from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/api";

export async function POST() {
    await clearSessionCookie();
    return jsonSuccess({ success: true });
}
