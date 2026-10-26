"use client";

import GlassDock, { type DockItem } from "@/components/ui/glass-dock";
import { profile } from "@/lib/content";

// The dock renders its own morphing icons for these titles, so `icon` is never drawn.
const NoIcon = () => null;

const items: DockItem[] = [
  { title: "Home", icon: NoIcon, href: "#top" },
  { title: "GitHub", icon: NoIcon, href: profile.github },
  { title: "LinkedIn", icon: NoIcon, href: profile.linkedin },
  { title: "Email", icon: NoIcon, href: `mailto:${profile.email}` },
].filter((item) => item.href);

export default function Dock() {
  return (
    <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center">
      <GlassDock items={items} dockClassName="bg-ground/70 dark:bg-ground/70 px-4 py-2" />
    </div>
  );
}
