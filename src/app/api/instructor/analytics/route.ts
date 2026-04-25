import { jsonError, jsonSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { getInstructorAnalytics } from "@/lib/analytics";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (user.role !== "instructor") {
    return jsonError("Forbidden", 403);
  }

  const analytics = await getInstructorAnalytics(user.id);

  return jsonSuccess({ analytics });
}
