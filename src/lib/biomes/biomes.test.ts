import { describe, expect, it } from 'vitest'
import type { BiomeId } from '../../types/biome'
import type { GeneratorSettings } from '../../types/map'
import { BUILDING_TYPES, buildingAlignsWithRoad, buildingCells, canPlaceBuilding } from '../buildings'
import { generateMap } from '../generator'
import { cellsWithinRadius, edgeNeighbor, hexDistance, neighborHexes } from '../hex'
import {
  BIOME_IDS,
  DEFAULT_BIOME_ID,
  getBiome,
  isBiomeId,
  listBiomes,
  resolveBiome,
  resolveBiomeId,
} from './index'

function settingsFor(biome: BiomeId, seed = 'BIOME-TEST'): GeneratorSettings {
  const defaults = getBiome(biome).generation.defaults
  return {
    biome,
    width: 14,
    height: 10,
    seed,
    terrain: { woods: defaults.woods, water: defaults.water, rough: defaults.rough },
    elevation: defaults.elevation,
    symmetric: true,
    river: true,
  }
}

describe('biome registry', () => {
  it('exposes every declared biome id', () => {
    expect(BIOME_IDS).toEqual([
      'temperate-grasslands',
      'dense-forest',
      'hot-desert',
      'alpine-mountains',
      'wetlands',
      'volcanic',
      'urban',
      'lunar',
      'agricultural',
      'industrial-wasteland',
      'arctic-tundra',
      'badlands',
      'tropical-jungle',
      'coastal',
      'mediterranean-scrub',
      'oceanic-archipelago',
      'boreal-taiga',
      'tropical-savanna',
      'temperate-rainforest',
      'mangrove-estuary',
      'glacial-icefield',
      'karst-highlands',
      'alkali-salt-flats',
      'fjord-shore',
      'open-pit-extraction',
      'ice-moon',
      'canyon-road',
      'martian',
      'alien-fungal',
      'crystal-world',
    ])
    expect(listBiomes().map((biome) => biome.id)).toEqual(BIOME_IDS)
    expect(isBiomeId('hot-desert')).toBe(true)
    expect(isBiomeId('martian')).toBe(true)
    expect(isBiomeId('alien-fungal')).toBe(true)
    expect(isBiomeId('crystal-world')).toBe(true)
    expect(isBiomeId('not-a-biome')).toBe(false)
  })

  it('resolves missing or unknown biomes to the default', () => {
    expect(resolveBiomeId({})).toBe(DEFAULT_BIOME_ID)
    expect(resolveBiomeId({ biome: 'not-a-biome' })).toBe(DEFAULT_BIOME_ID)
    expect(resolveBiome({ biome: 'dense-forest' }).label).toBe('Dense Forest')
  })

  it('provides a full palette and namespaced texture refs', () => {
    for (const biome of listBiomes()) {
      expect(Object.keys(biome.palette)).toHaveLength(7)
      expect(biome.textureRef('lava')).toContain('texture-lava')
      expect(biome.elevation.ramp).toHaveLength(4)
      expect(biome.road.band).toBeTruthy()
      expect(biome.road.centerline).toBeTruthy()
    }
  })

  it('gives every biome a visually distinct lava treatment', () => {
    const colors = listBiomes().map((biome) => biome.palette.lava.color)
    const labels = listBiomes().map((biome) => biome.palette.lava.label)
    expect(new Set(colors).size).toBe(colors.length)
    expect(new Set(labels).size).toBe(labels.length)
  })
})

describe.each(BIOME_IDS)('biome %s', (biome) => {
  it('is deterministic for a seed and settings', () => {
    const settings = settingsFor(biome)
    expect(generateMap(settings).cells).toEqual(generateMap(settings).cells)
  })

  it('changes the generated cells when the seed changes', () => {
    const first = generateMap(settingsFor(biome))
    const second = generateMap(settingsFor(biome, 'OTHER-SEED'))
    expect(first.cells).not.toEqual(second.cells)
  })

  it('keeps water at elevation zero', () => {
    const map = generateMap(settingsFor(biome))
    expect(
      map.cells.every((cell) => cell.terrain !== 'water' || cell.elevation === 0),
    ).toBe(true)
  })

  it('stamps the biome and generator profile on the map', () => {
    const settings = settingsFor(biome)
    const map = generateMap(settings)
    expect(map.biome).toBe(biome)
    expect(map.generatorProfile).toEqual({
      ...settings.terrain,
      elevation: settings.elevation,
      symmetric: settings.symmetric,
      river: settings.river,
      roadChance: settings.roadChance ?? 100,
    })
    // Generation never assigns biome-reskin skins; the only generated skin is
    // the rail network skin (road terrain, editor-visible).
    expect(
      map.cells.every((cell) => cell.skin === undefined || cell.skin === 'rail'),
    ).toBe(true)
  })
})

describe('biome character', () => {
  it('grows denser forest than temperate grasslands for the same seed', () => {
    const seed = 'FOREST-COMPARE'
    const temperate = generateMap(settingsFor('temperate-grasslands', seed))
    const forest = generateMap(settingsFor('dense-forest', seed))
    const wooded = (map: typeof temperate) =>
      map.cells.filter((cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods')
        .length
    expect(wooded(forest)).toBeGreaterThan(wooded(temperate))
  })

  it('keeps the hot desert dry and free of generated roads', () => {
    const map = generateMap(settingsFor('hot-desert'))
    expect(map.cells.some((cell) => cell.terrain === 'road')).toBe(false)
    const water = map.cells.filter((cell) => cell.terrain === 'water').length
    expect(water / map.cells.length).toBeLessThan(0.1)
  })

  it('carves lava flows and places craters on volcanic maps', () => {
    const map = generateMap(settingsFor('volcanic'))
    expect(map.cells.some((cell) => cell.terrain === 'lava')).toBe(true)
    expect(map.cells.some((cell) => cell.feature === 'crater')).toBe(true)
  })

  it('never generates water on volcanic maps, even at high water weight', () => {
    const settings = settingsFor('volcanic')
    settings.terrain = { ...settings.terrain, water: 45 }
    const map = generateMap(settings)
    expect(map.cells.some((cell) => cell.terrain === 'water')).toBe(false)
    expect(map.cells.some((cell) => cell.terrain === 'lava')).toBe(true)
  })

  it('carves at least one full-width water channel on wetlands maps', () => {
    const map = generateMap(settingsFor('wetlands'))
    const water = new Set(
      map.cells.filter((cell) => cell.terrain === 'water').map((cell) => `${cell.col}:${cell.row}`),
    )
    expect(water.size).toBeGreaterThan(0)
    const starts = map.cells.filter((cell) => cell.col === 0 && water.has(`0:${cell.row}`))
    const visited = new Set<string>()
    const queue = starts.map((cell) => ({ col: cell.col, row: cell.row }))
    while (queue.length > 0) {
      const current = queue.pop()!
      const key = `${current.col}:${current.row}`
      if (visited.has(key) || !water.has(key)) continue
      visited.add(key)
      for (const next of cellsWithinRadius(current, 1, map.width, map.height)) {
        queue.push(next)
      }
    }
    expect([...visited].some((key) => key.startsWith(`${map.width - 1}:`))).toBe(true)
  })

  it('raises alpine maps to snow-line heights and drops scree at the cliffs', () => {
    const map = generateMap(settingsFor('alpine-mountains'))
    const snowLine = getBiome('alpine-mountains').snowLine
    expect(snowLine).toBeDefined()
    expect(map.cells.some((cell) => cell.elevation >= snowLine!.level)).toBe(true)
    expect(map.cells.some((cell) => cell.feature === 'scree')).toBe(true)
  })

  it('keeps east-west streets and rails from sitting on adjacent rows', () => {
    const maps = [
      generateMap({ ...settingsFor('urban', 'GAP-CITY'), urbanPreset: 'city-center' }),
      generateMap(settingsFor('industrial-wasteland', 'GAP-IND')),
      generateMap({ ...settingsFor('urban', 'GAP-CITY-2'), urbanPreset: 'city-center' }),
    ]
    for (const map of maps) {
      const routeRows = Array.from({ length: map.height }, (_, row) => {
        const routes = map.cells.filter((cell) => cell.row === row && cell.terrain === 'road')
        return routes.length >= map.width * 0.5 ? row : -1
      }).filter((row) => row >= 0)
      expect(routeRows.length, `${map.biome} ${map.seed}`).toBeGreaterThan(0)
      for (let index = 1; index < routeRows.length; index += 1) {
        expect(
          routeRows[index] - routeRows[index - 1],
          `${map.biome} ${map.seed} rows ${routeRows[index - 1]} and ${routeRows[index]}`,
        ).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('runs north-south streets along one hex diagonal instead of a zigzag column', () => {
    const maps = [
      generateMap({ ...settingsFor('urban', 'DIAG-CITY'), urbanPreset: 'city-center' }),
      generateMap(settingsFor('industrial-wasteland', 'DIAG-IND')),
    ]
    for (const map of maps) {
      const fullColumns = Array.from({ length: map.width }, (_, col) =>
        Array.from({ length: map.height }, (__, row) => map.cells[row * map.width + col]).every(
          (cell) => cell.terrain === 'road',
        ),
      ).filter(Boolean)
      expect(fullColumns, `${map.biome} same-column avenue`).toHaveLength(0)

      const diagonalThrough = map.cells.some((cell) => {
        if (cell.terrain !== 'road') return false
        const edges = [0, 1, 2, 3, 4, 5].filter((edge) => {
          const next = edgeNeighbor(cell.col, cell.row, edge)
          if (next.col < 0 || next.row < 0 || next.col >= map.width || next.row >= map.height) {
            return false
          }
          return map.cells[next.row * map.width + next.col].terrain === 'road'
        })
        return (
          (edges.includes(1) && edges.includes(4)) || (edges.includes(2) && edges.includes(5))
        )
      })
      expect(diagonalThrough, `${map.biome} diagonal avenue`).toBe(true)
    }
  })

  it('keeps the rail line from replacing street hexes', () => {
    const map = generateMap({ ...settingsFor('urban', 'RAIL-SEP'), urbanPreset: 'city-center' })
    const rails = map.cells.filter((cell) => cell.skin === 'rail')
    expect(rails.length).toBeGreaterThan(0)
    const railRows = new Set(rails.map((cell) => cell.row))
    const streets = map.cells.filter((cell) => cell.terrain === 'road' && cell.skin !== 'rail')
    expect(streets.length).toBeGreaterThan(0)
    expect(streets.some((cell) => railRows.has(cell.row))).toBe(true)
  })

  it('builds urban maps with streets, a rail line, and legally placed buildings', () => {
    const map = generateMap(settingsFor('urban'))
    const roads = map.cells.filter((cell) => cell.terrain === 'road')
    // A street grid plus a rail line covers well beyond a single crossing.
    expect(roads.length).toBeGreaterThan(map.width * 2)
    expect(map.cells.some((cell) => cell.skin === 'rail')).toBe(true)
    expect(map.cells.some((cell) => cell.terrain === 'road' && cell.skin !== 'rail')).toBe(true)
    expect(map.buildings.length).toBeGreaterThan(0)
    for (const building of map.buildings) {
      expect(
        canPlaceBuilding(map, building.type, building.anchor, building.rotation, building.id),
      ).toBe(true)
    }
  })

  it('keeps generated buildings separated and densest at the center', () => {
    const map = generateMap(settingsFor('urban'))
    const placed = map.buildings.filter((building) => building.type !== 'bridge')
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const minDistance = Math.min(
          ...buildingCells(placed[i]).flatMap((a) =>
            buildingCells(placed[j]).map((b) => hexDistance(a, b)),
          ),
        )
        expect(minDistance).toBeGreaterThan(1)
      }
    }
    const centerCol = (map.width - 1) / 2
    const centerRow = (map.height - 1) / 2
    const distance = (cell: { col: number; row: number }) =>
      Math.hypot(cell.col - centerCol, cell.row - centerRow)
    const mean =
      placed.reduce((sum, building) => sum + distance(building.anchor), 0) / placed.length
    expect(placed.length).toBeGreaterThan(0)
    expect(mean).toBeLessThan(Math.hypot(centerCol, centerRow) * 0.85)
  })

  it('pits lunar maps with impact craters and almost no vegetation', () => {
    const map = generateMap(settingsFor('lunar'))
    expect(map.cells.some((cell) => cell.feature === 'crater')).toBe(true)
    const wooded = map.cells.filter(
      (cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods',
    ).length
    expect(wooded / map.cells.length).toBeLessThan(0.2)
  })

  it('grows orchards, irrigation, a dirt road, and farmsteads on agricultural maps', () => {
    const map = generateMap(settingsFor('agricultural'))
    expect(map.cells.some((cell) => cell.terrain === 'woods')).toBe(true)
    expect(map.cells.some((cell) => cell.terrain === 'water')).toBe(true)
    expect(map.cells.some((cell) => cell.terrain === 'road')).toBe(true)
    expect(map.buildings.length).toBeGreaterThan(0)
    expect(map.buildings.every((building) => building.type === 'house' || building.type === 'warehouse')).toBe(
      true,
    )
  })

  it('sits generated buildings beside the street, parallel to it', () => {
    const maps = [
      generateMap({ ...settingsFor('urban', 'FACE-CITY'), urbanPreset: 'city-center' }),
      generateMap(settingsFor('industrial-wasteland', 'FACE-IND')),
      generateMap(settingsFor('agricultural', 'FACE-FARM')),
    ]
    const placed = maps.flatMap((map) =>
      map.buildings
        .filter((building) => building.type !== 'bridge')
        .map((building) => ({ map, building })),
    )
    expect(placed.length).toBeGreaterThan(0)
    for (const { map, building } of placed) {
      const label = `${building.type} at ${building.anchor.col},${building.anchor.row}`
      expect(buildingAlignsWithRoad(map, building), label).toBe(true)
      expect(
        buildingCells(building).some(
          (cell) => map.cells[cell.row * map.width + cell.col]?.terrain === 'road',
        ),
        label,
      ).toBe(false)
    }
    const withDoors = placed.filter(
      ({ building }) => BUILDING_TYPES[building.type].entrances.length > 0,
    )
    expect(withDoors.length).toBeGreaterThan(0)
  })

  it('builds industrial wasteland with service roads and factories', () => {
    const map = generateMap(settingsFor('industrial-wasteland'))
    expect(map.cells.filter((cell) => cell.terrain === 'road').length).toBeGreaterThan(map.width)
    expect(map.buildings.length).toBeGreaterThan(0)
    expect(
      map.buildings.some((building) =>
        ['factory', 'warehouse', 'powerPlant', 'fuelDepot'].includes(building.type),
      ),
    ).toBe(true)
  })

  it('scatters rubble and damaged structures on post-apocalyptic ruins', () => {
    const map = generateMap({ ...settingsFor('urban'), urbanPreset: 'ruins' })
    expect(map.buildings.some((building) => building.state !== 'intact')).toBe(true)
    expect(map.cells.filter((cell) => cell.terrain === 'rough').length).toBeGreaterThan(0)
  })

  it('stocks districts with hospitals, barracks, and power plants', () => {
    const types = new Set(
      [
        generateMap({ ...settingsFor('urban', 'CITY-HOSP'), urbanPreset: 'city-center' }),
        generateMap(settingsFor('industrial-wasteland', 'IND-POWER')),
        generateMap({ ...settingsFor('urban', 'BASE-BARR'), urbanPreset: 'base' }),
      ].flatMap((map) => map.buildings.map((building) => building.type)),
    )
    expect(types.has('hospital') || types.has('government')).toBe(true)
    expect(types.has('barracks') || types.has('vehicleGarage') || types.has('repairBay')).toBe(true)
    expect(types.has('powerPlant') || types.has('railStation') || types.has('waterTower')).toBe(true)
  })

  it('raises wall marks around urban blocks', () => {
    const map = generateMap({ ...settingsFor('urban', 'WALL-TEST'), urbanPreset: 'city-center' })
    expect(map.cells.some((cell) => cell.feature === 'wall')).toBe(true)
  })

  it('freezes tundra water as ice and opens crevasses', () => {
    const map = generateMap(settingsFor('arctic-tundra'))
    const snowLine = getBiome('arctic-tundra').snowLine
    expect(snowLine).toBeDefined()
    expect(map.cells.some((cell) => cell.elevation >= snowLine!.level)).toBe(true)
    expect(map.cells.some((cell) => cell.feature === 'ice')).toBe(true)
    expect(map.cells.some((cell) => cell.feature === 'crevasse')).toBe(true)
    const wooded = map.cells.filter(
      (cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods',
    ).length
    expect(wooded / map.cells.length).toBeLessThan(0.25)
  })

  it('cuts dry washes through eroded badlands', () => {
    const map = generateMap(settingsFor('badlands'))
    expect(map.cells.some((cell) => cell.feature === 'dryWash')).toBe(true)
    const rough = map.cells.filter((cell) => cell.terrain === 'rough').length
    const wooded = map.cells.filter(
      (cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods',
    ).length
    expect(rough).toBeGreaterThan(wooded)
  })

  it('opens canopy gaps in tropical jungle', () => {
    const map = generateMap(settingsFor('tropical-jungle'))
    const wooded = map.cells.filter(
      (cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods',
    ).length
    expect(wooded / map.cells.length).toBeGreaterThan(0.3)
    expect(map.cells.some((cell) => cell.feature === 'canopyGap')).toBe(true)
    expect(map.cells.some((cell) => cell.terrain === 'water')).toBe(true)
  })

  it('builds a shoreline with beach and cliff marks', () => {
    const map = generateMap(settingsFor('coastal'))
    const edgeWater = map.cells.some(
      (cell) =>
        cell.terrain === 'water' &&
        (cell.col === 0 || cell.col === map.width - 1 || cell.row === 0 || cell.row === map.height - 1),
    )
    expect(edgeWater).toBe(true)
    expect(map.cells.some((cell) => cell.feature === 'beach')).toBe(true)
    expect(map.cells.some((cell) => cell.feature === 'cliff')).toBe(true)
  })

  it('grows more vegetation than desert, with gullies instead of oases', () => {
    const seed = 'SCRUB-COMPARE'
    const desert = generateMap(settingsFor('hot-desert', seed))
    const scrub = generateMap(settingsFor('mediterranean-scrub', seed))
    const wetlands = generateMap(settingsFor('wetlands', seed))
    const wooded = (map: typeof scrub) =>
      map.cells.filter((cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods').length
    const waterShare = (map: typeof scrub) =>
      map.cells.filter((cell) => cell.terrain === 'water').length / map.cells.length
    expect(wooded(scrub)).toBeGreaterThan(wooded(desert))
    expect(scrub.cells.some((cell) => cell.feature === 'dryWash')).toBe(true)
    expect(waterShare(scrub)).toBeLessThan(0.25)
    expect(waterShare(scrub)).toBeLessThan(waterShare(wetlands))
    expect(scrub.buildings).toHaveLength(0)
    expect(scrub.cells.filter((cell) => cell.terrain === 'rough').length).toBeGreaterThan(0)
  })

  it('scatters islands in open ocean with beaches and reefs', () => {
    const seed = 'ISLAND-COMPARE'
    const coastal = generateMap(settingsFor('coastal', seed))
    const archipelago = generateMap(settingsFor('oceanic-archipelago', seed))
    const waterShare = (map: typeof coastal) =>
      map.cells.filter((cell) => cell.terrain === 'water').length / map.cells.length
    expect(waterShare(archipelago)).toBeGreaterThan(0.4)
    expect(waterShare(archipelago)).toBeGreaterThan(waterShare(coastal))
    const interiorWater = archipelago.cells.filter(
      (cell) =>
        cell.terrain === 'water' &&
        cell.col > 1 &&
        cell.col < archipelago.width - 2 &&
        cell.row > 1 &&
        cell.row < archipelago.height - 2,
    )
    expect(interiorWater.length).toBeGreaterThan(0)
    const land = archipelago.cells.filter((cell) => cell.terrain !== 'water' && cell.terrain !== 'road')
    expect(land.length).toBeGreaterThan(0)
    expect(land.some((cell) => cell.elevation >= 2)).toBe(true)
    expect(archipelago.cells.some((cell) => cell.feature === 'beach')).toBe(true)
    expect(archipelago.cells.some((cell) => cell.feature === 'reef')).toBe(true)
  })

  it('grows denser taiga than tundra, with frozen ponds and a snow line', () => {
    const seed = 'TAIGA-COMPARE'
    const tundra = generateMap(settingsFor('arctic-tundra', seed))
    const taiga = generateMap(settingsFor('boreal-taiga', seed))
    const wooded = (map: typeof taiga) =>
      map.cells.filter((cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods').length
    expect(wooded(taiga)).toBeGreaterThan(wooded(tundra))
    expect(taiga.cells.some((cell) => cell.feature === 'ice')).toBe(true)
    expect(getBiome('boreal-taiga').snowLine).toBeDefined()
  })

  it('scatters savanna tree islands without reading as desert or grassland', () => {
    const seed = 'SAVANNA-COMPARE'
    const desert = generateMap(settingsFor('hot-desert', seed))
    const savanna = generateMap(settingsFor('tropical-savanna', seed))
    const grass = generateMap(settingsFor('temperate-grasslands', seed))
    const wooded = (map: typeof savanna) =>
      map.cells.filter((cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods').length
    expect(wooded(savanna)).toBeGreaterThan(wooded(desert))
    expect(wooded(savanna)).toBeLessThan(wooded(grass))
    expect(savanna.cells.some((cell) => cell.terrain === 'water')).toBe(true)
  })

  it('grows a wetter, gappier rainforest than dense forest', () => {
    const seed = 'RAIN-COMPARE'
    const forest = generateMap(settingsFor('dense-forest', seed))
    const rainforest = generateMap(settingsFor('temperate-rainforest', seed))
    const waterShare = (map: typeof forest) =>
      map.cells.filter((cell) => cell.terrain === 'water').length / map.cells.length
    expect(waterShare(rainforest)).toBeGreaterThan(waterShare(forest))
    expect(rainforest.cells.some((cell) => cell.feature === 'canopyGap')).toBe(true)
    expect(rainforest.cells.some((cell) => cell.elevation >= 2)).toBe(true)
  })

  it('stands mangrove woods in brackish water without a sandy beach', () => {
    const map = generateMap(settingsFor('mangrove-estuary', 'MANGROVE'))
    const waterShare =
      map.cells.filter((cell) => cell.terrain === 'water').length / map.cells.length
    expect(waterShare).toBeGreaterThan(0.25)
    const rooted = map.cells.filter(
      (cell) =>
        (cell.terrain === 'woods' || cell.terrain === 'heavyWoods') &&
        neighborHexes(cell.col, cell.row, map.width, map.height).some(
          (next) => map.cells[next.row * map.width + next.col]?.terrain === 'water',
        ),
    )
    expect(rooted.length).toBeGreaterThan(0)
    expect(map.cells.some((cell) => cell.feature === 'beach')).toBe(false)
  })

  it('covers glacial ground with ice instead of tundra scrub', () => {
    const seed = 'ICEFIELD-COMPARE'
    const tundra = generateMap(settingsFor('arctic-tundra', seed))
    const glacial = generateMap(settingsFor('glacial-icefield', seed))
    const wooded = (map: typeof glacial) =>
      map.cells.filter((cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods').length /
      map.cells.length
    const iceOnLand = glacial.cells.filter(
      (cell) => cell.feature === 'ice' && cell.terrain !== 'water',
    ).length
    expect(iceOnLand).toBeGreaterThan(glacial.cells.length * 0.15)
    expect(wooded(glacial)).toBeLessThan(0.12)
    expect(wooded(glacial)).toBeLessThan(wooded(tundra) + 0.05)
    expect(glacial.cells.some((cell) => cell.feature === 'crevasse')).toBe(true)
  })

  it('pits karst highlands with sinkholes, dry valleys, and cliffs', () => {
    const map = generateMap(settingsFor('karst-highlands'))
    expect(getBiome('karst-highlands').snowLine).toBeUndefined()
    expect(map.cells.some((cell) => cell.feature === 'crater')).toBe(true)
    expect(map.cells.some((cell) => cell.feature === 'dryWash')).toBe(true)
    expect(map.cells.some((cell) => cell.feature === 'cliff')).toBe(true)
    const rough = map.cells.filter((cell) => cell.terrain === 'rough').length
    const wooded = map.cells.filter(
      (cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods',
    ).length
    expect(rough).toBeGreaterThan(wooded)
  })

  it('keeps salt flats open, rimmed, and almost treeless', () => {
    const map = generateMap(settingsFor('alkali-salt-flats'))
    const wooded =
      map.cells.filter((cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods').length /
      map.cells.length
    expect(wooded).toBeLessThan(0.12)
    expect(map.cells.some((cell) => cell.elevation >= 2)).toBe(true)
    const interior = map.cells.filter(
      (cell) =>
        cell.col > 1 &&
        cell.col < map.width - 2 &&
        cell.row > 1 &&
        cell.row < map.height - 2 &&
        cell.terrain !== 'water' &&
        cell.terrain !== 'road',
    )
    const highInterior = interior.filter((cell) => cell.elevation >= 2)
    expect(highInterior.length / Math.max(1, interior.length)).toBeLessThan(0.3)
    expect(map.cells.some((cell) => cell.feature === 'crater')).toBe(false)
  })

  it('cuts fjord inlets with high walls instead of one ocean edge', () => {
    const map = generateMap(settingsFor('fjord-shore', 'FJORD'))
    const waterShare =
      map.cells.filter((cell) => cell.terrain === 'water').length / map.cells.length
    expect(waterShare).toBeLessThan(0.45)
    expect(
      map.cells.some(
        (cell) =>
          cell.terrain === 'water' &&
          cell.col > 1 &&
          cell.col < map.width - 2 &&
          cell.row > 1 &&
          cell.row < map.height - 2,
      ),
    ).toBe(true)
    expect(
      map.cells.some((cell) => {
        if (cell.terrain === 'water' || cell.elevation < 2) return false
        return neighborHexes(cell.col, cell.row, map.width, map.height).some(
          (next) => map.cells[next.row * map.width + next.col]?.terrain === 'water',
        )
      }),
    ).toBe(true)
    const edges = [
      map.cells.filter((cell) => cell.col === 0),
      map.cells.filter((cell) => cell.col === map.width - 1),
      map.cells.filter((cell) => cell.row === 0),
      map.cells.filter((cell) => cell.row === map.height - 1),
    ]
    expect(
      edges.some(
        (edge) =>
          edge.some((cell) => cell.terrain === 'water') &&
          edge.some((cell) => cell.terrain !== 'water' && cell.terrain !== 'road'),
      ),
    ).toBe(true)
  })

  it('excavates a flooded open pit with terraced benches', () => {
    const map = generateMap(settingsFor('open-pit-extraction'))
    const center = {
      col: Math.floor((map.width - 1) / 2),
      row: Math.floor((map.height - 1) / 2),
    }
    const pitWater = map.cells.filter(
      (cell) => cell.terrain === 'water' && hexDistance(cell, center) <= 3,
    )
    expect(pitWater.length).toBeGreaterThan(0)
    expect(map.cells.some((cell) => cell.elevation >= 3)).toBe(true)
    expect(map.buildings.length).toBeLessThan(3)
  })

  it('fractures an ice moon with ground ice, crevasses, and craters', () => {
    const lunar = generateMap(settingsFor('lunar', 'MOON-COMPARE'))
    const moon = generateMap(settingsFor('ice-moon', 'MOON-COMPARE'))
    const iceOnLand = moon.cells.filter(
      (cell) => cell.feature === 'ice' && cell.terrain !== 'water',
    ).length
    expect(iceOnLand).toBeGreaterThan(0)
    expect(moon.cells.some((cell) => cell.feature === 'crevasse')).toBe(true)
    expect(moon.cells.some((cell) => cell.feature === 'crater')).toBe(true)
    expect(lunar.cells.some((cell) => cell.feature === 'ice' && cell.terrain !== 'water')).toBe(
      false,
    )
    const wooded =
      moon.cells.filter((cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods').length /
      moon.cells.length
    expect(wooded).toBeLessThan(0.2)
  })

  it('cuts one east-west canyon with a left-to-right road, never a north-south road', () => {
    const seeds = ['CANYON-ROAD', 'CR-2', 'CR-3', 'CR-4', 'CR-5']
    for (const seed of seeds) {
      for (const symmetric of [true, false]) {
        const map = generateMap({ ...settingsFor('canyon-road', seed), symmetric })
        const roads = map.cells.filter((cell) => cell.terrain === 'road')
        expect(roads.some((cell) => cell.col === 0)).toBe(true)
        expect(roads.some((cell) => cell.col === map.width - 1)).toBe(true)

        for (let col = 0; col < map.width; col += 1) {
          const inColumn = roads.filter((cell) => cell.col === col)
          expect(inColumn.length).toBeGreaterThanOrEqual(1)
          expect(inColumn.length).toBeLessThanOrEqual(2)
        }

        const keyOf = (cell: { col: number; row: number }) => `${cell.col}:${cell.row}`
        const roadKeys = new Set(roads.map(keyOf))
        const start = roads.find((cell) => cell.col === 0)!
        const seen = new Set<string>([keyOf(start)])
        const queue: { col: number; row: number }[] = [start]
        while (queue.length > 0) {
          const current = queue.shift()!
          for (const next of neighborHexes(current.col, current.row, map.width, map.height)) {
            const key = keyOf(next)
            if (!roadKeys.has(key) || seen.has(key)) continue
            seen.add(key)
            queue.push(next)
          }
        }
        expect(seen.size).toBe(roads.length)

        let walledColumns = 0
        for (let col = 0; col < map.width; col += 1) {
          const inColumn = roads.filter((cell) => cell.col === col)
          const roadMin = Math.min(...inColumn.map((cell) => cell.row))
          const roadMax = Math.max(...inColumn.map((cell) => cell.row))
          const northHigh = map.cells.some(
            (cell) => cell.col === col && cell.row < roadMin && cell.elevation >= 2,
          )
          const southHigh = map.cells.some(
            (cell) => cell.col === col && cell.row > roadMax && cell.elevation >= 2,
          )
          if (northHigh && southHigh) walledColumns += 1
        }
        expect(walledColumns).toBeGreaterThan(map.width * 0.5)
        expect(map.cells.some((cell) => cell.feature === 'cliff')).toBe(true)
      }
    }

    const canyon = generateMap(settingsFor('canyon-road', 'CR-COMPARE'))
    const eroded = generateMap(settingsFor('badlands', 'CR-COMPARE'))
    expect(canyon.cells.filter((cell) => cell.terrain === 'road').length).toBeGreaterThan(
      eroded.cells.filter((cell) => cell.terrain === 'road').length,
    )
    expect(getBiome('canyon-road').generation.canyonRoad).toBe(true)
    expect(getBiome('badlands').generation.canyonRoad).toBeFalsy()
    expect(getBiome('canyon-road').generation.road).toBe('none')
  })

  it('changes the canyon floor road from seed to seed', () => {
    const signatures = ['CR-A', 'CR-B', 'CR-C', 'CR-D', 'CR-E', 'CR-F', 'CR-G', 'CR-H'].map(
      (seed) => {
        const map = generateMap({
          ...settingsFor('canyon-road', seed),
          width: 16,
          height: 17,
          symmetric: true,
        })
        return map.cells
          .filter((cell) => cell.terrain === 'road')
          .sort((a, b) => a.col - b.col || a.row - b.row)
          .map((cell) => `${cell.col}:${cell.row}`)
          .join(',')
      },
    )
    expect(new Set(signatures).size).toBeGreaterThan(3)
    const firstTurn = signatures.map((signature) => {
      const rows = signature.split(',').map((token) => Number(token.split(':')[1]))
      const start = rows[0]
      const index = rows.findIndex((row) => row !== start)
      return index
    })
    expect(new Set(firstTurn).size).toBeGreaterThan(1)
  })

  it('lets canyon walls wander instead of cutting a ruler-straight trench', () => {
    const map = generateMap(settingsFor('canyon-road', 'CR-WANDER'))
    const roads = map.cells.filter((cell) => cell.terrain === 'road')
    const floorWidths = new Set<number>()
    const northWallRows = new Set<number>()
    const southWallRows = new Set<number>()
    for (let col = 0; col < map.width; col += 1) {
      const inColumn = roads.filter((cell) => cell.col === col)
      const roadMin = Math.min(...inColumn.map((cell) => cell.row))
      const roadMax = Math.max(...inColumn.map((cell) => cell.row))
      const column = map.cells.filter((cell) => cell.col === col)
      floorWidths.add(
        column.filter((cell) => cell.elevation === 0 && cell.terrain !== 'lava').length,
      )
      const northWall = column
        .filter((cell) => cell.row < roadMin && cell.elevation >= 2)
        .sort((a, b) => b.row - a.row)[0]
      const southWall = column
        .filter((cell) => cell.row > roadMax && cell.elevation >= 2)
        .sort((a, b) => a.row - b.row)[0]
      if (northWall) northWallRows.add(northWall.row)
      if (southWall) southWallRows.add(southWall.row)
    }
    expect(floorWidths.size).toBeGreaterThan(1)
    expect(northWallRows.size + southWallRows.size).toBeGreaterThan(3)
  })

  it('paints martian maps red, cratered, and iced without lunar grey', () => {
    const map = generateMap(settingsFor('martian', 'MARS-DUST'))
    const biome = getBiome('martian')
    expect(biome.palette.lava.label).toBe('Hematite')
    expect(biome.palette.lava.color).toBe('#5c1810')
    expect(biome.palette.water.label).toBe('Buried Ice')
    expect(biome.palette.clear.color.toLowerCase()).not.toBe(
      getBiome('lunar').palette.clear.color.toLowerCase(),
    )
    expect(map.cells.some((cell) => cell.feature === 'crater')).toBe(true)
    expect(map.cells.some((cell) => cell.feature === 'ice' || cell.terrain === 'water')).toBe(true)
    const wooded = map.cells.filter(
      (cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods',
    ).length
    expect(wooded / map.cells.length).toBeLessThan(0.2)
    const [r, g] = [
      parseInt(biome.palette.clear.color.slice(1, 3), 16),
      parseInt(biome.palette.clear.color.slice(3, 5), 16),
    ]
    expect(r).toBeGreaterThan(g)
  })

  it('grows a fungal theater of caps, spore fields, and organic pools', () => {
    const seed = 'FUNGAL-COMPARE'
    const jungle = generateMap(settingsFor('tropical-jungle', seed))
    const fungal = generateMap(settingsFor('alien-fungal', seed))
    const wooded = (map: typeof fungal) =>
      map.cells.filter((cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods').length
    expect(wooded(fungal)).toBeGreaterThan(wooded(jungle) * 0.4)
    expect(fungal.cells.some((cell) => cell.feature === 'spore')).toBe(true)
    expect(fungal.cells.some((cell) => cell.terrain === 'water')).toBe(true)
    expect(getBiome('alien-fungal').palette.lava.label).toBe('Ichor')
    expect(getBiome('alien-fungal').palette.water.label).toBe('Organic Pool')
  })

  it('raises crystal forests and mineral ridges unlike lunar grey', () => {
    const seed = 'CRYSTAL-COMPARE'
    const lunar = generateMap(settingsFor('lunar', seed))
    const crystal = generateMap(settingsFor('crystal-world', seed))
    expect(crystal.cells.some((cell) => cell.feature === 'crystal')).toBe(true)
    expect(crystal.cells.some((cell) => cell.feature === 'crevasse')).toBe(true)
    expect(lunar.cells.some((cell) => cell.feature === 'crystal')).toBe(false)
    const wooded =
      crystal.cells.filter((cell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods')
        .length / crystal.cells.length
    expect(wooded).toBeGreaterThan(0.05)
    expect(getBiome('crystal-world').palette.lava.label).toBe('Prismatic Melt')
    expect(getBiome('crystal-world').palette.clear.color.toLowerCase()).not.toBe(
      getBiome('lunar').palette.clear.color.toLowerCase(),
    )
  })
})
