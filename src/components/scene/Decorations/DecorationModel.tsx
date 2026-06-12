import type { ReactElement } from 'react';
import * as THREE from 'three';
import { ReedModel, LilypadModel, BonsaiModel, FlowerbedModel } from './PlantModels';
import { RockSmallModel, RockArchModel, CrystalModel } from './RockModels';
import { BridgeModel, PagodaModel, FountainModel } from './StructureModels';
import { LanternModel, FireflyJarModel, TikiTorchModel, PathStoneModel } from './LightModels';
import { FlamingoModel, UmbrellaModel, GnomeModel } from './FunModels';

export interface DecorationModelComponentProps {
  position?: [number, number, number];
  rotationY?: number;
  preview?: boolean;
  /** When in preview mode: true = green "valid" tint, false = red "invalid" tint */
  valid?: boolean;
}

interface DecorationModelProps extends DecorationModelComponentProps {
  defId: string;
}

type ModelComponent = (props: { preview?: boolean; valid?: boolean }) => ReactElement;

const MODEL_BY_ID: Record<string, ModelComponent> = {
  reed: ReedModel,
  lilypad: LilypadModel,
  bonsai: BonsaiModel,
  flowerbed: FlowerbedModel,
  'rock-small': RockSmallModel,
  'rock-arch': RockArchModel,
  crystal: CrystalModel,
  bridge: BridgeModel,
  pagoda: PagodaModel,
  fountain: FountainModel,
  lantern: LanternModel,
  'firefly-jar': FireflyJarModel,
  'tiki-torch': TikiTorchModel,
  'path-stone': PathStoneModel,
  flamingo: FlamingoModel,
  umbrella: UmbrellaModel,
  gnome: GnomeModel,
};

/**
 * Dispatches to the correct procedural 3D model based on the decoration's defId.
 * Used both for placed decorations (DecorationsLayer) and the placement ghost
 * (PlacementController).
 */
export default function DecorationModel({
  defId,
  position = [0, 0, 0],
  rotationY = 0,
  preview = false,
  valid = true,
}: DecorationModelProps) {
  const Model = MODEL_BY_ID[defId];
  if (!Model) return null;

  return (
    <group position={new THREE.Vector3(...position)} rotation={[0, rotationY, 0]}>
      <Model preview={preview} valid={valid} />
    </group>
  );
}
