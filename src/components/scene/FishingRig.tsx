import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useFishingStore } from '../../store/fishingStore';
import { useToonGradient } from '../../utils/textures';
import { RARITY_GLOW } from '../../data/types';

const PLAYER_POS = new THREE.Vector3(0, -0.05, 7.1);
const ROD_TIP_REST = new THREE.Vector3(0.55, 1.85, 5.5);
const BOBBER_REST = new THREE.Vector3(0.3, 0.08, -1.8);
const BOBBER_HIDDEN = new THREE.Vector3(0.9, 0.35, 6.2);

export default function FishingRig() {
  const gradientMap = useToonGradient(4);
  const bobberRef = useRef<THREE.Group>(null);
  const lineGeoRef = useRef<THREE.BufferGeometry>(null);
  const rodGroupRef = useRef<THREE.Group>(null);
  const currentBobberPos = useRef(BOBBER_HIDDEN.clone());

  useFrame((state, delta) => {
    useFishingStore.getState().tick(delta);
    const { phase, castTimer, biteWindowTimer, biteWindowMax, reelMarker, reelProgress } = useFishingStore.getState();
    const t = state.clock.getElapsedTime();

    const target = currentBobberPos.current;
    switch (phase) {
      case 'idle':
        target.copy(BOBBER_HIDDEN);
        break;
      case 'casting': {
        const progress = 1 - castTimer / 0.6;
        target.lerpVectors(BOBBER_HIDDEN, BOBBER_REST, Math.min(1, progress));
        target.y += Math.sin(progress * Math.PI) * 0.6;
        break;
      }
      case 'waiting':
        target.copy(BOBBER_REST);
        target.y += Math.sin(t * 2) * 0.04;
        break;
      case 'bite': {
        target.copy(BOBBER_REST);
        const urgency = 1 - biteWindowTimer / biteWindowMax;
        target.y -= 0.15 + Math.sin(t * 18) * 0.08 * (0.4 + urgency);
        break;
      }
      case 'reeling':
        target.copy(BOBBER_REST);
        target.y += (reelMarker - 0.5) * 0.5 + Math.sin(t * 25) * 0.03;
        target.x += Math.sin(t * 30) * 0.05;
        break;
      case 'result':
        target.copy(BOBBER_REST);
        target.y += Math.sin(t * 2) * 0.04;
        break;
    }

    if (bobberRef.current) {
      bobberRef.current.position.lerp(target, phase === 'reeling' ? 0.4 : 0.15);
    }

    // Update fishing line geometry
    if (lineGeoRef.current && bobberRef.current) {
      const positions = new Float32Array([
        ROD_TIP_REST.x, ROD_TIP_REST.y, ROD_TIP_REST.z,
        bobberRef.current.position.x, bobberRef.current.position.y, bobberRef.current.position.z,
      ]);
      lineGeoRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }

    // Rod tip wobble during reeling
    if (rodGroupRef.current) {
      if (phase === 'reeling') {
        rodGroupRef.current.rotation.z = Math.sin(t * 20) * 0.06 - reelProgress * 0.05;
      } else if (phase === 'bite') {
        rodGroupRef.current.rotation.z = Math.sin(t * 16) * 0.08;
      } else {
        rodGroupRef.current.rotation.z = THREE.MathUtils.lerp(rodGroupRef.current.rotation.z, 0, 0.1);
      }
    }
  });

  const phase = useFishingStore((s) => s.phase);
  const result = useFishingStore((s) => s.result);
  const pendingFish = useFishingStore((s) => s.pendingFish);
  const showSplash = phase === 'bite' || phase === 'reeling';
  const showCelebration = phase === 'result' && result && typeof result === 'object';
  const glowColor = showCelebration && typeof result === 'object' ? RARITY_GLOW[result.species.rarity] : '#ffffff';
  const biteRarityColor = pendingFish ? RARITY_GLOW[pendingFish.species.rarity] : '#ffffff';

  return (
    <group>
      {/* Player character */}
      <group position={PLAYER_POS} rotation={[0, Math.PI, 0]}>
        {/* Boots */}
        <mesh position={[-0.15, 0.15, 0.02]} castShadow>
          <cylinderGeometry args={[0.13, 0.16, 0.3, 8]} />
          <meshToonMaterial color="#3E2C1E" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.15, 0.15, 0.02]} castShadow>
          <cylinderGeometry args={[0.13, 0.16, 0.3, 8]} />
          <meshToonMaterial color="#3E2C1E" gradientMap={gradientMap} />
        </mesh>

        {/* Waders */}
        <mesh position={[-0.15, 0.6, 0]} castShadow>
          <capsuleGeometry args={[0.155, 0.45, 4, 8]} />
          <meshToonMaterial color="#7A8B6F" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.15, 0.6, 0]} castShadow>
          <capsuleGeometry args={[0.155, 0.45, 4, 8]} />
          <meshToonMaterial color="#7A8B6F" gradientMap={gradientMap} />
        </mesh>

        {/* Torso (shirt) */}
        <mesh position={[0, 1.28, 0]} castShadow>
          <capsuleGeometry args={[0.32, 0.55, 4, 8]} />
          <meshToonMaterial color="#C9B896" gradientMap={gradientMap} />
        </mesh>

        {/* Fishing vest */}
        <mesh position={[0, 1.3, 0.05]} castShadow>
          <boxGeometry args={[0.58, 0.6, 0.46]} />
          <meshToonMaterial color="#52704C" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[-0.16, 1.16, 0.3]} castShadow>
          <boxGeometry args={[0.18, 0.14, 0.05]} />
          <meshToonMaterial color="#3C5638" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.16, 1.16, 0.3]} castShadow>
          <boxGeometry args={[0.18, 0.14, 0.05]} />
          <meshToonMaterial color="#3C5638" gradientMap={gradientMap} />
        </mesh>

        {/* Belt */}
        <mesh position={[0, 0.97, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.33, 0.035, 8, 16]} />
          <meshToonMaterial color="#5C4326" gradientMap={gradientMap} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 1.64, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.13, 0.1, 8]} />
          <meshToonMaterial color="#F0C29B" gradientMap={gradientMap} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.84, 0]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshToonMaterial color="#F0C29B" gradientMap={gradientMap} />
        </mesh>

        {/* Hat brim */}
        <mesh position={[0, 1.97, 0]} castShadow>
          <cylinderGeometry args={[0.44, 0.44, 0.04, 16]} />
          <meshToonMaterial color="#8A6A3D" gradientMap={gradientMap} />
        </mesh>
        {/* Hat band */}
        <mesh position={[0, 2.0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
          <meshToonMaterial color="#5C4326" gradientMap={gradientMap} />
        </mesh>
        {/* Hat crown */}
        <mesh position={[0, 2.1, 0]} castShadow>
          <cylinderGeometry args={[0.27, 0.3, 0.18, 16]} />
          <meshToonMaterial color="#8A6A3D" gradientMap={gradientMap} />
        </mesh>

        {/* Left arm (resting at side) */}
        <mesh position={[-0.34, 1.25, 0.05]} rotation={[0.15, 0, 0.1]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
          <meshToonMaterial color="#C9B896" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[-0.37, 0.78, 0.1]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshToonMaterial color="#F0C29B" gradientMap={gradientMap} />
        </mesh>

        {/* Right arm holding rod */}
        <mesh position={[0.35, 1.35, -0.15]} rotation={[0.6, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.1, 0.55, 4, 8]} />
          <meshToonMaterial color="#C9B896" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.46, 1.6, -0.35]} castShadow>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshToonMaterial color="#F0C29B" gradientMap={gradientMap} />
        </mesh>

        {/* Rod */}
        <group ref={rodGroupRef} position={[0.35, 1.55, -0.3]} rotation={[1.0, 0, 0.15]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.05, 2.4, 6]} />
            <meshToonMaterial color="#7A4A2B" gradientMap={gradientMap} />
          </mesh>
          {/* Reel */}
          <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
            <meshToonMaterial color="#3A3A3A" gradientMap={gradientMap} />
          </mesh>
        </group>
      </group>

      {/* Fishing line */}
      <line>
        <bufferGeometry ref={lineGeoRef} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </line>

      {/* Bobber */}
      <group ref={bobberRef} position={BOBBER_HIDDEN}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshToonMaterial color="#E0392B" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.02, 0]} castShadow>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshToonMaterial color="#F5F5F5" gradientMap={gradientMap} />
        </mesh>
      </group>

      {/* Splash / bite indicator */}
      {showSplash && (
        <Sparkles
          position={[BOBBER_REST.x, BOBBER_REST.y + 0.1, BOBBER_REST.z]}
          count={18}
          scale={[1.2, 0.6, 1.2]}
          size={3}
          speed={0.5}
          color={biteRarityColor}
        />
      )}

      {/* Celebration sparkle on successful catch */}
      {showCelebration && (
        <Sparkles
          position={[BOBBER_REST.x, BOBBER_REST.y + 0.4, BOBBER_REST.z]}
          count={40}
          scale={[2, 2, 2]}
          size={4}
          speed={0.8}
          color={glowColor}
        />
      )}
    </group>
  );
}
