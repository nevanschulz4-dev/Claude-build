import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';
import { useDecorMaterials, type DecorationModelProps } from './shared';

/** Wooden post lantern with a glowing emissive top + soft point light. */
export function LanternModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const pulse = 0.7 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
      const m = glowRef.current.material as THREE.MeshToonMaterial;
      m.emissiveIntensity = pulse;
    }
  });

  return (
    <group>
      {/* Post */}
      <mesh position={[0, 0.3, 0]} material={mat('#7A4A2B')} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.6, 8]} />
      </mesh>
      {/* Roof cap */}
      <mesh position={[0, 0.68, 0]} material={mat('#9C5B3C')} castShadow>
        <coneGeometry args={[0.22, 0.18, 6]} />
      </mesh>
      {/* Glowing body */}
      <mesh ref={glowRef} position={[0, 0.55, 0]} material={mat('#FFE07D', { emissive: '#FFD166', emissiveIntensity: 0.8 })} castShadow>
        <boxGeometry args={[0.26, 0.22, 0.26]} />
      </mesh>
      {!preview && <pointLight position={[0, 0.55, 0]} color="#FFD166" intensity={1.4} distance={3.5} />}
    </group>
  );
}

/** Glass jar containing glowing fireflies (Sparkles). */
export function FireflyJarModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  return (
    <group>
      {/* Jar body */}
      <mesh position={[0, 0.18, 0]} material={mat('#CFE8F0', { emissive: '#FFEFA8', emissiveIntensity: 0.2 })} castShadow>
        <cylinderGeometry args={[0.16, 0.14, 0.32, 12]} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 0.36, 0]} material={mat('#8B5E34')} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.06, 12]} />
      </mesh>
      {/* Glow core */}
      {!preview && <pointLight position={[0, 0.2, 0]} color="#FFF3A0" intensity={0.9} distance={2.5} />}
      {!preview && (
        <Sparkles position={[0, 0.2, 0]} count={20} scale={[0.3, 0.35, 0.3]} size={2} speed={0.6} color="#FFF3A0" />
      )}
    </group>
  );
}

/** Flat stepping stone for paths. */
export function PathStoneModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  return (
    <mesh position={[0, 0.03, 0]} rotation={[0, 0.3, 0]} material={mat('#B7BFCB')} receiveShadow castShadow>
      <cylinderGeometry args={[0.28, 0.32, 0.06, 8]} />
    </mesh>
  );
}
