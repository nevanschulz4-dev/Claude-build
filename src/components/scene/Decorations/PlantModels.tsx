import { useMemo } from 'react';
import { useDecorMaterials, type DecorationModelProps } from './shared';

/** Cluster of tall thin reeds swaying gently. */
export function ReedModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  const reeds = useMemo(() => {
    const items: { x: number; z: number; h: number; color: string; tilt: number }[] = [];
    const colors = ['#3FA34D', '#52B768', '#2E8B4E'];
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const r = 0.08 + (i % 3) * 0.06;
      items.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        h: 0.6 + ((i * 17) % 5) * 0.08,
        color: colors[i % colors.length],
        tilt: ((i * 31) % 10) / 100 - 0.05,
      });
    }
    return items;
  }, []);

  return (
    <group>
      {reeds.map((r, i) => (
        <mesh
          key={i}
          position={[r.x, r.h / 2, r.z]}
          rotation={[r.tilt, 0, r.tilt]}
          material={mat(r.color)}
          castShadow
        >
          <coneGeometry args={[0.04, r.h, 6]} />
        </mesh>
      ))}
    </group>
  );
}

/** Floating lily pads with a small flower, sits flush on the water surface. */
export function LilypadModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  const pads = useMemo(
    () => [
      { x: 0, z: 0, r: 0.32, y: 0 },
      { x: 0.35, z: 0.18, r: 0.2, y: -0.005 },
      { x: -0.28, z: 0.22, r: 0.16, y: -0.003 },
    ],
    [],
  );

  return (
    <group>
      {pads.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} material={mat('#3FA34D')} receiveShadow>
          <cylinderGeometry args={[p.r, p.r, 0.03, 14]} />
        </mesh>
      ))}
      {/* Flower */}
      <mesh position={[0, 0.04, 0]} material={mat('#FF6FA8')}>
        <sphereGeometry args={[0.08, 8, 6]} />
      </mesh>
      <mesh position={[0, 0.05, 0]} material={mat('#FFD166')}>
        <sphereGeometry args={[0.04, 8, 6]} />
      </mesh>
    </group>
  );
}

/** Small bonsai tree: twisted trunk + toon foliage blobs. */
export function BonsaiModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  return (
    <group>
      {/* Pot */}
      <mesh position={[0, 0.08, 0]} material={mat('#9C5B3C')} castShadow>
        <cylinderGeometry args={[0.32, 0.26, 0.16, 10]} />
      </mesh>
      {/* Trunk - twisted via two segments */}
      <mesh position={[0, 0.32, 0]} rotation={[0, 0, 0.18]} material={mat('#7A4A2B')} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.32, 6]} />
      </mesh>
      <mesh position={[0.06, 0.55, 0]} rotation={[0, 0, -0.25]} material={mat('#8B5E34')} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 0.3, 6]} />
      </mesh>
      {/* Foliage blobs */}
      <mesh position={[0.1, 0.78, 0]} material={mat('#52B768')} castShadow>
        <sphereGeometry args={[0.26, 10, 8]} />
      </mesh>
      <mesh position={[-0.16, 0.7, 0.08]} material={mat('#3FA34D')} castShadow>
        <sphereGeometry args={[0.2, 10, 8]} />
      </mesh>
      <mesh position={[0.2, 0.62, -0.12]} material={mat('#6BC36F')} castShadow>
        <sphereGeometry args={[0.16, 10, 8]} />
      </mesh>
    </group>
  );
}

/** Low flower bed: box of soil with bright flowers. */
export function FlowerbedModel({ preview = false, valid = true }: DecorationModelProps) {
  const { mat } = useDecorMaterials(preview, valid);

  const flowers = useMemo(() => {
    const colors = ['#FF6FA8', '#FFD166', '#7B61FF', '#FF8A3D', '#5BD1FF'];
    const items: { x: number; z: number; color: string }[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.3;
      const r = 0.22 + (i % 2) * 0.08;
      items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, color: colors[i % colors.length] });
    }
    return items;
  }, []);

  return (
    <group>
      {/* Soil bed */}
      <mesh position={[0, 0.05, 0]} material={mat('#6B4A2B')} receiveShadow castShadow>
        <cylinderGeometry args={[0.42, 0.46, 0.1, 16]} />
      </mesh>
      {/* Flowers */}
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, 0.12, f.z]}>
          <mesh material={mat('#3FA34D')} castShadow>
            <cylinderGeometry args={[0.015, 0.02, 0.14, 5]} />
          </mesh>
          <mesh position={[0, 0.1, 0]} material={mat(f.color)} castShadow>
            <coneGeometry args={[0.07, 0.12, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
