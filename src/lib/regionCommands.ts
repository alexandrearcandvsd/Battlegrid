import type { Annotation, BattleMap, BrushSettings, HexCell } from '../types/map'
import type { Building } from '../types/building'
import { buildingCells, canPlaceBuilding } from './buildings'

const keyOf = ({ col, row }: { col: number; row: number }) => `${col}:${row}`

const parseKey = (key: string) => {
  const [col, row] = key.split(':').map(Number)
  return { col, row }
}

export function fillRegion(map: BattleMap, keys: string[], brush: BrushSettings): BattleMap {
  const selected = new Set(keys)
  return {
    ...map,
    cells: map.cells.map((cell) =>
      selected.has(keyOf(cell))
        ? {
            ...cell,
            terrain: brush.terrain,
            skin: brush.skin || undefined,
            elevation: brush.terrain === 'water' ? 0 : cell.elevation,
            isProtected: true,
          }
        : cell,
    ),
  }
}

export function setProtection(map: BattleMap, keys: string[], on: boolean): BattleMap {
  const selected = new Set(keys)
  return {
    ...map,
    cells: map.cells.map((cell) => {
      if (!selected.has(keyOf(cell))) return cell
      if (on) return { ...cell, isProtected: true }
      const { isProtected: _dropped, ...rest } = cell
      return rest
    }),
  }
}

export interface RegionClipboard {
  width: number
  height: number
  cells: HexCell[]
  buildings: Building[]
  annotations: Annotation[]
}

function regionBounds(keys: string[]) {
  const positions = keys.map(parseKey)
  const minCol = Math.min(...positions.map((pos) => pos.col))
  const minRow = Math.min(...positions.map((pos) => pos.row))
  const maxCol = Math.max(...positions.map((pos) => pos.col))
  const maxRow = Math.max(...positions.map((pos) => pos.row))
  return { minCol, minRow, maxCol, maxRow }
}

export function copyRegion(map: BattleMap, keys: string[]): RegionClipboard | null {
  if (keys.length === 0) return null
  const selected = new Set(keys)
  const { minCol, minRow, maxCol, maxRow } = regionBounds(keys)
  return {
    width: maxCol - minCol + 1,
    height: maxRow - minRow + 1,
    cells: map.cells
      .filter((cell) => selected.has(keyOf(cell)))
      .map((cell) => ({ ...cell, col: cell.col - minCol, row: cell.row - minRow })),
    buildings: map.buildings
      .filter((building) =>
        buildingCells(building).some((cell) => selected.has(keyOf(cell))),
      )
      .map((building) => ({
        ...building,
        anchor: {
          col: building.anchor.col - minCol,
          row: building.anchor.row - minRow,
        },
      })),
    annotations: map.annotations
      .filter((note) => selected.has(keyOf(note)))
      .map((note) => ({ ...note, col: note.col - minCol, row: note.row - minRow })),
  }
}

export function pasteRegion(
  map: BattleMap,
  clipboard: RegionClipboard,
  target: { col: number; row: number },
): BattleMap {
  const cellsByKey = new Map(map.cells.map((cell) => [keyOf(cell), cell]))
  for (const cell of clipboard.cells) {
    const col = cell.col + target.col
    const row = cell.row + target.row
    if (col < 0 || row < 0 || col >= map.width || row >= map.height) continue
    cellsByKey.set(`${col}:${row}`, { ...cell, col, row })
  }
  const next: BattleMap = {
    ...map,
    cells: map.cells.map((cell) => cellsByKey.get(keyOf(cell)) ?? cell),
  }
  const buildings = [...next.buildings]
  for (const building of clipboard.buildings) {
    const anchor = {
      col: building.anchor.col + target.col,
      row: building.anchor.row + target.row,
    }
    if (
      canPlaceBuilding({ ...next, buildings }, building.type, anchor, building.rotation)
    ) {
      buildings.push({ ...building, id: crypto.randomUUID(), anchor })
    }
  }
  const annotations = [...next.annotations]
  for (const note of clipboard.annotations) {
    const col = note.col + target.col
    const row = note.row + target.row
    if (col < 0 || row < 0 || col >= map.width || row >= map.height) continue
    annotations.push({ ...note, id: crypto.randomUUID(), col, row })
  }
  return { ...next, buildings, annotations }
}

export function clearRegion(map: BattleMap, keys: string[]): BattleMap {
  const selected = new Set(keys)
  return {
    ...map,
    cells: map.cells.map((cell) =>
      selected.has(keyOf(cell))
        ? { col: cell.col, row: cell.row, terrain: 'clear' as const, elevation: 0 }
        : cell,
    ),
    buildings: map.buildings.filter(
      (building) => !buildingCells(building).some((cell) => selected.has(keyOf(cell))),
    ),
    annotations: map.annotations.filter((note) => !selected.has(keyOf(note))),
  }
}

export function cropMapToRegion(map: BattleMap, keys: string[]): BattleMap {
  if (keys.length === 0) return map
  const { minCol, minRow, maxCol, maxRow } = regionBounds(keys)
  const width = maxCol - minCol + 1
  const height = maxRow - minRow + 1
  const inBounds = (col: number, row: number) =>
    col >= minCol && col <= maxCol && row >= minRow && row <= maxRow
  return {
    ...map,
    width,
    height,
    cells: map.cells
      .filter((cell) => inBounds(cell.col, cell.row))
      .map((cell) => ({ ...cell, col: cell.col - minCol, row: cell.row - minRow })),
    buildings: map.buildings
      .filter((building) =>
        buildingCells(building).every((cell) => inBounds(cell.col, cell.row)),
      )
      .map((building) => ({
        ...building,
        anchor: {
          col: building.anchor.col - minCol,
          row: building.anchor.row - minRow,
        },
      })),
    annotations: map.annotations
      .filter((note) => inBounds(note.col, note.row))
      .map((note) => ({ ...note, col: note.col - minCol, row: note.row - minRow })),
  }
}
