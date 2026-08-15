import { memo } from 'react'
import { BUILDING_TYPES, buildingCells, canPlaceBuilding } from '../lib/buildings'
import { shade } from '../lib/color'
import { hexCenter, insetPointsAttribute } from '../lib/hex'
import type { Building, BuildingType } from '../types/building'
import type { BattleMap } from '../types/map'

const HEX_SIZE = 32
const LINK_APOTHEM = (HEX_SIZE * Math.sqrt(3)) / 2
const EDGE_MIDPOINTS = [
  { x: LINK_APOTHEM, y: 0 },
  { x: LINK_APOTHEM / 2, y: HEX_SIZE * 0.75 },
  { x: -LINK_APOTHEM / 2, y: HEX_SIZE * 0.75 },
  { x: -LINK_APOTHEM, y: 0 },
  { x: -LINK_APOTHEM / 2, y: -HEX_SIZE * 0.75 },
  { x: LINK_APOTHEM / 2, y: -HEX_SIZE * 0.75 },
]

const WALL_COLOR = {
  civilian: '#d2c4a4',
  industrial: '#c8bdae',
  infrastructure: '#c4cad2',
  military: '#b8baa4',
} as const

const CATEGORY_ROOF = {
  civilian: '#d8c8b4',
  industrial: '#d4c6b2',
  infrastructure: '#c4cad2',
  military: '#d0cebc',
} as const

const ROOF_COLOR: Partial<Record<BuildingType, string>> = {
  house: '#d4925c',
  apartment: '#d8c8b4',
  warehouse: '#ddd6c8',
  factory: '#d4c6b2',
  bridge: '#9a9488',
  commTower: '#d4d0c4',
  officeTower: '#d8d2c4',
  mechHangar: '#dcd8c8',
  bunker: '#c4bca8',
  commandHQ: '#d0cebc',
  fuelDepot: '#d8ccb8',
  dropShipPad: '#d2cec4',
  hospital: '#f0ebe0',
  government: '#e2dcc8',
  barracks: '#d2c49a',
  vehicleGarage: '#d8d4c6',
  repairBay: '#d6ceba',
  powerPlant: '#dcd6cc',
  railStation: '#e0d4c0',
  waterTower: '#cdd8e0',
  hpgStation: '#c8d0d8',
  castleBrian: '#9a9484',
  starLeagueBunker: '#b8c0b0',
}

function roofFill(type: BuildingType) {
  return ROOF_COLOR[type] ?? CATEGORY_ROOF[BUILDING_TYPES[type].category]
}

/** Rectangular top-down footprint. Sizes must stay inside the hex cluster. */
function buildingShape(building: Building) {
  const centers = buildingCells(building).map((cell) =>
    hexCenter(cell.col, cell.row, HEX_SIZE),
  )
  const cx = centers.reduce((sum, c) => sum + c.x, 0) / centers.length
  const cy = centers.reduce((sum, c) => sum + c.y, 0) / centers.length
  // Measure the plate in unrotated space so SVG rotate() does not spin an
  // already-rotated screen AABB off the hex cluster.
  const radians = (-building.rotation * 60 * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const local = centers.map((center) => ({
    x: (center.x - cx) * cos - (center.y - cy) * sin,
    y: (center.x - cx) * sin + (center.y - cy) * cos,
  }))
  const spanX = Math.max(...local.map((center) => center.x)) - Math.min(...local.map((center) => center.x))
  const spanY = Math.max(...local.map((center) => center.y)) - Math.min(...local.map((center) => center.y))
  const sized: Partial<Record<Building['type'], { w: number; h: number }>> = {
    house: { w: 30, h: 20 },
    commTower: { w: 18, h: 18 },
    apartment: { w: spanX + 26, h: 26 },
    warehouse: { w: spanX + 26, h: spanY + 26 },
    factory: { w: spanX + 26, h: spanY + 26 },
    bridge: { w: spanX + 30, h: 13 },
    officeTower: { w: spanX + 24, h: 24 },
    mechHangar: { w: spanX + 26, h: spanY + 26 },
    bunker: { w: 22, h: 22 },
    commandHQ: { w: spanX + 24, h: 24 },
    fuelDepot: { w: spanX + 24, h: 22 },
    dropShipPad: { w: spanX + 30, h: spanY + 28 },
    hospital: { w: spanX + 26, h: spanY + 24 },
    government: { w: spanX + 24, h: 24 },
    barracks: { w: spanX + 24, h: 22 },
    vehicleGarage: { w: spanX + 26, h: spanY + 26 },
    repairBay: { w: spanX + 26, h: spanY + 26 },
    powerPlant: { w: spanX + 26, h: spanY + 26 },
    railStation: { w: spanX + 24, h: 22 },
    waterTower: { w: 22, h: 22 },
    hpgStation: { w: spanX + 24, h: 24 },
    castleBrian: { w: spanX + 26, h: spanY + 26 },
    starLeagueBunker: { w: spanX + 24, h: 22 },
  }
  const fallback =
    BUILDING_TYPES[building.type].footprint.length <= 1
      ? { w: 22, h: 22 }
      : { w: spanX + 26, h: Math.max(22, spanY + 24) }
  return { cx, cy, ...(sized[building.type] ?? fallback), angle: building.rotation * 60 }
}

function wallDepth(type: BuildingType) {
  const height = BUILDING_TYPES[type].height
  if (type === 'bridge' || type === 'dropShipPad' || type === 'fuelDepot') return 1.6
  if (
    type === 'commTower' ||
    type === 'bunker' ||
    type === 'waterTower' ||
    type === 'castleBrian' ||
    type === 'starLeagueBunker'
  ) {
    return 2.2
  }
  return Math.min(6.4, 2.2 + height * 0.85)
}

function BoxWalls({
  w,
  h,
  depth,
  color,
  windows = 0,
}: {
  w: number
  h: number
  depth: number
  color: string
  windows?: number
}) {
  const x = -w / 2
  const y = -h / 2
  const ox = depth * 0.68
  const oy = depth * 0.9
  return (
    <g className="building-walls">
      <polygon
        className="building-wall-south"
        points={`${x},${y + h} ${x + w},${y + h} ${x + w + ox},${y + h + oy} ${x + ox},${y + h + oy}`}
        style={{ fill: shade(color, -0.22) }}
      />
      <polygon
        className="building-wall-east"
        points={`${x + w},${y} ${x + w},${y + h} ${x + w + ox},${y + h + oy} ${x + w + ox},${y + oy}`}
        style={{ fill: shade(color, -0.08) }}
      />
      {Array.from({ length: windows }, (_, index) => {
        const t = (index + 1) / (windows + 1)
        const wx = x + t * w
        return (
          <rect
            key={index}
            className="wall-window"
            x={wx - 1.3}
            y={y + h + oy * 0.2}
            width={2.6}
            height={Math.max(1.4, oy * 0.55)}
          />
        )
      })}
    </g>
  )
}

function RoofPlate({
  x,
  y,
  width,
  height,
  fill,
  rx = 0,
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
  rx?: number
}) {
  return (
    <rect className="building-plate" x={x} y={y} width={width} height={height} rx={rx} style={{ fill }} />
  )
}

function RoofLip({ w, h, color }: { w: number; h: number; color: string }) {
  const x = -w / 2
  const y = -h / 2
  return (
    <polyline
      className="roof-lip"
      points={`${x},${y + h} ${x},${y} ${x + w},${y}`}
      style={{ stroke: shade(color, 0.38) }}
    />
  )
}

function HouseBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const ridge = -h * 0.06
  return (
    <g className="building-detail house-body">
      <BoxWalls w={w} h={h} depth={3.2} color={walls} windows={3} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(walls, 0.12)} />
      <polygon
        className="house-plane-lit"
        points={`${x},${y} ${x + w},${y} ${w * 0.08},${ridge} ${-w * 0.08},${ridge}`}
        style={{ fill: shade(roof, 0.22) }}
      />
      <polygon
        className="house-plane-shade"
        points={`${x},${y + h} ${x + w},${y + h} ${w * 0.08},${ridge} ${-w * 0.08},${ridge}`}
        style={{ fill: shade(roof, -0.08) }}
      />
      <line className="building-ridge" x1={-w * 0.08} y1={ridge} x2={w * 0.08} y2={ridge} />
      <g className="house-chimney">
        <rect x={w * 0.22} y={-h * 0.22} width={3.6} height={4.4} style={{ fill: '#8a4a38' }} />
        <rect x={w * 0.2} y={-h * 0.3} width={4.2} height={1.7} style={{ fill: '#6a382c' }} />
      </g>
      <rect
        className="house-porch"
        x={x - 2.4}
        y={-2.6}
        width={3.6}
        height={5.2}
        style={{ fill: shade(walls, 0.22) }}
      />
      <rect x={x + 1.2} y={y + h - 3.6} width={4.2} height={3.6} style={{ fill: '#4a4036' }} />
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function ApartmentBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const bays = Math.max(3, Math.round(w / 18))
  return (
    <g className="building-detail apartment-body">
      <BoxWalls w={w} h={h} depth={5.2} color={walls} windows={bays * 2} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.08)} />
      <rect className="roof-parapet" x={x + 1.2} y={y + 1.2} width={w - 2.4} height={h - 2.4} />
      {Array.from({ length: bays - 1 }, (_, index) => {
        const bx = x + ((index + 1) / bays) * w
        return (
          <line
            key={bx}
            x1={bx}
            y1={y + 2}
            x2={bx}
            y2={y + h - 2}
            className="roof-joint"
          />
        )
      })}
      {Array.from({ length: bays }, (_, index) => {
        const bx = x + ((index + 0.55) / bays) * w
        return (
          <g key={index} className="roof-hvac">
            <rect x={bx - 2.5} y={y + h * 0.2} width={5} height={3.4} style={{ fill: '#6a6256' }} />
            <line x1={bx - 1.7} y1={y + h * 0.27} x2={bx + 1.7} y2={y + h * 0.27} />
          </g>
        )
      })}
      <rect
        x={x + 2.4}
        y={y + 2.4}
        width={Math.min(12, w * 0.2)}
        height={6.4}
        style={{ fill: shade(roof, 0.22) }}
      />
      <rect x={x + 3.2} y={y + h - 4} width={5.2} height={4} style={{ fill: '#4a4036' }} />
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function WarehouseBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  return (
    <g className="building-detail warehouse-body">
      <BoxWalls w={w} h={h} depth={4.2} color={walls} windows={4} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.08)} />
      <polygon
        points={`${x},${y} ${x + w},${y} ${x + w},${0} ${x},${0}`}
        style={{ fill: shade(roof, 0.24) }}
      />
      <polygon
        points={`${x},${0} ${x + w},${0} ${x + w},${y + h} ${x},${y + h}`}
        style={{ fill: shade(roof, -0.08) }}
      />
      <line className="building-ridge" x1={x + 2} y1={0} x2={x + w - 2} y2={0} />
      {[0.28, 0.5, 0.72].map((t) => (
        <rect
          key={t}
          x={x + 4}
          y={y + h * t - 1.2}
          width={w - 8}
          height={2.4}
          style={{ fill: shade(roof, 0.4) }}
        />
      ))}
      <rect
        className="loading-dock"
        x={x + w * 0.08}
        y={y + h - 4}
        width={w * 0.3}
        height={4}
        style={{ fill: '#3f3c34' }}
      />
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function FactoryBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const teeth = Math.max(3, Math.round(w / 16))
  const tooth = w / teeth
  return (
    <g className="building-detail factory-body">
      <BoxWalls w={w} h={h} depth={4.4} color={walls} windows={5} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.06)} />
      {Array.from({ length: teeth }, (_, index) => {
        const tx = x + index * tooth
        const peak = y + 2.4
        const base = y + h * 0.46
        return (
          <g key={index}>
            <polygon
              className="sawtooth-lit"
              points={`${tx},${base} ${tx + tooth * 0.5},${peak} ${tx + tooth * 0.5},${base}`}
              style={{ fill: shade(roof, 0.32) }}
            />
            <polygon
              className="sawtooth-shade"
              points={`${tx + tooth * 0.5},${peak} ${tx + tooth},${base} ${tx + tooth * 0.5},${base}`}
              style={{ fill: shade(roof, -0.1) }}
            />
          </g>
        )
      })}
      <rect
        x={x + 2}
        y={y + h * 0.52}
        width={w * 0.42}
        height={h * 0.42}
        style={{ fill: shade(roof, 0.18) }}
      />
      <g className="factory-stack">
        <circle cx={x + w - 7.2} cy={y + h - 7.2} r={4} style={{ fill: shade(roof, 0.2) }} />
        <circle cx={x + w - 7.2} cy={y + h - 7.2} r={2.6} className="cooling-tower-rim" />
        <circle cx={x + w - 7.2} cy={y + h - 7.2} r={1.2} style={{ fill: '#2f2c28' }} />
      </g>
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function BridgeBody({ w, h, roof }: { w: number; h: number; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  return (
    <g className="building-detail bridge-body">
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.18)} rx={1.2} />
      <line className="bridge-rail" x1={x} y1={y + 1.6} x2={x + w} y2={y + 1.6} />
      <line className="bridge-rail" x1={x} y1={y + h - 1.6} x2={x + w} y2={y + h - 1.6} />
      <line className="bridge-centerline" x1={x + 3} y1={0} x2={x + w - 3} y2={0} />
      {[-0.36, -0.12, 0.12, 0.36].map((t) => (
        <line key={t} className="bridge-plank" x1={t * w} y1={y + 2} x2={t * w} y2={y + h - 2} />
      ))}
      <rect x={x} y={y} width={3.2} height={h} style={{ fill: shade(roof, -0.12) }} />
      <rect x={x + w - 3.2} y={y} width={3.2} height={h} style={{ fill: shade(roof, -0.12) }} />
    </g>
  )
}

function CommTowerBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const pad = Math.min(w, h) * 0.48
  return (
    <g className="building-detail tower-body">
      <RoofPlate x={-pad} y={-pad} width={pad * 2} height={pad * 2} fill={shade(roof, 0.12)} rx={1.4} />
      <rect x={-pad + 1.2} y={-pad + 1.2} width={pad * 2 - 2.4} height={pad * 2 - 2.4} className="roof-parapet" />
      <rect x={-pad + 1.6} y={pad - 5.2} width={5.6} height={3.6} style={{ fill: shade(walls, 0.08) }} />
      {[-1, 1].map((sx) =>
        [-1, 1].map((sy) => (
          <line
            key={`${sx}${sy}`}
            className="tower-guy"
            x1={0}
            y1={0}
            x2={sx * pad * 0.82}
            y2={sy * pad * 0.82}
          />
        )),
      )}
      <line x1={-3.4} y1={-3.4} x2={3.4} y2={3.4} className="tower-mast" />
      <line x1={3.4} y1={-3.4} x2={-3.4} y2={3.4} className="tower-mast" />
      <line x1={0} y1={-5} x2={0} y2={5} className="tower-mast" />
      <circle cx={0} cy={0} r={1.8} style={{ fill: '#4a453c' }} />
      <ellipse cx={3.6} cy={-3} rx={3.2} ry={1.7} style={{ fill: shade(roof, 0.35) }} />
      <ellipse cx={3.6} cy={-3} rx={2.2} ry={1.1} className="civic-dome-ring" />
      <circle cx={0} cy={-5.6} r={1.1} style={{ fill: '#c45a3a' }} />
    </g>
  )
}

function OfficeBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  return (
    <g className="building-detail office-body">
      <BoxWalls w={w} h={h} depth={6.2} color={walls} windows={8} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.1)} />
      <rect className="roof-parapet" x={x + 1.4} y={y + 1.4} width={w - 2.8} height={h - 2.8} />
      <g className="roof-windows office-penthouse">
        <rect
          x={-w * 0.22}
          y={-h * 0.22}
          width={w * 0.44}
          height={h * 0.44}
          style={{ fill: shade(roof, 0.22) }}
        />
        {[-0.12, 0.12].map((dx) =>
          [-0.12, 0.12].map((dy) => (
            <rect
              key={`${dx}:${dy}`}
              x={dx * w - 3.1}
              y={dy * h - 3.1}
              width={6.2}
              height={6.2}
              style={{ fill: '#4a5860' }}
            />
          )),
        )}
      </g>
      <circle cx={w * 0.32} cy={-h * 0.28} r={3.2} style={{ fill: shade(roof, -0.08) }} />
      <circle cx={w * 0.32} cy={-h * 0.28} r={2.6} className="roof-parapet" />
      <text className="helipad-mark" x={w * 0.32} y={-h * 0.24}>
        H
      </text>
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function HangarBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const doorW = Math.max(10, w * 0.2)
  const vaultX = x + 1.6
  const vaultY = y + h * 0.07
  const vaultW = w - doorW - 2
  const vaultH = h * 0.86
  return (
    <g className="building-detail hangar-body">
      <BoxWalls w={w} h={h} depth={5.4} color={walls} windows={0} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.08)} />
      <rect
        x={x + 1.2}
        y={y + 1.2}
        width={w * 0.2}
        height={h * 0.24}
        style={{ fill: shade(walls, 0.18) }}
      />
      <g className="hangar-vault">
        <rect
          x={vaultX}
          y={vaultY}
          width={vaultW}
          height={vaultH}
          rx={vaultH * 0.2}
          style={{ fill: shade(roof, 0.28) }}
        />
        <rect
          x={vaultX + 2}
          y={vaultY + 2.4}
          width={vaultW - 4}
          height={vaultH - 4.8}
          rx={vaultH * 0.14}
          style={{ fill: shade(roof, 0.06) }}
        />
        {[0.26, 0.44, 0.62, 0.8].map((t) => (
          <line
            key={t}
            className="hangar-rib"
            x1={vaultX + vaultW * t}
            y1={vaultY + 3.2}
            x2={vaultX + vaultW * t}
            y2={vaultY + vaultH - 3.2}
          />
        ))}
      </g>
      <g className="hangar-gantry">
        <line className="crane-beam" x1={vaultX + 3} y1={0} x2={vaultX + vaultW - 3} y2={0} />
        <rect
          x={vaultX + vaultW * 0.52}
          y={-1.8}
          width={6.4}
          height={3.6}
          style={{ fill: shade(walls, -0.28) }}
        />
        <line
          className="crane-hook"
          x1={vaultX + vaultW * 0.52 + 3.2}
          y1={1.8}
          x2={vaultX + vaultW * 0.52 + 3.2}
          y2={6.6}
        />
      </g>
      <g className="hangar-door">
        <rect
          x={x + w - doorW}
          y={y + h * 0.08}
          width={doorW}
          height={h * 0.84}
          style={{ fill: '#3c3a32' }}
        />
        <line
          x1={x + w - doorW / 2}
          y1={y + h * 0.1}
          x2={x + w - doorW / 2}
          y2={y + h * 0.9}
        />
        {[0.22, 0.38, 0.54, 0.7].map((t) => (
          <polygon
            key={t}
            className="warning-band"
            points={`${x + w - doorW + 1.2},${y + h * t} ${x + w - 1.2},${y + h * (t + 0.06)} ${x + w - 1.2},${y + h * (t + 0.12)} ${x + w - doorW + 1.2},${y + h * (t + 0.06)}`}
          />
        ))}
      </g>
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function octagon(radius: number) {
  return Array.from({ length: 8 }, (_, index) => {
    const angle = Math.PI / 8 + (index * Math.PI) / 4
    return `${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`
  }).join(' ')
}

function BunkerBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const radius = Math.min(w, h) * 0.48
  return (
    <g className="building-detail bunker-body">
      <polygon
        className="bunker-berm"
        points={octagon(radius + 2)}
        style={{ fill: shade(walls, -0.12) }}
        transform="translate(1.4 1.8)"
      />
      <polygon className="building-plate bunker-roof" points={octagon(radius)} style={{ fill: shade(roof, 0.12) }} />
      <polygon className="roof-parapet" points={octagon(radius - 2.2)} />
      <circle cx={0} cy={0} r={radius * 0.3} style={{ fill: shade(roof, 0.28) }} />
      <circle cx={0} cy={0} r={radius * 0.16} style={{ fill: '#3a362e' }} />
      <rect className="bunker-door" x={-radius - 0.6} y={-2.2} width={3.4} height={4.4} style={{ fill: '#3a362e' }} />
      {[-0.55, 0.55].map((t) => (
        <rect
          key={t}
          className="bunker-embrasure"
          x={radius * 0.42}
          y={t * radius * 0.55 - 0.75}
          width={3.6}
          height={1.5}
          style={{ fill: '#2f2c28' }}
        />
      ))}
    </g>
  )
}

function CommandBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  return (
    <g className="building-detail hq-body">
      <BoxWalls w={w} h={h} depth={4.8} color={walls} windows={6} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.1)} />
      <rect className="roof-parapet" x={x + 1.2} y={y + 1.2} width={w - 2.4} height={h - 2.4} />
      <rect
        x={x + 2.4}
        y={y + 2.4}
        width={w * 0.4}
        height={h * 0.48}
        style={{ fill: shade(roof, 0.24) }}
      />
      <line x1={w * 0.22} y1={y + 2} x2={w * 0.22} y2={y - 5.8} className="tower-mast" />
      <circle cx={w * 0.22} cy={y - 6.4} r={1.6} style={{ fill: '#c45a3a' }} />
      <ellipse cx={w * 0.28} cy={h * 0.18} rx={5.8} ry={3.4} style={{ fill: shade(roof, 0.28) }} />
      <ellipse cx={w * 0.28} cy={h * 0.18} rx={3.6} ry={2} className="civic-dome-ring" />
      <rect x={x + 3} y={y + h - 4} width={5.4} height={4} style={{ fill: '#3f3c34' }} />
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function Tank({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return (
    <g className="fuel-tank" transform={`translate(${cx} ${cy})`}>
      <ellipse cx={1.3} cy={1.6} rx={r} ry={r * 0.72} style={{ fill: shade(color, -0.4) }} />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.72} style={{ fill: color }} />
      <ellipse cx={-r * 0.22} cy={-r * 0.18} rx={r * 0.55} ry={r * 0.32} style={{ fill: shade(color, 0.28) }} />
      <ellipse cx={0} cy={0} rx={r * 0.22} ry={r * 0.16} style={{ fill: shade(color, -0.35) }} />
    </g>
  )
}

function FuelDepotBody({ w, h, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const tankR = Math.min(w * 0.2, h * 0.38)
  return (
    <g className="building-detail fuel-body">
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.16)} rx={2} />
      <rect className="roof-parapet" x={x + 1.5} y={y + 1.5} width={w - 3} height={h - 3} rx={1.4} />
      <Tank cx={-w * 0.22} cy={0} r={tankR} color={shade(roof, 0.08)} />
      <Tank cx={w * 0.22} cy={0} r={tankR} color={shade(roof, 0.08)} />
      <line x1={-w * 0.06} y1={0} x2={w * 0.06} y2={0} className="fuel-pipe" />
      <rect x={-3.4} y={h * 0.26} width={6.8} height={3.4} style={{ fill: '#4a4036' }} />
    </g>
  )
}

function DropShipPadBody({ w, h, roof }: { w: number; h: number; roof: string }) {
  const radius = Math.min(w, h) * 0.46
  return (
    <g className="building-detail pad-body">
      <circle className="building-plate pad-deck" r={radius} style={{ fill: shade(roof, 0.16) }} />
      <circle r={radius - 2.2} className="roof-parapet" />
      <circle className="pad-ring" r={radius * 0.64} />
      <circle className="pad-inner" r={radius * 0.3} />
      <line x1={-radius * 0.74} y1={0} x2={radius * 0.74} y2={0} className="pad-mark" />
      <line x1={0} y1={-radius * 0.74} x2={0} y2={radius * 0.74} className="pad-mark" />
      <circle r={2.4} style={{ fill: '#3a362e' }} />
    </g>
  )
}

function HospitalBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const stemW = w * 0.42
  const barH = h * 0.42
  const barY = -barH / 2
  return (
    <g className="building-detail hospital-body">
      <BoxWalls w={w} h={h} depth={4.8} color={walls} windows={6} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, -0.08)} />
      <rect x={x} y={y} width={stemW} height={h} style={{ fill: roof }} />
      <rect x={x} y={barY} width={w} height={barH} style={{ fill: shade(roof, 0.12) }} />
      <rect x={x + 1.2} y={y + 1.2} width={stemW - 2.4} height={h - 2.4} className="roof-parapet" />
      <rect x={x + 1.2} y={barY + 1.1} width={w - 2.4} height={barH - 2.2} className="roof-parapet" />
      <g className="hospital-cross">
        <rect x={-1.7} y={-6.6} width={3.4} height={13.2} />
        <rect x={-6.6} y={-1.7} width={13.2} height={3.4} />
      </g>
      <circle cx={x + w - 8} cy={0} r={5.4} className="pad-ring" />
      <circle cx={x + w - 8} cy={0} r={4.2} style={{ fill: shade(roof, -0.12) }} />
      <text className="helipad-mark" x={x + w - 8} y={1.8}>
        H
      </text>
      <rect
        x={x + 2}
        y={y + h - 4.2}
        width={stemW - 4}
        height={4.2}
        style={{ fill: '#4a4036' }}
      />
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function GovernmentBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const wing = w * 0.3
  return (
    <g className="building-detail government-body">
      <BoxWalls w={w} h={h} depth={6} color={walls} windows={8} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={roof} />
      <rect x={x} y={y} width={wing} height={h} style={{ fill: shade(roof, -0.08) }} />
      <rect x={x + w - wing} y={y} width={wing} height={h} style={{ fill: shade(roof, -0.08) }} />
      <rect
        x={-w * 0.18}
        y={-h * 0.22}
        width={w * 0.36}
        height={h * 0.44}
        style={{ fill: shade(roof, 0.16) }}
      />
      <ellipse className="civic-dome" cx={0} cy={-h * 0.02} rx={w * 0.16} ry={h * 0.18} style={{ fill: shade(roof, 0.32) }} />
      <ellipse cx={0} cy={-h * 0.02} rx={w * 0.1} ry={h * 0.11} className="civic-dome-ring" />
      <ellipse cx={-w * 0.04} cy={-h * 0.07} rx={w * 0.06} ry={h * 0.07} style={{ fill: shade(roof, 0.55) }} />
      {[-0.12, -0.04, 0.04, 0.12].map((t) => (
        <rect
          key={t}
          x={t * w - 0.7}
          y={y + h - 7.2}
          width={1.4}
          height={4.4}
          style={{ fill: shade(walls, -0.18) }}
        />
      ))}
      {[0, 1.4, 2.8].map((step) => (
        <line
          key={step}
          className="civic-steps"
          x1={-w * 0.16}
          y1={y + h - 2.6 + step}
          x2={w * 0.16}
          y2={y + h - 2.6 + step}
        />
      ))}
      <line className="tower-mast" x1={w * 0.34} y1={y + 2} x2={w * 0.34} y2={y - 5.8} />
      <rect x={w * 0.34} y={y - 5.8} width={3.8} height={2.3} style={{ fill: '#6a3a32' }} />
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function BarracksBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const bays = 4
  const bay = w / bays
  return (
    <g className="building-detail barracks-body">
      <BoxWalls w={w} h={h} depth={3.8} color={walls} windows={8} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.04)} />
      {Array.from({ length: bays }, (_, index) => {
        const bx = x + index * bay
        return (
          <g key={index} className="barracks-module">
            <polygon
              points={`${bx + 1},${y + 1.6} ${bx + bay - 1},${y + 1.6} ${bx + bay * 0.5},${-h * 0.06}`}
              style={{ fill: shade(roof, 0.28) }}
            />
            <polygon
              points={`${bx + 1},${y + h - 1.6} ${bx + bay - 1},${y + h - 1.6} ${bx + bay * 0.5},${-h * 0.06}`}
              style={{ fill: shade(roof, -0.1) }}
            />
            <line
              className="building-ridge"
              x1={bx + bay * 0.5}
              y1={y + 2.2}
              x2={bx + bay * 0.5}
              y2={y + h - 2.2}
            />
            <rect
              x={bx + bay * 0.34}
              y={y + h - 3.8}
              width={bay * 0.32}
              height={3.8}
              style={{ fill: '#4a4538' }}
            />
          </g>
        )
      })}
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function VehicleGarageBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const doors = 3
  const doorW = (w - 8) / doors
  return (
    <g className="building-detail garage-body">
      <BoxWalls w={w} h={h} depth={4} color={walls} windows={0} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.1)} />
      <rect x={x + 1.4} y={y + 1.4} width={w * 0.22} height={h * 0.3} style={{ fill: shade(walls, 0.16) }} />
      <rect
        x={x + 2}
        y={y + h - 8}
        width={w - 4}
        height={3.4}
        style={{ fill: shade(roof, 0.28) }}
      />
      {Array.from({ length: doors }, (_, index) => {
        const dx = x + 4 + index * doorW
        return (
          <g key={index} className="bay-door">
            <rect
              x={dx + 0.8}
              y={y + h - 4.8}
              width={doorW - 1.6}
              height={4.8}
              style={{ fill: '#3f3c34' }}
            />
            <line x1={dx + doorW / 2} y1={y + h - 4.4} x2={dx + doorW / 2} y2={y + h - 0.4} />
            <line x1={dx + 1.4} y1={y + h - 2.4} x2={dx + doorW - 1.4} y2={y + h - 2.4} />
          </g>
        )
      })}
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function RepairBayBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const shed = w * 0.32
  return (
    <g className="building-detail repair-body">
      <BoxWalls w={w} h={h} depth={3.2} color={walls} windows={2} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.04)} />
      <rect x={x} y={y} width={shed} height={h} style={{ fill: shade(roof, 0.18) }} />
      <rect x={x + 1.2} y={y + 1.2} width={shed - 2.4} height={h - 2.4} className="roof-parapet" />
      <rect
        x={x + shed + 1.2}
        y={y + 2}
        width={w - shed - 3.2}
        height={h - 4}
        style={{ fill: shade(roof, 0.32) }}
      />
      {[
        [x + shed + 2.2, y + 3],
        [x + w - 4.2, y + 3],
        [x + shed + 2.2, y + h - 5.2],
        [x + w - 4.2, y + h - 5.2],
      ].map(([px, py]) => (
        <rect key={`${px}:${py}`} x={px} y={py} width={2} height={2.2} style={{ fill: shade(walls, -0.2) }} />
      ))}
      <g className="repair-crane">
        <line className="crane-beam" x1={x + shed + 3} y1={0} x2={x + w - 3} y2={0} />
        <rect x={x + w * 0.62} y={-1.6} width={5.4} height={3.2} style={{ fill: shade(walls, -0.22) }} />
        <line className="crane-hook" x1={x + w * 0.62 + 2.7} y1={1.6} x2={x + w * 0.62 + 2.7} y2={5.8} />
      </g>
      <rect
        x={x + shed + w * 0.12}
        y={-h * 0.16}
        width={w * 0.28}
        height={h * 0.32}
        style={{ fill: '#3a362e' }}
      />
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function CoolingTower({
  cx,
  cy,
  r,
  walls,
  roof,
}: {
  cx: number
  cy: number
  r: number
  walls: string
  roof: string
}) {
  return (
    <g className="cooling-tower" transform={`translate(${cx} ${cy})`}>
      <ellipse cx={1.3} cy={1.6} rx={r} ry={r * 0.84} style={{ fill: shade(walls, -0.28) }} />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.84} style={{ fill: shade(roof, 0.22) }} />
      <ellipse cx={0} cy={0} rx={r * 0.74} ry={r * 0.62} className="cooling-tower-rim" />
      <ellipse cx={0} cy={0} rx={r * 0.38} ry={r * 0.32} style={{ fill: '#2f2c28' }} />
      <ellipse
        cx={-r * 0.2}
        cy={-r * 0.22}
        rx={r * 0.22}
        ry={r * 0.12}
        style={{ fill: shade(roof, 0.5) }}
      />
    </g>
  )
}

function PowerPlantBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const hallW = w * 0.46
  const towerR = Math.min(w, h) * 0.2
  return (
    <g className="building-detail plant-body">
      <BoxWalls w={w} h={h} depth={5} color={walls} windows={4} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.06)} />
      <rect
        x={x + w - hallW}
        y={y + h * 0.18}
        width={hallW - 1.4}
        height={h * 0.72}
        style={{ fill: shade(roof, 0.2) }}
      />
      {[0.38, 0.55, 0.72].map((t) => (
        <rect
          key={t}
          x={x + w - hallW + 2}
          y={y + h * t}
          width={hallW - 5.2}
          height={2.2}
          style={{ fill: shade(roof, -0.12) }}
        />
      ))}
      <CoolingTower cx={x + towerR + 4} cy={y + h * 0.32} r={towerR} walls={walls} roof={roof} />
      <CoolingTower cx={x + towerR * 2.6 + 5} cy={y + h * 0.28} r={towerR * 0.88} walls={walls} roof={roof} />
      {[0, 1, 2].map((index) => (
        <rect
          key={index}
          x={x + 2.4 + index * 5.2}
          y={y + h - 7.2}
          width={4.4}
          height={5.2}
          style={{ fill: shade(walls, -0.28) }}
        />
      ))}
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function RailStationBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const house = w * 0.34
  return (
    <g className="building-detail station-body">
      <BoxWalls w={w} h={h} depth={3.6} color={walls} windows={4} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.08)} />
      {[0.62, 0.74, 0.86].map((t) => (
        <line
          key={t}
          className="station-rail"
          x1={x + 1.4}
          y1={y + h * t}
          x2={x + w - 1.4}
          y2={y + h * t}
        />
      ))}
      <rect
        x={x + 1.6}
        y={y + h * 0.22}
        width={w - 3.2}
        height={h * 0.32}
        style={{ fill: shade(roof, 0.32) }}
      />
      {[0.22, 0.5, 0.78].map((t) => (
        <rect
          key={t}
          x={x + w * t - 0.8}
          y={y + h * 0.5}
          width={1.6}
          height={2.4}
          style={{ fill: shade(walls, -0.18) }}
        />
      ))}
      <rect x={x} y={y} width={house} height={h * 0.58} style={{ fill: shade(roof, 0.12) }} />
      <polygon
        points={`${x + 1},${y + 1.2} ${x + house - 1},${y + 1.2} ${x + house * 0.5},${y - 1.4}`}
        style={{ fill: shade(roof, 0.36) }}
      />
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function WaterTowerBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const pad = Math.min(w, h) * 0.46
  const tankR = Math.min(w, h) * 0.34
  return (
    <g className="building-detail water-tower-body">
      <RoofPlate
        x={-pad}
        y={-pad}
        width={pad * 2}
        height={pad * 2}
        fill={shade(roof, 0.16)}
        rx={1.2}
      />
      {[-1, 1].map((sx) =>
        [-1, 1].map((sy) => (
          <line
            key={`${sx}${sy}`}
            className="water-leg"
            x1={sx * pad * 0.72}
            y1={sy * pad * 0.72}
            x2={sx * tankR * 0.35}
            y2={sy * tankR * 0.2}
          />
        )),
      )}
      <line className="water-leg" x1={-pad * 0.55} y1={pad * 0.55} x2={pad * 0.55} y2={-pad * 0.55} />
      <line className="water-leg" x1={pad * 0.55} y1={pad * 0.55} x2={-pad * 0.55} y2={-pad * 0.55} />
      <Tank cx={0.4} cy={0.2} r={tankR} color={shade(roof, 0.08)} />
      <circle r={tankR * 0.82} className="water-walkway" />
      <rect x={-1} y={tankR * 0.2} width={2} height={pad * 0.7} style={{ fill: shade(walls, -0.3) }} />
    </g>
  )
}

function HpgBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  return (
    <g className="building-detail hpg-body">
      <BoxWalls w={w} h={h} depth={5.2} color={walls} windows={4} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.08)} />
      <rect className="roof-parapet" x={x + 1.2} y={y + 1.2} width={w - 2.4} height={h - 2.4} />
      <rect
        x={x + 2}
        y={y + h * 0.55}
        width={w * 0.38}
        height={h * 0.32}
        style={{ fill: shade(walls, 0.1) }}
      />
      <g className="hpg-dish" transform={`translate(${w * 0.18} ${-h * 0.06})`}>
        <ellipse rx={w * 0.28} ry={h * 0.22} style={{ fill: shade(roof, 0.28) }} />
        <ellipse rx={w * 0.2} ry={h * 0.15} className="civic-dome-ring" />
        <line className="tower-mast" x1={0} y1={h * 0.16} x2={0} y2={-h * 0.28} />
        <circle cy={-h * 0.28} r={1.4} style={{ fill: '#c45a3a' }} />
      </g>
      <RoofLip w={w} h={h} color={roof} />
    </g>
  )
}

function CastleBrianBody({ w, h, walls, roof }: { w: number; h: number; walls: string; roof: string }) {
  const x = -w / 2
  const y = -h / 2
  const gateW = Math.max(8, w * 0.22)
  return (
    <g className="building-detail castle-brian-body">
      <polygon
        className="bunker-berm"
        points={`${x - 2},${y + h} ${x + w + 2},${y + h} ${x + w},${y} ${x},${y}`}
        style={{ fill: shade(walls, -0.18) }}
      />
      <RoofPlate x={x} y={y} width={w} height={h} fill={shade(roof, 0.04)} />
      <rect className="roof-parapet" x={x + 1.6} y={y + 1.6} width={w - 3.2} height={h - 3.2} />
      {[-0.32, 0.32].map((t) => (
        <rect
          key={t}
          x={t * w - 2.4}
          y={y + 2}
          width={4.8}
          height={h * 0.28}
          style={{ fill: shade(walls, -0.08) }}
        />
      ))}
      <g className="castle-gate">
        <rect x={-gateW / 2} y={y + h * 0.42} width={gateW} height={h * 0.58} style={{ fill: '#2c2a24' }} />
        <path
          d={`M ${-gateW / 2} ${y + h * 0.58} Q 0 ${y + h * 0.28} ${gateW / 2} ${y + h * 0.58}`}
          style={{ fill: '#1a1814' }}
        />
      </g>
    </g>
  )
}

function StarLeagueBunkerBody({
  w,
  h,
  walls,
  roof,
}: {
  w: number
  h: number
  walls: string
  roof: string
}) {
  const radius = Math.min(w, h) * 0.48
  return (
    <g className="building-detail sl-bunker-body">
      <polygon
        className="bunker-berm"
        points={octagon(radius + 3.2)}
        style={{ fill: shade(walls, -0.14) }}
        transform="translate(1.2 1.6)"
      />
      <polygon className="building-plate" points={octagon(radius + 0.8)} style={{ fill: shade(roof, 0.1) }} />
      <polygon className="roof-parapet" points={octagon(radius - 2.4)} />
      <polygon
        className="sl-star"
        points="0,-6.2 1.8,-1.9 6.4,-1.9 2.6,0.8 4.1,5.2 0,2.4 -4.1,5.2 -2.6,0.8 -6.4,-1.9 -1.8,-1.9"
        style={{ fill: shade(roof, 0.32) }}
      />
      <rect className="bunker-door" x={-radius - 0.4} y={-2.4} width={3.2} height={4.8} style={{ fill: '#2f2c28' }} />
    </g>
  )
}

function StampBody({
  type,
  w,
  h,
  walls,
  roof,
}: {
  type: BuildingType
  w: number
  h: number
  walls: string
  roof: string
}) {
  const x = -w / 2
  const y = -h / 2
  return (
    <g className={`building-detail ${type}-body`}>
      <BoxWalls w={w} h={h} depth={wallDepth(type)} color={walls} windows={2} />
      <RoofPlate x={x} y={y} width={w} height={h} fill={roof} rx={1.2} />
      <RoofLip w={w} h={h} color={roof} />
      <circle cx={0} cy={-h * 0.08} r={Math.min(w, h) * 0.14} style={{ fill: shade(roof, 0.22) }} />
    </g>
  )
}

function BuildingMass({
  type,
  w,
  h,
  walls,
  roof,
}: {
  type: BuildingType
  w: number
  h: number
  walls: string
  roof: string
}) {
  if (type === 'house') return <HouseBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'apartment') return <ApartmentBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'warehouse') return <WarehouseBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'factory') return <FactoryBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'bridge') return <BridgeBody w={w} h={h} roof={roof} />
  if (type === 'commTower') return <CommTowerBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'officeTower') return <OfficeBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'mechHangar') return <HangarBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'bunker') return <BunkerBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'commandHQ') return <CommandBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'fuelDepot') return <FuelDepotBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'hospital') return <HospitalBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'government') return <GovernmentBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'barracks') return <BarracksBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'vehicleGarage') return <VehicleGarageBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'repairBay') return <RepairBayBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'powerPlant') return <PowerPlantBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'railStation') return <RailStationBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'waterTower') return <WaterTowerBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'hpgStation') return <HpgBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'castleBrian') return <CastleBrianBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'starLeagueBunker') return <StarLeagueBunkerBody w={w} h={h} walls={walls} roof={roof} />
  if (type === 'dropShipPad') return <DropShipPadBody w={w} h={h} roof={roof} />
  return <StampBody type={type} w={w} h={h} walls={walls} roof={roof} />
}

function BuildingView({
  building,
  selected,
  onSelect,
}: {
  building: Building
  selected: boolean
  onSelect: (id: string) => void
}) {
  const definition = BUILDING_TYPES[building.type]
  const state = building.state
  const wrecked =
    state === 'damaged' ||
    state === 'heavilyDamaged' ||
    state === 'burning' ||
    state === 'collapsed' ||
    state === 'rubble'
  const flattened = state === 'collapsed' || state === 'rubble'
  const walls = shade(WALL_COLOR[definition.category], wrecked || state === 'lightlyDamaged' ? -0.32 : 0)
  const roof = shade(roofFill(building.type), wrecked || state === 'lightlyDamaged' ? -0.28 : 0)
  const { cx, cy, w, h, angle } = buildingShape(building)
  const depth = wallDepth(building.type)
  const customArt = building.image
  const artHeight = flattened ? h * 0.55 : h
  const clipId = `building-art-${building.id}`
  return (
    <g
      className={`building building-${building.type} ${building.state} ${selected ? 'selected' : ''}`}
      onPointerDown={(event) => {
        event.stopPropagation()
        onSelect(building.id)
      }}
    >
      <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
        <rect
          className="building-shadow"
          x={-w / 2 + depth * 0.55}
          y={-h / 2 + depth * 0.75}
          width={w}
          height={h}
          rx={2}
        />
        {customArt ? (
          <g>
            <rect
              className="building-plate"
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={artHeight}
              style={{ fill: shade(roof, flattened ? -0.22 : -0.18) }}
            />
            <defs>
              <clipPath id={clipId}>
                <rect x={-w / 2} y={-h / 2} width={w} height={artHeight} />
              </clipPath>
            </defs>
            <image
              className="building-custom-art"
              href={customArt}
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={artHeight}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
              opacity={wrecked ? 0.88 : 1}
            />
          </g>
        ) : flattened ? (
          <rect
            className="building-plate"
            x={-w / 2}
            y={-h / 2}
            width={w}
            height={h * 0.55}
            style={{ fill: shade(roof, -0.22) }}
          />
        ) : wrecked ? (
          <g>
            <BoxWalls w={w} h={h} depth={Math.max(2.4, depth * 0.7)} color={walls} />
            <rect
              className="building-plate"
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              style={{ fill: shade(roof, -0.12) }}
            />
          </g>
        ) : (
          <g>
            <BuildingMass type={building.type} w={w} h={h} walls={walls} roof={roof} />
            <rect className="building-plaster" x={-w / 2} y={-h / 2} width={w} height={h} rx={1.2} />
          </g>
        )}
        {definition.entrances.map((entrance, index) => {
          const dir = EDGE_MIDPOINTS[(entrance.edge + 6) % 6]
          const length = Math.hypot(dir.x, dir.y) || 1
          const ux = dir.x / length
          const uy = dir.y / length
          const tx = Math.abs(ux) > 1e-6 ? w / 2 / Math.abs(ux) : Infinity
          const ty = Math.abs(uy) > 1e-6 ? h / 2 / Math.abs(uy) : Infinity
          const t = Math.min(tx, ty) - 0.4
          return (
            <line
              key={index}
              className="building-entrance"
              x1={ux * t - uy * 2.6}
              y1={uy * t + ux * 2.6}
              x2={ux * t + uy * 2.6}
              y2={uy * t - ux * 2.6}
            />
          )
        })}
        {(wrecked || state === 'lightlyDamaged') && (
          <g className="building-rubble">
            <circle cx={-w * 0.25} cy={h * 0.15} r={1.7} />
            <circle cx={w * 0.2} cy={-h * 0.2} r={2} />
            <circle cx={w * 0.32} cy={h * 0.28} r={1.3} />
          </g>
        )}
        {state === 'burning' && (
          <g className="building-fire">
            <path d={`M${-w * 0.1} ${h * 0.1} q${w * 0.08} ${-h * 0.45} ${w * 0.04} ${-h * 0.55}`} />
            <path d={`M${w * 0.12} ${h * 0.05} q${w * 0.06} ${-h * 0.38} ${-w * 0.02} ${-h * 0.48}`} />
          </g>
        )}
        <rect className="building-hit" x={-w / 2} y={-h / 2} width={w} height={h} />
        {selected && (
          <rect
            x={-w / 2 - 2.5}
            y={-h / 2 - 2.5}
            width={w + 5}
            height={h + 5}
            className="building-selection"
          />
        )}
      </g>
      {building.label && (
        <text className="building-label" x={cx} y={cy + h / 2 + 9}>
          {building.label}
        </text>
      )}
    </g>
  )
}

export const BuildingLayer = memo(function BuildingLayer({
  buildings,
  selectedId,
  onSelect,
}: {
  buildings: Building[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <g className="building-layer">
      {buildings.map((building) => (
        <BuildingView
          key={building.id}
          building={building}
          selected={building.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </g>
  )
})

export function BuildingGhost({
  map,
  type,
  anchor,
}: {
  map: BattleMap
  type: BuildingType
  anchor: { col: number; row: number }
}) {
  const valid = canPlaceBuilding(map, type, anchor, 0)
  const ghost: Building = { id: 'ghost', type, anchor, rotation: 0, state: 'intact' }
  const { cx, cy, w, h } = buildingShape(ghost)
  return (
    <g className={`building-ghost ${valid ? 'valid' : 'invalid'}`} pointerEvents="none">
      {buildingCells(ghost).map((cell) => (
        <polygon
          key={`${cell.col}:${cell.row}`}
          points={insetPointsAttribute(cell.col, cell.row, HEX_SIZE, 1)}
          className="ghost-footprint"
        />
      ))}
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={1.5} className="ghost-shape" />
    </g>
  )
}
