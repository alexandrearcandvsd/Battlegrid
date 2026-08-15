import { useCallback, useState } from 'react'
import type { BiomeId } from '../types/biome'
import type { Building } from '../types/building'
import type { Annotation, BattleMap, GeneratorProfile, HexCell } from '../types/map'

interface CellChange {
  index: number
  before: HexCell
  after: HexCell
}

interface MapMeta {
  name: string
  biome?: BiomeId
  generatorProfile?: GeneratorProfile
}

interface MapPatch {
  cells?: CellChange[]
  buildings?: { before: Building[]; after: Building[] }
  annotations?: { before: Annotation[]; after: Annotation[] }
  meta?: { before: MapMeta; after: MapMeta }
  /** Dimension-changing operations (resize, crop, expand) snapshot both maps. */
  full?: { before: BattleMap; after: BattleMap }
}

function metaOf(map: BattleMap): MapMeta {
  return { name: map.name, biome: map.biome, generatorProfile: map.generatorProfile }
}

function makePatch(before: BattleMap, after: BattleMap): MapPatch {
  if (before.width !== after.width || before.height !== after.height) {
    return { full: { before, after } }
  }
  const patch: MapPatch = {}
  const cellChanges: CellChange[] = []
  for (let index = 0; index < before.cells.length; index += 1) {
    if (before.cells[index] !== after.cells[index]) {
      cellChanges.push({ index, before: before.cells[index], after: after.cells[index] })
    }
  }
  if (cellChanges.length > 0) patch.cells = cellChanges
  if (before.buildings !== after.buildings) {
    patch.buildings = { before: before.buildings, after: after.buildings }
  }
  if (before.annotations !== after.annotations) {
    patch.annotations = { before: before.annotations, after: after.annotations }
  }
  const beforeMeta = metaOf(before)
  const afterMeta = metaOf(after)
  if (
    beforeMeta.name !== afterMeta.name ||
    beforeMeta.biome !== afterMeta.biome ||
    beforeMeta.generatorProfile !== afterMeta.generatorProfile
  ) {
    patch.meta = { before: beforeMeta, after: afterMeta }
  }
  return patch
}

function applyPatch(map: BattleMap, patch: MapPatch, direction: 'undo' | 'redo'): BattleMap {
  if (patch.full) return direction === 'undo' ? patch.full.before : patch.full.after
  const cells = map.cells.slice()
  if (patch.cells) {
    for (const change of patch.cells) {
      cells[change.index] = direction === 'undo' ? change.before : change.after
    }
  }
  return {
    ...map,
    cells,
    buildings: patch.buildings
      ? direction === 'undo'
        ? patch.buildings.before
        : patch.buildings.after
      : map.buildings,
    annotations: patch.annotations
      ? direction === 'undo'
        ? patch.annotations.before
        : patch.annotations.after
      : map.annotations,
    ...(patch.meta ? (direction === 'undo' ? patch.meta.before : patch.meta.after) : {}),
    updatedAt: new Date().toISOString(),
  }
}

interface HistoryState {
  past: MapPatch[]
  present: BattleMap
  future: MapPatch[]
}

export function useMapHistory(initialMap: BattleMap) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialMap,
    future: [],
  })

  const commit = useCallback((next: BattleMap | ((current: BattleMap) => BattleMap)) => {
    setHistory((current) => {
      const map = typeof next === 'function' ? next(current.present) : next
      if (map === current.present) return current
      const stamped = { ...map, updatedAt: new Date().toISOString() }
      const patch = makePatch(current.present, stamped)
      return {
        past: [...current.past.slice(-39), patch],
        present: stamped,
        future: [],
      }
    })
  }, [])

  const replace = useCallback((map: BattleMap) => {
    setHistory({ past: [], present: map, future: [] })
  }, [])

  const undo = useCallback(() => {
    setHistory((current) => {
      const patch = current.past.at(-1)
      if (!patch) return current
      return {
        past: current.past.slice(0, -1),
        present: applyPatch(current.present, patch, 'undo'),
        future: [patch, ...current.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((current) => {
      const patch = current.future[0]
      if (!patch) return current
      return {
        past: [...current.past, patch],
        present: applyPatch(current.present, patch, 'redo'),
        future: current.future.slice(1),
      }
    })
  }, [])

  return {
    map: history.present,
    commit,
    replace,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
