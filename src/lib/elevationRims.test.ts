import { describe, expect, it } from 'vitest'
import type { HexCell } from '../types/map'
import { hexCenter } from './hex'
import { elevationEdgeMarks } from './elevationRims'

function cell(col: number, row: number, elevation: number): HexCell {
  return { col, row, terrain: 'clear', elevation }
}

function midpoint(line: { x1: number; y1: number; x2: number; y2: number }) {
  return { x: (line.x1 + line.x2) / 2, y: (line.y1 + line.y2) / 2 }
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

describe('elevationEdgeMarks', () => {
  it('skips flat ground and equal-height neighbors', () => {
    const cells = [cell(1, 1, 0), cell(2, 1, 2), cell(3, 1, 2)]
    const elevations = new Map(cells.map((entry) => [`${entry.col}:${entry.row}`, entry.elevation]))
    const marks = elevationEdgeMarks(cells, elevations, 32)
    expect(marks.every((mark) => mark.key.startsWith('1:1:') === false)).toBe(true)
    expect(marks.some((mark) => mark.key === '2:1:0')).toBe(false)
    expect(marks.some((mark) => mark.key === '3:1:3')).toBe(false)
  })

  it('stacks one extra contour per elevation step beyond the first', () => {
    const cells = [cell(2, 2, 3)]
    const elevations = new Map([['2:2', 3]])
    const marks = elevationEdgeMarks(cells, elevations, 32)
    expect(marks).toHaveLength(6)
    expect(marks.every((mark) => mark.drop === 3)).toBe(true)
    expect(marks.every((mark) => mark.contours.length === 2)).toBe(true)
  })

  it('insets extra contours toward the high hex and thickens taller cliffs', () => {
    const cells = [cell(4, 3, 4)]
    const elevations = new Map([['4:3', 4]])
    const marks = elevationEdgeMarks(cells, elevations, 32)
    const center = hexCenter(4, 3, 32)
    const mark = marks[0]
    expect(mark.shadow.width).toBeGreaterThan(8)
    expect(mark.depth).toBeGreaterThan(16)
    expect(mark.contours).toHaveLength(3)
    const shadowDistance = distance(midpoint(mark.shadow), center)
    const firstContour = distance(midpoint(mark.contours[0]), center)
    const lastContour = distance(midpoint(mark.contours[2]), center)
    expect(firstContour).toBeLessThan(shadowDistance)
    expect(lastContour).toBeLessThan(firstContour)
  })

  it('builds a deeper wall for taller drops', () => {
    const shallow = elevationEdgeMarks([cell(2, 2, 1)], new Map([['2:2', 1]]), 32)
    const tall = elevationEdgeMarks([cell(2, 2, 4)], new Map([['2:2', 4]]), 32)
    expect(shallow[0].depth).toBeGreaterThan(8)
    expect(tall[0].depth).toBeGreaterThan(shallow[0].depth + 7)
  })

  it('shades south-east faces darker than north-west faces', () => {
    const marks = elevationEdgeMarks([cell(2, 2, 2)], new Map([['2:2', 2]]), 32)
    const southEast = marks.find((mark) => mark.key.endsWith(':1'))
    const northWest = marks.find((mark) => mark.key.endsWith(':4'))
    expect(southEast?.cliffOpacity).toBeGreaterThan(northWest!.cliffOpacity)
    expect(northWest?.litOpacity).toBeGreaterThan(southEast!.litOpacity)
  })

  it('only marks the dropping sides of a plateau', () => {
    const cells = [cell(2, 2, 2), cell(3, 2, 2)]
    const elevations = new Map(cells.map((entry) => [`${entry.col}:${entry.row}`, entry.elevation]))
    const marks = elevationEdgeMarks(cells, elevations, 32)
    expect(marks.some((mark) => mark.key === '2:2:0')).toBe(false)
    expect(marks.some((mark) => mark.key === '3:2:3')).toBe(false)
    expect(marks.filter((mark) => mark.key.startsWith('2:2:'))).toHaveLength(5)
    expect(marks.filter((mark) => mark.key.startsWith('3:2:'))).toHaveLength(5)
  })
})
