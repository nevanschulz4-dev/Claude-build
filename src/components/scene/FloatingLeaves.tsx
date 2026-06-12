import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LeafPath {
  radius: number;
  speed: number;
  phase: number;
  spinSpeed: number;
  color: string;
  size: number;
}

const LEAF_COUNT = 5;
const LEAF_COLORS = ['#C9A24B', '#D98E3B', '#A8B43A', '#8FBF6B', '#E0C168'];
const WATER_LEVEL = 0.065;

function Leaf({ path }: { path: LeafPath }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const a = t * path.speed + path.phase;
    meshRef.current.position.set(
      Math.cos(a) * path.radius,
      WATER_LEVEL + Math.sin(t * 1.5 + path.phase) * 0.01,
      Math.sin(a) * path.radius * 0.85,
    );
    meshRef.current.rotation.z = t * path.spinSpeed + path.phase;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} scale={path.size}>
      <circleGeometry args={[1, 7]} />
      <meshToonMaterial color={path.color} side={THREE.DoubleSide} transparent opacity={0.85} />
    </mesh>
  );
}

/** A handful of leaves and petals drifting slowly on the pond's surface. */
export default function FloatingLeaves({ radius = 5 }: { radius?: number }) {
  const paths = useMemo<LeafPath[]>(
    () =>
      Array.from({ length: LEAF_COUNT }, (_, i) => ({
        radius: radius * (0.35 + (i % 3) * 0.2),
        speed: 0.05 + (i % 3) * 0.025,
        phase: (i / LEAF_COUNT) * Math.PI * 2 + i * 0.7,
        spinSpeed: 0.3 + (i % 2) * 0.4,
        color: LEAF_COLORS[i % LEAF_COLORS.length],
        size: 0.11 + (i % 3) * 0.03,
      })),
    [radius],
  );

  return (
    <group>
      {paths.map((path, i) => (
        <Leaf key={i} path={path} />
      ))}
    </group>
  );
}
