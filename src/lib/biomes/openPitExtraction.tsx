import { makeBiome } from './makeBiome'

export const openPitExtraction = makeBiome({
  id: 'open-pit-extraction',
  label: 'Open-Pit Extraction',
  prefix: 'px',
  azimuth: 230,
  lightHeight: 40,
  palette: {
    clear: { label: 'Bench', color: '#8a7a60', shortLabel: '' },
    woods: { label: 'Spoil Scrub', color: '#5a5a40', shortLabel: 'S' },
    heavyWoods: { label: 'Reclaim Grove', color: '#3e4230', shortLabel: 'S2' },
    rough: { label: 'Spoil Heap', color: '#6a5e50', shortLabel: 'R' },
    water: { label: 'Pit Lake', color: '#3a6a5a', shortLabel: 'Pl' },
    road: { label: 'Haul Road', color: '#4e4a42', shortLabel: 'Rd' },
    lava: { label: 'Acid Drainage', color: '#9a8820', shortLabel: 'Ad' },
  },
  generation: {
    defaults: { woods: 4, water: 10, rough: 30, elevation: 4 },
    forestPasses: 0,
    heavyWoodsBias: 0.05,
    elevationContrast: 1.25,
    road: 'auto',
    river: false,
    coverTerrain: 'rough',
    openPit: true,
  },
  elevation: {
    ramp: [
      'rgba(180, 160, 120, 0.3)',
      'rgba(160, 132, 92, 0.52)',
      'rgba(120, 96, 72, 0.66)',
      'rgba(232, 220, 188, 0.76)',
    ],
    rimShadow: 'rgba(16, 12, 8, 0.96)',
    rimLight: 'rgba(236, 220, 180, 0.9)',
    label: '#e8dcc0',
  },
  road: { band: '#3a3832', centerline: '#d0c490' },
})
