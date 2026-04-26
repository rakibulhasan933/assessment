"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  function handleLogout() {
    setIsPending(true);

    startTransition(async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
      } finally {
        router.push("/login");
        router.refresh();
        setIsPending(false);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
      className="h-11 rounded-2xl border-white/10 bg-white/5 px-4 text-slate-100 hover:bg-white/10"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
