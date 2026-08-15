import type { BiomeId } from './biome'
import type { Building } from './building'

export const TERRAIN_TYPES = [
  'clear',
  'woods',
  'heavyWoods',
  'rough',
  'water',
  'road',
  'lava',
] as const

export type TerrainType = (typeof TERRAIN_TYPES)[number]

/** Universal terrain identity: what a tile IS, independent of biome flavor. */
export const TERRAIN_LABELS: Record<TerrainType, string> = {
  clear: 'Clear',
  woods: 'Light Woods',
  heavyWoods: 'Heavy Woods',
  rough: 'Rough',
  water: 'Water',
  road: 'Road',
  lava: 'Lava',
}

export const MAX_ELEVATION = 4

export const MIN_MAP_SIZE = 6
export const MAX_MAP_WIDTH = 48
export const MAX_MAP_HEIGHT = 34

export const COLORWAYS = ['default', 'arid', 'lush', 'twilight'] as const

export type Colorway = (typeof COLORWAYS)[number]

export const COLORWAY_LABELS: Record<Colorway, string> = {
  default: 'Default',
  arid: 'Arid',
  lush: 'Lush',
  twilight: 'Twilight',
}

export const CELL_FEATURES = [
  'crater',
  'scree',
  'ice',
  'crevasse',
  'dryWash',
  'canopyGap',
  'beach',
  'cliff',
  'wall',
  'reef',
  'spore',
  'crystal',
] as const

export type CellFeature = (typeof CELL_FEATURES)[number]

export const FEATURE_LABELS: Record<CellFeature, string> = {
  crater: 'Crater',
  scree: 'Scree',
  ice: 'Ice',
  crevasse: 'Crevasse',
  dryWash: 'Dry wash',
  canopyGap: 'Canopy gap',
  beach: 'Beach',
  cliff: 'Cliff',
  wall: 'Wall',
  reef: 'Reef',
  spore: 'Spore field',
  crystal: 'Crystal',
}

export interface HexCell {
  col: number
  row: number
  terrain: TerrainType
  elevation: number
  isProtected?: boolean
  feature?: CellFeature
  /** Optional visual variant from another biome (e.g. 'hot-desert:water' = Oasis). */
  skin?: string
}

export interface GeneratorProfile extends TerrainWeights {
  elevation: number
  symmetric?: boolean
  river?: boolean
  /** 0–100 chance the east–west countryside road was requested. */
  roadChance?: number
  /** Extra east–west countryside roads besides the primary crossing. */
  roadNetwork?: boolean
}

export interface Annotation {
  id: string
  col: number
  row: number
  text: string
}

export type EditLayer = 'terrain' | 'elevation' | 'structures' | 'annotations'

export const EDIT_LAYERS: EditLayer[] = ['terrain', 'elevation', 'structures', 'annotations']

export interface BattleMap {
  version: 2
  name: string
  width: number
  height: number
  seed: string
  /** Maps saved before biomes existed omit this and resolve to Temperate Grasslands. */
  biome?: BiomeId
  /** Visual-only regional palette; omitted maps use the biome default. */
  colorway?: Colorway
  generatorProfile?: GeneratorProfile
  cells: HexCell[]
  buildings: Building[]
  annotations: Annotation[]
  updatedAt: string
}

export interface TerrainWeights {
  woods: number
  water: number
  rough: number
}

export interface GeneratorSettings {
  biome: BiomeId
  width: number
  height: number
  seed: string
  terrain: TerrainWeights
  elevation: number
  /** Mirror-average the noise fields and mirror placed features for fair sides. */
  symmetric: boolean
  /** Carve a river across the map (biome permitting and water weight > 0). */
  river: boolean
  /** 0–100 chance to lay the east–west countryside road. Default 100. */
  roadChance?: number
  /** Extra east–west countryside roads besides the primary crossing. */
  roadNetwork?: boolean
  /** Urban density preset id; only consumed by the Urban biome's district pass. */
  urbanPreset?: string
  /** Visual-only regional palette variant. Does not change generated cells. */
  colorway?: Colorway
}

export interface BrushSettings {
  terrain: TerrainType
  size: 1 | 2
  tool: 'brush' | 'fill' | 'select' | 'lasso' | 'scatter' | 'rubble' | 'path'
  elevationMode: 'paint' | 'raise' | 'lower' | 'set'
  targetElevation: number
  /** When not 'none', brush strokes place or clear a cell feature instead of terrain. */
  mark: 'none' | CellFeature
  /** Paint a biome variant skin over the base terrain; undefined keeps the map's biome look. */
  skin?: string
}
