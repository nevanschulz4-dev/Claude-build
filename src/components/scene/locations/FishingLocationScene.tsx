import Environment from '../Environment';
import Water from '../Water';
import FishingRig from '../FishingRig';
import type { BiomeDef } from '../../../data/types';

interface FishingLocationSceneProps {
  biome: BiomeDef;
}

/** A fishable outdoor location themed by its biome definition. */
export default function FishingLocationScene({ biome }: FishingLocationSceneProps) {
  const { water, ...theme } = biome;

  return (
    <>
      <Environment {...theme} />
      <Water radius={6} shallow={water.shallow} deep={water.deep} foam={water.foam} />
      <FishingRig />
    </>
  );
}
