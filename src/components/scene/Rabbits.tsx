import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useToonGradient } from '../../utils/textures';

interface RabbitSpot {
  angle: number;
  offset: number;
  furColor: string;
}

/** Where each rabbit likes to hang out, expressed as an angle + distance past the pond's edge so it stays on the grass at any pond size. */
const RABBIT_SPOTS: RabbitSpot[] = [
  { angle: -0.5, offset: 2.0, furColor: '#E8DCC8' },
  { angle: -2.4, offset: 2.6, furColor: '#B8946A' },
];

const HOP_DURATION = 0.4;
const HOP_HEIGHT = 0.18;

interface HopState {
  fromOffsetX: number;
  fromOffsetZ: number;
  toOffsetX: number;
  toOffsetZ: number;
  hopStart: number;
  nextHop: number;
  hopping: boolean;
}

/** A small rabbit that idles near its spot and occasionally hops to a nearby point. */
function Rabbit({ angle, offset, furColor, pondRadius, gradientMap }: RabbitSpot & { pondRadius: number; gradientMap: THREE.Texture }) {
  const groupRef = useRef<THREE.Group>(null);
  const earLRef = useRef<THREE.Mesh>(null);
  const earRRef = useRef<THREE.Mesh>(null);

  const stateRef = useRef<HopState>({
    fromOffsetX: 0,
    fromOffsetZ: 0,
    toOffsetX: 0,
    toOffsetZ: 0,
    hopStart: 0,
    nextHop: -1,
    hopping: false,
  });

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.getElapsedTime();
    const state = stateRef.current;

    if (state.nextHop < 0) {
      state.nextHop = t + 1 + Math.random() * 2;
    }

    if (!state.hopping && t > state.nextHop) {
      state.hopping = true;
      state.hopStart = t;
      state.fromOffsetX = state.toOffsetX;
      state.fromOffsetZ = state.toOffsetZ;
      const a = Math.random() * Math.PI * 2;
      const dist = 0.3 + Math.random() * 0.5;
      state.toOffsetX = Math.cos(a) * dist;
      state.toOffsetZ = Math.sin(a) * dist;
    }

    const d = pondRadius + offset;
    const homeX = Math.cos(angle) * d;
    const homeZ = Math.sin(angle) * d;

    let offX = state.toOffsetX;
    let offZ = state.toOffsetZ;
    let hopY = 0;
    let rotX = 0;
    let rotY = group.rotation.y;

    if (state.hopping) {
      const progress = (t - state.hopStart) / HOP_DURATION;
      if (progress >= 1) {
        state.hopping = false;
        state.nextHop = t + 1.5 + Math.random() * 2.5;
        offX = state.toOffsetX;
        offZ = state.toOffsetZ;
      } else {
        const arc = Math.sin(progress * Math.PI);
        offX = state.fromOffsetX + (state.toOffsetX - state.fromOffsetX) * progress;
        offZ = state.fromOffsetZ + (state.toOffsetZ - state.fromOffsetZ) * progress;
        hopY = arc * HOP_HEIGHT;
        rotX = -arc * 0.3;
        rotY = Math.atan2(state.toOffsetX - state.fromOffsetX, state.toOffsetZ - state.fromOffsetZ);
      }
    }

    group.position.set(homeX + offX, hopY, homeZ + offZ);
    group.rotation.x = rotX;
    group.rotation.y = rotY;

    // Ears twitch idly
    const twitch = Math.sin(t * 6 + angle) * 0.1;
    if (earLRef.current) earLRef.current.rotation.z = 0.15 + twitch;
    if (earRRef.current) earRRef.current.rotation.z = -0.15 - twitch;
  });

  return (
    <group ref={groupRef} scale={0.35}>
      {/* Body */}
      <mesh position={[0, 0.18, 0]} scale={[0.9, 0.85, 1.2]} castShadow>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshToonMaterial color={furColor} gradientMap={gradientMap} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.32, 0.22]} castShadow>
        <sphereGeometry args={[0.15, 12, 10]} />
        <meshToonMaterial color={furColor} gradientMap={gradientMap} />
      </mesh>
      {/* Ears */}
      <mesh ref={earLRef} position={[-0.07, 0.48, 0.2]} rotation={[0, 0, 0.15]} castShadow>
        <capsuleGeometry args={[0.035, 0.18, 4, 6]} />
        <meshToonMaterial color={furColor} gradientMap={gradientMap} />
      </mesh>
      <mesh ref={earRRef} position={[0.07, 0.48, 0.2]} rotation={[0, 0, -0.15]} castShadow>
        <capsuleGeometry args={[0.035, 0.18, 4, 6]} />
        <meshToonMaterial color={furColor} gradientMap={gradientMap} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.2, -0.32]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial color="#F5F0E0" gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

/** A couple of rabbits hopping idly around the grass just past the pond's edge. */
export default function Rabbits({ pondRadius = 6 }: { pondRadius?: number }) {
  const gradientMap = useToonGradient(4);

  return (
    <>
      {RABBIT_SPOTS.map((spot, i) => (
        <Rabbit key={i} {...spot} pondRadius={pondRadius} gradientMap={gradientMap} />
      ))}
    </>
  );
}
