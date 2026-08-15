import { makeBiome } from './makeBiome'

export const glacialIcefield = makeBiome({
  id: 'glacial-icefield',
  label: 'Glacial Icefield',
  prefix: 'gi',
  azimuth: 205,
  lightHeight: 28,
  palette: {
    clear: { label: 'Blue Ice', color: '#c8d4dc', shortLabel: '' },
    woods: { label: 'Nunatak Scrub', color: '#6a7468', shortLabel: 'S' },
    heavyWoods: { label: 'Krummholz', color: '#4e5850', shortLabel: 'S2' },
    rough: { label: 'Moraine', color: '#8a8680', shortLabel: 'R' },
    water: { label: 'Meltwater', color: '#6a9ab0', shortLabel: 'Mw' },
    road: { label: 'Ice Track', color: '#9aa0a4', shortLabel: 'Rd' },
    lava: { label: 'Cryoconite', color: '#384048', shortLabel: 'Cc' },
  },
  generation: {
    defaults: { woods: 2, water: 10, rough: 28, elevation: 3 },
    forestPasses: 0,
    heavyWoodsBias: 0.04,
    elevationContrast: 1.2,
    road: 'none',
    river: false,
    coverTerrain: 'rough',
    iceSheets: true,
    groundIce: true,
    crevasses: 6,
  },
  elevation: {
    ramp: [
      'rgba(210, 222, 230, 0.32)',
      'rgba(228, 236, 242, 0.52)',
      'rgba(186, 198, 210, 0.66)',
      'rgba(248, 252, 255, 0.82)',
    ],
    rimShadow: 'rgba(8, 12, 18, 0.96)',
    rimLight: 'rgba(240, 248, 255, 0.95)',
    label: '#eef4f8',
  },
  road: { band: '#6a7074', centerline: '#e8eef2' },
})
