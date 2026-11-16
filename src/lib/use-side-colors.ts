"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PALETTE, isPalette, palettes, type PaletteName, type Side, type SideColors } from "@/lib/palettes";

// Hex colours for code that can't use CSS variables (three.js materials, framer colour tweens).
export function useSideColors(side: Side): SideColors {
  const [name, setName] = useState<PaletteName>(DEFAULT_PALETTE);
  useEffect(() => {
    const current = document.documentElement.dataset.palette;
    if (isPalette(current)) setName(current);
  }, []);
  return palettes[name][side];
}
