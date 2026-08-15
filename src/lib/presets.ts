import type { TerrainWeights } from '../types/map'

export interface MapTemplate {
  id: string
  label: string
  width: number
  height: number
}

export const MAP_TEMPLATES: MapTemplate[] = [
  { id: 'skirmish', label: 'Skirmish · 12 × 10', width: 12, height: 10 },
  { id: 'standard', label: 'Standard · 18 × 14', width: 18, height: 14 },
  { id: 'mapsheet', label: 'Mapsheet · 16 × 17', width: 16, height: 17 },
  { id: 'double', label: 'Double · 32 × 17', width: 32, height: 17 },
  { id: 'grand', label: 'Grand · 40 × 30', width: 40, height: 30 },
  { id: 'double-blind', label: 'Double-blind · 32 × 34', width: 32, height: 34 },
  { id: 'theater', label: 'Theater · 48 × 34', width: 48, height: 34 },
]

export function matchMapTemplate(width: number, height: number): string {
  return (
    MAP_TEMPLATES.find((template) => template.width === width && template.height === height)
      ?.id ?? 'custom'
  )
}

export interface TerrainPreset {
  id: string
  label: string
  /** Undefined means "use the active biome's default weights". */
  terrain?: TerrainWeights
}

export const TERRAIN_PRESETS: TerrainPreset[] = [
  { id: 'balanced', label: 'Biome balanced' },
  { id: 'open-plains', label: 'Open plains', terrain: { woods: 8, water: 8, rough: 12 } },
  { id: 'wooded', label: 'Wooded', terrain: { woods: 40, water: 10, rough: 14 } },
  { id: 'broken-ground', label: 'Broken ground', terrain: { woods: 16, water: 8, rough: 34 } },
  { id: 'lake-country', label: 'Lake country', terrain: { woods: 20, water: 30, rough: 14 } },
  { id: 'frozen', label: 'Frozen', terrain: { woods: 6, water: 16, rough: 28 } },
  { id: 'canyon-country', label: 'Canyon country', terrain: { woods: 8, water: 10, rough: 40 } },
  { id: 'jungle', label: 'Jungle', terrain: { woods: 50, water: 16, rough: 10 } },
  { id: 'tidal', label: 'Tidal', terrain: { woods: 12, water: 32, rough: 16 } },
  { id: 'dry-hills', label: 'Dry hills', terrain: { woods: 14, water: 6, rough: 28 } },
  { id: 'island-sea', label: 'Island sea', terrain: { woods: 8, water: 40, rough: 16 } },
  { id: 'muskeg', label: 'Muskeg', terrain: { woods: 32, water: 18, rough: 16 } },
  { id: 'veldt', label: 'Veldt', terrain: { woods: 10, water: 8, rough: 14 } },
  { id: 'mossy', label: 'Mossy', terrain: { woods: 36, water: 24, rough: 12 } },
  { id: 'estuary', label: 'Estuary', terrain: { woods: 26, water: 42, rough: 8 } },
  { id: 'playa', label: 'Playa', terrain: { woods: 2, water: 16, rough: 8 } },
  { id: 'spore-field', label: 'Spore field', terrain: { woods: 36, water: 16, rough: 10 } },
  { id: 'crystal-waste', label: 'Crystal waste', terrain: { woods: 14, water: 8, rough: 32 } },
]

export function matchTerrainPreset(
  terrain: TerrainWeights,
  biomeDefaults: TerrainWeights,
): string {
  const matches = (weights: TerrainWeights) =>
    weights.woods === terrain.woods &&
    weights.water === terrain.water &&
    weights.rough === terrain.rough
  if (matches(biomeDefaults)) return 'balanced'
  return TERRAIN_PRESETS.find((preset) => preset.terrain && matches(preset.terrain))?.id ?? 'custom'
}

export interface UrbanPreset {
  id: string
  label: string
  /** Base probability that a street-adjacent lot gets a building. */
  density: number
  /** Fraction of the map width zoned as the city center. */
  centerWidth: number
  flanks: 'residential' | 'industrial' | 'mixed'
  /** Military hangars, bunkers, and headquarters instead of civilian mix. */
  military?: boolean
  /** Damage structures and scatter rubble after placement. */
  ruins?: boolean
}

export const URBAN_PRESETS: UrbanPreset[] = [
  { id: 'settlement', label: 'Settlement', density: 0.3, centerWidth: 0.2, flanks: 'residential' },
  { id: 'industrial', label: 'Industrial zone', density: 0.45, centerWidth: 0.25, flanks: 'industrial' },
  { id: 'city-center', label: 'City center', density: 0.6, centerWidth: 0.45, flanks: 'mixed' },
  {
    id: 'base',
    label: 'Military base',
    density: 0.5,
    centerWidth: 0.35,
    flanks: 'mixed',
    military: true,
  },
  {
    id: 'ruins',
    label: 'Post-apocalyptic ruins',
    density: 0.38,
    centerWidth: 0.3,
    flanks: 'mixed',
    ruins: true,
  },
]

export function getUrbanPreset(id: string | undefined): UrbanPreset {
  return URBAN_PRESETS.find((preset) => preset.id === id) ?? URBAN_PRESETS[0]
}
