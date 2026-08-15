import { makeBiome } from './makeBiome'

export const crystalWorld = makeBiome({
  id: 'crystal-world',
  label: 'Crystal World',
  prefix: 'cw',
  azimuth: 310,
  lightHeight: 52,
  palette: {
    clear: { label: 'Glass Flats', color: '#c8d4e0', shortLabel: '' },
    woods: { label: 'Crystal Grove', color: '#7ab0c8', shortLabel: 'X' },
    heavyWoods: { label: 'Crystal Forest', color: '#3a88a8', shortLabel: 'X2' },
    rough: { label: 'Mineral Ridge', color: '#8a6aa0', shortLabel: 'R' },
    water: { label: 'Brine Prism', color: '#60a8c0', shortLabel: 'Bp' },
    road: { label: 'Facet Road', color: '#9aa0b0', shortLabel: 'Rd' },
    lava: { label: 'Prismatic Melt', color: '#7818a8', shortLabel: 'Px' },
  },
  generation: {
    defaults: { woods: 16, water: 8, rough: 30, elevation: 3 },
    forestPasses: 1,
    heavyWoodsBias: 0.1,
    elevationContrast: 1.35,
    road: 'none',
    river: false,
    coverTerrain: 'rough',
    crystals: true,
    cliffs: true,
    crevasses: 5,
  },
  elevation: {
    ramp: [
      'rgba(160, 190, 220, 0.36)',
      'rgba(120, 150, 210, 0.52)',
      'rgba(140, 90, 190, 0.64)',
      'rgba(230, 220, 255, 0.78)',
    ],
    rimShadow: 'rgba(20, 12, 40, 0.94)',
    rimLight: 'rgba(220, 236, 255, 0.92)',
    label: '#f0e8ff',
  },
  road: { band: '#5a6070', centerline: '#e8f0ff' },
})
