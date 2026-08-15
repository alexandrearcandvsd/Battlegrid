import { makeBiome } from './makeBiome'

export const tropicalSavanna = makeBiome({
  id: 'tropical-savanna',
  label: 'Tropical Savanna',
  prefix: 'sv',
  azimuth: 240,
  lightHeight: 52,
  palette: {
    clear: { label: 'Veldt', color: '#c4a85a', shortLabel: '' },
    woods: { label: 'Acacia', color: '#6a7840', shortLabel: 'T' },
    heavyWoods: { label: 'Gallery Wood', color: '#3e5430', shortLabel: 'T2' },
    rough: { label: 'Termite Mound', color: '#8a6a40', shortLabel: 'R' },
    water: { label: 'Waterhole', color: '#4a7a70', shortLabel: 'Wh' },
    road: { label: 'Dirt Track', color: '#7a6a4a', shortLabel: 'Tk' },
    lava: { label: 'Laterite', color: '#b05e22', shortLabel: 'Lt' },
  },
  generation: {
    defaults: { woods: 14, water: 12, rough: 16, elevation: 2 },
    forestPasses: 2,
    heavyWoodsBias: 0.08,
    elevationContrast: 0.85,
    road: 'auto',
    river: false,
    coverTerrain: 'woods',
  },
  elevation: {
    ramp: [
      'rgba(220, 188, 96, 0.28)',
      'rgba(196, 156, 72, 0.48)',
      'rgba(168, 120, 56, 0.62)',
      'rgba(244, 228, 176, 0.74)',
    ],
    rimShadow: 'rgba(40, 24, 8, 0.94)',
    rimLight: 'rgba(255, 232, 160, 0.9)',
    label: '#f4e8c4',
  },
  road: { band: '#5a4a30', centerline: '#e4d090' },
})
