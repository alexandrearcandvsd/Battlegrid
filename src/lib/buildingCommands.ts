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
  const image = map.buildingArt?.[type]
  const building: Building = {
    id: crypto.randomUUID(),
    type,
    anchor,
    rotation: 0,
    state: 'intact',
    ...(image ? { image } : {}),
  }
  return { ...map, buildings: [...map.buildings, building] }
}

function withoutImage(building: Building): Building {
  if (!building.image) return building
  const { image: _image, ...rest } = building
  return rest
}

function withBuildingArt(
  map: BattleMap,
  type: BuildingType,
  image: string | undefined,
): BattleMap {
  if (map.buildingArt?.[type] === image) return map
  const buildingArt = { ...map.buildingArt }
  if (image) buildingArt[type] = image
  else delete buildingArt[type]
  const nextArt = Object.keys(buildingArt).length > 0 ? buildingArt : undefined
  return { ...map, buildingArt: nextArt }
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

export function setBuildingImage(
  map: BattleMap,
  id: string,
  image: string | undefined,
  asTypeDefault = false,
): BattleMap {
  const next = updateBuilding(map, id, (building) => {
    if (building.image === image || (!building.image && !image)) return building
    return image ? { ...building, image } : withoutImage(building)
  })
  if (!asTypeDefault) return next
  const building = next.buildings.find((entry) => entry.id === id)
  if (!building || !image) return next
  return withBuildingArt(next, building.type, image)
}

export function applyBuildingImageToType(
  map: BattleMap,
  type: BuildingType,
  image: string | undefined,
): BattleMap {
  let changed = false
  const buildings = map.buildings.map((building) => {
    if (building.type !== type) return building
    if (building.image === image || (!building.image && !image)) return building
    changed = true
    return image ? { ...building, image } : withoutImage(building)
  })
  const withBuildings = changed ? { ...map, buildings } : map
  return withBuildingArt(withBuildings, type, image)
}

export { buildingCells }
