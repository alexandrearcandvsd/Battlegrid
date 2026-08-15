import { hexCenter } from './hex'

export interface RegionRect {
  x0: number
  y0: number
  x1: number
  y1: number
}

/** Keys of cells whose centers fall inside the rect (content coordinates). */
export function cellsInRect(
  width: number,
  height: number,
  rect: RegionRect,
  size: number,
): string[] {
  const minX = Math.min(rect.x0, rect.x1)
  const maxX = Math.max(rect.x0, rect.x1)
  const minY = Math.min(rect.y0, rect.y1)
  const maxY = Math.max(rect.y0, rect.y1)
  const keys: string[] = []
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const center = hexCenter(col, row, size)
      if (center.x >= minX && center.x <= maxX && center.y >= minY && center.y <= maxY) {
        keys.push(`${col}:${row}`)
      }
    }
  }
  return keys
}

function pointInPolygon(x: number, y: number, points: { x: number; y: number }[]) {
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const a = points[i]
    const b = points[j]
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside
    }
  }
  return inside
}

/** Keys of cells whose centers fall inside the freehand path. */
export function cellsInPolygon(
  width: number,
  height: number,
  points: { x: number; y: number }[],
  size: number,
): string[] {
  if (points.length < 3) return []
  const keys: string[] = []
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const center = hexCenter(col, row, size)
      if (pointInPolygon(center.x, center.y, points)) keys.push(`${col}:${row}`)
    }
  }
  return keys
}
