import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'oa'

export const oceanicArchipelago: BiomeDefinition = {
  id: 'oceanic-archipelago',
  label: 'Oceanic Archipelago',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Beach', color: '#d4c498', shortLabel: '' },
    woods: { label: 'Island Grove', color: '#4a6a44', shortLabel: 'G' },
    heavyWoods: { label: 'Upland Forest', color: '#2e4a32', shortLabel: 'G2' },
    rough: { label: 'Basalt', color: '#6a6460', shortLabel: 'R' },
    water: { label: 'Deep Ocean', color: '#2a4a62', shortLabel: 'Oc' },
    road: { label: 'Causeway', color: '#6a6458', shortLabel: 'Cw' },
    lava: { label: 'Pumice', color: '#152028', shortLabel: 'Pm' },
  },
  textureDefs: (
    <>
      <filter id="oa-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.024 0.08" numOctaves="4" seed="17" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".34 0 0 0 .3  0 .28 0 0 .22  0 0 .16 0 .1  0 0 0 0 .5" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.2" diffuseConstant="0.7" lightingColor="#f6ecd0" result="light">
          <feDistantLight azimuth="300" elevation="52" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="oa-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="31" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".08 0 0 0 .06  0 .22 0 0 .12  0 0 .1 0 .05  0 0 0 0 .64" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.2" diffuseConstant="0.84" lightingColor="#a8c878" result="light">
          <feDistantLight azimuth="300" elevation="42" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="oa-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.042" numOctaves="5" seed="49" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".05 0 0 0 .03  0 .18 0 0 .08  0 0 .08 0 .04  0 0 0 0 .78" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="4.2" diffuseConstant="0.88" lightingColor="#6a9a58" result="light">
          <feDistantLight azimuth="300" elevation="38" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="oa-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.06" numOctaves="5" seed="67" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".18 0 0 0 .14  0 .16 0 0 .12  0 0 .16 0 .12  0 0 0 0 .72" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5.8" diffuseConstant="0.94" lightingColor="#b8b4b0" result="light">
          <feDistantLight azimuth="300" elevation="30" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="oa-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.014 0.045" numOctaves="4" seed="83" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".03 0 0 0 .03  0 .12 0 0 .12  0 0 .28 0 .24  0 0 0 0 .64" result="color" />
        <feSpecularLighting in="noise" surfaceScale="3.2" specularConstant="0.76" specularExponent="16" lightingColor="#d8f0ff" result="light">
          <feDistantLight azimuth="300" elevation="58" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="oa-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" seed="97" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .14  0 .18 0 0 .12  0 0 .14 0 .08  0 0 0 0 .6" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.8" diffuseConstant="0.74" lightingColor="#d8d0b8" result="light">
          <feDistantLight azimuth="300" elevation="48" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="oa-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="113" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".06 0 0 0 .04  0 .08 0 0 .05  0 0 .1 0 .08  0 0 0 0 .76" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.4" diffuseConstant="0.72" lightingColor="#6a7884" result="light">
          <feDistantLight azimuth="300" elevation="36" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 10, water: 38, rough: 14, elevation: 4 },
    forestPasses: 0,
    heavyWoodsBias: 0.08,
    elevationContrast: 1.4,
    road: 'auto',
    river: false,
    coverTerrain: 'rough',
    islands: true,
    beaches: true,
    reefs: true,
    cliffs: true,
  },
  elevation: {
    ramp: [
      'rgba(212, 196, 150, 0.28)',
      'rgba(168, 148, 112, 0.5)',
      'rgba(110, 104, 96, 0.64)',
      'rgba(236, 232, 220, 0.76)',
    ],
    rimShadow: 'rgba(12, 18, 24, 0.96)',
    rimLight: 'rgba(236, 228, 200, 0.9)',
    label: '#e8ead8',
  },
  road: {
    band: '#3e3c36',
    centerline: '#d8d0b0',
  },
}
