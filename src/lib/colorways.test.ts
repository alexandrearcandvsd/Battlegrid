import { describe, expect, it } from 'vitest'
import { getBiome } from './biomes'
import { applyColorway } from './colorways'
import { generateMap } from './generator'

describe('regional colorways', () => {
  it('leaves the default palette unchanged', () => {
    const biome = getBiome('temperate-grasslands')
    expect(applyColorway(biome, 'default')).toBe(biome)
    expect(applyColorway(biome)).toBe(biome)
  })

  it('shifts palette colors without changing generated cells', () => {
    const settings = {
      biome: 'temperate-grasslands' as const,
      width: 10,
      height: 8,
      seed: 'COLORWAY',
      terrain: { woods: 20, water: 10, rough: 15 },
      elevation: 2,
      symmetric: true,
      river: false,
    }
    const plain = generateMap(settings)
    const arid = generateMap({ ...settings, colorway: 'arid' })
    expect(arid.cells).toEqual(plain.cells)
    expect(arid.colorway).toBe('arid')
    const base = getBiome('temperate-grasslands')
    const tinted = applyColorway(base, 'twilight')
    expect(tinted.palette.clear.color).not.toBe(base.palette.clear.color)
    expect(tinted.palette.woods.color).not.toBe(base.palette.woods.color)
  })
})
