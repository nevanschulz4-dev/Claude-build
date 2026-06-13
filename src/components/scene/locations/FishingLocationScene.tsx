import Environment from '../Environment';
import Water from '../Water';
import FishingRig from '../FishingRig';
import Bubbles from '../Bubbles';
import Dragonflies from '../Dragonflies';
import AmbientMinnows from '../AmbientMinnows';
import FloatingLeaves from '../FloatingLeaves';
import Jellyfish from '../Jellyfish';
import Fireflies from '../Fireflies';
import RainRipples from '../RainRipples';
import type { BiomeDef, LocationId } from '../../../data/types';

interface FishingLocationSceneProps {
  biome: BiomeDef;
  biomeId: Exclude<LocationId, 'home'>;
}

/** A fishable outdoor location themed by its biome definition. */
export default function FishingLocationScene({ biome, biomeId }: FishingLocationSceneProps) {
  const { water, ...theme } = biome;

  // The river runs off toward the horizon, so its backdrop water is stretched into a channel
  // rather than spreading out evenly like a lake or open sea.
  const horizonScale: [number, number, number] = biomeId === 'river' ? [1.6, 1, 0.85] : [1, 1, 1];

  return (
    <>
      <Environment {...theme} biomeId={biomeId} />
      {/* Vast body of water stretching past the shore into the haze */}
      <group scale={horizonScale}>
        <Water
          radius={48}
          innerRadius={15}
          y={-0.1}
          shallow={water.shallow}
          deep={water.deep}
          foam={water.foam}
          flowing={biomeId === 'river'}
          waveScale={biomeId === 'ocean' ? 1.3 : 0.6}
        />
      </group>
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
      {biomeId === 'ocean' && <Jellyfish />}
      <Fireflies />
      <RainRipples pondRadius={6} />
      <FishingRig />
    </>
  );
}
