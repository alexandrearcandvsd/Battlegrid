import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'tj'

export const tropicalJungle: BiomeDefinition = {
  id: 'tropical-jungle',
  label: 'Tropical Jungle',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Jungle Floor', color: '#4a5a32', shortLabel: '' },
    woods: { label: 'Broadleaf', color: '#2e4a28', shortLabel: 'W' },
    heavyWoods: { label: 'Rain Canopy', color: '#1a3220', shortLabel: 'W2' },
    rough: { label: 'Root Mass', color: '#4a4030', shortLabel: 'R' },
    water: { label: 'Jungle River', color: '#2a5a52', shortLabel: 'D' },
    road: { label: 'Game Trail', color: '#4a4638', shortLabel: 'Tr' },
    lava: { label: 'Peat Slide', color: '#3a4a28', shortLabel: 'Pt' },
  },
  textureDefs: (
    <>
      <filter id="tj-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="17" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".12 0 0 0 .08  0 .24 0 0 .12  0 0 .08 0 .04  0 0 0 0 .62" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.4" diffuseConstant="0.8" lightingColor="#b8c878" result="light">
          <feDistantLight azimuth="160" elevation="42" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="tj-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="6" seed="31" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".04 0 0 0 .02  0 .22 0 0 .08  0 0 .06 0 .03  0 0 0 0 .82" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5.2" diffuseConstant="0.9" lightingColor="#6a9a48" result="light">
          <feDistantLight azimuth="160" elevation="34" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="tj-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.046" numOctaves="6" seed="49" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".02 0 0 0 .01  0 .16 0 0 .04  0 0 .05 0 .02  0 0 0 0 .9" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="6.2" diffuseConstant="0.94" lightingColor="#3e6a36" result="light">
          <feDistantLight azimuth="160" elevation="30" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="tj-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.06" numOctaves="5" seed="65" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".18 0 0 0 .1  0 .16 0 0 .08  0 0 .1 0 .05  0 0 0 0 .72" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="4.4" diffuseConstant="0.86" lightingColor="#8a7a58" result="light">
          <feDistantLight azimuth="160" elevation="36" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="tj-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.03 0.08" numOctaves="4" seed="77" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".03 0 0 0 .02  0 .16 0 0 .12  0 0 .2 0 .16  0 0 0 0 .68" result="color" />
        <feSpecularLighting in="noise" surfaceScale="2.2" specularConstant="0.4" specularExponent="10" lightingColor="#b8e0d0" result="light">
          <feDistantLight azimuth="160" elevation="52" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="tj-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="4" seed="91" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".16 0 0 0 .1  0 .16 0 0 .1  0 0 .1 0 .06  0 0 0 0 .66" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.2" diffuseConstant="0.76" lightingColor="#b0a878" result="light">
          <feDistantLight azimuth="160" elevation="44" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="tj-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.036" numOctaves="4" seed="107" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".1 0 0 0 .06  0 .16 0 0 .08  0 0 .08 0 .04  0 0 0 0 .76" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.8" diffuseConstant="0.78" lightingColor="#6a7a40" result="light">
          <feDistantLight azimuth="160" elevation="38" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 50, water: 16, rough: 10, elevation: 2 },
    forestPasses: 2,
    heavyWoodsBias: 0.34,
    elevationContrast: 0.85,
    road: 'auto',
    river: true,
    coverTerrain: 'woods',
    canopyGaps: true,
  },
  elevation: {
    ramp: [
      'rgba(140, 168, 88, 0.28)',
      'rgba(168, 148, 72, 0.48)',
      'rgba(120, 96, 56, 0.62)',
      'rgba(220, 228, 176, 0.74)',
    ],
    rimShadow: 'rgba(6, 14, 8, 0.96)',
    rimLight: 'rgba(180, 220, 120, 0.88)',
    label: '#c8e0a8',
  },
  road: {
    band: '#2e3228',
    centerline: '#b8b070',
  },
}
