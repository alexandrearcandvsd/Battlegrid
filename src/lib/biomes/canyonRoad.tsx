import { makeBiome } from './makeBiome'

export const canyonRoad = makeBiome({
  id: 'canyon-road',
  label: 'Canyon Road',
  prefix: 'cn',
  azimuth: 245,
  lightHeight: 32,
  palette: {
    clear: { label: 'Canyon Floor', color: '#c4a06a', shortLabel: '' },
    woods: { label: 'Rim Scrub', color: '#6a6840', shortLabel: 'S' },
    heavyWoods: { label: 'Rim Thicket', color: '#4a4a30', shortLabel: 'S2' },
    rough: { label: 'Canyon Wall', color: '#8a5a38', shortLabel: 'R' },
    water: { label: 'Seep', color: '#6a7a68', shortLabel: 'Sp' },
    road: { label: 'Canyon Road', color: '#5a4e42', shortLabel: 'Rd' },
    lava: { label: 'Desert Varnish', color: '#3e2410', shortLabel: 'Dv' },
  },
  generation: {
    defaults: { woods: 6, water: 4, rough: 28, elevation: 4 },
    forestPasses: 0,
    heavyWoodsBias: 0.05,
    elevationContrast: 1.2,
    road: 'none',
    river: false,
    coverTerrain: 'rough',
    canyonRoad: true,
    cliffs: true,
    scree: true,
  },
  elevation: {
    ramp: [
      'rgba(216, 168, 104, 0.3)',
      'rgba(196, 124, 64, 0.52)',
      'rgba(156, 84, 44, 0.66)',
      'rgba(244, 220, 176, 0.78)',
    ],
    rimShadow: 'rgba(24, 12, 8, 0.96)',
    rimLight: 'rgba(255, 220, 160, 0.9)',
    label: '#f4e4c4',
  },
  road: { band: '#3a3228', centerline: '#d4c090' },
})
