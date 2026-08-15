// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { DEFAULT_EXPORT_SETTINGS, type ExportSettings } from '../types/export'
import type { BattleMap, TerrainType } from '../types/map'
import {
  buildingSheetRows,
  buildPrintHtml,
  columnLetters,
  composeExportPages,
  contentBox,
  layoutTiles,
  legendHeight,
  legendTerrains,
  paperDimensions,
  pageFilename,
  rasterPixelSize,
  exportRasterPreview,
  TABLETOP_HEX_MM,
  hexFlatToFlatSvg,
  tabletopMmPerSvgUnit,
} from './printLayout'

const chromeOn: ExportSettings = { ...DEFAULT_EXPORT_SETTINGS, printScale: 'fit' }
const chromeOff: ExportSettings = { ...DEFAULT_EXPORT_SETTINGS, includeChrome: false, printScale: 'fit' }
const tabletopOn: ExportSettings = { ...DEFAULT_EXPORT_SETTINGS, printScale: 'tabletop' }

function mapWith(terrains: TerrainType[], buildings: BattleMap['buildings'] = []): BattleMap {
  return {
    version: 2,
    name: 'Ridge Line',
    width: terrains.length,
    height: 1,
    seed: 'SEED42',
    biome: 'temperate-grasslands',
    cells: terrains.map((terrain, col) => ({
      col,
      row: 0,
      terrain,
      elevation: col === 0 ? 2 : 0,
    })),
    buildings,
    annotations: [],
    updatedAt: '2026-08-13T12:00:00.000Z',
  }
}

const mapSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 200 120" width="200" height="120">
  <style>.hex-shape { fill: rgb(1, 2, 3); }</style>
  <defs><pattern id="tg-bmp-clear"></pattern></defs>
  <rect class="map-background" width="10" height="10" />
  <text class="coordinate-label">0101</text>
</svg>`

describe('print paper and tiling', () => {
  it('swaps paper edges for landscape', () => {
    expect(paperDimensions('letter', 'portrait')).toEqual({ width: 215.9, height: 279.4 })
    expect(paperDimensions('letter', 'landscape')).toEqual({ width: 279.4, height: 215.9 })
  })

  it('knows letter, A4, tabloid, A3, A2, and A1 sizes', () => {
    expect(paperDimensions('a4', 'portrait')).toEqual({ width: 210, height: 297 })
    expect(paperDimensions('a4', 'landscape')).toEqual({ width: 297, height: 210 })
    expect(paperDimensions('tabloid', 'portrait')).toEqual({ width: 279.4, height: 431.8 })
    expect(paperDimensions('tabloid', 'landscape')).toEqual({ width: 431.8, height: 279.4 })
    expect(paperDimensions('a3', 'portrait')).toEqual({ width: 297, height: 420 })
    expect(paperDimensions('a2', 'portrait')).toEqual({ width: 420, height: 594 })
    expect(paperDimensions('a2', 'landscape')).toEqual({ width: 594, height: 420 })
    expect(paperDimensions('a1', 'portrait')).toEqual({ width: 594, height: 841 })
    expect(paperDimensions('a1', 'landscape')).toEqual({ width: 841, height: 594 })
  })

  it('labels tiles A1, B1, A2', () => {
    expect(columnLetters(0)).toBe('A')
    expect(columnLetters(25)).toBe('Z')
    expect(columnLetters(26)).toBe('AA')
  })

  it('fits a small map on one letter page', () => {
    const paper = paperDimensions('letter', 'landscape')
    const tiles = layoutTiles({ x: -50, y: -50, width: 500, height: 400 }, paper, chromeOn)
    expect(tiles).toHaveLength(1)
    expect(tiles[0].label).toBe('A1')
  })

  it('tiles a large map so hexes stay readable', () => {
    const paper = paperDimensions('letter', 'landscape')
    const tiles = layoutTiles({ x: -50, y: -50, width: 2800, height: 1800 }, paper, chromeOn)
    expect(tiles.length).toBeGreaterThan(1)
    expect(tiles.map((tile) => tile.label)).toContain('A1')
    expect(tiles.map((tile) => tile.label)).toContain('B1')
  })

  it('skips tiling when page chrome is off', () => {
    const paper = paperDimensions('letter', 'landscape')
    const tiles = layoutTiles({ x: 0, y: 0, width: 4000, height: 3000 }, paper, chromeOff)
    expect(tiles).toEqual([
      { col: 0, row: 0, label: 'map', viewBox: { x: 0, y: 0, width: 4000, height: 3000 } },
    ])
  })

  it('prints tabletop hexes at 1.25 inches flat-to-flat', () => {
    const paper = paperDimensions('letter', 'landscape')
    const tiles = layoutTiles({ x: 0, y: 0, width: 2000, height: 1600 }, paper, tabletopOn)
    expect(tiles.length).toBeGreaterThan(1)
    const box = contentBox(paper, tabletopOn)
    const mmPerUnit = box.width / tiles[0].viewBox.width
    expect(mmPerUnit * hexFlatToFlatSvg()).toBeCloseTo(TABLETOP_HEX_MM, 5)
    expect(tabletopMmPerSvgUnit() * hexFlatToFlatSvg()).toBeCloseTo(31.75, 5)
    for (const tile of tiles) {
      expect(tile.viewBox.width).toBeCloseTo(tiles[0].viewBox.width)
      expect(tile.viewBox.height).toBeCloseTo(tiles[0].viewBox.height)
    }
  })

  it('keeps a small mapsheet on one page at tabletop scale when it fits', () => {
    const paper = paperDimensions('tabloid', 'landscape')
    const tiles = layoutTiles({ x: 0, y: 0, width: 200, height: 160 }, paper, tabletopOn)
    expect(tiles).toHaveLength(1)
    expect(tiles[0].viewBox.width).toBeGreaterThan(200)
  })

  it('reserves a legend strip in the content box', () => {
    const paper = paperDimensions('letter', 'landscape')
    const withLegend = contentBox(paper, chromeOn)
    const withoutLegend = contentBox(paper, {
      ...chromeOn,
      includeLegend: false,
      includeElevationKey: false,
    })
    expect(withoutLegend.height).toBeGreaterThan(withLegend.height)
  })
})

describe('print legends and building sheets', () => {
  it('lists only terrains that appear on the map', () => {
    const map = mapWith(['clear', 'woods', 'water', 'woods'])
    expect(legendTerrains(map)).toEqual(['clear', 'woods', 'water'])
  })

  it('builds building-reference rows from map structures', () => {
    const map = mapWith(['clear', 'clear'], [
      {
        id: 'b1',
        type: 'house',
        anchor: { col: 1, row: 0 },
        rotation: 0,
        state: 'damaged',
        label: 'Alpha',
      },
    ])
    expect(buildingSheetRows(map, 'offset')).toEqual([
      {
        hex: '0201',
        type: 'Residential House',
        label: 'Alpha',
        height: 1,
        constructionFactor: 15,
        state: 'Heavily damaged',
        category: 'civilian',
      },
    ])
  })
})

describe('composed export pages', () => {
  it('adds a title block, crop marks, legend, and elevation key', () => {
    const map = mapWith(['clear', 'woods', 'rough'])
    const pages = composeExportPages({
      map,
      mapSvg,
      viewBox: { x: -10, y: -10, width: 200, height: 120 },
      settings: chromeOn,
      now: new Date('2026-08-13T12:00:00.000Z'),
    })

    expect(pages).toHaveLength(1)
    expect(pages[0].svg).toContain('data-export-page="A1"')
    expect(pages[0].svg).toContain('Ridge Line')
    expect(pages[0].svg).toContain('Temperate Grasslands')
    expect(pages[0].svg).toContain('seed SEED42')
    expect(pages[0].svg).toContain('3 × 1')
    expect(pages[0].svg).toContain('2026-08-13')
    expect(pages[0].svg).toContain('Battlegrid')
    expect(pages[0].svg).toContain('crop-mark')
    expect(pages[0].svg).toContain('print-legend')
    expect(pages[0].svg).toContain('Light Woods')
    expect(pages[0].svg).toContain('0 Ground')
    expect(pages[0].svg).not.toContain('coordinate-label')
  })

  it('shrinks the legend and building sheet in compact layout', () => {
    const map = mapWith(['clear', 'woods'], [
      {
        id: 'b1',
        type: 'house',
        anchor: { col: 1, row: 0 },
        rotation: 0,
        state: 'intact',
      },
    ])
    const compact: ExportSettings = { ...chromeOn, sheetLayout: 'compact' }
    const paper = paperDimensions('letter', 'landscape')
    expect(legendHeight(compact)).toBeLessThan(legendHeight(chromeOn))
    expect(contentBox(paper, compact).height).toBeGreaterThan(contentBox(paper, chromeOn).height)
    const pages = composeExportPages({
      map,
      mapSvg,
      viewBox: { x: -10, y: -10, width: 200, height: 120 },
      settings: compact,
      now: new Date('2026-08-13T12:00:00.000Z'),
    })
    const buildingPage = pages.find((page) => page.kind === 'buildings')
    expect(buildingPage?.svg).toContain('Residential House')
    expect(buildingPage?.svg).not.toContain('>Category<')
    expect(pages[0].svg).toContain('print-legend compact')
  })

  it('omits print feature tags when hex marks are off', () => {
    const map = mapWith(['clear'])
    map.cells[0] = { ...map.cells[0], feature: 'crater' }
    const pages = composeExportPages({
      map,
      mapSvg,
      viewBox: { x: -10, y: -10, width: 200, height: 120 },
      settings: { ...chromeOn, includeFeatures: false, terrainMarks: true },
      now: new Date('2026-08-13T12:00:00.000Z'),
    })
    expect(pages[0].svg).not.toContain('class="print-feature-tag"')
  })

  it('overlays hex numbers, hatches, and terrain tags', () => {
    const map = mapWith(['woods', 'water'])
    const pages = composeExportPages({
      map,
      mapSvg,
      viewBox: { x: -10, y: -10, width: 200, height: 120 },
      settings: { ...chromeOn, numbering: 'offset' },
      now: new Date('2026-08-13T12:00:00.000Z'),
    })

    expect(pages[0].svg).toContain('print-hex-number')
    expect(pages[0].svg).toContain('>0101<')
    expect(pages[0].svg).toContain('print-hatch-woods')
    expect(pages[0].svg).toContain('print-terrain-tag')
    expect(pages[0].svg).toContain('>W<')
  })

  it('draws a north arrow and hex scale on chrome sheets', () => {
    const map = mapWith(['clear', 'woods'])
    const pages = composeExportPages({
      map,
      mapSvg,
      viewBox: { x: -10, y: -10, width: 200, height: 120 },
      settings: chromeOn,
      now: new Date('2026-08-13T12:00:00.000Z'),
    })
    expect(pages[0].svg).toContain('print-north-arrow')
    expect(pages[0].svg).toContain('1 hex ≈ 30 m')
  })

  it('adds a building reference sheet when structures are present', () => {
    const map = mapWith(['clear'], [
      {
        id: 'b1',
        type: 'commTower',
        anchor: { col: 0, row: 0 },
        rotation: 0,
        state: 'intact',
      },
    ])
    const pages = composeExportPages({
      map,
      mapSvg,
      viewBox: { x: -10, y: -10, width: 200, height: 120 },
      settings: chromeOn,
      now: new Date('2026-08-13T12:00:00.000Z'),
    })

    expect(pages.map((page) => page.label)).toEqual(['A1', 'buildings'])
    expect(pages[1].svg).toContain('Building reference')
    expect(pages[1].svg).toContain('Communications Tower')
    expect(pages[1].svg).toContain('0101')
  })

  it('composes letter, A4, tabloid, A2, and A1 pages at those paper sizes', () => {
    const map = mapWith(['clear'])
    for (const paper of ['letter', 'a4', 'tabloid', 'a2', 'a1'] as const) {
      const pages = composeExportPages({
        map,
        mapSvg,
        viewBox: { x: -10, y: -10, width: 200, height: 120 },
        settings: { ...chromeOn, paper, orientation: 'landscape' },
        now: new Date('2026-08-13T12:00:00.000Z'),
      })
      const size = paperDimensions(paper, 'landscape')
      expect(pages[0].widthMm, paper).toBe(size.width)
      expect(pages[0].heightMm, paper).toBe(size.height)
    }
  })

  it('applies a grayscale filter when requested', () => {
    const map = mapWith(['woods'])
    const pages = composeExportPages({
      map,
      mapSvg,
      viewBox: { x: -10, y: -10, width: 200, height: 120 },
      settings: { ...chromeOff, grayscale: true },
      now: new Date('2026-08-13T12:00:00.000Z'),
    })

    expect(pages[0].svg).toContain('filter="url(#print-grayscale)"')
    expect(pages[0].svg).toContain('print-hatch-woods')
  })

  it('does not apply grayscale when the option is off', () => {
    const map = mapWith(['woods'])
    const pages = composeExportPages({
      map,
      mapSvg,
      viewBox: { x: -10, y: -10, width: 200, height: 120 },
      settings: { ...chromeOff, grayscale: false },
      now: new Date('2026-08-13T12:00:00.000Z'),
    })

    expect(pages[0].svg).not.toContain('url(#print-grayscale)')
    expect(pages[0].svg).not.toContain('id="print-grayscale"')
  })

  it('builds a print document with one section per page', () => {
    const map = mapWith(['clear'], [
      {
        id: 'b1',
        type: 'house',
        anchor: { col: 0, row: 0 },
        rotation: 0,
        state: 'intact',
      },
    ])
    const pages = composeExportPages({
      map,
      mapSvg,
      viewBox: { x: -10, y: -10, width: 200, height: 120 },
      settings: chromeOn,
      now: new Date('2026-08-13T12:00:00.000Z'),
    })
    const html = buildPrintHtml(pages)

    expect(html).toContain('@page')
    expect(html).toContain('data-label="A1"')
    expect(html).toContain('data-label="buildings"')
    expect(html).toContain('279.4mm')
  })

  it('names tiled files with page labels', () => {
    expect(
      pageFilename('Ridge Line', { kind: 'map', label: 'A1', svg: '', widthMm: 1, heightMm: 1 }, 2),
    ).toBe('ridge-line-a1')
    expect(
      pageFilename('Ridge Line', { kind: 'map', label: 'map', svg: '', widthMm: 1, heightMm: 1 }, 1),
    ).toBe('ridge-line')
  })

  it('scales raster output by the requested PNG multiplier', () => {
    expect(rasterPixelSize(100, 50, 4)).toEqual({ width: 400, height: 200 })
    expect(rasterPixelSize(100, 50, 10)).toEqual({ width: 1000, height: 500 })
  })

  it('previews 10× letter landscape as paper pixels at 960 dpi', () => {
    const preview = exportRasterPreview(
      { ...chromeOn, pngScale: 10, paper: 'letter', orientation: 'landscape', printScale: 'fit' },
      { width: 16, height: 17 },
    )
    expect(preview).toMatchObject({ width: 10560, height: 8160, mapPages: 1, dpi: 960 })
  })

  it('keeps print-sheet markup stable for visual regression', () => {
    const map = mapWith(['clear', 'woods', 'water'])
    const pages = composeExportPages({
      map,
      mapSvg,
      viewBox: { x: -10, y: -10, width: 200, height: 120 },
      settings: chromeOn,
      now: new Date('2026-08-13T12:00:00.000Z'),
    })
    const stable = pages[0].svg
      .replace(/<style>[\s\S]*?<\/style>/g, '<style/>')
      .replace(/\s+/g, ' ')
      .trim()
    expect(stable).toMatchSnapshot()
  })
})
