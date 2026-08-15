import { createElement, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { BiomeDefinition, BiomeId } from '../types/biome'
import { TERRAIN_TYPES, type TerrainType } from '../types/map'
import { getBiome, listBiomes } from './biomes'

export type TextureTiles = Record<TerrainType, string>

const tileCache = new Map<BiomeId, TextureTiles>()
const inFlight = new Map<BiomeId, Promise<TextureTiles | null>>()

/**
 * Bakes a biome's live SVG-filter textures into PNG data URLs, one 256px tile
 * per terrain. Painting cached bitmaps per frame is orders of magnitude
 * cheaper than re-running feTurbulence stacks during pan/zoom.
 * Returns null when the environment can't rasterize (tests, no canvas).
 * Results are cached per biome for the lifetime of the page.
 */
export function rasterizeBiomeTextures(
  biome: BiomeDefinition,
): Promise<TextureTiles | null> {
  const cached = tileCache.get(biome.id)
  if (cached) return Promise.resolve(cached)
  const pending = inFlight.get(biome.id)
  if (pending) return pending

  const task = (async () => {
    try {
      const defs = renderToStaticMarkup(createElement(Fragment, null, biome.textureDefs))
      const entries = await Promise.all(
        TERRAIN_TYPES.map(async (terrain) => {
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">${defs}<rect width="256" height="256" fill="${biome.textureRef(terrain)}"/></svg>`
          const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
          try {
            const image = new Image()
            await new Promise<void>((resolve, reject) => {
              image.onload = () => resolve()
              image.onerror = () => reject(new Error('texture tile failed to load'))
              image.src = url
            })
            const canvas = document.createElement('canvas')
            canvas.width = 256
            canvas.height = 256
            const context = canvas.getContext('2d')
            if (!context) throw new Error('canvas 2d unavailable')
            // Lift the baked tile toward semi-realistic relief: more contrast
            // so lighting reads, a touch more saturation so biomes stay distinct.
            context.filter = 'contrast(1.18) saturate(1.08)'
            context.drawImage(image, 0, 0, 256, 256)
            return [terrain, canvas.toDataURL('image/png')] as const
          } finally {
            URL.revokeObjectURL(url)
          }
        }),
      )
      const tiles = Object.fromEntries(entries) as TextureTiles
      tileCache.set(biome.id, tiles)
      return tiles
    } catch {
      return null
    } finally {
      inFlight.delete(biome.id)
    }
  })()
  inFlight.set(biome.id, task)
  return task
}

/** Bakes every biome's tiles once (cached), reporting each as it completes. */
export function rasterizeAllBiomes(onBiome: (id: BiomeId, tiles: TextureTiles) => void) {
  for (const biome of listBiomes()) {
    void rasterizeBiomeTextures(getBiome(biome.id)).then((tiles) => {
      if (tiles) onBiome(biome.id, tiles)
    })
  }
}
