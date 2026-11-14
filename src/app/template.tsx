"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { navState } from "@/lib/nav-state";

const LABELS: Record<string, string> = { "/personal": "PERSONAL", "/professional": "PROFESSIONAL" };
const EASE = [0.76, 0, 0.24, 1] as const;


// Wraps every page. The curtain only plays on in-site navigation, never on a fresh load.
// Switching sides sweeps a curtain carrying the page name up and away.
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [navigated] = useState(() => navState.mounted);
  const curtain = navigated && !reduce;
  useEffect(() => {
    navState.mounted = true;
  }, []);

  return (
    <>
      {curtain && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-ground"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
        >
          <motion.span
            className="font-display text-[14vw] leading-none text-white md:text-[9vw]"
            initial={{ y: "40%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {LABELS[pathname] ?? ""}
          </motion.span>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: curtain ? 0 : 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: curtain ? 0.4 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}
