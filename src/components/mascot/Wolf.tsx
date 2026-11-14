"use client";

import { Decal, Outlines } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import * as THREE from "three";

// Manan as a chibi techie wolf. Every shape is drawn in code (lathe profiles, painted fur
// markings, extruded soles) and rendered with cel shading and ink outlines, so the
// outfits, goggles and joints can all be animated with no model file to download.

export type Outfit = "personal" | "professional";
export type WolfAction = "idle" | "wave" | "point" | "walk";

export type WolfProps = {
  outfit: Outfit;
  action?: WolfAction;
  talking?: boolean;
  /** Where to point, from -1 (screen left) to 1 (screen right). */
  pointAt?: number;
  /** Which way he faces while walking: -1 screen left, 1 screen right. */
  facing?: number;
  /** Colour of the dot in the "MB." print. */
  accent?: string;
  /** Turns off the bobbing, wagging and spin for visitors who prefer reduced motion. */
  calm?: boolean;
  /** Drag-to-spin state written by the stage; the wolf turns by `angle` on top of his own moves. */
  userSpin?: MutableRefObject<UserSpin>;
};

export type UserSpin = { angle: number; vel: number; dragging: boolean; releasedAt: number };

// One palette for the whole character.
export const PALETTE = {
  ink: "#101116",
  furDark: "#2b2f38",
  furMid: "#7b8391",
  furLight: "#e3e5e9",
  innerEar: "#d39a98",
  iris: "#f2b33d",
  nose: "#17181d",
  mouth: "#5a1d26",
  hoodie: "#22242b",
  rib: "#2a2c34",
  joggers: "#3b404c",
  blazer: "#16171b",
  shirt: "#f4f3ef",
  tie: "#0f1013",
  trousers: "#1a1b20",
  canvas: "#1c1d22",
  rubber: "#f2eee4",
  goggle: "#15161b",
  lens: "#26414d",
  white: "#ffffff",
};
type Swatch = keyof typeof PALETTE;

const TAU = Math.PI * 2;
const damp = THREE.MathUtils.damp;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
// Ink line weight in drawing-buffer pixels. (drei's Outlines measures in pixels when
// `screenspace` is off.)
const OUTLINE = 3.5;

/* ---------- materials ---------- */

function useToon() {
  return useMemo(() => {
    // Three hard light bands: shadow, mid, lit.
    const ramp = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1);
    ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
    ramp.needsUpdate = true;
    const cache = new Map<string, THREE.MeshToonMaterial>();
    const get = (key: Swatch | "vertex", map?: THREE.Texture) => {
      const id = key + (map ? map.uuid : "");
      if (!cache.has(id)) {
        cache.set(
          id,
          new THREE.MeshToonMaterial({
            color: key === "vertex" || map ? "#ffffff" : PALETTE[key],
            gradientMap: ramp,
            vertexColors: key === "vertex",
            map: map ?? null,
          }),
        );
      }
      return cache.get(id)!;
    };
    return { get, flat: (c: Swatch) => new THREE.MeshBasicMaterial({ color: PALETTE[c] }) };
  }, []);
}

type Toon = ReturnType<typeof useToon>;

/** A cel-shaded mesh with an ink outline. */
function Part({
  children,
  mat,
  outline = true,
  ...rest
}: { children?: ReactNode; mat: THREE.Material; outline?: boolean } & JSX.IntrinsicElements["mesh"]) {
  return (
    <mesh material={mat} {...rest}>
      {children}
      {outline && <Outlines thickness={OUTLINE} color={PALETTE.ink} />}
    </mesh>
  );
}

/* ---------- painted textures ---------- */

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d")!);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, canvas, redraw: () => (draw(canvas.getContext("2d")!), (tex.needsUpdate = true)) };
}

// Fur markings painted onto the head sphere. Points are given as (azimuth, elevation) in
// degrees from the front of the face, so the mask can be designed like a flat drawing.
function useHeadTexture() {
  return useMemo(() => {
    const W = 1024;
    const H = 512;
    const at = (a: number, e: number): [number, number] => [((90 + a) / 360) * W, ((90 - e) / 180) * H];
    const shape = (ctx: CanvasRenderingContext2D, pts: [number, number][], fill: string) => {
      ctx.beginPath();
      pts.forEach(([a, e], i) => (i ? ctx.lineTo(...at(a, e)) : ctx.moveTo(...at(a, e))));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    };
    const { tex } = canvasTexture(W, H, (ctx) => {
      ctx.fillStyle = PALETTE.furDark;
      ctx.fillRect(0, 0, W, H);
      // Grey mask with jagged fur edges and a dark stripe down the middle of the forehead.
      shape(
        ctx,
        [
          [-84, -70], [-84, -6], [-66, 9], [-58, 0], [-48, 24], [-39, 15], [-29, 33], [-17, 24],
          [-9, -6], [9, -6], [17, 24], [29, 33], [39, 15], [48, 24], [58, 0], [66, 9], [84, -6], [84, -70],
        ],
        PALETTE.furMid,
      );
      // Pale cheeks and chin.
      shape(
        ctx,
        [
          [-74, -80], [-74, -22], [-58, -12], [-48, -24], [-33, -9], [-18, -26], [0, -18],
          [18, -26], [33, -9], [48, -24], [58, -12], [74, -22], [74, -80],
        ],
        PALETTE.furLight,
      );
      ctx.fillRect(0, at(0, -62)[1], W, H);
      // Pale eyebrow spots, a classic wolf marking.
      ctx.fillStyle = PALETTE.furLight;
      for (const s of [-1, 1]) {
        const [x, y] = at(s * 24, 25);
        ctx.beginPath();
        ctx.ellipse(x, y, 20, 11, s * -0.35, 0, TAU);
        ctx.fill();
      }
      // A few darker brush strokes on the crown so it reads as fur, not plastic.
      ctx.strokeStyle = "#22252d";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      for (const [a, e] of [[-30, 60], [-12, 66], [8, 62], [26, 58], [44, 52], [-46, 52], [0, 76]]) {
        const [x, y] = at(a, e);
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 8);
        ctx.lineTo(x, y + 10);
        ctx.lineTo(x + 10, y - 6);
        ctx.stroke();
      }
    });
    return tex;
  }, []);
}

// The "MB." chest print, set in the site's display face with an accent dot.
function useLogoTexture(accent: string) {
  const t = useMemo(() => {
    const draw = (ctx: CanvasRenderingContext2D) => {
      const s = 512;
      ctx.clearRect(0, 0, s, s);
      ctx.font = `400 ${s * 0.7}px Anton, Impact, "Arial Narrow", sans-serif`;
      ctx.textBaseline = "middle";
      const mb = ctx.measureText("MB");
      const dot = s * 0.07;
      const x = s / 2 - (mb.width + dot * 2.2) / 2;
      ctx.fillStyle = "#f4f3ef";
      ctx.fillText("MB", x, s / 2 + s * 0.02);
      ctx.fillStyle = accent;
      ctx.fillRect(x + mb.width + dot * 0.35, s / 2 + s * 0.27 - dot, dot, dot);
    };
    return canvasTexture(512, 512, draw);
  }, [accent]);
  useEffect(() => {
    // Redraw once Anton has loaded so the print uses it.
    document.fonts?.load("400 100px Anton").then(t.redraw, () => {});
  }, [t]);
  return t.tex;
}

// Front of the suit: shirt in the blazer's V, tie, lapels with ink edges, buttons, pocket square.
function useSuitTexture() {
  return useMemo(() => {
    const { tex } = canvasTexture(512, 512, (ctx) => {
      const poly = (pts: number[][], fill: string, stroke = true) => {
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        if (stroke) {
          ctx.lineJoin = "round";
          ctx.lineWidth = 7;
          ctx.strokeStyle = PALETTE.ink;
          ctx.stroke();
        }
      };
      poly([[182, -10], [330, -10], [256, 300]], PALETTE.shirt);
      poly([[246, 10], [266, 10], [270, 44], [242, 44]], PALETTE.tie);
      poly([[242, 44], [270, 44], [284, 210], [256, 246], [228, 210]], PALETTE.tie);
      poly([[258, 58], [264, 58], [274, 200], [262, 214]], "#2e3038", false);
      // Notched lapels.
      poly([[182, -10], [256, 300], [214, 206], [146, 118], [170, 96], [130, -10]], "#24262d");
      poly([[330, -10], [256, 300], [298, 206], [366, 118], [342, 96], [382, -10]], "#24262d");
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(256, 300);
      ctx.lineTo(256, 520);
      ctx.stroke();
      for (const y of [350, 420]) {
        ctx.beginPath();
        ctx.arc(256, y, 13, 0, TAU);
        ctx.fillStyle = "#3a3c46";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.stroke();
      }
      poly([[322, 152], [338, 122], [350, 140], [362, 120], [376, 138], [386, 152]], PALETTE.shirt);
      ctx.fillStyle = PALETTE.ink;
      ctx.fillRect(312, 150, 84, 8);
    });
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.x = -1;
    return tex;
  }, []);
}

/* ---------- geometry ---------- */

// Lathe seams start at the front, so turn them to the back where nothing is printed.
const lathe = (pts: [number, number][], seg = 28) =>
  new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg).rotateY(Math.PI);

/** Paints a geometry by a function of each vertex position. */
function paint(geo: THREE.BufferGeometry, fn: (x: number, y: number, z: number) => Swatch) {
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    c.set(PALETTE[fn(pos.getX(i), pos.getY(i), pos.getZ(i))]).convertSRGBToLinear();
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}

function useGeometry() {
  return useMemo(() => {
    // Body of the hoodie / blazer: flared hem, round belly, narrow shoulders.
    const torso = lathe([
      [0, 0.44], [0.33, 0.45], [0.38, 0.52], [0.4, 0.66], [0.38, 0.86], [0.34, 1.04], [0.27, 1.18], [0.17, 1.3], [0, 1.34],
    ], 56);
    // Tapered snout pointing forward; grey bridge, pale sides.
    const snout = paint(
      lathe([[0.165, 0], [0.17, 0.07], [0.158, 0.15], [0.132, 0.22], [0.095, 0.27], [0.05, 0.3], [0, 0.31]]),
      (x, _y, z) => (z < -0.06 && Math.abs(x) < 0.09 ? "furMid" : "furLight"),
    );
    // Bushy tail with a dark tip.
    const tail = paint(
      lathe([[0.06, 0], [0.12, 0.08], [0.17, 0.22], [0.17, 0.36], [0.13, 0.5], [0.06, 0.6], [0, 0.64]]),
      (_x, y) => (y > 0.46 ? "furDark" : "furMid"),
    );
    // Slightly flared sleeve.
    const sleeve = lathe([[0.1, -0.02], [0.095, 0.1], [0.1, 0.2], [0.115, 0.3], [0.118, 0.32]], 18);
    // Converse sole outline, wider at the toe.
    const sole = new THREE.Shape();
    sole.moveTo(-0.1, -0.2);
    sole.bezierCurveTo(-0.11, -0.25, 0.11, -0.25, 0.1, -0.2);
    sole.bezierCurveTo(0.13, 0.0, 0.14, 0.12, 0.13, 0.17);
    sole.bezierCurveTo(0.11, 0.27, -0.11, 0.27, -0.13, 0.17);
    sole.bezierCurveTo(-0.14, 0.12, -0.13, 0.0, -0.1, -0.2);
    const soleGeo = new THREE.ExtrudeGeometry(sole, { depth: 0.05, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3, curveSegments: 18 });
    soleGeo.rotateX(Math.PI / 2);
    soleGeo.translate(0, 0.062, 0);
    // Goggle strap: an ellipse around the head.
    const strap = new THREE.TorusGeometry(0.5, 0.032, 8, 48);
    return { torso, snout, tail, sleeve, soleGeo, strap };
  }, []);
}

/* ---------- parts ---------- */

function Shoe({ side, t, g }: { side: 1 | -1; t: Toon; g: ReturnType<typeof useGeometry> }) {
  return (
    <group position={[side * 0.17, 0, 0.03]} rotation-y={side * 0.08}>
      <Part geometry={g.soleGeo} mat={t.get("rubber")}>{null}</Part>
      {/* The black line round the midsole. */}
      <mesh geometry={g.soleGeo} material={t.get("canvas")} position-y={0.012} scale={[1.02, 0.18, 1.02]} />
      {/* Canvas upper and high-top collar. */}
      <Part position={[0, 0.13, -0.01]} scale={[0.115, 0.1, 0.2]} mat={t.get("canvas")}>
        <sphereGeometry args={[1, 24, 16]} />
      </Part>
      <Part position={[0, 0.22, -0.07]} mat={t.get("canvas")}>
        <cylinderGeometry args={[0.105, 0.115, 0.2, 20]} />
      </Part>
      {/* Rubber toe cap. */}
      <Part position={[0, 0.085, 0.14]} scale={[0.11, 0.07, 0.09]} mat={t.get("rubber")}>
        <sphereGeometry args={[1, 20, 12, 0, TAU, 0, Math.PI / 2]} />
      </Part>
      {/* Laces. */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.27 - i * 0.04, 0.03 + i * 0.033]} rotation-x={-0.7} material={t.get("rubber")}>
          <boxGeometry args={[0.11, 0.014, 0.022]} />
        </mesh>
      ))}
      {/* Ankle patch on the outer side. */}
      <mesh position={[side * 0.113, 0.24, -0.07]} rotation-y={side * (Math.PI / 2)} material={t.get("rubber")}>
        <circleGeometry args={[0.042, 20]} />
      </mesh>
    </group>
  );
}

type ArmRefs = { shoulder: THREE.Group | null; elbow: THREE.Group | null; finger: THREE.Mesh | null };

function Arm({ side, t, g, refs }: { side: 1 | -1; t: Toon; g: ReturnType<typeof useGeometry>; refs: ArmRefs }) {
  const sleeve = (outfit: Outfit, len: number) => (
    <Part
      geometry={g.sleeve}
      rotation-x={Math.PI}
      scale={[1, len, 1]}
      mat={t.get(outfit === "personal" ? "hoodie" : "blazer")}
      userData={{ outfit }}
    >
      {null}
    </Part>
  );
  return (
    <group ref={(o) => void (refs.shoulder = o)} position={[side * 0.35, 1.2, 0]}>
      {sleeve("personal", 1)}
      {sleeve("professional", 1)}
      <group ref={(o) => void (refs.elbow = o)} position={[0, -0.3, 0]}>
        <group position-y={0.02}>
          {sleeve("personal", 0.7)}
          {sleeve("professional", 0.7)}
        </group>
        <Part position={[0, -0.21, 0]} rotation-x={Math.PI / 2} mat={t.get("rib")} userData={{ outfit: "personal" }}>
          <torusGeometry args={[0.1, 0.03, 8, 20]} />
        </Part>
        <Part position={[0, -0.21, 0]} mat={t.get("shirt")} userData={{ outfit: "professional" }}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 18]} />
        </Part>
        {/* Mitten paw with a thumb. */}
        <Part position={[0, -0.3, 0]} scale={[0.1, 0.105, 0.09]} mat={t.get("furLight")}>
          <sphereGeometry args={[1, 20, 14]} />
        </Part>
        <Part position={[-side * 0.075, -0.27, 0.04]} scale={0.04} mat={t.get("furLight")}>
          <sphereGeometry args={[1, 12, 10]} />
        </Part>
        <mesh ref={(o) => void (refs.finger = o)} position={[0, -0.42, 0.01]} visible={false} material={t.get("furLight")}>
          <capsuleGeometry args={[0.032, 0.09, 4, 10]} />
          <Outlines thickness={OUTLINE} color={PALETTE.ink} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- the wolf ---------- */

export default function Wolf({ outfit, action = "idle", talking = false, pointAt = 0, facing = 1, accent = "#ff8060", calm = false, userSpin }: WolfProps) {
  const t = useToon();
  const g = useGeometry();
  const headTex = useHeadTexture();
  const logo = useLogoTexture(accent);
  const suit = useSuitTexture();

  const props = useRef({ outfit, action, talking, pointAt, facing, calm });
  props.current = { outfit, action, talking, pointAt, facing, calm };
  const legs = useRef<THREE.Group[]>([]);

  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const goggles = useRef<THREE.Group>(null);
  const lids = useRef<THREE.Mesh[]>([]);
  const brows = useRef<THREE.Mesh[]>([]);
  const jaw = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const ears = useRef<THREE.Group[]>([]);
  const armR = useRef<ArmRefs>({ shoulder: null, elbow: null, finger: null }).current;
  const armL = useRef<ArmRefs>({ shoulder: null, elbow: null, finger: null }).current;

  const anim = useRef({ shown: outfit, spinFrom: -1, spinTo: outfit, mouth: 0, turn: 0, look: new THREE.Vector2() });
  const outfitParts = useRef<THREE.Object3D[] | null>(null);

  // The head follows the cursor anywhere on the page, not only over the canvas.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      anim.current.look.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    if (!root.current) return;
    const p = props.current;
    const a = anim.current;
    const time = state.clock.elapsedTime;
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
        a.spinFrom = time;
        a.spinTo = p.outfit;
      }
    }
    if (a.spinFrom >= 0) {
      const u = Math.min((time - a.spinFrom) / 0.9, 1);
      spin = easeInOut(u) * TAU;
      hop = Math.sin(u * Math.PI) * 0.28;
      if (u >= 0.5) a.shown = a.spinTo;
      if (u >= 1) a.spinFrom = -1;
    }
    for (const o of outfitParts.current) o.visible = o.userData.outfit === a.shown;

    const pointing = p.action === "point";
    const walking = p.action === "walk";
    const waving = p.action === "wave";
    const live = p.calm ? 0 : 1;
    const breathe = Math.sin(time * 2.2);

    const turn = walking ? p.facing * 1.15 : pointing ? p.pointAt * 0.25 : 0;
    a.turn = damp(a.turn, turn, 6, dt);
    // Spun by the visitor: coast with friction, then turn back to face the front.
    const us = userSpin?.current;
    if (us && !us.dragging) {
      us.angle += us.vel * dt;
      us.vel *= Math.exp(-2.5 * dt);
      if (Math.abs(us.vel) < 0.4 && performance.now() - us.releasedAt > 1500) {
        us.vel = 0;
        us.angle = damp(us.angle, Math.round(us.angle / TAU) * TAU, 3, dt);
      }
    }
    root.current.rotation.y = spin + a.turn + (us ? us.angle : 0);
    // Walk cycle: legs swing from the hip, a bounce on every step.
    const stride = walking ? Math.sin(time * 11) : 0;
    legs.current.forEach((l, i) => (l.rotation.x = damp(l.rotation.x, (i === 0 ? 1 : -1) * stride * 0.55, 20, dt)));
    body.current!.position.y = hop + live * breathe * 0.02 + (walking ? Math.abs(Math.cos(time * 11)) * 0.06 : 0);
    torso.current!.scale.set(1 + live * breathe * 0.01, 1 + live * Math.sin(time * 2.2 + 0.4) * 0.015, 1);

    // Head: follow the cursor, nod while talking, look where it points.
    const h = head.current!;
    const lookY = pointing ? p.pointAt * 0.35 : a.look.x * 0.5;
    const lookX = pointing ? 0.22 : a.look.y * 0.2 + (p.talking ? Math.sin(time * 7) * 0.04 * live : 0);
    h.rotation.y = damp(h.rotation.y, lookY, 5, dt);
    h.rotation.x = damp(h.rotation.x, lookX, 5, dt);
    h.rotation.z = damp(h.rotation.z, live * Math.sin(time * 1.3) * 0.05 + (waving ? 0.12 : 0), 3, dt);

    // Goggles sit up on the forehead; they tip a little further back with the suit.
    goggles.current!.rotation.x = damp(goggles.current!.rotation.x, a.shown === "professional" ? -0.12 : 0, 6, dt);

    // Blink every few seconds; brows lift while talking or waving.
    const blink = time % 3.8;
    const shut = blink < 0.16 ? Math.sin((blink / 0.16) * Math.PI) : 0;
    lids.current.forEach((l) => (l.position.y = 0.065 - shut * 0.06));
    const lift = (p.talking ? 0.012 + Math.sin(time * 5) * 0.008 * live : 0) + (waving ? 0.02 : 0);
    brows.current.forEach((b) => (b.position.y = damp(b.position.y, 0.15 + lift, 10, dt)));

    // Talking: the jaw drops with a little jitter so it does not look like a metronome.
    const flap = p.talking ? 0.5 + 0.5 * Math.sin(time * 17) * Math.sin(time * 5.3 + 1) : 0;
    a.mouth = damp(a.mouth, Math.max(0, flap), 18, dt);
    jaw.current!.rotation.x = 0.04 + a.mouth * 0.45;

    // Tail wags, faster when happy. Ears flick now and then.
    tail.current!.rotation.z = live * Math.sin(time * (waving || p.talking ? 9 : 4.5)) * 0.4;
    const flick = time % 5.2 < 0.25 ? Math.sin((time % 5.2) * 25) * 0.2 * live : 0;
    ears.current.forEach((e, i) => (e.rotation.x = damp(e.rotation.x, i === 0 ? flick : 0, 12, dt)));

    // Arms. The screen-right arm waves and points; the other gestures while talking.
    let rz = 0.3 + live * breathe * 0.03;
    let rx = 0;
    let rElbow = 0.12;
    if (waving) {
      rz = 2.6;
      rx = -0.15;
      rElbow = 0.45 + Math.sin(time * 10) * 0.5 * Math.max(live, 0.3);
    } else if (pointing) {
      rz = 0.25 + p.pointAt * 0.75;
      rx = -0.85;
      rElbow = 0;
    }
    if (walking) {
      rx = -stride * 0.5;
      rElbow = 0.2;
    }
    armR.shoulder!.rotation.z = damp(armR.shoulder!.rotation.z, rz, 8, dt);
    armR.shoulder!.rotation.x = damp(armR.shoulder!.rotation.x, rx, 8, dt);
    armR.elbow!.rotation.z = damp(armR.elbow!.rotation.z, rElbow, 10, dt);
    armR.finger!.visible = pointing;

    const gesture = p.talking && !waving ? Math.sin(time * 3.1) * 0.25 * live : 0;
    armL.shoulder!.rotation.z = damp(armL.shoulder!.rotation.z, -0.3 - Math.abs(gesture) - live * breathe * 0.03, 6, dt);
    armL.shoulder!.rotation.x = damp(armL.shoulder!.rotation.x, walking ? stride * 0.5 : p.talking ? -0.35 : 0, walking ? 12 : 4, dt);
    armL.elbow!.rotation.z = damp(armL.elbow!.rotation.z, p.talking ? -0.6 - gesture : -0.12, 6, dt);
  });

  return (
    <group ref={root}>
      <group ref={body}>
        {/* Each leg and its shoe swing together from the hip. */}
        {([1, -1] as const).map((s, i) => (
          <group key={s} ref={(o) => void (o && (legs.current[i] = o))} position-y={0.55}>
            <group position-y={-0.55}>
              <Shoe side={s} t={t} g={g} />
              {/* Joggers with ribbed cuffs, or suit trousers. */}
              <group position={[s * 0.16, 0.4, 0]}>
                <Part mat={t.get("joggers")} userData={{ outfit: "personal" }}>
                  <capsuleGeometry args={[0.125, 0.16, 6, 16]} />
                </Part>
                <Part position-y={-0.1} rotation-x={Math.PI / 2} mat={t.get("rib")} userData={{ outfit: "personal" }}>
                  <torusGeometry args={[0.105, 0.03, 8, 20]} />
                </Part>
                <Part mat={t.get("trousers")} userData={{ outfit: "professional" }}>
                  <cylinderGeometry args={[0.13, 0.12, 0.34, 18]} />
                </Part>
              </group>
            </group>
          </group>
        ))}

        {/* Bushy tail. */}
        <group position={[0, 0.6, -0.26]} rotation-x={-1.05}>
          <group ref={tail}>
            <Part geometry={g.tail} scale={[1, 1, 0.85]} mat={t.get("vertex")}>{null}</Part>
          </group>
        </group>

        <group ref={torso}>
          {/* Hoodie: "MB." print, kangaroo pocket, ribbed hem, hood and drawstrings. */}
          <group userData={{ outfit: "personal" }}>
            <Part geometry={g.torso} scale={[1, 1, 0.82]} mat={t.get("hoodie")}>
            </Part>
            {/* The print sits on a thin cone patch that follows the chest's curve. */}
            <mesh position-y={0.89} scale={[1, 1, 0.82]}>
              <cylinderGeometry args={[0.358, 0.402, 0.27, 24, 1, true, -0.37, 0.74]} />
              <meshBasicMaterial map={logo} transparent depthWrite={false} color="#e2e2e2" polygonOffset polygonOffsetFactor={-4} />
            </mesh>
            <Part position-y={0.47} rotation-x={Math.PI / 2} scale={[1, 0.82, 1]} mat={t.get("rib")}>
              <torusGeometry args={[0.35, 0.04, 8, 32]} />
            </Part>
            <Part position={[0, 0.66, 0]} scale={[1, 1, 0.82]} mat={t.get("rib")}>
              <cylinderGeometry args={[0.408, 0.41, 0.15, 24, 1, true, -0.62, 1.24]} />
            </Part>
            <Part position={[0, 1.27, -0.06]} rotation-x={Math.PI / 2 - 0.25} mat={t.get("hoodie")}>
              <torusGeometry args={[0.2, 0.09, 12, 28]} />
            </Part>
            <Part position={[0, 1.36, -0.24]} scale={[0.25, 0.2, 0.13]} mat={t.get("hoodie")}>
              <sphereGeometry args={[1, 20, 14]} />
            </Part>
            {[1, -1].map((s) => (
              <group key={s} position={[s * 0.085, 1.15, 0.27]} rotation-x={-0.3}>
                <mesh material={t.get("shirt")}>
                  <cylinderGeometry args={[0.011, 0.011, 0.12, 6]} />
                </mesh>
                <Part position-y={-0.07} mat={t.get("shirt")}>
                  <cylinderGeometry args={[0.017, 0.017, 0.04, 8]} />
                </Part>
              </group>
            ))}
          </group>

          {/* Black blazer over a white shirt and black tie. */}
          <group userData={{ outfit: "professional" }}>
            <Part geometry={g.torso} scale={[1, 1, 0.82]} mat={t.get("blazer")}>
              <Decal position={[0, 1.04, 0.3]} scale={[0.58, 0.58, 0.5]} map={suit} />
            </Part>
            {[1, -1].map((s) => (
              <Part key={s} position={[s * 0.07, 1.28, 0.13]} rotation={[0.45, 0, s * 0.75]} mat={t.get("shirt")}>
                <boxGeometry args={[0.11, 0.05, 0.02]} />
              </Part>
            ))}
            <Part position={[0, 1.25, 0.17]} rotation-x={0.3} mat={t.get("tie")}>
              <boxGeometry args={[0.055, 0.05, 0.03]} />
            </Part>
          </group>
        </group>

        <Arm side={1} t={t} g={g} refs={armR} />
        <Arm side={-1} t={t} g={g} refs={armL} />

        {/* Head pivots at the neck. */}
        <group ref={head} position={[0, 1.36, 0]}>
          <group position={[0, 0.47, 0]}>
            <Part scale={[1.12, 0.9, 0.95]} mat={t.get("furDark", headTex)}>
              <sphereGeometry args={[0.48, 40, 28]} />
            </Part>

            {/* Cheek tufts give the wolf his silhouette. */}
            {[1, -1].map((s) =>
              [
                [0.47, -0.08, 2.1, 0.11, 0.24],
                [0.43, -0.2, 2.6, 0.1, 0.22],
                [0.34, -0.29, 2.95, 0.08, 0.17],
              ].map(([x, y, rz, r, hgt], i) => (
                <Part key={`${s}${i}`} position={[s * x, y, 0.06]} rotation-z={-s * rz} scale={[1, 1, 0.5]} mat={t.get("furLight")}>
                  <coneGeometry args={[r, hgt, 4]} />
                </Part>
              )),
            )}
            {/* Crown tuft. */}
            {[[-0.05, 0.3], [0.06, -0.25]].map(([x, rz], i) => (
              <Part key={i} position={[x, 0.45, 0.05]} rotation-z={rz} scale={[1, 1, 0.5]} mat={t.get("furDark")}>
                <coneGeometry args={[0.07, 0.17, 4]} />
              </Part>
            ))}

            {/* Snout, nose and the jaw that drops when he talks. */}
            <Part geometry={g.snout} position={[0, -0.12, 0.3]} rotation-x={Math.PI / 2} scale={[1, 1, 0.8]} mat={t.get("vertex")}>
              {null}
            </Part>
            <Part position={[0, -0.075, 0.6]} scale={[0.07, 0.048, 0.05]} mat={t.get("nose")}>
              <sphereGeometry args={[1, 16, 12]} />
            </Part>
            <mesh position={[-0.02, -0.055, 0.645]} material={t.flat("white")}>
              <sphereGeometry args={[0.012, 8, 6]} />
            </mesh>
            <group ref={jaw} position={[0, -0.17, 0.32]}>
              <mesh position={[0, 0.0, 0.12]} scale={[0.09, 0.05, 0.16]} material={t.get("mouth")}>
                <sphereGeometry args={[1, 16, 12]} />
              </mesh>
              <Part position={[0, -0.035, 0.12]} scale={[0.11, 0.045, 0.17]} mat={t.get("furLight")}>
                <sphereGeometry args={[1, 18, 12]} />
              </Part>
            </group>

            {/* Almond eyes with amber irises, heavy lids and pale brows. */}
            {[1, -1].map((s, i) => (
              <group key={s} position={[s * 0.175, 0.05, 0.415]} rotation={[0, s * 0.38, s * 0.22]}>
                <mesh scale={[0.085, 0.064, 0.04]} material={t.flat("white")}>
                  <sphereGeometry args={[1, 20, 14]} />
                  <Outlines thickness={OUTLINE * 0.8} color={PALETTE.ink} />
                </mesh>
                <mesh position={[-s * 0.008, -0.004, 0.02]} scale={[0.048, 0.052, 0.03]} material={t.flat("iris")}>
                  <sphereGeometry args={[1, 16, 12]} />
                </mesh>
                <mesh position={[-s * 0.008, -0.004, 0.035]} scale={[0.026, 0.032, 0.02]} material={t.flat("ink")}>
                  <sphereGeometry args={[1, 12, 10]} />
                </mesh>
                <mesh position={[-s * 0.008 + 0.015, 0.018, 0.05]} material={t.flat("white")}>
                  <sphereGeometry args={[0.011, 8, 6]} />
                </mesh>
                <mesh
                  ref={(o) => void (o && (lids.current[i] = o))}
                  position={[0, 0.065, 0.012]}
                  scale={[0.1, 0.05, 0.045]}
                  material={t.get("furMid")}
                >
                  <sphereGeometry args={[1, 18, 12]} />
                </mesh>
                <mesh
                  ref={(o) => void (o && (brows.current[i] = o))}
                  position={[s * 0.01, 0.15, 0.01]}
                  rotation-z={-s * 0.25}
                  material={t.get("furLight")}
                >
                  <capsuleGeometry args={[0.018, 0.07, 4, 8]} />
                </mesh>
              </group>
            ))}

            {/* Tall ears with pink insides and a pale tuft. */}
            {[1, -1].map((s, i) => (
              <group key={s} position={[s * 0.27, 0.34, -0.06]} rotation={[0, 0, -s * 0.24]}>
                <group ref={(o) => void (o && (ears.current[i] = o))}>
                  <Part position-y={0.19} scale={[1, 1, 0.42]} mat={t.get("furDark")}>
                    <coneGeometry args={[0.17, 0.42, 20]} />
                  </Part>
                  <Part position={[0, 0.15, 0.05]} scale={[1, 1, 0.3]} mat={t.get("innerEar")} outline={false}>
                    <coneGeometry args={[0.1, 0.28, 16]} />
                  </Part>
                  <Part position={[-s * 0.02, 0.06, 0.07]} rotation-z={s * 0.3} scale={[1, 1, 0.4]} mat={t.get("furLight")}>
                    <coneGeometry args={[0.06, 0.16, 4]} />
                  </Part>
                </group>
              </group>
            ))}

            {/* Black goggles resting on the forehead. */}
            <group ref={goggles}>
              <group rotation-x={-0.5}>
                <Part geometry={g.strap} position-y={0.06} rotation-x={Math.PI / 2} scale={[1.05, 0.93, 1]} mat={t.get("goggle")}>
                  {null}
                </Part>
                {[1, -1].map((s) => (
                  <group key={s} position={[s * 0.15, 0.06, 0.47]} rotation={[0, s * 0.3, 0]}>
                    <Part rotation-x={Math.PI / 2} mat={t.get("goggle")}>
                      <cylinderGeometry args={[0.115, 0.13, 0.1, 24]} />
                    </Part>
                    <Part position-z={0.052} mat={t.get("goggle")}>
                      <torusGeometry args={[0.105, 0.03, 10, 28]} />
                    </Part>
                    <mesh position-z={0.053} material={t.get("lens")}>
                      <circleGeometry args={[0.1, 28]} />
                    </mesh>
                    <mesh position={[-0.03, 0.035, 0.056]} rotation-z={0.7} material={t.flat("white")}>
                      <planeGeometry args={[0.07, 0.02]} />
                    </mesh>
                    <mesh position={[0.01, -0.005, 0.056]} rotation-z={0.7} material={t.flat("white")}>
                      <planeGeometry args={[0.025, 0.012]} />
                    </mesh>
                  </group>
                ))}
                <Part position={[0, 0.07, 0.5]} mat={t.get("goggle")}>
                  <boxGeometry args={[0.08, 0.05, 0.06]} />
                </Part>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
