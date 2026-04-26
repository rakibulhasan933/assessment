"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/dashboard/logout-button";
import type { UserRole } from "@/lib/db/schema";

type DashboardShellProps = {
  user: {
    name: string;
    email: string;
    role: UserRole;
  };
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  description: string;
};

const navByRole: Record<UserRole, NavItem[]> = {
  instructor: [
    {
      href: "/dashboard/instructor",
      label: "Workspace",
      description: "Create assignments and review submissions",
    },
    {
      href: "/dashboard/instructor/analytics",
      label: "Analytics",
      description: "See trends, difficult work, and acceptance",
    },
  ],
  student: [
    {
      href: "/dashboard/student",
      label: "Assignments",
      description: "Submit work and track feedback",
    },
  ],
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const navItems = navByRole[user.role];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#08111f_0%,#0d1730_100%)] text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-slate-950/70 px-5 py-6 backdrop-blur lg:w-[320px] lg:border-r lg:border-b-0 lg:px-6">
          <div className="flex items-start justify-between gap-4 lg:block">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-sm font-black text-slate-950">
                  PH
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-wide">
                    Programming Hero
                  </p>
                  <p className="text-xs text-slate-400">
                    Teaching operations platform
                  </p>
                </div>
              </Link>

              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  {user.role}
                </p>
                <p className="mt-3 text-lg font-semibold">{user.name}</p>
                <p className="mt-1 break-all text-sm text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="lg:hidden">
              <LogoutButton />
            </div>
          </div>

          <nav className="mt-6 space-y-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-[1.5rem] border px-4 py-4 transition",
                    isActive
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-50"
                      : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]",
                  )}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 hidden lg:block">
            <LogoutButton />
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  Role-aware workspace
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                  {user.role === "instructor"
                    ? "Instructor operations"
                    : "Student progress center"}
                </h1>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Protected routes and role-based access are active
              </div>
            </div>
          </header>

          <main className="px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
