import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'iw'

export const industrialWasteland: BiomeDefinition = {
  id: 'industrial-wasteland',
  label: 'Industrial Wasteland',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Contaminated Soil', color: '#6e6a58', shortLabel: '' },
    woods: { label: 'Dead Scrub', color: '#4e523c', shortLabel: 'S' },
    heavyWoods: { label: 'Dead Grove', color: '#3a3e30', shortLabel: 'S2' },
    rough: { label: 'Slag Heap', color: '#5a5048', shortLabel: 'R' },
    water: { label: 'Toxic Pool', color: '#3d6a52', shortLabel: 'T' },
    road: { label: 'Service Road', color: '#4e4c46', shortLabel: 'Rd' },
    lava: { label: 'Chem Spill', color: '#6b6a2e', shortLabel: 'Ch' },
  },
  textureDefs: (
    <>
      <filter id="iw-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="4" seed="18" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .16  0 .2 0 0 .15  0 0 .14 0 .1  0 0 0 0 .58" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.6" diffuseConstant="0.7" lightingColor="#c4bca0" result="light">
          <feDistantLight azimuth="215" elevation="46" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="iw-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.048" numOctaves="5" seed="33" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".1 0 0 0 .07  0 .14 0 0 .08  0 0 .08 0 .04  0 0 0 0 .68" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3" diffuseConstant="0.8" lightingColor="#8a9460" result="light">
          <feDistantLight azimuth="215" elevation="40" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="iw-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.052" numOctaves="5" seed="47" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".06 0 0 0 .04  0 .1 0 0 .05  0 0 .06 0 .03  0 0 0 0 .82" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="4" diffuseConstant="0.86" lightingColor="#6a7248" result="light">
          <feDistantLight azimuth="215" elevation="36" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="iw-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.06" numOctaves="5" seed="69" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".2 0 0 0 .12  0 .16 0 0 .1  0 0 .14 0 .08  0 0 0 0 .74" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="5.4" diffuseConstant="0.9" lightingColor="#b09880" result="light">
          <feDistantLight azimuth="215" elevation="34" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="iw-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.03 0.06" numOctaves="4" seed="83" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".06 0 0 0 .05  0 .22 0 0 .14  0 0 .14 0 .08  0 0 0 0 .62" result="color" />
        <feSpecularLighting in="noise" surfaceScale="2.2" specularConstant="0.55" specularExponent="12" lightingColor="#c8f0c0" result="light">
          <feDistantLight azimuth="215" elevation="50" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="iw-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="4" seed="97" stitchTiles="stitch" result="fine" />
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="19" stitchTiles="stitch" result="wear" />
        <feBlend in="fine" in2="wear" mode="multiply" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".12 0 0 0 .08  0 .12 0 0 .08  0 0 .11 0 .07  0 0 0 0 .62" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.8" diffuseConstant="0.74" lightingColor="#b8b0a0" result="light">
          <feDistantLight azimuth="215" elevation="48" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="iw-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.042" numOctaves="5" seed="113" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".22 0 0 0 .14  0 .22 0 0 .12  0 0 .08 0 .04  0 0 0 0 .78" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.8" diffuseConstant="0.82" lightingColor="#c8c040" result="light">
          <feDistantLight azimuth="215" elevation="40" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 6, water: 8, rough: 22, elevation: 2 },
    forestPasses: 0,
    heavyWoodsBias: 0.08,
    elevationContrast: 0.95,
    road: 'none',
    river: false,
    coverTerrain: 'rough',
    streets: true,
    districts: true,
    districtTheme: 'industrial',
    walls: true,
    lavaFlows: 1,
  },
  elevation: {
    ramp: [
      'rgba(186, 176, 150, 0.28)',
      'rgba(168, 148, 112, 0.5)',
      'rgba(140, 112, 80, 0.62)',
      'rgba(220, 210, 180, 0.74)',
    ],
    rimShadow: 'rgba(16, 14, 10, 0.95)',
    rimLight: 'rgba(220, 210, 170, 0.9)',
    label: '#e6dec8',
  },
  road: {
    band: '#32322e',
    centerline: '#b8a86a',
  },
}
