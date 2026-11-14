"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const SIDES = [
  { label: "Home", short: "Home", href: "/" },
  { label: "Personal", short: "Me", href: "/personal" },
  { label: "Professional", short: "Work", href: "/professional" },
] as const;

// The segmented switch between the home film, the personal side and the professional side.
// The highlight pill glides between options with a shared layout animation.
export default function SideSwitch({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Sides" className={cn("relative flex rounded-full border border-white/10 bg-ground/60 p-1 backdrop-blur-md", className)}>
      {SIDES.map((side) => {
        const active = pathname === side.href;
        return (
          <Link
            key={side.href}
            href={side.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:px-4",
              active ? "text-ground" : "text-white/70 hover:text-white",
            )}
          >
            {active && (
              <motion.span
                layoutId="side-pill"
                className="absolute inset-0 rounded-full bg-accent shadow-[0_0_24px_rgb(var(--accent)/0.5)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative font-medium">
              <span className="sm:hidden">{side.short}</span>
              <span className="hidden sm:inline">{side.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
