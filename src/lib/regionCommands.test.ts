import { describe, expect, it } from 'vitest'
import type { BrushSettings, GeneratorSettings } from '../types/map'
import { setAnnotation } from './annotationCommands'
import { stampBuilding } from './buildingCommands'
import { buildingCells } from './buildings'
import { generateMap } from './generator'
import {
  clearRegion,
  copyRegion,
  cropMapToRegion,
  fillRegion,
  pasteRegion,
  setProtection,
} from './regionCommands'

const settings: GeneratorSettings = {
  biome: 'temperate-grasslands',
  width: 8,
  height: 8,
  seed: 'REGION-TEST',
  terrain: { woods: 0, water: 0, rough: 0 },
  elevation: 0,
  symmetric: false,
  river: false,
}

const brush: BrushSettings = {
  terrain: 'water',
  size: 1,
  tool: 'brush',
  elevationMode: 'paint',
  targetElevation: 0,
  mark: 'none',
  skin: 'wetlands:water',
}

const region = ['2:2', '3:2', '2:3', '3:3']

const openMap = () => {
  const map = generateMap(settings)
  return {
    ...map,
    cells: map.cells.map((cell) =>
      cell.terrain === 'road' ? { ...cell, terrain: 'clear' as const } : cell,
    ),
  }
}

describe('region commands', () => {
  it('fills a region with terrain and skin, protecting it', () => {
    const filled = fillRegion(generateMap(settings), region, brush)
    for (const key of region) {
      const [col, row] = key.split(':').map(Number)
      const cell = filled.cells.find((c) => c.col === col && c.row === row)!
      expect(cell).toMatchObject({
        terrain: 'water',
        skin: 'wetlands:water',
        elevation: 0,
        isProtected: true,
      })
    }
  })

  it('protects and unprotects a region', () => {
    const map = generateMap(settings)
    const protectedMap = setProtection(map, region, true)
    expect(
      protectedMap.cells.filter((cell) => cell.isProtected).length,
    ).toBe(region.length)
    const cleared = setProtection(protectedMap, region, false)
    expect(cleared.cells.some((cell) => cell.isProtected)).toBe(false)
  })

  it('copies and pastes a region with re-ided buildings and notes', () => {
    let map = openMap()
    map = stampBuilding(map, 'house', { col: 2, row: 2 })
    map = setAnnotation(map, { col: 3, row: 3 }, 'Objective A')
    map = fillRegion(map, region, { ...brush, terrain: 'woods', skin: undefined })

    const clipboard = copyRegion(map, region)!
    expect(clipboard.width).toBe(2)
    expect(clipboard.height).toBe(2)
    expect(clipboard.cells).toHaveLength(4)
    expect(clipboard.buildings).toHaveLength(1)
    expect(clipboard.annotations).toHaveLength(1)

    const pasted = pasteRegion(map, clipboard, { col: 5, row: 5 })
    const pastedCell = pasted.cells.find((c) => c.col === 5 && c.row === 5)!
    expect(pastedCell).toMatchObject({ terrain: 'woods', isProtected: true })
    expect(pasted.buildings).toHaveLength(2)
    const copy = pasted.buildings.find((b) => b.id !== map.buildings[0].id)!
    expect(copy.anchor).toEqual({ col: 5, row: 5 })
    expect(
      pasted.annotations.some((note) => note.col === 6 && note.row === 6 && note.text === 'Objective A'),
    ).toBe(true)
  })

  it('clears a region of cells, buildings, and notes', () => {
    let map = openMap()
    map = stampBuilding(map, 'house', { col: 2, row: 2 })
    map = setAnnotation(map, { col: 3, row: 3 }, 'Objective A')
    map = fillRegion(map, region, brush)

    const cleared = clearRegion(map, region)
    expect(cleared.buildings).toHaveLength(0)
    expect(cleared.annotations).toHaveLength(0)
    for (const key of region) {
      const [col, row] = key.split(':').map(Number)
      expect(cleared.cells.find((c) => c.col === col && c.row === row)).toEqual({
        col,
        row,
        terrain: 'clear',
        elevation: 0,
      })
    }
  })

  it('crops the map to the region bounds', () => {
    let map = openMap()
    map = stampBuilding(map, 'house', { col: 2, row: 2 })
    map = stampBuilding(map, 'house', { col: 6, row: 6 })
    const cropped = cropMapToRegion(map, region)
    expect(cropped.width).toBe(2)
    expect(cropped.height).toBe(2)
    expect(cropped.cells).toHaveLength(4)
    expect(cropped.buildings).toHaveLength(1)
    expect(cropped.buildings[0].anchor).toEqual({ col: 0, row: 0 })
    expect(buildingCells(cropped.buildings[0])).toEqual([{ col: 0, row: 0 }])
  })
})
