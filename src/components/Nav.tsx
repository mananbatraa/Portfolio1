"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SideSwitch from "@/components/SideSwitch";
import { TextRoll } from "@/components/ui/text-roll";
import { profile } from "@/lib/content";

// `solid` keeps a dark fade behind the bar on wide screens too, for pages without the laptop film.
export default function Nav({ solid = false }: { solid?: boolean }) {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 bg-gradient-to-b from-ground via-ground/80 to-transparent px-4 py-4 md:px-12 ${solid ? "pb-8" : "md:bg-none"}`}
    >
      <motion.div initial="initial" whileHover="hovered">
        <Link href="/" className="font-display text-xl tracking-wide">
          <TextRoll inherit>MB</TextRoll>
          <span className="text-accent">.</span>
        </Link>
      </motion.div>
      <SideSwitch />
      <a
        href={`mailto:${profile.email}`}
        className="hidden rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ground transition hover:shadow-[0_0_24px_rgb(var(--accent)/0.6)] sm:block"
      >
        <TextRoll center>Hire me</TextRoll>
      </a>
    </motion.header>
  );
}
