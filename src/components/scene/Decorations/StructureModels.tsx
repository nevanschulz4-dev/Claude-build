import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';
import { useDecorMaterials, type DecorationModelProps } from './shared';

/** Small wooden arched plank bridge with railings. */
export function BridgeModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  const planks = 6;

  return (
    <group>
      {/* Plank deck, slight arch via stepped heights */}
      {Array.from({ length: planks }).map((_, i) => {
        const x = (i - (planks - 1) / 2) * 0.32;
        const archY = 0.25 + Math.sin((i / (planks - 1)) * Math.PI) * 0.18;
        return (
          <mesh key={i} position={[x, archY, 0]} rotation={[0, 0, 0]} material={mat('#A87C4F')} castShadow receiveShadow>
            <boxGeometry args={[0.34, 0.08, 0.9]} />
          </mesh>
        );
      })}
      {/* Support posts */}
      <mesh position={[-1.0, 0.12, 0]} material={mat('#7A4A2B')} castShadow>
        <boxGeometry args={[0.18, 0.24, 0.9]} />
      </mesh>
      <mesh position={[1.0, 0.12, 0]} material={mat('#7A4A2B')} castShadow>
        <boxGeometry args={[0.18, 0.24, 0.9]} />
      </mesh>
      {/* Railings */}
      {[-0.42, 0.42].map((z, zi) =>
        Array.from({ length: planks + 1 }).map((_, i) => {
          const x = (i - planks / 2) * 0.32;
          const archY = 0.25 + Math.sin((Math.min(Math.max(i, 0), planks - 1) / (planks - 1)) * Math.PI) * 0.18;
          return (
            <mesh key={`rail-${zi}-${i}`} position={[x, archY + 0.22, z]} material={mat('#8B5E34')} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.34, 6]} />
            </mesh>
          );
        }),
      )}
      {/* Top rail bars */}
      {[-0.42, 0.42].map((z, zi) => (
        <mesh key={`bar-${zi}`} position={[0, 0.62, z]} rotation={[0, 0, 0]} material={mat('#A87C4F')} castShadow>
          <boxGeometry args={[2.1, 0.05, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}

/** Mini pagoda: stacked boxes with pyramid roofs. */
export function PagodaModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, 0.05, 0]} material={mat('#C9C0AE')} receiveShadow castShadow>
        <cylinderGeometry args={[0.6, 0.66, 0.1, 12]} />
      </mesh>

      {/* Tier 1 */}
      <mesh position={[0, 0.32, 0]} material={mat('#E0533D')} castShadow>
        <boxGeometry args={[0.7, 0.36, 0.7]} />
      </mesh>
      <mesh position={[0, 0.56, 0]} material={mat('#9C5B3C')} castShadow>
        <coneGeometry args={[0.62, 0.3, 4]} />
      </mesh>

      {/* Tier 2 */}
      <mesh position={[0, 0.78, 0]} material={mat('#F0A04B')} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.5]} />
      </mesh>
      <mesh position={[0, 0.98, 0]} material={mat('#9C5B3C')} castShadow>
        <coneGeometry args={[0.46, 0.26, 4]} />
      </mesh>

      {/* Tier 3 (top) */}
      <mesh position={[0, 1.16, 0]} material={mat('#E0533D')} castShadow>
        <boxGeometry args={[0.32, 0.22, 0.32]} />
      </mesh>
      <mesh position={[0, 1.34, 0]} material={mat('#9C5B3C')} castShadow>
        <coneGeometry args={[0.3, 0.24, 4]} />
      </mesh>

      {/* Spire */}
      <mesh position={[0, 1.55, 0]} material={mat('#FFD166', { emissive: '#FFD166', emissiveIntensity: 0.3 })} castShadow>
        <coneGeometry args={[0.04, 0.24, 6]} />
      </mesh>
    </group>
  );
}

/** Tiered stone fountain with a Sparkles "water" effect. */
export function FountainModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);
  const sprayRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (sprayRef.current) {
      sprayRef.current.position.y = 0.75 + Math.sin(clock.getElapsedTime() * 3) * 0.03;
    }
  });

  return (
    <group>
      {/* Bottom basin */}
      <mesh position={[0, 0.12, 0]} material={mat('#B7BFCB')} receiveShadow castShadow>
        <cylinderGeometry args={[0.7, 0.78, 0.24, 16]} />
      </mesh>
      <mesh position={[0, 0.24, 0]} material={mat('#5BD1FF')}>
        <cylinderGeometry args={[0.6, 0.6, 0.04, 16]} />
      </mesh>
      {/* Middle column */}
      <mesh position={[0, 0.45, 0]} material={mat('#C9C0AE')} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.5, 10]} />
      </mesh>
      {/* Top basin */}
      <mesh position={[0, 0.72, 0]} material={mat('#B7BFCB')} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.16, 14]} />
      </mesh>
      <mesh position={[0, 0.8, 0]} material={mat('#5BD1FF')}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 14]} />
      </mesh>

      {/* Water spray */}
      {!preview && (
        <group ref={sprayRef} position={[0, 0.75, 0]}>
          <Sparkles count={26} scale={[0.5, 0.7, 0.5]} size={2.5} speed={0.8} color="#9be8ff" />
        </group>
      )}
    </group>
  );
}

/** Tapered tower with a conical roof and four slowly spinning blades. */
export function WindmillModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);
  const bladesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bladesRef.current && !preview) {
      bladesRef.current.rotation.z += delta * 1.2;
    }
  });

  return (
    <group>
      {/* Tower */}
      <mesh position={[0, 0.5, 0]} material={mat('#E8DCC8')} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.32, 1.0, 10]} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.15, 0]} material={mat('#9C5B3C')} castShadow>
        <coneGeometry args={[0.28, 0.3, 10]} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.2, 0.315]} material={mat('#7A4A2B')}>
        <boxGeometry args={[0.14, 0.26, 0.02]} />
      </mesh>
      {/* Window */}
      <mesh position={[0, 0.7, 0.28]} material={mat('#9BE8FF', { emissive: '#9BE8FF', emissiveIntensity: 0.2 })}>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
      </mesh>

      {/* Spinning blades */}
      <group position={[0, 0.95, 0.34]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={mat('#7A4A2B')} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.08, 8]} />
        </mesh>
        <group ref={bladesRef}>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
              <mesh position={[0, 0.29, 0]} material={mat('#EDE6D6')} castShadow>
                <boxGeometry args={[0.08, 0.58, 0.02]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}
