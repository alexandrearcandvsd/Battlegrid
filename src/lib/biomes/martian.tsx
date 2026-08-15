import { makeBiome } from './makeBiome'

export const martian = makeBiome({
  id: 'martian',
  label: 'Martian',
  prefix: 'ma',
  azimuth: 248,
  lightHeight: 20,
  palette: {
    clear: { label: 'Iron Dust', color: '#c46a3a', shortLabel: '' },
    woods: { label: 'Basalt Scrub', color: '#6a4430', shortLabel: 'S' },
    heavyWoods: { label: 'Lava Tube', color: '#4a2c24', shortLabel: 'S2' },
    rough: { label: 'Ridgeline', color: '#8a4828', shortLabel: 'R' },
    water: { label: 'Buried Ice', color: '#8aa4b4', shortLabel: 'I' },
    road: { label: 'Haul Track', color: '#5a4034', shortLabel: 'Rd' },
    lava: { label: 'Hematite', color: '#5c1810', shortLabel: 'Hm' },
  },
  generation: {
    defaults: { woods: 2, water: 6, rough: 34, elevation: 4 },
    forestPasses: 0,
    heavyWoodsBias: 0.03,
    elevationContrast: 1.45,
    road: 'auto',
    river: false,
    coverTerrain: 'rough',
    craters: 6,
    cliffs: true,
    scree: true,
    groundIce: true,
    dryWashes: true,
  },
  elevation: {
    ramp: [
      'rgba(196, 96, 52, 0.32)',
      'rgba(176, 72, 36, 0.54)',
      'rgba(148, 52, 28, 0.68)',
      'rgba(236, 176, 132, 0.8)',
    ],
    rimShadow: 'rgba(24, 8, 4, 0.96)',
    rimLight: 'rgba(255, 196, 140, 0.9)',
    label: '#f4d0b0',
  },
  road: { band: '#3a2820', centerline: '#d4a070' },
})
