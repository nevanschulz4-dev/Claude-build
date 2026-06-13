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

  const isGlass = species.feature === 'glass';

  const bodyMat = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: species.primaryColor,
        gradientMap,
        transparent: isGlass,
        opacity: isGlass ? 0.55 : 1,
      }),
    [species.primaryColor, gradientMap, isGlass],
  );
  const finMat = useMemo(
    () => new THREE.MeshToonMaterial({ color: species.finColor, gradientMap }),
    [species.finColor, gradientMap],
  );
  const accentMat = useMemo(
    () => new THREE.MeshToonMaterial({ color: species.secondaryColor, gradientMap }),
    [species.secondaryColor, gradientMap],
  );
  // Thin inverted-hull "ink" outline for a clean, chunky toon look.
  const outlineMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#1a1a22', side: THREE.BackSide }),
    [],
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
        <sphereGeometry args={[1, 24, 18]} />
      </mesh>

      {/* Inverted-hull outline traces the body silhouette for a chunky toon look */}
      {!isGlass && (
        <mesh material={outlineMat} scale={[bodyScale[0] * 1.06, bodyScale[1] * 1.06, bodyScale[2] * 1.06]}>
          <sphereGeometry args={[1, 24, 18]} />
        </mesh>
      )}

      {/* Belly accent */}
      <mesh material={accentMat} position={[0, -bodyScale[1] * 0.45, 0]} scale={[bodyScale[0] * 0.85, bodyScale[1] * 0.45, bodyScale[2] * 0.85]}>
        <sphereGeometry args={[1, 18, 14]} />
      </mesh>

      {/* Glossy highlight on the back for a wet, polished sheen */}
      <mesh
        position={[bodyScale[0] * 0.2, bodyScale[1] * 0.6, bodyScale[2] * 0.45]}
        rotation={[0, 0.4, 0.3]}
        scale={[bodyScale[0] * 0.32, bodyScale[1] * 0.18, bodyScale[2] * 0.12]}
      >
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Eyes: large white sclera + dark pupil + glint, for a friendly toon look */}
      {[1, -1].map((side) => (
        <group key={side} position={[bodyScale[0] * 0.8, bodyScale[1] * 0.28, bodyScale[2] * 0.48 * side]}>
          <mesh>
            <sphereGeometry args={[0.135, 14, 14]} />
            <meshToonMaterial color="#fefefe" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.07, 0.014, 0.05 * side]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshStandardMaterial color="#1c1c22" />
          </mesh>
          <mesh position={[0.105, 0.055, 0.085 * side]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Mouth */}
      <mesh position={[bodyScale[0] * 0.98, -bodyScale[1] * 0.08, 0]} scale={[0.5, 0.26, 0.6]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#4a2c2c" />
      </mesh>

      {/* Tail */}
      <group ref={tailRef} position={[tailX, 0, 0]}>
        {species.feature === 'doubletail' ? (
          <>
            <mesh material={finMat} rotation={[0, 0, Math.PI / 2 + 0.45]} position={[-bodyScale[0] * 0.28, bodyScale[1] * 0.25, 0]}>
              <coneGeometry args={[bodyScale[1] * 0.75, bodyScale[0] * 0.8, 12]} />
            </mesh>
            <mesh material={finMat} rotation={[0, 0, Math.PI / 2 - 0.45]} position={[-bodyScale[0] * 0.28, -bodyScale[1] * 0.25, 0]}>
              <coneGeometry args={[bodyScale[1] * 0.75, bodyScale[0] * 0.8, 12]} />
            </mesh>
          </>
        ) : species.feature === 'blowhole' ? (
          <mesh material={finMat} rotation={[0, 0, Math.PI / 2]} position={[-bodyScale[0] * 0.3, 0, 0]} scale={[1, 1, 1.8]}>
            <coneGeometry args={[bodyScale[1] * 1.0, bodyScale[0] * 0.6, 12]} />
          </mesh>
        ) : (
          <mesh material={finMat} rotation={[0, 0, Math.PI / 2]} position={[-bodyScale[0] * 0.35, 0, 0]}>
            <coneGeometry args={[bodyScale[1] * 0.9, bodyScale[0] * 0.75, 12]} />
          </mesh>
        )}
      </group>

      {/* Dorsal fin */}
      <mesh material={finMat} position={[0, bodyScale[1] * 0.85, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[bodyScale[0] * 0.35, bodyScale[1] * 0.7, 12]} />
      </mesh>

      {/* Side fins */}
      <mesh ref={finLRef} material={finMat} position={[bodyScale[0] * 0.1, -bodyScale[1] * 0.1, bodyScale[2] * 0.85]} rotation={[Math.PI / 2.4, 0, 0]}>
        <coneGeometry args={[bodyScale[1] * 0.35, bodyScale[0] * 0.5, 12]} />
      </mesh>
      <mesh ref={finRRef} material={finMat} position={[bodyScale[0] * 0.1, -bodyScale[1] * 0.1, -bodyScale[2] * 0.85]} rotation={[-Math.PI / 2.4, 0, 0]}>
        <coneGeometry args={[bodyScale[1] * 0.35, bodyScale[0] * 0.5, 12]} />
      </mesh>

      {/* Whiskers (Pebble Carp) */}
      {species.feature === 'whiskers' && (
        <>
          <mesh material={finMat} position={[bodyScale[0] * 0.95, -bodyScale[1] * 0.2, bodyScale[2] * 0.25]} rotation={[0, 0, -0.55]}>
            <cylinderGeometry args={[0.015, 0.015, bodyScale[0] * 0.55, 6]} />
          </mesh>
          <mesh material={finMat} position={[bodyScale[0] * 0.95, -bodyScale[1] * 0.2, -bodyScale[2] * 0.25]} rotation={[0, 0, -0.55]}>
            <cylinderGeometry args={[0.015, 0.015, bodyScale[0] * 0.55, 6]} />
          </mesh>
        </>
      )}

      {/* Stripe bands (Stripe Perch) */}
      {species.feature === 'stripes' &&
        [-0.35, 0, 0.4].map((xOff, idx) => (
          <mesh key={idx} material={accentMat} position={[bodyScale[0] * xOff, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[bodyScale[1] * 0.92, 0.025, 8, 16]} />
          </mesh>
        ))}

      {/* Glowing rings (Azure Ringtail) */}
      {species.feature === 'rings' && (
        <>
          <mesh position={[tailX * 0.45, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[bodyScale[1] * 0.75, 0.03, 8, 20]} />
            <meshBasicMaterial color={species.secondaryColor} />
          </mesh>
          <mesh position={[tailX * 0.7, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[bodyScale[1] * 0.58, 0.025, 8, 20]} />
            <meshBasicMaterial color={species.secondaryColor} />
          </mesh>
        </>
      )}

      {/* Spiny ridge segments (Shadow Eel) */}
      {species.feature === 'segments' &&
        [-0.55, -0.25, 0.05, 0.35].map((xOff, idx) => (
          <mesh key={idx} material={finMat} position={[bodyScale[0] * xOff, bodyScale[1] * 0.9, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[bodyScale[0] * 0.09, bodyScale[1] * 0.35, 8]} />
          </mesh>
        ))}

      {/* Crystal facets (Crystal Carp) */}
      {species.feature === 'crystals' &&
        ([
          [-0.2, 0.95, 0.15],
          [0.1, 1.0, -0.15],
          [0.35, 0.85, 0.18],
        ] as [number, number, number][]).map((p, idx) => (
          <mesh key={idx} position={[bodyScale[0] * p[0], bodyScale[1] * p[1], bodyScale[2] * p[2]]} rotation={[0.3, idx, 0.2]}>
            <octahedronGeometry args={[bodyScale[1] * 0.22, 0]} />
            <meshStandardMaterial color={species.secondaryColor} transparent opacity={0.75} />
          </mesh>
        ))}

      {/* Broad wings + head crest (Golden Drakefin) */}
      {species.feature === 'wings' && (
        <>
          <mesh material={finMat} position={[bodyScale[0] * 0.15, bodyScale[1] * 0.1, bodyScale[2] * 1.05]} rotation={[Math.PI / 2.6, 0.3, 0]}>
            <coneGeometry args={[bodyScale[1] * 0.65, bodyScale[0] * 1.05, 8]} />
          </mesh>
          <mesh material={finMat} position={[bodyScale[0] * 0.15, bodyScale[1] * 0.1, -bodyScale[2] * 1.05]} rotation={[-Math.PI / 2.6, -0.3, 0]}>
            <coneGeometry args={[bodyScale[1] * 0.65, bodyScale[0] * 1.05, 8]} />
          </mesh>
          <mesh material={finMat} position={[bodyScale[0] * 0.6, bodyScale[1] * 0.95, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[bodyScale[0] * 0.22, bodyScale[1] * 0.55, 8]} />
          </mesh>
        </>
      )}

      {/* Blowhole (Starlight Finwhale) */}
      {species.feature === 'blowhole' && (
        <mesh material={accentMat} position={[bodyScale[0] * 0.5, bodyScale[1] * 0.92, 0]}>
          <sphereGeometry args={[bodyScale[1] * 0.16, 8, 8]} />
        </mesh>
      )}

      {/* Speckled spots scattered across the back */}
      {species.feature === 'spots' &&
        ([
          [0.45, 0.55, 0.35],
          [0.05, 0.65, -0.4],
          [-0.4, 0.5, 0.3],
          [0.3, 0.35, -0.55],
          [-0.15, 0.6, 0.5],
        ] as [number, number, number][]).map((p, idx) => (
          <mesh key={idx} material={accentMat} position={[bodyScale[0] * p[0], bodyScale[1] * p[1], bodyScale[2] * p[2]]}>
            <sphereGeometry args={[bodyScale[1] * 0.14, 8, 8]} />
          </mesh>
        ))}

      {/* Glowing lure antenna (Abyssal Anglerfish) */}
      {species.feature === 'antenna' && (
        <group position={[bodyScale[0] * 0.55, bodyScale[1] * 0.85, 0]} rotation={[0, 0, -0.3]}>
          <mesh material={finMat}>
            <cylinderGeometry args={[0.02, 0.03, bodyScale[1] * 1.1, 6]} />
          </mesh>
          <mesh position={[0, bodyScale[1] * 0.6, 0]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshBasicMaterial color={species.secondaryColor} />
          </mesh>
        </group>
      )}

      {/* Towering sail fin (Emperor Leviathan, Phoenix Flarefin) */}
      {species.feature === 'sail' && (
        <mesh material={finMat} position={[0, bodyScale[1] * 1.05, 0]} rotation={[0, 0, Math.PI]} scale={[1.6, 1.8, 0.4]}>
          <coneGeometry args={[bodyScale[0] * 0.55, bodyScale[1] * 1.1, 8]} />
        </mesh>
      )}

      {/* Forward-pointing horn (Sabertooth Pike) */}
      {species.feature === 'horn' && (
        <mesh material={accentMat} position={[bodyScale[0] * 1.05, bodyScale[1] * 0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[bodyScale[1] * 0.18, bodyScale[0] * 0.55, 6]} />
        </mesh>
      )}

      {/* Flowing spiny mane (Lionfin Betta) */}
      {species.feature === 'mane' &&
        [-0.5, -0.25, 0, 0.25, 0.5].map((xOff, idx) => (
          <mesh
            key={idx}
            material={finMat}
            position={[bodyScale[0] * xOff, bodyScale[1] * 0.78, 0]}
            rotation={[0, 0, Math.PI + xOff * 0.4]}
          >
            <coneGeometry args={[bodyScale[0] * 0.07, bodyScale[1] * 0.6, 8]} />
          </mesh>
        ))}

      {/* Jeweled crown of golden spikes (Abyssal Crownshark) */}
      {species.feature === 'crown' &&
        [-0.18, -0.06, 0.06, 0.18].map((xOff, idx) => (
          <mesh
            key={idx}
            position={[bodyScale[0] * (0.55 + xOff * 0.4), bodyScale[1] * 0.92, bodyScale[2] * xOff]}
            rotation={[0, 0, Math.PI]}
          >
            <coneGeometry args={[bodyScale[0] * 0.05, bodyScale[1] * (idx === 1 || idx === 2 ? 0.42 : 0.3), 6]} />
            <meshStandardMaterial color={species.secondaryColor} metalness={0.6} roughness={0.25} />
          </mesh>
        ))}

      {/* Glowing halo ring encircling the body (Celestial Koi) */}
      {species.feature === 'halo' && (
        <mesh position={[0, bodyScale[1] * 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[bodyScale[0] * 0.85, 0.025, 8, 24]} />
          <meshBasicMaterial color={species.secondaryColor} />
        </mesh>
      )}

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
