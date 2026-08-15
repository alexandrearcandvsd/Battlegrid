import type { Building, BuildingRotation } from '../types/building'
import type { BattleMap } from '../types/map'
import { buildingCells } from './buildings'

const keyOf = ({ col, row }: { col: number; row: number }) => `${col}:${row}`

/** Mirror a building: move the anchor, then pick the rotation whose footprint
 * best matches the mirrored cell set. Exact for lines, rhombi, and single
 * hexes; L-shapes distort slightly under an offset-grid mirror (a hex-lattice
 * truth, not an approximation we chose), so those land at the best overlap. */
function remapMirroredBuilding(
  building: Building,
  mirrorCell: (cell: { col: number; row: number }) => { col: number; row: number },
): Building {
  const target = buildingCells(building).map(mirrorCell)
  const targetKeys = new Set(target.map(keyOf))
  const candidates = [mirrorCell(building.anchor), ...target]
  let best: Building | null = null
  let bestOverlap = -1
  for (const anchor of candidates) {
    for (let step = 0; step < 6; step += 1) {
      const rotation = step as BuildingRotation
      const cells = buildingCells({ ...building, anchor, rotation })
      const overlap = cells.filter((cell) => targetKeys.has(keyOf(cell))).length
      if (overlap === target.length) return { ...building, anchor, rotation }
      if (overlap > bestOverlap) {
        bestOverlap = overlap
        best = { ...building, anchor, rotation }
      }
    }
  }
  return best ?? { ...building, anchor: candidates[0] }
}

function flipMap(map: BattleMap, horizontal: boolean): BattleMap {
  const mirrorCell = (cell: { col: number; row: number }) =>
    horizontal
      ? { col: map.width - 1 - cell.col, row: cell.row }
      : { col: cell.col, row: map.height - 1 - cell.row }
  return {
    ...map,
    cells: map.cells
      .map((cell) => ({ ...cell, ...mirrorCell(cell) }))
      .sort((a, b) => a.row - b.row || a.col - b.col),
    buildings: map.buildings.map((building) => remapMirroredBuilding(building, mirrorCell)),
    annotations: map.annotations.map((note) => ({ ...note, ...mirrorCell(note) })),
  }
}

export function flipMapHorizontal(map: BattleMap): BattleMap {
  return flipMap(map, true)
}

export function flipMapVertical(map: BattleMap): BattleMap {
  return flipMap(map, false)
}

export function rotateMap180(map: BattleMap): BattleMap {
  return flipMapVertical(flipMapHorizontal(map))
}

/** Pad the map with freshly generated terrain, existing content centered. */
export function expandMap(
  map: BattleMap,
  addCols: number,
  addRows: number,
  generated: BattleMap,
): BattleMap {
  const shiftCol = Math.floor(addCols / 2)
  const shiftRow = Math.floor(addRows / 2)
  const existing = new Map(
    map.cells.map((cell) => [
      `${cell.col + shiftCol}:${cell.row + shiftRow}`,
      { ...cell, col: cell.col + shiftCol, row: cell.row + shiftRow },
    ]),
  )
  return {
    ...generated,
    name: map.name,
    cells: generated.cells.map((cell) => existing.get(keyOf(cell)) ?? cell),
    buildings: map.buildings.map((building) => ({
      ...building,
      anchor: {
        col: building.anchor.col + shiftCol,
        row: building.anchor.row + shiftRow,
      },
    })),
    annotations: map.annotations.map((note) => ({
      ...note,
      col: note.col + shiftCol,
      row: note.row + shiftRow,
    })),
  }
}
