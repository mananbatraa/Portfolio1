"use client";

import { motion, useReducedMotion } from "framer-motion";

// Byte, the site's guide: an original pixel-art robot drawn from a grid.
// Each character in a row is one pixel: . empty, o outline, b body, s screen, e eye, a accent, l light.
const SPRITE = [
  "......l.......",
  "......a.......",
  "......o.......",
  "..oooooooooo..",
  ".obbbbbbbbbbo.",
  ".obssssssssbo.",
  "obbseesseesbbo",
  "obbseesseesbbo",
  "obbssssssssbbo",
  "obbsssaasssbbo",
  ".obbbbbbbbbbo.",
  "..oooooooooo..",
  "...obbbbbbo...",
  "..obbaaaabbo..",
  ".obbbaaaabbbo.",
  ".ob.obbbbo.bo.",
  "..o.oo..oo.o..",
];

const COLORS: Record<string, string> = {
  o: "#0b1a22",
  b: "#d9e6ee",
  s: "#0d2a35",
  e: "rgb(62 230 255)",
  a: "rgb(62 230 255)",
  l: "#ffd166",
};

type Props = { talking: boolean; mood?: "idle" | "happy" };

export default function Byte({ talking, mood = "idle" }: Props) {
  const reduce = useReducedMotion();
  const w = SPRITE[0].length;
  const h = SPRITE.length;

  return (
    <motion.div
      className="relative"
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glow under the hover-bot. */}
      <motion.div
        aria-hidden
        className="absolute -bottom-6 left-1/2 h-4 w-2/3 -translate-x-1/2 rounded-full bg-accent/40 blur-md"
        animate={reduce ? undefined : { scaleX: [1, 0.8, 1], opacity: [0.7, 0.4, 0.7] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-40 drop-shadow-[0_0_24px_rgb(62_230_255/0.35)] md:w-56"
        shapeRendering="crispEdges"
        role="img"
        aria-label="Byte, a small pixel robot"
      >
        {SPRITE.flatMap((row, y) =>
          row.split("").map((c, x) => {
            if (c === ".") return null;
            const isEye = c === "e";
            const isMouth = c === "a" && y === 9;
            return (
              <motion.rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1.02}
                height={1.02}
                fill={COLORS[c]}
                style={{ transformOrigin: `${x + 0.5}px ${isEye ? 7 : y + 0.5}px`, transformBox: "view-box" }}
                // Eyes blink every few seconds; the mouth flickers while Byte talks.
                animate={
                  isEye && !reduce
                    ? { scaleY: [1, 1, 0.1, 1, 1] }
                    : isMouth
                      ? { opacity: talking && !reduce ? [1, 0.2, 1] : mood === "happy" ? 1 : 0.8 }
                      : c === "l" && !reduce
                        ? { opacity: [1, 0.3, 1] }
                        : undefined
                }
                transition={
                  isEye
                    ? { duration: 3.6, times: [0, 0.9, 0.93, 0.96, 1], repeat: Infinity }
                    : isMouth
                      ? { duration: 0.25, repeat: talking ? Infinity : 0 }
                      : { duration: 1.2, repeat: Infinity }
                }
              />
            );
          }),
        )}
      </svg>
    </motion.div>
  );
}
