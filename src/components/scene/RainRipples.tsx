import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnvironmentStore } from '../../store/environmentStore';

const RIPPLE_COUNT = 10;
const RIPPLE_LIFETIME = 0.9;
const WATER_LEVEL = 0.052;

interface RippleState {
  x: number;
  z: number;
  start: number;
  nextSpawn: number;
}

/** Small expanding rings that pop up across the pond surface while it rains. */
export default function RainRipples({ pondRadius = 6 }: { pondRadius?: number }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const matRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  const ripples = useMemo<RippleState[]>(
    () =>
      Array.from({ length: RIPPLE_COUNT }, (_, i) => ({
        x: 0,
        z: 0,
        start: -RIPPLE_LIFETIME,
        nextSpawn: i * 0.18,
      })),
    [],
  );

  useFrame(({ clock }) => {
    const isRaining = useEnvironmentStore.getState().weather === 'rain';
    const t = clock.getElapsedTime();

    ripples.forEach((r, i) => {
      const mesh = meshRefs.current[i];
      const mat = matRefs.current[i];
      if (!mesh || !mat) return;

      if (!isRaining) {
        mesh.visible = false;
        return;
      }

      if (t > r.nextSpawn && t - r.start > RIPPLE_LIFETIME) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * pondRadius * 0.92;
        r.x = Math.cos(angle) * dist;
        r.z = Math.sin(angle) * dist;
        r.start = t;
        r.nextSpawn = t + 0.15 + Math.random() * 0.35;
      }

      const age = t - r.start;
      if (age < 0 || age > RIPPLE_LIFETIME) {
        mesh.visible = false;
        return;
      }

      const progress = age / RIPPLE_LIFETIME;
      mesh.visible = true;
      mesh.position.set(r.x, WATER_LEVEL, r.z);
      mesh.scale.setScalar(0.05 + progress * 0.5);
      mat.opacity = (1 - progress) * 0.6;
    });
  });

  return (
    <group>
      {Array.from({ length: RIPPLE_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
          renderOrder={2}
        >
          <ringGeometry args={[0.5, 0.65, 16]} />
          <meshBasicMaterial
            ref={(el) => {
              matRefs.current[i] = el;
            }}
            color="#ffffff"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      ))}
    </group>
  );
}
