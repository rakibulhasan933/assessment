import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import type { UserRole } from "@/lib/db/schema";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireUser();

  if (user.role !== role) {
    redirect(user.role === "instructor" ? "/dashboard/instructor" : "/dashboard/student");
  }

  return user;
}
