import type { BiomeDefinition } from '../../types/biome'
import { terrainTextureDefs } from './terrainFilters'

type Spec = Omit<BiomeDefinition, 'textureDefs' | 'textureRef'> & {
  azimuth: number
  lightHeight?: number
}

export function makeBiome(spec: Spec): BiomeDefinition {
  const { azimuth, lightHeight = 42, ...rest } = spec
  return {
    ...rest,
    textureDefs: terrainTextureDefs(rest.prefix, azimuth, lightHeight),
    textureRef: (terrain) => `url(#${rest.prefix}-texture-${terrain})`,
  }
}
