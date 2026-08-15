import { makeBiome } from './makeBiome'

export const alkaliSaltFlats = makeBiome({
  id: 'alkali-salt-flats',
  label: 'Alkali Salt Flats',
  prefix: 'sf',
  azimuth: 250,
  lightHeight: 56,
  palette: {
    clear: { label: 'Salt Crust', color: '#e8e4d4', shortLabel: '' },
    woods: { label: 'Saltbush', color: '#8a8a68', shortLabel: 'S' },
    heavyWoods: { label: 'Alkali Scrub', color: '#6a6a50', shortLabel: 'S2' },
    rough: { label: 'Pressure Ridge', color: '#c4bca4', shortLabel: 'R' },
    water: { label: 'Brine Pool', color: '#8ab0b4', shortLabel: 'Bp' },
    road: { label: 'Playa Track', color: '#b0a890', shortLabel: 'Tk' },
    lava: { label: 'Bittern', color: '#6a5a48', shortLabel: 'Bt' },
  },
  generation: {
    defaults: { woods: 2, water: 12, rough: 10, elevation: 2 },
    forestPasses: 0,
    heavyWoodsBias: 0.04,
    elevationContrast: 0.6,
    road: 'auto',
    river: false,
    coverTerrain: 'rough',
    playa: true,
  },
  elevation: {
    ramp: [
      'rgba(232, 228, 212, 0.3)',
      'rgba(220, 212, 188, 0.5)',
      'rgba(196, 184, 156, 0.64)',
      'rgba(252, 250, 242, 0.8)',
    ],
    rimShadow: 'rgba(40, 36, 28, 0.9)',
    rimLight: 'rgba(255, 252, 244, 0.95)',
    label: '#f6f2e4',
  },
  road: { band: '#8a8270', centerline: '#f0ead4' },
})
