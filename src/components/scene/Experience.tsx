import { ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import HomeScene from './locations/HomeScene';
import FishingLocationScene from './locations/FishingLocationScene';
import CameraRig from './CameraRig';
import { useLocationStore } from '../../store/locationStore';
import { BIOMES } from '../../data/locationData';

export default function Experience() {
  const currentLocationId = useLocationStore((s) => s.currentLocationId);

  return (
    <>
      {currentLocationId === 'home' ? (
        <HomeScene />
      ) : (
        <FishingLocationScene biome={BIOMES[currentLocationId]} biomeId={currentLocationId} />
      )}

      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={20} blur={2} far={4} />

      <CameraRig />

      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.25} intensity={0.6} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </>
  );
}
