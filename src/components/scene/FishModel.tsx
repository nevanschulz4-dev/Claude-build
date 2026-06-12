import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { FishSpecies } from '../../data/types';
import { useToonGradient } from '../../utils/textures';

interface FishModelProps {
  species: FishSpecies;
  swimming?: boolean;
  phase?: number;
}

const BODY_SCALE: Record<FishSpecies['bodyShape'], [number, number, number]> = {
  classic: [1.0, 0.62, 0.42],
  round: [0.8, 0.82, 0.7],
  long: [1.6, 0.5, 0.4],
  wide: [1.05, 0.75, 0.95],
  eel: [2.3, 0.32, 0.32],
};

export default function FishModel({ species, swimming = false, phase = 0 }: FishModelProps) {
  const gradientMap = useToonGradient(4);
  const tailRef = useRef<THREE.Group>(null);
  const finLRef = useRef<THREE.Mesh>(null);
  const finRRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const bodyScale = BODY_SCALE[species.bodyShape];
  const s = species.size;

  const bodyMat = useMemo(
    () => new THREE.MeshToonMaterial({ color: species.primaryColor, gradientMap }),
    [species.primaryColor, gradientMap],
  );
  const finMat = useMemo(
    () => new THREE.MeshToonMaterial({ color: species.finColor, gradientMap }),
    [species.finColor, gradientMap],
  );
  const accentMat = useMemo(
    () => new THREE.MeshToonMaterial({ color: species.secondaryColor, gradientMap }),
    [species.secondaryColor, gradientMap],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * (swimming ? 4 : 2.5) + phase;
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t) * 0.55;
    }
    if (finLRef.current) finLRef.current.rotation.z = Math.sin(t + 1) * 0.3;
    if (finRRef.current) finRRef.current.rotation.z = -Math.sin(t + 1) * 0.3;
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.04;
      groupRef.current.position.y = Math.sin(t * 0.7) * 0.03;
    }
  });

  const tailX = -bodyScale[0] * s * 0.95;

  return (
    <group ref={groupRef} scale={s}>
      {/* Body */}
      <mesh material={bodyMat} castShadow scale={bodyScale}>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>

      {/* Belly accent */}
      <mesh material={accentMat} position={[0, -bodyScale[1] * 0.45, 0]} scale={[bodyScale[0] * 0.85, bodyScale[1] * 0.45, bodyScale[2] * 0.85]}>
        <sphereGeometry args={[1, 14, 10]} />
      </mesh>

      {/* Eyes */}
      <mesh position={[bodyScale[0] * 0.78, bodyScale[1] * 0.25, bodyScale[2] * 0.45]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[bodyScale[0] * 0.78, bodyScale[1] * 0.25, -bodyScale[2] * 0.45]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Tail */}
      <group ref={tailRef} position={[tailX, 0, 0]}>
        <mesh material={finMat} rotation={[0, 0, Math.PI / 2]} position={[-bodyScale[0] * 0.35, 0, 0]}>
          <coneGeometry args={[bodyScale[1] * 0.9, bodyScale[0] * 0.75, 4]} />
        </mesh>
      </group>

      {/* Dorsal fin */}
      <mesh material={finMat} position={[0, bodyScale[1] * 0.85, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[bodyScale[0] * 0.35, bodyScale[1] * 0.7, 4]} />
      </mesh>

      {/* Side fins */}
      <mesh ref={finLRef} material={finMat} position={[bodyScale[0] * 0.1, -bodyScale[1] * 0.1, bodyScale[2] * 0.85]} rotation={[Math.PI / 2.4, 0, 0]}>
        <coneGeometry args={[bodyScale[1] * 0.35, bodyScale[0] * 0.5, 4]} />
      </mesh>
      <mesh ref={finRRef} material={finMat} position={[bodyScale[0] * 0.1, -bodyScale[1] * 0.1, -bodyScale[2] * 0.85]} rotation={[-Math.PI / 2.4, 0, 0]}>
        <coneGeometry args={[bodyScale[1] * 0.35, bodyScale[0] * 0.5, 4]} />
      </mesh>

      {/* Glow halo for special fish */}
      {species.glow && (
        <mesh scale={[bodyScale[0] * 1.4, bodyScale[1] * 1.4, bodyScale[2] * 1.4]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color={species.secondaryColor} transparent opacity={0.18} />
        </mesh>
      )}
    </group>
  );
}
