import type { BiomeDefinition } from '../types/biome'
import type { Building, BuildingType } from '../types/building'
import type {
  BattleMap,
  CellFeature,
  GeneratorSettings,
  HexCell,
  TerrainType,
} from '../types/map'
import { MAX_ELEVATION, MAX_MAP_HEIGHT, MAX_MAP_WIDTH, MIN_MAP_SIZE } from '../types/map'
import { getBiome } from './biomes'
import { buildingCells, canPlaceBuilding, rotationsAlongRoad } from './buildings'
import { cellsWithinRadius, edgeNeighbor, hexDistance, neighborHexes } from './hex'
import { getUrbanPreset } from './presets'

function hashSeed(seed: string) {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5)
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function makeField(
  width: number,
  height: number,
  random: () => number,
  passes = 3,
  symmetric = false,
) {
  let values = Array.from({ length: width * height }, () => random())
  for (let pass = 0; pass < passes; pass += 1) {
    values = values.map((value, index) => {
      const col = index % width
      const row = Math.floor(index / width)
      let total = value * 2
      let count = 2
      for (let y = Math.max(0, row - 1); y <= Math.min(height - 1, row + 1); y += 1) {
        for (let x = Math.max(0, col - 1); x <= Math.min(width - 1, col + 1); x += 1) {
          if (x === col && y === row) continue
          total += values[y * width + x]
          count += 1
        }
      }
      return total / count
    })
  }
  if (symmetric) {
    // Average each cell with its 180-degree counterpart so both halves match.
    values = values.map((value, index) => {
      const col = index % width
      const row = Math.floor(index / width)
      const mirror = (height - 1 - row) * width + (width - 1 - col)
      return (value + values[mirror]) / 2
    })
  }
  // Smoothing compresses the range; stretch it back so terrain weights track
  // actual coverage instead of depending on how extreme this seed's field is.
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values.map((value) => (value - min) / span)
}

function chooseTerrain(
  moisture: number,
  ruggedness: number,
  forest: number,
  settings: GeneratorSettings,
  biome: BiomeDefinition,
): TerrainType {
  const waterThreshold = 1 - settings.terrain.water / 100
  const woodsThreshold = 1 - settings.terrain.woods / 100
  const roughThreshold = 1 - settings.terrain.rough / 100
  let terrain: TerrainType
  if (moisture > waterThreshold) terrain = 'water'
  else if (forest > Math.min(0.91, woodsThreshold + biome.generation.heavyWoodsBias)) {
    terrain = 'heavyWoods'
  } else if (forest > woodsThreshold) terrain = 'woods'
  else if (ruggedness > roughThreshold) terrain = 'rough'
  else terrain = 'clear'

  // Biome generation rules win over weights: a volcanic world grows lava, not
  // lakes. (Manual painting is unaffected — the editor offers every terrain.)
  if (biome.generation.excludes?.includes(terrain)) {
    return biome.generation.substitute?.[terrain] ?? 'clear'
  }
  return terrain
}

function applyContrast(value: number, contrast: number) {
  return Math.max(0, Math.min(1, 0.5 + (value - 0.5) * contrast))
}

// --- Crossing paths --------------------------------------------------------
// A crossing walks from one map edge to the opposite one, one step per column
// (horizontal) or per row (vertical). Offset-hex adjacency constrains each
// step: horizontally, even rows must stay level and odd rows may drift by one;
// vertically, even rows may only drift 0/+1 in column and odd rows -1/0.

type Orientation = 'horizontal' | 'vertical'

function legalStep(orientation: Orientation, mainIndex: number, from: number, to: number) {
  const delta = to - from
  if (orientation === 'horizontal') {
    return from % 2 === 0 ? delta === 0 : delta >= -1 && delta <= 1
  }
  return mainIndex % 2 === 0 ? delta === 0 || delta === 1 : delta === -1 || delta === 0
}

function clampStep(orientation: Orientation, mainIndex: number, from: number, to: number) {
  const delta = Math.max(-1, Math.min(1, to - from))
  if (orientation === 'horizontal') return from % 2 === 0 ? from : from + delta
  if (mainIndex % 2 === 0) return from + Math.max(0, delta)
  return from + Math.min(0, delta)
}

function seamCross(orientation: Orientation, crossLength: number, seamMain: number) {
  if (crossLength % 2 === 1) return (crossLength - 1) / 2
  if (orientation === 'horizontal') {
    // The pre-seam row must be odd so the mirrored step across the seam is legal.
    return (crossLength / 2 - 1) % 2 === 1 ? crossLength / 2 - 1 : crossLength / 2
  }
  // Vertical seam legality depends on the parity of the pre-seam row.
  return (seamMain - 1) % 2 === 0 ? crossLength / 2 - 1 : crossLength / 2
}

function buildCrossing(spec: {
  mainLength: number
  crossLength: number
  orientation: Orientation
  symmetric: boolean
  style: 'road' | 'river'
  random: () => number
  /** Keep the path this many cells away from both cross-axis edges. */
  inset?: number
}): number[] {
  const { mainLength, crossLength, orientation, symmetric, style, random } = spec
  const lo = spec.inset ?? 0
  const hi = Math.max(lo, crossLength - 1 - lo)
  const start = lo + Math.floor(random() * (hi - lo + 1))
  const end = symmetric ? crossLength - 1 - start : lo + Math.floor(random() * (hi - lo + 1))
  const amplitude = 1 + random() * 1.5
  const riverOffset = (random() - 0.5) * crossLength * 0.3

  const cross: number[] = []
  for (let i = 0; i < mainLength; i += 1) {
    const progress = i / Math.max(1, mainLength - 1)
    const target =
      style === 'road'
        ? Math.round(
            start +
              (end - start) * progress +
              Math.sin(progress * Math.PI * 2.3) * Math.max(1.4, (hi - lo) * 0.32) +
              Math.sin(progress * Math.PI * 5.7) * 0.85,
          )
        : Math.round(
            (crossLength - 1) / 2 +
              (symmetric ? 0 : riverOffset) +
              amplitude * Math.sin(progress * Math.PI * 2),
          )
    const bounded = Math.max(lo, Math.min(hi, target))
    if (i === 0) {
      cross.push(bounded)
    } else {
      const stepped = clampStep(orientation, i - 1, cross[i - 1], bounded)
      cross.push(Math.max(lo, Math.min(hi, stepped)))
    }
  }
  if (!symmetric) return cross

  // Mirror the first half onto the second, then repair the seam so the two
  // halves meet in an adjacent, mirror-consistent pair.
  const seamMain = Math.floor(mainLength / 2)
  cross[seamMain - 1] = Math.max(lo, Math.min(hi, seamCross(orientation, crossLength, seamMain)))
  for (let i = seamMain - 1; i > 0; i -= 1) {
    if (legalStep(orientation, i - 1, cross[i - 1], cross[i])) break
    cross[i - 1] = cross[i]
  }
  for (let i = seamMain; i < mainLength; i += 1) {
    cross[i] = crossLength - 1 - cross[mainLength - 1 - i]
  }
  return cross
}

function mirrorOf(col: number, row: number, width: number, height: number) {
  return { col: width - 1 - col, row: height - 1 - row }
}

function isStreet(cell: HexCell) {
  return cell.terrain === 'road' && cell.skin !== 'rail'
}

/** One clear hex between parallel east-west routes so they do not fuse. */
const ROUTE_GAP = 2

function mirrorRow(height: number, row: number) {
  return height - 1 - row
}

function throughRouteRows(cells: HexCell[], width: number, height: number) {
  const rows: number[] = []
  for (let row = 0; row < height; row += 1) {
    let count = 0
    for (let col = 0; col < width; col += 1) {
      if (cells[row * width + col].terrain === 'road') count += 1
    }
    if (count >= width * 0.5) rows.push(row)
  }
  return rows
}

function rowClearOfRoutes(row: number, occupied: number[], height: number, symmetric: boolean) {
  if (row < 0 || row >= height) return false
  const rows = symmetric ? [row, mirrorRow(height, row)] : [row]
  if (new Set(rows).size > 1 && Math.abs(rows[0] - rows[1]) < ROUTE_GAP) return false
  return rows.every((target) => occupied.every((taken) => Math.abs(taken - target) >= ROUTE_GAP))
}

function pickSpacedRow(
  height: number,
  prefer: number,
  occupied: number[],
  symmetric: boolean,
) {
  const candidates = Array.from({ length: height }, (_, row) => row).filter((row) =>
    rowClearOfRoutes(row, occupied, height, symmetric),
  )
  const pool = candidates.length > 0 ? candidates : Array.from({ length: height }, (_, row) => row)
  return pool.reduce((best, row) =>
    Math.abs(row - prefer) < Math.abs(best - prefer) ? row : best,
  )
}

function paintRow(
  cells: HexCell[],
  width: number,
  row: number,
  skin?: string,
) {
  for (let col = 0; col < width; col += 1) {
    const index = row * width + col
    if (cells[index].terrain === 'water') continue
    if (skin === 'rail' && isStreet(cells[index])) continue
    cells[index] = skin
      ? { ...cells[index], terrain: 'road', skin }
      : { ...cells[index], terrain: 'road' }
  }
}

function countrysideRoadChance(settings: GeneratorSettings) {
  const chance = settings.roadChance ?? 100
  if (!Number.isFinite(chance)) return 100
  return Math.max(0, Math.min(100, Math.round(chance)))
}

function shouldPlaceCountrysideRoad(
  biome: BiomeDefinition,
  settings: GeneratorSettings,
  random: () => number,
) {
  if (biome.generation.road === 'none') return false
  const chance = countrysideRoadChance(settings)
  if (chance <= 0) return false
  if (chance >= 100) return true
  return random() * 100 < chance
}

function addRoad(
  cells: HexCell[],
  width: number,
  height: number,
  random: () => number,
  symmetric: boolean,
  occupied: number[] = [],
) {
  if (width < 6 || height < 6) return occupied
  const inset = 1
  let path: number[] = []
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = buildCrossing({
      mainLength: width,
      crossLength: height,
      orientation: 'horizontal',
      symmetric,
      style: 'road',
      random,
      inset,
    })
    const clear = [...new Set(candidate)].every((row) =>
      occupied.every((taken) => Math.abs(taken - row) >= ROUTE_GAP),
    )
    path = candidate
    if (clear || occupied.length === 0) break
  }
  const used: number[] = []
  for (let col = 0; col < width; col += 1) {
    const row = path[col]
    const index = row * width + col
    if (cells[index].terrain === 'water') continue
    cells[index] = { ...cells[index], terrain: 'road' }
    used.push(row)
  }
  return [...occupied, ...used]
}

function carveRiver(
  cells: HexCell[],
  width: number,
  height: number,
  random: () => number,
  symmetric: boolean,
) {
  const orientation: Orientation = random() < 0.5 ? 'horizontal' : 'vertical'
  const cross = buildCrossing({
    mainLength: orientation === 'horizontal' ? width : height,
    crossLength: orientation === 'horizontal' ? height : width,
    orientation,
    symmetric,
    style: 'river',
    random,
  })
  for (let i = 0; i < cross.length; i += 1) {
    const col = orientation === 'horizontal' ? i : cross[i]
    const row = orientation === 'horizontal' ? cross[i] : i
    const index = row * width + col
    // Road cells keep their terrain: the crossing reads as a causeway.
    if (cells[index].terrain === 'road') continue
    cells[index] = { ...cells[index], terrain: 'water', elevation: 0 }
  }
}

function carveChannels(
  cells: HexCell[],
  width: number,
  height: number,
  count: number,
  random: () => number,
  symmetric: boolean,
) {
  const walks = symmetric ? Math.ceil(count / 2) : count
  for (let channel = 0; channel < walks; channel += 1) {
    let col = 0
    let row = Math.floor(random() * height)
    const path: { col: number; row: number }[] = []
    while (col < width) {
      path.push({ col, row })
      const odd = row % 2 === 1
      const options = [
        { col: col + 1, row },
        { col: col + (odd ? 1 : 0), row: row + 1 },
        { col: col + (odd ? 1 : 0), row: row - 1 },
      ].filter((next) => next.row >= 0 && next.row < height)
      const next = options[Math.floor(random() * options.length)]
      col = next.col
      row = next.row
    }
    const positions = symmetric
      ? path.flatMap((pos) => [pos, mirrorOf(pos.col, pos.row, width, height)])
      : path
    for (const pos of positions) {
      const index = pos.row * width + pos.col
      if (cells[index].terrain === 'road') continue
      cells[index] = { ...cells[index], terrain: 'water', elevation: 0 }
    }
  }
}

function carveLavaFlows(
  cells: HexCell[],
  width: number,
  height: number,
  count: number,
  random: () => number,
  symmetric: boolean,
) {
  for (let flow = 0; flow < count; flow += 1) {
    const sources = cells.filter((cell) => cell.elevation >= 2)
    if (sources.length === 0) return
    let current = sources[Math.floor(random() * sources.length)]
    const visited = new Set<string>()
    const path: HexCell[] = []
    while (!visited.has(`${current.col}:${current.row}`)) {
      visited.add(`${current.col}:${current.row}`)
      path.push(current)
      const lower = cellsWithinRadius(current, 1, width, height)
        .filter((next) => next.col !== current.col || next.row !== current.row)
        .map((next) => cells[next.row * width + next.col])
        .filter((next) => next.terrain !== 'water' && next.elevation < current.elevation)
      if (lower.length === 0) break
      current = lower[Math.floor(random() * lower.length)]
    }
    const positions = symmetric
      ? path.flatMap((cell) => [cell, mirrorOf(cell.col, cell.row, width, height)])
      : path
    for (const pos of positions) {
      const index = pos.row * width + pos.col
      if (cells[index].terrain === 'water' || cells[index].terrain === 'road') continue
      cells[index] = { ...cells[index], terrain: 'lava' }
    }
  }
}

function placeMirroredHills(
  cells: HexCell[],
  width: number,
  height: number,
  settings: GeneratorSettings,
  random: () => number,
) {
  if (settings.elevation < 1) return
  const summit = Math.min(MAX_ELEVATION, Math.max(2, settings.elevation))
  const base = {
    col: Math.round(width * 0.25) + (Math.floor(random() * 3) - 1),
    row: Math.round(height * 0.3) + (Math.floor(random() * 3) - 1),
  }
  const centers = [base, mirrorOf(base.col, base.row, width, height)]
  for (const center of centers) {
    for (const pos of cellsWithinRadius(center, 1, width, height)) {
      const index = pos.row * width + pos.col
      const cell = cells[index]
      if (cell.terrain === 'water' || cell.terrain === 'lava') continue
      const isSummit = pos.col === center.col && pos.row === center.row
      cells[index] = {
        ...cell,
        terrain: cell.terrain === 'clear' ? 'rough' : cell.terrain,
        elevation: isSummit ? summit : Math.max(cell.elevation, summit - 1),
      }
    }
  }
}

function placeCenterCover(
  cells: HexCell[],
  width: number,
  height: number,
  coverTerrain: 'woods' | 'rough',
) {
  const center = { col: Math.floor(width / 2), row: Math.floor(height / 2) }
  const seen = new Set<string>()
  let pairs = 0
  for (const pos of cellsWithinRadius(center, 1, width, height)) {
    const key = `${pos.col}:${pos.row}`
    const mirror = mirrorOf(pos.col, pos.row, width, height)
    const mirrorKey = `${mirror.col}:${mirror.row}`
    if (seen.has(key)) continue
    seen.add(key)
    seen.add(mirrorKey)
    if (pairs >= 2) break
    let converted = false
    for (const target of [pos, mirror]) {
      const index = target.row * width + target.col
      if (cells[index].terrain !== 'clear') continue
      cells[index] = { ...cells[index], terrain: coverTerrain }
      converted = true
    }
    if (converted) pairs += 1
  }
}

function placeCraters(
  cells: HexCell[],
  width: number,
  height: number,
  count: number,
  random: () => number,
  symmetric: boolean,
) {
  const rough = cells.filter((cell) => cell.terrain === 'rough' && !cell.feature)
  const sunken = rough.filter((cell) => cell.elevation <= 1)
  const open = cells.filter(
    (cell) => cell.terrain === 'clear' && !cell.feature && cell.elevation <= 1,
  )
  const candidates =
    sunken.length >= count ? sunken : rough.length >= count ? rough : [...sunken, ...open]
  for (let placed = 0; placed < count && candidates.length > 0; placed += 1) {
    const pick = candidates.splice(Math.floor(random() * candidates.length), 1)[0]
    const positions = symmetric
      ? [pick, mirrorOf(pick.col, pick.row, width, height)]
      : [pick]
    for (const pos of positions) {
      const index = pos.row * width + pos.col
      if (cells[index].feature) continue
      cells[index] = { ...cells[index], feature: 'crater' }
    }
  }
}

function layStreets(
  cells: HexCell[],
  width: number,
  height: number,
  random: () => number,
  symmetric: boolean,
) {
  // Pointy-top hexes have no straight north-south neighbor. A fixed column
  // zigzags; SE or SW is a true straight avenue down the map.
  const axis = random() < 0.5 ? 1 : 2
  const drift = Math.floor((height - 1) / 2)
  const minCol = axis === 2 ? Math.min(drift, width - 1) : 0
  const maxCol = axis === 1 ? Math.max(minCol, width - 1 - drift) : width - 1
  const span = Math.max(0, maxCol - minCol)
  const firstCol = minCol + Math.round(span * (0.28 + random() * 0.08))
  const secondCol = symmetric ? firstCol : minCol + Math.round(span * (0.62 + random() * 0.1))
  const paintAvenue = (startCol: number) => {
    let col = startCol
    let row = 0
    while (col >= 0 && row >= 0 && col < width && row < height) {
      const index = row * width + col
      if (cells[index].terrain !== 'water') cells[index] = { ...cells[index], terrain: 'road' }
      if (symmetric) {
        const mirror = mirrorOf(col, row, width, height)
        const mirrorIndex = mirror.row * width + mirror.col
        if (cells[mirrorIndex].terrain !== 'water') {
          cells[mirrorIndex] = { ...cells[mirrorIndex], terrain: 'road' }
        }
      }
      const next = edgeNeighbor(col, row, axis)
      col = next.col
      row = next.row
    }
  }
  paintAvenue(firstCol)
  if (!symmetric && secondCol !== firstCol) paintAvenue(secondCol)

  const firstRow = pickSpacedRow(
    height,
    Math.round(height * (0.28 + random() * 0.08)),
    [],
    symmetric,
  )
  const secondRow = symmetric
    ? mirrorRow(height, firstRow)
    : pickSpacedRow(
        height,
        Math.round(height * (0.68 + random() * 0.08)),
        [firstRow],
        false,
      )
  for (const row of new Set([firstRow, secondRow])) paintRow(cells, width, row)
}

function layRail(
  cells: HexCell[],
  width: number,
  height: number,
  random: () => number,
  symmetric: boolean,
) {
  const occupied = throughRouteRows(cells, width, height)
  const streetCount = (row: number) =>
    Array.from({ length: width }, (_, col) => cells[row * width + col]).filter(isStreet).length
  const spaced = Array.from({ length: height }, (_, row) => row).filter((row) =>
    rowClearOfRoutes(row, occupied, height, symmetric),
  )
  const pool = spaced.length > 0 ? spaced : Array.from({ length: height }, (_, row) => row)
  const fewest = Math.min(...pool.map(streetCount))
  const best = pool.filter((row) => streetCount(row) === fewest)
  const row = best[Math.floor(random() * best.length)]
  const rows = new Set(symmetric ? [row, mirrorRow(height, row)] : [row])
  for (const target of rows) paintRow(cells, width, target, 'rail')
}

function placeStreetBridges(
  cells: HexCell[],
  buildings: Building[],
  width: number,
  height: number,
) {
  const scratch = { cells, buildings, width, height } as BattleMap
  const isRoad = (col: number, row: number) =>
    col >= 0 && row >= 0 && col < width && row < height && cells[row * width + col].terrain === 'road'
  for (const cell of cells) {
    if (cell.terrain !== 'water') continue
    const road = (edge: number) => {
      const neighbor = edgeNeighbor(cell.col, cell.row, edge)
      return isRoad(neighbor.col, neighbor.row)
    }
    let rotation: 0 | 1 | 2 | null = null
    if (road(0) && road(3)) rotation = 0
    else if (road(1) && road(4)) rotation = 1
    else if (road(2) && road(5)) rotation = 2
    if (rotation === null) continue
    if (canPlaceBuilding(scratch, 'bridge', cell, rotation)) {
      buildings.push({
        id: crypto.randomUUID(),
        type: 'bridge',
        anchor: { col: cell.col, row: cell.row },
        rotation,
        state: 'intact',
      })
    }
  }
}

const DISTRICT_MIX = {
  urban: {
    center: [
      'officeTower',
      'government',
      'hospital',
      'government',
      'hospital',
      'hotel',
      'school',
      'shoppingCenter',
      'dataCenter',
    ],
    residential: [
      'house',
      'house',
      'house',
      'apartment',
      'apartment',
      'school',
      'fireStation',
      'policeStation',
    ],
    industrial: [
      'warehouse',
      'factory',
      'powerPlant',
      'warehouse',
      'factory',
      'railStation',
      'waterTreatment',
      'substation',
    ],
  },
  industrial: {
    center: [
      'factory',
      'powerPlant',
      'factory',
      'powerPlant',
      'refinery',
      'steelMill',
      'fusionReactor',
      'officeTower',
    ],
    residential: ['warehouse', 'warehouse', 'railStation', 'house', 'autoStorage', 'chemicalPlant'],
    industrial: [
      'factory',
      'fuelDepot',
      'factory',
      'fuelDepot',
      'heavyAssembly',
      'mechFactory',
      'dropShipPad',
      'miningFacility',
    ],
  },
  military: {
    center: [
      'commandHQ',
      'hpgStation',
      'castleBrian',
      'mechHangar',
      'planetaryCommand',
      'radarStation',
    ],
    residential: [
      'barracks',
      'barracks',
      'vehicleGarage',
      'starLeagueBunker',
      'trainingFacility',
      'readyRoom',
    ],
    industrial: [
      'repairBay',
      'fuelDepot',
      'dropShipPad',
      'aerospaceHangar',
      'ammoDepot',
      'salvageYard',
    ],
  },
} as const satisfies Record<string, Record<string, readonly BuildingType[]>>

function populateDistricts(
  cells: HexCell[],
  buildings: Building[],
  width: number,
  height: number,
  random: () => number,
  symmetric: boolean,
  presetId: string | undefined,
  theme: 'urban' | 'industrial' = 'urban',
) {
  const preset = getUrbanPreset(presetId)
  const scratch = { cells, buildings, width, height } as BattleMap
  const centerStart = Math.floor(width * (0.5 - preset.centerWidth / 2))
  const centerEnd = Math.ceil(width * (0.5 + preset.centerWidth / 2))
  const flankA =
    preset.flanks === 'mixed'
      ? random() < 0.5
        ? 'residential'
        : 'industrial'
      : preset.flanks
  const flankB =
    preset.flanks === 'mixed'
      ? flankA === 'residential'
        ? 'industrial'
        : 'residential'
      : flankA
  const mixTable = DISTRICT_MIX[preset.military ? 'military' : theme]
  const districtOf = (col: number): keyof typeof mixTable => {
    if (col >= centerStart && col < centerEnd) return 'center'
    if (col < centerStart) return flankA
    return symmetric ? flankA : flankB
  }
  const nearStreet = (cell: HexCell) =>
    neighborHexes(cell.col, cell.row, width, height).some((next) =>
      isStreet(cells[next.row * width + next.col]),
    )
  // Density falls off radially from the map center: dense downtown, sparse edges.
  const centerCol = (width - 1) / 2
  const centerRow = (height - 1) / 2
  const maxDist = Math.hypot(centerCol, centerRow) || 1
  const falloff = (cell: HexCell) =>
    1 - 0.65 * (Math.hypot(cell.col - centerCol, cell.row - centerRow) / maxDist)
  ensureDistrictObjective(
    cells,
    buildings,
    width,
    height,
    preset.military ? 'barracks' : theme === 'industrial' ? 'powerPlant' : 'hospital',
  )
  for (const cell of cells) {
    if (cell.terrain !== 'clear' && cell.terrain !== 'woods') continue
    if (!nearStreet(cell)) continue
    const district = districtOf(cell.col)
    const roll = random()
    const threshold =
      preset.density * (district === 'center' ? 1.25 : 1) * falloff(cell)
    if (roll > threshold) continue
    let type: BuildingType
    if (roll < 0.03) {
      type = 'bunker'
    } else if (district === 'industrial' && roll < preset.density * 0.12) {
      type = 'dropShipPad'
    } else {
      const mix = mixTable[district]
      type = mix[Math.floor(random() * mix.length)]
    }
    for (const rotation of rotationsAlongRoad(scratch, type, cell)) {
      if (tryPlaceGenerated(scratch, type, cell, rotation)) break
    }
  }
  if (preset.ruins) applyRuins(cells, buildings, width, height, random, symmetric)
}

function tryPlaceGenerated(
  scratch: BattleMap,
  type: BuildingType,
  cell: HexCell,
  rotation: Building['rotation'],
) {
  const footprint = buildingCells({
    id: '',
    type,
    anchor: { col: cell.col, row: cell.row },
    rotation,
    state: 'intact',
  })
  const crowded = scratch.buildings.some((building) =>
    buildingCells(building).some((occupied) =>
      footprint.some((pos) => hexDistance(occupied, pos) <= 1),
    ),
  )
  if (crowded) return false
  if (!canPlaceBuilding(scratch, type, cell, rotation)) return false
  scratch.buildings.push({
    id: crypto.randomUUID(),
    type,
    anchor: { col: cell.col, row: cell.row },
    rotation,
    state: 'intact',
  })
  return true
}

function ensureDistrictObjective(
  cells: HexCell[],
  buildings: Building[],
  width: number,
  height: number,
  type: BuildingType,
) {
  if (buildings.some((building) => building.type === type)) return
  const scratch = { cells, buildings, width, height } as BattleMap
  for (const cell of cells) {
    if (cell.terrain !== 'clear' && cell.terrain !== 'woods') continue
    for (const rotation of rotationsAlongRoad(scratch, type, cell)) {
      if (tryPlaceGenerated(scratch, type, cell, rotation)) return
    }
  }
}

function applyRuins(
  cells: HexCell[],
  buildings: Building[],
  width: number,
  height: number,
  random: () => number,
  symmetric: boolean,
) {
  for (const building of buildings) {
    if (building.type === 'bridge') continue
    if (random() < 0.72) {
      const wrecked = ['lightlyDamaged', 'heavilyDamaged', 'burning', 'collapsed', 'rubble'] as const
      building.state = wrecked[Math.floor(random() * wrecked.length)]
    }
  }
  const rubble = (cell: HexCell) => {
    if (cell.terrain === 'clear' && random() < 0.24) {
      cells[cell.row * width + cell.col] = { ...cell, terrain: 'rough' }
    } else if (
      (cell.terrain === 'woods' || cell.terrain === 'heavyWoods') &&
      random() < 0.18
    ) {
      cells[cell.row * width + cell.col] = { ...cell, terrain: 'rough' }
    }
  }
  if (!symmetric) {
    for (const cell of cells) rubble(cell)
    return
  }
  for (const cell of cells) {
    if (cell.row * width + cell.col > (cells.length - 1) / 2) continue
    const before = cells[cell.row * width + cell.col]
    rubble(before)
    const after = cells[cell.row * width + cell.col]
    if (after.terrain === before.terrain) continue
    const mirror = { col: width - 1 - cell.col, row: height - 1 - cell.row }
    cells[mirror.row * width + mirror.col] = {
      ...cells[mirror.row * width + mirror.col],
      terrain: after.terrain,
    }
  }
}

function placeFarmsteads(
  cells: HexCell[],
  buildings: Building[],
  width: number,
  height: number,
  random: () => number,
) {
  const scratch = { cells, buildings, width, height } as BattleMap
  const types: BuildingType[] = ['house', 'house', 'warehouse']
  for (const cell of cells) {
    if (cell.terrain !== 'clear' && cell.terrain !== 'woods') continue
    const nearRoad = neighborHexes(cell.col, cell.row, width, height).some((next) =>
      isStreet(cells[next.row * width + next.col]),
    )
    if (!nearRoad || random() > 0.28) continue
    const type = types[Math.floor(random() * types.length)]
    for (const rotation of rotationsAlongRoad(scratch, type, cell)) {
      if (tryPlaceGenerated(scratch, type, cell, rotation)) break
    }
  }
  if (buildings.length > 0) return
  for (const cell of cells) {
    if (cell.terrain !== 'clear' && cell.terrain !== 'woods') continue
    const nearRoad = neighborHexes(cell.col, cell.row, width, height).some((next) =>
      isStreet(cells[next.row * width + next.col]),
    )
    if (!nearRoad) continue
    for (const rotation of rotationsAlongRoad(scratch, 'house', cell)) {
      if (tryPlaceGenerated(scratch, 'house', cell, rotation)) return
    }
  }
}

function floodCoast(
  cells: HexCell[],
  width: number,
  height: number,
  random: () => number,
  symmetric: boolean,
) {
  const vertical = random() < 0.5
  const span = vertical ? width : height
  const depth = Math.max(2, Math.round(span * 0.2))
  const flood = (col: number, row: number) => {
    const index = row * width + col
    if (cells[index].terrain === 'road') return
    cells[index] = { ...cells[index], terrain: 'water', elevation: 0 }
  }
  if (vertical) {
    for (let col = 0; col < depth; col += 1) {
      for (let row = 0; row < height; row += 1) {
        flood(col, row)
        if (symmetric) flood(width - 1 - col, row)
      }
    }
    return
  }
  for (let row = 0; row < depth; row += 1) {
    for (let col = 0; col < width; col += 1) {
      flood(col, row)
      if (symmetric) flood(col, height - 1 - row)
    }
  }
}

function islandScore(cell: HexCell) {
  return (
    cell.elevation * 4 +
    (cell.terrain === 'rough' ? 3 : 0) +
    (cell.terrain === 'lava' ? 2 : 0) +
    (cell.terrain === 'woods' || cell.terrain === 'heavyWoods' ? 1 : 0)
  )
}

function floodArchipelago(
  cells: HexCell[],
  width: number,
  height: number,
  symmetric: boolean,
) {
  const land = cells.filter((cell) => cell.terrain !== 'water' && cell.terrain !== 'road')
  const ranked = [...land].sort((a, b) => islandScore(b) - islandScore(a))
  const targetIslands = Math.max(2, Math.min(6, Math.round((width * height) / 80)))
  const radius = Math.min(width, height) <= 10 ? 1 : 2
  const minSep = radius + 2
  const centers: HexCell[] = []

  const addCenter = (cell: HexCell) => {
    if (centers.some((center) => center.col === cell.col && center.row === cell.row)) return
    centers.push(cell)
    if (!symmetric) return
    const mirror = mirrorOf(cell.col, cell.row, width, height)
    const other = cells[mirror.row * width + mirror.col]
    if (!centers.some((center) => center.col === other.col && center.row === other.row)) {
      centers.push(other)
    }
  }

  for (const cell of ranked) {
    if (centers.length >= targetIslands) break
    if (centers.some((center) => hexDistance(center, cell) < minSep)) continue
    addCenter(cell)
  }
  if (centers.length === 0 && ranked.length > 0) addCenter(ranked[0])
  if (centers.length === 0) addCenter(cells[0])

  const keep = new Set<number>()
  for (const center of centers) {
    for (const cell of cells) {
      if (hexDistance(cell, center) <= radius) keep.add(cell.row * width + cell.col)
    }
  }

  for (let index = 0; index < cells.length; index += 1) {
    if (cells[index].terrain === 'road') continue
    if (keep.has(index)) continue
    cells[index] = { ...cells[index], terrain: 'water', elevation: 0, feature: undefined }
  }

  for (const center of centers) {
    const index = center.row * width + center.col
    if (cells[index].terrain === 'water' || cells[index].terrain === 'road') continue
    cells[index] = {
      ...cells[index],
      elevation: Math.max(2, cells[index].elevation),
      terrain: cells[index].terrain === 'clear' ? 'rough' : cells[index].terrain,
    }
  }

  if (cells.some((cell) => cell.terrain !== 'water' && cell.terrain !== 'road')) return
  const fallback = ranked[0] ?? cells[Math.floor(cells.length / 2)]
  stampMirrored(
    cells,
    fallback.row * width + fallback.col,
    { terrain: 'rough', elevation: Math.max(2, fallback.elevation) },
    width,
    height,
    symmetric,
  )
}

function placeReefs(cells: HexCell[], width: number, height: number, symmetric: boolean) {
  stampFeature(cells, 'reef', (cell) => {
    if (cell.terrain !== 'water') return false
    return neighborHexes(cell.col, cell.row, width, height).some((next) => {
      const other = cells[next.row * width + next.col]
      return other.terrain !== 'water' && other.terrain !== 'road'
    })
  })
  if (cells.some((cell) => cell.feature === 'reef')) return
  const fringe = cells.findIndex((cell) => {
    if (cell.terrain !== 'water') return false
    return neighborHexes(cell.col, cell.row, width, height).some((next) => {
      const other = cells[next.row * width + next.col]
      return other.terrain !== 'water' && other.terrain !== 'road'
    })
  })
  if (fringe >= 0) {
    stampMirrored(cells, fringe, { feature: 'reef' }, width, height, symmetric)
    return
  }
  const land = cells.findIndex((cell) => cell.terrain !== 'water' && cell.terrain !== 'road')
  if (land < 0) return
  const shore = neighborHexes(cells[land].col, cells[land].row, width, height)[0]
  if (!shore) return
  stampMirrored(
    cells,
    shore.row * width + shore.col,
    { terrain: 'water', elevation: 0, feature: 'reef' },
    width,
    height,
    symmetric,
  )
}

function stampFeature(
  cells: HexCell[],
  feature: CellFeature,
  match: (cell: HexCell) => boolean,
) {
  for (let index = 0; index < cells.length; index += 1) {
    if (cells[index].feature || !match(cells[index])) continue
    cells[index] = { ...cells[index], feature }
  }
}

function stampMirrored(
  cells: HexCell[],
  index: number,
  patch: Partial<HexCell>,
  width: number,
  height: number,
  symmetric: boolean,
) {
  cells[index] = { ...cells[index], ...patch }
  if (!symmetric) return
  const cell = cells[index]
  const mirror = mirrorOf(cell.col, cell.row, width, height)
  const other = mirror.row * width + mirror.col
  cells[other] = { ...cells[other], ...patch }
}

function placeIceSheets(cells: HexCell[], width: number, height: number, symmetric: boolean) {
  stampFeature(cells, 'ice', (cell) => cell.terrain === 'water')
  if (cells.some((cell) => cell.feature === 'ice')) return
  const open = cells.findIndex((cell) => cell.terrain !== 'road')
  if (open >= 0) stampMirrored(cells, open, { terrain: 'water', elevation: 0, feature: 'ice' }, width, height, symmetric)
}

function placeGroundIce(cells: HexCell[], width: number, height: number, symmetric: boolean) {
  stampFeature(cells, 'ice', (cell) => cell.terrain === 'clear' || cell.terrain === 'rough')
  if (cells.some((cell) => cell.feature === 'ice')) return
  const open = cells.findIndex((cell) => cell.terrain !== 'road' && cell.terrain !== 'water')
  if (open >= 0) stampMirrored(cells, open, { feature: 'ice' }, width, height, symmetric)
}

function thickenMangroves(cells: HexCell[], width: number, height: number, symmetric: boolean) {
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index]
    if (cell.terrain !== 'clear') continue
    const nextToWater = neighborHexes(cell.col, cell.row, width, height).some(
      (next) => cells[next.row * width + next.col].terrain === 'water',
    )
    if (!nextToWater) continue
    cells[index] = { ...cell, terrain: 'woods' }
  }
  const rooted = cells.some(
    (cell) =>
      (cell.terrain === 'woods' || cell.terrain === 'heavyWoods') &&
      neighborHexes(cell.col, cell.row, width, height).some(
        (next) => cells[next.row * width + next.col].terrain === 'water',
      ),
  )
  if (rooted) return
  const shore = cells.findIndex((cell) => {
    if (cell.terrain === 'water' || cell.terrain === 'road') return false
    return neighborHexes(cell.col, cell.row, width, height).some(
      (next) => cells[next.row * width + next.col].terrain === 'water',
    )
  })
  if (shore >= 0) {
    stampMirrored(cells, shore, { terrain: 'woods' }, width, height, symmetric)
  }
}

function carveFjords(
  cells: HexCell[],
  width: number,
  height: number,
  random: () => number,
  symmetric: boolean,
) {
  const fromWest = random() < 0.5
  const along = fromWest ? height : width
  const inland = Math.max(4, Math.round((fromWest ? width : height) * 0.45))
  const start = Math.max(1, Math.min(along - 2, Math.floor(along * 0.32)))
  const starts = symmetric
    ? [start]
    : [start, Math.max(1, Math.min(along - 2, Math.floor(along * 0.68)))]

  const flood = (col: number, row: number) => {
    if (col < 0 || row < 0 || col >= width || row >= height) return
    const index = row * width + col
    if (cells[index].terrain === 'road') return
    cells[index] = { ...cells[index], terrain: 'water', elevation: 0 }
  }
  const raiseWalls = (col: number, row: number) => {
    for (const next of neighborHexes(col, row, width, height)) {
      const index = next.row * width + next.col
      if (cells[index].terrain === 'water' || cells[index].terrain === 'road') continue
      cells[index] = {
        ...cells[index],
        elevation: Math.max(2, cells[index].elevation),
        terrain: cells[index].terrain === 'clear' ? 'woods' : cells[index].terrain,
      }
    }
  }

  for (const origin of starts) {
    let col = fromWest ? 0 : origin
    let row = fromWest ? origin : 0
    for (let step = 0; step < inland; step += 1) {
      flood(col, row)
      raiseWalls(col, row)
      if (symmetric) {
        const mirror = mirrorOf(col, row, width, height)
        flood(mirror.col, mirror.row)
        raiseWalls(mirror.col, mirror.row)
      }
      if (fromWest) {
        col += 1
        if (random() < 0.35) row = Math.max(0, Math.min(height - 1, row + (random() < 0.5 ? -1 : 1)))
      } else {
        row += 1
        if (random() < 0.35) col = Math.max(0, Math.min(width - 1, col + (random() < 0.5 ? -1 : 1)))
      }
    }
  }
}

function flattenPlaya(cells: HexCell[], width: number, height: number) {
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index]
    if (cell.terrain === 'road' || cell.terrain === 'water') continue
    const onRim = cell.col <= 1 || cell.col >= width - 2 || cell.row <= 1 || cell.row >= height - 2
    cells[index] = onRim
      ? { ...cell, elevation: Math.max(2, cell.elevation) }
      : { ...cell, elevation: 0 }
  }
}

function carveOpenPit(cells: HexCell[], width: number, height: number, symmetric: boolean) {
  const center = {
    col: Math.floor((width - 1) / 2),
    row: Math.floor((height - 1) / 2),
  }
  const foci = symmetric
    ? [center, mirrorOf(center.col, center.row, width, height)]
    : [center]
  const dist = (cell: HexCell) =>
    Math.min(...foci.map((focus) => hexDistance(cell, focus)))

  for (let index = 0; index < cells.length; index += 1) {
    if (cells[index].terrain === 'road') continue
    const distance = dist(cells[index])
    if (distance <= 1) {
      cells[index] = { ...cells[index], terrain: 'water', elevation: 0, feature: undefined }
    } else if (distance === 2) {
      cells[index] = { ...cells[index], terrain: 'rough', elevation: 0 }
    } else if (distance === 3) {
      cells[index] = { ...cells[index], terrain: 'rough', elevation: 1 }
    } else if (distance === 4) {
      cells[index] = {
        ...cells[index],
        terrain: cells[index].terrain === 'water' ? 'rough' : cells[index].terrain,
        elevation: Math.max(2, cells[index].elevation),
      }
    } else if (distance === 5) {
      cells[index] = {
        ...cells[index],
        terrain: cells[index].terrain === 'water' ? 'rough' : cells[index].terrain,
        elevation: Math.max(3, cells[index].elevation),
      }
    }
  }
  if (cells.some((cell) => cell.terrain === 'water')) return
  stampMirrored(
    cells,
    center.row * width + center.col,
    { terrain: 'water', elevation: 0 },
    width,
    height,
    symmetric,
  )
}

function wanderRim(
  width: number,
  base: number,
  min: number,
  max: number,
  random: () => number,
) {
  const phase = random() * Math.PI * 2
  const cycles = 1.15 + random() * 1.7
  const amp = Math.max(1, Math.min(max - min, 0.9 + random() * 1.2))
  const rim: number[] = []
  for (let col = 0; col < width; col += 1) {
    const t = col / Math.max(1, width - 1)
    let next = Math.round(base + Math.sin(t * Math.PI * cycles + phase) * amp)
    if (random() < 0.24) next += random() < 0.5 ? -1 : 1
    next = Math.max(min, Math.min(max, next))
    if (rim.length > 0) {
      next = Math.max(rim[rim.length - 1] - 1, Math.min(rim[rim.length - 1] + 1, next))
    }
    rim.push(next)
  }
  return rim
}

function inLatitude(row: number, lo: number, hi: number) {
  return row >= lo && row <= hi
}

function eastOf(
  col: number,
  row: number,
  width: number,
  height: number,
  lo: number,
  hi: number,
) {
  return neighborHexes(col, row, width, height).filter(
    (next) => next.col === col + 1 && inLatitude(next.row, lo, hi),
  )
}

function alongColumn(
  col: number,
  row: number,
  width: number,
  height: number,
  lo: number,
  hi: number,
) {
  return neighborHexes(col, row, width, height).filter(
    (next) => next.col === col && next.row !== row && inLatitude(next.row, lo, hi),
  )
}

function pickOffset(items: { col: number; row: number }[], random: () => number) {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))]
}

/** Rows at the pre-seam column whose 180° partner is an adjacent hex. */
function canyonSeamGoals(
  lastCol: number,
  width: number,
  height: number,
  lo: number,
  hi: number,
) {
  const goals: { col: number; row: number }[] = []
  for (let row = lo; row <= hi; row += 1) {
    const here = { col: lastCol, row }
    const other = mirrorOf(lastCol, row, width, height)
    if (here.col === other.col && here.row === other.row) {
      goals.push(here)
      continue
    }
    if (hexDistance(here, other) === 1) goals.push(here)
  }
  return goals
}

/** East-or-kink walk, at most two hexes per column, from start to the seam cell. */
function canyonHomePath(
  start: { col: number; row: number },
  goal: { col: number; row: number },
  width: number,
  height: number,
  lo: number,
  hi: number,
) {
  const idOf = (col: number, row: number) => `${col}:${row}`
  const parent = new Map<string, { col: number; row: number } | null>()
  parent.set(idOf(start.col, start.row), null)
  const queue = [{ col: start.col, row: start.row }]
  while (queue.length > 0) {
    const current = queue.shift()!
    if (current.col === goal.col && current.row === goal.row) {
      const path = [current]
      let cursor: { col: number; row: number } | null | undefined = parent.get(
        idOf(current.col, current.row),
      )
      while (cursor) {
        path.push(cursor)
        cursor = parent.get(idOf(cursor.col, cursor.row))
      }
      path.reverse()
      return path
    }
    const prior = parent.get(idOf(current.col, current.row))
    const kinked = Boolean(prior && prior.col === current.col)
    const nexts = [
      ...(kinked ? [] : alongColumn(current.col, current.row, width, height, lo, hi)),
      ...eastOf(current.col, current.row, width, height, lo, hi).filter(
        (next) => next.col <= goal.col,
      ),
    ]
    for (const next of nexts) {
      if (next.col < start.col || next.col > goal.col) continue
      const key = idOf(next.col, next.row)
      if (parent.has(key)) continue
      parent.set(key, current)
      queue.push(next)
    }
  }
  return undefined
}

function walkCanyonRoad(
  width: number,
  height: number,
  random: () => number,
  symmetric: boolean,
  inset: number,
) {
  const lo = inset
  const hi = Math.max(lo, height - 1 - inset)
  const lastCol = symmetric
    ? Math.floor(width / 2) - (width % 2 === 0 ? 1 : 0)
    : width - 1
  const stopCol = Math.max(0, lastCol)
  const cells: { col: number; row: number }[] = []
  const seen = new Set<string>()
  const push = (col: number, row: number) => {
    const key = `${col}:${row}`
    if (seen.has(key)) return false
    seen.add(key)
    cells.push({ col, row })
    return true
  }
  const countIn = (col: number) => cells.filter((cell) => cell.col === col).length

  let col = 0
  let row = lo + Math.floor(random() * (hi - lo + 1))
  let heading = random() < 0.5 ? -1 : 1
  let untilKink = 2 + Math.floor(random() * 5)
  const jogAt = 1 + Math.floor(random() * Math.max(1, stopCol - 2))
  push(col, row)

  const goals = symmetric ? canyonSeamGoals(stopCol, width, height, lo, hi) : []
  const goalRow =
    goals.length > 0
      ? goals.slice().sort((a, b) => Math.abs(a.row - row) - Math.abs(b.row - row))[0].row
      : Math.round((lo + hi) / 2)

  const tryKink = (prefer?: number) => {
    if (countIn(col) >= 2) return false
    const sides = alongColumn(col, row, width, height, lo, hi)
    if (sides.length === 0) return false
    const choice =
      prefer === undefined
        ? (() => {
            const along = sides.filter((side) => Math.sign(side.row - row) === heading)
            return along.length > 0 && random() < 0.72 ? pickOffset(along, random) : pickOffset(sides, random)
          })()
        : sides.slice().sort((a, b) => Math.abs(a.row - prefer) - Math.abs(b.row - prefer))[0]
    row = choice.row
    return push(col, row)
  }

  const stepEast = (prefer?: number) => {
    const east = eastOf(col, row, width, height, lo, hi)
    if (east.length === 0) return false
    const next =
      prefer === undefined
        ? (() => {
            const along = east.filter(
              (side) => side.row === row || Math.sign(side.row - row) === heading,
            )
            return along.length > 0 && random() < 0.68 ? pickOffset(along, random) : pickOffset(east, random)
          })()
        : east.slice().sort((a, b) => Math.abs(a.row - prefer) - Math.abs(b.row - prefer))[0]
    col = next.col
    row = next.row
    return push(col, row)
  }

  while (col < stopCol) {
    const remaining = stopCol - col
    const need = Math.abs(row - goalRow)
    if (symmetric && remaining <= Math.max(2, need)) break
    untilKink -= 1
    const forceJog = col === jogAt && countIn(col) < 2
    if (forceJog || untilKink <= 0 || random() < 0.18) {
      if (tryKink(symmetric && remaining <= need + 2 ? goalRow : undefined)) {
        if (random() < 0.42) heading = -heading
      }
      untilKink = 2 + Math.floor(random() * 5)
    }
    if (!stepEast(symmetric && remaining <= need + 2 ? goalRow : undefined)) {
      if (!tryKink()) break
    }
  }

  if (symmetric && goals.length > 0) {
    const ranked = goals
      .slice()
      .sort((a, b) => Math.abs(a.row - row) - Math.abs(b.row - row))
    let homed = false
    for (const goal of ranked) {
      const home = canyonHomePath({ col, row }, goal, width, height, lo, hi)
      if (!home) continue
      for (const cell of home.slice(1)) push(cell.col, cell.row)
      col = goal.col
      row = goal.row
      homed = true
      break
    }
    if (!homed) {
      while (col < stopCol && stepEast(goalRow)) {
        /* keep walking east toward the seam */
      }
      tryKink(goalRow)
    }
  } else {
    while (col < stopCol) {
      if (!stepEast() && !tryKink()) break
    }
  }

  if (symmetric) {
    for (const cell of [...cells]) {
      const other = mirrorOf(cell.col, cell.row, width, height)
      push(other.col, other.row)
    }
  }
  return cells
}

function carveCanyonRoad(
  cells: HexCell[],
  width: number,
  height: number,
  random: () => number,
  symmetric: boolean,
  maxElevation: number,
) {
  const baseFloor = Math.max(1, Math.round(height / 8))
  const wallBand = 2
  const maxRadius = Math.max(baseFloor + 1, Math.min(3, Math.floor(height / 3)))
  const inset = Math.min(Math.floor((height - 1) / 2), baseFloor + 1)
  // One hex per column cannot wander on this odd-r grid: even rows lock due
  // east, and 180° symmetry then collapses every mapsheet onto the same seam.
  const path = walkCanyonRoad(width, height, random, symmetric, inset)
  const roadAt = new Set(path.map((cell) => `${cell.col}:${cell.row}`))
  const span = Array.from({ length: width }, () => ({ min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }))
  for (const cell of path) {
    span[cell.col].min = Math.min(span[cell.col].min, cell.row)
    span[cell.col].max = Math.max(span[cell.col].max, cell.row)
  }
  for (let col = 0; col < width; col += 1) {
    if (Number.isFinite(span[col].min)) continue
    const nearest = path.reduce(
      (best, cell) => (Math.abs(cell.col - col) < Math.abs(best.col - col) ? cell : best),
      path[0] ?? { col: 0, row: Math.floor(height / 2) },
    )
    span[col] = { min: nearest.row, max: nearest.row }
  }
  const peak = Math.max(2, Math.min(MAX_ELEVATION, Math.max(maxElevation, 2)))
  const wallInner = Math.min(peak, 3)
  const wallOuter = peak
  const northRim = wanderRim(width, baseFloor, 1, maxRadius, random)
  const southRim = symmetric ? northRim.slice().reverse() : wanderRim(width, baseFloor, 1, maxRadius, random)

  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index]
    const band = span[cell.col]
    const onRoad = roadAt.has(`${cell.col}:${cell.row}`)
    if (onRoad || (cell.row >= band.min && cell.row <= band.max)) {
      cells[index] = {
        col: cell.col,
        row: cell.row,
        terrain: onRoad ? 'road' : 'clear',
        elevation: 0,
      }
      continue
    }
    const signed = cell.row < band.min ? cell.row - band.min : cell.row - band.max
    const floorHere = signed < 0 ? northRim[cell.col] : southRim[cell.col]
    const distance = Math.abs(signed)
    if (distance <= floorHere) {
      cells[index] = { col: cell.col, row: cell.row, terrain: 'clear', elevation: 0 }
      continue
    }
    if (distance <= floorHere + wallBand) {
      const inner = distance === floorHere + 1
      cells[index] = {
        col: cell.col,
        row: cell.row,
        terrain: 'rough',
        elevation: inner ? wallInner : wallOuter,
        feature: inner ? 'cliff' : wallOuter >= 3 ? 'scree' : undefined,
      }
      continue
    }
    const washout = cell.terrain === 'water' || cell.terrain === 'road' || cell.terrain === 'lava'
    cells[index] = {
      ...cell,
      terrain: washout ? 'rough' : cell.terrain,
      elevation: Math.max(cell.elevation, 2),
      feature: washout ? undefined : cell.feature,
    }
  }
}

function placeDryWashes(cells: HexCell[], width: number, height: number, symmetric: boolean) {
  stampFeature(cells, 'dryWash', (cell) => cell.terrain === 'water')
  if (cells.some((cell) => cell.feature === 'dryWash')) return
  const open = cells.findIndex((cell) => cell.terrain !== 'road')
  if (open >= 0) {
    stampMirrored(cells, open, { terrain: 'water', elevation: 0, feature: 'dryWash' }, width, height, symmetric)
  }
}

function placeCrevasses(
  cells: HexCell[],
  width: number,
  height: number,
  count: number,
  random: () => number,
  symmetric: boolean,
) {
  const candidates = cells.filter(
    (cell) =>
      (cell.feature === 'ice' || cell.terrain === 'water' || cell.terrain === 'rough') &&
      cell.feature !== 'crevasse',
  )
  for (let placed = 0; placed < count && candidates.length > 0; placed += 1) {
    const pick = candidates.splice(Math.floor(random() * candidates.length), 1)[0]
    const positions = symmetric
      ? [pick, mirrorOf(pick.col, pick.row, width, height)]
      : [pick]
    for (const pos of positions) {
      const index = pos.row * width + pos.col
      cells[index] = { ...cells[index], feature: 'crevasse' }
    }
  }
  if (cells.some((cell) => cell.feature === 'crevasse')) return
  const fallback = cells.findIndex((cell) => cell.terrain !== 'road')
  if (fallback >= 0) stampMirrored(cells, fallback, { feature: 'crevasse' }, width, height, symmetric)
}

function placeCanopyGaps(cells: HexCell[], width: number, height: number, symmetric: boolean) {
  const wooded = (cell: HexCell) => cell.terrain === 'woods' || cell.terrain === 'heavyWoods'
  stampFeature(cells, 'canopyGap', (cell) => {
    if (cell.terrain !== 'clear') return false
    return (
      neighborHexes(cell.col, cell.row, width, height).filter((next) =>
        wooded(cells[next.row * width + next.col]),
      ).length >= 3
    )
  })
  if (cells.some((cell) => cell.feature === 'canopyGap')) return
  const grove = cells.findIndex((cell) => wooded(cell))
  if (grove >= 0) {
    stampMirrored(cells, grove, { terrain: 'clear', feature: 'canopyGap' }, width, height, symmetric)
  }
}

function placeBeaches(cells: HexCell[], width: number, height: number, symmetric: boolean) {
  stampFeature(cells, 'beach', (cell) => {
    if (cell.terrain !== 'clear' || cell.feature) return false
    return neighborHexes(cell.col, cell.row, width, height).some(
      (next) => cells[next.row * width + next.col].terrain === 'water',
    )
  })
  if (cells.some((cell) => cell.feature === 'beach')) return
  const shore = cells.findIndex((cell) => {
    if (cell.feature || cell.terrain === 'water' || cell.terrain === 'road') return false
    return neighborHexes(cell.col, cell.row, width, height).some(
      (next) => cells[next.row * width + next.col].terrain === 'water',
    )
  })
  if (shore >= 0) {
    stampMirrored(cells, shore, { terrain: 'clear', feature: 'beach' }, width, height, symmetric)
    return
  }
  const spit = cells.findIndex((cell) => {
    if (cell.terrain !== 'water' || cell.feature) return false
    return neighborHexes(cell.col, cell.row, width, height).some((next) => {
      const other = cells[next.row * width + next.col]
      return other.terrain !== 'water' && other.terrain !== 'road'
    })
  })
  if (spit >= 0) {
    stampMirrored(
      cells,
      spit,
      { terrain: 'clear', elevation: 0, feature: 'beach' },
      width,
      height,
      symmetric,
    )
  }
}

function placeCliffs(cells: HexCell[], width: number, height: number, symmetric: boolean) {
  stampFeature(cells, 'cliff', (cell) => {
    if (cell.terrain !== 'rough' || cell.elevation < 2) return false
    return neighborHexes(cell.col, cell.row, width, height).some((next) => {
      const other = cells[next.row * width + next.col]
      return other.terrain === 'water' || other.elevation <= cell.elevation - 2
    })
  })
  if (cells.some((cell) => cell.feature === 'cliff')) return
  let best = -1
  let bestScore = -1
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index]
    if (cell.feature || cell.terrain === 'water' || cell.terrain === 'road') continue
    const nextToWater = neighborHexes(cell.col, cell.row, width, height).some(
      (next) => cells[next.row * width + next.col].terrain === 'water',
    )
    if (!nextToWater) continue
    if (cell.elevation > bestScore) {
      bestScore = cell.elevation
      best = index
    }
  }
  if (best >= 0) {
    stampMirrored(
      cells,
      best,
      { terrain: 'rough', elevation: Math.max(2, cells[best].elevation), feature: 'cliff' },
      width,
      height,
      symmetric,
    )
  }
}

function placeWalls(
  cells: HexCell[],
  buildings: Building[],
  width: number,
  height: number,
  random: () => number,
  military: boolean,
) {
  const occupied = new Set(
    buildings.flatMap((building) =>
      buildingCells(building).map((cell) => `${cell.col}:${cell.row}`),
    ),
  )
  for (const cell of cells) {
    if (cell.feature || occupied.has(`${cell.col}:${cell.row}`)) continue
    if (cell.terrain === 'water' || cell.terrain === 'road' || cell.terrain === 'lava') continue
    const neighbors = neighborHexes(cell.col, cell.row, width, height)
    const nearBuilding = neighbors.some((next) => occupied.has(`${next.col}:${next.row}`))
    const nearStreet = neighbors.some(
      (next) => cells[next.row * width + next.col].terrain === 'road',
    )
    if (!nearBuilding && !nearStreet) continue
    if (random() > (military ? 0.16 : 0.09)) continue
    cells[cell.row * width + cell.col] = { ...cell, feature: 'wall' }
  }
  if (cells.some((cell) => cell.feature === 'wall')) return
  for (const cell of cells) {
    if (cell.feature || occupied.has(`${cell.col}:${cell.row}`)) continue
    if (cell.terrain === 'water' || cell.terrain === 'road' || cell.terrain === 'lava') continue
    const near = neighborHexes(cell.col, cell.row, width, height).some(
      (next) =>
        occupied.has(`${next.col}:${next.row}`) ||
        cells[next.row * width + next.col].terrain === 'road',
    )
    if (!near) continue
    cells[cell.row * width + cell.col] = { ...cell, feature: 'wall' }
    return
  }
}

function placeSpores(cells: HexCell[], width: number, height: number, symmetric: boolean) {
  stampFeature(cells, 'spore', (cell) => {
    if (cell.feature) return false
    if (cell.terrain === 'clear') {
      return neighborHexes(cell.col, cell.row, width, height).some((next) => {
        const other = cells[next.row * width + next.col]
        return other.terrain === 'woods' || other.terrain === 'heavyWoods'
      })
    }
    return (cell.terrain === 'woods' || cell.terrain === 'heavyWoods') && (cell.col + cell.row) % 3 === 0
  })
  if (cells.some((cell) => cell.feature === 'spore')) return
  const open = cells.findIndex((cell) => cell.terrain !== 'road')
  if (open >= 0) stampMirrored(cells, open, { feature: 'spore' }, width, height, symmetric)
}

function placeCrystals(cells: HexCell[], width: number, height: number, symmetric: boolean) {
  stampFeature(cells, 'crystal', (cell) => {
    if (cell.feature) return false
    if (cell.terrain === 'rough') return cell.elevation >= 1 || cell.col % 2 === 0
    return (cell.terrain === 'woods' || cell.terrain === 'heavyWoods') && cell.row % 2 === 0
  })
  if (cells.some((cell) => cell.feature === 'crystal')) return
  const ridge = cells.findIndex((cell) => cell.terrain !== 'road' && cell.terrain !== 'water')
  if (ridge >= 0) stampMirrored(cells, ridge, { feature: 'crystal' }, width, height, symmetric)
}

function placeScree(cells: HexCell[], width: number, height: number) {
  const snapshot = cells.slice()
  for (const cell of snapshot) {
    // No elevation cap on the scree cell itself: the smoothed field means
    // ground next to peaks is rarely low, so scree lives on the slopes too.
    if (cell.terrain !== 'rough' || cell.feature) continue
    const nearHighGround = neighborHexes(cell.col, cell.row, width, height).some((next) => {
      const other = snapshot[next.row * width + next.col]
      return other.elevation >= 3
    })
    if (nearHighGround) {
      cells[cell.row * width + cell.col] = { ...cells[cell.row * width + cell.col], feature: 'scree' }
    }
  }
}

export function generateMap(settings: GeneratorSettings): BattleMap {
  const biome = getBiome(settings.biome)
  const width = Math.max(MIN_MAP_SIZE, Math.min(MAX_MAP_WIDTH, Math.round(settings.width)))
  const height = Math.max(MIN_MAP_SIZE, Math.min(MAX_MAP_HEIGHT, Math.round(settings.height)))
  const symmetric = settings.symmetric
  const random = mulberry32(hashSeed(settings.seed || 'atlas'))
  const moisture = makeField(width, height, random, 3, symmetric)
  const ruggedness = makeField(width, height, random, 3, symmetric)
  const forest = makeField(width, height, random, 3 + biome.generation.forestPasses, symmetric)
  const elevationField = makeField(width, height, random, 3, symmetric)

  const cells: HexCell[] = []
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const index = row * width + col
      const terrain = chooseTerrain(
        moisture[index],
        ruggedness[index],
        forest[index],
        settings,
        biome,
      )
      const elevation =
        terrain === 'water'
          ? 0
          : Math.max(
              0,
              Math.min(
                settings.elevation,
                Math.round(
                  applyContrast(elevationField[index], biome.generation.elevationContrast) *
                    (settings.elevation + 0.65) -
                    0.35,
                ),
              ),
            )
      cells.push({ col, row, terrain, elevation })
    }
  }
  const buildings: Building[] = []
  if (shouldPlaceCountrysideRoad(biome, settings, random)) {
    let occupied = addRoad(cells, width, height, random, symmetric)
    if (settings.roadNetwork) {
      const extras = height >= 16 ? 2 : 1
      for (let index = 0; index < extras; index += 1) {
        occupied = addRoad(cells, width, height, random, symmetric, occupied)
      }
    }
  }
  if (settings.river && biome.generation.river && settings.terrain.water > 0) {
    carveRiver(cells, width, height, random, symmetric)
  }
  if (biome.generation.streets) {
    layStreets(cells, width, height, random, symmetric)
    layRail(cells, width, height, random, symmetric)
    placeStreetBridges(cells, buildings, width, height)
  }
  if (biome.generation.districts) {
    populateDistricts(
      cells,
      buildings,
      width,
      height,
      random,
      symmetric,
      settings.urbanPreset,
      biome.generation.districtTheme ?? 'urban',
    )
  }
  if (biome.generation.channels) {
    carveChannels(cells, width, height, biome.generation.channels, random, symmetric)
  }
  if (biome.generation.lavaFlows) {
    carveLavaFlows(cells, width, height, biome.generation.lavaFlows, random, symmetric)
  }
  if (symmetric) {
    placeMirroredHills(cells, width, height, settings, random)
    placeCenterCover(cells, width, height, biome.generation.coverTerrain ?? 'woods')
  }
  if (biome.generation.craters) {
    placeCraters(cells, width, height, biome.generation.craters, random, symmetric)
  }
  if (biome.generation.scree) placeScree(cells, width, height)
  if (biome.generation.farmsteads) {
    placeFarmsteads(cells, buildings, width, height, random)
  }
  if (biome.generation.walls) {
    placeWalls(cells, buildings, width, height, random, settings.urbanPreset === 'base')
  }
  if (biome.generation.coast) floodCoast(cells, width, height, random, symmetric)
  if (biome.generation.islands) floodArchipelago(cells, width, height, symmetric)
  if (biome.generation.fjords) carveFjords(cells, width, height, random, symmetric)
  if (biome.generation.openPit) carveOpenPit(cells, width, height, symmetric)
  if (biome.generation.playa) flattenPlaya(cells, width, height)
  if (biome.generation.canyonRoad) {
    carveCanyonRoad(cells, width, height, random, symmetric, settings.elevation)
  }
  if (biome.generation.mangroves) thickenMangroves(cells, width, height, symmetric)
  if (biome.generation.iceSheets) placeIceSheets(cells, width, height, symmetric)
  if (biome.generation.groundIce) placeGroundIce(cells, width, height, symmetric)
  if (biome.generation.dryWashes) placeDryWashes(cells, width, height, symmetric)
  if (biome.generation.crevasses) {
    placeCrevasses(cells, width, height, biome.generation.crevasses, random, symmetric)
  }
  if (biome.generation.canopyGaps) placeCanopyGaps(cells, width, height, symmetric)
  if (biome.generation.cliffs) placeCliffs(cells, width, height, symmetric)
  if (biome.generation.beaches) placeBeaches(cells, width, height, symmetric)
  if (biome.generation.reefs) placeReefs(cells, width, height, symmetric)
  if (biome.generation.spores) placeSpores(cells, width, height, symmetric)
  if (biome.generation.crystals) placeCrystals(cells, width, height, symmetric)

  return {
    version: 2,
    name: `Operation ${settings.seed || 'Atlas'}`,
    width,
    height,
    seed: settings.seed,
    biome: biome.id,
    ...(settings.colorway && settings.colorway !== 'default' ? { colorway: settings.colorway } : {}),
    generatorProfile: {
      ...settings.terrain,
      elevation: settings.elevation,
      symmetric: settings.symmetric,
      river: settings.river,
      roadChance: countrysideRoadChance(settings),
      ...(settings.roadNetwork ? { roadNetwork: true } : {}),
    },
    cells,
    buildings,
    annotations: [],
    updatedAt: new Date().toISOString(),
  }
}

export function mapStats(map: BattleMap) {
  const terrain = map.cells.reduce<Record<TerrainType, number>>(
    (counts, cell) => ({ ...counts, [cell.terrain]: counts[cell.terrain] + 1 }),
    { clear: 0, woods: 0, heavyWoods: 0, rough: 0, water: 0, road: 0, lava: 0 },
  )
  const maxElevation = map.cells.reduce((highest, cell) => Math.max(highest, cell.elevation), 0)
  return { terrain, maxElevation, total: map.cells.length }
}

export function nearestCell(
  cells: HexCell[],
  target: { col: number; row: number },
): HexCell | undefined {
  return cells.reduce<HexCell | undefined>((nearest, cell) => {
    if (!nearest) return cell
    return hexDistance(cell, target) < hexDistance(nearest, target) ? cell : nearest
  }, undefined)
}
