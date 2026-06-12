import { useMemo } from 'react';
import * as THREE from 'three';
import type { LocationId } from '../../data/types';

interface LandmarkProps {
  gradientMap: THREE.Texture;
}

/** Wooden pier reaching from the shore out over the lake. */
function Dock({ gradientMap }: LandmarkProps) {
  const plankColor = '#A87C4F';
  const postColor = '#6B4A2B';
  const plankXs = [6.3, 5.75, 5.2, 4.65, 4.1, 3.55, 3.0];

  return (
    <group>
      {plankXs.map((x, i) => (
        <mesh key={`plank-${i}`} position={[x, 0.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.08, 1.5]} />
          <meshToonMaterial color={plankColor} gradientMap={gradientMap} />
        </mesh>
      ))}
      {[5.9, 4.35, 3.2].map((x, i) =>
        [-0.6, 0.6].map((z, j) => (
          <mesh key={`post-${i}-${j}`} position={[x, -0.2, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 1.0, 8]} />
            <meshToonMaterial color={postColor} gradientMap={gradientMap} />
          </mesh>
        )),
      )}
      {/* Railing along the far edge */}
      {plankXs.map((x, i) => (
        <mesh key={`railpost-${i}`} position={[x, 0.5, 0.7]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.36, 6]} />
          <meshToonMaterial color={postColor} gradientMap={gradientMap} />
        </mesh>
      ))}
      <mesh position={[(plankXs[0] + plankXs[plankXs.length - 1]) / 2, 0.66, 0.7]} castShadow>
        <boxGeometry args={[plankXs[0] - plankXs[plankXs.length - 1] + 0.5, 0.06, 0.06]} />
        <meshToonMaterial color={postColor} gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

/** Snow-capped mountain range far in the background. */
function Mountains({ gradientMap }: LandmarkProps) {
  const peaks = useMemo(() => {
    const items: { position: [number, number, number]; height: number; radius: number; rockColor: string }[] = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.5;
      const r = 34 + (i % 3) * 4;
      items.push({
        position: [Math.cos(angle) * r, -1, Math.sin(angle) * r],
        height: 14 + (i % 4) * 4,
        radius: 7 + (i % 3) * 2,
        rockColor: i % 2 === 0 ? '#8B97A8' : '#7A8699',
      });
    }
    return items;
  }, []);

  return (
    <>
      {peaks.map((p, i) => (
        <group key={`peak-${i}`} position={p.position}>
          <mesh position={[0, p.height / 2, 0]} castShadow receiveShadow>
            <coneGeometry args={[p.radius, p.height, 5]} />
            <meshToonMaterial color={p.rockColor} gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0, p.height * 0.82, 0]}>
            <coneGeometry args={[p.radius * 0.35, p.height * 0.32, 5]} />
            <meshToonMaterial color="#F4F8FC" gradientMap={gradientMap} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Reed banks and smooth river rocks dotting the current. */
function RiverFeatures({ gradientMap }: LandmarkProps) {
  const reedClusters = useMemo(() => {
    const items: { x: number; z: number; h: number }[] = [];
    for (let i = 0; i < 9; i++) {
      const angle = Math.PI * 0.55 + i * 0.12;
      const r = 6.1 + (i % 3) * 0.25;
      items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, h: 0.7 + (i % 4) * 0.15 });
    }
    return items;
  }, []);

  const rocks = useMemo(() => {
    const items: { x: number; z: number; s: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI * 0.5 - 0.45 + i * 0.5;
      const r = 3 + (i % 3) * 1.2;
      items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, s: 0.3 + (i % 3) * 0.15 });
    }
    return items;
  }, []);

  return (
    <>
      {reedClusters.map((c, i) => (
        <group key={`reed-${i}`} position={[c.x, 0.02, c.z]}>
          {[0, 1, 2].map((j) => (
            <mesh key={j} position={[(j - 1) * 0.08, c.h / 2, (j % 2) * 0.06]} rotation={[0.06 * (j - 1), 0, 0.05 * (j - 1)]} castShadow>
              <coneGeometry args={[0.035, c.h, 6]} />
              <meshToonMaterial color="#3FA34D" gradientMap={gradientMap} />
            </mesh>
          ))}
        </group>
      ))}
      {rocks.map((r, i) => (
        <mesh key={`rock-${i}`} position={[r.x, 0.1, r.z]} scale={r.s} rotation={[0.3, i, 0.2]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.4, 0]} />
          <meshToonMaterial color="#9CA3AF" gradientMap={gradientMap} />
        </mesh>
      ))}
    </>
  );
}

/** A leaning palm tree with curved trunk and fan of fronds. */
function PalmTree({ gradientMap }: LandmarkProps) {
  return (
    <group>
      <mesh position={[0, 0.9, 0]} rotation={[0, 0, 0.12]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.8, 6]} />
        <meshToonMaterial color="#9C7A4A" gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.25, 1.95, 0]} rotation={[0, 0, 0.35]} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 1.0, 6]} />
        <meshToonMaterial color="#9C7A4A" gradientMap={gradientMap} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[0.45, 2.45, 0]} rotation={[0.3, a, Math.PI / 2.2]} castShadow>
            <coneGeometry args={[0.18, 1.3, 4]} />
            <meshToonMaterial color="#3FA34D" gradientMap={gradientMap} />
          </mesh>
        );
      })}
      <mesh position={[0.4, 2.3, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshToonMaterial color="#6B4A2B" gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

/** A small cluster of branching coral and an anemone, resting on the seabed. */
function CoralCluster({ gradientMap }: LandmarkProps) {
  const branches = useMemo(
    () => [
      { x: -0.15, z: 0.1, h: 0.4, color: '#FF7B9C', tilt: -0.15 },
      { x: 0.1, z: -0.1, h: 0.55, color: '#FF9ED2', tilt: 0.1 },
      { x: 0.2, z: 0.18, h: 0.3, color: '#FFB36B', tilt: 0.2 },
    ],
    [],
  );

  return (
    <group>
      {branches.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} rotation={[0, 0, b.tilt]} castShadow>
          <coneGeometry args={[0.1, b.h, 6]} />
          <meshToonMaterial color={b.color} gradientMap={gradientMap} />
        </mesh>
      ))}
      {/* Anemone */}
      <mesh position={[-0.2, 0.08, -0.15]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshToonMaterial color="#C9A8FF" gradientMap={gradientMap} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={`tendril-${i}`} position={[-0.2 + Math.cos(a) * 0.1, 0.16, -0.15 + Math.sin(a) * 0.1]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.025, 0.12, 4]} />
            <meshToonMaterial color="#E8C8FF" gradientMap={gradientMap} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Palm trees, a beached rowboat, and underwater coral clusters. */
function OceanFeatures({ gradientMap }: LandmarkProps) {
  const palms = useMemo(() => {
    const items: { x: number; z: number; scale: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI * 0.75 + i * 0.18;
      const r = 6.9 + (i % 2) * 0.6;
      items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, scale: 0.9 + (i % 3) * 0.15 });
    }
    return items;
  }, []);

  const corals = useMemo(() => {
    const items: { x: number; z: number; scale: number; rotation: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + 0.6;
      const r = 1.8 + (i % 3) * 1.0;
      items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, scale: 0.8 + (i % 3) * 0.25, rotation: i * 1.3 });
    }
    return items;
  }, []);

  return (
    <>
      {palms.map((p, i) => (
        <group key={`palm-${i}`} position={[p.x, 0, p.z]} scale={p.scale}>
          <PalmTree gradientMap={gradientMap} />
        </group>
      ))}
      {/* Beached rowboat */}
      <group position={[-4.5, 0.08, -2.5]} rotation={[0, 0.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.25, 0.6]} />
          <meshToonMaterial color="#A87C4F" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.2, 0.06, 0.45]} />
          <meshToonMaterial color="#7A4A2B" gradientMap={gradientMap} />
        </mesh>
      </group>
      {/* Coral reef on the seabed */}
      {corals.map((c, i) => (
        <group key={`coral-${i}`} position={[c.x, -0.4, c.z]} scale={c.scale} rotation={[0, c.rotation, 0]}>
          <CoralCluster gradientMap={gradientMap} />
        </group>
      ))}
    </>
  );
}

/** A single bare, leafless tree for the swamp. */
function DeadTree({ position, scale, gradientMap }: LandmarkProps & { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]} rotation={[0, 0, 0.08]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 1.8, 6]} />
        <meshToonMaterial color="#4A3B2E" gradientMap={gradientMap} />
      </mesh>
      {[
        [0.3, 1.6, 0.6, 0.6],
        [-0.35, 1.75, -0.45, 0.5],
        [0.1, 1.95, 0.2, 0.4],
      ].map((b, i) => (
        <mesh key={i} position={[b[0], b[1], 0]} rotation={[0, 0, b[2]]} castShadow>
          <cylinderGeometry args={[0.04, 0.08, b[3], 5]} />
          <meshToonMaterial color="#3E3024" gradientMap={gradientMap} />
        </mesh>
      ))}
    </group>
  );
}

/** Dead trees ringing the shore and lily pads scattered on the murky water. */
function SwampFeatures({ gradientMap }: LandmarkProps) {
  const deadTrees = useMemo(() => {
    const items: { position: [number, number, number]; scale: number }[] = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const angle = 1.6 + i * 0.45;
      const r = 7 + (i % 3) * 1.2;
      items.push({ position: [Math.cos(angle) * r, 0, Math.sin(angle) * r], scale: 1.0 + (i % 3) * 0.25 });
    }
    return items;
  }, []);

  const lilypads = useMemo(() => {
    const items: { x: number; z: number; s: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI * 1.0 + i * 0.5;
      const r = 1.5 + (i % 3) * 0.9;
      items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, s: 0.3 + (i % 3) * 0.12 });
    }
    return items;
  }, []);

  return (
    <>
      {deadTrees.map((t, i) => (
        <DeadTree key={`dead-${i}`} position={t.position} scale={t.scale} gradientMap={gradientMap} />
      ))}
      {lilypads.map((p, i) => (
        <mesh key={`pad-${i}`} position={[p.x, 0.065, p.z]} scale={p.s} rotation={[0, i, 0]} receiveShadow>
          <cylinderGeometry args={[1, 1, 0.04, 12]} />
          <meshToonMaterial color="#4A5D3A" gradientMap={gradientMap} />
        </mesh>
      ))}
    </>
  );
}

interface BiomeLandmarksProps {
  biomeId: Exclude<LocationId, 'home'>;
  gradientMap: THREE.Texture;
}

/** Renders landmark geometry that gives each fishing biome a distinct identity. */
export default function BiomeLandmarks({ biomeId, gradientMap }: BiomeLandmarksProps) {
  switch (biomeId) {
    case 'lake':
      return (
        <>
          <Dock gradientMap={gradientMap} />
          <Mountains gradientMap={gradientMap} />
        </>
      );
    case 'river':
      return <RiverFeatures gradientMap={gradientMap} />;
    case 'ocean':
      return <OceanFeatures gradientMap={gradientMap} />;
    case 'swamp':
      return <SwampFeatures gradientMap={gradientMap} />;
    default:
      return null;
  }
}
