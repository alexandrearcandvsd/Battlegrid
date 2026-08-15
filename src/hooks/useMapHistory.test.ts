// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { BrushSettings, GeneratorSettings } from '../types/map'
import { generateMap } from '../lib/generator'
import { editMapCell, resizeMapPreservingCells } from '../lib/mapCommands'
import { useMapHistory } from './useMapHistory'

const settings: GeneratorSettings = {
  biome: 'temperate-grasslands',
  width: 8,
  height: 8,
  seed: 'HISTORY-TEST',
  terrain: { woods: 0, water: 0, rough: 0 },
  elevation: 0,
  symmetric: false,
  river: false,
}

const brush: BrushSettings = {
  terrain: 'woods',
  size: 1,
  tool: 'brush',
  elevationMode: 'paint',
  targetElevation: 0,
  mark: 'none',
}

const cellAt = (map: ReturnType<typeof generateMap>, col: number, row: number) =>
  map.cells.find((cell) => cell.col === col && cell.row === row)!

describe('useMapHistory', () => {
  it('undoes and redoes brush edits via compact patches', () => {
    const { result } = renderHook(() => useMapHistory(generateMap(settings)))
    const original = cellAt(result.current.map, 2, 2).terrain

    act(() => {
      result.current.commit((current) => editMapCell(current, { col: 2, row: 2 }, brush))
    })
    expect(cellAt(result.current.map, 2, 2).terrain).toBe('woods')
    expect(result.current.canUndo).toBe(true)

    act(() => result.current.undo())
    expect(cellAt(result.current.map, 2, 2).terrain).toBe(original)
    expect(result.current.canRedo).toBe(true)

    act(() => result.current.redo())
    expect(cellAt(result.current.map, 2, 2).terrain).toBe('woods')
  })

  it('falls back to full snapshots when dimensions change', () => {
    const { result } = renderHook(() => useMapHistory(generateMap(settings)))
    act(() => {
      result.current.commit((current) =>
        resizeMapPreservingCells(
          current,
          generateMap({ ...settings, width: 10, height: 10, seed: 'BIGGER' }),
        ),
      )
    })
    expect(result.current.map.width).toBe(10)

    act(() => result.current.undo())
    expect(result.current.map.width).toBe(8)
    expect(result.current.map.cells).toHaveLength(64)

    act(() => result.current.redo())
    expect(result.current.map.width).toBe(10)
  })
})
