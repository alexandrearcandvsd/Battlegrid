import { makeBiome } from './makeBiome'

export const temperateRainforest = makeBiome({
  id: 'temperate-rainforest',
  label: 'Temperate Rainforest',
  prefix: 'rf',
  azimuth: 170,
  lightHeight: 38,
  palette: {
    clear: { label: 'Fern Floor', color: '#5a6a44', shortLabel: '' },
    woods: { label: 'Cedar', color: '#3a4e34', shortLabel: 'W' },
    heavyWoods: { label: 'Moss Canopy', color: '#243428', shortLabel: 'W2' },
    rough: { label: 'Nurse Log', color: '#5a4e3a', shortLabel: 'R' },
    water: { label: 'Cascade', color: '#3a6a68', shortLabel: 'D' },
    road: { label: 'Corduroy', color: '#4a4638', shortLabel: 'Rd' },
    lava: { label: 'Nurse Rot', color: '#24342a', shortLabel: 'Nr' },
  },
  generation: {
    defaults: { woods: 40, water: 20, rough: 14, elevation: 3 },
    forestPasses: 2,
    heavyWoodsBias: 0.26,
    elevationContrast: 1.15,
    road: 'auto',
    river: true,
    coverTerrain: 'woods',
    canopyGaps: true,
  },
  elevation: {
    ramp: [
      'rgba(140, 168, 120, 0.28)',
      'rgba(120, 140, 96, 0.5)',
      'rgba(88, 96, 72, 0.64)',
      'rgba(220, 228, 200, 0.74)',
    ],
    rimShadow: 'rgba(6, 12, 8, 0.96)',
    rimLight: 'rgba(180, 210, 160, 0.88)',
    label: '#c8dcc0',
  },
  road: { band: '#2e3228', centerline: '#a8b080' },
})
