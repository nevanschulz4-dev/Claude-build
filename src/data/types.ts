// Shared type definitions for the pond game

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9CA3AF',
  uncommon: '#4ADE80',
  rare: '#38BDF8',
  epic: '#C084FC',
  legendary: '#FACC15',
};

export const RARITY_GLOW: Record<Rarity, string> = {
  common: '#ffffff',
  uncommon: '#22ff88',
  rare: '#22aaff',
  epic: '#cc66ff',
  legendary: '#ffd700',
};

export type FishBodyShape = 'classic' | 'round' | 'long' | 'wide' | 'eel';

export interface FishSpecies {
  id: string;
  name: string;
  rarity: Rarity;
  baseValue: number;
  /** Relative scale of the model (1 = normal) */
  size: number;
  bodyShape: FishBodyShape;
  primaryColor: string;
  secondaryColor: string;
  finColor: string;
  glow?: boolean;
  /** Cost to unlock/stock this species in the shop. 0 = available from the start */
  unlockCost: number;
  description: string;
  /** Fishing locations where this species can be caught */
  habitats: LocationId[];
}

export type DecorationCategory = 'plant' | 'rock' | 'structure' | 'light' | 'path' | 'fun';

export interface DecorationDef {
  id: string;
  name: string;
  category: DecorationCategory;
  cost: number;
  /** Pond rating points contributed when placed */
  ratingValue: number;
  description: string;
  /** Footprint radius used for placement collision */
  footprint: number;
}

export interface PlacedDecoration {
  uid: string;
  defId: string;
  position: [number, number, number];
  rotationY: number;
}

export interface CaughtFish {
  uid: string;
  speciesId: string;
  weight: number; // kg, affects sale value
  value: number;
  caughtAt: number;
}

export interface RodUpgrade {
  id: string;
  name: string;
  cost: number;
  /** Multiplier applied to luck towards rarer fish */
  luckBonus: number;
  /** Reduces time-to-bite */
  speedBonus: number;
  /** Widens the reel success window */
  reelWindowBonus: number;
  description: string;
}

export type WaterTheme = {
  id: string;
  name: string;
  cost: number;
  shallow: string;
  deep: string;
  foam: string;
};

export type GamePhase = 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'result';

export type LocationId = 'home' | 'river' | 'lake' | 'ocean' | 'swamp';

export interface LocationDef {
  id: LocationId;
  name: string;
  icon: string;
  description: string;
  /** Whether you can cast a line here */
  fishable: boolean;
}

/** Visual theme overrides for an outdoor Environment scene */
export interface EnvironmentTheme {
  groundTexture?: 'grass' | 'sand' | 'mud';
  groundTint?: string;
  rimTexture?: 'grass' | 'sand' | 'mud';
  rimTint?: string;
  skyTurbidity?: number;
  skyRayleigh?: number;
  mieCoefficient?: number;
  mieDirectionalG?: number;
  sunPosition?: [number, number, number];
  ambientColor?: string;
  hemisphereSky?: string;
  hemisphereGround?: string;
  treeLeafColors?: string[];
  hillColors?: string[];
}

export interface BiomeDef extends EnvironmentTheme {
  water: { shallow: string; deep: string; foam: string };
}
