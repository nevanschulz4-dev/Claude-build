import { OrbitControls, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Environment from './Environment';
import Water from './Water';
import { useGameStore } from '../../store/gameStore';
import { WATER_THEMES } from '../../data/decorData';
import DecorationsLayer from './DecorationsLayer';
import PlacementController from './PlacementController';
import PondFishLayer from './PondFishLayer';
import FishingRig from './FishingRig';

export default function Experience() {
  const waterThemeId = useGameStore((s) => s.waterThemeId);
  const theme = WATER_THEMES.find((t) => t.id === waterThemeId) ?? WATER_THEMES[0];

  return (
    <>
      <Environment />
      <Water radius={6} shallow={theme.shallow} deep={theme.deep} foam={theme.foam} />
      <PondFishLayer />
      <DecorationsLayer />
      <PlacementController />
      <FishingRig />

      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={20} blur={2} far={4} />

      <OrbitControls
        makeDefault
        minDistance={6}
        maxDistance={26}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0.3}
        target={[0, 0.5, 0]}
        enablePan={false}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.25} intensity={0.6} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </>
  );
}
