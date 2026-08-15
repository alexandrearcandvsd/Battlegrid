import {
  CELL_FEATURES,
  MAX_ELEVATION,
  TERRAIN_TYPES,
  type BattleMap,
} from '../types/map'
import type { Building } from '../types/building'
import type { Annotation } from '../types/map'
import { DEFAULT_BIOME_ID, isBiomeId } from './biomes'
import { isBuildingState, isBuildingType } from './buildings'
import { isColorway } from './colorways'
import { isVariantId } from './variants'

export const MAP_STORAGE_KEY = 'battlegrid.current-map.v1'
export const MAP_BACKUP_KEY = 'battlegrid.current-map.v1.bak'
export const MAP_BROKEN_KEY = 'battlegrid.current-map.v1.broken'

export function serializeMap(map: BattleMap) {
  return JSON.stringify(map, null, 2)
}

function isValidProfile(profile: unknown): boolean {
  if (!profile || typeof profile !== 'object') return false
  const candidate = profile as Record<string, unknown>
  return (
    ['woods', 'water', 'rough', 'elevation'].every(
      (key) => typeof candidate[key] === 'number' && Number.isFinite(candidate[key]),
    ) &&
    ['symmetric', 'river'].every(
      (key) => candidate[key] === undefined || typeof candidate[key] === 'boolean',
    ) &&
    (candidate.roadChance === undefined ||
      (typeof candidate.roadChance === 'number' && Number.isFinite(candidate.roadChance))) &&
    (candidate.roadNetwork === undefined || typeof candidate.roadNetwork === 'boolean')
  )
}

function isValidBuilding(
  building: Partial<Building>,
  width: number,
  height: number,
  seenIds: Set<string>,
): building is Building {
  if (
    typeof building.id !== 'string' ||
    building.id.length === 0 ||
    seenIds.has(building.id) ||
    !isBuildingType(building.type) ||
    !building.anchor ||
    !Number.isInteger(building.anchor.col) ||
    !Number.isInteger(building.anchor.row) ||
    building.anchor.col < 0 ||
    building.anchor.row < 0 ||
    building.anchor.col >= width ||
    building.anchor.row >= height ||
    !Number.isInteger(building.rotation) ||
    (building.rotation as number) < 0 ||
    (building.rotation as number) > 5 ||
    !isBuildingState(building.state) ||
    (building.label !== undefined && typeof building.label !== 'string')
  ) {
    return false
  }
  return true
}

function isValidAnnotation(
  note: Partial<Annotation>,
  width: number,
  height: number,
): note is Annotation {
  return (
    typeof note.id === 'string' &&
    note.id.length > 0 &&
    Number.isInteger(note.col) &&
    Number.isInteger(note.row) &&
    (note.col as number) >= 0 &&
    (note.row as number) >= 0 &&
    (note.col as number) < width &&
    (note.row as number) < height &&
    typeof note.text === 'string'
  )
}

export function parseMapWithWarnings(value: string): { map: BattleMap; warnings: string[] } {
  const warnings: string[] = []
  let candidate: unknown
  try {
    candidate = JSON.parse(value)
  } catch {
    throw new Error('Map file is not valid JSON.')
  }
  if (!candidate || typeof candidate !== 'object') throw new Error('Map file is not an object.')
  const raw = candidate as Partial<Omit<BattleMap, 'version'>> & { version?: number }
  if (
    typeof raw.name !== 'string' ||
    typeof raw.width !== 'number' ||
    typeof raw.height !== 'number' ||
    !Array.isArray(raw.cells) ||
    raw.cells.length !== raw.width * raw.height
  ) {
    throw new Error('Map file has an unsupported or invalid format.')
  }
  if (typeof raw.version !== 'number' || raw.version < 1) {
    throw new Error('Map file has an unsupported or invalid format.')
  }
  if (raw.version !== 1 && raw.version !== 2) {
    warnings.push(`Opened format v${raw.version} using the v2 reader`)
  }

  const seenBuildingIds = new Set<string>()
  const sourceBuildings = raw.version === 1 ? [] : Array.isArray(raw.buildings) ? raw.buildings : []
  if (raw.version !== 1 && !Array.isArray(raw.buildings)) {
    warnings.push('Dropped missing or unreadable building list')
  }
  const buildings: Building[] = []
  for (const entry of sourceBuildings as Partial<Building>[]) {
    if (isValidBuilding(entry, raw.width, raw.height, seenBuildingIds)) {
      seenBuildingIds.add(entry.id)
      buildings.push(entry)
    } else {
      warnings.push('Dropped an invalid or duplicate building')
    }
  }

  const sourceNotes = raw.annotations ?? []
  const annotations: Annotation[] = []
  if (!Array.isArray(sourceNotes)) {
    warnings.push('Dropped unreadable annotations')
  } else {
    for (const note of sourceNotes as Partial<Annotation>[]) {
      if (isValidAnnotation(note, raw.width, raw.height)) annotations.push(note)
      else warnings.push('Dropped an invalid annotation')
    }
  }

  let biome = raw.biome
  if (biome !== undefined && !isBiomeId(biome)) {
    warnings.push(`Unknown biome "${String(biome)}" fell back to Temperate Grasslands`)
    biome = DEFAULT_BIOME_ID
  }

  let generatorProfile = raw.generatorProfile
  if (generatorProfile !== undefined && !isValidProfile(generatorProfile)) {
    warnings.push('Dropped an unreadable generator profile')
    generatorProfile = undefined
  }

  let colorway = raw.colorway
  if (colorway !== undefined && !isColorway(colorway)) {
    warnings.push('Dropped an unknown colorway')
    colorway = undefined
  }

  const terrain = new Set<string>(TERRAIN_TYPES)
  const features = new Set<string>(CELL_FEATURES)
  const cells = raw.cells.map((cell, index) => {
    if (
      !Number.isInteger(cell.col) ||
      !Number.isInteger(cell.row) ||
      !Number.isInteger(cell.elevation) ||
      (cell.isProtected !== undefined && typeof cell.isProtected !== 'boolean') ||
      !terrain.has(cell.terrain)
    ) {
      throw new Error('Map file contains invalid hex data.')
    }
    const next = { ...cell, elevation: Math.max(0, Math.min(MAX_ELEVATION, cell.elevation)) }
    if (cell.feature !== undefined && !features.has(cell.feature)) {
      warnings.push(`Stripped unknown feature on hex ${index}`)
      delete next.feature
    }
    if (cell.skin !== undefined && !isVariantId(cell.skin)) {
      warnings.push(`Stripped unknown terrain skin on hex ${index}`)
      delete next.skin
    }
    return next
  })

  const parsed: BattleMap = {
    ...raw,
    version: 2,
    biome: biome ?? DEFAULT_BIOME_ID,
    generatorProfile,
    buildings,
    annotations,
    cells,
  } as BattleMap
  if (colorway) parsed.colorway = colorway
  else delete parsed.colorway

  return {
    warnings,
    map: parsed,
  }
}

export function parseMap(value: string): BattleMap {
  return parseMapWithWarnings(value).map
}

function tryParse(value: string | null): BattleMap | null {
  if (!value) return null
  try {
    return parseMap(value)
  } catch {
    return null
  }
}

function writeLocal(serialized: string) {
  try {
    const current = localStorage.getItem(MAP_STORAGE_KEY)
    if (current && tryParse(current)) localStorage.setItem(MAP_BACKUP_KEY, current)
    localStorage.setItem(MAP_STORAGE_KEY, serialized)
  } catch {
    try {
      localStorage.setItem(MAP_STORAGE_KEY, serialized)
    } catch {
      // Quota or private-mode storage — the in-memory document is still editable.
    }
  }
}

export function saveMapLocally(map: BattleMap) {
  writeLocal(serializeMap(map))
}

export function loadMapLocally(): BattleMap | null {
  const primary = localStorage.getItem(MAP_STORAGE_KEY)
  const parsed = tryParse(primary)
  if (parsed) return parsed
  if (primary) {
    try {
      localStorage.setItem(MAP_BROKEN_KEY, primary)
    } catch {
      // ignore
    }
    localStorage.removeItem(MAP_STORAGE_KEY)
  }
  const backup = tryParse(localStorage.getItem(MAP_BACKUP_KEY))
  if (backup) {
    try {
      saveMapLocally(backup)
    } catch {
      // ignore
    }
    return backup
  }
  return null
}

function downloadJson(contents: string, filename: string) {
  const blob = new Blob([contents], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadMap(map: BattleMap) {
  downloadJson(serializeMap(map), `${safeFilename(map.name)}.battlemap.json`)
}

export function safeFilename(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled-map'
  )
}
