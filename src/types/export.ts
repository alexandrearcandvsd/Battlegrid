export const HEX_NUMBERING_MODES = ['off', 'offset', 'rowcol', 'axial'] as const
export type HexNumberingMode = (typeof HEX_NUMBERING_MODES)[number]

export const PAPER_SIZES = ['letter', 'tabloid', 'a4', 'a3', 'a2', 'a1'] as const
export type PaperSize = (typeof PAPER_SIZES)[number]

export const PAGE_ORIENTATIONS = ['landscape', 'portrait'] as const
export type PageOrientation = (typeof PAGE_ORIENTATIONS)[number]

export const PNG_SCALES = [1, 2, 3, 4, 10] as const
export type PngScale = (typeof PNG_SCALES)[number]

export const PRINT_SCALES = ['tabletop', 'fit'] as const
export type PrintScale = (typeof PRINT_SCALES)[number]

export interface ExportSettings {
  pngScale: PngScale
  paper: PaperSize
  orientation: PageOrientation
  numbering: HexNumberingMode
  /** Title block, margins, crop marks, and automatic tiling. */
  includeChrome: boolean
  includeLegend: boolean
  includeElevationKey: boolean
  includeBuildingSheet: boolean
  /** Height tint, snow line, rims, and elevation badges on the map. */
  includeElevation: boolean
  /** Structure stamps on the map. The building reference sheet is separate. */
  includeBuildings: boolean
  /** Cell marks (crater, ice, wall, and the rest). */
  includeFeatures: boolean
  /** Typed hex notes. */
  includeAnnotations: boolean
  /** Compact legend and a tighter building reference sheet. */
  sheetLayout: 'standard' | 'compact'
  /** tabletop = 1.25 in hexes (CGL/FASA); fit = shrink to the page. */
  printScale: PrintScale
  grayscale: boolean
  /** Hatch overlays and terrain tags so hexes stay readable without color. */
  terrainMarks: boolean
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  pngScale: 2,
  paper: 'letter',
  orientation: 'landscape',
  numbering: 'offset',
  includeChrome: true,
  includeLegend: true,
  includeElevationKey: true,
  includeBuildingSheet: true,
  includeElevation: true,
  includeBuildings: true,
  includeFeatures: true,
  includeAnnotations: true,
  sheetLayout: 'standard',
  printScale: 'tabletop',
  grayscale: false,
  terrainMarks: true,
}

export interface ExportPage {
  kind: 'map' | 'buildings'
  label: string
  svg: string
  widthMm: number
  heightMm: number
}
