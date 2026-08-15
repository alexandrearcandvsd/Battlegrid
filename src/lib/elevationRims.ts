import type { HexCell } from '../types/map'
import { edgeNeighbor, hexCenter, hexCorners, type Point } from './hex'

export const CONTOUR_GAP = 2.55
export const CLIFF_BASE = 5.8
export const CLIFF_PER_DROP = 2.9

/** How shadowed a hex edge is, light from the north-west. E SE SW W NW NE. */
const FACE_SHADE = [0.7, 0.96, 0.9, 0.5, 0.22, 0.34]

export interface RimLine {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface ElevationEdgeMark {
  key: string
  drop: number
  depth: number
  /** Dark crease under the rim. */
  shade: string
  /** Vertical wall onto the lower hex. */
  cliff: string
  /** Soft cast shadow beyond the wall. */
  cast: string
  shadeOpacity: number
  cliffOpacity: number
  castOpacity: number
  litOpacity: number
  shadow: RimLine & { width: number }
  light: RimLine
  /** Extra isolines, one per elevation step beyond the first. */
  contours: RimLine[]
}

function unitInward(start: Point, end: Point, center: Point): Point {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const len = Math.hypot(dx, dy) || 1
  let nx = -dy / len
  let ny = dx / len
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2
  if ((center.x - midX) * nx + (center.y - midY) * ny < 0) {
    nx = -nx
    ny = -ny
  }
  return { x: nx, y: ny }
}

function offset(start: Point, end: Point, normal: Point, distance: number) {
  return {
    start: { x: start.x + normal.x * distance, y: start.y + normal.y * distance },
    end: { x: end.x + normal.x * distance, y: end.y + normal.y * distance },
  }
}

function shorten(start: Point, end: Point, pad: number) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const len = Math.hypot(dx, dy)
  if (len <= pad * 2 + 0.5) return { start, end }
  const ux = dx / len
  const uy = dy / len
  return {
    start: { x: start.x + ux * pad, y: start.y + uy * pad },
    end: { x: end.x - ux * pad, y: end.y - uy * pad },
  }
}

function line(start: Point, end: Point): RimLine {
  return { x1: start.x, y1: start.y, x2: end.x, y2: end.y }
}

function fmt(point: Point) {
  return `${point.x.toFixed(2)},${point.y.toFixed(2)}`
}

function quad(innerStart: Point, innerEnd: Point, outerEnd: Point, outerStart: Point) {
  return `${fmt(innerStart)} ${fmt(innerEnd)} ${fmt(outerEnd)} ${fmt(outerStart)}`
}

export function elevationEdgeMarks(
  cells: HexCell[],
  elevations: Map<string, number>,
  size: number,
): ElevationEdgeMark[] {
  const marks: ElevationEdgeMark[] = []
  for (const cell of cells) {
    if (cell.elevation <= 0) continue
    const corners = hexCorners(cell.col, cell.row, size)
    const center = hexCenter(cell.col, cell.row, size)
    for (let edge = 0; edge < 6; edge += 1) {
      const neighbor = edgeNeighbor(cell.col, cell.row, edge)
      const neighborElevation = elevations.get(`${neighbor.col}:${neighbor.row}`) ?? 0
      const drop = cell.elevation - neighborElevation
      if (drop <= 0) continue
      const start = corners[edge]
      const end = corners[(edge + 1) % corners.length]
      const inward = unitInward(start, end, center)
      const outward = { x: -inward.x, y: -inward.y }
      const depth = CLIFF_BASE + drop * CLIFF_PER_DROP
      const crease = offset(start, end, outward, depth * 0.28)
      const wall = offset(start, end, outward, depth)
      const cast = offset(start, end, outward, depth * 1.36)
      const creaseOuter = shorten(crease.start, crease.end, 0.6)
      const wallOuter = shorten(wall.start, wall.end, 2 + drop * 0.5)
      const castOuter = shorten(cast.start, cast.end, 3.4 + drop * 0.75)
      const lipInset = offset(start, end, inward, 1.55)
      const lip = shorten(lipInset.start, lipInset.end, 1.4)
      const shade = FACE_SHADE[edge] ?? 0.7
      const contours: RimLine[] = []
      for (let step = 1; step < drop; step += 1) {
        const inset = offset(start, end, inward, CONTOUR_GAP * step + 1.8)
        const trimmed = shorten(inset.start, inset.end, 3.2)
        contours.push(line(trimmed.start, trimmed.end))
      }
      marks.push({
        key: `${cell.col}:${cell.row}:${edge}`,
        drop,
        depth,
        shade: quad(start, end, creaseOuter.end, creaseOuter.start),
        cliff: quad(start, end, wallOuter.end, wallOuter.start),
        cast: quad(wall.start, wall.end, castOuter.end, castOuter.start),
        shadeOpacity: 0.52 + shade * 0.4,
        cliffOpacity: 0.34 + shade * 0.4,
        castOpacity: 0.12 + shade * 0.2,
        litOpacity: (1 - shade) * 0.38,
        shadow: { ...line(start, end), width: 4.1 + drop * 1.05 },
        light: line(lip.start, lip.end),
        contours,
      })
    }
  }
  return marks
}
