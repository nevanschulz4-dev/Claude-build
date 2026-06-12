import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { FISH_BY_ID } from '../../data/fishData';
import FishModel from './FishModel';

interface SwimPath {
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
  depth: number;
  direction: number;
}

function SwimmingFish({ speciesId, path }: { speciesId: string; path: SwimPath }) {
  const species = FISH_BY_ID[speciesId];
  const groupRef = useRef<THREE.Group>(null);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * path.speed * path.direction + path.phase;
    const x = Math.cos(t) * path.radiusX;
    const z = Math.sin(t) * path.radiusZ;
    const y = path.depth + Math.sin(t * 3) * 0.05;
    groupRef.current.position.set(x, y, z);

    const dt = 0.05 * path.direction;
    const nx = Math.cos(t + dt) * path.radiusX;
    const nz = Math.sin(t + dt) * path.radiusZ;
    lookTarget.set(nx, y, nz);
    groupRef.current.lookAt(lookTarget);
  });

  if (!species) return null;

  return (
    <group ref={groupRef}>
      <FishModel species={species} swimming phase={path.phase} />
    </group>
  );
}

export default function PondFishLayer() {
  const unlockedFishIds = useGameStore((s) => s.unlockedFishIds);

  const paths = useMemo(() => {
    const map: Record<string, SwimPath> = {};
    unlockedFishIds.forEach((id, i) => {
      const seed = i * 13.37;
      map[id] = {
        radiusX: 2 + ((seed * 7) % 30) / 10,
        radiusZ: 1.5 + ((seed * 11) % 30) / 10,
        speed: 0.15 + ((seed * 3) % 10) / 40,
        phase: seed,
        depth: -0.15 - ((seed * 5) % 10) / 40,
        direction: i % 2 === 0 ? 1 : -1,
      };
    });
    return map;
  }, [unlockedFishIds]);

  return (
    <group>
      {unlockedFishIds.map((id) => (
        <SwimmingFish key={id} speciesId={id} path={paths[id]} />
      ))}
    </group>
  );
}
