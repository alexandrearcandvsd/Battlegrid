import { useEffect, useMemo, useRef, useState } from 'react'
import { BuildingsPanel } from './components/BuildingsPanel'
import { ExportPanel } from './components/ExportPanel'
import { GeneratorPanel } from './components/GeneratorPanel'
import { HexMap } from './components/HexMap'
import { TerrainPalette } from './components/TerrainPalette'
import { useMapHistory } from './hooks/useMapHistory'
import {
  deleteBuilding,
  duplicateBuilding,
  moveBuilding,
  rotateBuilding,
  setBuildingLabel,
  setBuildingState,
  stampBuilding,
} from './lib/buildingCommands'
import { BUILDING_TYPES, buildingAt } from './lib/buildings'
import type { BuildingType } from './types/building'
import { downloadExportPdf, downloadExportPng, downloadExportSvg, printExport } from './lib/export'
import { HEX_NUMBERING_LABELS, nextHexNumbering } from './lib/hexNumbering'
import { generateMap, mapStats } from './lib/generator'
import {
  clearCellProtections,
  countProtectedCells,
  editMapCell,
  editMapPath,
  regenerateUnprotectedCells,
  resizeMapPreservingCells,
} from './lib/mapCommands'
import {
  downloadMap,
  loadMapLocally,
  parseMapWithWarnings,
  saveMapLocally,
} from './lib/serialization'
import { getBiome, resolveBiome, resolveBiomeId } from './lib/biomes'
import type { BiomeId } from './types/biome'
import { setAnnotation } from './lib/annotationCommands'
import {
  expandMap,
  flipMapHorizontal,
  flipMapVertical,
  rotateMap180,
} from './lib/mapOps'
import {
  clearRegion,
  copyRegion,
  cropMapToRegion,
  fillRegion,
  pasteRegion,
  setProtection,
  type RegionClipboard,
} from './lib/regionCommands'
import {
  EDIT_LAYERS,
  MAX_MAP_HEIGHT,
  MAX_MAP_WIDTH,
  TERRAIN_LABELS,
  TERRAIN_TYPES,
  type BrushSettings,
  type EditLayer,
  type GeneratorSettings,
  type HexCell,
} from './types/map'
import { DEFAULT_EXPORT_SETTINGS, type HexNumberingMode } from './types/export'
import './styles.css'

type EditorTab = 'generate' | 'terrain' | 'structures' | 'export'

const DEFAULT_SETTINGS: GeneratorSettings = {
  biome: 'temperate-grasslands',
  width: 18,
  height: 14,
  seed: 'IRON-MESA-1847',
  terrain: { woods: 28, water: 13, rough: 21 },
  elevation: 3,
  symmetric: true,
  river: true,
  roadChance: 100,
  colorway: 'default',
}

const randomSeed = () =>
  `${['IRON', 'ASH', 'NOVA', 'STEEL', 'DUST'][Math.floor(Math.random() * 5)]}-${
    ['MESA', 'FOX', 'LANCE', 'RIDGE', 'COMET'][Math.floor(Math.random() * 5)]
  }-${Math.floor(1000 + Math.random() * 9000)}`

function App() {
  const [initialMap] = useState(() => loadMapLocally() ?? generateMap(DEFAULT_SETTINGS))
  const { map, commit, replace, undo, redo, canUndo, canRedo } = useMapHistory(initialMap)
  const [settings, setSettings] = useState<GeneratorSettings>(() => {
    const biome = getBiome(resolveBiomeId(initialMap))
    return {
      ...DEFAULT_SETTINGS,
      biome: biome.id,
      width: initialMap.width,
      height: initialMap.height,
      seed: initialMap.seed,
      terrain: initialMap.generatorProfile
        ? {
            woods: initialMap.generatorProfile.woods,
            water: initialMap.generatorProfile.water,
            rough: initialMap.generatorProfile.rough,
          }
        : {
            woods: biome.generation.defaults.woods,
            water: biome.generation.defaults.water,
            rough: biome.generation.defaults.rough,
          },
      elevation:
        initialMap.generatorProfile?.elevation ?? biome.generation.defaults.elevation,
      symmetric: initialMap.generatorProfile?.symmetric ?? true,
      river: initialMap.generatorProfile?.river ?? true,
      roadChance: initialMap.generatorProfile?.roadChance ?? 100,
      roadNetwork: initialMap.generatorProfile?.roadNetwork ?? false,
      colorway: initialMap.colorway ?? 'default',
    }
  })
  const [brush, setBrush] = useState<BrushSettings>({
    terrain: 'woods',
    size: 1,
    tool: 'brush',
    elevationMode: 'paint',
    targetElevation: 1,
    mark: 'none',
  })
  const [resetToken, setResetToken] = useState(0)
  const [notice, setNotice] = useState('Map ready')
  const [showGrid, setShowGrid] = useState(true)
  const [hexNumbering, setHexNumbering] = useState<HexNumberingMode>('offset')
  const [exportSettings, setExportSettings] = useState(DEFAULT_EXPORT_SETTINGS)
  const [showElevationLabels, setShowElevationLabels] = useState(true)
  const [showProtected, setShowProtected] = useState(false)
  const [showLegend, setShowLegend] = useState(false)
  const [showElevationKey, setShowElevationKey] = useState(false)
  const [wheelZoom, setWheelZoom] = useState(false)
  const [showTerrainTags, setShowTerrainTags] = useState(true)
  const [activeTab, setActiveTab] = useState<EditorTab>('generate')
  const [buildingTool, setBuildingTool] = useState<BuildingType | null>(null)
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [noteArmed, setNoteArmed] = useState(false)
  const [selection, setSelection] = useState<Set<string> | null>(null)
  const [clipboard, setClipboard] = useState<RegionClipboard | null>(null)
  const [pasteArmed, setPasteArmed] = useState(false)
  const [layers, setLayers] = useState<Record<EditLayer, { visible: boolean; locked: boolean }>>({
    terrain: { visible: true, locked: false },
    elevation: { visible: true, locked: false },
    structures: { visible: true, locked: false },
    annotations: { visible: true, locked: false },
  })
  const selectedBuilding = map.buildings.find((entry) => entry.id === selectedBuildingId) ?? null

  const toggleLayer = (layer: EditLayer, key: 'visible' | 'locked') =>
    setLayers((current) => ({
      ...current,
      [layer]: { ...current[layer], [key]: !current[layer][key] },
    }))

  const openTab = (tab: EditorTab) => {
    setActiveTab(tab)
    if (tab !== 'structures') {
      setBuildingTool(null)
      setSelectedBuildingId(null)
    }
  }
  const svgRef = useRef<SVGSVGElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const pathAnchor = useRef<Pick<HexCell, 'col' | 'row'> | null>(null)
  const biome = resolveBiome(map)
  const stats = useMemo(() => mapStats(map), [map])
  const protectedCount = useMemo(() => countProtectedCells(map), [map])

  useEffect(() => {
    const timeout = window.setTimeout(() => saveMapLocally(map), 250)
    return () => window.clearTimeout(timeout)
  }, [map])

  // Keep generator settings aligned with the map's biome after undo/redo/import.
  const mapBiome = resolveBiomeId(map)
  useEffect(() => {
    setSettings((current) => (current.biome === mapBiome ? current : { ...current, biome: mapBiome }))
  }, [mapBiome])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea')) return
      const modifier = event.metaKey || event.ctrlKey
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      }
      if (modifier && event.key.toLowerCase() === 'g') {
        event.preventDefault()
        replace(generateMap(settings))
        setNotice('Battlefield regenerated')
      }
      if (modifier && selection && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        setClipboard(copyRegion(map, [...selection]))
        setNotice(`Copied ${selection.size} hexes`)
        return
      }
      if (modifier && selection && event.key.toLowerCase() === 'x') {
        event.preventDefault()
        setClipboard(copyRegion(map, [...selection]))
        commit((current) => clearRegion(current, [...selection]))
        setSelection(null)
        setNotice('Region cut')
        return
      }
      if (modifier && event.key.toLowerCase() === 'v' && clipboard) {
        event.preventDefault()
        setPasteArmed(true)
        setNotice('Click the map to paste')
        return
      }
      if (
        event.key === 'Escape' &&
        (buildingTool || selectedBuildingId || noteArmed || selection || pasteArmed)
      ) {
        setBuildingTool(null)
        setSelectedBuildingId(null)
        setNoteArmed(false)
        setSelection(null)
        setPasteArmed(false)
        return
      }
      if (selectedBuildingId && !modifier) {
        const key = event.key.toLowerCase()
        if (event.key.startsWith('Arrow')) {
          event.preventDefault()
          if (layers.structures.locked) {
            setNotice('Structures layer is locked')
            return
          }
          const delta = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
          }[event.key]
          const building = map.buildings.find((entry) => entry.id === selectedBuildingId)
          if (!delta || !building) return
          const next = moveBuilding(map, selectedBuildingId, {
            col: building.anchor.col + delta[0],
            row: building.anchor.row + delta[1],
          })
          if (next === map) setNotice('Cannot move there')
          else commit(next)
          return
        }
        if (key === 'r') {
          commit((current) => rotateBuilding(current, selectedBuildingId))
          return
        }
        if (key === 'd') {
          commit((current) => duplicateBuilding(current, selectedBuildingId))
          return
        }
        if (event.key === 'Delete' || event.key === 'Backspace') {
          commit((current) => deleteBuilding(current, selectedBuildingId))
          setSelectedBuildingId(null)
          return
        }
      }
      const terrainIndex = Number(event.key) - 1
      if (terrainIndex >= 0 && terrainIndex < TERRAIN_TYPES.length) {
        setActiveTab('terrain')
        setBuildingTool(null)
        setSelectedBuildingId(null)
        setBrush((current) => ({
          ...current,
          terrain: TERRAIN_TYPES[terrainIndex],
          tool: 'brush',
          elevationMode: 'paint',
          mark: 'none',
        }))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [buildingTool, clipboard, commit, layers, map, noteArmed, pasteArmed, redo, replace, selectedBuildingId, selection, settings, undo])

  const generate = (nextSettings = settings) => {
    replace(generateMap(nextSettings))
    setNotice(`Generated from ${nextSettings.seed}`)
  }

  const selectBiome = (biomeId: BiomeId) => {
    if (biomeId === resolveBiomeId(map)) return
    const next = getBiome(biomeId)
    commit({ ...map, biome: biomeId })
    setSettings((current) => ({
      ...current,
      biome: biomeId,
      terrain: {
        woods: next.generation.defaults.woods,
        water: next.generation.defaults.water,
        rough: next.generation.defaults.rough,
      },
      elevation: next.generation.defaults.elevation,
    }))
    setNotice(`Biome set to ${next.label}`)
  }

  const mapClick = (target: HexCell) => {
    if (buildingTool) {
      if (layers.structures.locked) {
        setNotice('Structures layer is locked')
        return
      }
      const next = stampBuilding(map, buildingTool, target)
      if (next === map) {
        setNotice('Cannot place there')
        return
      }
      commit(next)
      setSelectedBuildingId(next.buildings[next.buildings.length - 1].id)
      setNotice(`${BUILDING_TYPES[buildingTool].label} placed`)
      return
    }
    if (selectedBuildingId) {
      if (layers.structures.locked) {
        setNotice('Structures layer is locked')
        return
      }
      const selected = map.buildings.find((entry) => entry.id === selectedBuildingId)
      if (!selected) {
        setSelectedBuildingId(null)
        return
      }
      const next = moveBuilding(map, selected.id, target)
      if (next === map) {
        setNotice('Cannot move there')
        return
      }
      commit(next)
      setNotice('Structure moved')
      return
    }
    const hit = buildingAt(map, target)
    if (hit) {
      setSelectedBuildingId(hit.id)
      return
    }
    if (pasteArmed && clipboard) {
      if (layers.terrain.locked) {
        setNotice('Terrain layer is locked')
        return
      }
      commit((current) => pasteRegion(current, clipboard, target))
      setPasteArmed(false)
      setNotice('Region pasted')
      return
    }
    if (noteArmed) {
      if (layers.annotations.locked) {
        setNotice('Annotations layer is locked')
        return
      }
      commit((current) => setAnnotation(current, target, noteText))
      setNotice(noteText.trim() ? 'Note placed' : 'Note cleared')
      return
    }
    if (brush.tool === 'select' || brush.tool === 'lasso') {
      // A plain click in a selection mode clears the current selection.
      setSelection(null)
      return
    }
    const isElevationOp = brush.elevationMode !== 'paint' && brush.mark === 'none'
    if (isElevationOp && layers.elevation.locked) {
      setNotice('Elevation layer is locked')
      return
    }
    if (!isElevationOp && layers.terrain.locked) {
      setNotice('Terrain layer is locked')
      return
    }
    if (brush.tool === 'path') {
      const from = pathAnchor.current
      pathAnchor.current = { col: target.col, row: target.row }
      commit((current) =>
        from
          ? editMapPath(current, from, target, brush)
          : editMapCell(current, target, { ...brush, tool: 'brush' }),
      )
      return
    }
    commit((current) => editMapCell(current, target, brush))
  }

  const resizePreservingMap = () => {
    commit((current) => resizeMapPreservingCells(current, generateMap(settings)))
    setResetToken((value) => value + 1)
    setNotice(`Resized to ${settings.width} × ${settings.height}; existing hexes preserved`)
  }

  const regenerateUnprotected = () => {
    const currentSizeSettings = { ...settings, width: map.width, height: map.height }
    commit((current) =>
      regenerateUnprotectedCells(current, generateMap(currentSizeSettings)),
    )
    setNotice(
      protectedCount > 0
        ? `Regenerated terrain around ${protectedCount} protected hexes`
        : 'Regenerated all terrain; no protected hexes',
    )
  }

  const clearProtections = () => {
    commit((current) => clearCellProtections(current))
    setNotice('Manual-edit protection cleared')
  }

  const importMap = async (file: File | undefined) => {
    if (!file) return
    try {
      const { map: imported, warnings } = parseMapWithWarnings(await file.text())
      replace(imported)
      setSettings((current) => ({
        ...current,
        biome: resolveBiomeId(imported),
        width: imported.width,
        height: imported.height,
        seed: imported.seed,
      }))
      setNotice(
        warnings.length > 0
          ? `Imported ${imported.name} (${warnings.length} recovered)`
          : `Imported ${imported.name}`,
      )
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Import failed')
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  const exportPng = async () => {
    if (!svgRef.current) return
    try {
      await downloadExportPng(svgRef.current, map, exportSettings)
      setNotice('PNG exported')
    } catch {
      setNotice('PNG export failed')
    }
  }

  const exportSvg = () => {
    if (!svgRef.current) return
    try {
      downloadExportSvg(svgRef.current, map, exportSettings)
      setNotice('SVG exported')
    } catch {
      setNotice('SVG export failed')
    }
  }

  const exportPdf = async () => {
    if (!svgRef.current) return
    try {
      await downloadExportPdf(svgRef.current, map, exportSettings)
      setNotice('PDF exported')
    } catch {
      setNotice('PDF export failed')
    }
  }

  const exportPrint = () => {
    if (!svgRef.current) return
    try {
      printExport(svgRef.current, map, exportSettings)
      setNotice('Print preview opened')
    } catch {
      setNotice('Print preview was blocked')
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">⬡</span>
          <div>
            <strong>Battlegrid</strong>
            <span>Cartographic Command</span>
          </div>
        </div>
        <div className="document-title">
          <input
            aria-label="Map name"
            value={map.name}
            onChange={(event) => commit({ ...map, name: event.target.value })}
          />
          <span>{map.width} × {map.height} hexes · local</span>
        </div>
        <nav className="top-actions" aria-label="Map actions">
          <button onClick={undo} disabled={!canUndo} title="Undo" aria-label="Undo">↶</button>
          <button onClick={redo} disabled={!canRedo} title="Redo" aria-label="Redo">↷</button>
          <span className="action-divider" />
          <button onClick={() => importRef.current?.click()}>Import</button>
          <button onClick={() => downloadMap(map)}>Save JSON</button>
          <button className="export-button" onClick={() => openTab('export')}>Export</button>
          <input
            ref={importRef}
            className="hidden-input"
            type="file"
            accept=".json,.battlemap.json,application/json"
            onChange={(event) => importMap(event.target.files?.[0])}
          />
        </nav>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-tabs" role="tablist" aria-label="Editor panels">
            <button
              role="tab"
              aria-selected={activeTab === 'generate'}
              className={activeTab === 'generate' ? 'active' : ''}
              onClick={() => openTab('generate')}
            >
              Generate
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'terrain'}
              className={activeTab === 'terrain' ? 'active' : ''}
              onClick={() => openTab('terrain')}
            >
              Terrain
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'structures'}
              className={activeTab === 'structures' ? 'active' : ''}
              onClick={() => openTab('structures')}
            >
              Structures
              {map.buildings.length > 0 ? ` (${map.buildings.length})` : ''}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'export'}
              className={activeTab === 'export' ? 'active' : ''}
              onClick={() => openTab('export')}
            >
              Export
            </button>
          </div>

          {activeTab === 'generate' && (
            <GeneratorPanel
              settings={settings}
              onChange={(next) => {
                if (next.colorway !== settings.colorway) {
                  commit({
                    ...map,
                    colorway:
                      next.colorway && next.colorway !== 'default' ? next.colorway : undefined,
                  })
                }
                setSettings(next)
              }}
              onBiomeChange={selectBiome}
              onGenerate={() => generate()}
              onResize={resizePreservingMap}
              onRegenerateUnprotected={regenerateUnprotected}
              onClearProtections={clearProtections}
              protectedCount={protectedCount}
              onRandomizeSeed={() => {
                const next = { ...settings, seed: randomSeed() }
                setSettings(next)
                generate(next)
              }}
            />
          )}

          {activeTab === 'terrain' && (
            <>
              <TerrainPalette
                brush={brush}
                biome={biome}
                onChange={setBrush}
                noteText={noteText}
                noteArmed={noteArmed}
                onNoteText={setNoteText}
                onNoteArmed={setNoteArmed}
              />
              {selection && (
                <section className="panel-section region-actions">
                  <div className="section-heading">
                    <span className="eyebrow">Selection</span>
                    <span>{selection.size} hexes</span>
                  </div>
                  <div className="segmented">
                    <button
                      onClick={() => {
                        if (layers.terrain.locked) {
                          setNotice('Terrain layer is locked')
                          return
                        }
                        commit((current) => fillRegion(current, [...selection], brush))
                        setNotice('Region filled')
                      }}
                    >
                      Fill
                    </button>
                    <button
                      onClick={() => {
                        setClipboard(copyRegion(map, [...selection]))
                        setNotice(`Copied ${selection.size} hexes`)
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  <div className="segmented">
                    <button
                      onClick={() => {
                        setClipboard(copyRegion(map, [...selection]))
                        commit((current) => clearRegion(current, [...selection]))
                        setSelection(null)
                        setNotice('Region cut')
                      }}
                    >
                      Cut
                    </button>
                    <button
                      onClick={() => {
                        commit((current) => cropMapToRegion(current, [...selection]))
                        setSelection(null)
                        setResetToken((value) => value + 1)
                        setNotice('Map cropped to selection')
                      }}
                    >
                      Crop
                    </button>
                  </div>
                  <div className="segmented">
                    <button
                      onClick={() => {
                        commit((current) => setProtection(current, [...selection], true))
                        setNotice('Region protected')
                      }}
                    >
                      Protect
                    </button>
                    <button
                      onClick={() => {
                        commit((current) => setProtection(current, [...selection], false))
                        setNotice('Region unprotected')
                      }}
                    >
                      Unprotect
                    </button>
                  </div>
                  <button
                    className="protection-button"
                    onClick={() => {
                      commit((current) => clearRegion(current, [...selection]))
                      setSelection(null)
                      setNotice('Region cleared')
                    }}
                  >
                    Clear region
                  </button>
                </section>
              )}
              <section className="panel-section">
                <div className="section-heading">
                  <span className="eyebrow">Map operations</span>
                </div>
                <div className="segmented">
                  <button
                    onClick={() => {
                      commit((current) => flipMapHorizontal(current))
                      setSelection(null)
                      setNotice('Flipped horizontally')
                    }}
                  >
                    Flip H
                  </button>
                  <button
                    onClick={() => {
                      commit((current) => flipMapVertical(current))
                      setSelection(null)
                      setNotice('Flipped vertically')
                    }}
                  >
                    Flip V
                  </button>
                </div>
                <div className="segmented">
                  <button
                    onClick={() => {
                      commit((current) => rotateMap180(current))
                      setSelection(null)
                      setNotice('Rotated 180°')
                    }}
                  >
                    Rotate 180°
                  </button>
                  <button
                    onClick={() => {
                      commit((current) =>
                        expandMap(
                          current,
                          4,
                          4,
                          generateMap({
                            ...settings,
                            width: Math.min(MAX_MAP_WIDTH, current.width + 4),
                            height: Math.min(MAX_MAP_HEIGHT, current.height + 4),
                          }),
                        ),
                      )
                      setSettings((current) => ({
                        ...current,
                        width: Math.min(MAX_MAP_WIDTH, current.width + 4),
                        height: Math.min(MAX_MAP_HEIGHT, current.height + 4),
                      }))
                      setResetToken((value) => value + 1)
                      setNotice('Map expanded')
                    }}
                  >
                    Expand
                  </button>
                </div>
              </section>
              <section className="panel-section map-intel">
                <div className="section-heading">
                  <span className="eyebrow">Map intelligence</span>
                  <span>{stats.total} hexes</span>
                </div>
                <div className="intel-grid">
                  {(['woods', 'water', 'rough', 'road'] as const).map((terrain) => (
                    <div key={terrain}>
                      <span>{TERRAIN_LABELS[terrain]}</span>
                      <strong>
                        {Math.round(
                          ((stats.terrain[terrain] +
                            (terrain === 'woods' ? stats.terrain.heavyWoods : 0)) /
                            stats.total) *
                            100,
                        )}%
                      </strong>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'structures' && (
            <BuildingsPanel
              armed={buildingTool}
              onArm={(type) => {
                setBuildingTool(type)
                setSelectedBuildingId(null)
              }}
              selected={selectedBuilding}
              placedCount={map.buildings.length}
              onRotate={() =>
                selectedBuildingId &&
                commit((current) => rotateBuilding(current, selectedBuildingId))
              }
              onDuplicate={() =>
                selectedBuildingId &&
                commit((current) => duplicateBuilding(current, selectedBuildingId))
              }
              onDelete={() => {
                if (!selectedBuildingId) return
                commit((current) => deleteBuilding(current, selectedBuildingId))
                setSelectedBuildingId(null)
                setNotice('Structure deleted')
              }}
              onStateChange={(state) =>
                selectedBuildingId &&
                commit((current) => setBuildingState(current, selectedBuildingId, state))
              }
              onLabelChange={(label) =>
                selectedBuildingId &&
                commit((current) => setBuildingLabel(current, selectedBuildingId, label))
              }
              onDeselect={() => setSelectedBuildingId(null)}
            />
          )}

          {activeTab === 'export' && (
            <ExportPanel
              settings={exportSettings}
              buildingCount={map.buildings.length}
              mapWidth={map.width}
              mapHeight={map.height}
              onChange={setExportSettings}
              onDownloadPng={() => void exportPng()}
              onDownloadSvg={exportSvg}
              onDownloadPdf={() => void exportPdf()}
              onPrint={exportPrint}
            />
          )}
        </aside>

        <section className="map-workspace">
          <div className="map-toolbar">
            <div>
              <span className="live-indicator" />
              <span>{notice}</span>
            </div>
            <div>
              <button
                className={showGrid ? 'active' : ''}
                onClick={() => setShowGrid((value) => !value)}
              >
                Grid
              </button>
              <button
                className={hexNumbering !== 'off' ? 'active' : ''}
                onClick={() => setHexNumbering(nextHexNumbering)}
                title="Cycle hex numbering"
              >
                {hexNumbering === 'off' ? 'Coords' : HEX_NUMBERING_LABELS[hexNumbering]}
              </button>
              <button
                className={showElevationLabels ? 'active' : ''}
                onClick={() => setShowElevationLabels((value) => !value)}
              >
                Levels
              </button>
              <button
                className={showTerrainTags ? 'active' : ''}
                onClick={() => setShowTerrainTags((value) => !value)}
                title="Show forest tags"
              >
                Tags
              </button>
              <button
                className={showProtected ? 'active' : ''}
                onClick={() => setShowProtected((value) => !value)}
                title="Show protected hexes"
              >
                Protected
              </button>
              <button
                className={showLegend ? 'active' : ''}
                onClick={() => setShowLegend((value) => !value)}
                aria-pressed={showLegend}
                title="Show on-map terrain legend"
              >
                Legend
              </button>
              <button
                className={showElevationKey ? 'active' : ''}
                onClick={() => setShowElevationKey((value) => !value)}
                aria-pressed={showElevationKey}
                title="Show on-map elevation key"
              >
                Elev key
              </button>
              <button
                className={wheelZoom ? 'active' : ''}
                onClick={() => setWheelZoom((value) => !value)}
                aria-pressed={wheelZoom}
                title="Zoom the map with the mouse wheel"
              >
                Wheel
              </button>
              <span className="action-divider" />
              <span className="layer-chips" role="group" aria-label="Layers">
                {EDIT_LAYERS.map((layer) => {
                  const state = layers[layer]
                  const short = { terrain: 'TER', elevation: 'ELV', structures: 'STR', annotations: 'ANN' }[layer]
                  return (
                    <span
                      key={layer}
                      className={`layer-chip ${state.locked ? 'locked' : ''}`}
                      title={layer}
                    >
                      <button
                        className={state.visible ? 'on' : ''}
                        aria-label={`${layer} visibility`}
                        onClick={() => toggleLayer(layer, 'visible')}
                      >
                        {state.visible ? '◉' : '○'}
                      </button>
                      <span>{short}</span>
                      <button
                        className={state.locked ? 'on' : ''}
                        aria-label={`${layer} lock`}
                        onClick={() => toggleLayer(layer, 'locked')}
                      >
                        L
                      </button>
                    </span>
                  )
                })}
              </span>
              <button onClick={() => setResetToken((value) => value + 1)}>Fit map</button>
              <button onClick={() => generate()}>Regenerate</button>
            </div>
          </div>
          <HexMap
            map={map}
            svgRef={svgRef}
            resetToken={resetToken}
            onPaint={mapClick}
            onStrokeEnd={() => {
              pathAnchor.current = null
            }}
            allowDragPaint={
              (brush.tool === 'brush' ||
                brush.tool === 'scatter' ||
                brush.tool === 'rubble' ||
                brush.tool === 'path') &&
              !buildingTool &&
              !selectedBuildingId &&
              !noteArmed
            }
            selectTool={brush.tool === 'select' || brush.tool === 'lasso' ? brush.tool : null}
            selection={selection}
            onSelectRegion={(keys) => setSelection(keys.length > 0 ? new Set(keys) : null)}
            pastePreview={
              pasteArmed && clipboard
                ? { width: clipboard.width, height: clipboard.height }
                : null
            }
            showGrid={showGrid}
            hexNumbering={hexNumbering}
            showElevationLabels={showElevationLabels}
            showProtected={showProtected}
            showTerrainTags={showTerrainTags}
            layerVisibility={{
              terrain: layers.terrain.visible,
              elevation: layers.elevation.visible,
              structures: layers.structures.visible,
              annotations: layers.annotations.visible,
            }}
            buildingTool={buildingTool}
            selectedBuildingId={selectedBuildingId}
            onSelectBuilding={(id) => {
              setBuildingTool(null)
              setSelectedBuildingId(id)
              setActiveTab('structures')
              setNotice('Structure selected')
            }}
            highlightRadius={
              (brush.tool === 'brush' || brush.tool === 'scatter' || brush.tool === 'rubble') &&
              !buildingTool
                ? brush.size - 1
                : 0
            }
            wheelZoom={wheelZoom}
            showLegend={showLegend}
            showElevationKey={showElevationKey}
          />
        </section>
      </div>
    </main>
  )
}

export default App
