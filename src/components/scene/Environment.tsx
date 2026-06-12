import { useMemo } from 'react';
import { Sky } from '@react-three/drei';
import { useToonGradient, useGrassTexture, useSandTexture, useMudTexture } from '../../utils/textures';
import type { EnvironmentTheme, LocationId } from '../../data/types';
import BiomeLandmarks from './BiomeLandmarks';
import * as THREE from 'three';

interface TreeProps {
  position: [number, number, number];
  scale: number;
  trunkColor: string;
  leafColor: string;
  gradientMap: THREE.Texture;
}

function Tree({ position, scale, trunkColor, leafColor, gradientMap }: TreeProps) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 1.2, 6]} />
        <meshToonMaterial color={trunkColor} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[1.0, 1.6, 7]} />
        <meshToonMaterial color={leafColor} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[0.75, 1.2, 7]} />
        <meshToonMaterial color={leafColor} gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

function Hill({ position, scale, color, gradientMap }: { position: [number, number, number]; scale: number; color: string; gradientMap: THREE.Texture }) {
  return (
    <mesh position={position} scale={[scale, scale * 0.6, scale]} receiveShadow>
      <sphereGeometry args={[1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshToonMaterial color={color} gradientMap={gradientMap} />
    </mesh>
  );
}

const LEAF_COLORS = ['#3FA34D', '#52B768', '#2E8B4E', '#6BC36F'];
const HILL_COLORS = ['#5CA85C', '#4F9B5E'];

interface EnvironmentProps extends EnvironmentTheme {
  /** The current fishing biome, used to render distinctive landmarks. */
  biomeId?: Exclude<LocationId, 'home'>;
}

export default function Environment({
  groundTexture = 'grass',
  groundTint,
  rimTexture = 'sand',
  rimTint,
  skyTurbidity = 8,
  skyRayleigh = 2.5,
  mieCoefficient = 0.006,
  mieDirectionalG = 0.75,
  sunPosition = [20, 18, 10],
  ambientColor = '#fff7e8',
  hemisphereSky = '#bfe9ff',
  hemisphereGround = '#7bc47f',
  treeLeafColors = LEAF_COLORS,
  hillColors = HILL_COLORS,
  biomeId,
}: EnvironmentProps) {
  const gradientMap = useToonGradient(4);
  const grassTexture = useGrassTexture();
  const sandTexture = useSandTexture();
  const mudTexture = useMudTexture();

  const textures: Record<'grass' | 'sand' | 'mud', THREE.Texture> = {
    grass: grassTexture,
    sand: sandTexture,
    mud: mudTexture,
  };

  const trees = useMemo(() => {
    const items: { position: [number, number, number]; scale: number; leafColor: string }[] = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.sin(i * 1.7) * 0.2;
      const r = 17 + Math.sin(i * 2.3) * 2.5;
      items.push({
        position: [Math.cos(angle) * r, 0, Math.sin(angle) * r],
        scale: 1.1 + ((i * 37) % 10) / 10,
        leafColor: treeLeafColors[i % treeLeafColors.length],
      });
    }
    return items;
  }, [treeLeafColors]);

  const hills = useMemo(() => {
    const items: { position: [number, number, number]; scale: number; color: string }[] = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.4;
      const r = 26 + (i % 3) * 3;
      items.push({
        position: [Math.cos(angle) * r, -1, Math.sin(angle) * r],
        scale: 8 + (i % 3) * 3,
        color: hillColors[i % hillColors.length],
      });
    }
    return items;
  }, [hillColors]);

  return (
    <>
      {/* Sky + sun */}
      <Sky distance={450000} sunPosition={sunPosition} turbidity={skyTurbidity} rayleigh={skyRayleigh} mieCoefficient={mieCoefficient} mieDirectionalG={mieDirectionalG} />

      {/* Murky haze for the swamp */}
      {biomeId === 'swamp' && <fog attach="fog" args={['#9aa88c', 10, 42]} />}

      {/* Lighting */}
      <ambientLight intensity={0.55} color={ambientColor} />
      <hemisphereLight args={[hemisphereSky, hemisphereGround, 0.6]} />
      <directionalLight
        position={[20, 25, 15]}
        intensity={2.2}
        color="#fff4d6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0005}
      />

      {/* Ground island */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[18, 64]} />
        <meshToonMaterial map={textures[groundTexture]} gradientMap={gradientMap} color={groundTint ?? '#ffffff'} />
      </mesh>

      {/* Pond rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[6, 6.6, 64]} />
        <meshToonMaterial map={textures[rimTexture]} gradientMap={gradientMap} color={rimTint ?? '#ffffff'} />
      </mesh>

      {/* Background scenery */}
      {hills.map((h, i) => (
        <Hill key={`hill-${i}`} position={h.position} scale={h.scale} color={h.color} gradientMap={gradientMap} />
      ))}
      {trees.map((t, i) => (
        <Tree key={`tree-${i}`} position={t.position} scale={t.scale} leafColor={t.leafColor} trunkColor="#8B5E34" gradientMap={gradientMap} />
      ))}

      {/* Biome-specific landmarks */}
      {biomeId && <BiomeLandmarks biomeId={biomeId} gradientMap={gradientMap} />}
    </>
  );
}
