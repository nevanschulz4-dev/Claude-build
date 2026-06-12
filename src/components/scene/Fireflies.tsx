import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnvironmentStore, getDayFactor } from '../../store/environmentStore';

interface FireflyPath {
  center: [number, number];
  radius: number;
  height: number;
  speed: number;
  phase: number;
  bobSpeed: number;
}

const FIREFLY_COUNT = 14;

/** Tiny glowing motes that drift lazily over the grass at night. */
export default function Fireflies() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const paths = useMemo<FireflyPath[]>(
    () =>
      Array.from({ length: FIREFLY_COUNT }, (_, i) => {
        const angle = (i / FIREFLY_COUNT) * Math.PI * 2 + Math.sin(i * 3.1) * 0.5;
        const r = 7 + ((i * 17) % 60) / 10;
        return {
          center: [Math.cos(angle) * r, Math.sin(angle) * r],
          radius: 0.6 + ((i * 11) % 10) / 10,
          height: 0.3 + ((i * 7) % 12) / 10,
          speed: 0.15 + ((i * 5) % 10) / 40,
          phase: i * 1.37,
          bobSpeed: 0.8 + ((i * 3) % 10) / 10,
        };
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const timeOfDay = useEnvironmentStore.getState().timeOfDay;
    const nightAmount = Math.max(0, -getDayFactor(timeOfDay));

    if (matRef.current) {
      matRef.current.opacity = nightAmount * (0.55 + Math.sin(t * 3) * 0.15);
    }

    if (nightAmount <= 0.01) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;

    paths.forEach((path, i) => {
      const a = t * path.speed + path.phase;
      const x = path.center[0] + Math.cos(a) * path.radius;
      const z = path.center[1] + Math.sin(a * 1.4) * path.radius;
      const y = path.height + Math.sin(t * path.bobSpeed + path.phase) * 0.25;
      const flicker = 0.6 + Math.sin(t * 6 + path.phase * 3) * 0.4;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.025 * Math.max(0.3, flicker));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, FIREFLY_COUNT]} frustumCulled={false} renderOrder={3}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        ref={matRef}
        color="#D4FF7A"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
