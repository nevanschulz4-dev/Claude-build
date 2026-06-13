import Environment from '../Environment';
import Water from '../Water';
import { useGameStore } from '../../../store/gameStore';
import { WATER_THEMES } from '../../../data/decorData';
import DecorationsLayer from '../DecorationsLayer';
import PlacementController from '../PlacementController';
import PondFishLayer from '../PondFishLayer';
import Bubbles from '../Bubbles';
import Dragonflies from '../Dragonflies';
import AmbientMinnows from '../AmbientMinnows';
import FloatingLeaves from '../FloatingLeaves';
import Fireflies from '../Fireflies';
import Turtle from '../Turtle';
import Ducks from '../Duck';
import Butterflies from '../Butterflies';
import FishJump from '../FishJump';
import RainRipples from '../RainRipples';
import { getPondRadius } from '../../../utils/pond';

/** The player's home pond: decorative, non-fishable, shows unlocked fish swimming. */
export default function HomeScene() {
  const waterThemeId = useGameStore((s) => s.waterThemeId);
  const pondRating = useGameStore((s) => s.pondRating());
  const theme = WATER_THEMES.find((t) => t.id === waterThemeId) ?? WATER_THEMES[0];
  const pondRadius = getPondRadius(pondRating);

  return (
    <>
      <Environment pondRadius={pondRadius} />
      <Water radius={pondRadius} shallow={theme.shallow} deep={theme.deep} foam={theme.foam} />
      <Bubbles radius={pondRadius} />
      <Dragonflies />
      <AmbientMinnows />
      <FloatingLeaves radius={pondRadius} />
      <Fireflies />
      <RainRipples pondRadius={pondRadius} />
      <Turtle pondRadius={pondRadius} />
      <Ducks pondRadius={pondRadius} />
      <Butterflies pondRadius={pondRadius} />
      <FishJump pondRadius={pondRadius} />
      <PondFishLayer pondRadius={pondRadius} />
      <DecorationsLayer />
      <PlacementController pondRadius={pondRadius} />
    </>
  );
}
