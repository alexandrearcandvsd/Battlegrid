import {
  buildPrintHtml,
  composeExportPages,
  mmToCssPixels,
  pageFilename,
  rasterPixelSize,
} from './printLayout'
import { buildPdfFromJpegs } from './pdf'
import { safeFilename } from './serialization'
import type { BattleMap } from '../types/map'
import type { ExportPage, ExportSettings } from '../types/export'

/** A standalone SVG image has no stylesheet — embed the app's rules so
 * class-based styling (mark fills, texture opacity, rims, tags) survives. */
function collectCssText() {
  let text = ''
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) text += `${rule.cssText}\n`
    } catch {
      // Cross-origin sheet — nothing we can embed from it.
    }
  }
  return text
}

const EDITOR_ONLY_SELECTORS =
  '.building-selection, .building-ghost, .protected-mark, .selection-overlay, .marquee-rect, .lasso-path'

const EXPORT_LAYER_SELECTORS = {
  includeElevation: '.hex-elevation-texture, .snow-overlay, .elevation-badge, .elevation-rims',
  includeBuildings: '.building-layer',
  includeFeatures: '.feature-mark',
  includeAnnotations: '.hex-note',
} as const

function removeMatching(root: ParentNode, selector: string) {
  root.querySelectorAll(selector).forEach((element) => element.remove())
}

export function prepareSvgExport(svg: SVGSVGElement, settings?: ExportSettings) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  // Exports always fit the whole map, regardless of the live pan/zoom view.
  clone.querySelector('.map-content')?.removeAttribute('style')
  // Editor affordances (selection, ghosts, protection marks, hover) are not
  // map content — they never belong in an export.
  removeMatching(clone, EDITOR_ONLY_SELECTORS)
  if (settings) {
    for (const [flag, selector] of Object.entries(EXPORT_LAYER_SELECTORS)) {
      if (!settings[flag as keyof typeof EXPORT_LAYER_SELECTORS]) removeMatching(clone, selector)
    }
  }
  clone
    .querySelectorAll('.hex-cell.hovered')
    .forEach((element) => element.classList.remove('hovered'))
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = collectCssText()
  clone.insertBefore(style, clone.firstChild)
  const values = (svg.getAttribute('viewBox') ?? '0 0 1 1')
    .trim()
    .split(/\s+/)
    .map(Number)
  const width = Math.max(1, values[2] || 1)
  const height = Math.max(1, values[3] || 1)
  const x = Number.isFinite(values[0]) ? values[0] : 0
  const y = Number.isFinite(values[1]) ? values[1] : 0
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const source = new XMLSerializer().serializeToString(clone)
  return { source, width, height, x, y }
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.download = filename
  anchor.href = url
  anchor.click()
  URL.revokeObjectURL(url)
}

/** Canvas 2D cannot rely on SVG feColorMatrix. Only the applied filter
 * means grayscale — the unused `<filter id="print-grayscale">` def does not. */
export function canvasFilterForPage(svg: string) {
  return svg.includes('url(#print-grayscale)') ? 'grayscale(1) contrast(1.15)' : 'none'
}

function composeFromSvg(svg: SVGSVGElement, map: BattleMap, settings: ExportSettings, now?: Date) {
  const prepared = prepareSvgExport(svg, settings)
  return composeExportPages({
    map,
    mapSvg: prepared.source,
    viewBox: { x: prepared.x, y: prepared.y, width: prepared.width, height: prepared.height },
    settings,
    now,
  })
}

async function rasterizePage(page: ExportPage, scale: number, fill: string) {
  const blob = new Blob([page.svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const image = new Image()

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Could not render map image.'))
    image.src = url
  })

  const cssWidth = mmToCssPixels(page.widthMm)
  const cssHeight = mmToCssPixels(page.heightMm)
  const size = rasterPixelSize(cssWidth, cssHeight, scale)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas export is not available.')
  context.fillStyle = fill
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.filter = canvasFilterForPage(page.svg)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(url)
  return canvas
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality = 0.85) {
  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  const data = dataUrl.split(',')[1] ?? ''
  const bytes = atob(data)
  const buffer = new Uint8Array(bytes.length)
  for (let index = 0; index < bytes.length; index += 1) buffer[index] = bytes.charCodeAt(index)
  return buffer
}

function dataUrlToBlob(dataUrl: string) {
  const [header, data] = dataUrl.split(',')
  const bytes = atob(data)
  const buffer = new Uint8Array(bytes.length)
  for (let index = 0; index < bytes.length; index += 1) buffer[index] = bytes.charCodeAt(index)
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? 'image/png'
  return new Blob([buffer], { type: mime })
}

function staggerDownloads(files: { filename: string; blob: Blob }[]) {
  files.forEach((file, index) => {
    window.setTimeout(() => downloadBlob(file.filename, file.blob), index * 250)
  })
}

export async function downloadExportPng(
  svg: SVGSVGElement,
  map: BattleMap,
  settings: ExportSettings,
) {
  const pages = composeFromSvg(svg, map, settings)
  const fill = settings.includeChrome ? '#f7f4ea' : '#111713'
  const files = []
  for (const page of pages) {
    const canvas = await rasterizePage(page, settings.pngScale, fill)
    files.push({
      filename: `${pageFilename(map.name, page, pages.length)}.png`,
      blob: dataUrlToBlob(canvas.toDataURL('image/png')),
    })
  }
  staggerDownloads(files)
}

export function downloadExportSvg(
  svg: SVGSVGElement,
  map: BattleMap,
  settings: ExportSettings,
) {
  const pages = composeFromSvg(svg, map, settings)
  staggerDownloads(
    pages.map((page) => ({
      filename: `${pageFilename(map.name, page, pages.length)}.svg`,
      blob: new Blob([page.svg], { type: 'image/svg+xml;charset=utf-8' }),
    })),
  )
}

export async function downloadExportPdf(
  svg: SVGSVGElement,
  map: BattleMap,
  settings: ExportSettings,
) {
  const pages = composeFromSvg(svg, map, settings)
  const fill = settings.includeChrome ? '#f7f4ea' : '#111713'
  const images = []
  for (const page of pages) {
    const canvas = await rasterizePage(page, settings.pngScale, fill)
    images.push({
      widthMm: page.widthMm,
      heightMm: page.heightMm,
      jpeg: canvasToJpeg(canvas),
    })
  }
  const pdf = buildPdfFromJpegs(images)
  const payload = new ArrayBuffer(pdf.byteLength)
  new Uint8Array(payload).set(pdf)
  downloadBlob(`${safeFilename(map.name)}.pdf`, new Blob([payload], { type: 'application/pdf' }))
}

export function printExport(svg: SVGSVGElement, map: BattleMap, settings: ExportSettings) {
  const pages = composeFromSvg(svg, map, settings)
  const html = buildPrintHtml(pages)
  const frame = window.open('', '_blank')
  if (!frame) throw new Error('Print preview was blocked.')
  frame.document.write(html)
  frame.document.close()
  frame.focus()
  frame.print()
}
