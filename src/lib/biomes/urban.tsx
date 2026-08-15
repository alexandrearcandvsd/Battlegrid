import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'ur'

export const urban: BiomeDefinition = {
  id: 'urban',
  label: 'Urban',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Pavement', color: '#767a70', shortLabel: '' },
    woods: { label: 'Park', color: '#5a7048', shortLabel: 'W' },
    heavyWoods: { label: 'Parkland', color: '#3d5233', shortLabel: 'W2' },
    rough: { label: 'Rubble', color: '#6e6558', shortLabel: 'R' },
    water: { label: 'Canal', color: '#44687a', shortLabel: 'D' },
    road: { label: 'Street', color: '#5f5e58', shortLabel: 'St' },
    lava: { label: 'Slag Flow', color: '#54382e', shortLabel: 'Lv' },
  },
  textureDefs: (
    <>
      <filter id="ur-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="3" seed="24" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .22  0 .2 0 0 .22  0 0 .18 0 .19  0 0 0 0 .42" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="0.8" diffuseConstant="0.6" lightingColor="#c9c9bc" result="light">
          <feDistantLight azimuth="225" elevation="50" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ur-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" seed="39" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".12 0 0 0 .08  0 .3 0 0 .13  0 0 .1 0 .05  0 0 0 0 .68" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3" diffuseConstant="0.82" lightingColor="#a4b478" result="light">
          <feDistantLight azimuth="225" elevation="44" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ur-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.036" numOctaves="5" seed="51" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".08 0 0 0 .04  0 .22 0 0 .08  0 0 .07 0 .03  0 0 0 0 .8" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="4" diffuseConstant="0.88" lightingColor="#7d905c" result="light">
          <feDistantLight azimuth="225" elevation="40" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ur-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.06" numOctaves="5" seed="67" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".22 0 0 0 .14  0 .2 0 0 .12  0 0 .16 0 .1  0 0 0 0 .7" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="4.4" diffuseConstant="0.88" lightingColor="#b0a48a" result="light">
          <feDistantLight azimuth="225" elevation="38" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ur-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="4" seed="81" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".05 0 0 0 .04  0 .18 0 0 .16  0 0 .28 0 .24  0 0 0 0 .62" result="color" />
        <feSpecularLighting in="noise" surfaceScale="2" specularConstant="0.5" specularExponent="12" lightingColor="#d2e4e8" result="light">
          <feDistantLight azimuth="225" elevation="52" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="ur-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.24" numOctaves="4" seed="93" stitchTiles="stitch" result="fine" />
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="18" stitchTiles="stitch" result="wear" />
        <feBlend in="fine" in2="wear" mode="multiply" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".14 0 0 0 .1  0 .14 0 0 .1  0 0 .13 0 .09  0 0 0 0 .58" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.6" diffuseConstant="0.72" lightingColor="#c2beae" result="light">
          <feDistantLight azimuth="225" elevation="50" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="ur-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.045" numOctaves="5" seed="109" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".22 0 0 0 .1  0 .1 0 0 .05  0 0 .07 0 .04  0 0 0 0 .8" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.4" diffuseConstant="0.85" lightingColor="#a06844" result="light">
          <feDistantLight azimuth="225" elevation="40" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 10, water: 6, rough: 8, elevation: 1 },
    forestPasses: 0,
    heavyWoodsBias: 0.12,
    elevationContrast: 0.7,
    road: 'none',
    river: false,
    coverTerrain: 'rough',
    streets: true,
    districts: true,
    walls: true,
  },
  elevation: {
    ramp: [
      'rgba(210, 208, 192, 0.28)',
      'rgba(212, 194, 154, 0.5)',
      'rgba(186, 158, 114, 0.62)',
      'rgba(248, 244, 226, 0.74)',
    ],
    rimShadow: 'rgba(14, 15, 12, 0.95)',
    rimLight: 'rgba(236, 234, 208, 0.92)',
    label: '#e8e6d2',
  },
  road: {
    band: '#3f3e3a',
    centerline: '#c9c28e',
  },
}
