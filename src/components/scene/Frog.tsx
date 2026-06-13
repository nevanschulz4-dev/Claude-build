import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HOP_DURATION = 0.45;
const HOP_HEIGHT = 0.28;

interface FrogProps {
  pads: { x: number; z: number }[];
  gradientMap: THREE.Texture;
  startIndex: number;
  seed: number;
}

/** A little frog that sits on a lily pad and occasionally hops to another. */
export default function Frog({ pads, gradientMap, startIndex, seed }: FrogProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const state = useRef({
    current: startIndex,
    target: startIndex,
    hopping: false,
    hopStart: 0,
    nextHop: 3 + seed * 5,
  });

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const s = state.current;

    if (!s.hopping && t > s.nextHop && pads.length > 1) {
      let next = Math.floor(Math.random() * pads.length);
      if (next === s.current) next = (next + 1) % pads.length;
      s.target = next;
      s.hopping = true;
      s.hopStart = t;
    }

    const from = pads[s.current];
    const to = pads[s.target];

    if (s.hopping) {
      const progress = (t - s.hopStart) / HOP_DURATION;
      if (progress >= 1) {
        s.current = s.target;
        s.hopping = false;
        s.nextHop = t + 4 + Math.random() * 8;
        pos.set(to.x, 0.07, to.z);
      } else {
        pos.set(
          THREE.MathUtils.lerp(from.x, to.x, progress),
          0.07 + Math.sin(progress * Math.PI) * HOP_HEIGHT,
          THREE.MathUtils.lerp(from.z, to.z, progress),
        );
        groupRef.current.lookAt(to.x, 0.07, to.z);
      }
    } else {
      pos.set(from.x, 0.07, from.z);
    }

    groupRef.current.position.copy(pos);

    if (bodyRef.current) {
      if (s.hopping) {
        const squash = 1 - Math.sin(((t - s.hopStart) / HOP_DURATION) * Math.PI) * 0.3;
        bodyRef.current.scale.set(1 / squash, squash, 1 / squash);
      } else {
        const breathe = 1 + Math.sin(t * 3 + seed) * 0.05;
        bodyRef.current.scale.set(1, breathe, 1);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={bodyRef} position={[0, 0.05, 0]} castShadow>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshToonMaterial color="#5FA84A" gradientMap={gradientMap} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.05, 0.13, 0.04]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshToonMaterial color="#E8F5C0" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.05, 0.13, 0.04]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshToonMaterial color="#E8F5C0" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.05, 0.145, 0.055]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.05, 0.145, 0.055]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}
