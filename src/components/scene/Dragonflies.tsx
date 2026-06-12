import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnvironmentStore, getDayFactor } from '../../store/environmentStore';

interface DragonflyPath {
  center: [number, number];
  radius: number;
  height: number;
  speed: number;
  phase: number;
  color: string;
}

const PATHS: DragonflyPath[] = [
  { center: [1.6, -1.2], radius: 1.1, height: 0.55, speed: 0.7, phase: 0, color: '#3DFFC4' },
  { center: [-1.8, 1.4], radius: 0.9, height: 0.65, speed: 0.55, phase: 2.4, color: '#FF6B9D' },
];

/** A small iridescent dragonfly that hovers and darts above the pond surface. */
function Dragonfly({ path }: { path: DragonflyPath }) {
  const groupRef = useRef<THREE.Group>(null);
  const wingFrontRef = useRef<THREE.Mesh>(null);
  const wingBackRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = t * path.speed + path.phase;
    const x = path.center[0] + Math.cos(a) * path.radius;
    const z = path.center[1] + Math.sin(a * 1.3) * path.radius * 0.6;
    const y = path.height + Math.sin(t * 3 + path.phase) * 0.08;

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
      const vx = -Math.sin(a) * path.radius;
      const vz = Math.cos(a * 1.3) * path.radius * 0.6 * 1.3;
      groupRef.current.rotation.y = Math.atan2(vx, vz);
    }

    const flutter = Math.sin(t * 28) * 0.5 + 0.5;
    if (wingFrontRef.current) wingFrontRef.current.rotation.x = -0.1 - flutter * 0.5;
    if (wingBackRef.current) wingBackRef.current.rotation.x = 0.1 + flutter * 0.5;
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.022, 0.24, 4, 8]} />
        <meshBasicMaterial color={path.color} />
      </mesh>
      {/* Wings */}
      <mesh ref={wingFrontRef} position={[0, 0.015, 0.05]}>
        <planeGeometry args={[0.24, 0.08]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={wingBackRef} position={[0, 0.015, -0.05]}>
        <planeGeometry args={[0.21, 0.07]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** A couple of dragonflies hovering and darting over the pond. */
export default function Dragonflies() {
  const paths = useMemo(() => PATHS, []);
  const timeOfDay = useEnvironmentStore((s) => s.timeOfDay);
  const weather = useEnvironmentStore((s) => s.weather);

  if (getDayFactor(timeOfDay) < 0.1 || weather === 'rain') return null;

  return (
    <>
      {paths.map((path, i) => (
        <Dragonfly key={i} path={path} />
      ))}
    </>
  );
}
