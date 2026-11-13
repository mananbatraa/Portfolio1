"use client";

import { ContactShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import Wolf, { type WolfProps } from "@/components/mascot/Wolf";

export type WolfStageProps = Omit<WolfProps, "calm"> & {
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
      style={pokeable ? { cursor: "pointer" } : undefined}
      title={pokeable ? "Say hi" : undefined}
    >
      <Canvas dpr={[1, 2]} camera={{ position: [0, 1.35, 6.2], fov: 30 }} gl={{ antialias: true, alpha: true }}
        onCreated={({ camera }) => camera.lookAt(0, 1.3, 0)}
      >
        <hemisphereLight args={["#e6ecff", "#1a1a22", 1.1]} />
        <directionalLight position={[2.5, 4, 5]} intensity={2.8} />
        <directionalLight position={[-2, 1, 4]} intensity={0.8} />
        <directionalLight position={[-3.5, 2.5, -3]} intensity={3} color={rim} />
        <directionalLight position={[3.5, 1.5, -2.5]} intensity={1.6} color={rim} />
        <Wolf {...wolf} action={waving ? "wave" : action} calm={calm} />
        <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={3.5} blur={2.4} far={1.5} />
      </Canvas>
    </div>
  );
}
