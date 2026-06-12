import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 220;
const AREA = 20;
const HEIGHT = 14;

interface Drop {
  pos: THREE.Vector3;
  speed: number;
}

/** Falling rain droplets, looping endlessly within a fixed volume above the pond. */
export default function Rain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dropsRef = useRef<Drop[]>([]);

  useEffect(() => {
    dropsRef.current = Array.from({ length: COUNT }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * AREA * 2,
        Math.random() * HEIGHT,
        (Math.random() - 0.5) * AREA * 2,
      ),
      speed: 9 + Math.random() * 7,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const drops = dropsRef.current;
    for (let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      drop.pos.y -= drop.speed * delta;
      if (drop.pos.y < -0.5) {
        drop.pos.y = HEIGHT;
        drop.pos.x = (Math.random() - 0.5) * AREA * 2;
        drop.pos.z = (Math.random() - 0.5) * AREA * 2;
      }
      dummy.position.copy(drop.pos);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <cylinderGeometry args={[0.008, 0.008, 0.4, 4]} />
      <meshBasicMaterial color="#9fd3ff" transparent opacity={0.45} />
    </instancedMesh>
  );
}
