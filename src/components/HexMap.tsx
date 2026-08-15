import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react'
import { elevationEdgeMarks } from '../lib/elevationRims'
import { BuildingGhost, BuildingLayer } from './BuildingMark'
import {
  cellsWithinRadius,
  edgeNeighbor,
  HEX_SIZE,
  MAP_VIEW_PADDING,
  hexCenter,
  insetPointsAttribute,
  mapPixelSize,
  pointsAttribute,
} from '../lib/hex'
import { formatHexNumber } from '../lib/hexNumbering'
import type { HexNumberingMode } from '../types/export'
import { getBiome, resolveBiome } from '../lib/biomes'
import { applyColorway } from '../lib/colorways'
import { rasterizeAllBiomes, rasterizeBiomeTextures, type TextureTiles } from '../lib/textureCache'
import { getVariant } from '../lib/variants'
import { cellsInPolygon, cellsInRect, type RegionRect } from '../lib/selection'
import type { BuildingType } from '../types/building'
import type {
  BiomeDefinition,
  BiomeId,
  BiomeRoadStyle,
} from '../types/biome'
import {
  MAX_ELEVATION,
  TERRAIN_TYPES,
  type BattleMap,
  type CellFeature,
  type HexCell,
  type TerrainType,
} from '../types/map'

interface Props {
  map: BattleMap
  svgRef: RefObject<SVGSVGElement | null>
  resetToken: number
  onPaint: (cell: HexCell) => void
  allowDragPaint: boolean
  /** Called when a paint/pan pointer gesture ends so tools can reset stroke state. */
  onStrokeEnd?: () => void
  showGrid: boolean
  showCoordinates?: boolean
  hexNumbering?: HexNumberingMode
  showElevationLabels: boolean
  highlightRadius: number
  showProtected?: boolean
  showTerrainTags?: boolean
  buildingTool?: BuildingType | null
  selectedBuildingId?: string | null
  onSelectBuilding?: (id: string) => void
  /** Per-layer visibility; absent means everything visible. */
  layerVisibility?: { terrain: boolean; elevation: boolean; structures: boolean; annotations: boolean }
  /** Active region-selection mode, if any. */
  selectTool?: 'select' | 'lasso' | null
  /** Currently selected cell keys, rendered as an outline overlay. */
  selection?: Set<string> | null
  onSelectRegion?: (keys: string[]) => void
  /** Clipboard footprint (in hexes) previewed at the hovered cell while pasting. */
  pastePreview?: { width: number; height: number } | null
  /** When true, the mouse wheel zooms the map around the cursor. Off by default. */
  wheelZoom?: boolean
  /** HTML overlay of terrain swatches from the active (colorway) palette. */
  showLegend?: boolean
  /** HTML overlay of elevation levels 0–4. */
  showElevationKey?: boolean
}

interface ViewTransform {
  x: number
  y: number
  scale: number
}

const MIN_ZOOM = 0.55
const MAX_ZOOM = 2.8

function clampZoom(scale: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale))
}

function viewCssTransform(view: ViewTransform) {
  return `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`
}

/** Map a client point into the SVG viewBox, including CSS transforms on ancestors. */
function clientPointToViewBox(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const rect = svg.getBoundingClientRect()
  if (rect.width < 1 || rect.height < 1) {
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const point = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
    return { x: point.x, y: point.y }
  }
  const vb = svg.viewBox.baseVal
  const vbAspect = vb.width / vb.height
  const rectAspect = rect.width / rect.height
  let left = rect.left
  let top = rect.top
  let width = rect.width
  let height = rect.height
  if (rectAspect > vbAspect) {
    width = rect.height * vbAspect
    left += (rect.width - width) / 2
  } else if (rectAspect < vbAspect) {
    height = rect.width / vbAspect
    top += (rect.height - height) / 2
  }
  return {
    x: vb.x + ((clientX - left) / width) * vb.width,
    y: vb.y + ((clientY - top) / height) * vb.height,
  }
}

const HexCellView = memo(function HexCellView({
  cell,
  biome,
  fill,
  textureFill,
  note,
  showTerrainLayer,
  showElevationLayer,
  isHovered,
  isFocused,
  allowDragPaint,
  hexNumbering,
  showElevationLabels,
  showTerrainTags,
  onPaintCell,
  onHoverCell,
  panningRef,
  showProtected,
}: {
  cell: HexCell
  biome: BiomeDefinition
  fill: string
  textureFill: string
  note?: string
  showTerrainLayer: boolean
  showElevationLayer: boolean
  isHovered: boolean
  isFocused: boolean
  allowDragPaint: boolean
  hexNumbering: HexNumberingMode
  showElevationLabels: boolean
  showTerrainTags: boolean
  onPaintCell: (cell: HexCell) => void
  onHoverCell: (cell: HexCell | null) => void
  panningRef: RefObject<{ x: number; y: number } | null>
  showProtected: boolean
}) {
  const center = hexCenter(cell.col, cell.row, HEX_SIZE)
  return (
    <g
      className={`hex-cell terrain-${cell.terrain} ${isHovered ? 'hovered' : ''} ${isFocused ? 'focused' : ''}`}
      onPointerDown={(event) => {
        if (event.button === 0 && !event.shiftKey) onPaintCell(cell)
      }}
      onPointerEnter={(event) => {
        if (panningRef.current) return
        onHoverCell(cell)
        if (allowDragPaint && event.buttons === 1 && !event.shiftKey) {
          onPaintCell(cell)
        }
      }}
      onPointerLeave={() => {
        if (panningRef.current) return
        onHoverCell(null)
      }}
    >
      <polygon
        points={pointsAttribute(cell.col, cell.row, HEX_SIZE)}
        fill={fill}
        className="hex-shape"
      />
      {showTerrainLayer && (
        <polygon
          points={insetPointsAttribute(cell.col, cell.row, HEX_SIZE, 0)}
          fill={textureFill}
          className={`hex-texture texture-${cell.terrain}`}
        />
      )}
      {showElevationLayer && cell.elevation > 0 && (
        <polygon
          points={insetPointsAttribute(cell.col, cell.row, HEX_SIZE, 0.55)}
          className={`hex-elevation-texture elevation-${Math.min(cell.elevation, MAX_ELEVATION)}`}
          style={{
            fill: biome.elevation.ramp[Math.min(cell.elevation, MAX_ELEVATION) - 1],
          }}
        />
      )}
      {showElevationLayer && biome.snowLine && cell.elevation >= biome.snowLine.level && (
        <polygon
          points={insetPointsAttribute(cell.col, cell.row, HEX_SIZE, 0.55)}
          className="snow-overlay"
          style={{ fill: biome.snowLine.color }}
        />
      )}
      {showTerrainLayer && cell.feature && (
        <FeatureMark feature={cell.feature} x={center.x} y={center.y} />
      )}
      {showProtected && cell.isProtected && (
        <path
          className="protected-mark"
          d={`M ${center.x} ${center.y - 14} l 3.2 3.2 l -3.2 3.2 l -3.2 -3.2 Z`}
        />
      )}
      {showElevationLayer && showElevationLabels && cell.elevation > 0 && (
        <g className="elevation-badge">
          <circle cx={center.x + 17} cy={center.y - 17} r="6" />
          <text
            x={center.x + 17}
            y={center.y - 14.5}
            style={{ fill: biome.elevation.label }}
          >
            {cell.elevation}
          </text>
        </g>
      )}
      {note && (
        <text className="hex-note" x={center.x} y={center.y + 25}>
          {note}
        </text>
      )}
      {hexNumbering !== 'off' && (
        <text className="coordinate-label" x={center.x - 17} y={center.y + 21}>
          {formatHexNumber(cell.col, cell.row, hexNumbering)}
        </text>
      )}
      {showTerrainLayer &&
        showTerrainTags &&
        (cell.terrain === 'woods' || cell.terrain === 'heavyWoods') && (
          <text className="terrain-tag" x={center.x + 11} y={center.y + 17}>
            {biome.palette[cell.terrain].shortLabel}
          </text>
        )}
    </g>
  )
})

const ElevationRims = memo(function ElevationRims({
  cells,
  elevations,
  rimShadow,
  rimLight,
}: {
  cells: HexCell[]
  elevations: Map<string, number>
  rimShadow: string
  rimLight: string
}) {
  const marks = useMemo(
    () => elevationEdgeMarks(cells, elevations, HEX_SIZE),
    [cells, elevations],
  )
  return (
    <g className="elevation-rims" pointerEvents="none">
      {marks.map((mark) => (
        <g key={mark.key} className="elevation-drop" data-drop={mark.drop}>
          <polygon
            className="elevation-cliff-cast"
            points={mark.cast}
            style={{ fill: rimShadow, opacity: mark.castOpacity }}
          />
          <polygon
            className="elevation-cliff"
            points={mark.cliff}
            style={{ fill: rimShadow, opacity: mark.cliffOpacity }}
          />
          {mark.litOpacity > 0.04 && (
            <polygon
              className="elevation-cliff-lit"
              points={mark.cliff}
              style={{ fill: rimLight, opacity: mark.litOpacity }}
            />
          )}
          <polygon
            className="elevation-cliff-shade"
            points={mark.shade}
            style={{ fill: rimShadow, opacity: mark.shadeOpacity }}
          />
          <line
            className="elevation-rim-shadow"
            style={{ stroke: rimShadow }}
            strokeWidth={mark.shadow.width}
            x1={mark.shadow.x1}
            y1={mark.shadow.y1}
            x2={mark.shadow.x2}
            y2={mark.shadow.y2}
          />
          <line
            className="elevation-rim-light"
            style={{ stroke: rimLight }}
            x1={mark.light.x1}
            y1={mark.light.y1}
            x2={mark.light.x2}
            y2={mark.light.y2}
          />
          {mark.contours.map((contour, index) => (
            <line
              key={`${mark.key}:c${index}`}
              className="elevation-contour"
              style={{ stroke: rimShadow }}
              x1={contour.x1}
              y1={contour.y1}
              x2={contour.x2}
              y2={contour.y2}
            />
          ))}
        </g>
      ))}
    </g>
  )
})

export function HexMap({
  map,
  svgRef,
  resetToken,
  onPaint,
  allowDragPaint,
  onStrokeEnd,
  showGrid,
  showCoordinates,
  hexNumbering,
  showElevationLabels,
  highlightRadius,
  showProtected = false,
  showTerrainTags = false,
  buildingTool = null,
  selectedBuildingId = null,
  onSelectBuilding,
  layerVisibility = { terrain: true, elevation: true, structures: true, annotations: true },
  selectTool = null,
  selection = null,
  onSelectRegion,
  pastePreview = null,
  wheelZoom = false,
  showLegend = false,
  showElevationKey = false,
}: Props) {
  const numbering: HexNumberingMode = hexNumbering ?? (showCoordinates ? 'offset' : 'off')
  const sourceBiome = resolveBiome(map)
  const biome = useMemo(
    () => applyColorway(sourceBiome, map.colorway),
    [sourceBiome, map.colorway],
  )
  const neededBiomeKey = useMemo(() => {
    const ids = new Set<BiomeId>([sourceBiome.id])
    for (const cell of map.cells) {
      const variant = cell.skin ? getVariant(cell.skin) : undefined
      if (variant?.biomeId) ids.add(variant.biomeId)
    }
    return [...ids].sort().join(',')
  }, [map.cells, sourceBiome.id])
  const neededBiomeIds = useMemo(
    () => new Set(neededBiomeKey.split(',') as BiomeId[]),
    [neededBiomeKey],
  )
  const [tilesByBiome, setTilesByBiome] = useState<Partial<Record<BiomeId, TextureTiles>>>({})
  const viewRef = useRef<ViewTransform>({ x: 0, y: 0, scale: 1 })
  const viewportRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const zoomSliderRef = useRef<HTMLInputElement>(null)
  const zoomReadoutRef = useRef<HTMLSpanElement>(null)
  const [hovered, setHovered] = useState<{ col: number; row: number } | null>(null)
  const [focused, setFocused] = useState({ col: 0, row: 0 })
  const panStart = useRef<{ x: number; y: number; originX: number; originY: number } | null>(
    null,
  )
  const painted = useRef(new Set<string>())
  const marquee = useRef<{ lasso: boolean; points: { x: number; y: number }[] } | null>(null)
  const [marqueeRect, setMarqueeRect] = useState<RegionRect | null>(null)
  const [lassoPath, setLassoPath] = useState<{ x: number; y: number }[] | null>(null)
  const pixelSize = useMemo(
    () => mapPixelSize(map.width, map.height, HEX_SIZE),
    [map.width, map.height],
  )
  const elevations = useMemo(
    () => new Map(map.cells.map((cell) => [`${cell.col}:${cell.row}`, cell.elevation])),
    [map.cells],
  )
  const terrains = useMemo(
    () => new Map(map.cells.map((cell) => [`${cell.col}:${cell.row}`, cell.terrain])),
    [map.cells],
  )
  const skins = useMemo(
    () => new Map(map.cells.map((cell) => [`${cell.col}:${cell.row}`, cell.skin])),
    [map.cells],
  )
  const notes = useMemo(
    () =>
      new Map(
        map.annotations.map((note) => [`${note.col}:${note.row}`, note.text]),
      ),
    [map.annotations],
  )
  const highlightedCells = useMemo(
    () =>
      new Set(
        hovered
          ? cellsWithinRadius(hovered, highlightRadius, map.width, map.height).map(
              ({ col, row }) => `${col}:${row}`,
            )
          : [],
      ),
    [highlightRadius, hovered, map.height, map.width],
  )
  const viewBox = `${-MAP_VIEW_PADDING} ${-MAP_VIEW_PADDING} ${pixelSize.width + MAP_VIEW_PADDING * 2} ${pixelSize.height + MAP_VIEW_PADDING * 2}`

  const applyView = useCallback((next: ViewTransform) => {
    viewRef.current = next
    const viewport = viewportRef.current
    if (viewport) viewport.style.transform = viewCssTransform(next)
    const percent = String(Math.round(next.scale * 100))
    if (zoomReadoutRef.current) zoomReadoutRef.current.textContent = `${percent}%`
    if (zoomSliderRef.current) zoomSliderRef.current.value = percent
  }, [])

  useEffect(() => {
    applyView({ x: 0, y: 0, scale: 1 })
  }, [applyView, resetToken, map.width, map.height])

  useEffect(() => {
    let cancelled = false
    let idleHandle = 0
    const adopt = (id: BiomeId, tiles: TextureTiles) => {
      if (cancelled || !neededBiomeIds.has(id)) return
      setTilesByBiome((current) =>
        current[id] === tiles ? current : { ...current, [id]: tiles },
      )
    }
    for (const id of neededBiomeIds) {
      void rasterizeBiomeTextures(getBiome(id)).then((result) => {
        if (result) adopt(id, result)
      })
    }
    const bakeRest = () => {
      if (cancelled) return
      rasterizeAllBiomes(() => {
        // Warm the module cache only. Unused tiles stay out of the live SVG.
      })
    }
    idleHandle =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback(bakeRest)
        : window.setTimeout(bakeRest, 1)
    return () => {
      cancelled = true
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idleHandle)
      else window.clearTimeout(idleHandle)
    }
  }, [neededBiomeIds])

  const paint = useCallback(
    (cell: HexCell) => {
      const key = `${cell.col}:${cell.row}`
      if (painted.current.has(key)) return
      painted.current.add(key)
      onPaint(cell)
    },
    [onPaint],
  )

  const hover = useCallback((cell: HexCell | null) => {
    if (panStart.current) return
    setHovered(cell ? { col: cell.col, row: cell.row } : null)
    if (cell) setFocused({ col: cell.col, row: cell.row })
  }, [])

  useEffect(() => {
    setFocused((current) => ({
      col: Math.max(0, Math.min(map.width - 1, current.col)),
      row: Math.max(0, Math.min(map.height - 1, current.row)),
    }))
  }, [map.width, map.height])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !wheelZoom) return
    const onWheel = (event: WheelEvent) => {
      if ((event.target as HTMLElement | null)?.closest('input, textarea, select')) return
      event.preventDefault()
      const current = viewRef.current
      applyView({
        ...current,
        scale: clampZoom(current.scale * Math.exp(-event.deltaY * 0.0015)),
      })
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [applyView, wheelZoom])

  const toContentPoint = (event: { clientX: number; clientY: number }) => {
    const svg = svgRef.current
    if (!svg) return null
    return clientPointToViewBox(svg, event.clientX, event.clientY)
  }

  const startPointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (selectTool && event.button === 0) {
      const point = toContentPoint(event)
      if (!point) return
      event.currentTarget.setPointerCapture(event.pointerId)
      marquee.current = { lasso: selectTool === 'lasso', points: [point] }
      if (selectTool === 'select') {
        setMarqueeRect({ x0: point.x, y0: point.y, x1: point.x, y1: point.y })
      } else {
        setLassoPath([point])
      }
      return
    }
    if (event.button === 1 || event.button === 2 || event.shiftKey) {
      event.currentTarget.setPointerCapture(event.pointerId)
      panStart.current = {
        x: event.clientX,
        y: event.clientY,
        originX: viewRef.current.x,
        originY: viewRef.current.y,
      }
      return
    }
    painted.current.clear()
  }

  const movePointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = marquee.current
    if (drag) {
      const point = toContentPoint(event)
      if (!point) return
      if (drag.lasso) {
        drag.points.push(point)
        setLassoPath([...drag.points])
      } else {
        setMarqueeRect((current) => current && { ...current, x1: point.x, y1: point.y })
      }
      return
    }
    const start = panStart.current
    if (!start) return
    applyView({
      ...viewRef.current,
      x: start.originX + (event.clientX - start.x),
      y: start.originY + (event.clientY - start.y),
    })
  }

  const endPointer = (event: ReactPointerEvent<Element>) => {
    if (event.type === 'pointerleave' && (panStart.current || marquee.current)) return
    const drag = marquee.current
    if (drag) {
      marquee.current = null
      if (drag.lasso) {
        if (drag.points.length > 2) {
          onSelectRegion?.(cellsInPolygon(map.width, map.height, drag.points, HEX_SIZE))
        }
      } else if (marqueeRect) {
        onSelectRegion?.(cellsInRect(map.width, map.height, marqueeRect, HEX_SIZE))
      }
      setMarqueeRect(null)
      setLassoPath(null)
    }
    panStart.current = null
    painted.current.clear()
    onStrokeEnd?.()
  }

  const zoomTo = (percent: number) => {
    applyView({
      ...viewRef.current,
      scale: clampZoom(percent / 100),
    })
  }

  const onMapKeyDown = (event: ReactKeyboardEvent<SVGSVGElement>) => {
    if (selectedBuildingId) return
    const target = event.target as HTMLElement
    if (target.closest('input, textarea, select')) return
    if (event.key.startsWith('Arrow')) {
      event.preventDefault()
      event.stopPropagation()
      const delta = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      }[event.key]
      if (!delta) return
      setFocused((current) => ({
        col: Math.max(0, Math.min(map.width - 1, current.col + delta[0])),
        row: Math.max(0, Math.min(map.height - 1, current.row + delta[1])),
      }))
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      const cell = map.cells.find(
        (entry) => entry.col === focused.col && entry.row === focused.row,
      )
      if (cell) onPaint(cell)
    }
  }

  return (
    <div className="map-stage" ref={stageRef}>
      <div
        ref={viewportRef}
        className="map-viewport"
        style={{ transform: viewCssTransform(viewRef.current) }}
      >
      <svg
        ref={svgRef}
        className={`hex-map ${showGrid ? '' : 'grid-hidden'}`}
        role="application"
        tabIndex={0}
        viewBox={viewBox}
        onPointerDown={startPointer}
        onPointerMove={movePointer}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onKeyDown={onMapKeyDown}
        onContextMenu={(event) => event.preventDefault()}
        aria-label={`${map.name}, ${map.width} by ${map.height} hex battle map`}
        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space"
      >
        <defs>
          {[...neededBiomeIds].flatMap((id) => {
            const tiles = tilesByBiome[id]
            if (!tiles) return []
            const entry = getBiome(id)
            return TERRAIN_TYPES.map((terrain) => (
              <pattern
                key={`${entry.prefix}-${terrain}`}
                id={`${entry.prefix}-bmp-${terrain}`}
                width="256"
                height="256"
                patternUnits="userSpaceOnUse"
              >
                <image href={tiles[terrain]} width="256" height="256" preserveAspectRatio="none" />
              </pattern>
            ))
          })}
          {!tilesByBiome[biome.id] && biome.textureDefs}
          <filter id="building-plaster-noise" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
            <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="7" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.16 0" />
          </filter>
          <pattern id="building-plaster" width="48" height="48" patternUnits="userSpaceOnUse">
            <rect width="48" height="48" filter="url(#building-plaster-noise)" />
          </pattern>
        </defs>
        <rect
          x={-MAP_VIEW_PADDING}
          y={-MAP_VIEW_PADDING}
          width={pixelSize.width + MAP_VIEW_PADDING * 2}
          height={pixelSize.height + MAP_VIEW_PADDING * 2}
          className="map-background"
        />
        <g className="map-content">
          {map.cells.map((cell) => {
            const variant = cell.skin ? getVariant(cell.skin) : undefined
            const activeTiles = tilesByBiome[biome.id]
            // Variants without a home biome (rail) use the map biome's texture.
            const variantTiles = variant
              ? variant.biomeId
                ? tilesByBiome[variant.biomeId]
                : activeTiles
              : undefined
            const variantPrefix = variant?.biomeId ? variant.prefix : biome.prefix
            const textureFill = variant
              ? variantTiles
                ? `url(#${variantPrefix}-bmp-${cell.terrain})`
                : biome.textureRef(cell.terrain)
              : activeTiles
                ? `url(#${biome.prefix}-bmp-${cell.terrain})`
                : biome.textureRef(cell.terrain)
            return (
              <HexCellView
                key={`${cell.col}:${cell.row}`}
                cell={cell}
                biome={biome}
                fill={variant?.color ?? biome.palette[cell.terrain].color}
                textureFill={textureFill}
                note={layerVisibility.annotations ? notes.get(`${cell.col}:${cell.row}`) : undefined}
                showTerrainLayer={layerVisibility.terrain}
                showElevationLayer={layerVisibility.elevation}
                isHovered={highlightedCells.has(`${cell.col}:${cell.row}`)}
                isFocused={focused.col === cell.col && focused.row === cell.row}
              allowDragPaint={allowDragPaint}
              hexNumbering={numbering}
              showElevationLabels={showElevationLabels}
              showTerrainTags={showTerrainTags}
              onPaintCell={paint}
              onHoverCell={hover}
                panningRef={panStart}
                showProtected={showProtected}
              />
            )
          })}
          {layerVisibility.terrain && (
            <RouteLayer
              cells={map.cells}
              terrains={terrains}
              skins={skins}
              roadStyle={biome.road}
            />
          )}
          {layerVisibility.elevation && (
            <ElevationRims
              cells={map.cells}
              elevations={elevations}
              rimShadow={biome.elevation.rimShadow}
              rimLight={biome.elevation.rimLight}
            />
          )}
          {layerVisibility.structures && (
            <BuildingLayer
              buildings={map.buildings}
              selectedId={selectedBuildingId}
              onSelect={onSelectBuilding ?? NOOP_SELECT}
            />
          )}
          {buildingTool && hovered && (
            <BuildingGhost map={map} type={buildingTool} anchor={hovered} />
          )}
          {selection && selection.size > 0 && (
            <g className="selection-overlay" pointerEvents="none">
              {[...selection].map((key) => {
                const [col, row] = key.split(':').map(Number)
                return (
                  <polygon
                    key={key}
                    points={insetPointsAttribute(col, row, HEX_SIZE, 1.2)}
                    className="selected-cell"
                  />
                )
              })}
            </g>
          )}
          {pastePreview && hovered && (
            <rect
              className="marquee-rect"
              x={hexCenter(hovered.col, hovered.row, HEX_SIZE).x - (HEX_SIZE * Math.sqrt(3)) / 2}
              y={hexCenter(hovered.col, hovered.row, HEX_SIZE).y - HEX_SIZE}
              width={pastePreview.width * HEX_SIZE * Math.sqrt(3)}
              height={pastePreview.height * HEX_SIZE * 1.5}
            />
          )}
          {marqueeRect && (
            <rect
              className="marquee-rect"
              x={Math.min(marqueeRect.x0, marqueeRect.x1)}
              y={Math.min(marqueeRect.y0, marqueeRect.y1)}
              width={Math.abs(marqueeRect.x1 - marqueeRect.x0)}
              height={Math.abs(marqueeRect.y1 - marqueeRect.y0)}
            />
          )}
          {lassoPath && lassoPath.length > 1 && (
            <polyline
              className="lasso-path"
              points={lassoPath.map((point) => `${point.x},${point.y}`).join(' ')}
            />
          )}
        </g>
      </svg>
      </div>
      {(showLegend || showElevationKey) && (
        <div className="map-legend" aria-label="Map legend">
          {showLegend && (
            <div className="legend-terrains">
              <span className="legend-heading">Terrain</span>
              {TERRAIN_TYPES.map((terrain) => (
                <span key={terrain} className="legend-swatch">
                  <span
                    className="legend-chip"
                    style={{ background: biome.palette[terrain].color }}
                  />
                  {biome.palette[terrain].label}
                </span>
              ))}
            </div>
          )}
          {showElevationKey && (
            <div className="legend-elevation">
              <span className="legend-heading">Elevation</span>
              {Array.from({ length: MAX_ELEVATION + 1 }, (_, level) => (
                <span key={level} className="legend-swatch">
                  <span
                    className="legend-chip"
                    style={{
                      background:
                        level === 0
                          ? biome.palette.clear.color
                          : biome.elevation.ramp[level - 1],
                    }}
                  />
                  {level === 0 ? '0 Ground' : String(level)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="map-help">
        <span><b>{allowDragPaint ? 'Paint' : 'Fill'}</b> {allowDragPaint ? 'drag' : 'click'}</span>
        <span><b>Path</b> drag</span>
        <span><b>Pan</b> shift-drag</span>
        <input
          ref={zoomSliderRef}
          type="range"
          className="zoom-slider"
          aria-label="Zoom level"
          min={55}
          max={280}
          step={1}
          defaultValue={100}
          onChange={(event) => zoomTo(Number(event.target.value))}
        />
        <span className="zoom-readout" ref={zoomReadoutRef}>
          100%
        </span>
      </div>
    </div>
  )
}

const NOOP_SELECT = () => {}

const LINK_APOTHEM = (HEX_SIZE * Math.sqrt(3)) / 2
const EDGE_MIDPOINTS = [
  { x: LINK_APOTHEM, y: 0 },
  { x: LINK_APOTHEM / 2, y: HEX_SIZE * 0.75 },
  { x: -LINK_APOTHEM / 2, y: HEX_SIZE * 0.75 },
  { x: -LINK_APOTHEM, y: 0 },
  { x: -LINK_APOTHEM / 2, y: -HEX_SIZE * 0.75 },
  { x: LINK_APOTHEM / 2, y: -HEX_SIZE * 0.75 },
]

function edgeLinks(cell: HexCell, terrains: Map<string, TerrainType>, terrain: TerrainType) {
  const edges: number[] = []
  for (let edge = 0; edge < 6; edge += 1) {
    const neighbor = edgeNeighbor(cell.col, cell.row, edge)
    if (terrains.get(`${neighbor.col}:${neighbor.row}`) === terrain) edges.push(edge)
  }
  return edges
}

function neighborSkin(
  cell: HexCell,
  edge: number,
  skins: Map<string, string | undefined>,
) {
  const neighbor = edgeNeighbor(cell.col, cell.row, edge)
  return skins.get(`${neighbor.col}:${neighbor.row}`)
}

/** Rail links connect only to other rail-skinned cells, not to streets. */
function railLinks(cell: HexCell, terrains: Map<string, TerrainType>, skins: Map<string, string | undefined>) {
  return edgeLinks(cell, terrains, 'road').filter((edge) => neighborSkin(cell, edge, skins) === 'rail')
}

/** Street links stay on pavement and never spoke into rail. */
function streetLinks(cell: HexCell, terrains: Map<string, TerrainType>, skins: Map<string, string | undefined>) {
  return edgeLinks(cell, terrains, 'road').filter((edge) => neighborSkin(cell, edge, skins) !== 'rail')
}

function neighborIsStreet(
  cell: HexCell,
  edge: number,
  terrains: Map<string, TerrainType>,
  skins: Map<string, string | undefined>,
) {
  const neighbor = edgeNeighbor(cell.col, cell.row, edge)
  const key = `${neighbor.col}:${neighbor.row}`
  return terrains.get(key) === 'road' && skins.get(key) !== 'rail'
}

function streetTargets(cell: HexCell, terrains: Map<string, TerrainType>, skins: Map<string, string | undefined>) {
  const edges = streetLinks(cell, terrains, skins)
  return linkTargets(edges).filter((edge) => neighborSkin(cell, edge, skins) !== 'rail')
}

function railTargets(cell: HexCell, terrains: Map<string, TerrainType>, skins: Map<string, string | undefined>) {
  const edges = railLinks(cell, terrains, skins)
  return linkTargets(edges).filter((edge) => !neighborIsStreet(cell, edge, terrains, skins))
}

const RouteLayer = memo(function RouteLayer({
  cells,
  terrains,
  skins,
  roadStyle,
}: {
  cells: HexCell[]
  terrains: Map<string, TerrainType>
  skins: Map<string, string | undefined>
  roadStyle: BiomeRoadStyle
}) {
  return (
    <g className="route-layer" pointerEvents="none">
      {cells.map((cell) => {
        if (cell.terrain !== 'road') return null
        const center = hexCenter(cell.col, cell.row, HEX_SIZE)
        return cell.skin === 'rail' ? (
          <RailMark
            key={`${cell.col}:${cell.row}`}
            x={center.x}
            y={center.y}
            edges={railTargets(cell, terrains, skins)}
          />
        ) : (
          <RoadMark
            key={`${cell.col}:${cell.row}`}
            col={cell.col}
            row={cell.row}
            x={center.x}
            y={center.y}
            edges={streetTargets(cell, terrains, skins)}
            roadStyle={roadStyle}
          />
        )
      })}
    </g>
  )
})

// A lone linked hex still reads as a through-route; a single link extends to the far side.
function linkTargets(edges: number[]) {
  return edges.length === 0 ? [3, 0] : edges.length === 1 ? [edges[0], (edges[0] + 3) % 6] : edges
}

function roadSpoke(x: number, y: number, edge: number) {
  const midpoint = EDGE_MIDPOINTS[edge]
  return {
    x1: x,
    y1: y,
    x2: x + midpoint.x,
    y2: y + midpoint.y,
  }
}

function RoadMark({
  col,
  row,
  x,
  y,
  edges,
  roadStyle,
}: {
  col: number
  row: number
  x: number
  y: number
  edges: number[]
  roadStyle: BiomeRoadStyle
}) {
  return (
    <g className="road-mark" data-col={col} data-row={row} data-links={edges.length} data-edges={edges.join(',')}>
      {edges.map((edge) => {
        const spoke = roadSpoke(x, y, edge)
        return (
          <g key={edge} className="road-segment">
            <line
              className="road-pavement"
              x1={spoke.x1}
              y1={spoke.y1}
              x2={spoke.x2}
              y2={spoke.y2}
              style={{ stroke: roadStyle.band }}
            />
            <line
              className="road-centerline"
              x1={spoke.x1}
              y1={spoke.y1}
              x2={spoke.x2}
              y2={spoke.y2}
              style={{ stroke: roadStyle.centerline }}
            />
          </g>
        )
      })}
    </g>
  )
}

function RailMark({ x, y, edges }: { x: number; y: number; edges: number[] }) {
  return (
    <g className="rail-mark">
      {edges.map((edge) => {
        const midpoint = EDGE_MIDPOINTS[edge]
        const length = Math.hypot(midpoint.x, midpoint.y) || 1
        const ux = midpoint.x / length
        const uy = midpoint.y / length
        const px = -uy
        const py = ux
        return (
          <g key={edge}>
            <line
              x1={x + px * 2.2}
              y1={y + py * 2.2}
              x2={x + midpoint.x + px * 2.2}
              y2={y + midpoint.y + py * 2.2}
              className="rail-line"
            />
            <line
              x1={x - px * 2.2}
              y1={y - py * 2.2}
              x2={x + midpoint.x - px * 2.2}
              y2={y + midpoint.y - py * 2.2}
              className="rail-line"
            />
            {[0.3, 0.6, 0.9].map((t) => (
              <line
                key={t}
                x1={x + midpoint.x * t - px * 3.4}
                y1={y + midpoint.y * t - py * 3.4}
                x2={x + midpoint.x * t + px * 3.4}
                y2={y + midpoint.y * t + py * 3.4}
                className="rail-tie"
              />
            ))}
          </g>
        )
      })}
    </g>
  )
}

function FeatureMark({ feature, x, y }: { feature: CellFeature; x: number; y: number }) {
  if (feature === 'crater') {
    return (
      <g className="feature-mark crater-mark">
        <circle cx={x} cy={y} r={13} />
        <circle cx={x} cy={y} r={7.5} />
      </g>
    )
  }
  if (feature === 'ice') {
    return (
      <g className="feature-mark ice-mark">
        <polygon points={`${x},${y - 11} ${x + 9},${y - 2} ${x + 5},${y + 9} ${x - 5},${y + 9} ${x - 9},${y - 2}`} />
      </g>
    )
  }
  if (feature === 'crevasse') {
    return (
      <g className="feature-mark crevasse-mark">
        <path d={`M${x - 11} ${y + 8} L${x - 3} ${y - 2} L${x + 2} ${y + 4} L${x + 11} ${y - 8}`} />
      </g>
    )
  }
  if (feature === 'dryWash') {
    return (
      <g className="feature-mark dry-wash-mark">
        <path d={`M${x - 12} ${y + 2} q6 -8 12 0 t12 0`} />
        <path d={`M${x - 12} ${y + 7} q6 -6 12 0 t12 0`} />
      </g>
    )
  }
  if (feature === 'canopyGap') {
    return (
      <g className="feature-mark canopy-gap-mark">
        <circle cx={x} cy={y} r={11} />
      </g>
    )
  }
  if (feature === 'beach') {
    return (
      <g className="feature-mark beach-mark">
        <circle cx={x - 7} cy={y + 6} r={1.5} />
        <circle cx={x} cy={y + 8} r={1.7} />
        <circle cx={x + 7} cy={y + 6} r={1.5} />
        <circle cx={x - 3} cy={y + 2} r={1.2} />
        <circle cx={x + 4} cy={y + 2} r={1.2} />
      </g>
    )
  }
  if (feature === 'wall') {
    const radius = 11
    const points = Array.from({ length: 6 }, (_, index) => {
      const angle = ((60 * index - 30) * Math.PI) / 180
      return `${x + radius * Math.cos(angle)},${y + radius * Math.sin(angle)}`
    }).join(' ')
    return (
      <g className="feature-mark wall-mark">
        <polygon points={points} />
      </g>
    )
  }
  if (feature === 'cliff') {
    return (
      <g className="feature-mark cliff-mark">
        <path d={`M${x - 10} ${y + 4} L${x} ${y - 8} L${x + 10} ${y + 4}`} />
        <path d={`M${x - 8} ${y + 9} L${x} ${y - 1} L${x + 8} ${y + 9}`} />
      </g>
    )
  }
  if (feature === 'reef') {
    return (
      <g className="feature-mark reef-mark">
        <path d={`M${x - 11} ${y + 3} q5 -7 10 0 t10 0`} />
        <circle cx={x - 4} cy={y - 2} r={2.1} />
        <circle cx={x + 3} cy={y + 2} r={1.7} />
        <circle cx={x + 7} cy={y - 4} r={1.3} />
      </g>
    )
  }
  if (feature === 'spore') {
    return (
      <g className="feature-mark spore-mark">
        <circle cx={x} cy={y - 2} r={6.5} />
        <circle cx={x - 7} cy={y + 5} r={3.4} />
        <circle cx={x + 7} cy={y + 4} r={2.8} />
        <circle cx={x + 2} cy={y + 8} r={1.6} />
      </g>
    )
  }
  if (feature === 'crystal') {
    return (
      <g className="feature-mark crystal-mark">
        <polygon points={`${x},${y - 12} ${x + 5},${y + 2} ${x - 5},${y + 2}`} />
        <polygon points={`${x + 7},${y - 7} ${x + 11},${y + 4} ${x + 3},${y + 3}`} />
        <polygon points={`${x - 8},${y - 5} ${x - 3},${y + 5} ${x - 12},${y + 4}`} />
      </g>
    )
  }
  return (
    <g className="feature-mark scree-mark">
      <circle cx={x - 9} cy={y + 5} r={1.4} />
      <circle cx={x - 2} cy={y + 9} r={1.8} />
      <circle cx={x + 6} cy={y + 6} r={1.3} />
      <circle cx={x + 10} cy={y} r={1.6} />
      <circle cx={x - 5} cy={y - 2} r={1.2} />
    </g>
  )
}
