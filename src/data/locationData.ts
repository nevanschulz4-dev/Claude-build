import type { LocationDef, LocationId, BiomeDef } from './types';

export const LOCATIONS: LocationDef[] = [
  {
    id: 'home',
    name: 'Home Pond',
    icon: '🏠',
    fishable: false,
    description:
      "Your cozy home pond. Decorate it and watch your unlocked fish swim by — but they're too spoiled here to bite a hook.",
  },
  {
    id: 'river',
    name: 'Babbling River',
    icon: '🏞️',
    fishable: true,
    description: 'A bright, fast-flowing river through grassy hills. Great for common and uncommon catches.',
  },
  {
    id: 'lake',
    name: 'Misty Lake',
    icon: '🌲',
    fishable: true,
    description: 'A still forest lake wrapped in mist. Rarer fish lurk in its deep blue water.',
  },
  {
    id: 'ocean',
    name: 'Sunny Coast',
    icon: '🏖️',
    fishable: true,
    description: 'Warm sandy shores and a sparkling turquoise ocean. Home to some of the biggest fish around.',
  },
  {
    id: 'swamp',
    name: 'Murky Swamp',
    icon: '🌿',
    fishable: true,
    description: 'A shadowy, overgrown marsh. Strange and rare creatures hide beneath the murk.',
  },
];

export const LOCATION_BY_ID: Record<LocationId, LocationDef> = Object.fromEntries(
  LOCATIONS.map((l) => [l.id, l]),
) as Record<LocationId, LocationDef>;

/** Visual theme + water colors for each fishable location's outdoor scene */
export const BIOMES: Record<Exclude<LocationId, 'home'>, BiomeDef> = {
  river: {
    water: { shallow: '#8FE3D9', deep: '#1F7A8C', foam: '#EAFBFF' },
  },
  lake: {
    groundTint: '#cfe8d6',
    rimTint: '#dcead0',
    skyTurbidity: 12,
    skyRayleigh: 4,
    mieCoefficient: 0.01,
    ambientColor: '#e8f0ff',
    hemisphereSky: '#a9c9e8',
    hemisphereGround: '#5a8f6a',
    treeLeafColors: ['#2E5E3E', '#3A7050', '#264D34', '#46835A'],
    hillColors: ['#477A56', '#3C6B4C'],
    water: { shallow: '#6FA8C9', deep: '#1B3B5C', foam: '#E8F4FF' },
  },
  ocean: {
    groundTexture: 'sand',
    rimTexture: 'sand',
    skyTurbidity: 6,
    skyRayleigh: 1.5,
    mieCoefficient: 0.003,
    ambientColor: '#fff8e0',
    hemisphereSky: '#bdf0ff',
    hemisphereGround: '#f0e0a8',
    treeLeafColors: ['#8FCB5A', '#A8D86B', '#7DBF4F', '#C9E27A'],
    hillColors: ['#E8D7A8', '#D8C28A'],
    water: { shallow: '#5FE0E0', deep: '#0A4F7A', foam: '#FFFFFF' },
  },
  swamp: {
    groundTexture: 'mud',
    rimTexture: 'mud',
    skyTurbidity: 15,
    skyRayleigh: 5,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.85,
    sunPosition: [10, 8, 5],
    ambientColor: '#cfd6b8',
    hemisphereSky: '#8a9a7a',
    hemisphereGround: '#3a3020',
    treeLeafColors: ['#4A5D3A', '#5C6E45', '#3E4F30', '#6B7A4F'],
    hillColors: ['#5C6E45', '#4A5D3A'],
    water: { shallow: '#7A8C5C', deep: '#2E3B1F', foam: '#A8B98A' },
  },
};
