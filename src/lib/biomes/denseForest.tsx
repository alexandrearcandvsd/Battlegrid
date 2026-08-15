import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'df'

export const denseForest: BiomeDefinition = {
  id: 'dense-forest',
  label: 'Dense Forest',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Clearing', color: '#6d734b', shortLabel: '' },
    woods: { label: 'Light Woods', color: '#4d6338', shortLabel: 'W' },
    heavyWoods: { label: 'Deep Canopy', color: '#2c422a', shortLabel: 'W2' },
    rough: { label: 'Outcrop', color: '#6b5f49', shortLabel: 'R' },
    water: { label: 'Water', color: '#3d6b66', shortLabel: 'D' },
    road: { label: 'Logging Road', color: '#565a4e', shortLabel: 'Rd' },
    lava: { label: 'Cooled Flow', color: '#39413a', shortLabel: 'Lv' },
  },
  textureDefs: (
    <>
      <filter id="df-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" seed="14" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .16  0 .3 0 0 .2  0 0 .14 0 .08  0 0 0 0 .6" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2" diffuseConstant="0.78" lightingColor="#cfd6a0" result="light">
          <feDistantLight azimuth="225" elevation="44" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="df-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.034" numOctaves="6" seed="29" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".08 0 0 0 .04  0 .3 0 0 .1  0 0 .08 0 .04  0 0 0 0 .78" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="4.2" diffuseConstant="0.86" lightingColor="#8ba05e" result="light">
          <feDistantLight azimuth="225" elevation="40" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="df-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="6" seed="43" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".05 0 0 0 .02  0 .2 0 0 .05  0 0 .06 0 .02  0 0 0 0 .88" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5" diffuseConstant="0.92" lightingColor="#5f7a4a" result="light">
          <feDistantLight azimuth="225" elevation="36" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="df-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.045" numOctaves="5" seed="57" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".24 0 0 0 .14  0 .22 0 0 .12  0 0 .16 0 .09  0 0 0 0 .7" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5" diffuseConstant="0.9" lightingColor="#b3a87e" result="light">
          <feDistantLight azimuth="225" elevation="38" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="df-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="4" seed="71" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".04 0 0 0 .02  0 .18 0 0 .13  0 0 .24 0 .2  0 0 0 0 .66" result="color" />
        <feSpecularLighting in="noise" surfaceScale="2" specularConstant="0.42" specularExponent="11" lightingColor="#cfe4d8" result="light">
          <feDistantLight azimuth="225" elevation="50" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="df-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.38" numOctaves="4" seed="83" stitchTiles="stitch" result="fine" />
        <feTurbulence type="turbulence" baseFrequency="0.07" numOctaves="2" seed="16" stitchTiles="stitch" result="wear" />
        <feBlend in="fine" in2="wear" mode="multiply" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".18 0 0 0 .12  0 .2 0 0 .13  0 0 .14 0 .09  0 0 0 0 .66" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.5" diffuseConstant="0.8" lightingColor="#c2c8a8" result="light">
          <feDistantLight azimuth="225" elevation="46" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="df-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.03 0.09" numOctaves="4" seed="99" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".1 0 0 0 .045  0 .13 0 0 .055  0 0 .09 0 .04  0 0 0 0 .78" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.8" diffuseConstant="0.8" lightingColor="#6a7a58" result="light">
          <feDistantLight azimuth="225" elevation="42" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 45, water: 8, rough: 12, elevation: 2 },
    forestPasses: 1,
    heavyWoodsBias: 0.28,
    elevationContrast: 0.9,
    road: 'auto',
    river: true,
    coverTerrain: 'woods',
  },
  elevation: {
    ramp: [
      'rgba(186, 200, 132, 0.28)',
      'rgba(210, 186, 104, 0.5)',
      'rgba(176, 140, 82, 0.64)',
      'rgba(238, 236, 210, 0.76)',
    ],
    rimShadow: 'rgba(8, 16, 10, 0.96)',
    rimLight: 'rgba(214, 230, 164, 0.9)',
    label: '#d8e4bc',
  },
  road: {
    band: '#3c4038',
    centerline: '#c9c390',
  },
}
