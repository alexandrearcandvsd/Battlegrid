// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { generateMap } from './generator'
import {
  loadMapLocally,
  MAP_BACKUP_KEY,
  MAP_BROKEN_KEY,
  MAP_STORAGE_KEY,
  parseMap,
  parseMapWithWarnings,
  safeFilename,
  saveMapLocally,
  serializeMap,
} from './serialization'

const map = generateMap({
  biome: 'temperate-grasslands',
  width: 8,
  height: 8,
  seed: 'JSON-TEST',
  terrain: { woods: 20, water: 10, rough: 20 },
  elevation: 2,
  symmetric: true,
  river: true,
})

describe('map serialization', () => {
  it('round-trips map files without data loss', () => {
    expect(parseMap(serializeMap(map))).toEqual(map)
  })

  it('migrates v1 map files to v2 with an empty building list', () => {
    const v1 = {
      version: 1,
      name: 'Legacy Map',
      width: map.width,
      height: map.height,
      seed: map.seed,
      cells: map.cells,
      updatedAt: map.updatedAt,
    }
    const parsed = parseMap(JSON.stringify(v1))
    expect(parsed.version).toBe(2)
    expect(parsed.buildings).toEqual([])
    expect(parsed.biome).toBe('temperate-grasslands')
  })

  it('round-trips a custom building graphic and type default', () => {
    const image =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    const withArt = {
      ...map,
      buildingArt: { house: image },
      buildings: [
        {
          id: 'bldg-art',
          type: 'house' as const,
          anchor: { col: 2, row: 2 },
          rotation: 0 as const,
          state: 'intact' as const,
          image,
        },
      ],
    }
    expect(parseMap(serializeMap(withArt))).toEqual(withArt)
  })

  it('keeps a building when its graphic is invalid', () => {
    const parsed = parseMapWithWarnings(
      JSON.stringify({
        ...map,
        buildingArt: { house: 'javascript:alert(1)', castle: 'data:image/png;base64,AAAA' },
        buildings: [
          {
            id: 'ok',
            type: 'house',
            anchor: { col: 1, row: 1 },
            rotation: 0,
            state: 'intact',
            image: 'https://example.test/house.png',
          },
        ],
      }),
    )
    expect(parsed.map.buildings).toEqual([
      { id: 'ok', type: 'house', anchor: { col: 1, row: 1 }, rotation: 0, state: 'intact' },
    ])
    expect(parsed.map.buildingArt).toBeUndefined()
    expect(parsed.warnings.some((warning) => /graphic/i.test(warning))).toBe(true)
  })

  it('round-trips buildings through v2 files', () => {
    const withBuilding = {
      ...map,
      buildings: [
        {
          id: 'bldg-1',
          type: 'warehouse' as const,
          anchor: { col: 3, row: 3 },
          rotation: 2 as const,
          state: 'damaged' as const,
          label: 'Depot',
        },
      ],
    }
    expect(parseMap(serializeMap(withBuilding))).toEqual(withBuilding)
  })

  it('drops malformed buildings and keeps the rest of the map', () => {
    const badType = {
      ...map,
      buildings: [
        { id: 'x', type: 'castle', anchor: { col: 1, row: 1 }, rotation: 0, state: 'intact' },
        { id: 'ok', type: 'house', anchor: { col: 1, row: 1 }, rotation: 0, state: 'intact' },
      ],
    }
    expect(parseMap(JSON.stringify(badType)).buildings).toEqual([
      { id: 'ok', type: 'house', anchor: { col: 1, row: 1 }, rotation: 0, state: 'intact' },
    ])
    const duplicateIds = {
      ...map,
      buildings: [
        { id: 'x', type: 'house', anchor: { col: 1, row: 1 }, rotation: 0, state: 'intact' },
        { id: 'x', type: 'house', anchor: { col: 2, row: 2 }, rotation: 0, state: 'intact' },
      ],
    }
    expect(parseMap(JSON.stringify(duplicateIds)).buildings).toHaveLength(1)
  })

  it('migrates pre-biome map files to temperate grasslands', () => {
    const legacy = serializeMap(map).replace(/"biome": "temperate-grasslands",\n/, '')
    const parsed = parseMap(legacy)
    expect(parsed.biome).toBe('temperate-grasslands')
    expect(parsed.cells).toEqual(map.cells)
  })

  it('coerces unknown biomes to temperate grasslands', () => {
    const parsed = parseMap(JSON.stringify({ ...map, biome: 'planet-x' }))
    expect(parsed.biome).toBe('temperate-grasslands')
  })

  it('round-trips an optional colorway', () => {
    const tinted = { ...map, colorway: 'twilight' as const }
    expect(parseMap(serializeMap(tinted))).toEqual(tinted)
  })

  it('drops an unknown colorway', () => {
    const parsed = parseMapWithWarnings(JSON.stringify({ ...map, colorway: 'neon' }))
    expect(parsed.map.colorway).toBeUndefined()
    expect(parsed.warnings.some((warning) => /colorway/i.test(warning))).toBe(true)
  })

  it('drops malformed generator profiles instead of rejecting the file', () => {
    const parsed = parseMap(JSON.stringify({ ...map, generatorProfile: { woods: 'lots' } }))
    expect(parsed.generatorProfile).toBeUndefined()
  })

  it('preserves biome and generator profile through a round-trip', () => {
    const desert = { ...map, biome: 'hot-desert' as const }
    expect(parseMap(serializeMap(desert))).toEqual(desert)
  })

  it('round-trips lava terrain and cell features', () => {
    const withContent = {
      ...map,
      cells: map.cells.map((cell, index) =>
        index === 0 ? { ...cell, terrain: 'lava' as const, feature: 'crater' as const } : cell,
      ),
    }
    expect(parseMap(serializeMap(withContent))).toEqual(withContent)
  })

  it('strips unknown feature flags and skins instead of rejecting the map', () => {
    const invalid = {
      ...map,
      cells: map.cells.map((cell, index) =>
        index === 0 ? { ...cell, feature: 'minefield', skin: 'planet-x:water' } : cell,
      ),
    }
    const parsed = parseMap(JSON.stringify(invalid))
    expect(parsed.cells[0].feature).toBeUndefined()
    expect(parsed.cells[0].skin).toBeUndefined()
  })

  it('round-trips biome variant skins and rejects unknown ones', () => {
    const skinned = {
      ...map,
      cells: map.cells.map((cell, index) =>
        index === 0 ? { ...cell, terrain: 'water' as const, skin: 'hot-desert:water' } : cell,
      ),
    }
    expect(parseMap(serializeMap(skinned))).toEqual(skinned)

    const invalid = {
      ...map,
      cells: map.cells.map((cell, index) =>
        index === 0 ? { ...cell, skin: 'planet-x:water' } : cell,
      ),
    }
    expect(parseMap(JSON.stringify(invalid)).cells[0].skin).toBeUndefined()
  })

  it('rejects incomplete or corrupted maps', () => {
    expect(() => parseMap('{"version":1,"name":"broken"}')).toThrow(/invalid format/)
    expect(() =>
      parseMap(JSON.stringify({ ...map, cells: [{ ...map.cells[0], terrain: 'lava' }] })),
    ).toThrow(/invalid format|invalid hex/)
  })

  it('creates filesystem-safe names', () => {
    expect(safeFilename(' Operation: Iron Mesa  ')).toBe('operation-iron-mesa')
    expect(safeFilename('***')).toBe('untitled-map')
  })

  it('opens newer format versions with the v2 reader', () => {
    const { map: parsed, warnings } = parseMapWithWarnings(JSON.stringify({ ...map, version: 3 }))
    expect(parsed.version).toBe(2)
    expect(warnings.some((warning) => /v3/.test(warning))).toBe(true)
  })

  it('restores the last good autosave when the current copy is corrupt', () => {
    localStorage.clear()
    saveMapLocally(map)
    saveMapLocally({ ...map, name: 'Later Draft' })
    localStorage.setItem(MAP_STORAGE_KEY, '{not-json')
    const restored = loadMapLocally()
    expect(restored?.name).toBe(map.name)
    expect(localStorage.getItem(MAP_BROKEN_KEY)).toBe('{not-json')
    expect(localStorage.getItem(MAP_BACKUP_KEY)).toContain('JSON-TEST')
  })
})
