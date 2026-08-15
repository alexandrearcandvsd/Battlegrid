import { describe, expect, it } from 'vitest'
import type { BuildingRotation } from '../types/building'
import type { GeneratorSettings } from '../types/map'
import {
  BUILDING_TYPES,
  BUILDING_TYPE_IDS,
  buildingAt,
  buildingAlignsWithRoad,
  buildingCells,
  buildingFacesRoad,
  canPlaceBuilding,
  rotationsAlongRoad,
} from './buildings'
import {
  deleteBuilding,
  duplicateBuilding,
  moveBuilding,
  rotateBuilding,
  applyBuildingImageToType,
  setBuildingImage,
  setBuildingLabel,
  setBuildingState,
  stampBuilding,
} from './buildingCommands'
import { generateMap } from './generator'
import { hexDistance } from './hex'

const settings: GeneratorSettings = {
  biome: 'temperate-grasslands',
  width: 10,
  height: 8,
  seed: 'BUILD-TEST',
  terrain: { woods: 0, water: 0, rough: 0 },
  elevation: 0,
  symmetric: false,
  river: false,
}

const openMap = () => {
  const map = generateMap(settings)
  return {
    ...map,
    cells: map.cells.map((cell) =>
      cell.terrain === 'road' ? { ...cell, terrain: 'clear' as const } : cell,
    ),
  }
}

describe('building footprints', () => {
  it('keeps every footprint unique and connected through all rotations', () => {
    for (const type of BUILDING_TYPE_IDS) {
      const { footprint } = BUILDING_TYPES[type]
      for (let step = 0; step < 6; step += 1) {
        const cells = buildingCells({
          id: 'test',
          type,
          anchor: { col: 5, row: 4 },
          rotation: step as BuildingRotation,
          state: 'intact',
        })
        expect(cells).toHaveLength(footprint.length)
        expect(new Set(cells.map((cell) => `${cell.col}:${cell.row}`)).size).toBe(cells.length)
        for (const cell of cells) {
          const touches =
            cells.length === 1 ||
            cells.some(
              (other) =>
                (other.col !== cell.col || other.row !== cell.row) &&
                hexDistance(cell, other) === 1,
            )
          expect(touches, `${type} rotation ${step} at ${cell.col},${cell.row}`).toBe(true)
        }
      }
    }
  })

  it('places and rotates multi-hex structures around the selected hex', () => {
    const map = stampBuilding(openMap(), 'factory', { col: 5, row: 4 })
    const placed = map.buildings[0]
    const cells = buildingCells(placed)
    expect(placed.anchor).toEqual({ col: 5, row: 4 })
    expect(cells.some((cell) => cell.col === 5 && cell.row === 4)).toBe(true)
    const meanCol = cells.reduce((sum, cell) => sum + cell.col, 0) / cells.length
    const meanRow = cells.reduce((sum, cell) => sum + cell.row, 0) / cells.length
    expect(Math.hypot(meanCol - 5, meanRow - 4)).toBeLessThan(0.8)

    const rotated = rotateBuilding(map, placed.id)
    expect(rotated.buildings[0].anchor).toEqual({ col: 5, row: 4 })
    expect(rotated.buildings[0].rotation).toBe(1)
    const spun = buildingCells(rotated.buildings[0])
    const spunCol = spun.reduce((sum, cell) => sum + cell.col, 0) / spun.length
    const spunRow = spun.reduce((sum, cell) => sum + cell.row, 0) / spun.length
    expect(Math.hypot(spunCol - 5, spunRow - 4)).toBeLessThan(0.8)
  })
})

describe('placement rules', () => {
  it('rejects water for structures but welcomes it for bridges', () => {
    const map = {
      ...openMap(),
      cells: openMap().cells.map((cell) =>
        cell.col === 2 && cell.row === 2 ? { ...cell, terrain: 'water' as const } : cell,
      ),
    }
    expect(canPlaceBuilding(map, 'house', { col: 2, row: 2 }, 0)).toBe(false)
    expect(canPlaceBuilding(map, 'bridge', { col: 2, row: 2 }, 0)).toBe(true)
    expect(canPlaceBuilding(map, 'bridge', { col: 6, row: 6 }, 0)).toBe(false)
    const paved = {
      ...openMap(),
      cells: openMap().cells.map((cell) =>
        cell.col === 3 && cell.row === 3 ? { ...cell, terrain: 'road' as const } : cell,
      ),
    }
    expect(canPlaceBuilding(paved, 'house', { col: 3, row: 3 }, 0)).toBe(false)
    expect(canPlaceBuilding(paved, 'house', { col: 4, row: 3 }, 0)).toBe(true)
  })

  it('rejects overlapping structures and out-of-bounds anchors', () => {
    const withHouse = stampBuilding(openMap(), 'house', { col: 3, row: 3 })
    expect(canPlaceBuilding(withHouse, 'house', { col: 3, row: 3 }, 0)).toBe(false)
    expect(canPlaceBuilding(withHouse, 'factory', { col: 9, row: 7 }, 0)).toBe(false)
    expect(canPlaceBuilding(withHouse, 'apartment', { col: 5, row: 5 }, 0)).toBe(true)
  })

  it('accepts the BattleTech structure types on open ground', () => {
    const map = openMap()
    for (const type of [
      'officeTower',
      'mechHangar',
      'bunker',
      'commandHQ',
      'fuelDepot',
      'dropShipPad',
      'hospital',
      'government',
      'barracks',
      'vehicleGarage',
      'repairBay',
      'powerPlant',
      'railStation',
      'waterTower',
      'hpgStation',
      'castleBrian',
      'starLeagueBunker',
    ] as const) {
      expect(canPlaceBuilding(map, type, { col: 4, row: 4 }, 0), type).toBe(true)
    }
  })

  it('gives every structure a construction type', () => {
    for (const type of BUILDING_TYPE_IDS) {
      expect(['light', 'medium', 'heavy', 'hardened', 'fortified']).toContain(
        BUILDING_TYPES[type].constructionType,
      )
    }
  })

  it('picks the rotation whose door opens onto the street', () => {
    const withWestRoad = {
      ...openMap(),
      cells: openMap().cells.map((cell) =>
        cell.col === 2 && cell.row === 3 ? { ...cell, terrain: 'road' as const } : cell,
      ),
    }
    const house = {
      id: 'h',
      type: 'house' as const,
      anchor: { col: 3, row: 3 },
      rotation: 0 as const,
      state: 'intact' as const,
    }
    expect(rotationsAlongRoad(withWestRoad, 'house', house.anchor)[0]).toBe(0)
    expect(buildingFacesRoad(withWestRoad, house)).toBe(true)
    expect(buildingFacesRoad(withWestRoad, { ...house, rotation: 1 })).toBe(false)

    const withEastRoad = {
      ...openMap(),
      cells: openMap().cells.map((cell) =>
        cell.col === 4 && cell.row === 3 ? { ...cell, terrain: 'road' as const } : cell,
      ),
    }
    expect(rotationsAlongRoad(withEastRoad, 'house', house.anchor)[0]).toBe(3)
    expect(buildingFacesRoad(withEastRoad, { ...house, rotation: 3 })).toBe(true)
  })

  it('keeps a house parallel to an east-west street on the next row', () => {
    const street = {
      ...openMap(),
      cells: openMap().cells.map((cell) => ({
        ...cell,
        terrain:
          cell.row === 3 && cell.col >= 1 && cell.col <= 5 ? ('road' as const) : ('clear' as const),
      })),
    }
    const house = {
      id: 'h',
      type: 'house' as const,
      anchor: { col: 3, row: 2 },
      rotation: 0 as const,
      state: 'intact' as const,
    }
    const facing = rotationsAlongRoad(street, 'house', house.anchor)
    expect(facing.length).toBeGreaterThan(0)
    expect(facing[0] % 3).toBe(0)
    expect(buildingAlignsWithRoad(street, { ...house, rotation: facing[0] })).toBe(true)
    expect(buildingAlignsWithRoad(street, { ...house, rotation: 1 })).toBe(false)
  })

  it('fronts the through street at an intersection instead of the crossing', () => {
    const map = {
      ...openMap(),
      cells: openMap().cells.map((cell) => {
        const eastWest = cell.row === 4 && cell.col >= 1 && cell.col <= 8
        const diagonal =
          (cell.col === 2 && (cell.row === 2 || cell.row === 3)) ||
          (cell.col === 3 && (cell.row === 4 || cell.row === 5))
        return { ...cell, terrain: eastWest || diagonal ? ('road' as const) : ('clear' as const) }
      }),
    }
    const lot = { col: 4, row: 3 }
    const facing = rotationsAlongRoad(map, 'house', lot)
    expect(facing.length).toBeGreaterThan(0)
    expect(facing[0] % 3).toBe(0)
    expect(facing[0]).toBe(0)
    expect(
      buildingAlignsWithRoad(map, {
        id: 'h',
        type: 'house',
        anchor: lot,
        rotation: 1,
        state: 'intact',
      }),
    ).toBe(false)
  })
})

describe('building commands', () => {
  it('stamps, moves, rotates, duplicates, and deletes structures', () => {
    let map = openMap()
    map = stampBuilding(map, 'house', { col: 3, row: 3 })
    expect(map.buildings).toHaveLength(1)
    const id = map.buildings[0].id
    expect(buildingAt(map, { col: 3, row: 3 })?.id).toBe(id)

    map = moveBuilding(map, id, { col: 6, row: 5 })
    expect(map.buildings[0].anchor).toEqual({ col: 6, row: 5 })
    const rejected = moveBuilding(map, id, { col: -4, row: 0 })
    expect(rejected).toBe(map)

    map = rotateBuilding(map, id)
    expect(map.buildings[0].rotation).toBe(1)

    map = duplicateBuilding(map, id)
    expect(map.buildings).toHaveLength(2)
    expect(map.buildings[1].id).not.toBe(id)
    expect(map.buildings[1].anchor).not.toEqual(map.buildings[0].anchor)

    map = deleteBuilding(map, map.buildings[1].id)
    map = deleteBuilding(map, id)
    expect(map.buildings).toHaveLength(0)
  })

  it('rotates multi-hex footprints around the center and blocks invalid rotations', () => {
    let map = openMap()
    map = stampBuilding(map, 'warehouse', { col: 8, row: 6 })
    const id = map.buildings[0].id
    const rotated = rotateBuilding(map, id)
    // Rotation 1 pushes the footprint out of bounds on this edge anchor or not;
    // either way the map must stay consistent.
    if (rotated === map) {
      expect(map.buildings[0].rotation).toBe(0)
    } else {
      expect(rotated.buildings[0].rotation).toBe(1)
      expect(
        canPlaceBuilding(
          rotated,
          'warehouse',
          rotated.buildings[0].anchor,
          rotated.buildings[0].rotation,
          id,
        ),
      ).toBe(true)
    }
  })

  it('sets state and labels', () => {
    let map = stampBuilding(openMap(), 'commTower', { col: 4, row: 4 })
    const id = map.buildings[0].id
    map = setBuildingState(map, id, 'burning')
    expect(map.buildings[0].state).toBe('burning')
    map = setBuildingState(map, id, 'rubble')
    expect(map.buildings[0].state).toBe('rubble')
    map = setBuildingLabel(map, id, '  Relay One  ')
    expect(map.buildings[0].label).toBe('Relay One')
    map = setBuildingLabel(map, id, '   ')
    expect(map.buildings[0].label).toBeUndefined()
  })

  it('replaces a structure graphic and copies it onto new stamps of that type', () => {
    const image =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    let map = stampBuilding(openMap(), 'house', { col: 3, row: 3 })
    const first = map.buildings[0].id
    map = stampBuilding(map, 'house', { col: 6, row: 5 })
    const second = map.buildings[1].id
    map = setBuildingImage(map, first, image, true)
    expect(map.buildings[0].image).toBe(image)
    expect(map.buildings[1].image).toBeUndefined()
    expect(map.buildingArt?.house).toBe(image)

    map = applyBuildingImageToType(map, 'house', image)
    expect(map.buildings[1].image).toBe(image)

    const lot = map.cells.find((cell) => canPlaceBuilding(map, 'house', cell, 0))!
    map = stampBuilding(map, 'house', { col: lot.col, row: lot.row })
    expect(map.buildings[2].image).toBe(image)

    const copy = duplicateBuilding(map, first)
    expect(copy.buildings[3].image).toBe(image)

    map = setBuildingImage(map, second, undefined)
    expect(map.buildings[1].image).toBeUndefined()
    expect(map.buildingArt?.house).toBe(image)

    map = applyBuildingImageToType(map, 'house', undefined)
    expect(map.buildings.every((building) => !building.image)).toBe(true)
    expect(map.buildingArt?.house).toBeUndefined()
  })
})
