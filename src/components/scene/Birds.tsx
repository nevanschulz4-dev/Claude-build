import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BirdPath {
  baseY: number;
  baseZ: number;
  xRange: number;
  speed: number;
  phase: number;
  wingPhase: number;
}

const BIRD_PATHS: BirdPath[] = [
  { baseY: 3.8, baseZ: -6, xRange: 5, speed: 0.18, phase: 0, wingPhase: 0 },
  { baseY: 4.1, baseZ: -6.5, xRange: 4, speed: 0.24, phase: 2.1, wingPhase: 1.4 },
  { baseY: 3.5, baseZ: -5.5, xRange: 5.5, speed: 0.14, phase: 4.2, wingPhase: 2.8 },
];

/** A small gliding bird made of two flapping wing planes. */
function Bird({ path }: { path: BirdPath }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = t * path.speed + path.phase;
    const x = Math.sin(a) * path.xRange;
    const z = path.baseZ + Math.cos(a) * 1.5;
    const y = path.baseY + Math.sin(a * 2) * 0.4;

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
      const vx = Math.cos(a) * path.xRange;
      const vz = -Math.sin(a) * 1.5;
      groupRef.current.rotation.y = Math.atan2(vx, vz);
    }

    const flap = Math.sin(t * 9 + path.wingPhase) * 0.6;
    if (leftWingRef.current) leftWingRef.current.rotation.z = flap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -flap;
  });

  return (
    <group ref={groupRef} scale={2}>
      <mesh ref={leftWingRef} position={[-0.12, 0, 0]}>
        <planeGeometry args={[0.26, 0.06]} />
        <meshBasicMaterial color="#3a3a3a" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={rightWingRef} position={[0.12, 0, 0]}>
        <planeGeometry args={[0.26, 0.06]} />
        <meshBasicMaterial color="#3a3a3a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** A handful of birds gliding across the sky during the daytime. */
export default function Birds() {
  const paths = useMemo(() => BIRD_PATHS, []);

  return (
    <>
      {paths.map((path, i) => (
        <Bird key={i} path={path} />
      ))}
    </>
  );
}
