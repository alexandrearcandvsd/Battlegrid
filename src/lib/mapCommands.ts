import {
  MAX_ELEVATION,
  type BattleMap,
  type BrushSettings,
  type HexCell,
  type TerrainType,
} from '../types/map'
import { buildingCells } from './buildings'
import { cellsWithinRadius, hexLine } from './hex'

const keyOf = ({ col, row }: { col: number; row: number }) => `${col}:${row}`

/** Deterministic ~40% hit test for the scatter brush. Same hex always hits the same. */
export function scatterHits(col: number, row: number, density = 40): boolean {
  const hash = ((col * 73856093) ^ (row * 19349663) ^ 0x9e3779b9) >>> 0
  return hash % 100 < density
}

function applyBrushValue(cell: HexCell, brush: BrushSettings): HexCell {
  if (brush.mark !== 'none' && brush.elevationMode === 'paint') {
    // Mark mode toggles: painting the same feature again removes it.
    return {
      ...cell,
      feature: cell.feature === brush.mark ? undefined : brush.mark,
      isProtected: true,
    }
  }
  if (brush.elevationMode === 'raise') {
    return {
      ...cell,
      elevation: Math.min(MAX_ELEVATION, cell.elevation + 1),
      isProtected: true,
    }
  }
  if (brush.elevationMode === 'lower') {
    return { ...cell, elevation: Math.max(0, cell.elevation - 1), isProtected: true }
  }
  if (brush.elevationMode === 'set') {
    return {
      ...cell,
      elevation: Math.max(0, Math.min(MAX_ELEVATION, Math.round(brush.targetElevation))),
      isProtected: true,
    }
  }
  return {
    ...cell,
    terrain: brush.terrain,
    skin: brush.skin || undefined,
    elevation: brush.terrain === 'water' ? 0 : cell.elevation,
    isProtected: true,
  }
}

function floodTerrain(
  map: BattleMap,
  target: HexCell,
  terrain: TerrainType,
  skin: string | undefined,
): BattleMap {
  if (target.terrain === terrain && target.skin === skin) return map
  const sourceTerrain = target.terrain
  const byKey = new Map(map.cells.map((cell) => [keyOf(cell), cell]))
  const queued = [target]
  const visited = new Set<string>()

  while (queued.length > 0) {
    const cell = queued.pop()!
    const key = keyOf(cell)
    if (visited.has(key) || cell.terrain !== sourceTerrain) continue
    visited.add(key)
    for (const neighbor of cellsWithinRadius(cell, 1, map.width, map.height)) {
      if (neighbor.col === cell.col && neighbor.row === cell.row) continue
      const adjacent = byKey.get(keyOf(neighbor))
      if (adjacent && adjacent.terrain === sourceTerrain && !visited.has(keyOf(adjacent))) {
        queued.push(adjacent)
      }
    }
  }

  return {
    ...map,
    cells: map.cells.map((cell) =>
      visited.has(keyOf(cell))
        ? {
            ...cell,
            terrain,
            skin,
            elevation: terrain === 'water' ? 0 : cell.elevation,
            isProtected: true,
          }
        : cell,
    ),
  }
}

export function editMapCell(
  map: BattleMap,
  target: Pick<HexCell, 'col' | 'row'>,
  brush: BrushSettings,
): BattleMap {
  const targetCell = map.cells.find(
    (cell) => cell.col === target.col && cell.row === target.row,
  )
  if (!targetCell) return map
  if (brush.tool === 'fill' && brush.elevationMode === 'paint' && brush.mark === 'none') {
    return floodTerrain(map, targetCell, brush.terrain, brush.skin || undefined)
  }

  const affected = new Set(
    cellsWithinRadius(target, brush.size - 1, map.width, map.height).map(keyOf),
  )

  if (brush.tool === 'scatter') {
    return {
      ...map,
      cells: map.cells.map((cell) =>
        affected.has(keyOf(cell)) && scatterHits(cell.col, cell.row)
          ? applyBrushValue(cell, brush)
          : cell,
      ),
    }
  }

  if (brush.tool === 'rubble') {
    const occupied = new Set(
      map.buildings.flatMap((building) => buildingCells(building).map(keyOf)),
    )
    const hitBuildings = new Set(
      map.buildings
        .filter((building) => buildingCells(building).some((cell) => affected.has(keyOf(cell))))
        .map((building) => building.id),
    )
    return {
      ...map,
      buildings: map.buildings.map((building) =>
        hitBuildings.has(building.id) ? { ...building, state: 'rubble' as const } : building,
      ),
      cells: map.cells.map((cell) => {
        if (!affected.has(keyOf(cell))) return cell
        if (occupied.has(keyOf(cell))) return { ...cell, isProtected: true }
        if (!scatterHits(cell.col, cell.row, 55)) return { ...cell, isProtected: true }
        return {
          ...cell,
          terrain: 'rough' as const,
          feature: scatterHits(cell.col + 17, cell.row + 31, 50) ? 'crater' : cell.feature,
          elevation: cell.terrain === 'water' ? 0 : cell.elevation,
          isProtected: true,
        }
      }),
    }
  }

  return {
    ...map,
    cells: map.cells.map((cell) =>
      affected.has(keyOf(cell)) ? applyBrushValue(cell, brush) : cell,
    ),
  }
}

export function editMapPath(
  map: BattleMap,
  from: Pick<HexCell, 'col' | 'row'>,
  to: Pick<HexCell, 'col' | 'row'>,
  brush: BrushSettings,
): BattleMap {
  const keys = new Set(
    hexLine(from, to)
      .filter((cell) => cell.col >= 0 && cell.row >= 0 && cell.col < map.width && cell.row < map.height)
      .map(keyOf),
  )
  return {
    ...map,
    cells: map.cells.map((cell) => (keys.has(keyOf(cell)) ? applyBrushValue(cell, brush) : cell)),
  }
}

export function resizeMapPreservingCells(
  current: BattleMap,
  generated: BattleMap,
): BattleMap {
  const existing = new Map(current.cells.map((cell) => [keyOf(cell), cell]))
  return {
    ...generated,
    name: current.name,
    cells: generated.cells.map((cell) => existing.get(keyOf(cell)) ?? cell),
    buildings: current.buildings.filter((building) =>
      buildingCells(building).every(
        (cell) => cell.col >= 0 && cell.row >= 0 && cell.col < generated.width && cell.row < generated.height,
      ),
    ),
    buildingArt: current.buildingArt,
  }
}

export function regenerateUnprotectedCells(
  current: BattleMap,
  generated: BattleMap,
): BattleMap {
  const protectedCells = new Map(
    current.cells.filter((cell) => cell.isProtected).map((cell) => [keyOf(cell), cell]),
  )
  // Cells under a building count as protected: structures never float over
  // freshly generated water or lava.
  for (const building of current.buildings) {
    for (const cell of buildingCells(building)) {
      const existing = current.cells.find(
        (candidate) => candidate.col === cell.col && candidate.row === cell.row,
      )
      if (existing) protectedCells.set(keyOf(existing), existing)
    }
  }
  return {
    ...generated,
    name: current.name,
    cells: generated.cells.map((cell) => protectedCells.get(keyOf(cell)) ?? cell),
    buildings: current.buildings,
    buildingArt: current.buildingArt,
  }
}

export function clearCellProtections(map: BattleMap): BattleMap {
  if (!map.cells.some((cell) => cell.isProtected)) return map
  return {
    ...map,
    cells: map.cells.map(({ isProtected: _isProtected, ...cell }) => cell),
  }
}

export function countProtectedCells(map: BattleMap) {
  return map.cells.filter((cell) => cell.isProtected).length
}
