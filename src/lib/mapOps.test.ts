import { describe, expect, it } from 'vitest'
import type { GeneratorSettings } from '../types/map'
import { stampBuilding } from './buildingCommands'
import { buildingCells } from './buildings'
import { generateMap } from './generator'
import { expandMap, flipMapHorizontal, flipMapVertical, rotateMap180 } from './mapOps'

const settings: GeneratorSettings = {
  biome: 'temperate-grasslands',
  width: 8,
  height: 8,
  seed: 'OPS-TEST',
  terrain: { woods: 0, water: 0, rough: 0 },
  elevation: 0,
  symmetric: false,
  river: false,
}

const cellAt = (map: ReturnType<typeof generateMap>, col: number, row: number) =>
  map.cells.find((cell) => cell.col === col && cell.row === row)!

describe('map operations', () => {
  it('flips the map horizontally, remapping cells and buildings exactly', () => {
    let map = generateMap(settings)
    map = {
      ...map,
      cells: map.cells.map((cell) =>
        cell.col === 1 && cell.row === 2
          ? { ...cell, terrain: 'water' as const, feature: 'crater' as const }
          : cell,
      ),
    }
    map = stampBuilding(map, 'warehouse', { col: 1, row: 1 })

    const flipped = flipMapHorizontal(map)
    expect(cellAt(flipped, 6, 2)).toMatchObject({ terrain: 'water', feature: 'crater' })

    // The mirrored warehouse lands on the mirrored anchor with maximal overlap.
    const flippedCells = buildingCells(flipped.buildings[0])
    const mirroredKeys = new Set(
      buildingCells(map.buildings[0]).map((cell) => `${map.width - 1 - cell.col}:${cell.row}`),
    )
    expect(flippedCells.filter((cell) => mirroredKeys.has(`${cell.col}:${cell.row}`)).length)
      .toBeGreaterThanOrEqual(2)
    expect(flippedCells.some((cell) => cell.col === 6 && cell.row === 1)).toBe(true)
  })

  it('flips vertically and rotates 180 degrees', () => {
    let map = generateMap(settings)
    map = {
      ...map,
      cells: map.cells.map((cell) =>
        cell.col === 1 && cell.row === 2 ? { ...cell, terrain: 'water' as const } : cell,
      ),
    }
    const vertical = flipMapVertical(map)
    expect(cellAt(vertical, 1, 5)?.terrain).toBe('water')
    const rotated = rotateMap180(map)
    expect(cellAt(rotated, 6, 5)?.terrain).toBe('water')
  })

  it('expands the map with generated terrain, keeping content centered', () => {
    let map = generateMap(settings)
    map = stampBuilding(map, 'house', { col: 3, row: 3 })
    const before = cellAt(map, 3, 3)
    const grown = generateMap({ ...settings, width: 12, height: 12 })
    const expanded = expandMap(map, 4, 4, grown)
    expect(expanded.width).toBe(12)
    expect(expanded.height).toBe(12)
    expect(cellAt(expanded, 5, 5)).toMatchObject({
      terrain: before.terrain,
      elevation: before.elevation,
    })
    expect(expanded.buildings[0].anchor).toEqual({ col: 5, row: 5 })
  })
})
