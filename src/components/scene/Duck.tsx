import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useToonGradient } from '../../utils/textures';

interface DuckPath {
  speed: number;
  phase: number;
  bodyColor: string;
  headColor: string;
}

interface DuckProps extends DuckPath {
  radius: number;
  gradientMap: THREE.Texture;
}

/** A little duck paddling in a slow circle on the pond surface. */
function Duck({ radius, speed, phase, bodyColor, headColor, gradientMap }: DuckProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const a = t * speed + phase;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    const bob = Math.sin(t * 2.4 + phase) * 0.02;

    groupRef.current.position.set(x, 0.07 + bob, z);
    const vx = -Math.sin(a) * radius;
    const vz = Math.cos(a) * radius;
    groupRef.current.rotation.y = Math.atan2(vx, vz);
    groupRef.current.rotation.z = Math.sin(t * 2.4 + phase) * 0.04;
  });

  return (
    <group ref={groupRef} scale={0.55}>
      {/* Body */}
      <mesh position={[0, 0.1, 0]} scale={[0.85, 0.8, 1.1]} castShadow>
        <sphereGeometry args={[0.18, 14, 12]} />
        <meshToonMaterial color={bodyColor} gradientMap={gradientMap} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.16, -0.2]} rotation={[0.6, 0, 0]} castShadow>
        <coneGeometry args={[0.06, 0.14, 8]} />
        <meshToonMaterial color={bodyColor} gradientMap={gradientMap} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.27, 0.16]} castShadow>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshToonMaterial color={headColor} gradientMap={gradientMap} />
      </mesh>
      {/* Beak */}
      <mesh position={[0, 0.25, 0.27]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.04, 0.1, 8]} />
        <meshToonMaterial color="#F0A23C" gradientMap={gradientMap} />
      </mesh>
      {/* Wings */}
      <mesh position={[-0.16, 0.13, -0.02]} rotation={[0, 0, 0.3]} scale={[0.5, 0.7, 0.9]} castShadow>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshToonMaterial color={bodyColor} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.16, 0.13, -0.02]} rotation={[0, 0, -0.3]} scale={[0.5, 0.7, 0.9]} castShadow>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshToonMaterial color={bodyColor} gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

const DUCK_PATHS: (DuckPath & { radiusFactor: number })[] = [
  { radiusFactor: 0.45, speed: 0.18, phase: 0, bodyColor: '#F5F0E0', headColor: '#3FA34D' },
  { radiusFactor: 0.3, speed: -0.24, phase: 2.4, bodyColor: '#E8DCC8', headColor: '#E8DCC8' },
];

/** A pair of ducks paddling slow circles on the home pond. */
export default function Ducks({ pondRadius = 6 }: { pondRadius?: number }) {
  const gradientMap = useToonGradient(4);

  return (
    <>
      {DUCK_PATHS.map(({ radiusFactor, ...path }, i) => (
        <Duck key={i} {...path} radius={pondRadius * radiusFactor} gradientMap={gradientMap} />
      ))}
    </>
  );
}
