import Environment from '../Environment';
import Water from '../Water';
import { useGameStore } from '../../../store/gameStore';
import { WATER_THEMES } from '../../../data/decorData';
import DecorationsLayer from '../DecorationsLayer';
import PlacementController from '../PlacementController';
import PondFishLayer from '../PondFishLayer';
import Bubbles from '../Bubbles';

/** The player's home pond: decorative, non-fishable, shows unlocked fish swimming. */
export default function HomeScene() {
  const waterThemeId = useGameStore((s) => s.waterThemeId);
  const theme = WATER_THEMES.find((t) => t.id === waterThemeId) ?? WATER_THEMES[0];

  return (
    <>
      <Environment />
      <Water radius={6} shallow={theme.shallow} deep={theme.deep} foam={theme.foam} />
      <Bubbles radius={6} />
      <PondFishLayer />
      <DecorationsLayer />
      <PlacementController />
    </>
  );
}
