import { makeBiome } from './makeBiome'

export const mangroveEstuary = makeBiome({
  id: 'mangrove-estuary',
  label: 'Mangrove Estuary',
  prefix: 'mg',
  azimuth: 280,
  lightHeight: 44,
  palette: {
    clear: { label: 'Tidal Mud', color: '#6a5e48', shortLabel: '' },
    woods: { label: 'Mangrove', color: '#3a4a32', shortLabel: 'M' },
    heavyWoods: { label: 'Root Thicket', color: '#243428', shortLabel: 'M2' },
    rough: { label: 'Oyster Bank', color: '#6a6458', shortLabel: 'R' },
    water: { label: 'Brackish', color: '#3a5a58', shortLabel: 'Br' },
    road: { label: 'Boardwalk', color: '#5a5244', shortLabel: 'Rd' },
    lava: { label: 'Sulfidic Mud', color: '#505848', shortLabel: 'Sm' },
  },
  generation: {
    defaults: { woods: 30, water: 38, rough: 10, elevation: 1 },
    forestPasses: 1,
    heavyWoodsBias: 0.12,
    elevationContrast: 0.7,
    road: 'auto',
    channels: 4,
    river: false,
    coverTerrain: 'woods',
    mangroves: true,
  },
  elevation: {
    ramp: [
      'rgba(160, 148, 112, 0.26)',
      'rgba(140, 132, 96, 0.46)',
      'rgba(110, 100, 80, 0.6)',
      'rgba(220, 212, 180, 0.72)',
    ],
    rimShadow: 'rgba(12, 16, 14, 0.94)',
    rimLight: 'rgba(200, 210, 180, 0.86)',
    label: '#d4dcc8',
  },
  road: { band: '#3e3a32', centerline: '#c4b890' },
})
