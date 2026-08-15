import type {
  Building,
  BuildingCategory,
  BuildingRotation,
  BuildingState,
  BuildingType,
  ConstructionType,
} from '../types/building'
import { BUILDING_STATES } from '../types/building'
import type { BattleMap, HexCell } from '../types/map'
import { axialToOffset, cubeRound, edgeNeighbor, hexDistance, offsetToAxial } from './hex'

export interface BuildingDefinition {
  type: BuildingType
  label: string
  category: BuildingCategory
  /** Static height in levels, for reference sheets and print metadata. */
  height: number
  /** BattleTech construction factor. */
  constructionFactor: number
  constructionType: ConstructionType
  /** Axial footprint offsets at rotation 0, before centering on the anchor hex. */
  footprint: { q: number; r: number }[]
  /** Door markers: footprint offset + edge index (rotated with the building). */
  entrances: { q: number; r: number; edge: number }[]
}

export const BUILDING_TYPES: Record<BuildingType, BuildingDefinition> = {
  house: {
    type: 'house',
    label: 'Residential House',
    category: 'civilian',
    height: 1,
    constructionFactor: 15,
    constructionType: 'light',
    footprint: [{ q: 0, r: 0 }],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  apartment: {
    type: 'apartment',
    label: 'Apartment Block',
    category: 'civilian',
    height: 3,
    constructionFactor: 30,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  warehouse: {
    type: 'warehouse',
    label: 'Warehouse',
    category: 'industrial',
    height: 2,
    constructionFactor: 25,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  factory: {
    type: 'factory',
    label: 'Factory',
    category: 'industrial',
    height: 2,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: 1, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  bridge: {
    type: 'bridge',
    label: 'Bridge',
    category: 'infrastructure',
    height: 1,
    constructionFactor: 20,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [],
  },
  commTower: {
    type: 'commTower',
    label: 'Communications Tower',
    category: 'infrastructure',
    height: 4,
    constructionFactor: 10,
    constructionType: 'light',
    footprint: [{ q: 0, r: 0 }],
    entrances: [],
  },
  officeTower: {
    type: 'officeTower',
    label: 'Office Tower',
    category: 'civilian',
    height: 5,
    constructionFactor: 35,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  mechHangar: {
    type: 'mechHangar',
    label: 'BattleMech Hangar',
    category: 'military',
    height: 2,
    constructionFactor: 45,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 1, r: 0, edge: 0 }],
  },
  bunker: {
    type: 'bunker',
    label: 'Fortified Bunker',
    category: 'military',
    height: 1,
    constructionFactor: 90,
    constructionType: 'fortified',
    footprint: [{ q: 0, r: 0 }],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  commandHQ: {
    type: 'commandHQ',
    label: 'Command Headquarters',
    category: 'military',
    height: 2,
    constructionFactor: 60,
    constructionType: 'hardened',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  fuelDepot: {
    type: 'fuelDepot',
    label: 'Fuel Depot',
    category: 'industrial',
    height: 1,
    constructionFactor: 30,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [],
  },
  dropShipPad: {
    type: 'dropShipPad',
    label: 'DropShip Landing Pad',
    category: 'infrastructure',
    height: 1,
    constructionFactor: 20,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: 1, r: 1 },
    ],
    entrances: [],
  },
  hospital: {
    type: 'hospital',
    label: 'Hospital',
    category: 'civilian',
    height: 2,
    constructionFactor: 35,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  government: {
    type: 'government',
    label: 'Government Building',
    category: 'civilian',
    height: 3,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  barracks: {
    type: 'barracks',
    label: 'Infantry Barracks',
    category: 'military',
    height: 2,
    constructionFactor: 25,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  vehicleGarage: {
    type: 'vehicleGarage',
    label: 'Vehicle Garage',
    category: 'military',
    height: 2,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 1, r: 0, edge: 0 }],
  },
  repairBay: {
    type: 'repairBay',
    label: 'Repair Bay',
    category: 'military',
    height: 2,
    constructionFactor: 45,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 1, r: 0, edge: 0 }],
  },
  powerPlant: {
    type: 'powerPlant',
    label: 'Power Plant',
    category: 'infrastructure',
    height: 3,
    constructionFactor: 50,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: 1, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  railStation: {
    type: 'railStation',
    label: 'Rail Station',
    category: 'infrastructure',
    height: 2,
    constructionFactor: 30,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  waterTower: {
    type: 'waterTower',
    label: 'Water Tower',
    category: 'infrastructure',
    height: 3,
    constructionFactor: 15,
    constructionType: 'light',
    footprint: [{ q: 0, r: 0 }],
    entrances: [],
  },
  hpgStation: {
    type: 'hpgStation',
    label: 'HPG Station',
    category: 'military',
    height: 3,
    constructionFactor: 80,
    constructionType: 'hardened',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  castleBrian: {
    type: 'castleBrian',
    label: 'Castle Brian Entrance',
    category: 'military',
    height: 1,
    constructionFactor: 120,
    constructionType: 'fortified',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  starLeagueBunker: {
    type: 'starLeagueBunker',
    label: 'Star League Bunker',
    category: 'military',
    height: 1,
    constructionFactor: 100,
    constructionType: 'fortified',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  highRise: {
    type: 'highRise',
    label: 'High-rise Tower',
    category: 'civilian',
    height: 8,
    constructionFactor: 40,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  shoppingCenter: {
    type: 'shoppingCenter',
    label: 'Shopping Center',
    category: 'civilian',
    height: 2,
    constructionFactor: 25,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: 1, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  hotel: {
    type: 'hotel',
    label: 'Hotel',
    category: 'civilian',
    height: 4,
    constructionFactor: 30,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  school: {
    type: 'school',
    label: 'School',
    category: 'civilian',
    height: 2,
    constructionFactor: 20,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  policeStation: {
    type: 'policeStation',
    label: 'Police Station',
    category: 'civilian',
    height: 2,
    constructionFactor: 35,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  fireStation: {
    type: 'fireStation',
    label: 'Fire Station',
    category: 'civilian',
    height: 2,
    constructionFactor: 30,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 1, r: 0, edge: 0 }],
  },
  spaceportTerminal: {
    type: 'spaceportTerminal',
    label: 'Spaceport Terminal',
    category: 'civilian',
    height: 3,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  heavyAssembly: {
    type: 'heavyAssembly',
    label: 'Heavy Assembly Plant',
    category: 'industrial',
    height: 3,
    constructionFactor: 50,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: 1, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  mechFactory: {
    type: 'mechFactory',
    label: 'BattleMech Factory',
    category: 'industrial',
    height: 3,
    constructionFactor: 55,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: 1, r: 1 },
    ],
    entrances: [{ q: 1, r: 0, edge: 0 }],
  },
  vehicleFactory: {
    type: 'vehicleFactory',
    label: 'Vehicle Factory',
    category: 'industrial',
    height: 2,
    constructionFactor: 45,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 1, r: 0, edge: 0 }],
  },
  munitionsPlant: {
    type: 'munitionsPlant',
    label: 'Munitions Plant',
    category: 'industrial',
    height: 2,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  refinery: {
    type: 'refinery',
    label: 'Refinery',
    category: 'industrial',
    height: 4,
    constructionFactor: 45,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  chemicalPlant: {
    type: 'chemicalPlant',
    label: 'Chemical Plant',
    category: 'industrial',
    height: 3,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  steelMill: {
    type: 'steelMill',
    label: 'Steel Mill',
    category: 'industrial',
    height: 3,
    constructionFactor: 50,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: 1, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  autoStorage: {
    type: 'autoStorage',
    label: 'Automated Storage Depot',
    category: 'industrial',
    height: 3,
    constructionFactor: 30,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  fusionReactor: {
    type: 'fusionReactor',
    label: 'Fusion Reactor',
    category: 'industrial',
    height: 3,
    constructionFactor: 70,
    constructionType: 'hardened',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  miningFacility: {
    type: 'miningFacility',
    label: 'Mining Facility',
    category: 'industrial',
    height: 2,
    constructionFactor: 35,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  waterTreatment: {
    type: 'waterTreatment',
    label: 'Water-treatment Plant',
    category: 'industrial',
    height: 2,
    constructionFactor: 30,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  aerospaceHangar: {
    type: 'aerospaceHangar',
    label: 'Aerospace Hangar',
    category: 'military',
    height: 2,
    constructionFactor: 45,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 1, r: 0, edge: 0 }],
  },
  ammoDepot: {
    type: 'ammoDepot',
    label: 'Ammunition Depot',
    category: 'military',
    height: 1,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [],
  },
  radarStation: {
    type: 'radarStation',
    label: 'Radar Station',
    category: 'military',
    height: 3,
    constructionFactor: 25,
    constructionType: 'medium',
    footprint: [{ q: 0, r: 0 }],
    entrances: [],
  },
  commArray: {
    type: 'commArray',
    label: 'Communications Array',
    category: 'military',
    height: 2,
    constructionFactor: 20,
    constructionType: 'light',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [],
  },
  airDefense: {
    type: 'airDefense',
    label: 'Air-defense Emplacement',
    category: 'military',
    height: 1,
    constructionFactor: 50,
    constructionType: 'hardened',
    footprint: [{ q: 0, r: 0 }],
    entrances: [],
  },
  turretControl: {
    type: 'turretControl',
    label: 'Turret Control Building',
    category: 'military',
    height: 1,
    constructionFactor: 40,
    constructionType: 'hardened',
    footprint: [{ q: 0, r: 0 }],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  trainingFacility: {
    type: 'trainingFacility',
    label: 'Training Facility',
    category: 'military',
    height: 2,
    constructionFactor: 25,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  mechBay: {
    type: 'mechBay',
    label: 'Mech Bay',
    category: 'military',
    height: 2,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 1, r: 0, edge: 0 }],
  },
  repairGantry: {
    type: 'repairGantry',
    label: 'Repair Gantry',
    category: 'military',
    height: 3,
    constructionFactor: 30,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [],
  },
  deploymentHangar: {
    type: 'deploymentHangar',
    label: 'Deployment Hangar',
    category: 'military',
    height: 2,
    constructionFactor: 45,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 1, r: 0, edge: 0 }],
  },
  dropShipService: {
    type: 'dropShipService',
    label: 'DropShip Service Facility',
    category: 'military',
    height: 2,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  omniBay: {
    type: 'omniBay',
    label: 'OmniMech Configuration Bay',
    category: 'military',
    height: 2,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 1, r: 0, edge: 0 }],
  },
  salvageYard: {
    type: 'salvageYard',
    label: 'Salvage Yard',
    category: 'military',
    height: 1,
    constructionFactor: 15,
    constructionType: 'light',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [],
  },
  coolantStation: {
    type: 'coolantStation',
    label: 'Coolant Station',
    category: 'military',
    height: 1,
    constructionFactor: 20,
    constructionType: 'medium',
    footprint: [{ q: 0, r: 0 }],
    entrances: [],
  },
  munitionsLoader: {
    type: 'munitionsLoader',
    label: 'Munitions Loading Station',
    category: 'military',
    height: 1,
    constructionFactor: 25,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [],
  },
  readyRoom: {
    type: 'readyRoom',
    label: 'MechWarrior Ready Room',
    category: 'military',
    height: 1,
    constructionFactor: 20,
    constructionType: 'medium',
    footprint: [{ q: 0, r: 0 }],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  elevatedHighway: {
    type: 'elevatedHighway',
    label: 'Elevated Highway',
    category: 'infrastructure',
    height: 2,
    constructionFactor: 25,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [],
  },
  maglevTerminal: {
    type: 'maglevTerminal',
    label: 'Maglev Terminal',
    category: 'infrastructure',
    height: 2,
    constructionFactor: 35,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  sensorTower: {
    type: 'sensorTower',
    label: 'Sensor Tower',
    category: 'infrastructure',
    height: 4,
    constructionFactor: 15,
    constructionType: 'light',
    footprint: [{ q: 0, r: 0 }],
    entrances: [],
  },
  pipelineJunction: {
    type: 'pipelineJunction',
    label: 'Pipeline Junction',
    category: 'infrastructure',
    height: 1,
    constructionFactor: 20,
    constructionType: 'medium',
    footprint: [{ q: 0, r: 0 }],
    entrances: [],
  },
  substation: {
    type: 'substation',
    label: 'Electrical Substation',
    category: 'infrastructure',
    height: 1,
    constructionFactor: 20,
    constructionType: 'medium',
    footprint: [{ q: 0, r: 0 }],
    entrances: [],
  },
  dam: {
    type: 'dam',
    label: 'Dam',
    category: 'infrastructure',
    height: 2,
    constructionFactor: 80,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [],
  },
  tunnelEntrance: {
    type: 'tunnelEntrance',
    label: 'Tunnel Entrance',
    category: 'infrastructure',
    height: 1,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  spaceportTower: {
    type: 'spaceportTower',
    label: 'Spaceport Control Tower',
    category: 'infrastructure',
    height: 5,
    constructionFactor: 25,
    constructionType: 'medium',
    footprint: [{ q: 0, r: 0 }],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  planetaryCommand: {
    type: 'planetaryCommand',
    label: 'Planetary Command Center',
    category: 'military',
    height: 3,
    constructionFactor: 70,
    constructionType: 'hardened',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  dataCenter: {
    type: 'dataCenter',
    label: 'Data Center',
    category: 'civilian',
    height: 2,
    constructionFactor: 40,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  intelFacility: {
    type: 'intelFacility',
    label: 'Intelligence Facility',
    category: 'military',
    height: 2,
    constructionFactor: 50,
    constructionType: 'hardened',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  researchLab: {
    type: 'researchLab',
    label: 'Research Laboratory',
    category: 'civilian',
    height: 2,
    constructionFactor: 35,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  prototypeStorage: {
    type: 'prototypeStorage',
    label: 'Prototype Storage Facility',
    category: 'military',
    height: 2,
    constructionFactor: 55,
    constructionType: 'hardened',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  nobleEstate: {
    type: 'nobleEstate',
    label: 'Noble Estate',
    category: 'civilian',
    height: 2,
    constructionFactor: 30,
    constructionType: 'medium',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  governorsPalace: {
    type: 'governorsPalace',
    label: 'Governor\'s Palace',
    category: 'civilian',
    height: 3,
    constructionFactor: 45,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  orbitalDefense: {
    type: 'orbitalDefense',
    label: 'Orbital-defense Control Center',
    category: 'military',
    height: 3,
    constructionFactor: 80,
    constructionType: 'hardened',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
  terraformingStation: {
    type: 'terraformingStation',
    label: 'Terraforming Station',
    category: 'infrastructure',
    height: 3,
    constructionFactor: 50,
    constructionType: 'heavy',
    footprint: [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
    ],
    entrances: [{ q: 0, r: 0, edge: 3 }],
  },
}

export const BUILDING_TYPE_IDS = Object.keys(BUILDING_TYPES) as BuildingType[]

export function isBuildingType(value: unknown): value is BuildingType {
  return typeof value === 'string' && value in BUILDING_TYPES
}

export function isBuildingState(value: unknown): value is BuildingState {
  return (
    value === 'damaged' ||
    (typeof value === 'string' && (BUILDING_STATES as readonly string[]).includes(value))
  )
}

/** One 60-degree clockwise step in axial space. */
function rotateAxial(offset: { q: number; r: number }) {
  return { q: -offset.r, r: offset.q + offset.r }
}

function rotateOffset(
  offset: { q: number; r: number },
  rotation: BuildingRotation,
): { q: number; r: number } {
  let result = offset
  for (let step = 0; step < rotation; step += 1) {
    result = rotateAxial(result)
  }
  return result
}

function footprintCentroid(offsets: { q: number; r: number }[]) {
  const count = offsets.length || 1
  return {
    q: offsets.reduce((sum, offset) => sum + offset.q, 0) / count,
    r: offsets.reduce((sum, offset) => sum + offset.r, 0) / count,
  }
}

function placementShift(building: Building) {
  const rotated = BUILDING_TYPES[building.type].footprint.map((offset) =>
    rotateOffset(offset, building.rotation),
  )
  const centroid = footprintCentroid(rotated)
  const center = offsetToAxial(building.anchor.col, building.anchor.row)
  return cubeRound(center.q - centroid.q, center.r - centroid.r)
}

export function buildingCells(building: Building): { col: number; row: number }[] {
  const shift = placementShift(building)
  return BUILDING_TYPES[building.type].footprint.map((offset) => {
    const rotated = rotateOffset(offset, building.rotation)
    return axialToOffset(rotated.q + shift.q, rotated.r + shift.r)
  })
}

export function buildingEntrances(building: Building) {
  const shift = placementShift(building)
  return BUILDING_TYPES[building.type].entrances.map((entrance) => {
    const rotated = rotateOffset({ q: entrance.q, r: entrance.r }, building.rotation)
    return {
      ...axialToOffset(rotated.q + shift.q, rotated.r + shift.r),
      edge: (entrance.edge + building.rotation) % 6,
    }
  })
}

function buildingFronts(building: Building) {
  const entrances = buildingEntrances(building)
  if (entrances.length > 0) return entrances
  if (building.type === 'bridge') return []
  return [{ ...building.anchor, edge: (3 + building.rotation) % 6 }]
}

function isStreetCell(cell?: HexCell) {
  return cell?.terrain === 'road' && cell.skin !== 'rail'
}

export function buildingFacesRoad(map: BattleMap, building: Building) {
  return buildingFronts(building).some((front) => {
    const next = edgeNeighbor(front.col, front.row, front.edge)
    return isStreetCell(cellAt(map, next.col, next.row))
  })
}

/** Axes a road hex already travels (0 = E-W, 1 = SE-NW, 2 = SW-NE). */
function roadTravelAxes(map: BattleMap, col: number, row: number) {
  const axes = new Set<number>()
  for (let edge = 0; edge < 6; edge += 1) {
    const next = edgeNeighbor(col, row, edge)
    if (isStreetCell(cellAt(map, next.col, next.row))) axes.add(edge % 3)
  }
  return axes
}

function roadNeighborEdges(map: BattleMap, col: number, row: number) {
  const edges: number[] = []
  for (let edge = 0; edge < 6; edge += 1) {
    const next = edgeNeighbor(col, row, edge)
    if (isStreetCell(cellAt(map, next.col, next.row))) edges.push(edge)
  }
  return edges
}

/** Straight street through a hex, or null at a bend / intersection / stub. */
function throughAxis(map: BattleMap, col: number, row: number) {
  const edges = roadNeighborEdges(map, col, row)
  if (edges.length === 2 && (edges[1] - edges[0] + 6) % 6 === 3) return edges[0] % 3
  return null
}

/** South face of the unrotated plate, after the building's rotation. */
function facadeEdges(rotation: number): [number, number] {
  return [(1 + rotation) % 6, (2 + rotation) % 6]
}

/**
 * Side-frontage votes per street axis. Looking down a road into a junction
 * does not count; a through-street along the lot counts double.
 */
function frontageAxisVotes(map: BattleMap, cells: { col: number; row: number }[]) {
  const votes = [0, 0, 0]
  for (const cell of cells) {
    for (let edge = 0; edge < 6; edge += 1) {
      const next = edgeNeighbor(cell.col, cell.row, edge)
      if (!isStreetCell(cellAt(map, next.col, next.row))) continue
      const approach = edge % 3
      const through = throughAxis(map, next.col, next.row)
      if (through !== null) {
        if (through !== approach) votes[through] += 2
        continue
      }
      const axes = roadTravelAxes(map, next.col, next.row)
      if (axes.size === 0) {
        votes[approach] += 2
        continue
      }
      for (const axis of axes) {
        if (axis !== approach) votes[axis] += 1
      }
    }
  }
  return votes
}

function facadeFacesSideStreet(map: BattleMap, building: Building) {
  for (const cell of buildingCells(building)) {
    for (const edge of facadeEdges(building.rotation)) {
      const next = edgeNeighbor(cell.col, cell.row, edge)
      if (!isStreetCell(cellAt(map, next.col, next.row))) continue
      const through = throughAxis(map, next.col, next.row)
      if (through !== null) return through !== edge % 3
      const axes = roadTravelAxes(map, next.col, next.row)
      if (axes.size === 0) return true
      if ([...axes].some((axis) => axis !== edge % 3)) return true
    }
  }
  return false
}

export function buildingAlignsWithRoad(map: BattleMap, building: Building) {
  const votes = frontageAxisVotes(map, buildingCells(building))
  return votes[building.rotation % 3] >= 2
}

/** Rotations parallel to the lot's through-street, facade toward that street. */
export function rotationsAlongRoad(
  map: BattleMap,
  type: BuildingType,
  anchor: { col: number; row: number },
): BuildingRotation[] {
  const scored = ([0, 1, 2, 3, 4, 5] as BuildingRotation[]).map((rotation) => {
    const building = { id: '', type, anchor, rotation, state: 'intact' as const }
    const cells = buildingCells(building)
    if (cells.some((cell) => cellAt(map, cell.col, cell.row)?.terrain === 'road')) {
      return { rotation, score: -1 }
    }
    const axisScore = frontageAxisVotes(map, cells)[rotation % 3]
    if (axisScore < 2) return { rotation, score: -1 }
    const facade = facadeFacesSideStreet(map, building) ? 3 : 0
    const door = buildingFacesRoad(map, building) ? 1 : 0
    return { rotation, score: axisScore * 10 + facade + door }
  })
  scored.sort((left, right) => right.score - left.score || left.rotation - right.rotation)
  return scored.filter((entry) => entry.score > 0).map((entry) => entry.rotation)
}

export function buildingAt(map: BattleMap, target: { col: number; row: number }) {
  return map.buildings.find((building) =>
    buildingCells(building).some(
      (cell) => cell.col === target.col && cell.row === target.row,
    ),
  )
}

function cellAt(map: BattleMap, col: number, row: number): HexCell | undefined {
  if (col < 0 || row < 0 || col >= map.width || row >= map.height) return undefined
  return map.cells[row * map.width + col]
}

export function canPlaceBuilding(
  map: BattleMap,
  type: BuildingType,
  anchor: { col: number; row: number },
  rotation: BuildingRotation,
  ignoreBuildingId?: string,
): boolean {
  const cells = buildingCells({ id: '', type, anchor, rotation, state: 'intact' })
  if (cells.some((cell) => !cellAt(map, cell.col, cell.row))) return false
  const occupied = new Set(
    map.buildings
      .filter((building) => building.id !== ignoreBuildingId)
      .flatMap((building) => buildingCells(building).map((cell) => `${cell.col}:${cell.row}`)),
  )
  if (cells.some((cell) => occupied.has(`${cell.col}:${cell.row}`))) return false
  const terrain = cells.map((cell) => cellAt(map, cell.col, cell.row)!.terrain)
  if (type === 'bridge') return terrain.some((terrainType) => terrainType === 'water')
  return terrain.every(
    (terrainType) => terrainType !== 'water' && terrainType !== 'lava' && terrainType !== 'road',
  )
}

export function footprintAdjacencyHolds(type: BuildingType): boolean {
  const cells = buildingCells({ id: '', type, anchor: { col: 4, row: 4 }, rotation: 0, state: 'intact' })
  if (cells.length <= 1) return true
  const [first, ...rest] = cells
  return rest.some((cell) => hexDistance(first, cell) === 1)
}
