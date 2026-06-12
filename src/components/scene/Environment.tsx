import { useMemo } from 'react';
import { Sky } from '@react-three/drei';
import { useToonGradient, useGrassTexture, useSandTexture } from '../../utils/textures';
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

export default function Environment() {
  const gradientMap = useToonGradient(4);
  const grassTexture = useGrassTexture();
  const sandTexture = useSandTexture();

  const trees = useMemo(() => {
    const items: { position: [number, number, number]; scale: number; leafColor: string }[] = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.sin(i * 1.7) * 0.2;
      const r = 17 + Math.sin(i * 2.3) * 2.5;
      items.push({
        position: [Math.cos(angle) * r, 0, Math.sin(angle) * r],
        scale: 1.1 + ((i * 37) % 10) / 10,
        leafColor: LEAF_COLORS[i % LEAF_COLORS.length],
      });
    }
    return items;
  }, []);

  const hills = useMemo(() => {
    const items: { position: [number, number, number]; scale: number; color: string }[] = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.4;
      const r = 26 + (i % 3) * 3;
      items.push({
        position: [Math.cos(angle) * r, -1, Math.sin(angle) * r],
        scale: 8 + (i % 3) * 3,
        color: i % 2 === 0 ? '#5CA85C' : '#4F9B5E',
      });
    }
    return items;
  }, []);

  return (
    <>
      {/* Sky + sun */}
      <Sky distance={450000} sunPosition={[20, 18, 10]} turbidity={8} rayleigh={2.5} mieCoefficient={0.006} mieDirectionalG={0.75} />

      {/* Lighting */}
      <ambientLight intensity={0.55} color="#fff7e8" />
      <hemisphereLight args={['#bfe9ff', '#7bc47f', 0.6]} />
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
        <meshToonMaterial map={grassTexture} gradientMap={gradientMap} color="#ffffff" />
      </mesh>

      {/* Pond rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[6, 6.6, 64]} />
        <meshToonMaterial map={sandTexture} gradientMap={gradientMap} color="#ffffff" />
      </mesh>

      {/* Background scenery */}
      {hills.map((h, i) => (
        <Hill key={`hill-${i}`} position={h.position} scale={h.scale} color={h.color} gradientMap={gradientMap} />
      ))}
      {trees.map((t, i) => (
        <Tree key={`tree-${i}`} position={t.position} scale={t.scale} leafColor={t.leafColor} trunkColor="#8B5E34" gradientMap={gradientMap} />
      ))}
    </>
  );
}
