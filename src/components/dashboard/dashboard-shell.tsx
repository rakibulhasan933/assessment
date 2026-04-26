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
    <div className="min-h-screen bg-gradient-to-b from-[#08111f] to-[#0d1730] text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">

        {/* ── Sidebar ── */}
        <aside className="flex flex-col gap-4 border-b border-white/8 bg-white/[0.03] px-5 py-6 backdrop-blur-sm lg:w-[280px] lg:border-r lg:border-b-0 lg:px-6">

          {/* Logo + mobile logout row */}
          <div className="flex items-start justify-between gap-4 lg:block">
            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-[11px] font-bold tracking-wide text-slate-950">
                PH
              </span>
              <div>
                <p className="text-sm font-medium text-slate-100">Programming Hero</p>
                <p className="text-[11px] text-slate-500">Teaching operations platform</p>
              </div>
            </Link>
            <div className="lg:hidden">
              <LogoutButton />
            </div>
          </div>

          {/* User card */}
          <div className="rounded-xl border border-white/8 bg-white/[0.04] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-400">
              {user.role}
            </p>
            <p className="mt-2.5 text-[15px] font-medium text-slate-100">{user.name}</p>
            <p className="mt-1 break-all text-[12px] text-slate-500">{user.email}</p>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1.5">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              Navigation
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-xl border px-4 py-3 transition-colors duration-100",
                    isActive
                      ? "border-cyan-400/25 bg-cyan-400/[0.07] text-cyan-50"
                      : "border-white/8 bg-transparent text-slate-300 hover:bg-white/[0.05]",
                  )}
                >
                  <p className={cn("text-[13px] font-medium", isActive && "text-cyan-400")}>
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-[1.5] text-slate-500">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </nav>

          {/* Spacer + desktop logout */}
          <div className="mt-auto hidden lg:block">
            <LogoutButton />
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex flex-1 flex-col">
          <header className="border-b border-white/8 px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-400">
              Role-aware workspace
            </p>
            <h1 className="mt-1.5 text-xl font-medium tracking-tight text-slate-100">
              {user.role === "instructor"
                ? "Instructor operations"
                : "Student progress center"}
            </h1>
          </header>

          <main className="flex-1 px-6 py-8">{children}</main>
        </div>

      </div>
    </div>
  );
}