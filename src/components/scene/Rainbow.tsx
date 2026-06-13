import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnvironmentStore, getDayFactor } from '../../store/environmentStore';

const BAND_COLORS = ['#FF5252', '#FF9E40', '#FFD740', '#69F0AE', '#40C4FF', '#B388FF'];
const BASE_RADIUS = 4.0;
const BAND_GAP = 0.16;
const FADE_IN = 2.5;
const HOLD = 12;
const FADE_OUT = 5;
const VISIBLE_DURATION = FADE_IN + HOLD + FADE_OUT;
const MAX_OPACITY = 0.6;

/** A rainbow arcs across the sky for a while after a sunny rain clears. */
export default function Rainbow() {
  const groupRef = useRef<THREE.Group>(null);
  const matRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const prevWeather = useRef<'clear' | 'rain'>('clear');
  const visibleUntil = useRef(-Infinity);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const { weather, timeOfDay } = useEnvironmentStore.getState();
    const dayFactor = getDayFactor(timeOfDay);

    if (prevWeather.current === 'rain' && weather === 'clear' && dayFactor > 0.15) {
      visibleUntil.current = t + VISIBLE_DURATION;
    }
    prevWeather.current = weather;

    const remaining = visibleUntil.current - t;
    let opacity = 0;
    if (remaining > 0) {
      const elapsed = VISIBLE_DURATION - remaining;
      if (elapsed < FADE_IN) opacity = elapsed / FADE_IN;
      else if (remaining < FADE_OUT) opacity = remaining / FADE_OUT;
      else opacity = 1;
    }

    matRefs.current.forEach((m) => {
      if (m) m.opacity = opacity * MAX_OPACITY;
    });
    if (groupRef.current) groupRef.current.visible = opacity > 0.001;
  });

  return (
    <group ref={groupRef} position={[0, 1, -6.5]} visible={false}>
      {BAND_COLORS.map((color, i) => (
        <mesh key={color}>
          <torusGeometry args={[BASE_RADIUS + i * BAND_GAP, 0.06, 8, 48, Math.PI]} />
          <meshBasicMaterial
            ref={(el) => {
              matRefs.current[i] = el;
            }}
            color={color}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
