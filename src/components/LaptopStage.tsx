"use client";

import { RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { HERO_SEGMENTS } from "@/lib/hero-assets";

// A code-built laptop that plays the same six acts as the video engine,
// driven by scroll: deconstruct, reassemble, orbit, bridge, detail, reveal.

const LERP = 0.08;
const ACCENT = new THREE.Color("#3EE6FF");
const ALU = "#4a4d55";
const ALU_DARK = "#2a2c31";

type Acts = Record<string, number>;

// Progress (0-1) through each named act, given overall scroll progress.
function actProgress(p: number): Acts {
  const total = HERO_SEGMENTS.reduce((sum, s) => sum + s.span, 0);
  const acts: Acts = {};
  let acc = 0;
  for (const s of HERO_SEGMENTS) {
    const start = acc / total;
    acc += s.span;
    const end = acc / total;
    acts[s.id] = THREE.MathUtils.clamp((p - start) / (end - start), 0, 1);
  }
  return acts;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function useScrollProgress() {
  const target = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target.current = max > 0 ? THREE.MathUtils.clamp(window.scrollY / max, 0, 1) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return target;
}

// A dark editor with a few lines of cyan "code" and the MB monogram.
function makeScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 683;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#03080a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const widths = [0.42, 0.6, 0.3, 0.55, 0.22, 0.48, 0.66, 0.35, 0.5, 0.28, 0.58, 0.4];
  widths.forEach((w, i) => {
    const indent = [0, 1, 2, 2, 1, 2, 3, 3, 2, 1, 1, 0][i] * 36;
    ctx.fillStyle = i % 3 === 0 ? "rgba(62,230,255,0.75)" : "rgba(62,230,255,0.28)";
    ctx.fillRect(70 + indent, 70 + i * 44, w * 700, 14);
  });
  ctx.fillStyle = "rgba(62,230,255,0.9)";
  ctx.font = "bold 120px Impact, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("MB.", 960, 640);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Keycaps() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const cols = 13;
  const rows = 5;
  useEffect(() => {
    const m = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        m.setPosition((c - (cols - 1) / 2) * 0.2, 0, -0.75 + r * 0.2);
        ref.current?.setMatrixAt(i++, m);
      }
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cols * rows]}>
      <boxGeometry args={[0.16, 0.025, 0.16]} />
      <meshStandardMaterial color="#0e0f12" emissive={ACCENT} emissiveIntensity={0.03} roughness={0.7} metalness={0.2} />
    </instancedMesh>
  );
}

function Laptop({ reduced }: { reduced: boolean }) {
  const target = useScrollProgress();
  const current = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  const root = useRef<THREE.Group>(null);
  const bottom = useRef<THREE.Group>(null);
  const battery = useRef<THREE.Group>(null);
  const board = useRef<THREE.Group>(null);
  const deck = useRef<THREE.Group>(null);
  const keys = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const screen = useRef<THREE.Group>(null);
  const chip = useRef<THREE.MeshStandardMaterial>(null);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const screenTexture = useMemo(makeScreenTexture, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    current.current = reduced ? 0 : current.current + (target.current - current.current) * LERP;
    const a = actProgress(current.current);

    // Deconstruct then reassemble: explode out, then back in.
    const explode = ease(a.deconstruct) * (1 - ease(a.reassemble));
    const spread = (dy: number) => dy * explode;
    bottom.current!.position.y = spread(-1.3);
    battery.current!.position.y = 0.1 + spread(-0.65);
    board.current!.position.y = 0.16 + spread(0);
    deck.current!.position.y = 0.24 + spread(0.6);
    keys.current!.position.y = 0.29 + spread(1.05);
    lid.current!.position.y = 0.3 + spread(1.5);
    lid.current!.rotation.x = -THREE.MathUtils.degToRad(105 + 50 * explode);
    screen.current!.position.y = -0.05 + spread(-0.45);
    chip.current!.emissiveIntensity = 0.6 + explode * 2.4;

    // Orbit three quarters, then the bridge completes the turn back to the front.
    const turn = ease(a.orbit) * 0.75 + ease(a.bridge) * 0.25;
    const idle = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.6) * 0.04;
    root.current!.rotation.y = turn * Math.PI * 2 + pointer.current.x * 0.15 + idle;
    root.current!.rotation.x = pointer.current.y * 0.05;
    root.current!.position.y = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.05;

    // Detail pushes the camera into the keyboard; reveal pulls it back out.
    const push = ease(a.detail) * (1 - ease(a.reveal));
    const narrow = state.size.width < 768;
    const far = narrow ? 12 : 9;
    // Sit right of the headline on wide screens; centre on phones and in the close-up.
    root.current!.position.x = narrow ? 0 : THREE.MathUtils.lerp(1.6, 0, push);
    camera.position.set(0, THREE.MathUtils.lerp(2.6, 1.1, push), THREE.MathUtils.lerp(far, 2.4, push));
    lookAt.set(0, THREE.MathUtils.lerp(0.5, 0.3, push), THREE.MathUtils.lerp(0, 0.3, push));
    camera.lookAt(lookAt);
  });

  return (
    <group ref={root}>
      <group ref={bottom}>
        <RoundedBox args={[3.2, 0.08, 2.2]} radius={0.04} smoothness={4}>
          <meshStandardMaterial color={ALU_DARK} metalness={0.8} roughness={0.35} />
        </RoundedBox>
      </group>
      <group ref={battery}>
        {[-0.9, 0, 0.9].map((x) => (
          <mesh key={x} position={[x, 0, 0.35]}>
            <boxGeometry args={[0.8, 0.05, 1.1]} />
            <meshStandardMaterial color="#1b1d22" roughness={0.8} />
          </mesh>
        ))}
      </group>
      <group ref={board}>
        <mesh position={[0, 0, -0.55]}>
          <boxGeometry args={[2.6, 0.03, 0.8]} />
          <meshStandardMaterial color="#0d2a26" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.04, -0.55]}>
          <boxGeometry args={[0.45, 0.05, 0.45]} />
          <meshStandardMaterial ref={chip} color="#0a0a0a" emissive={ACCENT} emissiveIntensity={0.6} />
        </mesh>
      </group>
      <group ref={deck}>
        <RoundedBox args={[3.2, 0.06, 2.2]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color={ALU} metalness={0.85} roughness={0.3} />
        </RoundedBox>
        <mesh position={[0, 0.032, 0.62]}>
          <boxGeometry args={[1.2, 0.005, 0.7]} />
          <meshStandardMaterial color="#3a3d44" metalness={0.6} roughness={0.25} />
        </mesh>
      </group>
      <group ref={keys}>
        <Keycaps />
      </group>
      {/* The lid hinges at the back edge of the deck. */}
      <group ref={lid} position={[0, 0.3, -1.1]}>
        <group position={[0, 0, 1.1]}>
          <RoundedBox args={[3.2, 0.05, 2.2]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color={ALU} metalness={0.85} roughness={0.3} />
          </RoundedBox>
          <group ref={screen}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3.0, 2.0]} />
              <meshStandardMaterial
                color="#000000"
                emissive="#ffffff"
                emissiveMap={screenTexture}
                emissiveIntensity={0.9}
                roughness={0.2}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function LaptopStage() {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-ground" aria-hidden>
      <Canvas dpr={[1, 2]} camera={{ fov: 35, position: [0, 2.6, 7] }} gl={{ antialias: true }}>
        <ambientLight intensity={0.15} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <pointLight position={[-3, 1.5, -2]} intensity={18} color={ACCENT} />
        <pointLight position={[0, -1.5, 2]} intensity={4} color={ACCENT} />
        <Laptop reduced={reduced} />
      </Canvas>
      {/* Edge-only darkening keeps text legible while the centre stays bright. */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ground to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ground to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(7,7,8,0.85)_100%)]" />
      <div className="absolute bottom-[14%] left-1/2 h-24 w-[50vw] -translate-x-1/2 rounded-[50%] bg-accent/10 blur-3xl" />
    </div>
  );
}
