export type BuildingType =
  | 'house'
  | 'apartment'
  | 'warehouse'
  | 'factory'
  | 'bridge'
  | 'commTower'
  | 'officeTower'
  | 'mechHangar'
  | 'bunker'
  | 'commandHQ'
  | 'fuelDepot'
  | 'dropShipPad'
  | 'hospital'
  | 'government'
  | 'barracks'
  | 'vehicleGarage'
  | 'repairBay'
  | 'powerPlant'
  | 'railStation'
  | 'waterTower'
  | 'hpgStation'
  | 'castleBrian'
  | 'starLeagueBunker'
  | 'highRise'
  | 'shoppingCenter'
  | 'hotel'
  | 'school'
  | 'policeStation'
  | 'fireStation'
  | 'spaceportTerminal'
  | 'heavyAssembly'
  | 'mechFactory'
  | 'vehicleFactory'
  | 'munitionsPlant'
  | 'refinery'
  | 'chemicalPlant'
  | 'steelMill'
  | 'autoStorage'
  | 'fusionReactor'
  | 'miningFacility'
  | 'waterTreatment'
  | 'aerospaceHangar'
  | 'ammoDepot'
  | 'radarStation'
  | 'commArray'
  | 'airDefense'
  | 'turretControl'
  | 'trainingFacility'
  | 'mechBay'
  | 'repairGantry'
  | 'deploymentHangar'
  | 'dropShipService'
  | 'omniBay'
  | 'salvageYard'
  | 'coolantStation'
  | 'munitionsLoader'
  | 'readyRoom'
  | 'elevatedHighway'
  | 'maglevTerminal'
  | 'sensorTower'
  | 'pipelineJunction'
  | 'substation'
  | 'dam'
  | 'tunnelEntrance'
  | 'spaceportTower'
  | 'planetaryCommand'
  | 'dataCenter'
  | 'intelFacility'
  | 'researchLab'
  | 'prototypeStorage'
  | 'nobleEstate'
  | 'governorsPalace'
  | 'orbitalDefense'
  | 'terraformingStation'

export type BuildingCategory = 'civilian' | 'industrial' | 'infrastructure' | 'military'

export type ConstructionType = 'light' | 'medium' | 'heavy' | 'hardened' | 'fortified'

export const BUILDING_STATES = [
  'intact',
  'lightlyDamaged',
  'heavilyDamaged',
  'burning',
  'collapsed',
  'rubble',
] as const

export type BuildingState = (typeof BUILDING_STATES)[number] | 'damaged'

export const BUILDING_STATE_LABELS: Record<(typeof BUILDING_STATES)[number], string> = {
  intact: 'Intact',
  lightlyDamaged: 'Lightly damaged',
  heavilyDamaged: 'Heavily damaged',
  burning: 'Burning',
  collapsed: 'Collapsed',
  rubble: 'Rubble',
}

export const CONSTRUCTION_LABELS: Record<ConstructionType, string> = {
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
  hardened: 'Hardened',
  fortified: 'Fortified',
}

export type BuildingRotation = 0 | 1 | 2 | 3 | 4 | 5

export interface Building {
  id: string
  type: BuildingType
  /** Center hex; the footprint is placed and rotated around it. */
  anchor: { col: number; row: number }
  rotation: BuildingRotation
  state: BuildingState
  label?: string
}
