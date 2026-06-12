import { useEffect, useRef, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { DECOR_BY_ID } from '../../data/decorData';
import DecorationModel from './Decorations/DecorationModel';

const PLAYER_POS = new THREE.Vector2(0, 7.1);
const PLAYER_EXCLUSION_RADIUS = 1.6;

const GROUND_RADIUS = 18;
const GROUND_MARGIN = 1.5; // keep placements a bit inside the grass edge

/** Max screen-space movement (px) between pointer down and up to still count as a tap/click. */
const TAP_MOVE_THRESHOLD = 8;

/** Decoration ids that are placeable on the water surface (near the pond edge). */
const WATER_DECOR_IDS = new Set(['lilypad']);

export default function PlacementController({ pondRadius = 6 }: { pondRadius?: number }) {
  const buildSelection = useUIStore((s) => s.buildSelection);
  const rotation = useUIStore((s) => s.buildRotation);
  const rotateBuildSelection = useUIStore((s) => s.rotateBuildSelection);
  const placeDecoration = useGameStore((s) => s.placeDecoration);
  const pushToast = useUIStore((s) => s.pushToast);

  const [cursor, setCursor] = useState<THREE.Vector3 | null>(null);
  const planeRef = useRef<THREE.Mesh>(null);
  const downRef = useRef<{ x: number; y: number; point: THREE.Vector3 } | null>(null);

  // 'R' key rotates the ghost preview by 45 degrees (keyboard users)
  useEffect(() => {
    if (!buildSelection) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        rotateBuildSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buildSelection, rotateBuildSelection]);

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
    if (dist < pondRadius + 0.2) return false;

    return true;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setCursor(e.point.clone());
  };

  // Record where the pointer went down; placement only happens on pointer up if it
  // didn't move much (a tap/click), so dragging to orbit the camera doesn't place items.
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setCursor(e.point.clone());
    downRef.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, point: e.point.clone() };
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const down = downRef.current;
    downRef.current = null;
    if (!down) return;

    const dx = e.nativeEvent.clientX - down.x;
    const dy = e.nativeEvent.clientY - down.y;
    if (Math.hypot(dx, dy) > TAP_MOVE_THRESHOLD) return;

    const point = down.point;
    const valid = computeValidity(point);
    if (!valid) return;

    // Decide placement height: on water surface for water decor, otherwise ground level.
    const y = allowWater && Math.hypot(point.x, point.z) < pondRadius ? 0.05 : 0;

    const success = placeDecoration(buildSelection, [point.x, y, point.z], rotation);
    if (success) {
      pushToast(`Placed ${def.name}!`, 'success');
    } else {
      pushToast('Not enough money!', 'warning');
    }
  };

  const valid = cursor ? computeValidity(cursor) : false;
  const ghostY = cursor && allowWater && Math.hypot(cursor.x, cursor.z) < pondRadius ? 0.05 : 0;

  return (
    <group>
      {/* Invisible ground plane covering the placement area, used for raycasting cursor position */}
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
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
