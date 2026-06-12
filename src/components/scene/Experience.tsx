import { OrbitControls, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import HomeScene from './locations/HomeScene';
import FishingLocationScene from './locations/FishingLocationScene';
import { useLocationStore } from '../../store/locationStore';
import { BIOMES } from '../../data/locationData';

export default function Experience() {
  const currentLocationId = useLocationStore((s) => s.currentLocationId);

  return (
    <>
      {currentLocationId === 'home' ? (
        <HomeScene />
      ) : (
        <FishingLocationScene biome={BIOMES[currentLocationId]} />
      )}

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
