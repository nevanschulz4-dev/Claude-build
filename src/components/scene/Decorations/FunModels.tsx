import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useDecorMaterials, type DecorationModelProps } from './shared';

/** Flamingo statue: pink body on one thin leg with an S-curve neck. */
export function FlamingoModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Standing leg */}
      <mesh position={[0, 0.32, 0]} material={mat('#FF8FBF')} castShadow>
        <cylinderGeometry args={[0.02, 0.025, 0.6, 6]} />
      </mesh>
      {/* Foot */}
      <mesh position={[0, 0.02, 0]} material={mat('#FF8FBF')} castShadow>
        <sphereGeometry args={[0.04, 8, 6]} />
      </mesh>
      {/* Tucked leg (bent, tucked under body) */}
      <mesh position={[0.08, 0.5, 0.02]} rotation={[0, 0, 0.6]} material={mat('#FF8FBF')} castShadow>
        <cylinderGeometry args={[0.018, 0.02, 0.22, 6]} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.68, 0]} scale={[0.85, 0.7, 1.0]} material={mat('#FF7AB3')} castShadow>
        <sphereGeometry args={[0.24, 14, 12]} />
      </mesh>
      {/* Wing accent */}
      <mesh position={[0, 0.66, -0.12]} scale={[0.6, 0.45, 0.5]} material={mat('#FFB3D6')} castShadow>
        <sphereGeometry args={[0.22, 12, 10]} />
      </mesh>
      {/* Neck - S curve via two angled segments */}
      <mesh position={[0.06, 0.95, 0.16]} rotation={[0.9, 0, 0.25]} material={mat('#FF8FBF')} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.32, 8]} />
      </mesh>
      <mesh position={[0.18, 1.16, 0.24]} rotation={[1.7, 0, -0.3]} material={mat('#FF8FBF')} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 0.22, 8]} />
      </mesh>
      {/* Head */}
      <mesh position={[0.27, 1.22, 0.27]} material={mat('#FFA8D2')} castShadow>
        <sphereGeometry args={[0.07, 10, 8]} />
      </mesh>
      {/* Beak */}
      <mesh position={[0.36, 1.19, 0.3]} rotation={[0, 0.6, -0.3]} material={mat('#3A3A3A')} castShadow>
        <coneGeometry args={[0.025, 0.12, 6]} />
      </mesh>
    </group>
  );
}

/** Beach umbrella: pole + canopy with stripes. */
export function UmbrellaModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  const stripeColors = ['#FF6FA8', '#FFD166', '#5BD1FF', '#FF6FA8', '#FFD166', '#5BD1FF', '#FF6FA8', '#FFD166'];

  return (
    <group>
      {/* Pole */}
      <mesh position={[0, 0.55, 0]} material={mat('#E8D7A8')} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 1.1, 8]} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.04, 0]} material={mat('#9CA3AF')} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.08, 12]} />
      </mesh>
      {/* Canopy - segmented cone for stripes */}
      <group position={[0, 1.15, 0]}>
        {stripeColors.map((color, i) => {
          const segs = stripeColors.length;
          const angle = (i / segs) * Math.PI * 2;
          return (
            <mesh
              key={i}
              rotation={[0, angle, 0]}
              material={mat(color)}
              castShadow
            >
              <coneGeometry args={[0.62, 0.42, segs, 1, false, 0, (Math.PI * 2) / segs]} />
            </mesh>
          );
        })}
      </group>
      {/* Top finial */}
      <mesh position={[0, 1.4, 0]} material={mat('#FFD166')} castShadow>
        <sphereGeometry args={[0.04, 8, 6]} />
      </mesh>
      {/* Canopy underside / rim */}
      <mesh position={[0, 0.95, 0]} material={mat('#FFFFFF')} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.02, 16]} />
      </mesh>
    </group>
  );
}

/** Birdhouse on a post, with a peaked roof, round entrance, and perch. */
export function BirdhouseModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  return (
    <group>
      {/* Post */}
      <mesh position={[0, 0.35, 0]} material={mat('#8B5E34')} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.7, 8]} />
      </mesh>
      {/* House body */}
      <mesh position={[0, 0.78, 0]} material={mat('#E8A24C')} castShadow>
        <boxGeometry args={[0.34, 0.3, 0.32]} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.99, 0]} rotation={[0, Math.PI / 4, 0]} material={mat('#B5482E')} castShadow>
        <coneGeometry args={[0.28, 0.24, 4]} />
      </mesh>
      {/* Entrance hole */}
      <mesh position={[0, 0.8, 0.161]} material={mat('#3A2A1A')}>
        <circleGeometry args={[0.05, 12]} />
      </mesh>
      {/* Perch */}
      <mesh position={[0, 0.7, 0.18]} rotation={[Math.PI / 2, 0, 0]} material={mat('#7A4A2B')} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
      </mesh>
    </group>
  );
}

/** Garden gnome: classic pointed hat, round body, white beard. */
export function GnomeModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.22, 0]} material={mat('#3B6FA0')} castShadow>
        <sphereGeometry args={[0.2, 14, 12]} />
      </mesh>
      {/* Belt */}
      <mesh position={[0, 0.16, 0]} material={mat('#7A4A2B')}>
        <torusGeometry args={[0.19, 0.025, 8, 16]} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.18, 0.24, 0.05]} rotation={[0, 0, 0.5]} material={mat('#3B6FA0')} castShadow>
        <capsuleGeometry args={[0.045, 0.16, 4, 8]} />
      </mesh>
      <mesh position={[0.18, 0.24, 0.05]} rotation={[0, 0, -0.5]} material={mat('#3B6FA0')} castShadow>
        <capsuleGeometry args={[0.045, 0.16, 4, 8]} />
      </mesh>
      {/* Hands */}
      <mesh position={[-0.27, 0.13, 0.1]} material={mat('#F0C29B')} castShadow>
        <sphereGeometry args={[0.045, 8, 8]} />
      </mesh>
      <mesh position={[0.27, 0.13, 0.1]} material={mat('#F0C29B')} castShadow>
        <sphereGeometry args={[0.045, 8, 8]} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.46, 0]} material={mat('#F0C29B')} castShadow>
        <sphereGeometry args={[0.13, 12, 10]} />
      </mesh>
      {/* Beard */}
      <mesh position={[0, 0.4, 0.08]} scale={[0.85, 1.1, 0.7]} material={mat('#F5F5F5')} castShadow>
        <coneGeometry args={[0.1, 0.22, 10]} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.45, 0.13]} material={mat('#E8A87C')} castShadow>
        <sphereGeometry args={[0.035, 8, 8]} />
      </mesh>
      {/* Hat */}
      <mesh position={[0, 0.62, 0]} material={mat('#E0392B')} castShadow>
        <coneGeometry args={[0.16, 0.32, 12]} />
      </mesh>
      {/* Hat brim */}
      <mesh position={[0, 0.5, 0]} material={mat('#C9302C')} castShadow>
        <cylinderGeometry args={[0.15, 0.17, 0.03, 12]} />
      </mesh>
    </group>
  );
}

/** Checkered picnic blanket with a wicker basket and a couple of apples. */
export function PicnicModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  const stripeOffsets = [-0.4, -0.2, 0, 0.2, 0.4];

  return (
    <group>
      {/* Blanket */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#E0533D')} receiveShadow>
        <planeGeometry args={[1.2, 1.2]} />
      </mesh>
      {/* Checker stripes */}
      {stripeOffsets.map((x, i) => (
        <mesh key={`sx-${i}`} position={[x, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#F5F0E0')}>
          <planeGeometry args={[0.1, 1.2]} />
        </mesh>
      ))}
      {stripeOffsets.map((z, i) => (
        <mesh key={`sz-${i}`} position={[0, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#F5F0E0')}>
          <planeGeometry args={[1.2, 0.1]} />
        </mesh>
      ))}
      {/* Wicker basket */}
      <group position={[0.32, 0, 0.22]}>
        <mesh position={[0, 0.11, 0]} material={mat('#A8804F')} castShadow>
          <cylinderGeometry args={[0.18, 0.14, 0.22, 10]} />
        </mesh>
        <mesh position={[0, 0.23, 0]} material={mat('#7A5A30')} castShadow>
          <cylinderGeometry args={[0.19, 0.19, 0.04, 10]} />
        </mesh>
        <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('#7A5A30')}>
          <torusGeometry args={[0.14, 0.02, 6, 12, Math.PI]} />
        </mesh>
      </group>
      {/* Apples */}
      {[
        [-0.28, 0.07, -0.18],
        [-0.12, 0.07, -0.32],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh material={mat('#E0392B')} castShadow>
            <sphereGeometry args={[0.07, 10, 8]} />
          </mesh>
          <mesh position={[0, 0.08, 0]} rotation={[0, 0, 0.3]} material={mat('#3FA34D')}>
            <coneGeometry args={[0.025, 0.06, 4]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Treasure chest: open wooden chest with gold trim, overflowing with coins and gems. */
export function TreasureChestModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);
  const gemRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (gemRef.current) {
      gemRef.current.rotation.y = clock.getElapsedTime() * 0.8;
    }
  });

  const coins = [
    { x: -0.12, z: 0.18, r: 0.4 },
    { x: 0.05, z: 0.24, r: 1.1 },
    { x: 0.18, z: 0.15, r: 2.3 },
    { x: -0.02, z: 0.28, r: 0.7 },
    { x: 0.12, z: 0.3, r: 1.8 },
  ];

  return (
    <group>
      {/* Chest base */}
      <mesh position={[0, 0.15, 0]} material={mat('#6B4A2B')} castShadow receiveShadow>
        <boxGeometry args={[0.52, 0.3, 0.36]} />
      </mesh>
      {/* Gold trim bands */}
      <mesh position={[0, 0.04, 0]} material={mat('#E8A24C')} castShadow>
        <boxGeometry args={[0.54, 0.05, 0.38]} />
      </mesh>
      <mesh position={[0, 0.26, 0]} material={mat('#E8A24C')} castShadow>
        <boxGeometry args={[0.54, 0.05, 0.38]} />
      </mesh>
      {/* Lid, hinged open at the back */}
      <group position={[0, 0.3, -0.18]} rotation={[-1.15, 0, 0]}>
        <mesh position={[0, 0.07, 0.18]} material={mat('#7A5530')} castShadow>
          <boxGeometry args={[0.54, 0.14, 0.38]} />
        </mesh>
        <mesh position={[0, 0.13, 0.18]} material={mat('#E8A24C')} castShadow>
          <boxGeometry args={[0.56, 0.04, 0.4]} />
        </mesh>
      </group>
      {/* Latch */}
      <mesh position={[0, 0.2, 0.181]} material={mat('#FFD166')} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
      </mesh>

      {/* Spilling coins */}
      {coins.map((c, i) => (
        <mesh key={i} position={[c.x, 0.305, c.z]} rotation={[Math.PI / 2 + 0.3, c.r, 0]} material={mat('#FFD166')} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.015, 12]} />
        </mesh>
      ))}

      {/* Gems among the coins */}
      <mesh position={[0.02, 0.34, 0.22]} scale={0.06} material={mat('#FF5C7A', { emissive: '#FF8FA8', emissiveIntensity: 0.5 })} castShadow>
        <octahedronGeometry args={[1, 0]} />
      </mesh>
      <mesh ref={gemRef} position={[-0.1, 0.33, 0.24]} scale={0.07} material={mat('#4DD0E1', { emissive: '#8FF0FF', emissiveIntensity: 0.5 })} castShadow>
        <octahedronGeometry args={[1, 0]} />
      </mesh>

      {!preview && (
        <Sparkles position={[0, 0.35, 0.2]} count={10} scale={[0.4, 0.2, 0.3]} size={2} speed={0.3} color="#FFE9A8" />
      )}
    </group>
  );
}
