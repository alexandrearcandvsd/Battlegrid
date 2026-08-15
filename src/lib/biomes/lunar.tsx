import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'ln'

export const lunar: BiomeDefinition = {
  id: 'lunar',
  label: 'Lunar',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Regolith', color: '#8a8b8c', shortLabel: '' },
    woods: { label: 'Ejecta', color: '#9a9b96', shortLabel: 'E' },
    heavyWoods: { label: 'Ejecta Blanket', color: '#b0b0a8', shortLabel: 'E2' },
    rough: { label: 'Ridge', color: '#6e6f72', shortLabel: 'R' },
    water: { label: 'Ice', color: '#c5d4de', shortLabel: 'I' },
    road: { label: 'Haul Road', color: '#5c5d5a', shortLabel: 'Rd' },
    lava: { label: 'Mare', color: '#3d4452', shortLabel: 'Mv' },
  },
  textureDefs: (
    <>
      <filter id="ln-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="4" seed="14" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".22 0 0 0 .2  0 .22 0 0 .2  0 0 .23 0 .21  0 0 0 0 .55" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.8" diffuseConstant="0.92" lightingColor="#e8e8e2" result="light">
          <feDistantLight azimuth="250" elevation="22" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ln-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="29" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".26 0 0 0 .22  0 .26 0 0 .22  0 0 .24 0 .2  0 0 0 0 .5" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.4" diffuseConstant="0.8" lightingColor="#d8d6cc" result="light">
          <feDistantLight azimuth="250" elevation="24" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ln-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="41" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".3 0 0 0 .26  0 .3 0 0 .26  0 0 .28 0 .24  0 0 0 0 .48" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.2" diffuseConstant="0.78" lightingColor="#f0eee4" result="light">
          <feDistantLight azimuth="250" elevation="26" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ln-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.058" numOctaves="6" seed="63" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".16 0 0 0 .12  0 .16 0 0 .12  0 0 .17 0 .13  0 0 0 0 .72" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="7.2" diffuseConstant="1" lightingColor="#cfd0d4" result="light">
          <feDistantLight azimuth="250" elevation="18" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ln-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="77" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .22  0 .24 0 0 .26  0 0 .3 0 .3  0 0 0 0 .45" result="color" />
        <feSpecularLighting in="noise" surfaceScale="2.8" specularConstant="0.85" specularExponent="18" lightingColor="#f4fbff" result="light">
          <feDistantLight azimuth="250" elevation="40" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="ln-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="3" seed="89" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".14 0 0 0 .1  0 .14 0 0 .1  0 0 .13 0 .09  0 0 0 0 .6" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.4" diffuseConstant="0.7" lightingColor="#c8c6be" result="light">
          <feDistantLight azimuth="250" elevation="28" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ln-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="4" seed="103" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".08 0 0 0 .06  0 .09 0 0 .07  0 0 .12 0 .1  0 0 0 0 .78" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.6" diffuseConstant="0.7" lightingColor="#8a96a8" result="light">
          <feDistantLight azimuth="250" elevation="20" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 3, water: 5, rough: 32, elevation: 4 },
    forestPasses: 0,
    heavyWoodsBias: 0.04,
    elevationContrast: 1.4,
    road: 'auto',
    craters: 6,
    river: false,
    coverTerrain: 'rough',
  },
  elevation: {
    ramp: [
      'rgba(196, 198, 202, 0.3)',
      'rgba(210, 212, 216, 0.5)',
      'rgba(186, 188, 194, 0.64)',
      'rgba(244, 244, 246, 0.78)',
    ],
    rimShadow: 'rgba(8, 8, 10, 0.96)',
    rimLight: 'rgba(236, 236, 230, 0.95)',
    label: '#eef0f2',
  },
  road: {
    band: '#3a3b3a',
    centerline: '#c8c4b0',
  },
}
