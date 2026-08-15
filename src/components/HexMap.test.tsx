// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getBiome } from '../lib/biomes'
import { prepareSvgExport } from '../lib/export'
import { generateMap } from '../lib/generator'
import { HexMap } from './HexMap'

afterEach(cleanup)

describe('HexMap selection', () => {
  it('renders the selection overlay for selected cells', () => {
    const map = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'SELECT',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
        selectTool="select"
        selection={new Set(['1:1', '2:2', '3:3'])}
      />,
    )

    expect(container.querySelectorAll('.selected-cell')).toHaveLength(3)
  })
})

describe('HexMap view controls', () => {
  it('zooms via the slider instead of the mouse wheel', () => {
    const map = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'ZOOM',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    const slider = screen.getByRole('slider', { name: 'Zoom level' })
    expect(container.querySelector('.zoom-readout')?.textContent).toBe('100%')
    fireEvent.change(slider, { target: { value: '180' } })
    expect(container.querySelector('.zoom-readout')?.textContent).toBe('180%')
    expect(container.querySelector('.map-viewport')?.getAttribute('style')).toMatch(/scale\(1\.8\)/)
    expect(container.querySelector('.hex-map')?.getAttribute('style') ?? '').not.toMatch(/scale\(/)

    // The wheel handler is gone: wheeling must not change the zoom.
    fireEvent.wheel(container.querySelector('svg')!, { deltaY: -500 })
    expect(container.querySelector('.zoom-readout')?.textContent).toBe('180%')
  })

  it('zooms with the mouse wheel when wheel zoom is enabled', () => {
    const map = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'WHEEL-ON',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
        wheelZoom
      />,
    )
    expect(container.querySelector('.zoom-readout')?.textContent).toBe('100%')
    fireEvent.wheel(container.querySelector('svg')!, { deltaY: -500 })
    expect(container.querySelector('.zoom-readout')?.textContent).not.toBe('100%')
  })

  it('shows an on-map legend and elevation key', () => {
    const map = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'LEGEND',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
        showLegend
        showElevationKey
      />,
    )
    expect(container.querySelector('.map-legend')?.getAttribute('aria-label')).toBe('Map legend')
    expect(container.querySelectorAll('.legend-chip').length).toBeGreaterThan(7)
  })

  it('moves a focused hex with the keyboard and paints with Enter', () => {
    const map = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'KEYS',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const onPaint = vi.fn()
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={onPaint}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )
    const svg = container.querySelector('svg')!
    svg.focus()
    expect(container.querySelector('.hex-cell.focused')).toBeTruthy()
    fireEvent.keyDown(svg, { key: 'ArrowRight' })
    fireEvent.keyDown(svg, { key: 'Enter' })
    expect(onPaint).toHaveBeenCalled()
    expect(onPaint.mock.calls[0][0]).toMatchObject({ col: 1, row: 0 })
  })
})

describe('HexMap brush preview', () => {
  it('highlights the entire cluster brush footprint', () => {
    const map = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'HIGHLIGHT',
      terrain: { woods: 20, water: 10, rough: 15 },
      elevation: 2,
      symmetric: true,
      river: false,
    })
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates
        showElevationLabels
        highlightRadius={1}
      />,
    )

    const centerCell = container.querySelectorAll('.hex-cell')[14]
    fireEvent.pointerEnter(centerCell)

    expect(container.querySelectorAll('.hex-cell.hovered')).toHaveLength(7)
  })

  it('paints elevation with the biome ramp and clamps at level four', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'ELEVATION',
      terrain: { woods: 20, water: 10, rough: 15 },
      elevation: 2,
      symmetric: true,
      river: false,
    })
    const map = {
      ...generated,
      cells: generated.cells.map((cell, index) =>
        index === 0 ? { ...cell, terrain: 'clear' as const, elevation: 9 } : cell,
      ),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates
        showElevationLabels
        highlightRadius={0}
      />,
    )

    const overlay = container.querySelector('.hex-elevation-texture.elevation-4')
    expect(overlay).not.toBeNull()
    expect(container.querySelector('.hex-elevation-texture.elevation-9')).toBeNull()
    expect((overlay as Element).getAttribute('style')).toContain(
      getBiome('temperate-grasslands').elevation.ramp[3],
    )
  })

  it('draws stacked contours and a cliff face for multi-level drops', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 4,
      height: 4,
      seed: 'CLIFFS',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const map = {
      ...generated,
      cells: generated.cells.map((cell) =>
        cell.col === 1 && cell.row === 1
          ? { ...cell, terrain: 'clear' as const, elevation: 3 }
          : { ...cell, elevation: 0 },
      ),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    expect(container.querySelectorAll('.elevation-drop[data-drop="3"]')).toHaveLength(6)
    expect(container.querySelectorAll('.elevation-cliff')).toHaveLength(6)
    expect(container.querySelectorAll('.elevation-cliff-shade')).toHaveLength(6)
    expect(container.querySelectorAll('.elevation-cliff-cast')).toHaveLength(6)
    expect(container.querySelectorAll('.elevation-contour')).toHaveLength(12)
  })

  it('connects road junctions to every touching road hex', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'JUNCTION',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: true,
      river: false,
    })
    const junctionRoads = new Set(['1:2', '2:2', '3:2', '2:3'])
    const map = {
      ...generated,
      cells: generated.cells.map((cell) =>
        junctionRoads.has(`${cell.col}:${cell.row}`)
          ? { ...cell, terrain: 'road' as const }
          : { ...cell, terrain: 'clear' as const },
      ),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    const hub = container.querySelector('.road-mark[data-links="3"]')
    expect(hub).not.toBeNull()
    expect(hub?.querySelectorAll('.road-pavement')).toHaveLength(3)
    expect(hub?.querySelectorAll('.road-centerline')).toHaveLength(3)
    expect(hub?.querySelectorAll('.road-edge')).toHaveLength(0)
    expect(hub?.querySelectorAll('.road-shoulder')).toHaveLength(0)
  })

  it('draws elevation cliff faces over roads', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'CLIFF-ROAD',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const map = {
      ...generated,
      cells: generated.cells.map((cell) => {
        if (cell.col === 2 && cell.row === 2) {
          return { ...cell, terrain: 'clear' as const, elevation: 3 }
        }
        if (cell.col === 3 && cell.row === 2) {
          return { ...cell, terrain: 'road' as const, elevation: 0 }
        }
        return { ...cell, terrain: 'clear' as const, elevation: 0 }
      }),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    const rims = container.querySelector('.elevation-rims')
    const routes = container.querySelector('.route-layer')
    expect(rims).not.toBeNull()
    expect(routes).not.toBeNull()
    expect(
      routes!.compareDocumentPosition(rims!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('renders rail marks for rail-skinned road cells', () => {
    const generated = generateMap({
      biome: 'urban',
      width: 6,
      height: 6,
      seed: 'RAIL',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const map = {
      ...generated,
      buildings: [],
      cells: generated.cells.map((cell) => {
        if (cell.col === 1 && cell.row === 1) {
          return { ...cell, terrain: 'road' as const, skin: 'rail' }
        }
        if (cell.col === 2 && cell.row === 1) {
          return { ...cell, terrain: 'road' as const, skin: 'rail' }
        }
        return { ...cell, terrain: 'clear' as const }
      }),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    expect(container.querySelectorAll('.rail-mark')).toHaveLength(2)
    expect(container.querySelectorAll('.rail-line').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.rail-tie').length).toBeGreaterThan(0)
  })

  it('does not draw street spokes into adjacent rail hexes', () => {
    const generated = generateMap({
      biome: 'urban',
      width: 6,
      height: 6,
      seed: 'ROAD-RAIL',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const map = {
      ...generated,
      buildings: [],
      cells: generated.cells.map((cell) => {
        if (cell.col === 1 && cell.row === 2) return { ...cell, terrain: 'road' as const, skin: undefined }
        if (cell.col === 2 && cell.row === 2) return { ...cell, terrain: 'road' as const, skin: undefined }
        if (cell.col === 3 && cell.row === 2) return { ...cell, terrain: 'road' as const, skin: 'rail' }
        return { ...cell, terrain: 'clear' as const, skin: undefined }
      }),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )
    const hub = container.querySelector('.road-mark[data-col="2"][data-row="2"]')
    expect(hub).not.toBeNull()
    expect(hub!.getAttribute('data-edges')?.split(',') ?? []).not.toContain('0')
    expect(container.querySelectorAll('.rail-mark')).toHaveLength(1)
  })

  it('renders roof details for the BattleTech structure types', () => {
    const generated = generateMap({
      biome: 'urban',
      width: 8,
      height: 8,
      seed: 'ROOFS',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const map = {
      ...generated,
      buildings: [
        { id: 't1', type: 'officeTower' as const, anchor: { col: 1, row: 1 }, rotation: 0 as const, state: 'intact' as const },
        { id: 't2', type: 'bunker' as const, anchor: { col: 5, row: 5 }, rotation: 0 as const, state: 'intact' as const },
        { id: 't3', type: 'dropShipPad' as const, anchor: { col: 5, row: 1 }, rotation: 0 as const, state: 'intact' as const },
        { id: 't4', type: 'house' as const, anchor: { col: 3, row: 3 }, rotation: 0 as const, state: 'intact' as const },
        { id: 't5', type: 'factory' as const, anchor: { col: 1, row: 5 }, rotation: 0 as const, state: 'intact' as const },
        { id: 't6', type: 'mechHangar' as const, anchor: { col: 4, row: 3 }, rotation: 0 as const, state: 'intact' as const },
      ],
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    expect(container.querySelectorAll('.roof-windows')).toHaveLength(1)
    expect(container.querySelectorAll('.pad-ring')).toHaveLength(1)
    expect(container.querySelectorAll('.house-chimney')).toHaveLength(1)
    expect(container.querySelectorAll('.factory-stack')).toHaveLength(1)
    expect(container.querySelectorAll('.hangar-door')).toHaveLength(1)
  })

  it('renders snow only above the alpine snow line', () => {
    const generated = generateMap({
      biome: 'alpine-mountains',
      width: 6,
      height: 6,
      seed: 'SNOW',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: true,
      river: false,
    })
    const map = {
      ...generated,
      cells: generated.cells.map((cell, index) =>
        index === 0 ? { ...cell, terrain: 'rough' as const, elevation: 4 } : cell,
      ),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    expect(container.querySelectorAll('.snow-overlay')).toHaveLength(1)
  })

  it('renders building plates and damaged rubble', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'BUILDINGS',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const map = {
      ...generated,
      buildings: [
        {
          id: 'b1',
          type: 'house' as const,
          anchor: { col: 2, row: 2 },
          rotation: 0 as const,
          state: 'intact' as const,
        },
        {
          id: 'b2',
          type: 'apartment' as const,
          anchor: { col: 4, row: 4 },
          rotation: 0 as const,
          state: 'damaged' as const,
        },
      ],
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    // One rectangular structure per building, whatever the footprint size.
    expect(container.querySelectorAll('.building-plate')).toHaveLength(2)
    expect(container.querySelectorAll('.building.damaged .building-rubble')).toHaveLength(1)
    // The intact house gets a pitched roof; the damaged apartment does not.
    expect(container.querySelectorAll('.building.intact .building-detail')).toHaveLength(1)
    expect(container.querySelectorAll('.building.damaged .building-detail')).toHaveLength(0)
  })

  it('keeps a rotated apartment the same local size as the unrotated one', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 10,
      height: 8,
      seed: 'APT-ROT',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const map = {
      ...generated,
      buildings: [
        {
          id: 'flat',
          type: 'apartment' as const,
          anchor: { col: 3, row: 3 },
          rotation: 0 as const,
          state: 'intact' as const,
        },
        {
          id: 'turned',
          type: 'apartment' as const,
          anchor: { col: 7, row: 5 },
          rotation: 1 as const,
          state: 'intact' as const,
        },
      ],
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )
    const hits = container.querySelectorAll('.building-apartment .building-hit')
    expect(hits).toHaveLength(2)
    expect(Number(hits[0].getAttribute('width'))).toBeCloseTo(Number(hits[1].getAttribute('width')), 5)
    expect(Number(hits[0].getAttribute('height'))).toBeCloseTo(Number(hits[1].getAttribute('height')), 5)
    expect(Number(hits[0].getAttribute('width'))).toBeGreaterThan(Number(hits[0].getAttribute('height')!))
    const groups = container.querySelectorAll('.building-apartment > g')
    expect(groups[1]?.getAttribute('transform')).toMatch(/rotate\(60\)/)
  })

  it('gives table structures their own silhouettes', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 20,
      height: 16,
      seed: 'SILHOUETTE',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const stamps = [
      { id: 'hospital', type: 'hospital' as const, col: 2, row: 2, body: 'hospital-body' },
      { id: 'government', type: 'government' as const, col: 8, row: 2, body: 'government-body' },
      { id: 'barracks', type: 'barracks' as const, col: 14, row: 2, body: 'barracks-body' },
      { id: 'garage', type: 'vehicleGarage' as const, col: 2, row: 8, body: 'garage-body' },
      { id: 'repair', type: 'repairBay' as const, col: 8, row: 8, body: 'repair-body' },
      { id: 'plant', type: 'powerPlant' as const, col: 14, row: 8, body: 'plant-body' },
      { id: 'station', type: 'railStation' as const, col: 2, row: 13, body: 'station-body' },
      { id: 'tower', type: 'waterTower' as const, col: 8, row: 13, body: 'water-tower-body' },
      { id: 'hangar', type: 'mechHangar' as const, col: 14, row: 13, body: 'hangar-body' },
    ]
    const map = {
      ...generated,
      buildings: stamps.map((stamp) => ({
        id: stamp.id,
        type: stamp.type,
        anchor: { col: stamp.col, row: stamp.row },
        rotation: 0 as const,
        state: 'intact' as const,
      })),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    for (const stamp of stamps) {
      expect(
        container.querySelector(`.building-${stamp.type} .${stamp.body}`),
        stamp.type,
      ).toBeTruthy()
    }
    expect(container.querySelector('.building-hospital .apartment-body')).toBeNull()
    expect(container.querySelector('.building-government .office-body')).toBeNull()
    expect(container.querySelector('.building-barracks .warehouse-body')).toBeNull()
    expect(container.querySelector('.building-vehicleGarage .hangar-body')).toBeNull()
    expect(container.querySelector('.building-repairBay .hangar-body')).toBeNull()
    expect(container.querySelector('.building-powerPlant .factory-body')).toBeNull()
    expect(container.querySelector('.building-railStation .warehouse-body')).toBeNull()
    expect(container.querySelector('.building-waterTower .tower-body')).toBeNull()
    expect(container.querySelectorAll('.building-mechHangar .hangar-vault')).toHaveLength(1)
    expect(container.querySelectorAll('.building-mechHangar .hangar-gantry')).toHaveLength(1)
  })

  it('gives strategic sites their own silhouettes', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 16,
      height: 12,
      seed: 'STRATEGIC',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const stamps = [
      { id: 'hpg', type: 'hpgStation' as const, col: 3, row: 3, body: 'hpg-body' },
      { id: 'castle', type: 'castleBrian' as const, col: 8, row: 3, body: 'castle-brian-body' },
      { id: 'sl', type: 'starLeagueBunker' as const, col: 3, row: 8, body: 'sl-bunker-body' },
    ]
    const map = {
      ...generated,
      buildings: stamps.map((stamp) => ({
        id: stamp.id,
        type: stamp.type,
        anchor: { col: stamp.col, row: stamp.row },
        rotation: 0 as const,
        state: 'intact' as const,
      })),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )
    for (const stamp of stamps) {
      expect(
        container.querySelector(`.building-${stamp.type} .${stamp.body}`),
        stamp.type,
      ).toBeTruthy()
    }
    expect(container.querySelector('.building-hpgStation .tower-body')).toBeNull()
    expect(container.querySelector('.building-castleBrian .bunker-body')).toBeNull()
    expect(container.querySelector('.building-starLeagueBunker .bunker-body')).toBeNull()
  })

  it('keeps the original structures on their own bodies', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 22,
      height: 10,
      seed: 'OLD-MARKS',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const stamps = [
      { id: 'house', type: 'house' as const, col: 2, row: 2, body: 'house-body' },
      { id: 'apartment', type: 'apartment' as const, col: 6, row: 2, body: 'apartment-body' },
      { id: 'warehouse', type: 'warehouse' as const, col: 10, row: 2, body: 'warehouse-body' },
      { id: 'factory', type: 'factory' as const, col: 15, row: 2, body: 'factory-body' },
      { id: 'office', type: 'officeTower' as const, col: 2, row: 7, body: 'office-body' },
      { id: 'hq', type: 'commandHQ' as const, col: 6, row: 7, body: 'hq-body' },
      { id: 'fuel', type: 'fuelDepot' as const, col: 10, row: 7, body: 'fuel-body' },
      { id: 'bunker', type: 'bunker' as const, col: 14, row: 7, body: 'bunker-body' },
      { id: 'tower', type: 'commTower' as const, col: 17, row: 7, body: 'tower-body' },
      { id: 'pad', type: 'dropShipPad' as const, col: 20, row: 7, body: 'pad-body' },
    ]
    const map = {
      ...generated,
      buildings: stamps.map((stamp) => ({
        id: stamp.id,
        type: stamp.type,
        anchor: { col: stamp.col, row: stamp.row },
        rotation: 0 as const,
        state: 'intact' as const,
      })),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )
    for (const stamp of stamps) {
      expect(
        container.querySelector(`.building-${stamp.type} .${stamp.body}`),
        stamp.type,
      ).toBeTruthy()
    }
  })

  it('renders bridge decking across the span direction', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'BRIDGE',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const map = {
      ...generated,
      cells: generated.cells.map((cell) =>
        cell.col === 2 && cell.row === 2 ? { ...cell, terrain: 'water' as const } : cell,
      ),
      buildings: [
        {
          id: 'br1',
          type: 'bridge' as const,
          anchor: { col: 2, row: 2 },
          rotation: 0 as const,
          state: 'intact' as const,
        },
      ],
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    expect(container.querySelectorAll('.bridge-rail')).toHaveLength(2)
  })

  it('shows a placement ghost while stamping buildings', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'GHOST',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const { container } = render(
      <HexMap
        map={generated}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint={false}
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
        buildingTool="warehouse"
      />,
    )

    expect(container.querySelector('.building-ghost')).toBeNull()
    fireEvent.pointerEnter(container.querySelectorAll('.hex-cell')[10])
    expect(container.querySelector('.building-ghost')).not.toBeNull()
    // Three faint footprint hexes plus the building shape preview.
    expect(container.querySelectorAll('.building-ghost .ghost-footprint')).toHaveLength(3)
    expect(container.querySelectorAll('.building-ghost .ghost-shape')).toHaveLength(1)
  })

  it('includes buildings in PNG export output', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'EXPORT-BUILDING',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const map = {
      ...generated,
      buildings: [
        {
          id: 'b1',
          type: 'commTower' as const,
          anchor: { col: 3, row: 3 },
          rotation: 0 as const,
          state: 'intact' as const,
        },
      ],
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    const source = prepareSvgExport(container.querySelector('svg')!).source
    expect(source).toContain('building-plate')
  })

  it('renders variant skins in their home biome colors', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'SKIN',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const map = {
      ...generated,
      cells: generated.cells.map((cell, index) =>
        index === 0 ? { ...cell, terrain: 'water' as const, skin: 'hot-desert:water' } : cell,
      ),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    const skinned = container.querySelector('.terrain-water .hex-shape')
    expect(skinned?.getAttribute('fill')).toBe(getBiome('hot-desert').palette.water.color)
  })

  it('tags light and heavy woods when terrain tags are on', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'TAGS',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: true,
      river: false,
    })
    const map = {
      ...generated,
      cells: generated.cells.map((cell, index) => {
        if (index === 0) return { ...cell, terrain: 'woods' as const }
        if (index === 1) return { ...cell, terrain: 'heavyWoods' as const }
        return { ...cell, terrain: 'clear' as const }
      }),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        showTerrainTags
        highlightRadius={0}
      />,
    )

    const tags = Array.from(container.querySelectorAll('.terrain-tag')).map(
      (tag) => tag.textContent,
    )
    expect(tags).toEqual(['W', 'W2'])
  })

  it('renders crater feature marks', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'CRATER',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: true,
      river: false,
    })
    const map = {
      ...generated,
      cells: generated.cells.map((cell, index) =>
        index === 10 ? { ...cell, feature: 'crater' as const } : cell,
      ),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    expect(container.querySelectorAll('.crater-mark')).toHaveLength(1)
  })

  it('renders ice, beach, reef, spore, and crystal feature marks', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'MARKS',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: true,
      river: false,
    })
    const map = {
      ...generated,
      cells: generated.cells.map((cell, index) => {
        if (index === 8) return { ...cell, feature: 'ice' as const }
        if (index === 9) return { ...cell, feature: 'beach' as const }
        if (index === 10) return { ...cell, feature: 'reef' as const }
        if (index === 11) return { ...cell, feature: 'spore' as const }
        if (index === 12) return { ...cell, feature: 'crystal' as const }
        return cell
      }),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    expect(container.querySelectorAll('.ice-mark')).toHaveLength(1)
    expect(container.querySelectorAll('.beach-mark')).toHaveLength(1)
    expect(container.querySelectorAll('.reef-mark')).toHaveLength(1)
    expect(container.querySelectorAll('.spore-mark')).toHaveLength(1)
    expect(container.querySelectorAll('.crystal-mark')).toHaveLength(1)
  })

  it('renders wall fortification marks', () => {
    const generated = generateMap({
      biome: 'temperate-grasslands',
      width: 6,
      height: 6,
      seed: 'WALLS',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: true,
      river: false,
    })
    const map = {
      ...generated,
      cells: generated.cells.map((cell, index) =>
        index === 11 ? { ...cell, feature: 'wall' as const } : cell,
      ),
    }
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        showCoordinates={false}
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )
    expect(container.querySelectorAll('.wall-mark')).toHaveLength(1)
  })
})

describe('HexMap numbering', () => {
  it('renders axial q,r labels when that numbering mode is selected', () => {
    const map = generateMap({
      biome: 'temperate-grasslands',
      width: 4,
      height: 2,
      seed: 'AXIAL',
      terrain: { woods: 0, water: 0, rough: 0 },
      elevation: 0,
      symmetric: false,
      river: false,
    })
    const { container } = render(
      <HexMap
        map={map}
        svgRef={createRef<SVGSVGElement>()}
        resetToken={0}
        onPaint={vi.fn()}
        allowDragPaint
        showGrid
        hexNumbering="axial"
        showElevationLabels={false}
        highlightRadius={0}
      />,
    )

    const labels = [...container.querySelectorAll('.coordinate-label')].map((node) => node.textContent)
    expect(labels).toContain('0,0')
    expect(labels).toContain('1,1')
  })
})
