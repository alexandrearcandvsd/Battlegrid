import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'wl'

export const wetlands: BiomeDefinition = {
  id: 'wetlands',
  label: 'Wetlands',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Mire', color: '#6b6b4a', shortLabel: '' },
    woods: { label: 'Reedbed', color: '#5a6b3f', shortLabel: 'W' },
    heavyWoods: { label: 'Swamp Thicket', color: '#3a4a30', shortLabel: 'W2' },
    rough: { label: 'Hummock', color: '#6a5c44', shortLabel: 'R' },
    water: { label: 'Marsh Water', color: '#46685c', shortLabel: 'D' },
    road: { label: 'Causeway', color: '#6f6650', shortLabel: 'Rd' },
    lava: { label: 'Mudflow', color: '#453f36', shortLabel: 'Lv' },
  },
  textureDefs: (
    <>
      <filter id="wl-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.024 0.04" numOctaves="5" seed="20" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".22 0 0 0 .18  0 .24 0 0 .18  0 0 .12 0 .08  0 0 0 0 .6" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.6" diffuseConstant="0.74" lightingColor="#c9c896" result="light">
          <feDistantLight azimuth="225" elevation="42" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="wl-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.05 0.02" numOctaves="5" seed="35" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".1 0 0 0 .07  0 .26 0 0 .1  0 0 .08 0 .04  0 0 0 0 .72" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3" diffuseConstant="0.82" lightingColor="#9aa864" result="light">
          <feDistantLight azimuth="225" elevation="44" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="wl-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="6" seed="47" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".06 0 0 0 .03  0 .19 0 0 .06  0 0 .06 0 .024  0 0 0 0 .84" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="4.6" diffuseConstant="0.9" lightingColor="#637a4c" result="light">
          <feDistantLight azimuth="225" elevation="38" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="wl-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.036" numOctaves="5" seed="63" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".22 0 0 0 .14  0 .2 0 0 .12  0 0 .13 0 .07  0 0 0 0 .68" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.4" diffuseConstant="0.82" lightingColor="#a5986e" result="light">
          <feDistantLight azimuth="225" elevation="38" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="wl-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.06" numOctaves="4" seed="77" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".05 0 0 0 .04  0 .18 0 0 .14  0 0 .2 0 .16  0 0 0 0 .6" result="color" />
        <feSpecularLighting in="noise" surfaceScale="1.6" specularConstant="0.4" specularExponent="10" lightingColor="#cfe0cc" result="light">
          <feDistantLight azimuth="225" elevation="48" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="wl-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="4" seed="89" stitchTiles="stitch" result="fine" />
        <feTurbulence type="fractalNoise" baseFrequency="0.042" numOctaves="2" seed="17" stitchTiles="stitch" result="wear" />
        <feBlend in="fine" in2="wear" mode="multiply" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .14  0 .18 0 0 .12  0 0 .12 0 .08  0 0 0 0 .64" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.9" diffuseConstant="0.74" lightingColor="#c4b894" result="light">
          <feDistantLight azimuth="225" elevation="42" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="wl-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="105" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".14 0 0 0 .06  0 .12 0 0 .05  0 0 .09 0 .035  0 0 0 0 .8" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.4" diffuseConstant="0.85" lightingColor="#8a7a5c" result="light">
          <feDistantLight azimuth="225" elevation="40" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 22, water: 30, rough: 8, elevation: 1 },
    forestPasses: 1,
    heavyWoodsBias: 0.15,
    elevationContrast: 0.8,
    road: 'auto',
    channels: 3,
    river: false,
    coverTerrain: 'woods',
  },
  elevation: {
    ramp: [
      'rgba(196, 200, 140, 0.28)',
      'rgba(200, 178, 104, 0.5)',
      'rgba(168, 140, 78, 0.62)',
      'rgba(242, 236, 200, 0.74)',
    ],
    rimShadow: 'rgba(12, 16, 10, 0.95)',
    rimLight: 'rgba(222, 226, 170, 0.9)',
    label: '#e2e6c2',
  },
  road: {
    band: '#4a453a',
    centerline: '#c9bd8f',
  },
}
