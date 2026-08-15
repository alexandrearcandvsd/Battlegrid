import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'co'

export const coastal: BiomeDefinition = {
  id: 'coastal',
  label: 'Coastal',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Dune', color: '#d2c08a', shortLabel: '' },
    woods: { label: 'Coastal Scrub', color: '#6a7a4a', shortLabel: 'S' },
    heavyWoods: { label: 'Sea Pine', color: '#3e5236', shortLabel: 'S2' },
    rough: { label: 'Rocky Shore', color: '#7a7268', shortLabel: 'R' },
    water: { label: 'Ocean', color: '#3a6e88', shortLabel: 'Oc' },
    road: { label: 'Coast Road', color: '#6a6458', shortLabel: 'Rd' },
    lava: { label: 'Tide Rock', color: '#2a3a42', shortLabel: 'Tr' },
  },
  textureDefs: (
    <>
      <filter id="co-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.07" numOctaves="4" seed="13" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".34 0 0 0 .3  0 .28 0 0 .22  0 0 .16 0 .1  0 0 0 0 .5" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.4" diffuseConstant="0.72" lightingColor="#f4e8c0" result="light">
          <feDistantLight azimuth="280" elevation="50" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="co-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.048" numOctaves="4" seed="29" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".1 0 0 0 .08  0 .22 0 0 .12  0 0 .1 0 .05  0 0 0 0 .64" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3" diffuseConstant="0.82" lightingColor="#b4c878" result="light">
          <feDistantLight azimuth="280" elevation="42" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="co-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.042" numOctaves="5" seed="43" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".06 0 0 0 .04  0 .18 0 0 .08  0 0 .08 0 .04  0 0 0 0 .78" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="4" diffuseConstant="0.86" lightingColor="#7a9a58" result="light">
          <feDistantLight azimuth="280" elevation="38" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="co-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.055" numOctaves="5" seed="59" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".22 0 0 0 .16  0 .2 0 0 .14  0 0 .18 0 .12  0 0 0 0 .7" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5.6" diffuseConstant="0.92" lightingColor="#c8c0b0" result="light">
          <feDistantLight azimuth="280" elevation="32" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="co-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.055" numOctaves="4" seed="73" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".04 0 0 0 .04  0 .16 0 0 .16  0 0 .3 0 .28  0 0 0 0 .62" result="color" />
        <feSpecularLighting in="noise" surfaceScale="2.8" specularConstant="0.7" specularExponent="14" lightingColor="#e8f6ff" result="light">
          <feDistantLight azimuth="280" elevation="56" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="co-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" seed="89" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .14  0 .18 0 0 .12  0 0 .14 0 .08  0 0 0 0 .6" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.8" diffuseConstant="0.74" lightingColor="#e0d4b0" result="light">
          <feDistantLight azimuth="280" elevation="48" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="co-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="103" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".08 0 0 0 .06  0 .1 0 0 .08  0 0 .14 0 .12  0 0 0 0 .74" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.2" diffuseConstant="0.76" lightingColor="#6a7a84" result="light">
          <feDistantLight azimuth="280" elevation="36" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 12, water: 22, rough: 18, elevation: 3 },
    forestPasses: 0,
    heavyWoodsBias: 0.1,
    elevationContrast: 1.1,
    road: 'auto',
    river: true,
    coverTerrain: 'woods',
    coast: true,
    beaches: true,
    cliffs: true,
  },
  elevation: {
    ramp: [
      'rgba(220, 204, 150, 0.28)',
      'rgba(196, 168, 110, 0.5)',
      'rgba(140, 124, 96, 0.64)',
      'rgba(244, 236, 210, 0.76)',
    ],
    rimShadow: 'rgba(18, 22, 28, 0.95)',
    rimLight: 'rgba(244, 236, 200, 0.9)',
    label: '#f0ead4',
  },
  road: {
    band: '#4a463c',
    centerline: '#e4d8a8',
  },
}
