import type { BiomeDefinition } from '../types/biome'
import { COLORWAYS, type Colorway } from '../types/map'
import { shiftCssColor, shiftHex } from './color'

const SHIFTS: Record<Exclude<Colorway, 'default'>, { hue: number; sat: number; light: number }> = {
  arid: { hue: 22, sat: 1.08, light: 1.04 },
  lush: { hue: -18, sat: 1.14, light: 0.98 },
  twilight: { hue: 48, sat: 0.88, light: 0.86 },
}

export function isColorway(value: unknown): value is Colorway {
  return typeof value === 'string' && (COLORWAYS as readonly string[]).includes(value)
}

/** Recolor a biome palette without changing generation. Default is a no-op. */
export function applyColorway(
  biome: BiomeDefinition,
  colorway?: Colorway | string,
): BiomeDefinition {
  if (!isColorway(colorway) || colorway === 'default') return biome
  const shift = SHIFTS[colorway]
  const tint = (color: string) => shiftCssColor(color, shift.hue, shift.sat, shift.light)
  const tintHex = (color: string) => shiftHex(color, shift.hue, shift.sat, shift.light)
  return {
    ...biome,
    palette: {
      clear: { ...biome.palette.clear, color: tintHex(biome.palette.clear.color) },
      woods: { ...biome.palette.woods, color: tintHex(biome.palette.woods.color) },
      heavyWoods: { ...biome.palette.heavyWoods, color: tintHex(biome.palette.heavyWoods.color) },
      rough: { ...biome.palette.rough, color: tintHex(biome.palette.rough.color) },
      water: { ...biome.palette.water, color: tintHex(biome.palette.water.color) },
      road: { ...biome.palette.road, color: tintHex(biome.palette.road.color) },
      lava: { ...biome.palette.lava, color: tintHex(biome.palette.lava.color) },
    },
    elevation: {
      ...biome.elevation,
      ramp: [
        tint(biome.elevation.ramp[0]),
        tint(biome.elevation.ramp[1]),
        tint(biome.elevation.ramp[2]),
        tint(biome.elevation.ramp[3]),
      ],
      rimShadow: tint(biome.elevation.rimShadow),
      rimLight: tint(biome.elevation.rimLight),
      label: tintHex(biome.elevation.label),
    },
    road: {
      band: tintHex(biome.road.band),
      centerline: tintHex(biome.road.centerline),
    },
    snowLine: biome.snowLine
      ? { ...biome.snowLine, color: tint(biome.snowLine.color) }
      : biome.snowLine,
  }
}
