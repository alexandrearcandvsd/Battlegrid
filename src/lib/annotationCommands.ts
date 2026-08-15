import type { BattleMap } from '../types/map'

export function setAnnotation(
  map: BattleMap,
  target: { col: number; row: number },
  text: string,
): BattleMap {
  const trimmed = text.trim()
  const existing = map.annotations.find(
    (note) => note.col === target.col && note.row === target.row,
  )
  if (!trimmed) {
    if (!existing) return map
    return { ...map, annotations: map.annotations.filter((note) => note !== existing) }
  }
  if (existing) {
    return {
      ...map,
      annotations: map.annotations.map((note) =>
        note === existing ? { ...note, text: trimmed } : note,
      ),
    }
  }
  return {
    ...map,
    annotations: [
      ...map.annotations,
      { id: crypto.randomUUID(), col: target.col, row: target.row, text: trimmed },
    ],
  }
}

export function deleteAnnotation(map: BattleMap, id: string): BattleMap {
  if (!map.annotations.some((note) => note.id === id)) return map
  return { ...map, annotations: map.annotations.filter((note) => note.id !== id) }
}
