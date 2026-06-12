import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useToonGradient } from '../../utils/textures';
import { playSplash } from '../../utils/audio';

const SHELL_COLOR = '#4F7942';
const SKIN_COLOR = '#8FBF6B';

/** A friendly turtle that paddles slow loops around the pond, occasionally surfacing for air. */
export default function Turtle({ pondRadius = 6 }: { pondRadius?: number }) {
  const gradientMap = useToonGradient(4);
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const flipperRefs = useRef<(THREE.Mesh | null)[]>([]);

  const shellMat = useMemo(() => new THREE.MeshToonMaterial({ color: SHELL_COLOR, gradientMap }), [gradientMap]);
  const skinMat = useMemo(() => new THREE.MeshToonMaterial({ color: SKIN_COLOR, gradientMap }), [gradientMap]);

  const path = useMemo(
    () => ({
      radius: Math.min(pondRadius * 0.6, pondRadius - 1.2),
      speed: 0.06,
      phase: 1.1,
    }),
    [pondRadius],
  );

  const wasSurfacing = useRef(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = t * path.speed + path.phase;
    // Surfaces for a breath every ~25s, otherwise cruises just below the surface.
    const surfaceCycle = (t * 0.04) % 1;
    const surfacing = surfaceCycle > 0.85 ? Math.sin(((surfaceCycle - 0.85) / 0.15) * Math.PI) : 0;
    const depth = -0.18 + surfacing * 0.16;

    if (surfacing > 0.05 && !wasSurfacing.current) {
      playSplash();
    }
    wasSurfacing.current = surfacing > 0.05;

    if (groupRef.current) {
      groupRef.current.position.set(Math.cos(a) * path.radius, depth, Math.sin(a) * path.radius);
      const vx = -Math.sin(a);
      const vz = Math.cos(a);
      groupRef.current.rotation.y = Math.atan2(vx, vz);
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 1.3) * 0.08;
    }
    flipperRefs.current.forEach((m, i) => {
      if (!m) return;
      const side = i % 2 === 0 ? 1 : -1;
      m.rotation.z = Math.sin(t * 2.2 + i * Math.PI) * 0.4 * side;
    });
  });

  return (
    <group ref={groupRef} scale={0.55}>
      {/* Shell */}
      <mesh material={shellMat} castShadow scale={[1, 0.6, 0.8]}>
        <sphereGeometry args={[0.55, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* Belly */}
      <mesh material={skinMat} position={[0, -0.05, 0]} scale={[0.95, 0.32, 0.75]}>
        <sphereGeometry args={[0.55, 14, 10]} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0.55, 0.04, 0]}>
        <mesh material={skinMat}>
          <sphereGeometry args={[0.18, 12, 10]} />
        </mesh>
        {[1, -1].map((side) => (
          <mesh key={side} position={[0.13, 0.06, 0.1 * side]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#1c1c22" />
          </mesh>
        ))}
      </group>

      {/* Flippers */}
      {[
        [0.32, -0.02, 0.45],
        [0.32, -0.02, -0.45],
        [-0.38, -0.02, 0.4],
        [-0.38, -0.02, -0.4],
      ].map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            flipperRefs.current[i] = el;
          }}
          material={skinMat}
          position={pos as [number, number, number]}
          scale={[0.32, 0.08, 0.22]}
        >
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
      ))}

      {/* Tail */}
      <mesh material={skinMat} position={[-0.58, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.18, 8]} />
      </mesh>
    </group>
  );
}
