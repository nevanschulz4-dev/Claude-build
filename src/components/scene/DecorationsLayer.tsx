import { useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { DECOR_BY_ID } from '../../data/decorData';
import DecorationModel from './Decorations/DecorationModel';

function PlacedDecorationItem({
  uid,
  defId,
  position,
  rotationY,
}: {
  uid: string;
  defId: string;
  position: [number, number, number];
  rotationY: number;
}) {
  const buildRemoveMode = useUIStore((s) => s.buildRemoveMode);
  const removeDecoration = useGameStore((s) => s.removeDecoration);
  const pushToast = useUIStore((s) => s.pushToast);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!buildRemoveMode) return;
    e.stopPropagation();
    const def = DECOR_BY_ID[defId];
    removeDecoration(uid);
    pushToast(`Removed ${def?.name ?? 'decoration'}`, 'info');
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (!buildRemoveMode) return;
    e.stopPropagation();
    setHovered(true);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    if (!buildRemoveMode) return;
    e.stopPropagation();
    setHovered(false);
  };

  const scale = buildRemoveMode && hovered ? 1.12 : 1;

  return (
    <group
      scale={scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <DecorationModel
        defId={defId}
        position={position}
        rotationY={rotationY}
        preview={buildRemoveMode && hovered}
        valid={false}
      />
    </group>
  );
}

export default function DecorationsLayer() {
  const placedDecorations = useGameStore((s) => s.placedDecorations);

  return (
    <group>
      {placedDecorations.map((d) => (
        <PlacedDecorationItem
          key={d.uid}
          uid={d.uid}
          defId={d.defId}
          position={d.position}
          rotationY={d.rotationY}
        />
      ))}
    </group>
  );
}
