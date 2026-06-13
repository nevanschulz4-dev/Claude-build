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

/** Bamboo tiki torch with a flickering flame and warm point light. */
export function TikiTorchModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);
  const flameRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const flicker = 0.85 + Math.sin(t * 11) * 0.1 + Math.sin(t * 23 + 1) * 0.05;
    if (flameRef.current) {
      flameRef.current.scale.setScalar(flicker);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.6 * flicker;
    }
  });

  return (
    <group>
      {/* Bamboo post */}
      <mesh position={[0, 0.35, 0]} material={mat('#8B5E34')} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.7, 8]} />
      </mesh>
      {/* Torch bowl */}
      <mesh position={[0, 0.72, 0]} material={mat('#5C4326')} castShadow>
        <cylinderGeometry args={[0.13, 0.08, 0.16, 10]} />
      </mesh>
      {/* Flame */}
      <group ref={flameRef} position={[0, 0.88, 0]}>
        <mesh material={mat('#FF8C2B', { emissive: '#FF6A00', emissiveIntensity: 1.2 })}>
          <coneGeometry args={[0.09, 0.24, 8]} />
        </mesh>
        <mesh position={[0, 0.07, 0]} material={mat('#FFE07D', { emissive: '#FFD166', emissiveIntensity: 1.4 })}>
          <coneGeometry args={[0.05, 0.14, 8]} />
        </mesh>
      </group>
      {!preview && <pointLight ref={lightRef} position={[0, 0.88, 0]} color="#FF9D4D" intensity={1.6} distance={4} />}
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

/** A small cluster of rectangular paving slabs for a tidy garden path. */
export function GardenPaversModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  const slabs: { pos: [number, number, number]; size: [number, number]; rot: number; color: string }[] = [
    { pos: [-0.18, 0, -0.12], size: [0.34, 0.26], rot: 0.12, color: '#B7BFCB' },
    { pos: [0.16, 0, 0.08], size: [0.3, 0.24], rot: -0.18, color: '#9AA3AF' },
    { pos: [-0.06, 0, 0.22], size: [0.26, 0.22], rot: 0.3, color: '#C4CCD6' },
  ];

  return (
    <group>
      {slabs.map((slab, i) => (
        <mesh key={i} position={[slab.pos[0], 0.025, slab.pos[2]]} rotation={[0, slab.rot, 0]} material={mat(slab.color)} receiveShadow castShadow>
          <boxGeometry args={[slab.size[0], 0.05, slab.size[1]]} />
        </mesh>
      ))}
    </group>
  );
}
