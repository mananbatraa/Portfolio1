"use client";

import { ContactShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import Wolf, { type UserSpin, type WolfProps } from "@/components/mascot/Wolf";

export type WolfStageProps = Omit<WolfProps, "calm" | "userSpin"> & {
  className?: string;
  /** Rim light colour, usually the page accent. */
  rim?: string;
  /** Wave on arrival and every so often while idle. */
  autoWave?: boolean;
  /** Clicking the wolf makes him wave. */
  pokeable?: boolean;
  label?: string;
};

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

export default function WolfStage({
  className,
  rim = "#3ee6ff",
  autoWave = false,
  pokeable = false,
  label = "Manan as a 3D wolf mascot",
  action = "idle",
  ...wolf
}: WolfStageProps) {
  const calm = usePrefersReducedMotion();
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    if (!autoWave || calm) return;
    const wave = () => {
      setWaving(true);
      setTimeout(() => setWaving(false), 1800);
    };
    const first = setTimeout(wave, 600);
    const every = setInterval(wave, 11000);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, [autoWave, calm]);

  // Drag sideways to spin him on his axis; a flick keeps him turning for a moment.
  const spin = useRef<UserSpin>({ angle: 0, vel: 0, dragging: false, releasedAt: 0 });
  const drag = useRef({ x: 0, t: 0, moved: 0, id: -1 });
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, t: performance.now(), moved: 0, id: e.pointerId };
    spin.current.dragging = true;
    spin.current.vel = 0;
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!spin.current.dragging || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    const now = performance.now();
    d.moved += Math.abs(dx);
    if (d.moved > 6 && !e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId);
    spin.current.angle += dx * 0.012;
    spin.current.vel = (dx * 0.012) / Math.max((now - d.t) / 1000, 0.008);
    d.x = e.clientX;
    d.t = now;
  };
  const onUp = () => {
    if (!spin.current.dragging) return;
    spin.current.dragging = false;
    spin.current.releasedAt = performance.now();
    // A drag that ended a while after the last move should not fling him.
    if (performance.now() - drag.current.t > 80) spin.current.vel = 0;
  };

  const poke = () => {
    if (!pokeable || waving) return;
    setWaving(true);
    setTimeout(() => setWaving(false), 1800);
  };

  return (
    <div
      className={className}
      role="img"
      aria-label={label}
      onClick={pokeable ? poke : undefined}
      onClickCapture={(e) => {
        // A spin is not a click.
        if (drag.current.moved > 6) {
          e.stopPropagation();
          drag.current.moved = 0;
        }
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{
        // A soft spotlight in the accent colour so the dark outfits read on dark pages.
        backgroundImage: `radial-gradient(ellipse 45% 50% at 50% 55%, ${rim}2e, transparent 70%)`,
        cursor: "grab",
        // Vertical swipes still scroll the page on phones; sideways ones spin him.
        touchAction: "pan-y",
      }}
      title={pokeable ? "Drag to spin me, click to say hi" : "Drag to spin me"}
    >
      <Canvas dpr={[1, 2]} camera={{ position: [0, 1.35, 6.2], fov: 30 }} gl={{ antialias: true, alpha: true }}
        onCreated={({ camera }) => camera.lookAt(0, 1.3, 0)}
      >
        {/* Cel shading wants simple light: a soft fill, one key, and an accent rim. */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[2.5, 4, 5]} intensity={2.2} />
        <directionalLight position={[-3, 2.5, -3]} intensity={2.2} color={rim} />
        <Wolf {...wolf} accent={wolf.accent ?? rim} action={waving ? "wave" : action} calm={calm} userSpin={spin} />
        <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={3.5} blur={2.4} far={1.5} />
      </Canvas>
    </div>
  );
}
