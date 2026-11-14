"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Wolf from "@/components/mascot/Wolf";
import { LAND_DOTS } from "@/lib/land-dots";

export type Stop = { city: string; lat: number; lon: number };

type Props = {
  stops: Stop[];
  accent: string;
  // Index of a stop to look at, or null to follow the plane.
  focus: number | null;
  // Bumped to restart the flight from the first stop.
  replay: number;
  calm: boolean;
  // Called with the leg being flown, or with the number of legs once the plane has landed.
  onLeg?: (leg: number) => void;
};

const R = 1;
const LEG_SECONDS = [3.2, 6.5];
// Stopover at each city between legs.
const PAUSE = 0.9;
// Landing: the plane fades out and the wolf pops up at the last stop.
const LAND_SECONDS = 0.7;
// The wolf is about 2.4 units tall, so this makes him a small pin-sized figure on the planet.
const WOLF_SCALE = 0.055;
// Fraction of the final route left undrawn after landing, so the trail stops short of the wolf.
const TRAIL_GAP = 0.16;

// Latitude/longitude to a point on the globe. Longitude 0 faces +z.
function toVec(lat: number, lon: number, r = R) {
  const phi = THREE.MathUtils.degToRad(lat);
  const lam = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(r * Math.cos(phi) * Math.sin(lam), r * Math.sin(phi), r * Math.cos(phi) * Math.cos(lam));
}

// A great-circle path between two points that lifts off the surface in the middle,
// higher for longer flights.
function arcPoints(a: THREE.Vector3, b: THREE.Vector3, n = 96) {
  const angle = a.angleTo(b);
  const lift = 0.08 + angle * 0.18;
  const pts: THREE.Vector3[] = [];
  const qa = new THREE.Quaternion();
  const axis = new THREE.Vector3().crossVectors(a, b).normalize();
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    qa.setFromAxisAngle(axis, angle * t);
    const p = a.clone().applyQuaternion(qa).normalize();
    pts.push(p.multiplyScalar(R + 0.01 + Math.sin(Math.PI * t) * lift));
  }
  return pts;
}

function LandDots({ color }: { color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = LAND_DOTS.length / 2;
  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const z = new THREE.Vector3(0, 0, 1);
    const s = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < count; i++) {
      const p = toVec(LAND_DOTS[i * 2], LAND_DOTS[i * 2 + 1], R + 0.002);
      q.setFromUnitVectors(z, p.clone().normalize());
      m.compose(p, q, s);
      ref.current!.setMatrixAt(i, m);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <circleGeometry args={[0.0085, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} />
    </instancedMesh>
  );
}

// Soft rim glow around the planet.
function Atmosphere({ color }: { color: string }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { c: { value: new THREE.Color(color) } },
        vertexShader:
          "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(c, 1.0) * i * 0.45; }",
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    [color],
  );
  return (
    <mesh scale={1.14} material={mat}>
      <sphereGeometry args={[R, 48, 48]} />
    </mesh>
  );
}

function Plane({ color }: { color: string }) {
  return (
    <group scale={0.06}>
      {/* Nose points along +z, wings along x, belly toward the globe (-y). */}
      <mesh rotation-x={Math.PI / 2}>
        <capsuleGeometry args={[0.28, 1.6, 4, 10]} />
        <meshStandardMaterial color="#f5f5f2" metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[2.6, 0.08, 0.55]} />
        <meshStandardMaterial color="#f5f5f2" />
      </mesh>
      <mesh position={[0, 0, -0.85]}>
        <boxGeometry args={[1.0, 0.06, 0.32]} />
        <meshStandardMaterial color="#f5f5f2" />
      </mesh>
      <mesh position={[0, 0.35, -0.85]}>
        <boxGeometry args={[0.06, 0.6, 0.38]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function Marker({ position, label, color, index, labelRef }: { position: THREE.Vector3; label: string; color: string; index: number; labelRef: (el: HTMLDivElement | null) => void }) {
  const ring = useRef<THREE.Mesh>(null);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize()), [position]);
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.8 + index * 0.33) % 1;
    ring.current!.scale.setScalar(1 + t * 2.2);
    (ring.current!.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - t);
  });
  return (
    <group position={position} quaternion={q}>
      <mesh position-z={0.004}>
        <circleGeometry args={[0.018, 20]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ring} position-z={0.003}>
        <ringGeometry args={[0.02, 0.026, 32]} />
        <meshBasicMaterial color={color} transparent />
      </mesh>
      <Html position={[0, 0, 0.02]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div ref={labelRef} className="translate-y-[-130%] whitespace-nowrap rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm transition-opacity duration-300">
          <span className="mr-1 font-mono text-[10px] text-white/50">0{index + 1}</span>
          {label}
        </div>
      </Html>
    </group>
  );
}

function World({ stops, accent, focus, replay, calm, onLeg }: Props) {
  const globe = useRef<THREE.Group>(null);
  const plane = useRef<THREE.Group>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const clock = useRef({ start: 0, leg: -1 });
  const wolf = useRef<THREE.Group>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const wolfAction = useRef<"idle" | "wave">("idle");
  const [action, setAction] = useState<"idle" | "wave">("idle");
  const tmp = useMemo(
    () => ({
      v: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      inv: new THREE.Quaternion(),
      look: new THREE.Matrix4(),
      up: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      side: new THREE.Vector3(),
      e: new THREE.Euler(),
    }),
    [],
  );

  const points = useMemo(() => stops.map((s) => toVec(s.lat, s.lon)), [stops]);
  const arcs = useMemo(() => points.slice(1).map((p, i) => arcPoints(points[i], p)), [points]);
  const geos = useMemo(() => arcs.map((a) => new THREE.BufferGeometry().setFromPoints(a)), [arcs]);
  const lines = useMemo(
    () =>
      geos.map((g) => {
        const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.95 }));
        return line;
      }),
    [geos, accent],
  );
  const ghost = useMemo(
    // Own geometry copies, so trimming the drawn trail never trims the dashed guide.
    () => geos.map((g) => new THREE.Line(g.clone(), new THREE.LineDashedMaterial({ color: "#ffffff", transparent: true, opacity: 0.18, dashSize: 0.02, gapSize: 0.02 })).computeLineDistances()),
    [geos],
  );
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);
  useEffect(() => () => ghost.forEach((l) => l.geometry.dispose()), [ghost]);

  useEffect(() => {
    clock.current.start = -1;
  }, [replay]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (clock.current.start < 0) clock.current.start = t;
    let e = calm ? Infinity : t - clock.current.start;

    // Which leg the plane is on and how far along it. The flight plays once and ends at the last stop.
    let leg = arcs.length - 1;
    let u = 1;
    let landed = true;
    for (let i = 0; i < arcs.length; i++) {
      const d = LEG_SECONDS[i] ?? 4;
      if (e < d) {
        leg = i;
        u = e / d;
        landed = false;
        break;
      }
      e -= d;
      if (i < arcs.length - 1) {
        if (e < PAUSE) {
          leg = i;
          u = 1;
          landed = false;
          break;
        }
        e -= PAUSE;
      }
    }
    // After the last leg, e is the time since touchdown.
    const sinceLanding = landed ? (calm ? LAND_SECONDS : e) : 0;
    const status = landed ? arcs.length : leg;
    if (clock.current.leg !== status) {
      clock.current.leg = status;
      onLeg?.(status);
    }
    const ease = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;

    // Draw each trail up to where the plane has been.
    const last = arcs.length - 1;
    const gap = (i: number, n: number) => (landed && i === last ? Math.floor(n * TRAIL_GAP * Math.min(1, sinceLanding / LAND_SECONDS)) : 0);
    lines.forEach((line, i) => {
      const n = arcs[i].length;
      const upto = i < leg ? n : i === leg ? Math.max(2, Math.floor(ease * (n - 1)) + 1) : 0;
      line.geometry.setDrawRange(0, upto - gap(i, n));
    });
    ghost.forEach((line, i) => line.geometry.setDrawRange(0, arcs[i].length - (i === last && landed ? Math.floor(arcs[i].length * TRAIL_GAP) : 0)));

    // Place the plane on the arc, nose along the path, belly to the planet.
    const arc = arcs[leg];
    const f = ease * (arc.length - 1);
    const i0 = Math.min(arc.length - 2, Math.floor(f));
    const pos = tmp.v.copy(arc[i0]).lerp(arc[i0 + 1], f - i0);
    const next = arc[Math.min(arc.length - 1, i0 + 2)];
    plane.current!.position.copy(pos);
    tmp.up.copy(pos).normalize();
    tmp.look.lookAt(next, pos, tmp.up);
    // Matrix4.lookAt points +z from `pos` toward `next`, and the plane's nose is +z.
    plane.current!.quaternion.setFromRotationMatrix(tmp.look);
    const land = Math.min(1, sinceLanding / LAND_SECONDS);
    plane.current!.scale.setScalar(1 - land);
    plane.current!.visible = land < 1;

    // The wolf pops up at the last stop once the plane is down, with a little overshoot.
    const pop = Math.min(1, Math.max(0, (sinceLanding - LAND_SECONDS * 0.5) / 0.5));
    const springy = pop === 0 ? 0 : 1 + Math.sin(pop * Math.PI) * 0.25 * (1 - pop) - (1 - pop) * (1 - pop);
    const w = wolf.current!;
    w.visible = pop > 0;
    w.scale.setScalar(WOLF_SCALE * Math.max(0, springy));
    // Stand on the surface (feet down toward the centre) and face the viewer.
    const home = points[points.length - 1];
    w.position.copy(home);
    const upW = tmp.up.copy(home).normalize().applyQuaternion(globe.current!.quaternion);
    // Face the camera: its direction from the planet, flattened onto the ground at Tempe.
    tmp.fwd.copy(state.camera.position).normalize();
    const fwdW = tmp.fwd.addScaledVector(upW, -tmp.fwd.dot(upW)).normalize();
    tmp.look.makeBasis(tmp.side.crossVectors(upW, fwdW), upW, fwdW);
    w.quaternion.setFromRotationMatrix(tmp.look).premultiply(tmp.inv.copy(globe.current!.quaternion).invert());
    // Hide the bubble when Tempe turns to the far side, since HTML is not occluded by the planet.
    const homeFacing = upW.dot(tmp.side.copy(state.camera.position).normalize());
    if (bubble.current) bubble.current.style.opacity = pop >= 1 && homeFacing > 0.15 ? "1" : "0";
    if (wolfAction.current !== (pop > 0 && sinceLanding < 4 ? "wave" : "idle")) {
      wolfAction.current = pop > 0 && sinceLanding < 4 ? "wave" : "idle";
      setAction(wolfAction.current);
    }

    // Turn the globe so the plane (or the focused city) faces the camera, tilted a little.
    // Yaw the target's longitude to the front, then pitch its latitude to just above centre,
    // so north always stays up.
    // After landing, the "home" view puts Tempe on the top edge of the planet and leans the camera in,
    // so the wolf stands upright against the sky instead of being seen from straight above.
    const homeView = landed && (focus === null || focus === points.length - 1);
    const target = (focus !== null ? points[focus] : landed ? points[points.length - 1] : pos).clone().normalize();
    const lat = Math.asin(target.y);
    const lon = Math.atan2(target.x, target.z);
    const pitch = homeView ? 1.15 : 0.25;
    const want = tmp.q.setFromEuler(tmp.e.set(lat - pitch, -lon, 0, "XYZ"));
    const camZ = homeView ? 2.7 : 3.4;
    const camY = homeView ? 0.72 : 0;
    const k = calm ? 1 : 1 - Math.exp(-dt * 2);
    state.camera.position.z += (camZ - state.camera.position.z) * k;
    state.camera.position.y += (camY - state.camera.position.y) * k;
    state.camera.lookAt(0, state.camera.position.y, 0);
    globe.current!.quaternion.slerp(want, calm ? 1 : 1 - Math.exp(-dt * (focus !== null ? 4 : 1.8)));

    // Fade labels on the far side of the planet.
    points.forEach((p, k) => {
      const el = labels.current[k];
      if (!el) return;
      const facing = tmp.v.copy(p).applyQuaternion(globe.current!.quaternion).z;
      const coveredByWolf = landed && k === points.length - 1;
      el.style.opacity = facing > 0.35 && !coveredByWolf ? "1" : "0";
    });
  });

  return (
    <group ref={globe}>
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial color="#0b0d14" roughness={0.9} metalness={0.1} />
      </mesh>
      <LandDots color="#cfd8e6" />
      <Atmosphere color={accent} />
      {ghost.map((l, i) => (
        <primitive key={`g${i}`} object={l} />
      ))}
      {lines.map((l, i) => (
        <primitive key={`l${i}`} object={l} />
      ))}
      {points.map((p, i) => (
        <Marker key={stops[i].city} position={p} label={stops[i].city} color={accent} index={i} labelRef={(el) => void (labels.current[i] = el)} />
      ))}
      <group ref={plane}>
        <Plane color={accent} />
      </group>
      <group ref={wolf} visible={false}>
        <Wolf outfit="personal" action={action} accent={accent} calm={calm} />
        <Html position={[0, 3.6, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div
            ref={bubble}
            className="relative whitespace-nowrap rounded-xl border border-white/15 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 opacity-0 shadow-lg transition-opacity duration-500"
          >
            📍 Currently here!
            <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" />
          </div>
        </Html>
      </group>
    </group>
  );
}

// The canvas only renders while it is on screen, to keep scrolling smooth.
export default function GlobeScene(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_82%,transparent)]">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 3.4], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 2, 4]} intensity={2} />
        {/* Key light from the front-top so the wolf reads on the dark planet. */}
        <directionalLight position={[0, 3, 5]} intensity={1.6} />
        <World {...props} />
      </Canvas>
    </div>
  );
}
