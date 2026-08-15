import type { TerrainType } from '../../types/map'
import { TERRAIN_TYPES } from '../../types/map'
import { texturePatterns } from './texturePatterns'

function seedFor(prefix: string, salt: number) {
  let hash = salt
  for (let index = 0; index < prefix.length; index += 1) {
    hash = Math.imul(hash, 31) + prefix.charCodeAt(index)
  }
  return (Math.abs(hash) % 180) + 11
}

const MATRICES: Record<TerrainType, string> = {
  clear: '.28 0 0 0 .22  0 .26 0 0 .2  0 0 .16 0 .1  0 0 0 0 .52',
  woods: '.1 0 0 0 .06  0 .22 0 0 .1  0 0 .08 0 .04  0 0 0 0 .64',
  heavyWoods: '.06 0 0 0 .03  0 .18 0 0 .08  0 0 .06 0 .03  0 0 0 0 .78',
  rough: '.22 0 0 0 .16  0 .2 0 0 .14  0 0 .16 0 .1  0 0 0 0 .7',
  water: '.05 0 0 0 .04  0 .16 0 0 .14  0 0 .28 0 .24  0 0 0 0 .6',
  road: '.22 0 0 0 .14  0 .18 0 0 .12  0 0 .14 0 .08  0 0 0 0 .58',
  lava: '.16 0 0 0 .1  0 .12 0 0 .08  0 0 .12 0 .08  0 0 0 0 .72',
}

const LIGHT: Record<TerrainType, string> = {
  clear: '#e8e0c8',
  woods: '#b4c878',
  heavyWoods: '#8aaa60',
  rough: '#c8c0b0',
  water: '#dceef8',
  road: '#d8d0b8',
  lava: '#b8a898',
}

/** Shared SVG filter/pattern pack; noise seeds are namespaced by biome prefix. */
export function terrainTextureDefs(prefix: string, azimuth: number, lightElevation = 42) {
  return (
    <>
      {TERRAIN_TYPES.map((terrain) => {
        const specular = terrain === 'water' || terrain === 'lava'
        const scale = terrain === 'rough' ? 5.2 : terrain === 'heavyWoods' ? 4.2 : terrain === 'woods' ? 3.2 : 1.8
        return (
          <filter
            key={terrain}
            id={`${prefix}-filter-${terrain}`}
            x="0"
            y="0"
            width="256"
            height="256"
            filterUnits="userSpaceOnUse"
          >
            <feTurbulence
              type={terrain === 'rough' || terrain === 'road' ? 'turbulence' : 'fractalNoise'}
              baseFrequency={terrain === 'water' ? '0.018 0.05' : terrain === 'road' ? '0.12' : '0.04'}
              numOctaves={terrain === 'heavyWoods' ? 5 : 4}
              seed={seedFor(prefix, scale * 10 + terrain.length)}
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix in="noise" type="matrix" values={MATRICES[terrain]} result="color" />
            {specular ? (
              <feSpecularLighting
                in="noise"
                surfaceScale={scale}
                specularConstant="0.62"
                specularExponent="14"
                lightingColor={LIGHT[terrain]}
                result="light"
              >
                <feDistantLight azimuth={azimuth} elevation={lightElevation + 8} />
              </feSpecularLighting>
            ) : (
              <feDiffuseLighting
                in="noise"
                surfaceScale={scale}
                diffuseConstant="0.8"
                lightingColor={LIGHT[terrain]}
                result="light"
              >
                <feDistantLight azimuth={azimuth} elevation={lightElevation} />
              </feDiffuseLighting>
            )}
            <feBlend in="color" in2="light" mode={specular ? 'screen' : 'multiply'} />
          </filter>
        )
      })}
      {texturePatterns(prefix)}
    </>
  )
}
