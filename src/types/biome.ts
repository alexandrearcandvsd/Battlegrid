import type { ReactNode } from 'react'
import type { TerrainType } from './map'

export type BiomeId =
  | 'temperate-grasslands'
  | 'dense-forest'
  | 'hot-desert'
  | 'alpine-mountains'
  | 'wetlands'
  | 'volcanic'
  | 'urban'
  | 'lunar'
  | 'agricultural'
  | 'industrial-wasteland'
  | 'arctic-tundra'
  | 'badlands'
  | 'tropical-jungle'
  | 'coastal'
  | 'mediterranean-scrub'
  | 'oceanic-archipelago'
  | 'boreal-taiga'
  | 'tropical-savanna'
  | 'temperate-rainforest'
  | 'mangrove-estuary'
  | 'glacial-icefield'
  | 'karst-highlands'
  | 'alkali-salt-flats'
  | 'fjord-shore'
  | 'open-pit-extraction'
  | 'ice-moon'
  | 'canyon-road'
  | 'martian'
  | 'alien-fungal'
  | 'crystal-world'

export interface TerrainVisual {
  label: string
  shortLabel: string
  color: string
}

export interface BiomeGenerationRules {
  defaults: { woods: number; water: number; rough: number; elevation: number }
  /** Extra smoothing passes on the forest noise field; higher values clump woods. */
  forestPasses: number
  /** Width of the heavy-woods band above the woods threshold. */
  heavyWoodsBias: number
  /** Scales the elevation noise around its midpoint; 1 leaves the field unchanged. */
  elevationContrast: number
  /** 'auto' lays one road across the map; 'none' skips road placement. */
  road: 'auto' | 'none'
  /** Carve one east–west canyon with a floor road (Canyon Road theater). */
  canyonRoad?: boolean
  /** Number of meandering water channels carved from map edges (wetlands). */
  channels?: number
  /** Number of lava channels carved downhill from high ground (volcanic). */
  lavaFlows?: number
  /** Number of crater features placed on sunken rough cells (volcanic). */
  craters?: number
  /** Place scree features on rough cells at the base of high ground (alpine). */
  scree?: boolean
  /** Allow a river crossing when the user toggle and water weight permit. */
  river?: boolean
  /** Terrain used for guaranteed center cover on symmetric maps. */
  coverTerrain?: 'woods' | 'rough'
  /** Terrain types this biome never generates (manual painting is unaffected). */
  excludes?: TerrainType[]
  /** What an excluded terrain becomes during generation (e.g. water → lava). */
  substitute?: Partial<Record<TerrainType, TerrainType>>
  /** Lay a street grid instead of the single road crossing (urban). */
  streets?: boolean
  /** Zone districts and populate them with buildings (urban). */
  districts?: boolean
  /** Building mix used by the district pass. */
  districtTheme?: 'urban' | 'industrial'
  /** Scatter farmhouses and barns along roads (agricultural). */
  farmsteads?: boolean
  /** Stamp ice marks on generated water (tundra). */
  iceSheets?: boolean
  /** Number of crevasse marks on ice or rough (tundra). */
  crevasses?: number
  /** Stamp dry-wash marks on generated water (badlands). */
  dryWashes?: boolean
  /** Stamp canopy-gap marks on wooded clearings (jungle). */
  canopyGaps?: boolean
  /** Stamp beach marks on clear hexes next to water (coastal). */
  beaches?: boolean
  /** Stamp cliff marks on high rough next to a drop or water. */
  cliffs?: boolean
  /** Flood one map edge as ocean (coastal). */
  coast?: boolean
  /** Flood most of the map, keeping high ground as islands (archipelago). */
  islands?: boolean
  /** Stamp reef marks on water hexes next to land. */
  reefs?: boolean
  /** Stamp wall marks around blocks and compounds. */
  walls?: boolean
  /** Stamp ice on clear and rough ground, not only water (icefield, ice moon). */
  groundIce?: boolean
  /** Convert shores to woods so trees stand in the shallows (mangrove). */
  mangroves?: boolean
  /** Carve deep water inlets with steep wooded walls (fjord). */
  fjords?: boolean
  /** Flatten the interior and raise a rim (salt flats). */
  playa?: boolean
  /** Excavate a flooded pit with terraced benches (open-pit). */
  openPit?: boolean
  /** Stamp spore-field marks on fungal woods and clearings. */
  spores?: boolean
  /** Stamp crystal outcrops on mineral ridges and groves. */
  crystals?: boolean
}

export interface BiomeElevationStyle {
  /** Flat overlay tint per level; index 0 paints level 1, index 3 paints level 4. */
  ramp: [string, string, string, string]
  rimShadow: string
  rimLight: string
  /** Text color for elevation badges. */
  label: string
}

export interface BiomeRoadStyle {
  /** Dark asphalt band drawn under the centerline. */
  band: string
  /** Dashed painted centerline. */
  centerline: string
}

export interface BiomeSnowLine {
  /** Cells at or above this elevation render the snow overlay. */
  level: number
  color: string
}

export interface BiomeDefinition {
  id: BiomeId
  label: string
  /** Texture id namespace, e.g. 'tg' for `tg-texture-clear`. */
  prefix: string
  palette: Record<TerrainType, TerrainVisual>
  /** Bespoke SVG <filter>/<pattern> definitions; every id is namespaced by biome. */
  textureDefs: ReactNode
  /** `url(#...)` fill reference for a terrain's texture pattern. */
  textureRef: (terrain: TerrainType) => string
  generation: BiomeGenerationRules
  elevation: BiomeElevationStyle
  road: BiomeRoadStyle
  snowLine?: BiomeSnowLine
}
