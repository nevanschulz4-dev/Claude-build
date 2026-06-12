import { useEffect } from 'react';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import HomeScene from './locations/HomeScene';
import FishingLocationScene from './locations/FishingLocationScene';
import CameraRig from './CameraRig';
import { useLocationStore } from '../../store/locationStore';
import { useEnvironmentStore } from '../../store/environmentStore';
import { BIOMES } from '../../data/locationData';
import { startAmbient, stopAmbient } from '../../utils/audio';

export default function Experience() {
  const currentLocationId = useLocationStore((s) => s.currentLocationId);
  const weather = useEnvironmentStore((s) => s.weather);

  useEffect(() => {
    startAmbient(currentLocationId, weather);
    return () => stopAmbient();
  }, [currentLocationId, weather]);

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
