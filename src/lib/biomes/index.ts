import type { BiomeDefinition, BiomeId } from '../../types/biome'
import { agricultural } from './agricultural'
import { alkaliSaltFlats } from './alkaliSaltFlats'
import { alienFungal } from './alienFungal'
import { alpineMountains } from './alpineMountains'
import { arcticTundra } from './arcticTundra'
import { badlands } from './badlands'
import { borealTaiga } from './borealTaiga'
import { canyonRoad } from './canyonRoad'
import { coastal } from './coastal'
import { crystalWorld } from './crystalWorld'
import { denseForest } from './denseForest'
import { fjordShore } from './fjordShore'
import { glacialIcefield } from './glacialIcefield'
import { hotDesert } from './hotDesert'
import { iceMoon } from './iceMoon'
import { industrialWasteland } from './industrialWasteland'
import { karstHighlands } from './karstHighlands'
import { lunar } from './lunar'
import { martian } from './martian'
import { mangroveEstuary } from './mangroveEstuary'
import { mediterraneanScrub } from './mediterraneanScrub'
import { oceanicArchipelago } from './oceanicArchipelago'
import { openPitExtraction } from './openPitExtraction'
import { temperateGrasslands } from './temperateGrasslands'
import { temperateRainforest } from './temperateRainforest'
import { tropicalJungle } from './tropicalJungle'
import { tropicalSavanna } from './tropicalSavanna'
import { urban } from './urban'
import { volcanic } from './volcanic'
import { wetlands } from './wetlands'

export const DEFAULT_BIOME_ID: BiomeId = 'temperate-grasslands'

const BIOME_REGISTRY: Record<BiomeId, BiomeDefinition> = {
  'temperate-grasslands': temperateGrasslands,
  'dense-forest': denseForest,
  'hot-desert': hotDesert,
  'alpine-mountains': alpineMountains,
  'wetlands': wetlands,
  'volcanic': volcanic,
  'urban': urban,
  'lunar': lunar,
  'agricultural': agricultural,
  'industrial-wasteland': industrialWasteland,
  'arctic-tundra': arcticTundra,
  'badlands': badlands,
  'tropical-jungle': tropicalJungle,
  'coastal': coastal,
  'mediterranean-scrub': mediterraneanScrub,
  'oceanic-archipelago': oceanicArchipelago,
  'boreal-taiga': borealTaiga,
  'tropical-savanna': tropicalSavanna,
  'temperate-rainforest': temperateRainforest,
  'mangrove-estuary': mangroveEstuary,
  'glacial-icefield': glacialIcefield,
  'karst-highlands': karstHighlands,
  'alkali-salt-flats': alkaliSaltFlats,
  'fjord-shore': fjordShore,
  'open-pit-extraction': openPitExtraction,
  'ice-moon': iceMoon,
  'canyon-road': canyonRoad,
  martian,
  'alien-fungal': alienFungal,
  'crystal-world': crystalWorld,
}

export const BIOME_IDS = Object.keys(BIOME_REGISTRY) as BiomeId[]

export function isBiomeId(value: unknown): value is BiomeId {
  return typeof value === 'string' && value in BIOME_REGISTRY
}

export function getBiome(id: BiomeId): BiomeDefinition {
  return BIOME_REGISTRY[id]
}

export function resolveBiomeId(map: { biome?: string }): BiomeId {
  return isBiomeId(map.biome) ? map.biome : DEFAULT_BIOME_ID
}

export function resolveBiome(map: { biome?: string }): BiomeDefinition {
  return getBiome(resolveBiomeId(map))
}

export function listBiomes(): BiomeDefinition[] {
  return BIOME_IDS.map((id) => BIOME_REGISTRY[id])
}
