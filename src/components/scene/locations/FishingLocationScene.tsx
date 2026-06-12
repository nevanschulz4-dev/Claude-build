import Environment from '../Environment';
import Water from '../Water';
import FishingRig from '../FishingRig';
import Bubbles from '../Bubbles';
import Dragonflies from '../Dragonflies';
import AmbientMinnows from '../AmbientMinnows';
import FloatingLeaves from '../FloatingLeaves';
import type { BiomeDef, LocationId } from '../../../data/types';

interface FishingLocationSceneProps {
  biome: BiomeDef;
  biomeId: Exclude<LocationId, 'home'>;
}

/** A fishable outdoor location themed by its biome definition. */
export default function FishingLocationScene({ biome, biomeId }: FishingLocationSceneProps) {
  const { water, ...theme } = biome;

  return (
    <>
      <Environment {...theme} biomeId={biomeId} />
      <Water
        radius={6}
        shallow={water.shallow}
        deep={water.deep}
        foam={water.foam}
        flowing={biomeId === 'river'}
        waveScale={biomeId === 'ocean' ? 1.6 : 1}
      />
      <Bubbles radius={6} />
      {biomeId !== 'ocean' && <Dragonflies />}
      <AmbientMinnows />
      {biomeId !== 'ocean' && <FloatingLeaves radius={6} />}
      <FishingRig />
    </>
  );
}
