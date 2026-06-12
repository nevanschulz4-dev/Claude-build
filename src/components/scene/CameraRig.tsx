import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useCameraControls } from '../../store/cameraStore';
import { useFishingStore, type ResultState } from '../../store/fishingStore';

const SHAKE_DURATION = 0.5;
const SHAKE_STRENGTH = 0.15;

/** Drives the camera from the touch-control camera store (orbit + pan + zoom). */
export default function CameraRig() {
  const { camera } = useThree();
  const shake = useRef({ start: -Infinity });
  const lastResult = useRef<ResultState>(null);

  useFrame((state) => {
    const { target, azimuth, polar, distance } = useCameraControls.getState();
    const sinPolar = Math.sin(polar);

    // Trigger a quick camera shake when a legendary fish is landed.
    const { phase, result } = useFishingStore.getState();
    if (phase === 'result' && result !== lastResult.current) {
      lastResult.current = result;
      if (typeof result === 'object' && result?.species.rarity === 'legendary') {
        shake.current.start = state.clock.getElapsedTime();
      }
    }
    if (phase !== 'result') lastResult.current = null;

    let shakeX = 0;
    let shakeY = 0;
    const elapsed = state.clock.getElapsedTime() - shake.current.start;
    if (elapsed < SHAKE_DURATION) {
      const decay = 1 - elapsed / SHAKE_DURATION;
      shakeX = (Math.random() - 0.5) * SHAKE_STRENGTH * decay;
      shakeY = (Math.random() - 0.5) * SHAKE_STRENGTH * decay;
    }

    camera.position.set(
      target[0] + distance * sinPolar * Math.sin(azimuth) + shakeX,
      target[1] + distance * Math.cos(polar) + shakeY,
      target[2] + distance * sinPolar * Math.cos(azimuth),
    );
    camera.lookAt(target[0], target[1], target[2]);
  });

  return null;
}
