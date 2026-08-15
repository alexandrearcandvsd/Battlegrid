import { describe, expect, it } from 'vitest'
import type { BrushSettings, GeneratorSettings } from '../types/map'
import { stampBuilding } from './buildingCommands'
import { generateMap } from './generator'
import {
  clearCellProtections,
  editMapCell,
  editMapPath,
  regenerateUnprotectedCells,
  resizeMapPreservingCells,
} from './mapCommands'

const settings: GeneratorSettings = {
  biome: 'temperate-grasslands',
  width: 8,
  height: 8,
  seed: 'COMMAND-TEST',
  terrain: { woods: 0, water: 0, rough: 0 },
  elevation: 0,
  symmetric: true,
  river: true,
}

const brush: BrushSettings = {
  terrain: 'woods',
  size: 1,
  tool: 'brush',
  elevationMode: 'paint',
  targetElevation: 0,
  mark: 'none',
}

describe('map editing commands', () => {
  it('paints and protects edited cells', () => {
    const map = generateMap(settings)
    const edited = editMapCell(map, { col: 2, row: 2 }, brush)
    const cell = edited.cells.find(({ col, row }) => col === 2 && row === 2)
    expect(cell).toMatchObject({ terrain: 'woods', isProtected: true })
  })

  it('fills a contiguous terrain region', () => {
    const generated = generateMap(settings)
    const map = {
      ...generated,
      cells: generated.cells.map((cell) => ({ ...cell, terrain: 'clear' as const })),
    }
    const edited = editMapCell(
      map,
      { col: 0, row: 0 },
      { ...brush, terrain: 'water', tool: 'fill' },
    )
    expect(edited.cells.every((cell) => cell.terrain === 'water')).toBe(true)
    expect(edited.cells.every((cell) => cell.isProtected)).toBe(true)
  })

  it('sets a direct elevation level and caps it at the maximum', () => {
    const map = generateMap(settings)
    const edited = editMapCell(map, { col: 3, row: 3 }, {
      ...brush,
      elevationMode: 'set',
      targetElevation: 6,
    })
    expect(edited.cells.find(({ col, row }) => col === 3 && row === 3)?.elevation).toBe(4)
  })

  it('preserves existing cells during resize', () => {
    const original = editMapCell(generateMap(settings), { col: 1, row: 1 }, brush)
    const larger = generateMap({ ...settings, width: 10, height: 9, seed: 'RESIZED' })
    const resized = resizeMapPreservingCells(original, larger)
    expect(resized).toMatchObject({ width: 10, height: 9, name: original.name })
    expect(resized.cells.find(({ col, row }) => col === 1 && row === 1)?.terrain).toBe('woods')
  })

  it('regenerates only unprotected cells and can clear protection', () => {
    const original = editMapCell(generateMap(settings), { col: 1, row: 1 }, brush)
    const regenerated = generateMap({
      ...settings,
      seed: 'NEW-SEED',
      terrain: { woods: 0, water: 45, rough: 0 },
    })
    const merged = regenerateUnprotectedCells(original, regenerated)
    expect(merged.cells.find(({ col, row }) => col === 1 && row === 1)?.terrain).toBe('woods')
    expect(clearCellProtections(merged).cells.some((cell) => cell.isProtected)).toBe(false)
  })

  it('paints feature marks and toggles them off on a second pass', () => {
    const map = generateMap(settings)
    const markBrush = { ...brush, mark: 'crater' as const }
    const marked = editMapCell(map, { col: 2, row: 2 }, markBrush)
    expect(marked.cells.find(({ col, row }) => col === 2 && row === 2)).toMatchObject({
      feature: 'crater',
      isProtected: true,
    })
    const cleared = editMapCell(marked, { col: 2, row: 2 }, markBrush)
    expect(
      cleared.cells.find(({ col, row }) => col === 2 && row === 2)?.feature,
    ).toBeUndefined()
  })

  it('protects the ground under buildings during regeneration', () => {
    const generated = generateMap(settings)
    const lot = generated.cells.find(
      (cell) => cell.terrain !== 'road' && cell.terrain !== 'water' && cell.terrain !== 'lava',
    )!
    const map = stampBuilding(generated, 'house', { col: lot.col, row: lot.row })
    const before = map.cells.find(({ col, row }) => col === lot.col && row === lot.row)!
    expect(before.isProtected).toBeUndefined()
    const flooded = generateMap({
      ...settings,
      seed: 'FLOOD',
      terrain: { woods: 0, water: 45, rough: 0 },
    })
    const merged = regenerateUnprotectedCells(map, flooded)
    expect(merged.cells.find(({ col, row }) => col === lot.col && row === lot.row)?.terrain).toBe(
      before.terrain,
    )
    expect(merged.buildings).toHaveLength(1)
    const withArt = {
      ...map,
      buildingArt: {
        house:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      },
    }
    expect(regenerateUnprotectedCells(withArt, flooded).buildingArt).toEqual(withArt.buildingArt)
  })

  it('drops buildings that fall outside the resized bounds', () => {
    const map = stampBuilding(generateMap(settings), 'house', { col: 7, row: 7 })
    const grown = resizeMapPreservingCells(
      map,
      generateMap({ ...settings, width: 12, height: 10, seed: 'GROW' }),
    )
    expect(grown.buildings).toHaveLength(1)
    const shrunk = resizeMapPreservingCells(
      map,
      generateMap({ ...settings, width: 6, height: 6, seed: 'SHRINK' }),
    )
    expect(shrunk.buildings).toHaveLength(0)
  })

  it('paints biome variant skins and clears them with universal tiles', () => {
    const map = generateMap(settings)
    const skinned = editMapCell(map, { col: 2, row: 2 }, { ...brush, terrain: 'water', skin: 'hot-desert:water' })
    expect(skinned.cells.find(({ col, row }) => col === 2 && row === 2)).toMatchObject({
      terrain: 'water',
      skin: 'hot-desert:water',
    })
    const cleared = editMapCell(skinned, { col: 2, row: 2 }, { ...brush, terrain: 'clear' })
    expect(cleared.cells.find(({ col, row }) => col === 2 && row === 2)?.skin).toBeUndefined()
  })

  it('fills a region with a biome variant skin', () => {
    const generated = generateMap(settings)
    const map = {
      ...generated,
      cells: generated.cells.map((cell) => ({ ...cell, terrain: 'clear' as const })),
    }
    const filled = editMapCell(
      map,
      { col: 0, row: 0 },
      { ...brush, terrain: 'water', skin: 'wetlands:water', tool: 'fill' },
    )
    expect(filled.cells.every((cell) => cell.skin === 'wetlands:water')).toBe(true)
  })

  it('scatters terrain onto a deterministic subset of the brush', () => {
    const map = generateMap({ ...settings, terrain: { woods: 0, water: 0, rough: 0 } })
    const scattered = editMapCell(map, { col: 3, row: 3 }, {
      ...brush,
      terrain: 'rough',
      tool: 'scatter',
      size: 2,
    })
    const again = editMapCell(map, { col: 3, row: 3 }, {
      ...brush,
      terrain: 'rough',
      tool: 'scatter',
      size: 2,
    })
    expect(scattered.cells).toEqual(again.cells)
    const painted = scattered.cells.filter((cell) => cell.terrain === 'rough' && cell.isProtected)
    const nearby = scattered.cells.filter(
      (cell) => Math.abs(cell.col - 3) <= 1 && Math.abs(cell.row - 3) <= 1,
    )
    expect(painted.length).toBeGreaterThan(0)
    expect(painted.length).toBeLessThan(nearby.length)
  })

  it('turns overlapping buildings to rubble and roughs empty hexes', () => {
    const generated = generateMap({ ...settings, terrain: { woods: 0, water: 0, rough: 0 } })
    const lot = generated.cells.find(
      (cell) => cell.terrain !== 'road' && cell.terrain !== 'water' && cell.terrain !== 'lava',
    )!
    const withHouse = stampBuilding(generated, 'house', { col: lot.col, row: lot.row })
    const ruined = editMapCell(withHouse, { col: lot.col, row: lot.row }, {
      ...brush,
      tool: 'rubble',
      size: 2,
    })
    expect(ruined.buildings[0].state).toBe('rubble')
  })

  it('paints a contiguous path between two hexes, including skipped cells', () => {
    const map = generateMap({ ...settings, terrain: { woods: 0, water: 0, rough: 0 }, river: false })
    const pathed = editMapPath(
      map,
      { col: 1, row: 2 },
      { col: 5, row: 2 },
      { ...brush, terrain: 'road', tool: 'path' },
    )
    const roads = pathed.cells.filter((cell) => cell.terrain === 'road' && cell.isProtected)
    expect(roads.length).toBeGreaterThanOrEqual(5)
    expect(roads.some((cell) => cell.col === 3 && cell.row === 2)).toBe(true)
  })
})
