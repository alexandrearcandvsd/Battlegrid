import { describe, expect, it } from 'vitest'
import { getBiome } from './biomes'
import { TERRAIN_PRESETS, matchTerrainPreset } from './presets'

describe('terrain presets', () => {
  it('includes frozen, canyon country, jungle, and tidal terrain presets', () => {
    expect(TERRAIN_PRESETS.map((preset) => preset.id)).toEqual(
      expect.arrayContaining(['frozen', 'canyon-country', 'jungle', 'tidal']),
    )
  })

  it('includes dry-hills, island-sea, muskeg, and playa terrain presets', () => {
    expect(TERRAIN_PRESETS.map((preset) => preset.id)).toEqual(
      expect.arrayContaining([
        'dry-hills',
        'island-sea',
        'muskeg',
        'veldt',
        'mossy',
        'estuary',
        'playa',
        'spore-field',
        'crystal-waste',
      ]),
    )
  })

  it('matches the tidal preset weights', () => {
    const tidal = TERRAIN_PRESETS.find((preset) => preset.id === 'tidal')!
    expect(tidal.terrain).toEqual({ woods: 12, water: 32, rough: 16 })
    expect(matchTerrainPreset(tidal.terrain!, getBiome('coastal').generation.defaults)).toBe('tidal')
  })

  it('matches the island-sea preset weights', () => {
    const islands = TERRAIN_PRESETS.find((preset) => preset.id === 'island-sea')!
    expect(islands.terrain).toEqual({ woods: 8, water: 40, rough: 16 })
    expect(
      matchTerrainPreset(islands.terrain!, getBiome('oceanic-archipelago').generation.defaults),
    ).toBe('island-sea')
  })
})
