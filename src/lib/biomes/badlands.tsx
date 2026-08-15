import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'bd'

export const badlands: BiomeDefinition = {
  id: 'badlands',
  label: 'Badlands',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Dust Flat', color: '#c4a06a', shortLabel: '' },
    woods: { label: 'Sparse Scrub', color: '#7a6a40', shortLabel: 'S' },
    heavyWoods: { label: 'Canyon Thicket', color: '#5a4e30', shortLabel: 'S2' },
    rough: { label: 'Eroded Ridge', color: '#a06a48', shortLabel: 'R' },
    water: { label: 'Dry Wash', color: '#8a6e52', shortLabel: 'Dw' },
    road: { label: 'Wash Track', color: '#7a6248', shortLabel: 'Tr' },
    lava: { label: 'Red Clay', color: '#8a4a32', shortLabel: 'Rc' },
  },
  textureDefs: (
    <>
      <filter id="bd-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.014 0.06" numOctaves="4" seed="21" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".36 0 0 0 .3  0 .24 0 0 .18  0 0 .12 0 .08  0 0 0 0 .52" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.6" diffuseConstant="0.74" lightingColor="#f0d4a0" result="light">
          <feDistantLight azimuth="250" elevation="46" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="bd-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="4" seed="37" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .14  0 .2 0 0 .12  0 0 .1 0 .04  0 0 0 0 .64" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.8" diffuseConstant="0.8" lightingColor="#c8b070" result="light">
          <feDistantLight azimuth="250" elevation="40" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="bd-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="5" seed="53" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".16 0 0 0 .1  0 .16 0 0 .08  0 0 .08 0 .03  0 0 0 0 .76" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.6" diffuseConstant="0.84" lightingColor="#a88850" result="light">
          <feDistantLight azimuth="250" elevation="36" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="bd-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.022 0.09" numOctaves="6" seed="67" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".34 0 0 0 .22  0 .18 0 0 .1  0 0 .1 0 .05  0 0 0 0 .74" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="7.4" diffuseConstant="1" lightingColor="#e8b888" result="light">
          <feDistantLight azimuth="250" elevation="26" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="bd-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.08 0.02" numOctaves="4" seed="81" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".26 0 0 0 .18  0 .18 0 0 .12  0 0 .12 0 .08  0 0 0 0 .6" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.8" diffuseConstant="0.7" lightingColor="#d4b890" result="light">
          <feDistantLight azimuth="250" elevation="48" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="bd-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.14" numOctaves="4" seed="97" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".24 0 0 0 .16  0 .18 0 0 .12  0 0 .12 0 .08  0 0 0 0 .62" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.2" diffuseConstant="0.78" lightingColor="#e0c498" result="light">
          <feDistantLight azimuth="250" elevation="44" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="bd-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="113" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".3 0 0 0 .18  0 .12 0 0 .06  0 0 .08 0 .04  0 0 0 0 .72" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.6" diffuseConstant="0.8" lightingColor="#c87050" result="light">
          <feDistantLight azimuth="250" elevation="34" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 6, water: 12, rough: 38, elevation: 4 },
    forestPasses: 0,
    heavyWoodsBias: 0.05,
    elevationContrast: 1.4,
    road: 'none',
    river: true,
    coverTerrain: 'rough',
    dryWashes: true,
  },
  elevation: {
    ramp: [
      'rgba(232, 196, 140, 0.28)',
      'rgba(216, 148, 88, 0.5)',
      'rgba(176, 96, 56, 0.66)',
      'rgba(252, 228, 196, 0.78)',
    ],
    rimShadow: 'rgba(48, 24, 12, 0.96)',
    rimLight: 'rgba(255, 220, 176, 0.92)',
    label: '#f6e2c4',
  },
  road: {
    band: '#5a4634',
    centerline: '#e2c490',
  },
}
