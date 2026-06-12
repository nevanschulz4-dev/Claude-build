import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { useToonGradient, useGrassTexture, useSandTexture, useMudTexture } from '../../utils/textures';
import type { EnvironmentTheme, LocationId } from '../../data/types';
import BiomeLandmarks from './BiomeLandmarks';
import Birds from './Birds';
import Rain from './Rain';
import { useEnvironmentStore, getDayFactor } from '../../store/environmentStore';
import * as THREE from 'three';

interface TreeProps {
  position: [number, number, number];
  scale: number;
  trunkColor: string;
  leafColor: string;
  gradientMap: THREE.Texture;
}

function Tree({ position, scale, trunkColor, leafColor, gradientMap }: TreeProps) {
  const foliageRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => position[0] * 0.7 + position[2] * 0.3, [position]);

  useFrame(({ clock }) => {
    if (!foliageRef.current) return;
    const t = clock.getElapsedTime();
    foliageRef.current.rotation.z = Math.sin(t * 0.8 + phase) * 0.025;
    foliageRef.current.rotation.x = Math.sin(t * 0.6 + phase * 1.3) * 0.02;
  });

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 1.2, 6]} />
        <meshToonMaterial color={trunkColor} gradientMap={gradientMap} />
      </mesh>
      <group ref={foliageRef} position={[0, 1.2, 0]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <coneGeometry args={[1.0, 1.6, 7]} />
          <meshToonMaterial color={leafColor} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <coneGeometry args={[0.75, 1.2, 7]} />
          <meshToonMaterial color={leafColor} gradientMap={gradientMap} />
        </mesh>
      </group>
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
  /** Radius of the pond, used to size the surrounding rim. */
  pondRadius?: number;
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
  ambientColor = '#fff7e8',
  hemisphereSky = '#bfe9ff',
  hemisphereGround = '#7bc47f',
  treeLeafColors = LEAF_COLORS,
  hillColors = HILL_COLORS,
  biomeId,
  pondRadius = 6,
}: EnvironmentProps) {
  const gradientMap = useToonGradient(4);
  const grassTexture = useGrassTexture();
  const sandTexture = useSandTexture();
  const mudTexture = useMudTexture();

  const timeOfDay = useEnvironmentStore((s) => s.timeOfDay);
  const weather = useEnvironmentStore((s) => s.weather);

  useFrame((_, delta) => {
    useEnvironmentStore.getState().tick(delta);
  });

  const dayFactor = getDayFactor(timeOfDay);
  const dayClamp = Math.max(0, dayFactor);
  const nightClamp = Math.max(0, -dayFactor);
  const isRaining = weather === 'rain';
  const isNight = dayFactor < 0.05;

  const sunAngle = (timeOfDay - 0.25) * Math.PI * 2;
  const skySunPosition = useMemo<[number, number, number]>(
    () => [Math.cos(sunAngle) * 100, Math.sin(sunAngle) * 100, 30],
    [sunAngle],
  );
  const lightPosition = useMemo<[number, number, number]>(
    () => [Math.cos(sunAngle) * 30, Math.max(8, Math.sin(sunAngle) * 30), 20],
    [sunAngle],
  );
  const moonPosition = useMemo<[number, number, number]>(
    () => [3 + Math.cos(sunAngle) * 2, 4.5, -6.5],
    [sunAngle],
  );

  const ambientCol = useMemo(
    () => new THREE.Color(ambientColor).lerp(new THREE.Color('#1a2540'), nightClamp * 0.85).getStyle(),
    [ambientColor, nightClamp],
  );
  const ambientIntensity = 0.55 * (0.35 + 0.65 * Math.max(dayClamp, 0.15)) * (isRaining ? 0.7 : 1);

  const hemiSkyCol = useMemo(
    () => new THREE.Color(hemisphereSky).lerp(new THREE.Color('#0a1530'), nightClamp * 0.85).getStyle(),
    [hemisphereSky, nightClamp],
  );
  const hemiGroundCol = useMemo(
    () => new THREE.Color(hemisphereGround).lerp(new THREE.Color('#0a1018'), nightClamp * 0.7).getStyle(),
    [hemisphereGround, nightClamp],
  );

  const dirColor = useMemo(() => {
    if (dayFactor >= 0) return new THREE.Color('#FFB37A').lerp(new THREE.Color('#fff4d6'), dayFactor).getStyle();
    return '#4a5a8a';
  }, [dayFactor]);
  const dirIntensity = (0.15 + 2.05 * Math.max(dayClamp, 0)) * (isRaining ? 0.5 : 1);

  const fogConfig = useMemo<[string, number, number] | null>(() => {
    if (isRaining) return ['#7d8a99', 8, 38];
    if (biomeId === 'swamp') return ['#9aa88c', 10, 42];
    return null;
  }, [isRaining, biomeId]);

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
      <Sky distance={450000} sunPosition={skySunPosition} turbidity={skyTurbidity} rayleigh={skyRayleigh} mieCoefficient={mieCoefficient} mieDirectionalG={mieDirectionalG} />

      {/* Stars fade in once the sun dips below the horizon */}
      {isNight && <Stars radius={120} depth={60} count={2500} factor={4} saturation={0} fade speed={0.3} />}

      {/* Moon hangs over the pond at night */}
      {isNight && (
        <group position={moonPosition}>
          <mesh>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial color="#F4F1E8" />
          </mesh>
          <mesh scale={1.8}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial color="#AEC6E8" transparent opacity={0.15} depthWrite={false} />
          </mesh>
        </group>
      )}

      {/* Murky haze for the swamp, or low visibility during rain */}
      {fogConfig && <fog attach="fog" args={fogConfig} />}

      {/* Falling rain */}
      {isRaining && <Rain />}

      {/* Birds glide across the daytime sky */}
      {!isNight && !isRaining && <Birds />}

      {/* Lighting */}
      <ambientLight intensity={ambientIntensity} color={ambientCol} />
      <hemisphereLight args={[hemiSkyCol, hemiGroundCol, 0.6]} />
      <directionalLight
        position={lightPosition}
        intensity={dirIntensity}
        color={dirColor}
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
        <ringGeometry args={[pondRadius, pondRadius + 0.6, 64]} />
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
