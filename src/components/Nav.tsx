"use client";

import { motion } from "framer-motion";
import { profile } from "@/lib/content";

const links = [
  ["Skills", "#skills"],
  ["Experience", "#experience"],
  ["Projects", "#projects"],
  ["Research", "#research"],
  ["Contact", "#contact"],
] as const;

export default function Nav() {
  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-gradient-to-b from-ground via-ground/70 to-transparent px-5 py-4 md:bg-none md:px-12"
    >
      <a href="#top" className="font-display text-xl tracking-wide">
        MB<span className="text-accent">.</span>
      </a>
      <ul className="hidden gap-1 rounded-full border border-white/10 bg-ground/60 px-2 py-1 backdrop-blur-md md:flex">
        {links.map(([label, href]) => (
          <li key={href}>
            <a href={href} className="block rounded-full px-4 py-1.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">
              {label}
            </a>
          </li>
        ))}
      </ul>
      <a
        href={`mailto:${profile.email}`}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ground transition hover:shadow-[0_0_24px_rgb(var(--accent)/0.6)]"
      >
        Hire me
      </a>
    </motion.nav>
  );
}
