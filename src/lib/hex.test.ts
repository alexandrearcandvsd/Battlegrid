import { describe, expect, it } from 'vitest'
import {
  axialToOffset,
  cellsWithinRadius,
  hexCenter,
  hexDistance,
  hexLine,
  insetPointsAttribute,
  offsetToAxial,
  pixelToOffset,
} from './hex'

describe('hex geometry', () => {
  it('round-trips offset and axial coordinates', () => {
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const axial = offsetToAxial(col, row)
        expect(axialToOffset(axial.q, axial.r)).toEqual({ col, row })
      }
    }
  })

  it('finds a hex from its pixel center', () => {
    const center = hexCenter(7, 5, 32)
    expect(pixelToOffset(center.x, center.y, 32)).toEqual({ col: 7, row: 5 })
  })

  it('calculates radius and distance on the grid', () => {
    expect(hexDistance({ col: 3, row: 3 }, { col: 3, row: 3 })).toBe(0)
    expect(cellsWithinRadius({ col: 3, row: 3 }, 1, 8, 8)).toHaveLength(7)
  })

  it('walks neighbors instead of scanning the whole map', () => {
    const walked = cellsWithinRadius({ col: 12, row: 9 }, 2, 40, 30)
    expect(walked).toHaveLength(19)
    expect(walked.every((cell) => hexDistance(cell, { col: 12, row: 9 }) <= 2)).toBe(true)
  })

  it('walks a contiguous hex line between two cells', () => {
    const line = hexLine({ col: 1, row: 3 }, { col: 5, row: 3 })
    expect(line[0]).toEqual({ col: 1, row: 3 })
    expect(line.at(-1)).toEqual({ col: 5, row: 3 })
    expect(line.length).toBe(hexDistance({ col: 1, row: 3 }, { col: 5, row: 3 }) + 1)
    for (let index = 1; index < line.length; index += 1) {
      expect(hexDistance(line[index - 1], line[index])).toBe(1)
    }
  })

  it('keeps inset texture polygons centered on their hex', () => {
    const center = hexCenter(12, 9, 32)
    const points = insetPointsAttribute(12, 9, 32, 2)
      .split(' ')
      .map((point) => point.split(',').map(Number))
    const centroid = points.reduce(
      (total, [x, y]) => ({ x: total.x + x / 6, y: total.y + y / 6 }),
      { x: 0, y: 0 },
    )
    expect(centroid.x).toBeCloseTo(center.x)
    expect(centroid.y).toBeCloseTo(center.y)
  })
})
