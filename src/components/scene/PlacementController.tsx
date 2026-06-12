import { useEffect, useRef, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { DECOR_BY_ID } from '../../data/decorData';
import DecorationModel from './Decorations/DecorationModel';

const PLAYER_POS = new THREE.Vector2(0, 7.1);
const PLAYER_EXCLUSION_RADIUS = 1.6;

const POND_RADIUS = 6;
const GROUND_RADIUS = 18;
const GROUND_MARGIN = 1.5; // keep placements a bit inside the grass edge

/** Decoration ids that are placeable on the water surface (near the pond edge). */
const WATER_DECOR_IDS = new Set(['lilypad']);

export default function PlacementController() {
  const buildSelection = useUIStore((s) => s.buildSelection);
  const placeDecoration = useGameStore((s) => s.placeDecoration);
  const pushToast = useUIStore((s) => s.pushToast);

  const [cursor, setCursor] = useState<THREE.Vector3 | null>(null);
  const [rotation, setRotation] = useState(0);
  const planeRef = useRef<THREE.Mesh>(null);

  // Reset rotation when selection changes (adjust state during render, no effect needed)
  const [prevSelection, setPrevSelection] = useState(buildSelection);
  if (buildSelection !== prevSelection) {
    setPrevSelection(buildSelection);
    setRotation(0);
  }

  // 'R' key rotates the ghost preview by 45 degrees
  useEffect(() => {
    if (!buildSelection) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        setRotation((r) => r + Math.PI / 4);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buildSelection]);

  if (!buildSelection) return null;

  const def = DECOR_BY_ID[buildSelection];
  if (!def) return null;

  const allowWater = WATER_DECOR_IDS.has(buildSelection);

  const computeValidity = (point: THREE.Vector3): boolean => {
    const dist = Math.hypot(point.x, point.z);

    // Too close to the player rig
    if (Math.hypot(point.x - PLAYER_POS.x, point.z - PLAYER_POS.y) < PLAYER_EXCLUSION_RADIUS) {
      return false;
    }

    // Out of bounds (too far from origin)
    if (dist > GROUND_RADIUS - GROUND_MARGIN) return false;

    if (allowWater) {
      // Water decorations may sit anywhere from near-center to the grass,
      // but should stay reasonably close to the pond's edge.
      return dist < GROUND_RADIUS - GROUND_MARGIN;
    }

    // Ground decorations must be outside the pond.
    if (dist < POND_RADIUS + 0.2) return false;

    return true;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setCursor(e.point.clone());
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!cursor) return;
    const valid = computeValidity(cursor);
    if (!valid) return;

    // Decide placement height: on water surface for water decor, otherwise ground level.
    const y = allowWater && Math.hypot(cursor.x, cursor.z) < POND_RADIUS ? 0.05 : 0;

    const success = placeDecoration(buildSelection, [cursor.x, y, cursor.z], rotation);
    if (success) {
      pushToast(`Placed ${def.name}!`, 'success');
    } else {
      pushToast('Not enough money!', 'warning');
    }
  };

  const valid = cursor ? computeValidity(cursor) : false;
  const ghostY = cursor && allowWater && Math.hypot(cursor.x, cursor.z) < POND_RADIUS ? 0.05 : 0;

  return (
    <group>
      {/* Invisible ground plane covering the placement area, used for raycasting cursor position */}
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        visible={false}
      >
        <circleGeometry args={[GROUND_RADIUS, 64]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Ghost preview */}
      {cursor && (
        <DecorationModel
          defId={buildSelection}
          position={[cursor.x, ghostY, cursor.z]}
          rotationY={rotation}
          preview
          valid={valid}
        />
      )}
    </group>
  );
}
