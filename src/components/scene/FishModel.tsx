import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { FishSpecies, FishBodyShape, FishFinStyle } from '../../data/types';
import { useToonGradient } from '../../utils/textures';

interface FishModelProps {
  species: FishSpecies;
  swimming?: boolean;
  phase?: number;
  /** When false, the soft glow aura around special fish is omitted (used for clean thumbnails). */
  showAura?: boolean;
}

/** Final body half-extents: [length (head↔tail), height (belly↔back), width (side↔side)]. */
const BODY_SCALE: Record<FishBodyShape, [number, number, number]> = {
  classic: [1.0, 0.62, 0.3],
  round: [0.8, 0.82, 0.5],
  long: [1.55, 0.46, 0.28],
  wide: [1.05, 0.78, 0.64],
  eel: [2.3, 0.3, 0.26],
  triangle: [0.92, 1.02, 0.26],
  flat: [1.2, 0.26, 0.92],
  puffer: [0.74, 0.82, 0.66],
  torpedo: [1.7, 0.46, 0.4],
  serpent: [2.1, 0.5, 0.42],
};

/** Taller dorsal fin for some silhouettes, shorter for flat/eel bodies. */
const DORSAL_HEIGHT: Partial<Record<FishBodyShape, number>> = {
  triangle: 2.0,
  classic: 1.1,
  wide: 0.7,
  flat: 0.4,
  eel: 0.55,
  puffer: 0.7,
  serpent: 1.5,
};

// --- Shared geometry. All fish reuse these; per-species variety comes from scale, color, pattern and add-ons. ---

/**
 * A smooth teardrop body of revolution: rounded-fat toward the head, tapering to
 * a point at the tail. Revolved around its long axis (local Y), so the mesh is
 * rotated to lie along X (nose at +X) and scaled per-axis to its final shape.
 */
function buildBodyGeometry(): THREE.LatheGeometry {
  const anchors: [number, number][] = [
    [0.0, 0.0],
    [0.05, 0.055],
    [0.12, 0.125],
    [0.22, 0.24],
    [0.34, 0.36],
    [0.46, 0.45],
    [0.58, 0.495],
    [0.66, 0.5],
    [0.75, 0.48],
    [0.84, 0.42],
    [0.91, 0.32],
    [0.96, 0.2],
    [1.0, 0.0],
  ];
  const curve = new THREE.CatmullRomCurve3(anchors.map(([u, r]) => new THREE.Vector3(r, u - 0.5, 0)));
  const profile: THREE.Vector2[] = [];
  const segments = 44;
  for (let i = 0; i <= segments; i++) {
    const p = curve.getPoint(i / segments);
    profile.push(new THREE.Vector2(Math.max(p.x, 0), p.y));
  }
  return new THREE.LatheGeometry(profile, 18);
}

/** Build a flat fin from a closed 2D outline. */
function buildFinGeometry(points: [number, number][]): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

const BODY_GEO = buildBodyGeometry();

// Caudal (tail) fins, root at +X sweeping back toward -X. One per fin style.
const TAIL_GEO: Record<FishFinStyle, THREE.ShapeGeometry> = {
  fan: buildFinGeometry([
    [0.02, 0.12],
    [-0.5, 0.46],
    [-0.34, 0.06],
    [-0.34, -0.06],
    [-0.5, -0.46],
    [0.02, -0.12],
  ]),
  forked: buildFinGeometry([
    [0.02, 0.1],
    [-0.62, 0.5],
    [-0.5, 0.34],
    [-0.2, 0.0],
    [-0.5, -0.34],
    [-0.62, -0.5],
    [0.02, -0.1],
  ]),
  flowy: buildFinGeometry([
    [0.02, 0.13],
    [-0.7, 0.42],
    [-1.0, 0.22],
    [-0.85, 0.0],
    [-1.0, -0.22],
    [-0.7, -0.42],
    [0.02, -0.13],
  ]),
  round: buildFinGeometry([
    [0.02, 0.16],
    [-0.18, 0.28],
    [-0.4, 0.2],
    [-0.46, 0.0],
    [-0.4, -0.2],
    [-0.18, -0.28],
    [0.02, -0.16],
  ]),
  lunate: buildFinGeometry([
    [0.0, 0.06],
    [-0.45, 0.54],
    [-0.56, 0.46],
    [-0.2, 0.0],
    [-0.56, -0.46],
    [-0.45, -0.54],
    [0.0, -0.06],
  ]),
};

// Swept-back dorsal fin that rides along the top of the body.
const DORSAL_GEO = buildFinGeometry([
  [0.32, 0],
  [0.1, 0.42],
  [-0.2, 0.5],
  [-0.42, 0.12],
  [-0.4, 0],
]);
// Small rounded pectoral fin for the sides (also reused as broad ray wings).
const PECTORAL_GEO = buildFinGeometry([
  [0, 0.1],
  [-0.32, 0.16],
  [-0.38, 0],
  [-0.2, -0.12],
]);

/** Default tail shape for a body type, used when a species doesn't pick one. */
function defaultFinStyle(shape: FishBodyShape): FishFinStyle {
  switch (shape) {
    case 'long':
    case 'torpedo':
    case 'serpent':
      return 'forked';
    case 'eel':
    case 'puffer':
    case 'round':
      return 'round';
    default:
      return 'fan';
  }
}

// Scattered stud directions for the spiky puffer feature.
const SPIKE_DIRS: [number, number, number][] = [
  [0.5, 0.45, 0.4],
  [0.3, 0.7, -0.35],
  [-0.15, 0.62, 0.5],
  [-0.45, 0.4, -0.4],
  [0.1, 0.2, 0.72],
  [0.0, 0.82, 0.0],
  [-0.5, 0.18, 0.3],
  [0.42, -0.2, 0.5],
  [-0.3, -0.3, -0.5],
  [0.2, -0.42, -0.4],
  [-0.55, 0.0, -0.2],
  [0.55, 0.1, -0.45],
];

// Surface marking placements (xFrac, yFrac, side).
const SPOT_POS: [number, number, number][] = [
  [0.4, 0.45, 1],
  [0.15, 0.6, -1],
  [-0.15, 0.5, 1],
  [-0.4, 0.4, -1],
  [0.0, 0.3, 1],
  [-0.25, 0.55, -1],
];
const PATCH_POS: [number, number, number][] = [
  [0.34, 0.42, 1],
  [-0.08, 0.52, -1],
  [-0.42, 0.32, 1],
];

export default function FishModel({ species, swimming = false, phase = 0, showAura = true }: FishModelProps) {
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
    () => new THREE.MeshToonMaterial({ color: species.finColor, gradientMap, side: THREE.DoubleSide }),
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

  const tailX = -bodyScale[0] * 0.92;

  // Geometry is revolved around local Y, so lay it along X (nose +X) and scale to final shape.
  const bodyMeshScale: [number, number, number] = [bodyScale[1] * 2, bodyScale[0] * 2, bodyScale[2] * 2];

  const finStyle = species.finStyle ?? defaultFinStyle(species.bodyShape);
  const tailGeo = TAIL_GEO[finStyle];
  const tailHeight = finStyle === 'flowy' ? 2.4 : finStyle === 'round' ? 1.45 : 2.0;
  const tailLen = finStyle === 'flowy' ? 1.7 : finStyle === 'forked' || finStyle === 'lunate' ? 1.4 : 1.25;
  const dorsalHeight = DORSAL_HEIGHT[species.bodyShape] ?? 1.0;

  // A pattern ring fitted to the body's elliptical cross-section at a point along its length.
  const ring = (key: number, xFrac: number, thickness: number, mat: THREE.Material) => {
    const f = Math.sqrt(Math.max(0, 1 - (xFrac / 0.95) ** 2));
    const hY = bodyScale[1] * (0.98 * f + 0.04);
    const hZ = bodyScale[2] * (0.98 * f + 0.04);
    return (
      <mesh
        key={key}
        material={mat}
        position={[bodyScale[0] * xFrac, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[hZ, hY, thickness]}
      >
        <torusGeometry args={[1, 0.06, 8, 22]} />
      </mesh>
    );
  };

  return (
    <group ref={groupRef} scale={s}>
      {/* Body: a tapered teardrop scaled to the species silhouette. */}
      <mesh geometry={BODY_GEO} material={bodyMat} castShadow rotation={[0, 0, -Math.PI / 2]} scale={bodyMeshScale} />

      {/* Inverted-hull outline traces the body silhouette for a chunky toon look */}
      {!isGlass && (
        <mesh
          geometry={BODY_GEO}
          material={outlineMat}
          rotation={[0, 0, -Math.PI / 2]}
          scale={[bodyMeshScale[0] * 1.06, bodyMeshScale[1] * 1.05, bodyMeshScale[2] * 1.06]}
        />
      )}

      {/* Belly accent for a light underside */}
      <mesh
        material={accentMat}
        position={[bodyScale[0] * 0.12, -bodyScale[1] * 0.52, 0]}
        scale={[bodyScale[0] * 0.6, bodyScale[1] * 0.42, bodyScale[2] * 0.6]}
      >
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>

      {/* Glossy highlight on the back for a wet, polished sheen */}
      <mesh
        position={[bodyScale[0] * 0.25, bodyScale[1] * 0.62, bodyScale[2] * 0.35]}
        rotation={[0, 0.4, 0.3]}
        scale={[bodyScale[0] * 0.3, bodyScale[1] * 0.16, bodyScale[2] * 0.1]}
      >
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Eyes: large white sclera + dark pupil + glint, for a friendly toon look */}
      {[1, -1].map((side) => (
        <group key={side} position={[bodyScale[0] * 0.6, bodyScale[1] * 0.32, bodyScale[2] * 0.5 * side]}>
          <mesh>
            <sphereGeometry args={[0.13, 14, 14]} />
            <meshToonMaterial color="#fefefe" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.05, 0.01, 0.04 * side]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshToonMaterial color={species.secondaryColor} gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.07, 0.014, 0.05 * side]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#1c1c22" />
          </mesh>
          <mesh position={[0.1, 0.052, 0.082 * side]}>
            <sphereGeometry args={[0.028, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Mouth */}
      <mesh position={[bodyScale[0] * 0.9, -bodyScale[1] * 0.05, 0]} scale={[0.42, 0.22, 0.5]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#4a2c2c" />
      </mesh>

      {/* Caudal (tail) fin — flat, shaped by fin style, and wagging */}
      <group ref={tailRef} position={[tailX, 0, 0]}>
        {species.feature === 'doubletail' ? (
          <>
            <mesh
              geometry={TAIL_GEO.flowy}
              material={finMat}
              rotation={[0, 0, 0.28]}
              position={[0, bodyScale[1] * 0.18, 0]}
              scale={[bodyScale[0] * 1.4, bodyScale[1] * 2.2, 1]}
            />
            <mesh
              geometry={TAIL_GEO.flowy}
              material={finMat}
              rotation={[0, 0, -0.28]}
              position={[0, -bodyScale[1] * 0.18, 0]}
              scale={[bodyScale[0] * 1.4, bodyScale[1] * 2.2, 1]}
            />
          </>
        ) : species.feature === 'blowhole' ? (
          <mesh
            geometry={TAIL_GEO.lunate}
            material={finMat}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[bodyScale[0] * 1.1, bodyScale[2] * 2.6, 1]}
          />
        ) : (
          <mesh geometry={tailGeo} material={finMat} scale={[bodyScale[0] * tailLen, bodyScale[1] * tailHeight, 1]} />
        )}
      </group>

      {/* Dorsal fin — flat, swept back along the top, taller on some bodies */}
      <mesh
        geometry={DORSAL_GEO}
        material={finMat}
        position={[bodyScale[0] * 0.05, bodyScale[1] * 0.78, 0]}
        scale={[bodyScale[0] * 0.95, bodyScale[1] * dorsalHeight, 1]}
      />

      {/* Anal fin — small flat fin underneath, toward the tail */}
      <mesh
        geometry={DORSAL_GEO}
        material={finMat}
        position={[-bodyScale[0] * 0.32, -bodyScale[1] * 0.72, 0]}
        rotation={[Math.PI, 0, 0]}
        scale={[bodyScale[0] * 0.5, bodyScale[1] * 0.55 * dorsalHeight, 1]}
      />

      {/* Pectoral side fins — flat little fans that flutter */}
      <group position={[bodyScale[0] * 0.28, -bodyScale[1] * 0.05, bodyScale[2] * 0.62]} rotation={[Math.PI / 2, 0.35, 0]}>
        <mesh ref={finLRef} geometry={PECTORAL_GEO} material={finMat} scale={[bodyScale[0] * 0.55, bodyScale[1] * 0.7, 1]} />
      </group>
      <group position={[bodyScale[0] * 0.28, -bodyScale[1] * 0.05, -bodyScale[2] * 0.62]} rotation={[-Math.PI / 2, -0.35, 0]}>
        <mesh ref={finRRef} geometry={PECTORAL_GEO} material={finMat} scale={[bodyScale[0] * 0.55, bodyScale[1] * 0.7, 1]} />
      </group>

      {/* Pelvic fins — small paired fins tucked under the belly */}
      <group position={[bodyScale[0] * 0.34, -bodyScale[1] * 0.62, bodyScale[2] * 0.32]} rotation={[Math.PI / 2, 0.85, 0]}>
        <mesh geometry={PECTORAL_GEO} material={finMat} scale={[bodyScale[0] * 0.32, bodyScale[1] * 0.45, 1]} />
      </group>
      <group position={[bodyScale[0] * 0.34, -bodyScale[1] * 0.62, -bodyScale[2] * 0.32]} rotation={[-Math.PI / 2, -0.85, 0]}>
        <mesh geometry={PECTORAL_GEO} material={finMat} scale={[bodyScale[0] * 0.32, bodyScale[1] * 0.45, 1]} />
      </group>

      {/* Countershading — a darker ridge running along the top of the back */}
      <mesh
        material={finMat}
        position={[bodyScale[0] * 0.05, bodyScale[1] * 0.82, 0]}
        scale={[bodyScale[0] * 0.92, bodyScale[1] * 0.16, bodyScale[2] * 0.62]}
      >
        <sphereGeometry args={[1, 16, 10]} />
      </mesh>

      {/* --- Surface patterns (painted markings) --- */}
      {species.pattern === 'stripes' && [-0.45, -0.25, -0.05, 0.15, 0.35].map((x, i) => ring(i, x, 0.5, accentMat))}
      {species.pattern === 'bands' && [-0.3, 0.0, 0.3].map((x, i) => ring(i, x, 1.6, accentMat))}
      {species.pattern === 'spots' &&
        SPOT_POS.map((p, i) => (
          <mesh
            key={i}
            material={accentMat}
            position={[bodyScale[0] * p[0], bodyScale[1] * p[1], bodyScale[2] * 0.72 * p[2]]}
            scale={[bodyScale[1] * 0.16, bodyScale[1] * 0.16, bodyScale[2] * 0.08]}
          >
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        ))}
      {species.pattern === 'patches' &&
        PATCH_POS.map((p, i) => (
          <mesh
            key={i}
            material={accentMat}
            position={[bodyScale[0] * p[0], bodyScale[1] * p[1], bodyScale[2] * 0.4 * p[2]]}
            scale={[bodyScale[0] * 0.26, bodyScale[1] * 0.4, bodyScale[2] * 0.62]}
          >
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>
        ))}

      {/* --- Silhouette features (extra geometry) --- */}

      {/* Whiskers (catfish / carp barbels) */}
      {species.feature === 'whiskers' && (
        <>
          <mesh material={finMat} position={[bodyScale[0] * 0.88, -bodyScale[1] * 0.2, bodyScale[2] * 0.22]} rotation={[0, 0, -0.55]}>
            <cylinderGeometry args={[0.015, 0.015, bodyScale[0] * 0.55, 6]} />
          </mesh>
          <mesh material={finMat} position={[bodyScale[0] * 0.88, -bodyScale[1] * 0.2, -bodyScale[2] * 0.22]} rotation={[0, 0, -0.55]}>
            <cylinderGeometry args={[0.015, 0.015, bodyScale[0] * 0.55, 6]} />
          </mesh>
        </>
      )}

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

      {/* Sea-dragon crest: a tall spined ridge plus head frills (eels, serpents) */}
      {species.feature === 'segments' && (
        <>
          {[-0.6, -0.42, -0.24, -0.06, 0.12, 0.3, 0.48].map((xOff, idx) => {
            const k = Math.sin((idx / 6) * Math.PI);
            return (
              <mesh
                key={idx}
                material={finMat}
                position={[bodyScale[0] * xOff, bodyScale[1] * 0.92, 0]}
                rotation={[0, 0, Math.PI]}
                scale={[1, 1, 0.4]}
              >
                <coneGeometry args={[bodyScale[0] * 0.08, bodyScale[1] * (0.4 + k * 0.8), 5]} />
              </mesh>
            );
          })}
          {[1, -1].map((sd) => (
            <mesh
              key={sd}
              material={accentMat}
              geometry={PECTORAL_GEO}
              position={[bodyScale[0] * 0.55, bodyScale[1] * 0.32, bodyScale[2] * 0.4 * sd]}
              rotation={[Math.PI / 2, 0.6 * sd, 0.5]}
              scale={[bodyScale[0] * 0.42, bodyScale[1] * 0.95, 1]}
            />
          ))}
        </>
      )}

      {/* Jagged crystal cluster (Crystal Carp, Coral Guardian) */}
      {species.feature === 'crystals' &&
        ([
          [-0.3, 0.9, 0.2, 0.22],
          [-0.05, 1.08, -0.1, 0.32],
          [0.2, 0.96, 0.25, 0.2],
          [0.36, 0.8, -0.2, 0.26],
          [0.0, 0.86, 0.46, 0.16],
          [-0.46, 0.72, -0.3, 0.18],
        ] as [number, number, number, number][]).map((p, idx) => (
          <mesh key={idx} position={[bodyScale[0] * p[0], bodyScale[1] * p[1], bodyScale[2] * p[2]]} rotation={[0.3, idx, 0.2]}>
            <octahedronGeometry args={[bodyScale[1] * p[3], 0]} />
            <meshStandardMaterial color={species.secondaryColor} transparent opacity={0.8} metalness={0.3} roughness={0.1} />
          </mesh>
        ))}

      {/* Spiky studs (pufferfish) */}
      {species.feature === 'spikes' &&
        SPIKE_DIRS.map((d, idx) => (
          <mesh key={idx} material={finMat} position={[bodyScale[0] * d[0], bodyScale[1] * d[1], bodyScale[2] * d[2]]} rotation={[d[2], d[0], d[1]]}>
            <octahedronGeometry args={[bodyScale[1] * 0.14, 0]} />
          </mesh>
        ))}

      {/* Broad ray wings (Drakefin, Thunder Ray, Obsidian Ray) */}
      {species.feature === 'wings' && (
        <>
          <group position={[bodyScale[0] * 0.1, 0, bodyScale[2] * 0.7]} rotation={[Math.PI / 2, 0.18, 0]}>
            <mesh material={finMat} geometry={PECTORAL_GEO} scale={[bodyScale[0] * 1.5, bodyScale[2] * 2.4, 1]} />
          </group>
          <group position={[bodyScale[0] * 0.1, 0, -bodyScale[2] * 0.7]} rotation={[-Math.PI / 2, -0.18, 0]}>
            <mesh material={finMat} geometry={PECTORAL_GEO} scale={[bodyScale[0] * 1.5, bodyScale[2] * 2.4, 1]} />
          </group>
        </>
      )}

      {/* Blowhole spout bump (Starlight Finwhale) */}
      {species.feature === 'blowhole' && (
        <mesh material={accentMat} position={[bodyScale[0] * 0.5, bodyScale[1] * 0.92, 0]}>
          <sphereGeometry args={[bodyScale[1] * 0.16, 8, 8]} />
        </mesh>
      )}

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

      {/* Forward-pointing bill/horn (Sabertooth Pike, Midnight Marlin) */}
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

      {/* ===== Signature detailing for the epic & legendary "boss" fish ===== */}

      {/* Abyssal Crownshark — a proper shark: tall dorsal, swept pectorals, gills, teeth */}
      {species.id === 'abysscrownshark' && (
        <>
          <mesh material={finMat} position={[0, bodyScale[1] * 1.55, 0]} rotation={[0, 0, -0.35]} scale={[1, 1, 0.16]}>
            <coneGeometry args={[bodyScale[0] * 0.3, bodyScale[1] * 2.2, 4]} />
          </mesh>
          <mesh material={finMat} position={[bodyScale[0] * 0.2, -bodyScale[1] * 0.4, bodyScale[2] * 0.7]} rotation={[Math.PI / 2, 0.5, -0.4]} scale={[1, 1, 0.12]}>
            <coneGeometry args={[bodyScale[1] * 0.5, bodyScale[0] * 0.9, 4]} />
          </mesh>
          <mesh material={finMat} position={[bodyScale[0] * 0.2, -bodyScale[1] * 0.4, -bodyScale[2] * 0.7]} rotation={[-Math.PI / 2, -0.5, -0.4]} scale={[1, 1, 0.12]}>
            <coneGeometry args={[bodyScale[1] * 0.5, bodyScale[0] * 0.9, 4]} />
          </mesh>
          {[0.55, 0.46, 0.37, 0.28].map((gx, i) =>
            [1, -1].map((sd) => (
              <mesh
                key={`${i}-${sd}`}
                material={accentMat}
                position={[bodyScale[0] * gx, 0, bodyScale[2] * 0.55 * sd]}
                rotation={[0, 0, 0.3]}
                scale={[0.04, bodyScale[1] * 0.7, 0.04]}
              >
                <boxGeometry args={[1, 1, 1]} />
              </mesh>
            )),
          )}
          {[-0.18, -0.06, 0.06, 0.18].map((tz, i) => (
            <mesh key={i} position={[bodyScale[0] * 0.86, -bodyScale[1] * 0.18, bodyScale[2] * tz]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[bodyScale[1] * 0.06, bodyScale[1] * 0.2, 4]} />
              <meshStandardMaterial color="#f4f4ee" />
            </mesh>
          ))}
        </>
      )}

      {/* Emperor Leviathan — a colossal sea monster: jagged spine, horns, tendrils, fangs */}
      {species.id === 'emperorleviathan' && (
        <>
          {[-0.5, -0.32, -0.14, 0.04, 0.22, 0.4].map((sx, i) => {
            const k = 1 - Math.abs(i - 2.5) / 3;
            return (
              <mesh key={i} material={accentMat} position={[bodyScale[0] * sx, bodyScale[1] * 0.95, 0]} rotation={[0, 0, Math.PI - 0.15]}>
                <coneGeometry args={[bodyScale[0] * 0.07, bodyScale[1] * (0.5 + k * 1.2), 5]} />
              </mesh>
            );
          })}
          {[1, -1].map((sd) => (
            <mesh key={sd} material={accentMat} position={[bodyScale[0] * 0.72, bodyScale[1] * 0.72, bodyScale[2] * 0.35 * sd]} rotation={[0, 0, -1.1]}>
              <coneGeometry args={[bodyScale[1] * 0.13, bodyScale[1] * 0.95, 6]} />
            </mesh>
          ))}
          {[0.3, 0.0, -0.3].map((tz, i) => (
            <mesh key={i} material={finMat} position={[bodyScale[0] * 0.85, -bodyScale[1] * 0.35, bodyScale[2] * tz]} rotation={[0, 0, 0.7]}>
              <cylinderGeometry args={[0.02, 0.045, bodyScale[0] * 0.95, 6]} />
            </mesh>
          ))}
          {[-0.3, -0.15, 0, 0.15, 0.3].map((tz, i) => (
            <mesh key={i} position={[bodyScale[0] * 0.78, -bodyScale[1] * 0.22, bodyScale[2] * tz]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[bodyScale[1] * 0.08, bodyScale[1] * 0.3, 4]} />
              <meshStandardMaterial color="#e8e6da" />
            </mesh>
          ))}
        </>
      )}

      {/* Phoenix Flarefin — a sweeping crest of flames trailing back from the head */}
      {species.id === 'phoenixflarefin' &&
        ([
          [-0.25, 0.78, '#FF6B00'],
          [-0.02, 1.0, '#FF4500'],
          [0.22, 1.2, '#FFD700'],
        ] as [number, number, string][]).map((f, i) => (
          <mesh key={i} position={[bodyScale[0] * f[0], bodyScale[1] * f[1], 0]} rotation={[0, 0, Math.PI - 0.32]} scale={[1, 1, 0.22]}>
            <coneGeometry args={[bodyScale[0] * 0.14, bodyScale[1] * 1.05, 5]} />
            <meshStandardMaterial color={f[2]} emissive={f[2]} emissiveIntensity={0.45} />
          </mesh>
        ))}
      {species.id === 'phoenixflarefin' &&
        [0.22, 0.0, -0.22].map((tz, i) => (
          <mesh key={`t${i}`} position={[tailX * 1.05, 0, bodyScale[2] * tz]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.25]}>
            <coneGeometry args={[bodyScale[1] * 0.45, bodyScale[0] * 0.95, 5]} />
            <meshStandardMaterial color={i === 1 ? '#FFD700' : '#FF6B00'} emissive="#FF6B00" emissiveIntensity={0.4} />
          </mesh>
        ))}

      {/* Golden Drakefin — an eastern dragon: spined back ridge, horns, trailing barbels */}
      {species.id === 'goldendrake' && (
        <>
          {[-0.55, -0.38, -0.2, -0.02, 0.16, 0.34, 0.5].map((sx, i) => {
            const k = Math.sin((i / 6) * Math.PI);
            return (
              <mesh key={`s${i}`} material={accentMat} position={[bodyScale[0] * sx, bodyScale[1] * 0.95, 0]} rotation={[0, 0, Math.PI - 0.08]}>
                <coneGeometry args={[bodyScale[0] * 0.05, bodyScale[1] * (0.4 + k * 0.9), 5]} />
              </mesh>
            );
          })}
          {[1, -1].map((sd) => (
            <mesh key={`h${sd}`} material={accentMat} position={[bodyScale[0] * 0.78, bodyScale[1] * 0.62, bodyScale[2] * 0.3 * sd]} rotation={[0, 0, -1.3]}>
              <coneGeometry args={[bodyScale[1] * 0.1, bodyScale[1] * 0.85, 6]} />
            </mesh>
          ))}
          {[1, -1].map((sd) => (
            <mesh key={`b${sd}`} material={accentMat} position={[bodyScale[0] * 1.0, -bodyScale[1] * 0.1, bodyScale[2] * 0.2 * sd]} rotation={[0, 0, 0.4]}>
              <cylinderGeometry args={[0.015, 0.03, bodyScale[0] * 1.1, 6]} />
            </mesh>
          ))}
        </>
      )}

      {/* Nebula Jelly — a drifting bell with trailing tentacles */}
      {species.id === 'nebulajelly' &&
        [-0.3, -0.15, 0, 0.15, 0.3].map((tz, i) => (
          <mesh
            key={i}
            material={accentMat}
            position={[bodyScale[0] * (tz * 0.3), -bodyScale[1] * 0.95, bodyScale[2] * tz]}
            rotation={[Math.PI, 0, 0]}
          >
            <coneGeometry args={[0.035, bodyScale[1] * (1.1 + (i % 2) * 0.5), 6]} />
          </mesh>
        ))}

      {/* Thunder Ray & Obsidian Ray — a long whip tail tipped with a stinger barb */}
      {(species.id === 'thunderray' || species.id === 'obsidianray') && (
        <group position={[tailX * 1.05, 0, 0]}>
          <mesh material={finMat} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.05, bodyScale[0] * 1.5, 6]} />
          </mesh>
          <mesh material={accentMat} position={[-bodyScale[0] * 0.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.07, bodyScale[0] * 0.32, 5]} />
          </mesh>
        </group>
      )}

      {/* Celestial Koi — long flowing veils and golden barbels */}
      {species.id === 'celestialkoi' && (
        <>
          {[1, -1].map((sd) => (
            <mesh
              key={`v${sd}`}
              material={finMat}
              geometry={TAIL_GEO.flowy}
              position={[bodyScale[0] * 0.1, -bodyScale[1] * 0.2, bodyScale[2] * 0.5 * sd]}
              rotation={[Math.PI / 2, 0.3 * sd, 0]}
              scale={[bodyScale[0] * 0.7, bodyScale[2] * 1.7, 1]}
            />
          ))}
          {[1, -1].map((sd) => (
            <mesh key={`b${sd}`} material={accentMat} position={[bodyScale[0] * 0.95, -bodyScale[1] * 0.15, bodyScale[2] * 0.2 * sd]} rotation={[0, 0, 0.5]}>
              <cylinderGeometry args={[0.012, 0.02, bodyScale[0] * 0.7, 6]} />
            </mesh>
          ))}
        </>
      )}

      {/* Starlight Finwhale — a scatter of bright stars across its cosmic back */}
      {species.id === 'starlightorca' &&
        ([
          [0.5, 0.7, 0.3],
          [0.2, 0.85, -0.2],
          [-0.1, 0.75, 0.4],
          [-0.4, 0.6, -0.3],
          [0.0, 0.52, 0.5],
        ] as [number, number, number][]).map((p, i) => (
          <mesh key={i} position={[bodyScale[0] * p[0], bodyScale[1] * p[1], bodyScale[2] * p[2]]} rotation={[0.4, i, 0.2]}>
            <octahedronGeometry args={[bodyScale[1] * 0.1, 0]} />
            <meshBasicMaterial color={species.finColor} />
          </mesh>
        ))}

      {/* Bioluminescent dots dotting the flanks of glowing species */}
      {species.glow &&
        ([
          [0.32, -0.08, 1],
          [0.05, -0.2, -1],
          [-0.25, -0.04, 1],
          [-0.5, -0.16, -1],
        ] as [number, number, number][]).map((p, i) => (
          <mesh key={i} position={[bodyScale[0] * p[0], bodyScale[1] * p[1], bodyScale[2] * 0.72 * p[2]]}>
            <sphereGeometry args={[bodyScale[1] * 0.09, 8, 8]} />
            <meshBasicMaterial color={species.secondaryColor} />
          </mesh>
        ))}

      {/* Glow halo for special fish */}
      {species.glow && showAura && (
        <mesh scale={[bodyScale[0] * 1.4, bodyScale[1] * 1.4, bodyScale[2] * 1.4]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color={species.secondaryColor} transparent opacity={0.18} />
        </mesh>
      )}
    </group>
  );
}
