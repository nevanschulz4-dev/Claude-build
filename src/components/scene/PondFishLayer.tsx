import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { FISH_BY_ID } from '../../data/fishData';
import type { SwimPattern } from '../../data/types';
import FishModel from './FishModel';

interface SwimPath {
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
  depth: number;
  direction: number;
  pattern: SwimPattern;
}

/** Computes the world position for a fish at time t, per its swim pattern. */
function swimPosition(path: SwimPath, t: number, out: THREE.Vector3): THREE.Vector3 {
  const { radiusX, radiusZ, speed, phase, depth, direction, pattern } = path;
  const tt = t * speed * direction + phase;

  switch (pattern) {
    case 'hover':
      // Tight, slow loop with pronounced vertical bobbing - grazes near the bottom.
      out.set(Math.cos(tt) * radiusX, depth + Math.sin(tt * 1.7) * 0.18, Math.sin(tt) * radiusZ);
      break;
    case 'dart': {
      // Bursts of speed followed by slow drifts.
      const burst = tt + Math.sin(tt * 2.3) * 1.5;
      out.set(Math.cos(burst) * radiusX, depth + Math.sin(tt * 4) * 0.04, Math.sin(burst) * radiusZ * 1.15);
      break;
    }
    case 'figure8':
      // Lissajous figure-eight loop.
      out.set(Math.sin(tt * 2) * radiusX, depth + Math.sin(tt * 3) * 0.05, Math.sin(tt) * radiusZ);
      break;
    case 'serpentine': {
      // Orbit with a sinuous wobble in radius, like an undulating eel.
      const wobble = Math.sin(tt * 5) * 0.4;
      out.set(Math.cos(tt) * (radiusX + wobble), depth + Math.sin(tt * 3) * 0.05, Math.sin(tt) * (radiusZ + wobble));
      break;
    }
    case 'glide':
      // Large, slow, majestic loop with minimal vertical motion.
      out.set(Math.cos(tt) * radiusX, depth + Math.sin(tt * 1.2) * 0.03, Math.sin(tt) * radiusZ);
      break;
    default:
      // 'orbit': standard elliptical loop.
      out.set(Math.cos(tt) * radiusX, depth + Math.sin(tt * 3) * 0.05, Math.sin(tt) * radiusZ);
  }
  return out;
}

function SwimmingFish({ speciesId, path }: { speciesId: string; path: SwimPath }) {
  const species = FISH_BY_ID[speciesId];
  const groupRef = useRef<THREE.Group>(null);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    swimPosition(path, t, pos);
    groupRef.current.position.copy(pos);

    swimPosition(path, t + 0.05 * path.direction, lookTarget);
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
      const species = FISH_BY_ID[id];
      const pattern: SwimPattern = species?.swimPattern ?? 'orbit';
      const seed = i * 13.37;
      const baseRadiusX = 2 + ((seed * 7) % 30) / 10;
      const baseRadiusZ = 1.5 + ((seed * 11) % 30) / 10;
      const baseSpeed = 0.15 + ((seed * 3) % 10) / 40;

      let radiusX = baseRadiusX;
      let radiusZ = baseRadiusZ;
      let speed = baseSpeed;

      switch (pattern) {
        case 'hover':
          radiusX = 0.6 + ((seed * 7) % 12) / 10;
          radiusZ = 0.6 + ((seed * 11) % 12) / 10;
          speed = baseSpeed * 1.4;
          break;
        case 'dart':
          speed = baseSpeed * 2.2;
          break;
        case 'glide':
          radiusX = baseRadiusX * 1.3;
          radiusZ = baseRadiusZ * 1.3;
          speed = baseSpeed * 0.7;
          break;
        default:
          break;
      }

      map[id] = {
        radiusX,
        radiusZ,
        speed,
        phase: seed,
        depth: -0.15 - ((seed * 5) % 10) / 40,
        direction: i % 2 === 0 ? 1 : -1,
        pattern,
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
