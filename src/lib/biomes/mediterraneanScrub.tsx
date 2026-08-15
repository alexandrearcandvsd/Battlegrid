import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'ms'

export const mediterraneanScrub: BiomeDefinition = {
  id: 'mediterranean-scrub',
  label: 'Mediterranean Scrub',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Dry Grass', color: '#c4b06a', shortLabel: '' },
    woods: { label: 'Maquis', color: '#6a7840', shortLabel: 'S' },
    heavyWoods: { label: 'Holm Oak', color: '#3e5430', shortLabel: 'S2' },
    rough: { label: 'Rocky Hill', color: '#8a7358', shortLabel: 'R' },
    water: { label: 'Seasonal Creek', color: '#4e7a70', shortLabel: 'Ck' },
    road: { label: 'Dirt Track', color: '#7a6a54', shortLabel: 'Tk' },
    lava: { label: 'Terra Rossa', color: '#7c2e24', shortLabel: 'Tr' },
  },
  textureDefs: (
    <>
      <filter id="ms-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.022 0.07" numOctaves="4" seed="19" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".32 0 0 0 .28  0 .28 0 0 .2  0 0 .12 0 .06  0 0 0 0 .52" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.3" diffuseConstant="0.7" lightingColor="#f0e0a8" result="light">
          <feDistantLight azimuth="210" elevation="50" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ms-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="33" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".12 0 0 0 .08  0 .22 0 0 .12  0 0 .08 0 .04  0 0 0 0 .62" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.6" diffuseConstant="0.8" lightingColor="#c4c878" result="light">
          <feDistantLight azimuth="210" elevation="44" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ms-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.046" numOctaves="5" seed="47" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".08 0 0 0 .05  0 .2 0 0 .1  0 0 .07 0 .03  0 0 0 0 .76" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.8" diffuseConstant="0.86" lightingColor="#8aaa58" result="light">
          <feDistantLight azimuth="210" elevation="40" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ms-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.058" numOctaves="5" seed="61" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".28 0 0 0 .18  0 .22 0 0 .14  0 0 .14 0 .08  0 0 0 0 .7" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5.2" diffuseConstant="0.9" lightingColor="#e4c898" result="light">
          <feDistantLight azimuth="210" elevation="34" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ms-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.014" numOctaves="3" seed="79" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".06 0 0 0 .05  0 .2 0 0 .16  0 0 .22 0 .18  0 0 0 0 .58" result="color" />
        <feSpecularLighting in="noise" surfaceScale="1.8" specularConstant="0.5" specularExponent="12" lightingColor="#e4f0e8" result="light">
          <feDistantLight azimuth="210" elevation="54" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="ms-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.11" numOctaves="4" seed="93" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".26 0 0 0 .18  0 .2 0 0 .14  0 0 .12 0 .08  0 0 0 0 .58" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.2" diffuseConstant="0.76" lightingColor="#e4d0a8" result="light">
          <feDistantLight azimuth="210" elevation="48" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ms-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.048" numOctaves="4" seed="109" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".3 0 0 0 .16  0 .12 0 0 .06  0 0 .08 0 .04  0 0 0 0 .7" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.2" diffuseConstant="0.78" lightingColor="#d48870" result="light">
          <feDistantLight azimuth="210" elevation="42" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 16, water: 8, rough: 26, elevation: 3 },
    forestPasses: 0,
    heavyWoodsBias: 0.08,
    elevationContrast: 1.2,
    road: 'auto',
    river: false,
    coverTerrain: 'rough',
    dryWashes: true,
    cliffs: true,
  },
  elevation: {
    ramp: [
      'rgba(220, 196, 120, 0.28)',
      'rgba(196, 156, 88, 0.5)',
      'rgba(156, 108, 64, 0.64)',
      'rgba(248, 232, 196, 0.76)',
    ],
    rimShadow: 'rgba(48, 28, 14, 0.96)',
    rimLight: 'rgba(255, 236, 196, 0.92)',
    label: '#f4ead0',
  },
  road: {
    band: '#5a4a38',
    centerline: '#e6d4a4',
  },
}
