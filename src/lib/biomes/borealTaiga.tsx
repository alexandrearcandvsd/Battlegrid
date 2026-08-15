import { makeBiome } from './makeBiome'

export const borealTaiga = makeBiome({
  id: 'boreal-taiga',
  label: 'Boreal Taiga',
  prefix: 'ta',
  azimuth: 195,
  lightHeight: 34,
  palette: {
    clear: { label: 'Muskeg', color: '#8a8a68', shortLabel: '' },
    woods: { label: 'Spruce', color: '#3a4a38', shortLabel: 'W' },
    heavyWoods: { label: 'Black Spruce', color: '#243028', shortLabel: 'W2' },
    rough: { label: 'Erratic', color: '#6a6860', shortLabel: 'R' },
    water: { label: 'Bog Pond', color: '#4a6a68', shortLabel: 'D' },
    road: { label: 'Winter Road', color: '#5a5850', shortLabel: 'Rd' },
    lava: { label: 'Bog Iron', color: '#553224', shortLabel: 'Bi' },
  },
  generation: {
    defaults: { woods: 36, water: 12, rough: 18, elevation: 2 },
    forestPasses: 1,
    heavyWoodsBias: 0.22,
    elevationContrast: 0.95,
    road: 'auto',
    river: true,
    coverTerrain: 'woods',
    iceSheets: true,
  },
  elevation: {
    ramp: [
      'rgba(180, 188, 160, 0.28)',
      'rgba(200, 196, 168, 0.48)',
      'rgba(168, 160, 148, 0.62)',
      'rgba(236, 240, 236, 0.78)',
    ],
    rimShadow: 'rgba(10, 14, 12, 0.96)',
    rimLight: 'rgba(220, 228, 210, 0.9)',
    label: '#dce4d4',
  },
  road: { band: '#3a3c36', centerline: '#c4c0a0' },
  snowLine: { level: 2, color: 'rgba(244, 248, 250, 0.55)' },
})
