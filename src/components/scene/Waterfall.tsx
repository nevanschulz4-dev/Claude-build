import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const STREAK_COUNT = 5;
const FALL_HEIGHT = 3.2;
const FALL_SPEED = 1.6;

interface WaterfallProps {
  gradientMap: THREE.Texture;
}

/** A cascade tumbling off a rocky outcrop, feeding the river as it winds toward the horizon. */
export default function Waterfall({ gradientMap }: WaterfallProps) {
  const streakRefs = useRef<(THREE.Mesh | null)[]>([]);
  const offsets = useMemo(() => Array.from({ length: STREAK_COUNT }, (_, i) => i / STREAK_COUNT), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    offsets.forEach((offset, i) => {
      const mesh = streakRefs.current[i];
      if (!mesh) return;
      const phase = (offset + (t * FALL_SPEED) / FALL_HEIGHT) % 1;
      mesh.position.y = FALL_HEIGHT * (0.5 - phase);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(phase * Math.PI) * 0.55;
    });
  });

  return (
    <group position={[-3.2, 0, -7.5]}>
      {/* Rocky cliff face */}
      <mesh position={[0, FALL_HEIGHT / 2 + 0.1, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[2.2, FALL_HEIGHT + 0.4, 1.2]} />
        <meshToonMaterial color="#8A8F86" gradientMap={gradientMap} />
      </mesh>

      {/* Falling water sheet */}
      <mesh position={[0, FALL_HEIGHT / 2, 0.32]}>
        <planeGeometry args={[1.4, FALL_HEIGHT]} />
        <meshBasicMaterial color="#BFF3EC" transparent opacity={0.55} depthWrite={false} />
      </mesh>

      {/* Streaks of foam tumble down the cascade */}
      {offsets.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            streakRefs.current[i] = el;
          }}
          position={[0, 0, 0.33]}
        >
          <planeGeometry args={[1.4, 0.18]} />
          <meshBasicMaterial color="#EAFBFF" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}

      {/* Splash pool at the base */}
      <mesh position={[0, 0.06, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 20]} />
        <meshBasicMaterial color="#EAFBFF" transparent opacity={0.5} depthWrite={false} />
      </mesh>

      {/* Mist drifting up from the impact */}
      <Sparkles position={[0, 0.5, 0.8]} count={14} scale={[1.6, 1.2, 0.8]} size={2} speed={0.4} color="#EAFBFF" />
    </group>
  );
}
