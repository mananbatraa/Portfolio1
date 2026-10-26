import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// Cards lift on hover, a key-light sheen sweeps across, and the corner ticks light up.
export default function SheenCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-ground/70 p-6 backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:border-accent/40",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
      {(["left-2 top-2 border-l border-t", "right-2 top-2 border-r border-t", "left-2 bottom-2 border-l border-b", "right-2 bottom-2 border-r border-b"] as const).map((pos) => (
        <span key={pos} className={cn("absolute h-2.5 w-2.5 border-white/20 transition-colors group-hover:border-accent", pos)} />
      ))}
      <div className="relative">{children}</div>
    </div>
  );
}
