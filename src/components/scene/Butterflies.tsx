import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnvironmentStore, getDayFactor } from '../../store/environmentStore';

interface ButterflyPath {
  center: [number, number];
  radius: number;
  height: number;
  speed: number;
  phase: number;
  color: string;
}

/** Where each butterfly loiters, expressed as an angle + distance past the pond's edge so it stays on the grass at any pond size. */
const PATH_DEFS: { angle: number; offset: number; radius: number; height: number; speed: number; phase: number; color: string }[] = [
  { angle: 0.71, offset: 1.4, radius: 1.2, height: 1.1, speed: 0.5, phase: 0, color: '#FFD166' },
  { angle: 2.53, offset: 1.2, radius: 1.0, height: 1.3, speed: 0.65, phase: 1.8, color: '#FF8FBF' },
  { angle: -0.95, offset: 1.3, radius: 0.9, height: 0.95, speed: 0.42, phase: 3.6, color: '#9BE8FF' },
];

/** A small butterfly that flutters in loops over the grass. */
function Butterfly({ path }: { path: ButterflyPath }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = t * path.speed + path.phase;
    const x = path.center[0] + Math.cos(a) * path.radius;
    const z = path.center[1] + Math.sin(a * 1.4) * path.radius * 0.7;
    const y = path.height + Math.sin(t * 1.6 + path.phase) * 0.18;

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
      const vx = -Math.sin(a) * path.radius;
      const vz = Math.cos(a * 1.4) * path.radius * 0.7 * 1.4;
      groupRef.current.rotation.y = Math.atan2(vx, vz);
    }

    // Wings flap by scaling outward/inward rather than hinging, for a fluttering look.
    const flap = 0.4 + Math.abs(Math.sin(t * 9 + path.phase)) * 0.6;
    if (leftWingRef.current) leftWingRef.current.scale.x = flap;
    if (rightWingRef.current) rightWingRef.current.scale.x = flap;
  });

  return (
    <group ref={groupRef} scale={1.1}>
      {/* Body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.015, 0.1, 4, 6]} />
        <meshBasicMaterial color="#2A2A2A" />
      </mesh>
      {/* Wings */}
      <mesh ref={leftWingRef} position={[-0.06, 0.01, 0]}>
        <planeGeometry args={[0.14, 0.16]} />
        <meshBasicMaterial color={path.color} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
      <mesh ref={rightWingRef} position={[0.06, 0.01, 0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.14, 0.16]} />
        <meshBasicMaterial color={path.color} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/** A few butterflies fluttering over the grass around the pond during the day. */
export default function Butterflies({ pondRadius = 6 }: { pondRadius?: number }) {
  const paths = useMemo<ButterflyPath[]>(
    () =>
      PATH_DEFS.map(({ angle, offset, ...rest }) => {
        const d = pondRadius + offset;
        return { center: [Math.cos(angle) * d, Math.sin(angle) * d], ...rest };
      }),
    [pondRadius],
  );
  const timeOfDay = useEnvironmentStore((s) => s.timeOfDay);
  const weather = useEnvironmentStore((s) => s.weather);

  if (getDayFactor(timeOfDay) < 0.3 || weather === 'rain') return null;

  return (
    <>
      {paths.map((path, i) => (
        <Butterfly key={i} path={path} />
      ))}
    </>
  );
}
