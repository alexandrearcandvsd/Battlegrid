import { describe, expect, it } from 'vitest'
import { getBiome } from './biomes'
import { generateMap } from './generator'
import { parseMap, serializeMap } from './serialization'
import type { BiomeId } from '../types/biome'
import type { GeneratorSettings } from '../types/map'

const SAMPLES: { biome: BiomeId; seed: string; urbanPreset?: string }[] = [
  { biome: 'temperate-grasslands', seed: 'SAMPLE-GRASS' },
  { biome: 'urban', seed: 'SAMPLE-BASE', urbanPreset: 'base' },
  { biome: 'alpine-mountains', seed: 'SAMPLE-ALPINE' },
  { biome: 'coastal', seed: 'SAMPLE-COAST' },
  { biome: 'lunar', seed: 'SAMPLE-LUNA' },
  { biome: 'martian', seed: 'SAMPLE-MARS' },
]

function settingsFor(entry: (typeof SAMPLES)[number]): GeneratorSettings {
  const defaults = getBiome(entry.biome).generation.defaults
  return {
    biome: entry.biome,
    width: 16,
    height: 17,
    seed: entry.seed,
    terrain: { woods: defaults.woods, water: defaults.water, rough: defaults.rough },
    elevation: defaults.elevation,
    symmetric: true,
    river: Boolean(getBiome(entry.biome).generation.river),
    urbanPreset: entry.urbanPreset,
  }
}

describe('sample maps', () => {
  it('generates a mapsheet for each core theater', () => {
    for (const entry of SAMPLES) {
      const map = generateMap(settingsFor(entry))
      expect(map.biome).toBe(entry.biome)
      expect(parseMap(serializeMap(map)).cells).toEqual(map.cells)
    }
  })
})
