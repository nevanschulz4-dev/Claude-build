import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';
import { useDecorMaterials, type DecorationModelProps } from './shared';

/** Small irregular rounded stone. */
export function RockSmallModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  return (
    <group>
      <mesh position={[0, 0.16, 0]} scale={[1, 0.8, 0.9]} rotation={[0.2, 0.6, 0.1]} material={mat('#9CA3AF')} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.22, 0]} />
      </mesh>
      <mesh position={[0.18, 0.08, 0.12]} scale={[0.6, 0.5, 0.6]} rotation={[0.4, 1.1, 0.2]} material={mat('#8A93A3')} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.18, 0]} />
      </mesh>
    </group>
  );
}

/** Stone arch: two pillars + crossbeam. */
export function RockArchModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  return (
    <group>
      {/* Pillars */}
      <mesh position={[-0.45, 0.55, 0]} rotation={[0.05, 0.3, 0.08]} material={mat('#8A93A3')} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.24, 1.1, 8]} />
      </mesh>
      <mesh position={[0.45, 0.55, 0]} rotation={[-0.05, -0.2, -0.08]} material={mat('#9CA3AF')} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.26, 1.1, 8]} />
      </mesh>
      {/* Crossbeam */}
      <mesh position={[0, 1.15, 0]} rotation={[0, 0, 0.02]} material={mat('#A8AFBC')} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.26, 0.3]} />
      </mesh>
      {/* Moss accents */}
      <mesh position={[-0.45, 0.95, 0.12]} scale={[0.5, 0.3, 0.5]} material={mat('#5CB85C')} castShadow>
        <dodecahedronGeometry args={[0.18, 0]} />
      </mesh>
      <mesh position={[0.4, 0.9, -0.1]} scale={[0.4, 0.25, 0.4]} material={mat('#6BC36F')} castShadow>
        <dodecahedronGeometry args={[0.16, 0]} />
      </mesh>
    </group>
  );
}

/** Glowing crystal cluster with a soft point light and emissive icosahedra. */
export function CrystalModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  const crystalColor = '#7B61FF';
  const glowColor = '#B89CFF';

  return (
    <group>
      {!preview && <pointLight position={[0, 0.5, 0]} color={glowColor} intensity={1.2} distance={3} />}
      <group ref={groupRef}>
        <mesh position={[0, 0.4, 0]} material={mat(crystalColor, { emissive: glowColor, emissiveIntensity: 0.6 })} castShadow>
          <icosahedronGeometry args={[0.3, 0]} />
        </mesh>
        <mesh position={[0.22, 0.2, 0.1]} rotation={[0.3, 0.5, 0]} scale={0.6} material={mat('#9C8CFF', { emissive: glowColor, emissiveIntensity: 0.6 })} castShadow>
          <icosahedronGeometry args={[0.3, 0]} />
        </mesh>
        <mesh position={[-0.2, 0.15, -0.05]} rotation={[-0.2, 0.8, 0.1]} scale={0.5} material={mat('#6A4FE0', { emissive: glowColor, emissiveIntensity: 0.6 })} castShadow>
          <icosahedronGeometry args={[0.3, 0]} />
        </mesh>
      </group>
      {!preview && (
        <Sparkles position={[0, 0.4, 0]} count={14} scale={[0.8, 0.9, 0.8]} size={2.5} speed={0.4} color={glowColor} />
      )}
    </group>
  );
}
