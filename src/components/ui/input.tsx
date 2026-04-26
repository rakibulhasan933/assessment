import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-400 shadow-sm transition outline-none",
        "focus:border-cyan-400/40 focus:bg-white/[0.08] focus:ring-4 focus:ring-cyan-400/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
