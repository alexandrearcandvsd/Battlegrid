import { TERRAIN_TYPES } from '../../types/map'

/**
 * Wraps a biome's bespoke filters in the standard per-terrain pattern tiles.
 * Biomes supply the `<filter>` definitions; this maps every terrain's filter
 * (`{prefix}-filter-{terrain}`) to a pattern (`{prefix}-texture-{terrain}`).
 */
export function texturePatterns(prefix: string) {
  return TERRAIN_TYPES.map((terrain) => (
    <pattern
      key={terrain}
      id={`${prefix}-texture-${terrain}`}
      width="256"
      height="256"
      patternUnits="userSpaceOnUse"
    >
      <rect width="256" height="256" filter={`url(#${prefix}-filter-${terrain})`} />
    </pattern>
  ))
}
