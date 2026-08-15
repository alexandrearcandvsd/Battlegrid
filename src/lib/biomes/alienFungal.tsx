import { makeBiome } from './makeBiome'

export const alienFungal = makeBiome({
  id: 'alien-fungal',
  label: 'Alien Fungal',
  prefix: 'af',
  azimuth: 92,
  lightHeight: 28,
  palette: {
    clear: { label: 'Spore Flats', color: '#6a7a48', shortLabel: '' },
    woods: { label: 'Fungal Forest', color: '#3a5840', shortLabel: 'F' },
    heavyWoods: { label: 'Giant Caps', color: '#245038', shortLabel: 'F2' },
    rough: { label: 'Fibrous Mat', color: '#8a6a50', shortLabel: 'R' },
    water: { label: 'Organic Pool', color: '#3a6860', shortLabel: 'Op' },
    road: { label: 'Mycelial Track', color: '#5a5040', shortLabel: 'Rd' },
    lava: { label: 'Ichor', color: '#4a1038', shortLabel: 'Ic' },
  },
  generation: {
    defaults: { woods: 38, water: 16, rough: 10, elevation: 2 },
    forestPasses: 2,
    heavyWoodsBias: 0.16,
    elevationContrast: 0.95,
    road: 'auto',
    river: true,
    coverTerrain: 'woods',
    spores: true,
    canopyGaps: true,
  },
  elevation: {
    ramp: [
      'rgba(90, 130, 72, 0.34)',
      'rgba(58, 110, 80, 0.52)',
      'rgba(42, 88, 70, 0.66)',
      'rgba(180, 210, 120, 0.72)',
    ],
    rimShadow: 'rgba(12, 24, 16, 0.94)',
    rimLight: 'rgba(190, 230, 140, 0.82)',
    label: '#d8f0b8',
  },
  road: { band: '#3a3428', centerline: '#b8d070' },
})
