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

export type FishBodyShape =
  | 'classic' // rounded oval perch/bass
  | 'round' // chubby and short
  | 'long' // elongated cruiser
  | 'wide' // broad-bodied, laterally chunky
  | 'eel' // serpentine ribbon
  | 'triangle' // tall, angular angelfish/tang
  | 'flat' // low and wide flatfish/ray
  | 'puffer' // near-spherical balloon
  | 'torpedo'; // sleek, streamlined hunter

/** Distinct swim motion used to animate a species in the pond */
export type SwimPattern = 'orbit' | 'hover' | 'dart' | 'figure8' | 'serpentine' | 'glide';

/** Surface markings painted onto the body, independent of silhouette. */
export type FishPattern = 'stripes' | 'bands' | 'spots' | 'patches';

/** Shape of the caudal (tail) fin, which strongly changes a fish's read. */
export type FishFinStyle = 'fan' | 'forked' | 'flowy' | 'round' | 'lunate';

/** Extra decorative geometry that makes a species visually distinct */
export type FishFeature =
  | 'whiskers'
  | 'glass'
  | 'doubletail'
  | 'rings'
  | 'segments'
  | 'crystals'
  | 'wings'
  | 'blowhole'
  | 'antenna'
  | 'sail'
  | 'horn'
  | 'mane'
  | 'crown'
  | 'halo'
  | 'spikes';

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
  /** Movement pattern used while swimming in the pond */
  swimPattern: SwimPattern;
  /** Extra geometry that gives the species a unique silhouette */
  feature?: FishFeature;
  /** Surface markings painted across the body */
  pattern?: FishPattern;
  /** Shape of the tail fin. Falls back to a per-bodyShape default. */
  finStyle?: FishFinStyle;
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
  /** Haze color/distances that swallow the horizon, so distant water fades from view. */
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
}

export interface BiomeDef extends EnvironmentTheme {
  water: { shallow: string; deep: string; foam: string };
}
