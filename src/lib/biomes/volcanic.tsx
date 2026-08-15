import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'vc'

export const volcanic: BiomeDefinition = {
  id: 'volcanic',
  label: 'Volcanic',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Ash Field', color: '#6e665c', shortLabel: '' },
    woods: { label: 'Scorched Scrub', color: '#4d4a38', shortLabel: 'W' },
    heavyWoods: { label: 'Charred Grove', color: '#33322a', shortLabel: 'W2' },
    rough: { label: 'Basalt', color: '#3f3b38', shortLabel: 'R' },
    water: { label: 'Sulfur Pool', color: '#5d7a52', shortLabel: 'D' },
    road: { label: 'Ash Track', color: '#57504a', shortLabel: 'Rd' },
    lava: { label: 'Lava', color: '#c2502a', shortLabel: 'Lv' },
  },
  textureDefs: (
    <>
      <filter id="vc-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" seed="22" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".24 0 0 0 .16  0 .22 0 0 .14  0 0 .2 0 .12  0 0 0 0 .58" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.8" diffuseConstant="0.72" lightingColor="#c2b4a0" result="light">
          <feDistantLight azimuth="225" elevation="46" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="vc-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.046" numOctaves="5" seed="37" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".1 0 0 0 .07  0 .12 0 0 .07  0 0 .08 0 .04  0 0 0 0 .7" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.4" diffuseConstant="0.82" lightingColor="#8a8458" result="light">
          <feDistantLight azimuth="225" elevation="40" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="vc-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="6" seed="49" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".06 0 0 0 .035  0 .08 0 0 .04  0 0 .06 0 .026  0 0 0 0 .85" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5" diffuseConstant="0.9" lightingColor="#5c563e" result="light">
          <feDistantLight azimuth="225" elevation="36" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="vc-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.055" numOctaves="6" seed="65" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".14 0 0 0 .08  0 .13 0 0 .075  0 0 .12 0 .07  0 0 0 0 .8" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="6.4" diffuseConstant="0.95" lightingColor="#9a8f80" result="light">
          <feDistantLight azimuth="225" elevation="32" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="vc-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.022 0.05" numOctaves="4" seed="79" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".08 0 0 0 .08  0 .2 0 0 .12  0 0 .12 0 .06  0 0 0 0 .62" result="color" />
        <feSpecularLighting in="noise" surfaceScale="2" specularConstant="0.5" specularExponent="11" lightingColor="#e8eed2" result="light">
          <feDistantLight azimuth="225" elevation="50" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="vc-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.16" numOctaves="4" seed="91" stitchTiles="stitch" result="fine" />
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="22" stitchTiles="stitch" result="wear" />
        <feBlend in="fine" in2="wear" mode="multiply" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".16 0 0 0 .1  0 .14 0 0 .08  0 0 .12 0 .07  0 0 0 0 .66" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.4" diffuseConstant="0.78" lightingColor="#b8a894" result="light">
          <feDistantLight azimuth="225" elevation="44" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="vc-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="5" seed="107" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".5 0 0 0 .3  0 .12 0 0 .05  0 0 .05 0 .02  0 0 0 0 .85" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3" diffuseConstant="0.8" lightingColor="#ffb060" result="light">
          <feDistantLight azimuth="225" elevation="44" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 4, water: 0, rough: 26, elevation: 3 },
    forestPasses: 0,
    heavyWoodsBias: 0.06,
    elevationContrast: 1.25,
    road: 'none',
    lavaFlows: 2,
    craters: 2,
    river: false,
    coverTerrain: 'rough',
    excludes: ['water'],
    substitute: { water: 'lava' },
  },
  elevation: {
    ramp: [
      'rgba(210, 160, 110, 0.28)',
      'rgba(220, 128, 72, 0.5)',
      'rgba(176, 84, 42, 0.64)',
      'rgba(246, 214, 170, 0.74)',
    ],
    rimShadow: 'rgba(14, 10, 8, 0.96)',
    rimLight: 'rgba(255, 198, 150, 0.92)',
    label: '#f2dfc8',
  },
  road: {
    band: '#3b352f',
    centerline: '#c8b694',
  },
}
