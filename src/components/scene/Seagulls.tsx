import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnvironmentStore, getDayFactor } from '../../store/environmentStore';

interface GullPath {
  baseY: number;
  baseZ: number;
  xRange: number;
  speed: number;
  phase: number;
  wingPhase: number;
}

const GULL_PATHS: GullPath[] = [
  { baseY: 2.2, baseZ: -4.2, xRange: 4, speed: 0.32, phase: 0, wingPhase: 0 },
  { baseY: 2.7, baseZ: -3.4, xRange: 3.3, speed: 0.24, phase: 3.1, wingPhase: 1.7 },
];

/** A low-flying seagull made of two slow-flapping wing planes. */
function Seagull({ path }: { path: GullPath }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = t * path.speed + path.phase;
    const x = Math.sin(a) * path.xRange;
    const z = path.baseZ + Math.cos(a) * 1.5;
    const y = path.baseY + Math.sin(a * 2) * 0.3;

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
      const vx = Math.cos(a) * path.xRange;
      const vz = -Math.sin(a) * 1.5;
      groupRef.current.rotation.y = Math.atan2(vx, vz);
    }

    const flap = Math.sin(t * 5 + path.wingPhase) * 0.5;
    if (leftWingRef.current) leftWingRef.current.rotation.z = flap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -flap;
  });

  return (
    <group ref={groupRef} scale={2.2}>
      <mesh ref={leftWingRef} position={[-0.13, 0, 0]}>
        <planeGeometry args={[0.28, 0.07]} />
        <meshBasicMaterial color="#F5F0E0" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={rightWingRef} position={[0.13, 0, 0]}>
        <planeGeometry args={[0.28, 0.07]} />
        <meshBasicMaterial color="#F5F0E0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Seagulls wheeling low over the ocean during the day. */
export default function Seagulls() {
  const paths = useMemo(() => GULL_PATHS, []);
  const timeOfDay = useEnvironmentStore((s) => s.timeOfDay);
  const weather = useEnvironmentStore((s) => s.weather);

  if (getDayFactor(timeOfDay) < 0.1 || weather === 'rain') return null;

  return (
    <>
      {paths.map((path, i) => (
        <Seagull key={i} path={path} />
      ))}
    </>
  );
}
