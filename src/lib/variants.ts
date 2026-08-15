import type { BiomeId } from '../types/biome'
import { TERRAIN_LABELS, TERRAIN_TYPES, type TerrainType } from '../types/map'
import { listBiomes } from './biomes'

export interface TerrainVariant {
  id: string
  /** The underlying game terrain (elevation, fill, and link rules follow this). */
  terrain: TerrainType
  /** The biome flavor name, e.g. 'Oasis'. */
  label: string
  color: string
  /** Home biome for texture lookup; undefined variants follow the map's biome. */
  biomeId?: BiomeId
  prefix?: string
}

/** Hand-authored variants that don't belong to any single biome. */
const CUSTOM_VARIANTS: TerrainVariant[] = [
  { id: 'rail', terrain: 'road', label: 'Rail Line', color: '#5d5a52' },
]

/**
 * Every biome palette entry whose label differs from the universal terrain
 * label becomes a paintable variant tile. Derived from the biome registry, so
 * new biomes expand the variant list automatically.
 */
export const TERRAIN_VARIANTS: TerrainVariant[] = [
  ...listBiomes().flatMap((biome) =>
    TERRAIN_TYPES.filter((terrain) => biome.palette[terrain].label !== TERRAIN_LABELS[terrain]).map(
      (terrain) => ({
        id: `${biome.id}:${terrain}`,
        terrain,
        label: biome.palette[terrain].label,
        color: biome.palette[terrain].color,
        biomeId: biome.id,
        prefix: biome.prefix,
      }),
    ),
  ),
  ...CUSTOM_VARIANTS,
]

const VARIANTS_BY_ID = new Map(TERRAIN_VARIANTS.map((variant) => [variant.id, variant]))

export function getVariant(id: string): TerrainVariant | undefined {
  return VARIANTS_BY_ID.get(id)
}

export function isVariantId(value: unknown): value is string {
  return typeof value === 'string' && VARIANTS_BY_ID.has(value)
}
