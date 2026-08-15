import { resolveBiome } from './biomes'
import { applyColorway } from './colorways'
import { BUILDING_TYPES } from './buildings'
import type { BuildingState } from '../types/building'
import { BUILDING_STATE_LABELS } from '../types/building'
import { HEX_SIZE, MAP_VIEW_PADDING, hexCenter, mapPixelSize, pointsAttribute } from './hex'
import { formatHexNumber } from './hexNumbering'
import { safeFilename } from './serialization'
import type { BattleMap, TerrainType } from '../types/map'
import { FEATURE_LABELS, MAX_ELEVATION, TERRAIN_TYPES } from '../types/map'
import type {
  ExportPage,
  ExportSettings,
  PageOrientation,
  PaperSize,
} from '../types/export'

export const PAPER_MM: Record<PaperSize, { width: number; height: number }> = {
  letter: { width: 215.9, height: 279.4 },
  tabloid: { width: 279.4, height: 431.8 },
  a4: { width: 210, height: 297 },
  a3: { width: 297, height: 420 },
  a2: { width: 420, height: 594 },
  a1: { width: 594, height: 841 },
}

export const PRINT = {
  marginMm: 12,
  titleMm: 18,
  legendMm: 26,
  cropMm: 5,
  minHexHeightMm: 8,
  overlapPx: HEX_SIZE * 2,
  buildingRowMm: 7,
} as const

/** CGL / FASA mapsheet hex, flat-to-flat. */
export const TABLETOP_HEX_IN = 1.25
export const TABLETOP_HEX_MM = TABLETOP_HEX_IN * 25.4

export function hexFlatToFlatSvg(size = HEX_SIZE) {
  return size * Math.sqrt(3)
}

export function tabletopMmPerSvgUnit(size = HEX_SIZE) {
  return TABLETOP_HEX_MM / hexFlatToFlatSvg(size)
}

export interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

export interface MapTile {
  col: number
  row: number
  label: string
  viewBox: ViewBox
}

export interface BuildingSheetRow {
  hex: string
  type: string
  label: string
  height: number
  constructionFactor: number
  state: string
  category: string
}

export function paperDimensions(paper: PaperSize, orientation: PageOrientation) {
  const size = PAPER_MM[paper]
  return orientation === 'landscape'
    ? { width: size.height, height: size.width }
    : { width: size.width, height: size.height }
}

export function legendHeight(settings: ExportSettings) {
  if (!settings.includeChrome) return 0
  if (!settings.includeLegend && !settings.includeElevationKey) return 0
  return settings.sheetLayout === 'compact' ? 16 : PRINT.legendMm
}

export function contentBox(
  paper: { width: number; height: number },
  settings: ExportSettings,
) {
  const title = settings.includeChrome ? PRINT.titleMm : 0
  const legend = legendHeight(settings)
  return {
    x: PRINT.marginMm,
    y: PRINT.marginMm + title,
    width: paper.width - 2 * PRINT.marginMm,
    height: paper.height - 2 * PRINT.marginMm - title - legend,
  }
}

export function columnLetters(index: number) {
  let remaining = index
  let label = ''
  do {
    label = String.fromCharCode(65 + (remaining % 26)) + label
    remaining = Math.floor(remaining / 26) - 1
  } while (remaining >= 0)
  return label
}

function layoutFixedScaleTiles(
  mapBox: ViewBox,
  paper: { width: number; height: number },
  settings: ExportSettings,
  scaleMmPerUnit: number,
): MapTile[] {
  const box = contentBox(paper, settings)
  const tileW = box.width / scaleMmPerUnit
  const tileH = box.height / scaleMmPerUnit
  const overlap = Math.min(PRINT.overlapPx, tileW * 0.25, tileH * 0.25)
  const stepX = Math.max(tileW - overlap, tileW * 0.5)
  const stepY = Math.max(tileH - overlap, tileH * 0.5)
  const cols = mapBox.width <= tileW ? 1 : 1 + Math.ceil((mapBox.width - tileW) / stepX)
  const rows = mapBox.height <= tileH ? 1 : 1 + Math.ceil((mapBox.height - tileH) / stepY)
  const tiles: MapTile[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const maxOffsetX = Math.max(0, mapBox.width - tileW)
      const maxOffsetY = Math.max(0, mapBox.height - tileH)
      const offsetX = cols === 1 ? -((tileW - mapBox.width) / 2) : Math.min(col * stepX, maxOffsetX)
      const offsetY = rows === 1 ? -((tileH - mapBox.height) / 2) : Math.min(row * stepY, maxOffsetY)
      tiles.push({
        col,
        row,
        label: `${columnLetters(col)}${row + 1}`,
        viewBox: {
          x: mapBox.x + offsetX,
          y: mapBox.y + offsetY,
          width: tileW,
          height: tileH,
        },
      })
    }
  }
  return tiles
}

export function layoutTiles(
  mapBox: ViewBox,
  paper: { width: number; height: number },
  settings: ExportSettings,
): MapTile[] {
  if (settings.printScale === 'tabletop') {
    return layoutFixedScaleTiles(mapBox, paper, settings, tabletopMmPerSvgUnit())
  }
  if (!settings.includeChrome) {
    return [{ col: 0, row: 0, label: 'map', viewBox: mapBox }]
  }

  const box = contentBox(paper, settings)
  const fitScale = Math.min(box.width / mapBox.width, box.height / mapBox.height)
  const minScale = PRINT.minHexHeightMm / (2 * HEX_SIZE)

  if (fitScale >= minScale) {
    return [{ col: 0, row: 0, label: 'A1', viewBox: mapBox }]
  }

  return layoutFixedScaleTiles(mapBox, paper, settings, minScale)
}

export function legendTerrains(map: BattleMap): TerrainType[] {
  const present = new Set(map.cells.map((cell) => cell.terrain))
  return TERRAIN_TYPES.filter((terrain) => present.has(terrain))
}

function buildingStateLabel(state: BuildingState) {
  if (state === 'damaged' || state === 'heavilyDamaged') return BUILDING_STATE_LABELS.heavilyDamaged
  return BUILDING_STATE_LABELS[state]
}

export function buildingSheetRows(
  map: BattleMap,
  numbering: ExportSettings['numbering'],
): BuildingSheetRow[] {
  const hexMode = numbering === 'off' ? 'offset' : numbering
  return [...map.buildings]
    .sort(
      (left, right) =>
        left.anchor.row - right.anchor.row || left.anchor.col - right.anchor.col,
    )
    .map((building) => {
      const definition = BUILDING_TYPES[building.type]
      return {
        hex: formatHexNumber(building.anchor.col, building.anchor.row, hexMode),
        type: definition.label,
        label: building.label ?? '',
        height: definition.height,
        constructionFactor: definition.constructionFactor,
        state: buildingStateLabel(building.state),
        category: definition.category,
      }
    })
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function formatPrintDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function mmToCssPixels(mm: number) {
  return (mm * 96) / 25.4
}

export function rasterPixelSize(
  width: number,
  height: number,
  scale: number,
) {
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export function mapExportViewBox(width: number, height: number): ViewBox {
  const pixels = mapPixelSize(width, height, HEX_SIZE)
  return {
    x: -MAP_VIEW_PADDING,
    y: -MAP_VIEW_PADDING,
    width: pixels.width + MAP_VIEW_PADDING * 2,
    height: pixels.height + MAP_VIEW_PADDING * 2,
  }
}

/** Pixel size of one rasterized PNG/PDF page at the current export settings. */
export function exportRasterPreview(
  settings: ExportSettings,
  map: { width: number; height: number },
) {
  const viewBox = mapExportViewBox(map.width, map.height)
  const paper = paperDimensions(settings.paper, settings.orientation)
  const mapPages = layoutTiles(viewBox, paper, settings).length
  const usesPaper = settings.includeChrome || settings.printScale === 'tabletop'
  if (!usesPaper) {
    return {
      ...rasterPixelSize(viewBox.width, viewBox.height, settings.pngScale),
      mapPages,
      dpi: null as number | null,
    }
  }
  return {
    ...rasterPixelSize(mmToCssPixels(paper.width), mmToCssPixels(paper.height), settings.pngScale),
    mapPages,
    dpi: 96 * settings.pngScale,
  }
}

export function pageFilename(mapName: string, page: ExportPage, totalPages: number) {
  const base = safeFilename(mapName)
  if (totalPages === 1) return base
  return `${base}-${page.label.toLowerCase()}`
}

function unwrapDefs(xml: string) {
  const match = xml.match(/^<defs[^>]*>([\s\S]*)<\/defs>$/i)
  return match ? match[1] : xml
}

interface SvgParts {
  css: string
  defs: string
  body: string
}

function extractSvgParts(source: string): SvgParts {
  const document = new DOMParser().parseFromString(source, 'image/svg+xml')
  const svg = document.documentElement
  svg
    .querySelectorAll(
      '.coordinate-label, .terrain-tag, .selection-overlay, .marquee-rect, .lasso-path',
    )
    .forEach((node) => node.remove())
  const styles = Array.from(svg.querySelectorAll('style'))
  const css = styles.map((style) => style.textContent ?? '').join('\n')
  styles.forEach((style) => style.remove())
  const defsNode = svg.querySelector('defs')
  const defs = defsNode ? new XMLSerializer().serializeToString(defsNode) : ''
  defsNode?.remove()
  const body = Array.from(svg.childNodes)
    .map((node) => new XMLSerializer().serializeToString(node))
    .join('')
  return { css, defs, body }
}

function overlayCss() {
  return `
.print-hex-number {
  fill: #f4f0dc;
  stroke: #10140f;
  stroke-width: 2.2;
  paint-order: stroke;
  font: 6px ui-monospace, monospace;
  pointer-events: none;
}
.print-terrain-tag,
.print-feature-tag {
  fill: #10140f;
  stroke: #f2eee0;
  stroke-width: 2;
  paint-order: stroke;
  font: 700 7px ui-monospace, monospace;
  text-anchor: middle;
  pointer-events: none;
}
.print-hatch { pointer-events: none; }
.crop-mark { stroke: #1a1a1a; stroke-width: 0.25; fill: none; }
.print-frame { fill: #f7f4ea; }
.print-map-well { fill: #101612; }
`
}

function hatchDefs(grayscale = false) {
  const filter = grayscale
    ? `
<filter id="print-grayscale">
  <feColorMatrix type="saturate" values="0" />
  <feComponentTransfer>
    <feFuncR type="linear" slope="1.18" intercept="-0.06" />
    <feFuncG type="linear" slope="1.18" intercept="-0.06" />
    <feFuncB type="linear" slope="1.18" intercept="-0.06" />
  </feComponentTransfer>
</filter>`
    : ''
  return `
<pattern id="print-hatch-woods" patternUnits="userSpaceOnUse" width="10" height="10">
  <circle cx="2.5" cy="2.5" r="1.35" fill="#111" fill-opacity="0.55" />
  <circle cx="7.5" cy="7.5" r="1.35" fill="#111" fill-opacity="0.55" />
</pattern>
<pattern id="print-hatch-heavyWoods" patternUnits="userSpaceOnUse" width="8" height="8">
  <circle cx="2" cy="2" r="1.4" fill="#111" fill-opacity="0.7" />
  <circle cx="6" cy="6" r="1.4" fill="#111" fill-opacity="0.7" />
  <circle cx="6" cy="2" r="0.9" fill="#111" fill-opacity="0.55" />
</pattern>
<pattern id="print-hatch-rough" patternUnits="userSpaceOnUse" width="8" height="8">
  <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke="#111" stroke-width="1.1" stroke-opacity="0.55" />
</pattern>
<pattern id="print-hatch-water" patternUnits="userSpaceOnUse" width="10" height="6">
  <path d="M0,3 q2.5,-2 5,0 t5,0" fill="none" stroke="#111" stroke-width="1" stroke-opacity="0.5" />
</pattern>
<pattern id="print-hatch-lava" patternUnits="userSpaceOnUse" width="8" height="8">
  <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2 M1,-1 l-2,2 M8,0 l-8,8 M9,7 l-2,2" stroke="#111" stroke-width="1.1" stroke-opacity="0.6" />
</pattern>${filter}
`
}

function mapOverlays(map: BattleMap, settings: ExportSettings) {
  const biome = resolveBiome(map)
  const showMarks = settings.terrainMarks || settings.grayscale
  const hatches = showMarks
    ? map.cells
        .filter((cell) => cell.terrain !== 'clear' && cell.terrain !== 'road')
        .map(
          (cell) =>
            `<polygon class="print-hatch print-hatch-${cell.terrain}" points="${pointsAttribute(cell.col, cell.row, HEX_SIZE)}" fill="url(#print-hatch-${cell.terrain})" />`,
        )
        .join('')
    : ''
  const tags = showMarks
    ? map.cells
        .filter((cell) => biome.palette[cell.terrain].shortLabel)
        .map((cell) => {
          const center = hexCenter(cell.col, cell.row, HEX_SIZE)
          return `<text class="print-terrain-tag" x="${center.x + 11}" y="${center.y + 17}">${escapeXml(biome.palette[cell.terrain].shortLabel)}</text>`
        })
        .join('')
    : ''
  const featureTags =
    showMarks && settings.includeFeatures
      ? map.cells
          .filter((cell) => cell.feature)
          .map((cell) => {
            const center = hexCenter(cell.col, cell.row, HEX_SIZE)
            return `<text class="print-feature-tag" x="${center.x + 11}" y="${center.y + 6}">${escapeXml(FEATURE_LABELS[cell.feature!].slice(0, 2))}</text>`
          })
          .join('')
      : ''
  const numbers =
    settings.numbering === 'off'
      ? ''
      : map.cells
          .map((cell) => {
            const center = hexCenter(cell.col, cell.row, HEX_SIZE)
            return `<text class="print-hex-number" x="${center.x - 17}" y="${center.y + 21}">${escapeXml(formatHexNumber(cell.col, cell.row, settings.numbering))}</text>`
          })
          .join('')
  return `<g class="print-overlays">${hatches}${tags}${featureTags}${numbers}</g>`
}

function visualBiome(map: BattleMap) {
  return applyColorway(resolveBiome(map), map.colorway)
}

function cropMarks(paper: { width: number; height: number }) {
  const m = PRINT.marginMm
  const c = PRINT.cropMm
  const x0 = m
  const y0 = m
  const x1 = paper.width - m
  const y1 = paper.height - m
  const lines = [
    [x0 - c, y0, x0, y0],
    [x0, y0 - c, x0, y0],
    [x1, y0, x1 + c, y0],
    [x1, y0 - c, x1, y0],
    [x0 - c, y1, x0, y1],
    [x0, y1, x0, y1 + c],
    [x1, y1, x1 + c, y1],
    [x1, y1, x1, y1 + c],
  ]
  return lines
    .map(
      ([xStart, yStart, xEnd, yEnd]) =>
        `<line class="crop-mark" x1="${xStart}" y1="${yStart}" x2="${xEnd}" y2="${yEnd}" />`,
    )
    .join('')
}

function titleBlock(
  map: BattleMap,
  paper: { width: number; height: number },
  pageLabel: string,
  pageCount: number,
  printedOn: string,
  printScale: ExportSettings['printScale'],
) {
  const biome = visualBiome(map)
  const x = PRINT.marginMm
  const y = PRINT.marginMm
  const width = paper.width - 2 * PRINT.marginMm
  const hexScale =
    printScale === 'tabletop' ? '1 hex = 1.25 in ≈ 30 m' : '1 hex ≈ 30 m'
  const meta = `${biome.label} · seed ${map.seed} · ${map.width} × ${map.height} · Scale · ${hexScale} · ${printedOn}`
  const page = pageCount > 1 ? `${pageLabel} · ${pageCount} pages` : pageLabel
  return `
<g class="print-title-block">
  <rect x="${x}" y="${y}" width="${width}" height="${PRINT.titleMm}" fill="#efe9d8" />
  <text x="${x + 3}" y="${y + 7.2}" fill="#1a1f1c" font-size="5.2" font-weight="700" font-family="Arial Narrow, Impact, sans-serif">${escapeXml(map.name)}</text>
  <text x="${x + 3}" y="${y + 13.6}" fill="#4a524c" font-size="2.8" font-family="ui-sans-serif, sans-serif">${escapeXml(meta)}</text>
  <g class="print-north-arrow" transform="translate(${x + width - 22} ${y + 8.4})">
    <polygon points="0,-5.2 2.6,3.8 -2.6,3.8" fill="#1a1f1c" />
    <text x="0" y="7.4" fill="#1a1f1c" font-size="2.4" font-weight="700" text-anchor="middle" font-family="Arial Narrow, sans-serif">N</text>
  </g>
  <text x="${x + width - 32}" y="${y + 7}" fill="#1a1f1c" font-size="2.8" font-weight="700" text-anchor="end" font-family="Arial Narrow, sans-serif">Battlegrid</text>
  <text x="${x + width - 32}" y="${y + 13.6}" fill="#4a524c" font-size="2.6" text-anchor="end" font-family="ui-sans-serif, sans-serif">${escapeXml(page)}</text>
</g>`
}

function legendBlock(
  map: BattleMap,
  paper: { width: number; height: number },
  settings: ExportSettings,
) {
  if (!settings.includeLegend && !settings.includeElevationKey) return ''
  const biome = visualBiome(map)
  const compact = settings.sheetLayout === 'compact'
  const y = paper.height - PRINT.marginMm - legendHeight(settings)
  const x = PRINT.marginMm
  const width = paper.width - 2 * PRINT.marginMm
  const terrains = settings.includeLegend ? legendTerrains(map) : []
  const swatch = compact ? 4.2 : 5.2
  const swatchY = y + (compact ? 3.4 : 4.5)
  const labelY = y + (compact ? 7 : 8.6)
  const textGap = compact ? 1.2 : 1.4
  let cursor = x + 3
  const terrainMarks = terrains
    .map((terrain) => {
      const visual = biome.palette[terrain]
      const hatch =
        terrain !== 'clear' && terrain !== 'road'
          ? `<rect x="${cursor}" y="${swatchY}" width="${swatch}" height="${swatch}" fill="url(#print-hatch-${terrain})" />`
          : ''
      const tag = visual.shortLabel ? ` (${visual.shortLabel})` : ''
      const label = compact ? visual.shortLabel || visual.label : `${visual.label}${tag}`
      const font = compact ? 2.2 : 2.6
      const item = `
<g class="legend-item">
  <rect x="${cursor}" y="${swatchY}" width="${swatch}" height="${swatch}" fill="${visual.color}" stroke="#1a1a1a" stroke-width="0.2" />
  ${hatch}
  <text x="${cursor + swatch + textGap}" y="${labelY}" fill="#1a1f1c" font-size="${font}" font-family="ui-sans-serif, sans-serif">${escapeXml(label)}</text>
</g>`
      cursor += swatch + textGap + label.length * (compact ? 1.2 : 1.55) + (compact ? 2.4 : 4)
      return item
    })
    .join('')

  let elevation = ''
  if (settings.includeElevationKey) {
    const keyX = x + width - (compact ? 78 : 92)
    const chips = Array.from({ length: MAX_ELEVATION + 1 }, (_, level) => {
      const color = level === 0 ? biome.palette.clear.color : biome.elevation.ramp[level - 1]
      const label = compact ? String(level) : level === 0 ? '0 Ground' : String(level)
      const chipX = keyX + (compact ? 14 : 18) + level * (compact ? 12 : 14.4)
      return `
<g class="elevation-key-item">
  <rect x="${chipX}" y="${swatchY}" width="${swatch}" height="${swatch}" fill="${color}" stroke="#1a1a1a" stroke-width="0.2" />
  <text x="${chipX + swatch / 2}" y="${y + (compact ? 12.4 : 16.4)}" fill="#1a1f1c" font-size="${compact ? 2 : 2.3}" text-anchor="middle" font-family="ui-sans-serif, sans-serif">${label}</text>
</g>`
    }).join('')
    elevation = `
<text x="${keyX}" y="${labelY}" fill="#1a1f1c" font-size="${compact ? 2.2 : 2.6}" font-weight="700" font-family="ui-sans-serif, sans-serif">${compact ? 'Elev' : 'Elevation'}</text>
${chips}`
  }

  return `
<g class="print-legend${compact ? ' compact' : ''}">
  <rect x="${x}" y="${y}" width="${width}" height="${legendHeight(settings)}" fill="#efe9d8" />
  ${terrainMarks}
  ${elevation}
</g>`
}

function nestedMap(
  parts: SvgParts,
  map: BattleMap,
  settings: ExportSettings,
  tile: MapTile,
  frame: { x: number; y: number; width: number; height: number },
) {
  const grayscale = settings.grayscale ? ' filter="url(#print-grayscale)"' : ''
  return `
<svg x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" viewBox="${tile.viewBox.x} ${tile.viewBox.y} ${tile.viewBox.width} ${tile.viewBox.height}" preserveAspectRatio="xMidYMid meet">
  <defs>${unwrapDefs(parts.defs)}</defs>
  <g${grayscale}>${parts.body}</g>
  ${mapOverlays(map, settings)}
</svg>`
}

function wrapPage(
  inner: string,
  paper: { width: number; height: number },
  extraCss: string,
  pageLabel: string,
  grayscale = false,
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" data-export-page="${escapeXml(pageLabel)}" width="${paper.width}mm" height="${paper.height}mm" viewBox="0 0 ${paper.width} ${paper.height}">
  <style>${overlayCss()}${extraCss}</style>
  <defs>${hatchDefs(grayscale)}</defs>
  <rect class="print-frame" width="${paper.width}" height="${paper.height}" />
  ${inner}
</svg>`
}

function composeMapPage(
  map: BattleMap,
  parts: SvgParts,
  tile: MapTile,
  paper: { width: number; height: number },
  settings: ExportSettings,
  pageCount: number,
  printedOn: string,
): ExportPage {
  if (!settings.includeChrome && settings.printScale !== 'tabletop') {
    const grayscale = settings.grayscale ? ' filter="url(#print-grayscale)"' : ''
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" data-export-page="${escapeXml(tile.label)}" width="${tile.viewBox.width}" height="${tile.viewBox.height}" viewBox="${tile.viewBox.x} ${tile.viewBox.y} ${tile.viewBox.width} ${tile.viewBox.height}">
  <style>${parts.css}${overlayCss()}</style>
  <defs>${hatchDefs(settings.grayscale)}${unwrapDefs(parts.defs)}</defs>
  <g${grayscale}>${parts.body}</g>
  ${mapOverlays(map, settings)}
</svg>`
    return {
      kind: 'map',
      label: tile.label,
      svg,
      widthMm: tile.viewBox.width * (25.4 / 96),
      heightMm: tile.viewBox.height * (25.4 / 96),
    }
  }

  const box = contentBox(paper, settings)
  const chrome = settings.includeChrome
  const inner = `
${chrome ? cropMarks(paper) : ''}
${chrome ? titleBlock(map, paper, tile.label, pageCount, printedOn, settings.printScale) : ''}
<rect class="print-map-well" x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" />
${nestedMap(parts, map, settings, tile, box)}
${chrome ? legendBlock(map, paper, settings) : ''}`
  return {
    kind: 'map',
    label: tile.label,
    svg: wrapPage(inner, paper, parts.css, tile.label, settings.grayscale),
    widthMm: paper.width,
    heightMm: paper.height,
  }
}

function composeBuildingPages(
  map: BattleMap,
  paper: { width: number; height: number },
  settings: ExportSettings,
  printedOn: string,
): ExportPage[] {
  const rows = buildingSheetRows(map, settings.numbering)
  if (rows.length === 0) return []
  const headerMm = 8
  const compact = settings.sheetLayout === 'compact'
  const rowMm = compact ? 5.6 : PRINT.buildingRowMm
  const usable = paper.height - 2 * PRINT.marginMm - PRINT.titleMm - 4
  const perPage = Math.max(1, Math.floor((usable - headerMm) / rowMm))
  const pages: ExportPage[] = []
  const columns = compact
    ? [
        { key: 'hex' as const, x: 0, label: 'Hex', width: 28 },
        { key: 'type' as const, x: 28, label: 'Type', width: 90 },
        { key: 'constructionFactor' as const, x: 118, label: 'CF', width: 20 },
        { key: 'state' as const, x: 140, label: 'State', width: 40 },
      ]
    : [
        { key: 'hex' as const, x: 0, label: 'Hex', width: 22 },
        { key: 'type' as const, x: 22, label: 'Type', width: 52 },
        { key: 'label' as const, x: 74, label: 'Label', width: 48 },
        { key: 'height' as const, x: 122, label: 'Ht', width: 14 },
        { key: 'constructionFactor' as const, x: 136, label: 'CF', width: 16 },
        { key: 'state' as const, x: 152, label: 'State', width: 28 },
        { key: 'category' as const, x: 180, label: 'Category', width: 40 },
      ]
  const tableX = PRINT.marginMm + 3
  const tableY = PRINT.marginMm + PRINT.titleMm + 3
  const sheetCount = Math.ceil(rows.length / perPage)

  for (let sheet = 0; sheet < sheetCount; sheet += 1) {
    const slice = rows.slice(sheet * perPage, (sheet + 1) * perPage)
    const label = sheetCount === 1 ? 'buildings' : `buildings-${sheet + 1}`
    const header = columns
      .map(
        (column) =>
          `<text x="${tableX + column.x}" y="${tableY + 5.2}" fill="#1a1f1c" font-size="2.8" font-weight="700" font-family="ui-sans-serif, sans-serif">${column.label}</text>`,
      )
      .join('')
    const body = slice
      .map((row, index) => {
        const y = tableY + headerMm + index * rowMm
        const fill = index % 2 === 0 ? '#f3eee0' : '#efe6cf'
        const cells = compact
          ? [row.hex, row.type, String(row.constructionFactor), row.state]
          : [
              row.hex,
              row.type,
              row.label || '—',
              String(row.height),
              String(row.constructionFactor),
              row.state,
              row.category,
            ]
        return `
<g class="building-row">
  <rect x="${PRINT.marginMm}" y="${y - 4.8}" width="${paper.width - 2 * PRINT.marginMm}" height="${rowMm}" fill="${fill}" />
  ${cells
    .map(
      (value, columnIndex) =>
        `<text x="${tableX + columns[columnIndex].x}" y="${y}" fill="#1a1f1c" font-size="2.7" font-family="ui-sans-serif, sans-serif">${escapeXml(value)}</text>`,
    )
    .join('')}
</g>`
      })
      .join('')
    const inner = `
${cropMarks(paper)}
${titleBlock({ ...map, name: `Building reference — ${map.name}` }, paper, label, sheetCount, printedOn, settings.printScale)}
${header}
${body}`
    pages.push({
      kind: 'buildings',
      label,
      svg: wrapPage(inner, paper, '', label),
      widthMm: paper.width,
      heightMm: paper.height,
    })
  }
  return pages
}

export function composeExportPages(args: {
  map: BattleMap
  mapSvg: string
  viewBox: ViewBox
  settings: ExportSettings
  now?: Date
}): ExportPage[] {
  const paper = paperDimensions(args.settings.paper, args.settings.orientation)
  const printedOn = formatPrintDate(args.now ?? new Date())
  const parts = extractSvgParts(args.mapSvg)
  const tiles = layoutTiles(args.viewBox, paper, args.settings)
  const mapPages = tiles.map((tile) =>
    composeMapPage(args.map, parts, tile, paper, args.settings, tiles.length, printedOn),
  )
  const sheets =
    args.settings.includeBuildingSheet && args.map.buildings.length > 0
      ? composeBuildingPages(args.map, paper, args.settings, printedOn)
      : []
  return [...mapPages, ...sheets]
}

export function buildPrintHtml(pages: ExportPage[]) {
  const first = pages[0]
  if (!first) return ''
  const pageCss = pages
    .map(
      (page) => `
.print-page[data-label="${page.label}"] {
  width: ${page.widthMm}mm;
  height: ${page.heightMm}mm;
}`,
    )
    .join('')
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Battlegrid print</title>
  <style>
    @page { size: ${first.widthMm}mm ${first.heightMm}mm; margin: 0; }
    html, body { margin: 0; padding: 0; background: #d8d4c8; }
    .print-page { page-break-after: always; overflow: hidden; background: #fff; }
    .print-page:last-child { page-break-after: auto; }
    .print-page svg { width: 100%; height: 100%; display: block; }
    ${pageCss}
    @media print {
      html, body { background: #fff; }
      .print-page { box-shadow: none; margin: 0; }
    }
    @media screen {
      .print-page { margin: 12px auto; box-shadow: 0 4px 18px rgba(0,0,0,0.28); }
    }
  </style>
</head>
<body>
  ${pages
    .map(
      (page) =>
        `<section class="print-page" data-label="${escapeXml(page.label)}">${page.svg.replace(/^<\?xml[^>]*>/, '')}</section>`,
    )
    .join('\n')}
</body>
</html>`
}
