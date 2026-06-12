import { useRef } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useCameraControls } from '../../store/cameraStore';

const PAN_SPEED = 0.022;
const LOOK_SPEED = 0.006;
const PINCH_ZOOM_SPEED = 0.03;
const WHEEL_ZOOM_SPEED = 0.01;

type PointerMap = Map<number, { x: number; y: number }>;

function useZoneHandlers(mode: 'move' | 'look') {
  const pointers = useRef<PointerMap>(new Map());
  const pinchDist = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size !== 2) pinchDist.current = null;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist.current != null) {
        useCameraControls.getState().zoom(-(dist - pinchDist.current) * PINCH_ZOOM_SPEED);
      }
      pinchDist.current = dist;
      return;
    }

    const controls = useCameraControls.getState();
    if (mode === 'look') {
      controls.look(dx * LOOK_SPEED, -dy * LOOK_SPEED);
    } else {
      const sinAz = Math.sin(controls.azimuth);
      const cosAz = Math.cos(controls.azimuth);
      const forward = { x: -sinAz, z: -cosAz };
      const right = { x: cosAz, z: -sinAz };
      const scale = PAN_SPEED * (controls.distance / 14.5);
      controls.pan(
        (forward.x * -dy + right.x * dx) * scale,
        (forward.z * -dy + right.z * dx) * scale,
      );
    }
  };

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = null;
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    useCameraControls.getState().zoom(e.deltaY * WHEEL_ZOOM_SPEED);
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
    onPointerLeave: endPointer,
    onWheel,
  };
}

/**
 * Full-screen split touch controls: left half drags pan the view (move around),
 * right half drags orbit the camera (look around). Sits behind the UI overlay so
 * buttons and panels remain clickable. Hidden while actively placing/removing
 * decorations so build-mode taps reach the 3D scene.
 */
export default function TouchControls() {
  const moveHandlers = useZoneHandlers('move');
  const lookHandlers = useZoneHandlers('look');
  const buildSelection = useUIStore((s) => s.buildSelection);
  const buildRemoveMode = useUIStore((s) => s.buildRemoveMode);

  if (buildSelection || buildRemoveMode) return null;

  return (
    <>
      <div className="touch-zone touch-zone-move" {...moveHandlers}>
        <span className="touch-zone-label">🕹️ Move</span>
      </div>
      <div className="touch-zone touch-zone-look" {...lookHandlers}>
        <span className="touch-zone-label">👀 Look</span>
      </div>
    </>
  );
}
