import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 22;
const WATER_LEVEL = 0.05;

interface Bubble {
  pos: THREE.Vector3;
  speed: number;
  wobbleSpeed: number;
  wobblePhase: number;
  wobbleAmp: number;
  scale: number;
}

function resetBubble(b: Bubble, radius: number) {
  const r = Math.random() * radius * 0.85;
  const angle = Math.random() * Math.PI * 2;
  b.pos.set(Math.cos(angle) * r, -1.8 - Math.random() * 0.8, Math.sin(angle) * r);
}

/** Ambient bubbles that drift up from the pond bottom and pop at the surface. */
export default function Bubbles({ radius = 5 }: { radius?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bubblesRef = useRef<Bubble[]>([]);

  useEffect(() => {
    bubblesRef.current = Array.from({ length: COUNT }, () => {
      const bubble: Bubble = {
        pos: new THREE.Vector3(),
        speed: 0.12 + Math.random() * 0.22,
        wobbleSpeed: 1 + Math.random() * 2,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: 0.02 + Math.random() * 0.05,
        scale: 0.3 + Math.random() * 0.7,
      };
      resetBubble(bubble, radius);
      bubble.pos.y = -1.8 + Math.random() * 1.8;
      return bubble;
    });
  }, [radius]);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const bubbles = bubblesRef.current;
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      b.pos.y += b.speed * delta;
      if (b.pos.y > WATER_LEVEL) {
        resetBubble(b, radius);
      }
      dummy.position.set(
        b.pos.x + Math.sin(t * b.wobbleSpeed + b.wobblePhase) * b.wobbleAmp,
        b.pos.y,
        b.pos.z + Math.cos(t * b.wobbleSpeed + b.wobblePhase) * b.wobbleAmp,
      );
      dummy.scale.setScalar(b.scale * 0.1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false} renderOrder={2}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.55} depthWrite={false} />
    </instancedMesh>
  );
}
