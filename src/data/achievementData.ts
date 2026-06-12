import type { Rarity } from './types';

export interface AchievementContext {
  totalCatches: number;
  speciesDiscovered: number;
  totalEarned: number;
  rarityCatchCounts: Record<Rarity, number>;
  nightCatches: number;
  rainCatches: number;
  decorationsPlaced: number;
  fishableLocationsVisited: number;
  questsClaimed: number;
  rodsOwned: number;
  waterThemesOwned: number;
  heaviestCatch: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  target: number;
  progress: (ctx: AchievementContext) => number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-catch',
    name: 'First Catch',
    description: 'Catch your first fish',
    icon: '🎣',
    reward: 50,
    target: 1,
    progress: (ctx) => ctx.totalCatches,
  },
  {
    id: 'angler-10',
    name: 'Getting the Hang of It',
    description: 'Catch 10 fish',
    icon: '🐟',
    reward: 100,
    target: 10,
    progress: (ctx) => ctx.totalCatches,
  },
  {
    id: 'angler-50',
    name: 'Seasoned Angler',
    description: 'Catch 50 fish',
    icon: '🎏',
    reward: 300,
    target: 50,
    progress: (ctx) => ctx.totalCatches,
  },
  {
    id: 'angler-150',
    name: 'Master Angler',
    description: 'Catch 150 fish',
    icon: '🏆',
    reward: 800,
    target: 150,
    progress: (ctx) => ctx.totalCatches,
  },
  {
    id: 'collector-5',
    name: 'Curious Collector',
    description: 'Discover 5 fish species',
    icon: '📖',
    reward: 150,
    target: 5,
    progress: (ctx) => ctx.speciesDiscovered,
  },
  {
    id: 'collector-15',
    name: 'Avid Collector',
    description: 'Discover 15 fish species',
    icon: '📚',
    reward: 500,
    target: 15,
    progress: (ctx) => ctx.speciesDiscovered,
  },
  {
    id: 'collector-30',
    name: 'Complete Fishdex',
    description: 'Discover all 30 fish species',
    icon: '🌟',
    reward: 2000,
    target: 30,
    progress: (ctx) => ctx.speciesDiscovered,
  },
  {
    id: 'rare-catch',
    name: 'Something Special',
    description: 'Catch a rare fish (or better)',
    icon: '💎',
    reward: 200,
    target: 1,
    progress: (ctx) => ctx.rarityCatchCounts.rare + ctx.rarityCatchCounts.epic + ctx.rarityCatchCounts.legendary,
  },
  {
    id: 'epic-catch',
    name: 'Epic Encounter',
    description: 'Catch an epic fish (or better)',
    icon: '🔮',
    reward: 500,
    target: 1,
    progress: (ctx) => ctx.rarityCatchCounts.epic + ctx.rarityCatchCounts.legendary,
  },
  {
    id: 'legendary-catch',
    name: 'Legend of the Pond',
    description: 'Catch a legendary fish',
    icon: '👑',
    reward: 1500,
    target: 1,
    progress: (ctx) => ctx.rarityCatchCounts.legendary,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Catch a fish at night',
    icon: '🌙',
    reward: 150,
    target: 1,
    progress: (ctx) => ctx.nightCatches,
  },
  {
    id: 'storm-chaser',
    name: 'Storm Chaser',
    description: 'Catch a fish during rain',
    icon: '🌧️',
    reward: 150,
    target: 1,
    progress: (ctx) => ctx.rainCatches,
  },
  {
    id: 'wealthy',
    name: 'Wealthy Angler',
    description: 'Earn a total of $5,000',
    icon: '💰',
    reward: 250,
    target: 5000,
    progress: (ctx) => ctx.totalEarned,
  },
  {
    id: 'tycoon',
    name: 'Pond Tycoon',
    description: 'Earn a total of $25,000',
    icon: '💵',
    reward: 1000,
    target: 25000,
    progress: (ctx) => ctx.totalEarned,
  },
  {
    id: 'decorator',
    name: 'Pond Decorator',
    description: 'Place 5 decorations around your pond',
    icon: '🏞️',
    reward: 200,
    target: 5,
    progress: (ctx) => ctx.decorationsPlaced,
  },
  {
    id: 'world-traveler',
    name: 'World Traveler',
    description: 'Visit every fishing location',
    icon: '🗺️',
    reward: 300,
    target: 4,
    progress: (ctx) => ctx.fishableLocationsVisited,
  },
  {
    id: 'quest-master',
    name: 'Quest Master',
    description: 'Claim 10 daily quest rewards',
    icon: '📋',
    reward: 300,
    target: 10,
    progress: (ctx) => ctx.questsClaimed,
  },
  {
    id: 'master-decorator',
    name: 'Master Decorator',
    description: 'Place 15 decorations around your pond',
    icon: '🏡',
    reward: 600,
    target: 15,
    progress: (ctx) => ctx.decorationsPlaced,
  },
  {
    id: 'tackle-collector',
    name: 'Tackle Collector',
    description: 'Own every fishing rod upgrade',
    icon: '🪝',
    reward: 800,
    target: 5,
    progress: (ctx) => ctx.rodsOwned,
  },
  {
    id: 'water-connoisseur',
    name: 'Water Connoisseur',
    description: 'Unlock every water theme',
    icon: '🎨',
    reward: 500,
    target: 5,
    progress: (ctx) => ctx.waterThemesOwned,
  },
  {
    id: 'heavyweight',
    name: 'Heavyweight Catch',
    description: 'Reel in a fish weighing 5 kg or more',
    icon: '🏋️',
    reward: 350,
    target: 5,
    progress: (ctx) => Math.min(5, ctx.heaviestCatch),
  },
];
