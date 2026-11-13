"use client";

import { Decal, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

// Manan as a chibi techie wolf, built from primitives so the outfits, goggles and
// every joint can be animated in code with no model file to download.

export type Outfit = "personal" | "professional";
export type WolfAction = "idle" | "wave" | "point";

export type WolfProps = {
  outfit: Outfit;
  action?: WolfAction;
  talking?: boolean;
  /** Where to point, from -1 (the wolf's left, screen left) to 1 (screen right). */
  pointAt?: number;
  /** Turns off the bobbing, wagging and spin for visitors who prefer reduced motion. */
  calm?: boolean;
};

const COLORS = {
  furDark: "#2b2e34",
  fur: "#858c95",
  furLight: "#c3c8cf",
  muzzle: "#e4e6ea",
  nose: "#0c0d0f",
  innerEar: "#b48d92",
  hoodie: "#18181d",
  rib: "#22232a",
  joggers: "#2c2f37",
  blazer: "#111114",
  trousers: "#141417",
  shirt: "#f4f4f1",
  canvas: "#18181b",
  rubber: "#f1eee6",
  goggle: "#0b0b0d",
  mouth: "#4a1820",
};

type Mats = Record<keyof typeof COLORS, THREE.MeshStandardMaterial> & {
  lens: THREE.MeshPhysicalMaterial;
  glint: THREE.MeshBasicMaterial;
};

function useMaterials(): Mats {
  return useMemo(() => {
    const out = {} as Mats;
    for (const [k, color] of Object.entries(COLORS)) {
      const glossy = k === "nose" || k === "goggle";
      out[k as keyof typeof COLORS] = new THREE.MeshStandardMaterial({
        color,
        roughness: glossy ? 0.25 : k.startsWith("fur") || k === "muzzle" ? 0.85 : 0.7,
        metalness: k === "goggle" ? 0.4 : 0,
      });
    }
    out.lens = new THREE.MeshPhysicalMaterial({
      color: "#0a1418",
      transparent: true,
      opacity: 0.74,
      roughness: 0.05,
      metalness: 0.2,
      clearcoat: 1,
    });
    out.glint = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    return out;
  }, []);
}

function canvasTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  draw(canvas.getContext("2d")!, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  // Decals project mirrored, so flip the art horizontally.
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.x = -1;
  return tex;
}

function poly(ctx: CanvasRenderingContext2D, pts: number[][], fill: string) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

// The "MB." chest print for the hoodie.
function useLogoTexture() {
  return useMemo(
    () =>
      canvasTexture((ctx, s) => {
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${s * 0.42}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("MB.", s / 2, s / 2 + s * 0.03);
      }),
    [],
  );
}

// The front of the suit: white shirt in the blazer's V, black tie, lapels, buttons, pocket square.
function useSuitTexture() {
  return useMemo(
    () =>
      canvasTexture((ctx) => {
        // Lapels, a shade lighter than the blazer so they read in the light.
        poly(ctx, [[176, 0], [256, 300], [214, 200], [150, 112], [172, 92], [134, 0]], "#26272e");
        poly(ctx, [[336, 0], [256, 300], [298, 200], [362, 112], [340, 92], [378, 0]], "#26272e");
        // Shirt.
        poly(ctx, [[180, 0], [332, 0], [256, 292]], COLORS.shirt);
        // Collar points.
        poly(ctx, [[180, 0], [236, 0], [214, 58]], "#dcdcd8");
        poly(ctx, [[332, 0], [276, 0], [298, 58]], "#dcdcd8");
        // Tie: knot and blade.
        poly(ctx, [[238, 6], [274, 6], [268, 46], [244, 46]], "#0b0b0d");
        poly(ctx, [[244, 46], [268, 46], [282, 200], [256, 232], [230, 200]], "#0b0b0d");
        poly(ctx, [[258, 60], [264, 60], [276, 196], [262, 212]], "#2a2a30");
        // Placket line and buttons.
        ctx.strokeStyle = "#2c2d34";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(256, 300);
        ctx.lineTo(256, 512);
        ctx.stroke();
        ctx.fillStyle = "#3a3b44";
        for (const y of [340, 410]) {
          ctx.beginPath();
          ctx.arc(256, y, 11, 0, Math.PI * 2);
          ctx.fill();
        }
        // Pocket square on the left breast (screen right).
        poly(ctx, [[322, 150], [384, 150], [376, 138], [362, 124], [350, 136], [338, 122]], COLORS.shirt);
        ctx.fillStyle = "#26272e";
        ctx.fillRect(316, 150, 74, 7);
      }),
    [],
  );
}

const TAU = Math.PI * 2;
const damp = THREE.MathUtils.damp;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Goggle strap: runs from one lens around the back of the head to the other.
function useStrapGeometry() {
  return useMemo(() => {
    const pts = [new THREE.Vector3(0.3, 0, 0.44)];
    for (let a = -10; a <= 190; a += 20) {
      const r = (a * Math.PI) / 180;
      pts.push(new THREE.Vector3(Math.cos(r) * 0.535, 0, -Math.sin(r) * 0.5));
    }
    pts.push(new THREE.Vector3(-0.3, 0, 0.44));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.042, 8, false);
  }, []);
}

function Shoe({ side, m }: { side: 1 | -1; m: Mats }) {
  return (
    <group position={[side * 0.17, 0, 0.04]}>
      {/* Rubber midsole with the black stripe. */}
      <RoundedBox args={[0.27, 0.08, 0.42]} radius={0.035} position={[0, 0.04, 0]} material={m.rubber} />
      <RoundedBox args={[0.274, 0.014, 0.424]} radius={0.007} position={[0, 0.06, 0]} material={m.canvas} />
      {/* Canvas upper, high-top collar. */}
      <RoundedBox args={[0.24, 0.17, 0.34]} radius={0.075} position={[0, 0.15, -0.03]} material={m.canvas} />
      <mesh position={[0, 0.27, -0.07]} material={m.canvas}>
        <cylinderGeometry args={[0.11, 0.12, 0.16, 20]} />
      </mesh>
      {/* Toe cap. */}
      <mesh position={[0, 0.085, 0.13]} scale={[1.12, 0.6, 0.95]} material={m.rubber}>
        <sphereGeometry args={[0.1, 20, 14, 0, TAU, 0, Math.PI / 2]} />
      </mesh>
      {/* Laces. */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.235 - i * 0.03, 0.035 + i * 0.04]} rotation-x={-0.5} material={m.rubber}>
          <boxGeometry args={[0.12, 0.012, 0.022]} />
        </mesh>
      ))}
      {/* Ankle patch on the outer side. */}
      <mesh position={[side * 0.122, 0.28, -0.07]} rotation-y={side * (Math.PI / 2)} material={m.rubber}>
        <circleGeometry args={[0.045, 20]} />
      </mesh>
    </group>
  );
}

type ArmRefs = { shoulder: THREE.Group | null; elbow: THREE.Group | null; finger: THREE.Mesh | null };

function Arm({ side, m, refs }: { side: 1 | -1; m: Mats; refs: ArmRefs }) {
  return (
    <group ref={(g) => void (refs.shoulder = g)} position={[side * 0.38, 1.3, 0]}>
      <mesh position={[0, -0.18, 0]} material={m.hoodie} userData={{ outfit: "personal" }}>
        <capsuleGeometry args={[0.1, 0.2, 6, 14]} />
      </mesh>
      <mesh position={[0, -0.18, 0]} material={m.blazer} userData={{ outfit: "professional" }}>
        <capsuleGeometry args={[0.1, 0.2, 6, 14]} />
      </mesh>
      <group ref={(g) => void (refs.elbow = g)} position={[0, -0.34, 0]}>
        <mesh position={[0, -0.1, 0]} material={m.hoodie} userData={{ outfit: "personal" }}>
          <capsuleGeometry args={[0.095, 0.14, 6, 14]} />
        </mesh>
        <mesh position={[0, -0.1, 0]} material={m.blazer} userData={{ outfit: "professional" }}>
          <capsuleGeometry args={[0.095, 0.14, 6, 14]} />
        </mesh>
        <mesh position={[0, -0.24, 0]} material={m.rib} userData={{ outfit: "personal" }}>
          <cylinderGeometry args={[0.092, 0.085, 0.07, 16]} />
        </mesh>
        <mesh position={[0, -0.25, 0]} material={m.shirt} userData={{ outfit: "professional" }}>
          <cylinderGeometry args={[0.088, 0.085, 0.05, 16]} />
        </mesh>
        <mesh position={[0, -0.33, 0]} scale={[1, 0.9, 1]} material={m.fur}>
          <sphereGeometry args={[0.105, 18, 14]} />
        </mesh>
        <mesh ref={(g) => void (refs.finger = g)} position={[0, -0.45, 0.01]} material={m.fur} visible={false}>
          <capsuleGeometry args={[0.035, 0.1, 4, 10]} />
        </mesh>
      </group>
    </group>
  );
}

export default function Wolf({ outfit, action = "idle", talking = false, pointAt = 0, calm = false }: WolfProps) {
  const m = useMaterials();
  const logo = useLogoTexture();
  const suit = useSuitTexture();
  const strap = useStrapGeometry();

  const props = useRef({ outfit, action, talking, pointAt, calm });
  props.current = { outfit, action, talking, pointAt, calm };

  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const goggles = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const chin = useRef<THREE.Mesh>(null);
  const tail = useRef<THREE.Group>(null);
  const earL = useRef<THREE.Group>(null);
  const earR = useRef<THREE.Group>(null);
  const armR = useRef<ArmRefs>({ shoulder: null, elbow: null, finger: null }).current;
  const armL = useRef<ArmRefs>({ shoulder: null, elbow: null, finger: null }).current;

  const anim = useRef({ shown: outfit, spinFrom: -1, spinTo: outfit, mouth: 0, look: new THREE.Vector2() });
  const outfitParts = useRef<THREE.Object3D[] | null>(null);

  // The head follows the cursor anywhere on the page, not only over the canvas.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      anim.current.look.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => () => [logo, suit, strap].forEach((x) => x.dispose()), [logo, suit, strap]);

  useFrame((state, dt) => {
    if (!root.current) return;
    const p = props.current;
    const a = anim.current;
    const t = state.clock.elapsedTime;
    dt = Math.min(dt, 0.05);

    if (!outfitParts.current) {
      outfitParts.current = [];
      root.current.traverse((o) => o.userData.outfit && outfitParts.current!.push(o));
    }

    // Outfit swap: a spin with a little hop, changing clothes while facing away.
    let spin = 0;
    let hop = 0;
    if (a.spinFrom < 0 && p.outfit !== a.shown) {
      if (p.calm) a.shown = p.outfit;
      else {
        a.spinFrom = t;
        a.spinTo = p.outfit;
      }
    }
    if (a.spinFrom >= 0) {
      const u = Math.min((t - a.spinFrom) / 0.9, 1);
      spin = easeInOut(u) * TAU;
      hop = Math.sin(u * Math.PI) * 0.28;
      if (u >= 0.5) a.shown = a.spinTo;
      if (u >= 1) a.spinFrom = -1;
    }
    for (const o of outfitParts.current) o.visible = o.userData.outfit === a.shown;

    const pointing = p.action === "point";
    const waving = p.action === "wave";
    const live = p.calm ? 0 : 1;

    root.current.rotation.y = spin + damp(root.current.rotation.y - spin, pointing ? p.pointAt * 0.25 : 0, 4, dt);
    body.current!.position.y = hop + live * Math.sin(t * 2.2) * 0.025;
    torso.current!.scale.set(1 + live * Math.sin(t * 2.2) * 0.012, 1 + live * Math.sin(t * 2.2 + 0.4) * 0.018, 1);

    // Head: follow the cursor, nod while talking, look where it points.
    const h = head.current!;
    const lookY = pointing ? p.pointAt * 0.35 : a.look.x * 0.5;
    const lookX = pointing ? 0.25 : a.look.y * 0.22 + (p.talking ? Math.sin(t * 7) * 0.05 * live : 0);
    h.rotation.y = damp(h.rotation.y, lookY, 5, dt);
    h.rotation.x = damp(h.rotation.x, lookX, 5, dt);
    h.rotation.z = damp(h.rotation.z, live * Math.sin(t * 1.3) * 0.05 + (waving ? 0.1 : 0), 3, dt);

    // Goggles on the eyes for the hoodie, pushed up onto the forehead for the suit.
    goggles.current!.rotation.x = damp(goggles.current!.rotation.x, a.shown === "professional" ? -0.68 : 0, 6, dt);

    // Blink every few seconds.
    const blink = t % 3.8;
    eyes.current!.scale.y = blink < 0.14 ? Math.max(0.1, Math.abs(Math.cos((blink / 0.14) * Math.PI))) : 1;

    // Talking: jaw flaps with a bit of jitter so it does not look like a metronome.
    const flap = p.talking ? 0.5 + 0.5 * Math.sin(t * 17) * Math.sin(t * 5.3 + 1) : 0;
    a.mouth = damp(a.mouth, Math.max(0, flap), 18, dt);
    mouth.current!.scale.y = 0.018 + a.mouth * 0.07;
    chin.current!.position.y = -0.3 - a.mouth * 0.05;

    // Tail wags, faster when happy.
    const wag = waving || p.talking ? 9 : 4.5;
    tail.current!.rotation.z = live * Math.sin(t * wag) * 0.4;
    // Ears flick now and then.
    const flick = t % 5.2 < 0.25 ? Math.sin((t % 5.2) * 25) * 0.2 * live : 0;
    earL.current!.rotation.z = damp(earL.current!.rotation.z, 0.28 + flick, 12, dt);
    earR.current!.rotation.z = damp(earR.current!.rotation.z, -0.28, 12, dt);

    // Arms. The right arm (screen right) waves and points; the left one gestures while talking.
    const r = armR;
    let rz = 0.16 + live * Math.sin(t * 2.2) * 0.03;
    let rx = 0;
    let rElbow = 0.1;
    if (waving) {
      rz = 2.65;
      rx = -0.15;
      rElbow = 0.45 + Math.sin(t * 10) * 0.5 * Math.max(live, 0.3);
    } else if (pointing) {
      rz = 0.25 + p.pointAt * 0.75;
      rx = -0.8;
      rElbow = 0;
    }
    r.shoulder!.rotation.z = damp(r.shoulder!.rotation.z, rz, 8, dt);
    r.shoulder!.rotation.x = damp(r.shoulder!.rotation.x, rx, 8, dt);
    r.elbow!.rotation.z = damp(r.elbow!.rotation.z, rElbow, 10, dt);
    r.finger!.visible = pointing;

    const l = armL;
    const gesture = p.talking && !waving ? Math.sin(t * 3.1) * 0.25 * live : 0;
    l.shoulder!.rotation.z = damp(l.shoulder!.rotation.z, -0.16 - Math.abs(gesture) - live * Math.sin(t * 2.2) * 0.03, 6, dt);
    l.shoulder!.rotation.x = damp(l.shoulder!.rotation.x, p.talking ? -0.35 : 0, 4, dt);
    l.elbow!.rotation.z = damp(l.elbow!.rotation.z, p.talking ? -0.6 - gesture : -0.1, 6, dt);
  });

  return (
    <group ref={root}>
      <group ref={body}>
        <Shoe side={1} m={m} />
        <Shoe side={-1} m={m} />

        {/* Legs. */}
        {[1, -1].map((s) => (
          <group key={s} position={[s * 0.17, 0.42, 0]}>
            <mesh material={m.joggers} userData={{ outfit: "personal" }}>
              <capsuleGeometry args={[0.12, 0.22, 6, 14]} />
            </mesh>
            <mesh material={m.trousers} userData={{ outfit: "professional" }}>
              <capsuleGeometry args={[0.12, 0.22, 6, 14]} />
            </mesh>
          </group>
        ))}

        {/* Tail, sticking out under the top. */}
        <group position={[0, 0.66, -0.26]} rotation-x={-1.0}>
          <group ref={tail}>
            <mesh position={[0, 0.2, 0]} scale={[1, 1, 0.9]} material={m.fur}>
              <capsuleGeometry args={[0.12, 0.26, 6, 14]} />
            </mesh>
            <mesh position={[0, 0.42, 0]} scale={[1, 1.15, 0.9]} material={m.furDark}>
              <sphereGeometry args={[0.115, 16, 12]} />
            </mesh>
          </group>
        </group>

        <group ref={torso} position={[0, 1.0, 0]}>
          {/* Hoodie with the "MB." print, pocket, hood and drawstrings. */}
          <group userData={{ outfit: "personal" }}>
            <mesh scale={[1.05, 1, 0.85]} material={m.hoodie}>
              <capsuleGeometry args={[0.36, 0.4, 10, 24]} />
              <Decal position={[0, 0.03, 0.3]} scale={[0.34, 0.34, 0.5]} map={logo} />
            </mesh>
            <RoundedBox args={[0.42, 0.17, 0.05]} radius={0.02} position={[0, -0.2, 0.285]} rotation-x={-0.12} material={m.rib} />
            <mesh position={[0, 0.4, -0.12]} rotation-x={Math.PI / 2 - 0.35} scale={[1.05, 1, 1]} material={m.hoodie}>
              <torusGeometry args={[0.25, 0.1, 12, 28]} />
            </mesh>
            {[1, -1].map((s) => (
              <group key={s} position={[s * 0.075, 0.2, 0.31]}>
                <mesh material={m.shirt}>
                  <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
                </mesh>
                <mesh position={[0, -0.11, 0]} material={m.shirt}>
                  <cylinderGeometry args={[0.018, 0.018, 0.045, 8]} />
                </mesh>
              </group>
            ))}
          </group>

          {/* Black blazer over a white shirt and black tie. */}
          <group userData={{ outfit: "professional" }}>
            <mesh scale={[1.05, 1, 0.85]} material={m.blazer}>
              <capsuleGeometry args={[0.36, 0.4, 10, 24]} />
              <Decal position={[0, 0.06, 0.3]} scale={[0.62, 0.62, 0.6]} map={suit} />
            </mesh>
            {[1, -1].map((s) => (
              <mesh key={s} position={[s * 0.075, 0.37, 0.2]} rotation={[0.5, 0, s * 0.7]} material={m.shirt}>
                <boxGeometry args={[0.11, 0.05, 0.02]} />
              </mesh>
            ))}
          </group>
        </group>

        <Arm side={1} m={m} refs={armR} />
        <Arm side={-1} m={m} refs={armL} />

        {/* Head pivots at the neck. */}
        <group ref={head} position={[0, 1.42, 0]}>
          <group position={[0, 0.45, 0]}>
            <mesh scale={[1.05, 0.95, 0.95]} material={m.furDark}>
              <sphereGeometry args={[0.5, 32, 24]} />
            </mesh>
            {/* Grey face mask and pale muzzle give the grey-and-black mix. */}
            <mesh position={[0, -0.08, 0.2]} scale={[1.15, 0.85, 0.8]} material={m.fur}>
              <sphereGeometry args={[0.38, 28, 20]} />
            </mesh>
            {[1, -1].map((s) => (
              <mesh key={s} position={[s * 0.47, -0.15, 0.06]} rotation-z={s * -2.0} scale={[1, 1, 0.6]} material={m.fur}>
                <coneGeometry args={[0.09, 0.2, 10]} />
              </mesh>
            ))}
            <mesh position={[0, -0.13, 0.46]} scale={[0.95, 0.72, 1.5]} material={m.muzzle}>
              <sphereGeometry args={[0.2, 24, 16]} />
            </mesh>
            <mesh ref={chin} position={[0, -0.3, 0.52]} scale={[0.95, 0.5, 1.3]} material={m.muzzle}>
              <sphereGeometry args={[0.12, 18, 12]} />
            </mesh>
            <mesh ref={mouth} position={[0, -0.245, 0.66]} scale={[0.08, 0.02, 0.04]} material={m.mouth}>
              <sphereGeometry args={[1, 16, 12]} />
            </mesh>
            <mesh position={[0, -0.04, 0.76]} scale={[1.35, 0.85, 1]} material={m.nose}>
              <sphereGeometry args={[0.065, 16, 12]} />
            </mesh>

            {/* Eyes, behind the goggle lenses. */}
            <group ref={eyes} position={[0, 0.06, 0]}>
              {[1, -1].map((s) => (
                <group key={s} position={[s * 0.19, 0, 0.45]}>
                  <mesh material={m.nose}>
                    <sphereGeometry args={[0.072, 16, 12]} />
                  </mesh>
                  <mesh position={[0.024, 0.028, 0.055]} material={m.glint}>
                    <sphereGeometry args={[0.02, 8, 6]} />
                  </mesh>
                </group>
              ))}
            </group>

            {/* Ears. */}
            {[1, -1].map((s) => (
              <group key={s} ref={s === 1 ? earR : earL} position={[s * 0.29, 0.38, -0.04]} rotation-z={-s * 0.28}>
                <mesh position={[0, 0.17, 0]} scale={[1, 1, 0.55]} material={m.furDark}>
                  <coneGeometry args={[0.16, 0.38, 16]} />
                </mesh>
                <mesh position={[0, 0.14, 0.05]} scale={[1, 1, 0.4]} material={m.innerEar}>
                  <coneGeometry args={[0.095, 0.25, 12]} />
                </mesh>
              </group>
            ))}

            {/* Black goggles. */}
            <group ref={goggles}>
              <mesh geometry={strap} position={[0, 0.06, 0]} material={m.goggle} />
              {[1, -1].map((s) => (
                <group key={s} position={[s * 0.19, 0.06, 0.5]} rotation-y={s * 0.28}>
                  <mesh rotation-x={Math.PI / 2} material={m.goggle}>
                    <cylinderGeometry args={[0.14, 0.15, 0.12, 24, 1, true]} />
                  </mesh>
                  <mesh position={[0, 0, 0.05]} material={m.goggle}>
                    <torusGeometry args={[0.14, 0.036, 12, 28]} />
                  </mesh>
                  <mesh position={[0, 0, 0.05]} material={m.lens}>
                    <circleGeometry args={[0.135, 28]} />
                  </mesh>
                  <mesh position={[-0.045, 0.05, 0.052]} rotation-z={0.6} material={m.glint}>
                    <planeGeometry args={[0.07, 0.016]} />
                  </mesh>
                </group>
              ))}
              <mesh position={[0, 0.08, 0.55]} material={m.goggle}>
                <boxGeometry args={[0.08, 0.05, 0.06]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
