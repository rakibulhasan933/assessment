import { requireUser } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
