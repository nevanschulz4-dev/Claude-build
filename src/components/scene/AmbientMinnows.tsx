import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useToonGradient } from '../../utils/textures';

interface MinnowPath {
  radius: number;
  speed: number;
  phase: number;
  depthOffset: number;
}

const MINNOW_COUNT = 6;
const SCHOOL_CENTER = new THREE.Vector3(-1.6, -0.22, 1.4);

/** A single small background fish that loops within the school's cluster. */
function Minnow({ path, gradientMap }: { path: MinnowPath; gradientMap: THREE.Texture }) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const a = t * path.speed + path.phase;
    pos.set(
      SCHOOL_CENTER.x + Math.cos(a) * path.radius,
      SCHOOL_CENTER.y + path.depthOffset + Math.sin(a * 2.3) * 0.05,
      SCHOOL_CENTER.z + Math.sin(a) * path.radius * 0.7,
    );
    const a2 = a + 0.08;
    lookTarget.set(
      SCHOOL_CENTER.x + Math.cos(a2) * path.radius,
      SCHOOL_CENTER.y + path.depthOffset + Math.sin(a2 * 2.3) * 0.05,
      SCHOOL_CENTER.z + Math.sin(a2) * path.radius * 0.7,
    );
    if (groupRef.current) {
      groupRef.current.position.copy(pos);
      groupRef.current.lookAt(lookTarget);
    }
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 10 + path.phase) * 0.5;
    }
  });

  return (
    <group ref={groupRef} scale={0.16}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.4, 0.7, 4, 8]} />
        <meshToonMaterial color="#5A6B7A" gradientMap={gradientMap} />
      </mesh>
      <mesh ref={tailRef} position={[0, 0, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 0.45, 6]} />
        <meshToonMaterial color="#4A5A68" gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

/** A small school of background minnows that adds life to ponds with few unlocked fish. */
export default function AmbientMinnows() {
  const gradientMap = useToonGradient(4);

  const paths = useMemo<MinnowPath[]>(
    () =>
      Array.from({ length: MINNOW_COUNT }, (_, i) => ({
        radius: 0.45 + (i % 3) * 0.18,
        speed: 0.7 + (i % 4) * 0.18,
        phase: (i / MINNOW_COUNT) * Math.PI * 2,
        depthOffset: -0.05 - (i % 3) * 0.04,
      })),
    [],
  );

  return (
    <group>
      {paths.map((path, i) => (
        <Minnow key={i} path={path} gradientMap={gradientMap} />
      ))}
    </group>
  );
}
