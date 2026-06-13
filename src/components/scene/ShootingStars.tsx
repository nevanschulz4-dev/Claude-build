import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COUNT = 3;
const STREAK_DURATION = 1.1;
const TRAIL_LENGTH = 5;
const TRAVEL_DISTANCE = 12;

interface StreakState {
  active: boolean;
  start: THREE.Vector3;
  dir: THREE.Vector3;
  startTime: number;
  nextTime: number;
}

/** A single streak that periodically races across the night sky, leaving a fading trail. */
function ShootingStar({ seed }: { seed: number }) {
  const headRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const trailMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);
  const state = useRef<StreakState>({
    active: false,
    start: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    startTime: 0,
    nextTime: 4 + seed * 7,
  });

  useFrame(({ clock }) => {
    if (!headRef.current || !glowRef.current || !trailRef.current || !trailMatRef.current || !glowMatRef.current) return;
    const t = clock.getElapsedTime();
    const s = state.current;

    if (!s.active && t > s.nextTime) {
      s.active = true;
      s.startTime = t;
      // Streaks appear in the visible sky band above the pond and drift downward across it.
      s.start.set(-7 + Math.random() * 4, 5.5 + Math.random() * 2, -7 + Math.random() * 2);
      s.dir.set(1, -0.15 - Math.random() * 0.2, -0.1 + Math.random() * 0.3).normalize();
    }

    if (!s.active) {
      headRef.current.visible = false;
      glowRef.current.visible = false;
      trailRef.current.visible = false;
      return;
    }

    const progress = (t - s.startTime) / STREAK_DURATION;
    if (progress >= 1) {
      s.active = false;
      s.nextTime = t + 8 + Math.random() * 18;
      headRef.current.visible = false;
      glowRef.current.visible = false;
      trailRef.current.visible = false;
      return;
    }

    tmpPos.copy(s.start).addScaledVector(s.dir, progress * TRAVEL_DISTANCE);
    const fade = progress < 0.75 ? 1 : 1 - (progress - 0.75) / 0.25;

    headRef.current.visible = true;
    headRef.current.position.copy(tmpPos);

    glowRef.current.visible = true;
    glowRef.current.position.copy(tmpPos);
    glowMatRef.current.opacity = fade * 0.35;

    trailRef.current.visible = true;
    tmpQuat.setFromUnitVectors(up, s.dir);
    trailRef.current.quaternion.copy(tmpQuat);
    trailRef.current.position.copy(tmpPos).addScaledVector(s.dir, -TRAIL_LENGTH / 2);
    trailMatRef.current.opacity = fade * 0.85;
  });

  return (
    <group>
      <mesh ref={headRef} visible={false}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#FFFDF2" />
      </mesh>
      <mesh ref={glowRef} visible={false}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshBasicMaterial ref={glowMatRef} color="#FFF3D6" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={trailRef} visible={false}>
        <cylinderGeometry args={[0.05, 0.004, TRAIL_LENGTH, 6]} />
        <meshBasicMaterial ref={trailMatRef} color="#FFF8E0" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

/** A handful of shooting stars that occasionally streak across the night sky. */
export default function ShootingStars() {
  return (
    <>
      {Array.from({ length: STAR_COUNT }, (_, i) => (
        <ShootingStar key={i} seed={i} />
      ))}
    </>
  );
}
