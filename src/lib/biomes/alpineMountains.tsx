import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'am'

export const alpineMountains: BiomeDefinition = {
  id: 'alpine-mountains',
  label: 'Alpine Mountains',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Alpine Meadow', color: '#7d8568', shortLabel: '' },
    woods: { label: 'Pine Woods', color: '#4a5d43', shortLabel: 'W' },
    heavyWoods: { label: 'Pine Forest', color: '#2f4232', shortLabel: 'W2' },
    rough: { label: 'Scree Slope', color: '#767270', shortLabel: 'R' },
    water: { label: 'Glacial Lake', color: '#4d7486', shortLabel: 'D' },
    road: { label: 'Pass Road', color: '#6a675f', shortLabel: 'Rd' },
    lava: { label: 'Cinder Rock', color: '#59534b', shortLabel: 'Lv' },
  },
  textureDefs: (
    <>
      <filter id="am-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="5" seed="18" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".26 0 0 0 .24  0 .27 0 0 .24  0 0 .16 0 .13  0 0 0 0 .55" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2" diffuseConstant="0.76" lightingColor="#d8dabb" result="light">
          <feDistantLight azimuth="225" elevation="46" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="am-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.036" numOctaves="6" seed="33" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".1 0 0 0 .06  0 .24 0 0 .1  0 0 .09 0 .05  0 0 0 0 .74" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="4.4" diffuseConstant="0.86" lightingColor="#92a468" result="light">
          <feDistantLight azimuth="225" elevation="40" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="am-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.042" numOctaves="6" seed="45" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".06 0 0 0 .03  0 .18 0 0 .055  0 0 .07 0 .028  0 0 0 0 .84" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5.2" diffuseConstant="0.9" lightingColor="#6b7f52" result="light">
          <feDistantLight azimuth="225" elevation="36" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="am-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="6" seed="61" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".28 0 0 0 .22  0 .27 0 0 .21  0 0 .26 0 .2  0 0 0 0 .72" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="6" diffuseConstant="0.94" lightingColor="#c9c5b4" result="light">
          <feDistantLight azimuth="225" elevation="34" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="am-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.016 0.05" numOctaves="4" seed="75" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".05 0 0 0 .04  0 .2 0 0 .18  0 0 .3 0 .26  0 0 0 0 .64" result="color" />
        <feSpecularLighting in="noise" surfaceScale="2.4" specularConstant="0.62" specularExponent="13" lightingColor="#dceef2" result="light">
          <feDistantLight azimuth="225" elevation="54" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="am-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="4" seed="85" stitchTiles="stitch" result="fine" />
        <feTurbulence type="turbulence" baseFrequency="0.048" numOctaves="2" seed="19" stitchTiles="stitch" result="wear" />
        <feBlend in="fine" in2="wear" mode="multiply" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".18 0 0 0 .15  0 .18 0 0 .15  0 0 .16 0 .13  0 0 0 0 .62" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.1" diffuseConstant="0.76" lightingColor="#d0cbb8" result="light">
          <feDistantLight azimuth="225" elevation="46" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="am-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.065" numOctaves="5" seed="103" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".18 0 0 0 .12  0 .17 0 0 .11  0 0 .15 0 .1  0 0 0 0 .78" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5" diffuseConstant="0.9" lightingColor="#b8ab90" result="light">
          <feDistantLight azimuth="225" elevation="36" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 18, water: 6, rough: 34, elevation: 4 },
    forestPasses: 0,
    heavyWoodsBias: 0.12,
    elevationContrast: 1.3,
    road: 'auto',
    scree: true,
    river: true,
    coverTerrain: 'rough',
  },
  elevation: {
    ramp: [
      'rgba(186, 192, 186, 0.28)',
      'rgba(200, 204, 192, 0.5)',
      'rgba(168, 170, 160, 0.64)',
      'rgba(246, 248, 246, 0.78)',
    ],
    rimShadow: 'rgba(20, 22, 20, 0.96)',
    rimLight: 'rgba(236, 240, 230, 0.95)',
    label: '#eef0e4',
  },
  road: {
    band: '#45443e',
    centerline: '#cfc89a',
  },
  snowLine: {
    level: 3,
    color: 'rgba(244, 248, 250, 0.6)',
  },
}
