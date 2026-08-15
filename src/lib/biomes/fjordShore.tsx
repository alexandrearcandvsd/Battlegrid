import { makeBiome } from './makeBiome'

export const fjordShore = makeBiome({
  id: 'fjord-shore',
  label: 'Fjord Shore',
  prefix: 'fj',
  azimuth: 160,
  lightHeight: 36,
  palette: {
    clear: { label: 'Shore Meadow', color: '#7a8a64', shortLabel: '' },
    woods: { label: 'Fjord Pine', color: '#3e5238', shortLabel: 'W' },
    heavyWoods: { label: 'Dark Spruce', color: '#2a3828', shortLabel: 'W2' },
    rough: { label: 'Talus', color: '#6a6864', shortLabel: 'R' },
    water: { label: 'Fjord', color: '#2a4a5a', shortLabel: 'Fj' },
    road: { label: 'Coast Track', color: '#5a564c', shortLabel: 'Rd' },
    lava: { label: 'Fjord Silt', color: '#4a5458', shortLabel: 'Fs' },
  },
  generation: {
    defaults: { woods: 22, water: 18, rough: 20, elevation: 4 },
    forestPasses: 1,
    heavyWoodsBias: 0.14,
    elevationContrast: 1.35,
    road: 'auto',
    river: false,
    coverTerrain: 'woods',
    fjords: true,
    cliffs: true,
    scree: true,
  },
  elevation: {
    ramp: [
      'rgba(168, 184, 156, 0.28)',
      'rgba(140, 148, 132, 0.5)',
      'rgba(100, 104, 96, 0.66)',
      'rgba(228, 232, 220, 0.78)',
    ],
    rimShadow: 'rgba(8, 12, 16, 0.96)',
    rimLight: 'rgba(220, 228, 210, 0.9)',
    label: '#e0e6d8',
  },
  road: { band: '#3a3c36', centerline: '#c8c4a4' },
})
