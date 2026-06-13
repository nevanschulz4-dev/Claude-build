import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useToonGradient } from '../../utils/textures';

const JUMP_DURATION = 0.85;
const JUMP_HEIGHT = 0.9;
const SPLASH_LIFETIME = 0.6;
const WATER_LEVEL = 0.052;

interface JumpState {
  active: boolean;
  startTime: number;
  x: number;
  z: number;
  dx: number;
  dz: number;
  nextJump: number;
  splashUntil: number;
}

/** A fish that occasionally leaps out of the pond in an arc and splashes back down. */
export default function FishJump({ pondRadius = 6 }: { pondRadius?: number }) {
  const gradientMap = useToonGradient(4);
  const groupRef = useRef<THREE.Group>(null);
  const splashRef = useRef<THREE.Mesh>(null);
  const splashMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const stateRef = useRef<JumpState>({
    active: false,
    startTime: 0,
    x: 0,
    z: 0,
    dx: 0,
    dz: 0,
    nextJump: -1,
    splashUntil: -1,
  });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const group = groupRef.current;
    const splash = splashRef.current;
    const splashMat = splashMatRef.current;
    if (!group || !splash || !splashMat) return;

    const state = stateRef.current;

    if (state.nextJump < 0) {
      state.nextJump = t + 4 + Math.random() * 6;
    }

    if (!state.active && t > state.nextJump) {
      state.active = true;
      state.startTime = t;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * pondRadius * 0.6;
      state.x = Math.cos(angle) * dist;
      state.z = Math.sin(angle) * dist;
      const travelAngle = Math.random() * Math.PI * 2;
      state.dx = Math.cos(travelAngle) * 0.6;
      state.dz = Math.sin(travelAngle) * 0.6;
    }

    if (state.active) {
      const progress = (t - state.startTime) / JUMP_DURATION;
      if (progress >= 1) {
        state.active = false;
        state.nextJump = t + 6 + Math.random() * 10;
        state.splashUntil = t + SPLASH_LIFETIME;
        group.visible = false;
      } else {
        group.visible = true;
        const arc = Math.sin(progress * Math.PI);
        group.position.set(state.x + state.dx * progress, WATER_LEVEL + arc * JUMP_HEIGHT, state.z + state.dz * progress);
        // Pitches nose-up on the way up and nose-down on the way back into the water.
        group.rotation.x = -Math.cos(progress * Math.PI) * 0.9;
        group.rotation.y = Math.atan2(state.dx, state.dz);
      }
    } else {
      group.visible = false;
    }

    if (t < state.splashUntil) {
      const splashProgress = 1 - (state.splashUntil - t) / SPLASH_LIFETIME;
      splash.visible = true;
      splash.position.set(state.x + state.dx, WATER_LEVEL, state.z + state.dz);
      splash.scale.setScalar(0.1 + splashProgress * 0.6);
      splashMat.opacity = (1 - splashProgress) * 0.7;
    } else {
      splash.visible = false;
    }
  });

  return (
    <>
      <group ref={groupRef} visible={false} scale={0.5}>
        {/* Body */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
          <meshToonMaterial color="#FF8C42" gradientMap={gradientMap} />
        </mesh>
        {/* Tail fin */}
        <mesh position={[0, 0, -0.19]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <coneGeometry args={[0.09, 0.16, 6]} />
          <meshToonMaterial color="#FF8C42" gradientMap={gradientMap} />
        </mesh>
      </group>
      <mesh ref={splashRef} rotation={[-Math.PI / 2, 0, 0]} visible={false} renderOrder={2}>
        <ringGeometry args={[0.5, 0.65, 16]} />
        <meshBasicMaterial
          ref={splashMatRef}
          color="#ffffff"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </>
  );
}
