import { makeBiome } from './makeBiome'

export const iceMoon = makeBiome({
  id: 'ice-moon',
  label: 'Ice Moon',
  prefix: 'im',
  azimuth: 255,
  lightHeight: 22,
  palette: {
    clear: { label: 'Ice Crust', color: '#c8d4dc', shortLabel: '' },
    woods: { label: 'Fracture Field', color: '#8a9aa4', shortLabel: 'F' },
    heavyWoods: { label: 'Rubble Ice', color: '#6a7a84', shortLabel: 'F2' },
    rough: { label: 'Serac', color: '#9aa4ac', shortLabel: 'R' },
    water: { label: 'Ocean Seep', color: '#4a6a78', shortLabel: 'Os' },
    road: { label: 'Survey Track', color: '#6a7074', shortLabel: 'Rd' },
    lava: { label: 'Cryolava', color: '#3a5868', shortLabel: 'Cv' },
  },
  generation: {
    defaults: { woods: 4, water: 8, rough: 30, elevation: 3 },
    forestPasses: 0,
    heavyWoodsBias: 0.04,
    elevationContrast: 1.35,
    road: 'none',
    river: false,
    coverTerrain: 'rough',
    iceSheets: true,
    groundIce: true,
    crevasses: 5,
    craters: 5,
    lavaFlows: 1,
  },
  elevation: {
    ramp: [
      'rgba(186, 202, 214, 0.32)',
      'rgba(210, 222, 230, 0.52)',
      'rgba(160, 176, 188, 0.66)',
      'rgba(244, 248, 252, 0.82)',
    ],
    rimShadow: 'rgba(4, 8, 14, 0.98)',
    rimLight: 'rgba(236, 244, 252, 0.95)',
    label: '#e8f0f6',
  },
  road: { band: '#4a5054', centerline: '#d0d8e0' },
})
