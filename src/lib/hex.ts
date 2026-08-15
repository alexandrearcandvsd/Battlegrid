export interface Point {
  x: number
  y: number
}

export interface AxialCoordinate {
  q: number
  r: number
}

const SQRT_3 = Math.sqrt(3)

/** Pointy-top hex radius in SVG units. Shared by the map view and print overlays. */
export const HEX_SIZE = 32

/** Padding around the hex field in the SVG view box. */
export const MAP_VIEW_PADDING = 50

export function offsetToAxial(col: number, row: number): AxialCoordinate {
  return { q: col - (row - (row & 1)) / 2, r: row }
}

export function axialToOffset(q: number, r: number): { col: number; row: number } {
  return { col: q + (r - (r & 1)) / 2, row: r }
}

export function hexCenter(col: number, row: number, size: number): Point {
  return {
    x: size * SQRT_3 * (col + 0.5 * (row & 1)),
    y: size * 1.5 * row,
  }
}

export function hexCorners(col: number, row: number, size: number): Point[] {
  const center = hexCenter(col, row, size)
  return Array.from({ length: 6 }, (_, index) => {
    const angle = ((60 * index - 30) * Math.PI) / 180
    return {
      x: center.x + size * Math.cos(angle),
      y: center.y + size * Math.sin(angle),
    }
  })
}

export function pointsAttribute(col: number, row: number, size: number): string {
  return hexCorners(col, row, size)
    .map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')
}

export function insetPointsAttribute(
  col: number,
  row: number,
  size: number,
  inset: number,
): string {
  const center = hexCenter(col, row, size)
  const radius = Math.max(0, size - inset)
  return Array.from({ length: 6 }, (_, index) => {
    const angle = ((60 * index - 30) * Math.PI) / 180
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    }
  })
    .map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')
}

export function cubeRound(q: number, r: number): AxialCoordinate {
  const s = -q - r
  let roundedQ = Math.round(q)
  let roundedR = Math.round(r)
  let roundedS = Math.round(s)
  const qDiff = Math.abs(roundedQ - q)
  const rDiff = Math.abs(roundedR - r)
  const sDiff = Math.abs(roundedS - s)

  if (qDiff > rDiff && qDiff > sDiff) roundedQ = -roundedR - roundedS
  else if (rDiff > sDiff) roundedR = -roundedQ - roundedS
  else roundedS = -roundedQ - roundedR

  void roundedS
  return { q: roundedQ, r: roundedR }
}

export function pixelToOffset(x: number, y: number, size: number) {
  const axial = cubeRound((SQRT_3 / 3 * x - y / 3) / size, (2 * y) / (3 * size))
  return axialToOffset(axial.q, axial.r)
}

export function hexDistance(
  a: { col: number; row: number },
  b: { col: number; row: number },
): number {
  const first = offsetToAxial(a.col, a.row)
  const second = offsetToAxial(b.col, b.row)
  return (
    (Math.abs(first.q - second.q) +
      Math.abs(first.q + first.r - second.q - second.r) +
      Math.abs(first.r - second.r)) /
    2
  )
}

/** Inclusive cube-lerp walk from start to end. */
export function hexLine(
  start: { col: number; row: number },
  end: { col: number; row: number },
): { col: number; row: number }[] {
  const distance = hexDistance(start, end)
  if (distance === 0) return [{ col: start.col, row: start.row }]
  const a = offsetToAxial(start.col, start.row)
  const b = offsetToAxial(end.col, end.row)
  const line: { col: number; row: number }[] = []
  const seen = new Set<string>()
  for (let step = 0; step <= distance; step += 1) {
    const t = step / distance
    const rounded = cubeRound(a.q + (b.q - a.q) * t, a.r + (b.r - a.r) * t)
    const cell = axialToOffset(rounded.q, rounded.r)
    const key = `${cell.col}:${cell.row}`
    if (seen.has(key)) continue
    seen.add(key)
    line.push(cell)
  }
  return line
}

export function inMapBounds(col: number, row: number, width: number, height: number) {
  return col >= 0 && row >= 0 && col < width && row < height
}

/** Adjacent hexes (up to six) that sit on the map. */
export function neighborHexes(col: number, row: number, width: number, height: number) {
  const result: { col: number; row: number }[] = []
  for (let edge = 0; edge < 6; edge += 1) {
    const next = edgeNeighbor(col, row, edge)
    if (inMapBounds(next.col, next.row, width, height)) result.push(next)
  }
  return result
}

export function cellsWithinRadius(
  center: { col: number; row: number },
  radius: number,
  width: number,
  height: number,
) {
  if (radius < 0 || !inMapBounds(center.col, center.row, width, height)) return []
  if (radius === 0) return [{ col: center.col, row: center.row }]
  const result: { col: number; row: number }[] = [{ col: center.col, row: center.row }]
  const seen = new Set<string>([`${center.col}:${center.row}`])
  const queue = [{ col: center.col, row: center.row, distance: 0 }]
  let head = 0
  while (head < queue.length) {
    const current = queue[head]
    head += 1
    if (current.distance >= radius) continue
    for (const next of neighborHexes(current.col, current.row, width, height)) {
      const key = `${next.col}:${next.row}`
      if (seen.has(key)) continue
      seen.add(key)
      result.push(next)
      queue.push({ col: next.col, row: next.row, distance: current.distance + 1 })
    }
  }
  return result
}

export function mapPixelSize(width: number, height: number, size: number) {
  return {
    width: SQRT_3 * size * (width + 0.5),
    height: size * (1.5 * Math.max(0, height - 1) + 2),
  }
}

/** Neighbor across edge 0-5 (E, SE, SW, W, NW, NE) in odd-r offset layout. */
export function edgeNeighbor(col: number, row: number, edge: number) {
  const odd = row % 2 === 1
  return [
    { col: col + 1, row },
    { col: col + (odd ? 1 : 0), row: row + 1 },
    { col: col - (odd ? 0 : 1), row: row + 1 },
    { col: col - 1, row },
    { col: col - (odd ? 0 : 1), row: row - 1 },
    { col: col + (odd ? 1 : 0), row: row - 1 },
  ][edge]
}
