import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface JellyPath {
  radius: number;
  speed: number;
  phase: number;
  depth: number;
  color: string;
}

const JELLY_COUNT = 3;
const COLORS = ['#FF9ED2', '#9ED2FF', '#C9A8FF'];
const TENTACLE_COUNT = 5;

/** A single glowing jellyfish that pulses as it drifts in a slow loop. */
function Jelly({ path }: { path: JellyPath }) {
  const groupRef = useRef<THREE.Group>(null);
  const bellRef = useRef<THREE.Mesh>(null);
  const tentacleRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = t * path.speed + path.phase;
    if (groupRef.current) {
      groupRef.current.position.set(
        Math.cos(a) * path.radius,
        path.depth + Math.sin(t * 0.6 + path.phase) * 0.15,
        Math.sin(a) * path.radius,
      );
    }
    const pulse = 1 + Math.sin(t * 2 + path.phase) * 0.12;
    if (bellRef.current) {
      bellRef.current.scale.set(pulse, 1 / pulse, pulse);
    }
    tentacleRefs.current.forEach((m, i) => {
      if (!m) return;
      m.rotation.z = Math.sin(t * 2.5 + i + path.phase) * 0.15;
      m.rotation.x = Math.cos(t * 2.2 + i + path.phase) * 0.15;
    });
  });

  return (
    <group ref={groupRef}>
      <mesh ref={bellRef} scale={[1, 0.7, 1]} renderOrder={2}>
        <sphereGeometry args={[0.35, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial
          color={path.color}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      {Array.from({ length: TENTACLE_COUNT }, (_, i) => {
        const angle = (i / TENTACLE_COUNT) * Math.PI * 2;
        return (
          <mesh
            key={i}
            ref={(el) => {
              tentacleRefs.current[i] = el;
            }}
            position={[Math.cos(angle) * 0.18, -0.25, Math.sin(angle) * 0.18]}
            renderOrder={2}
          >
            <cylinderGeometry args={[0.012, 0.004, 0.5, 4]} />
            <meshBasicMaterial color={path.color} transparent opacity={0.3} depthWrite={false} depthTest={false} />
          </mesh>
        );
      })}
    </group>
  );
}

/** A small group of bioluminescent jellyfish drifting through deeper water. */
export default function Jellyfish() {
  const paths = useMemo<JellyPath[]>(
    () =>
      Array.from({ length: JELLY_COUNT }, (_, i) => ({
        radius: 1.5 + (i % 3) * 1.0,
        speed: 0.08 + (i % 3) * 0.03,
        phase: (i / JELLY_COUNT) * Math.PI * 2,
        depth: -0.4 - (i % 3) * 0.2,
        color: COLORS[i % COLORS.length],
      })),
    [],
  );

  return (
    <group>
      {paths.map((path, i) => (
        <Jelly key={i} path={path} />
      ))}
    </group>
  );
}
