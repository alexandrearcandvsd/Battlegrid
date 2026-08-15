import type { BiomeDefinition } from '../../types/biome'
import { texturePatterns } from './texturePatterns'

const PREFIX = 'hd'

export const hotDesert: BiomeDefinition = {
  id: 'hot-desert',
  label: 'Hot Desert',
  prefix: PREFIX,
  palette: {
    clear: { label: 'Sand', color: '#c8a96b', shortLabel: '' },
    woods: { label: 'Scrub', color: '#7d7444', shortLabel: 'S' },
    heavyWoods: { label: 'Oasis Grove', color: '#4c6b3c', shortLabel: 'S2' },
    rough: { label: 'Rocky', color: '#8a7355', shortLabel: 'R' },
    water: { label: 'Oasis', color: '#2f6a7c', shortLabel: 'D' },
    road: { label: 'Track', color: '#7f766a', shortLabel: 'Tr' },
    lava: { label: 'Obsidian', color: '#2e2a30', shortLabel: 'Lv' },
  },
  textureDefs: (
    <>
      <filter id="hd-filter-clear" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.045" numOctaves="4" seed="16" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".34 0 0 0 .3  0 .26 0 0 .22  0 0 .13 0 .1  0 0 0 0 .5" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="1.2" diffuseConstant="0.72" lightingColor="#f4e0ae" result="light">
          <feDistantLight azimuth="235" elevation="52" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="hd-filter-woods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="31" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".14 0 0 0 .12  0 .2 0 0 .1  0 0 .1 0 .04  0 0 0 0 .6" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.2" diffuseConstant="0.78" lightingColor="#c9bd7e" result="light">
          <feDistantLight azimuth="235" elevation="46" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="hd-filter-heavyWoods" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="5" seed="47" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".08 0 0 0 .05  0 .26 0 0 .09  0 0 .07 0 .03  0 0 0 0 .78" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="3.6" diffuseConstant="0.86" lightingColor="#9aa860" result="light">
          <feDistantLight azimuth="235" elevation="42" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="hd-filter-rough" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.052" numOctaves="6" seed="59" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".3 0 0 0 .2  0 .22 0 0 .14  0 0 .15 0 .08  0 0 0 0 .74" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="6" diffuseConstant="0.94" lightingColor="#e8cd96" result="light">
          <feDistantLight azimuth="235" elevation="34" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="hd-filter-water" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.016 0.05" numOctaves="4" seed="73" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".04 0 0 0 .03  0 .2 0 0 .17  0 0 .34 0 .28  0 0 0 0 .68" result="color" />
        <feSpecularLighting in="noise" surfaceScale="2.6" specularConstant="0.72" specularExponent="14" lightingColor="#eef6e4" result="light">
          <feDistantLight azimuth="235" elevation="56" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      <filter id="hd-filter-road" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="turbulence" baseFrequency="0.1" numOctaves="4" seed="87" stitchTiles="stitch" result="fine" />
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="21" stitchTiles="stitch" result="wear" />
        <feBlend in="fine" in2="wear" mode="multiply" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".28 0 0 0 .2  0 .22 0 0 .15  0 0 .14 0 .08  0 0 0 0 .6" result="color" />
        <feDiffuseLighting in="noise" surfaceScale="2.6" diffuseConstant="0.8" lightingColor="#ead8b0" result="light">
          <feDistantLight azimuth="235" elevation="52" />
        </feDiffuseLighting>
        <feBlend in="color" in2="light" mode="multiply" />
      </filter>
      <filter id="hd-filter-lava" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="101" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values=".1 0 0 0 .05  0 .09 0 0 .045  0 0 .11 0 .06  0 0 0 0 .7" result="color" />
        <feSpecularLighting in="noise" surfaceScale="1.8" specularConstant="0.5" specularExponent="16" lightingColor="#cfc4d8" result="light">
          <feDistantLight azimuth="235" elevation="56" />
        </feSpecularLighting>
        <feBlend in="color" in2="light" mode="screen" />
      </filter>
      {texturePatterns(PREFIX)}
    </>
  ),
  textureRef: (terrain) => `url(#${PREFIX}-texture-${terrain})`,
  generation: {
    defaults: { woods: 4, water: 3, rough: 28, elevation: 4 },
    forestPasses: 0,
    heavyWoodsBias: 0.05,
    elevationContrast: 1.35,
    road: 'none',
    river: false,
    coverTerrain: 'rough',
  },
  elevation: {
    ramp: [
      'rgba(242, 214, 150, 0.28)',
      'rgba(236, 176, 96, 0.52)',
      'rgba(196, 124, 64, 0.66)',
      'rgba(255, 248, 224, 0.78)',
    ],
    rimShadow: 'rgba(52, 34, 16, 0.96)',
    rimLight: 'rgba(255, 244, 210, 0.95)',
    label: '#f7e8c3',
  },
  road: {
    band: '#544e44',
    centerline: '#e2d6a8',
  },
}
