import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'at'

export const arcticTundra: BiomeDefinition = {
  id: 'arctic-tundra',
  label: 'Arctic Tundra',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Tundra', color: '#b8c0c4', shortLabel: '' },
    woods: { label: 'Low Scrub', color: '#6a7460', shortLabel: 'S' },
    heavyWoods: { label: 'Heath', color: '#4e5848', shortLabel: 'S2' },
    rough: { label: 'Exposed Rock', color: '#7a7e82', shortLabel: 'R' },
    water: { label: 'Ice Sheet', color: '#c8d8e4', shortLabel: 'Ic' },
    road: { label: 'Ice Road', color: '#8a9094', shortLabel: 'Rd' },
    lava: { label: 'Thermokarst', color: '#5a6a78', shortLabel: 'Tk' },
  },
  textureDefs: (
    <>
      <filter id="at-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="19" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".28 0 0 0 .26  0 .3 0 0 .28  0 0 .32 0 .3  0 0 0 0 .5" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.2" diffuseConstant="0.88" lightingColor="#eef4f8" result="light">
          <feDistantLight azimuth="200" elevation="28" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="at-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="4" seed="33" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".14 0 0 0 .1  0 .2 0 0 .14  0 0 .12 0 .08  0 0 0 0 .62" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.6" diffuseConstant="0.8" lightingColor="#c8d0b8" result="light">
          <feDistantLight azimuth="200" elevation="30" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="at-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="5" seed="47" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".1 0 0 0 .08  0 .16 0 0 .1  0 0 .1 0 .06  0 0 0 0 .72" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.2" diffuseConstant="0.82" lightingColor="#a8b49c" result="light">
          <feDistantLight azimuth="200" elevation="26" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="at-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.08" numOctaves="5" seed="61" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .16  0 .2 0 0 .16  0 0 .22 0 .18  0 0 0 0 .7" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5.4" diffuseConstant="0.96" lightingColor="#d8dce0" result="light">
          <feDistantLight azimuth="200" elevation="20" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="at-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="3" seed="79" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".22 0 0 0 .24  0 .28 0 0 .3  0 0 .34 0 .34  0 0 0 0 .42" result="color" />
        <feSpecularLighting in="noise" surfaceScale="3.2" specularConstant="0.9" specularExponent="20" lightingColor="#f6fbff" result="light">
          <feDistantLight azimuth="200" elevation="38" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="at-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="3" seed="93" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .16  0 .2 0 0 .16  0 0 .22 0 .18  0 0 0 0 .58" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.6" diffuseConstant="0.74" lightingColor="#e4e8ec" result="light">
          <feDistantLight azimuth="200" elevation="32" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="at-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="109" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".12 0 0 0 .1  0 .16 0 0 .14  0 0 .2 0 .18  0 0 0 0 .7" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.4" diffuseConstant="0.76" lightingColor="#9aa8b4" result="light">
          <feDistantLight azimuth="200" elevation="24" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 8, water: 14, rough: 30, elevation: 3 },
    forestPasses: 0,
    heavyWoodsBias: 0.06,
    elevationContrast: 1.15,
    road: 'auto',
    river: false,
    coverTerrain: 'rough',
    iceSheets: true,
    crevasses: 4,
  },
  elevation: {
    ramp: [
      'rgba(200, 210, 218, 0.3)',
      'rgba(220, 228, 234, 0.5)',
      'rgba(186, 196, 206, 0.64)',
      'rgba(246, 250, 252, 0.8)',
    ],
    rimShadow: 'rgba(12, 16, 22, 0.96)',
    rimLight: 'rgba(236, 244, 250, 0.95)',
    label: '#eef4f8',
  },
  road: {
    band: '#5a6066',
    centerline: '#dce4ea',
  },
  snowLine: {
    level: 2,
    color: 'rgba(246, 250, 252, 0.62)',
  },
}
