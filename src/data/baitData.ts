export interface BaitDef {
  id: string;
  name: string;
  icon: string;
  cost: number;
  /** Added on top of the rod's luck bonus while this bait is active. */
  luckBonus: number;
  /** Added on top of the rod's speed bonus while this bait is active (can be negative). */
  speedBonus: number;
  description: string;
}

export const BAIT_TYPES: BaitDef[] = [
  {
    id: 'worm',
    name: 'Earthworm',
    icon: '🪱',
    cost: 5,
    luckBonus: 0.04,
    speedBonus: 0.05,
    description: 'A basic, reliable bait. A small boost to luck and bite speed.',
  },
  {
    id: 'shiny-lure',
    name: 'Shiny Lure',
    icon: '✨',
    cost: 25,
    luckBonus: 0.12,
    speedBonus: 0.1,
    description: 'A flashy spinner that draws in better fish faster.',
  },
  {
    id: 'stink-bait',
    name: 'Stink Bait',
    icon: '🧀',
    cost: 15,
    luckBonus: 0.18,
    speedBonus: -0.08,
    description: 'Smelly but irresistible. Big luck boost, slower bites.',
  },
  {
    id: 'golden-lure',
    name: 'Golden Lure',
    icon: '🌟',
    cost: 80,
    luckBonus: 0.3,
    speedBonus: 0.15,
    description: 'A premium lure favored by the rarest fish in the pond.',
  },
];

export const BAIT_BY_ID: Record<string, BaitDef> = Object.fromEntries(BAIT_TYPES.map((b) => [b.id, b]));
