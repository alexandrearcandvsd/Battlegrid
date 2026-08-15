import { describe, expect, it } from 'vitest'
import type { BattleMap, GeneratorSettings } from '../types/map'
import { generateMap } from './generator'
import { cellsWithinRadius } from './hex'

const settings: GeneratorSettings = {
  biome: 'temperate-grasslands',
  width: 18,
  height: 14,
  seed: 'TEST-RIDGE-42',
  terrain: { woods: 28, water: 13, rough: 21 },
  elevation: 3,
  symmetric: true,
  river: true,
}

function countRoadComponents(map: BattleMap) {
  const roads = map.cells.filter((cell) => cell.terrain === 'road')
  const keyOf = (cell: { col: number; row: number }) => `${cell.col}:${cell.row}`
  const keys = new Set(roads.map(keyOf))
  const seen = new Set<string>()
  let count = 0
  for (const start of roads) {
    if (seen.has(keyOf(start))) continue
    count += 1
    const queue: { col: number; row: number }[] = [start]
    seen.add(keyOf(start))
    while (queue.length > 0) {
      const current = queue.pop()!
      for (const next of cellsWithinRadius(current, 1, map.width, map.height)) {
        const key = keyOf(next)
        if (!keys.has(key) || seen.has(key)) continue
        seen.add(key)
        queue.push(next)
      }
    }
  }
  return count
}

describe('battlefield generator', () => {
  it('is deterministic for a seed and settings', () => {
    expect(generateMap(settings).cells).toEqual(generateMap(settings).cells)
  })

  it('keeps temperate output stable across the biome refactor', () => {
    const first = generateMap({ ...settings, biome: 'temperate-grasslands' })
    const second = generateMap(settings)
    expect(first.cells).toEqual(second.cells)
    expect(first.cells.some((cell) => cell.terrain === 'road')).toBe(true)
    expect(first.biome).toBe('temperate-grasslands')
  })

  it('changes the generated cells when the seed changes', () => {
    const first = generateMap(settings)
    const second = generateMap({ ...settings, seed: 'OTHER-SEED' })
    expect(first.cells).not.toEqual(second.cells)
  })

  it('creates a complete map with bounded elevation', () => {
    const map = generateMap(settings)
    expect(map.cells).toHaveLength(settings.width * settings.height)
    expect(map.cells.every((cell) => cell.elevation >= 0 && cell.elevation <= 3)).toBe(true)
    expect(map.cells.some((cell) => cell.terrain === 'road')).toBe(true)
  })

  it('clamps unsupported dimensions', () => {
    const map = generateMap({ ...settings, width: 100, height: 2 })
    expect(map.width).toBe(48)
    expect(map.height).toBe(6)
  })

  it('keeps extra countryside roads as separate routes', () => {
    const map = generateMap({
      ...settings,
      biome: 'temperate-grasslands',
      terrain: { woods: 0, water: 0, rough: 0 },
      river: false,
      symmetric: false,
      roadNetwork: true,
      seed: 'ROUTE-GAP-B',
    })
    expect(countRoadComponents(map)).toBeGreaterThanOrEqual(2)
  })

  it('wanders a countryside road east to west instead of painting a straight row', () => {
    const map = generateMap({
      ...settings,
      biome: 'temperate-grasslands',
      terrain: { woods: 0, water: 0, rough: 0 },
      river: false,
      symmetric: false,
      seed: 'ROAD-WANDER',
    })
    const roads = map.cells.filter((cell) => cell.terrain === 'road')
    expect(roads.length).toBeGreaterThan(0)
    expect(roads.some((cell) => cell.col === 0)).toBe(true)
    expect(roads.some((cell) => cell.col === map.width - 1)).toBe(true)
    expect(new Set(roads.map((cell) => cell.row)).size).toBeGreaterThan(1)
    for (let col = 0; col < map.width; col += 1) {
      expect(roads.filter((cell) => cell.col === col).length).toBe(1)
    }
  })

  it('keeps one countryside road under symmetric terrain, not a mirrored pair', () => {
    const map = generateMap({
      ...settings,
      biome: 'temperate-grasslands',
      terrain: { woods: 0, water: 0, rough: 0 },
      river: false,
      symmetric: true,
      seed: 'ROAD-SYM',
    })
    const roads = map.cells.filter((cell) => cell.terrain === 'road')
    expect(roads.length).toBeGreaterThan(0)
    expect(countRoadComponents(map)).toBe(1)
    expect(new Set(roads.map((cell) => cell.row)).size).toBeGreaterThan(1)
  })

  it('lays roads as a contiguous chain with no isolated road hexes', () => {
    const map = generateMap(settings)
    const roads = map.cells.filter((cell) => cell.terrain === 'road')
    expect(roads.length).toBeGreaterThan(0)
    for (const cell of roads) {
      const hasRoadNeighbor = cellsWithinRadius(cell, 1, map.width, map.height)
        .filter((neighbor) => neighbor.col !== cell.col || neighbor.row !== cell.row)
        .some((neighbor) =>
          map.cells.some(
            (candidate) =>
              candidate.col === neighbor.col &&
              candidate.row === neighbor.row &&
              candidate.terrain === 'road',
          ),
        )
      expect(hasRoadNeighbor).toBe(true)
    }
  })

  it('mirrors every cell when symmetric generation is on', () => {
    const map = generateMap(settings)
    for (const cell of map.cells) {
      const mirror = map.cells.find(
        (candidate) =>
          candidate.col === map.width - 1 - cell.col &&
          candidate.row === map.height - 1 - cell.row,
      )
      expect(mirror?.terrain).toBe(cell.terrain)
      expect(mirror?.elevation).toBe(cell.elevation)
    }
  })

  it('does not mirror the map when symmetric generation is off', () => {
    const map = generateMap({ ...settings, symmetric: false, river: false })
    const mismatches = map.cells.filter((cell) => {
      const mirror = map.cells.find(
        (candidate) =>
          candidate.col === map.width - 1 - cell.col &&
          candidate.row === map.height - 1 - cell.row,
      )
      return mirror?.terrain !== cell.terrain || mirror?.elevation !== cell.elevation
    })
    expect(mismatches.length).toBeGreaterThan(0)
  })

  it('crosses the whole map with a river in one orientation', () => {
    const map = generateMap(settings)
    const water = map.cells.filter((cell) => cell.terrain === 'water')
    expect(water.length).toBeGreaterThan(0)
    const colSpan =
      Math.max(...water.map((cell) => cell.col)) - Math.min(...water.map((cell) => cell.col))
    const rowSpan =
      Math.max(...water.map((cell) => cell.row)) - Math.min(...water.map((cell) => cell.row))
    expect(colSpan >= map.width - 3 || rowSpan >= map.height - 3).toBe(true)
  })

  it('raises mirrored hills and guarantees center cover', () => {
    const map = generateMap(settings)
    const high = map.cells.filter((cell) => cell.elevation >= 2)
    expect(high.length).toBeGreaterThanOrEqual(4)
    for (const cell of high) {
      const mirror = map.cells.find(
        (candidate) =>
          candidate.col === map.width - 1 - cell.col &&
          candidate.row === map.height - 1 - cell.row,
      )
      expect(mirror && mirror.elevation >= 2).toBe(true)
    }
    const bare = generateMap({
      ...settings,
      terrain: { woods: 0, water: 0, rough: 0 },
      river: false,
    })
    const center = { col: Math.floor(bare.width / 2), row: Math.floor(bare.height / 2) }
    const cover = cellsWithinRadius(center, 1, bare.width, bare.height).filter((pos) => {
      const cell = bare.cells.find((c) => c.col === pos.col && c.row === pos.row)
      return cell && cell.terrain !== 'clear'
    })
    expect(cover.length).toBeGreaterThanOrEqual(2)
  })

  it('generates a maximum-size map without hanging', () => {
    const started = performance.now()
    const map = generateMap({ ...settings, width: 48, height: 34, seed: 'GRAND-MAX' })
    expect(map.cells).toHaveLength(1632)
    expect(performance.now() - started).toBeLessThan(1500)
  })

  it('omits the countryside road when road chance is 0', () => {
    const map = generateMap({ ...settings, roadChance: 0, river: false })
    expect(map.cells.every((cell) => cell.terrain !== 'road')).toBe(true)
    expect(map.generatorProfile?.roadChance).toBe(0)
  })

  it('keeps the default 100% road chance identical to an omitted setting', () => {
    const implied = generateMap(settings)
    const explicit = generateMap({ ...settings, roadChance: 100 })
    expect(explicit.cells).toEqual(implied.cells)
    expect(explicit.cells.some((cell) => cell.terrain === 'road')).toBe(true)
    expect(explicit.generatorProfile?.roadChance).toBe(100)
  })

  it('lays extra east-west roads when the road network mode is on', () => {
    const map = generateMap({
      ...settings,
      biome: 'temperate-grasslands',
      terrain: { woods: 0, water: 0, rough: 0 },
      river: false,
      symmetric: false,
      roadNetwork: true,
      seed: 'ROAD-NET',
    })
    const left = map.cells.filter((cell) => cell.col === 0 && cell.terrain === 'road')
    const right = map.cells.filter((cell) => cell.col === map.width - 1 && cell.terrain === 'road')
    expect(left.length).toBeGreaterThanOrEqual(2)
    expect(right.length).toBeGreaterThanOrEqual(2)
    expect(countRoadComponents(map)).toBeGreaterThanOrEqual(2)
    expect(map.generatorProfile?.roadNetwork).toBe(true)
  })

  it('sometimes skips the countryside road when chance is below 100', () => {
    let withRoad = 0
    let without = 0
    for (let index = 0; index < 40; index += 1) {
      const map = generateMap({
        ...settings,
        seed: `ROAD-CHANCE-${index}`,
        roadChance: 50,
        river: false,
        symmetric: false,
      })
      if (map.cells.some((cell) => cell.terrain === 'road')) withRoad += 1
      else without += 1
    }
    expect(withRoad).toBeGreaterThan(0)
    expect(without).toBeGreaterThan(0)
  })

  it('does not add a countryside road on biomes that never generate one', () => {
    const map = generateMap({
      ...settings,
      biome: 'hot-desert',
      roadChance: 100,
      river: false,
    })
    expect(map.cells.every((cell) => cell.terrain !== 'road')).toBe(true)
  })
})
