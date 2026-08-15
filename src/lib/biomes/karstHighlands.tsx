import { makeBiome } from './makeBiome'

export const karstHighlands = makeBiome({
  id: 'karst-highlands',
  label: 'Karst Highlands',
  prefix: 'kh',
  azimuth: 225,
  lightHeight: 40,
  palette: {
    clear: { label: 'Limestone Pavement', color: '#c4bca8', shortLabel: '' },
    woods: { label: 'Doline Scrub', color: '#6a784c', shortLabel: 'S' },
    heavyWoods: { label: 'Sinkhole Grove', color: '#4a5838', shortLabel: 'S2' },
    rough: { label: 'Clint', color: '#8a8274', shortLabel: 'R' },
    water: { label: 'Disappearing Stream', color: '#5a7a78', shortLabel: 'D' },
    road: { label: 'Karst Track', color: '#7a7264', shortLabel: 'Rd' },
    lava: { label: 'Terra Fusca', color: '#624830', shortLabel: 'Tf' },
  },
  generation: {
    defaults: { woods: 12, water: 10, rough: 32, elevation: 4 },
    forestPasses: 0,
    heavyWoodsBias: 0.08,
    elevationContrast: 1.3,
    road: 'auto',
    river: true,
    coverTerrain: 'rough',
    craters: 5,
    dryWashes: true,
    cliffs: true,
  },
  elevation: {
    ramp: [
      'rgba(212, 204, 180, 0.28)',
      'rgba(196, 184, 156, 0.5)',
      'rgba(160, 148, 124, 0.64)',
      'rgba(240, 236, 220, 0.76)',
    ],
    rimShadow: 'rgba(24, 20, 16, 0.96)',
    rimLight: 'rgba(244, 240, 220, 0.92)',
    label: '#f0ead8',
  },
  road: { band: '#4a463c', centerline: '#d8d0b0' },
})
