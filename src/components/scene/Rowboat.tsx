import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RowboatProps {
  gradientMap: THREE.Texture;
}

/** A small wooden rowboat moored near the dock, bobbing gently on the water. */
export default function Rowboat({ gradientMap }: RowboatProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = 0.07 + Math.sin(t * 1.3) * 0.025;
    groupRef.current.rotation.z = 0.05 + Math.sin(t * 1.1) * 0.025;
    groupRef.current.rotation.x = Math.sin(t * 0.9 + 1) * 0.015;
  });

  return (
    <group ref={groupRef} position={[2.1, 0.07, -1.3]} rotation={[0, 0.5, 0.05]}>
      {/* Hull */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.28, 0.65]} />
        <meshToonMaterial color="#A87C4F" gradientMap={gradientMap} />
      </mesh>
      {/* Interior */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[1.3, 0.08, 0.5]} />
        <meshToonMaterial color="#7A4A2B" gradientMap={gradientMap} />
      </mesh>
      {/* Bench seats */}
      <mesh position={[-0.4, 0.17, 0]}>
        <boxGeometry args={[0.08, 0.04, 0.55]} />
        <meshToonMaterial color="#8B5E34" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.4, 0.17, 0]}>
        <boxGeometry args={[0.08, 0.04, 0.55]} />
        <meshToonMaterial color="#8B5E34" gradientMap={gradientMap} />
      </mesh>
      {/* Oar resting across the hull */}
      <mesh position={[0, 0.2, 0.42]} rotation={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.02, 0.02, 1.7, 6]} />
        <meshToonMaterial color="#C9A876" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.86, 0.2, 0.57]} rotation={[Math.PI / 2, 0, 0.18]}>
        <cylinderGeometry args={[0.001, 0.13, 0.02, 8]} />
        <meshToonMaterial color="#C9A876" gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}
