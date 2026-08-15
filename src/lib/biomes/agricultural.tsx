import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'ag'

export const agricultural: BiomeDefinition = {
  id: 'agricultural',
  label: 'Agricultural',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Cropland', color: '#b7a45a', shortLabel: '' },
    woods: { label: 'Orchard', color: '#5e7a40', shortLabel: 'O' },
    heavyWoods: { label: 'Orchard Block', color: '#3f5a32', shortLabel: 'O2' },
    rough: { label: 'Hedgerow', color: '#6d5e42', shortLabel: 'H' },
    water: { label: 'Irrigation', color: '#4a7e88', shortLabel: 'I' },
    road: { label: 'Dirt Road', color: '#7a6a52', shortLabel: 'Rd' },
    lava: { label: 'Fallow Burn', color: '#7a5a38', shortLabel: 'Fb' },
  },
  textureDefs: (
    <>
      <filter id="ag-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.09" numOctaves="4" seed="11" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".32 0 0 0 .28  0 .3 0 0 .24  0 0 .12 0 .08  0 0 0 0 .5" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.1" diffuseConstant="0.68" lightingColor="#efe4a8" result="light">
          <feDistantLight azimuth="220" elevation="50" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ag-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.034" numOctaves="5" seed="27" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".1 0 0 0 .08  0 .28 0 0 .14  0 0 .08 0 .04  0 0 0 0 .62" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.2" diffuseConstant="0.84" lightingColor="#b4c878" result="light">
          <feDistantLight azimuth="220" elevation="44" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ag-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="43" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".06 0 0 0 .04  0 .22 0 0 .1  0 0 .06 0 .03  0 0 0 0 .78" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="4.2" diffuseConstant="0.88" lightingColor="#8aaa60" result="light">
          <feDistantLight azimuth="220" elevation="40" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ag-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.07" numOctaves="4" seed="61" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".22 0 0 0 .14  0 .18 0 0 .1  0 0 .1 0 .06  0 0 0 0 .66" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.6" diffuseConstant="0.82" lightingColor="#c8b48a" result="light">
          <feDistantLight azimuth="220" elevation="42" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ag-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.012" numOctaves="3" seed="75" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".05 0 0 0 .05  0 .2 0 0 .18  0 0 .28 0 .24  0 0 0 0 .58" result="color" />
        <feSpecularLighting in="noise" surfaceScale="1.6" specularConstant="0.45" specularExponent="10" lightingColor="#dceef0" result="light">
          <feDistantLight azimuth="220" elevation="54" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="ag-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.12" numOctaves="4" seed="91" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".28 0 0 0 .18  0 .22 0 0 .14  0 0 .14 0 .08  0 0 0 0 .58" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.2" diffuseConstant="0.76" lightingColor="#e0cda8" result="light">
          <feDistantLight azimuth="220" elevation="48" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ag-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="107" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".28 0 0 0 .16  0 .16 0 0 .08  0 0 .08 0 .04  0 0 0 0 .7" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2" diffuseConstant="0.75" lightingColor="#d4a070" result="light">
          <feDistantLight azimuth="220" elevation="42" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 16, water: 14, rough: 18, elevation: 1 },
    forestPasses: 1,
    heavyWoodsBias: 0.1,
    elevationContrast: 0.75,
    road: 'auto',
    channels: 2,
    river: true,
    coverTerrain: 'woods',
    farmsteads: true,
  },
  elevation: {
    ramp: [
      'rgba(214, 196, 120, 0.28)',
      'rgba(196, 168, 88, 0.48)',
      'rgba(168, 132, 72, 0.6)',
      'rgba(244, 228, 176, 0.72)',
    ],
    rimShadow: 'rgba(40, 32, 16, 0.92)',
    rimLight: 'rgba(244, 232, 180, 0.9)',
    label: '#f4ead0',
  },
  road: {
    band: '#5a4c3a',
    centerline: '#d8c48a',
  },
}
