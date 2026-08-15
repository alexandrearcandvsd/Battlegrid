import type {
  Building,
  BuildingRotation,
  BuildingState,
  BuildingType,
} from '../types/building'
import type { BattleMap } from '../types/map'
import { buildingCells, canPlaceBuilding } from './buildings'

export function stampBuilding(
  map: BattleMap,
  type: BuildingType,
  anchor: { col: number; row: number },
): BattleMap {
  if (!canPlaceBuilding(map, type, anchor, 0)) return map
  const building: Building = {
    id: crypto.randomUUID(),
    type,
    anchor,
    rotation: 0,
    state: 'intact',
  }
  return { ...map, buildings: [...map.buildings, building] }
}

function updateBuilding(
  map: BattleMap,
  id: string,
  update: (building: Building) => Building | null,
): BattleMap {
  let changed = false
  const buildings = map.buildings.flatMap((building) => {
    if (building.id !== id) return [building]
    const next = update(building)
    if (!next) return []
    if (next !== building) changed = true
    return [next]
  })
  return changed ? { ...map, buildings } : map
}

export function moveBuilding(
  map: BattleMap,
  id: string,
  anchor: { col: number; row: number },
): BattleMap {
  return updateBuilding(map, id, (building) =>
    canPlaceBuilding(map, building.type, anchor, building.rotation, id)
      ? { ...building, anchor }
      : building,
  )
}

export function rotateBuilding(map: BattleMap, id: string): BattleMap {
  return updateBuilding(map, id, (building) => {
    const rotation = ((building.rotation + 1) % 6) as BuildingRotation
    return canPlaceBuilding(map, building.type, building.anchor, rotation, id)
      ? { ...building, rotation }
      : building
  })
}

export function duplicateBuilding(map: BattleMap, id: string): BattleMap {
  const source = map.buildings.find((building) => building.id === id)
  if (!source) return map
  // Nudge the copy one column right until it fits beside the original.
  for (let offset = 1; offset <= map.width; offset += 1) {
    const anchor = { col: source.anchor.col + offset, row: source.anchor.row }
    if (canPlaceBuilding(map, source.type, anchor, source.rotation)) {
      const copy: Building = { ...source, id: crypto.randomUUID(), anchor }
      return { ...map, buildings: [...map.buildings, copy] }
    }
  }
  return map
}

export function deleteBuilding(map: BattleMap, id: string): BattleMap {
  if (!map.buildings.some((building) => building.id === id)) return map
  return { ...map, buildings: map.buildings.filter((building) => building.id !== id) }
}

export function setBuildingState(map: BattleMap, id: string, state: BuildingState): BattleMap {
  return updateBuilding(map, id, (building) =>
    building.state === state ? building : { ...building, state },
  )
}

export function setBuildingLabel(map: BattleMap, id: string, label: string): BattleMap {
  return updateBuilding(map, id, (building) => ({
    ...building,
    label: label.trim() || undefined,
  }))
}

export { buildingCells }
