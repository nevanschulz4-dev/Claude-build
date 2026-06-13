import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnvironmentStore, getDayFactor } from '../../store/environmentStore';

interface LanternPath {
  radiusFactor: number;
  speed: number;
  phase: number;
  color: string;
}

const LANTERN_PATHS: LanternPath[] = [
  { radiusFactor: 0.78, speed: 0.05, phase: 0, color: '#FFB36B' },
  { radiusFactor: 0.65, speed: -0.04, phase: 2.3, color: '#FFD9A0' },
  { radiusFactor: 0.88, speed: 0.03, phase: 4.5, color: '#FF9E6B' },
];

/** A small paper lantern that drifts slowly on the water and glows at night. */
function Lantern({ radiusFactor, speed, phase, color, pondRadius }: LanternPath & { pondRadius: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const timeOfDay = useEnvironmentStore.getState().timeOfDay;
    const nightAmount = Math.max(0, -getDayFactor(timeOfDay));

    if (matRef.current) matRef.current.opacity = nightAmount * 0.9;
    if (glowMatRef.current) glowMatRef.current.opacity = nightAmount * (0.7 + Math.sin(t * 4 + phase) * 0.25);

    const group = groupRef.current;
    if (!group) return;

    if (nightAmount <= 0.01) {
      group.visible = false;
      return;
    }
    group.visible = true;

    const r = pondRadius * radiusFactor;
    const a = t * speed + phase;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const bob = Math.sin(t * 1.2 + phase) * 0.025;

    group.position.set(x, 0.1 + bob, z);
    group.rotation.y = Math.sin(t * 0.5 + phase) * 0.3;
  });

  return (
    <group ref={groupRef} scale={0.6}>
      {/* Paper body */}
      <mesh>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshBasicMaterial ref={matRef} color={color} transparent opacity={0} />
      </mesh>
      {/* Inner glow */}
      <mesh scale={0.6}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshBasicMaterial
          ref={glowMatRef}
          color="#FFF4D6"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/** A few paper lanterns drifting on the pond, glowing warmly once night falls. */
export default function FloatingLanterns({ pondRadius = 6 }: { pondRadius?: number }) {
  const paths = useMemo(() => LANTERN_PATHS, []);

  return (
    <>
      {paths.map((path, i) => (
        <Lantern key={i} {...path} pondRadius={pondRadius} />
      ))}
    </>
  );
}
