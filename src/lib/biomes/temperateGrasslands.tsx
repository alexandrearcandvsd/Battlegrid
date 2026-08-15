import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'tg'

export const temperateGrasslands: BiomeDefinition = {
  id: 'temperate-grasslands',
  label: 'Temperate Grasslands',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Clear', color: '#a99b6b', shortLabel: '' },
    woods: { label: 'Light Woods', color: '#66764c', shortLabel: 'W' },
    heavyWoods: { label: 'Heavy Woods', color: '#40583d', shortLabel: 'W2' },
    rough: { label: 'Rough', color: '#81715a', shortLabel: 'R' },
    water: { label: 'Water', color: '#4f8190', shortLabel: 'D' },
    road: { label: 'Road', color: '#6e6a63', shortLabel: 'Rd' },
    lava: { label: 'Lava Rock', color: '#4a3f38', shortLabel: 'Lv' },
  },
  textureDefs: (
    <>
      <filter id="tg-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="5" seed="12" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".3 0 0 0 .38  0 .28 0 0 .32  0 0 .16 0 .14  0 0 0 0 .56" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.4" diffuseConstant="0.7" lightingColor="#eadfae" result="light">
          <feDistantLight azimuth="225" elevation="48" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="tg-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.026" numOctaves="5" seed="27" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".12 0 0 0 .08  0 .36 0 0 .12  0 0 .1 0 .045  0 0 0 0 .7" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.2" diffuseConstant="0.82" lightingColor="#aeba82" result="light">
          <feDistantLight azimuth="225" elevation="42" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="tg-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="5" seed="41" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".07 0 0 0 .035  0 .25 0 0 .065  0 0 .08 0 .025  0 0 0 0 .82" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="4" diffuseConstant="0.88" lightingColor="#84966a" result="light">
          <feDistantLight azimuth="225" elevation="38" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="tg-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="5" seed="53" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".3 0 0 0 .18  0 .25 0 0 .15  0 0 .2 0 .11  0 0 0 0 .68" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5" diffuseConstant="0.9" lightingColor="#d2c19f" result="light">
          <feDistantLight azimuth="225" elevation="36" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="tg-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.055" numOctaves="4" seed="68" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".05 0 0 0 .035  0 .2 0 0 .18  0 0 .32 0 .3  0 0 0 0 .62" result="color" />
        <feSpecularLighting in="noise" surfaceScale="2.2" specularConstant="0.55" specularExponent="12" lightingColor="#d7eeeb" result="light">
          <feDistantLight azimuth="225" elevation="52" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="tg-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.34" numOctaves="4" seed="79" stitchTiles="stitch" result="fine" />
        <feTurbulence type="turbulence" baseFrequency="0.055" numOctaves="2" seed="14" stitchTiles="stitch" result="wear" />
        <feBlend in="fine" in2="wear" mode="multiply" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .14  0 .19 0 0 .13  0 0 .16 0 .11  0 0 0 0 .64" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.2" diffuseConstant="0.78" lightingColor="#d2cbb8" result="light">
          <feDistantLight azimuth="225" elevation="48" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="tg-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="4" seed="97" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".16 0 0 0 .06  0 .1 0 0 .045  0 0 .07 0 .03  0 0 0 0 .8" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.6" diffuseConstant="0.8" lightingColor="#9a7050" result="light">
          <feDistantLight azimuth="225" elevation="44" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 28, water: 13, rough: 21, elevation: 3 },
    forestPasses: 0,
    heavyWoodsBias: 0.1,
    elevationContrast: 1,
    road: 'auto',
    river: true,
    coverTerrain: 'woods',
  },
  elevation: {
    ramp: [
      'rgba(196, 188, 148, 0.26)',
      'rgba(232, 196, 108, 0.5)',
      'rgba(196, 140, 78, 0.64)',
      'rgba(252, 246, 220, 0.76)',
    ],
    rimShadow: 'rgba(17, 23, 18, 0.95)',
    rimLight: 'rgba(246, 232, 186, 0.95)',
    label: '#efe4c8',
  },
  road: {
    band: '#46443c',
    centerline: '#d8c98a',
  },
}
