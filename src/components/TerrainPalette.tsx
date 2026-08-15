import { useEffect, useState } from 'react'
import type { BiomeDefinition } from '../types/biome'
import { TERRAIN_VARIANTS } from '../lib/variants'
import {
  CELL_FEATURES,
  FEATURE_LABELS,
  MAX_ELEVATION,
  TERRAIN_LABELS,
  TERRAIN_TYPES,
  type BrushSettings,
  type TerrainType,
} from '../types/map'

type TerrainSubTab = 'tools' | 'marks' | 'elevation'

interface Props {
  brush: BrushSettings
  biome: BiomeDefinition
  onChange: (brush: BrushSettings) => void
  noteText?: string
  noteArmed?: boolean
  onNoteText?: (text: string) => void
  onNoteArmed?: (armed: boolean) => void
}

export function TerrainPalette({
  brush,
  biome,
  onChange,
  noteText = '',
  noteArmed = false,
  onNoteText,
  onNoteArmed,
}: Props) {
  const [category, setCategory] = useState<TerrainType>(brush.terrain)
  const [subTab, setSubTab] = useState<TerrainSubTab>('tools')

  // Keep the visible category aligned with the active brush (hotkeys, variants).
  useEffect(() => {
    setCategory(brush.terrain)
  }, [brush.terrain])

  const selectTerrain = (terrain: TerrainType) =>
    onChange({ ...brush, terrain, skin: undefined, elevationMode: 'paint', mark: 'none' })

  const selectVariant = (skin: string, terrain: TerrainType) =>
    onChange({ ...brush, terrain, skin, tool: 'brush', elevationMode: 'paint', mark: 'none' })

  const selectMark = (mark: BrushSettings['mark']) =>
    onChange({ ...brush, mark, tool: 'brush', elevationMode: 'paint' })

  const categoryMeta = biome.palette[category]
  const universal = TERRAIN_LABELS[category]
  // The map's own biome is covered by the native tile; variants are imports.
  const categoryVariants = TERRAIN_VARIANTS.filter(
    (variant) => variant.terrain === category && variant.biomeId !== biome.id,
  )
  const universalActive =
    brush.terrain === category && !brush.skin && brush.elevationMode === 'paint'

  const radiusEnabled = brush.tool === 'brush' || brush.tool === 'scatter' || brush.tool === 'rubble'
  const radiusControls = (forceBrush = false) => (
    <div className={`brush-controls ${forceBrush || radiusEnabled ? '' : 'disabled-control'}`}>
      <span className="field-label">Brush radius</span>
      <div className="segmented">
        <button
          disabled={!forceBrush && !radiusEnabled}
          className={brush.size === 1 ? 'active' : ''}
          onClick={() => onChange({ ...brush, size: 1, ...(forceBrush ? { tool: 'brush' as const } : {}) })}
        >
          Single
        </button>
        <button
          disabled={!forceBrush && !radiusEnabled}
          className={brush.size === 2 ? 'active' : ''}
          onClick={() => onChange({ ...brush, size: 2, ...(forceBrush ? { tool: 'brush' as const } : {}) })}
        >
          Cluster
        </button>
      </div>
    </div>
  )

  return (
    <section className="panel-section terrain-panel">
      <div className="section-heading">
        <span className="eyebrow">Map tools</span>
        {subTab === 'tools' ? <span className="shortcut-hint">1–7</span> : null}
      </div>
      <div className="terrain-subtabs" role="tablist" aria-label="Terrain sections">
        <button
          role="tab"
          aria-selected={subTab === 'tools'}
          className={subTab === 'tools' ? 'active' : ''}
          onClick={() => setSubTab('tools')}
        >
          Tools
        </button>
        <button
          role="tab"
          aria-selected={subTab === 'marks'}
          className={subTab === 'marks' ? 'active' : ''}
          onClick={() => setSubTab('marks')}
        >
          Marks
        </button>
        <button
          role="tab"
          aria-selected={subTab === 'elevation'}
          className={subTab === 'elevation' ? 'active' : ''}
          onClick={() => setSubTab('elevation')}
        >
          Elevation
        </button>
      </div>

      {subTab === 'tools' ? (
        <>
          <div className="tool-selector">
            <span className="field-label">Terrain tool</span>
            <div className="segmented">
              <button
                className={brush.tool === 'brush' ? 'active' : ''}
                onClick={() => onChange({ ...brush, tool: 'brush' })}
              >
                Brush
              </button>
              <button
                className={brush.tool === 'fill' ? 'active' : ''}
                onClick={() =>
                  onChange({ ...brush, tool: 'fill', elevationMode: 'paint', mark: 'none' })
                }
              >
                Fill region
              </button>
              <button
                className={brush.tool === 'select' ? 'active' : ''}
                onClick={() => onChange({ ...brush, tool: 'select' })}
              >
                Select
              </button>
              <button
                className={brush.tool === 'lasso' ? 'active' : ''}
                onClick={() => onChange({ ...brush, tool: 'lasso' })}
              >
                Lasso
              </button>
              <button
                className={brush.tool === 'scatter' ? 'active' : ''}
                onClick={() => onChange({ ...brush, tool: 'scatter' })}
              >
                Scatter
              </button>
              <button
                className={brush.tool === 'rubble' ? 'active' : ''}
                onClick={() => onChange({ ...brush, tool: 'rubble' })}
              >
                Rubble
              </button>
              <button
                className={brush.tool === 'path' ? 'active' : ''}
                onClick={() => onChange({ ...brush, tool: 'path' })}
              >
                Path
              </button>
            </div>
          </div>

          <div className="terrain-categories" role="tablist" aria-label="Terrain categories">
            {TERRAIN_TYPES.map((terrain, index) => (
              <button
                key={terrain}
                role="tab"
                aria-selected={category === terrain}
                className={category === terrain ? 'active' : ''}
                title={`${TERRAIN_LABELS[terrain]} — key ${index + 1}`}
                onClick={() => setCategory(terrain)}
              >
                {TERRAIN_LABELS[terrain]}
              </button>
            ))}
          </div>

          <div className="terrain-grid">
            <button
              className={`terrain-button ${universalActive ? 'active' : ''}`}
              onClick={() => selectTerrain(category)}
              title={`${universal} — native to the map's biome`}
            >
              <span
                className={`terrain-swatch swatch-${category}`}
                style={{ '--terrain-color': categoryMeta.color } as React.CSSProperties}
              />
              <span className="terrain-names">
                <span>{universal}</span>
                <small>{categoryMeta.label !== universal ? categoryMeta.label : 'Native'}</small>
              </span>
            </button>
            {categoryVariants.map((variant) => (
              <button
                key={variant.id}
                className={`terrain-button variant-tile ${brush.skin === variant.id && brush.elevationMode === 'paint' ? 'active' : ''}`}
                title={`${variant.label} — paints ${universal}`}
                onClick={() => selectVariant(variant.id, variant.terrain)}
              >
                <span
                  className="terrain-swatch"
                  style={{ '--terrain-color': variant.color } as React.CSSProperties}
                />
                <span className="terrain-names">
                  <span>{variant.label}</span>
                </span>
              </button>
            ))}
          </div>

          {radiusControls()}

          <div className="brush-controls">
            <span className="field-label">Annotation note</span>
            <div className="input-action">
              <input
                aria-label="Note text"
                value={noteText}
                placeholder="e.g. Objective A"
                onChange={(event) => onNoteText?.(event.target.value)}
              />
              <button
                className="icon-button"
                aria-label="Place note"
                aria-pressed={noteArmed}
                title={noteArmed ? 'Placing notes (Esc to stop)' : 'Place notes'}
                onClick={() => onNoteArmed?.(!noteArmed)}
              >
                ✎
              </button>
            </div>
          </div>
        </>
      ) : null}

      {subTab === 'marks' ? (
        <>
          <div className="brush-controls feature-mark-editor">
            <span className="field-label">Feature mark</span>
            <div className="segmented feature-marks">
              {(
                [
                  ['none', 'None'],
                  ...CELL_FEATURES.map((feature) => [feature, FEATURE_LABELS[feature]] as const),
                ] as const
              ).map(([mark, label]) => (
                <button
                  key={mark}
                  className={brush.mark === mark && brush.elevationMode === 'paint' && brush.tool === 'brush' ? 'active' : ''}
                  title={mark === 'none' ? 'Paint terrain' : `Paint ${mark} marks; click a marked hex again to clear`}
                  onClick={() => selectMark(mark)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {radiusControls(true)}
        </>
      ) : null}

      {subTab === 'elevation' ? (
        <>
          <div className="elevation-editor">
            <div className="elevation-level-heading">
              <span className="field-label">Elevation level</span>
              <output>{brush.targetElevation}</output>
            </div>
            <input
              aria-label="Elevation level"
              type="range"
              min={0}
              max={MAX_ELEVATION}
              value={brush.targetElevation}
              onChange={(event) =>
                onChange({
                  ...brush,
                  tool: 'brush',
                  elevationMode: 'set',
                  targetElevation: Number(event.target.value),
                  mark: 'none',
                })
              }
            />
          </div>

          <div className="elevation-actions three-way">
            <button
              className={brush.elevationMode === 'lower' ? 'active' : ''}
              onClick={() =>
                onChange({ ...brush, tool: 'brush', elevationMode: 'lower', mark: 'none' })
              }
            >
              − Lower
            </button>
            <button
              className={brush.elevationMode === 'set' ? 'active' : ''}
              onClick={() =>
                onChange({ ...brush, tool: 'brush', elevationMode: 'set', mark: 'none' })
              }
            >
              Set {brush.targetElevation}
            </button>
            <button
              className={brush.elevationMode === 'raise' ? 'active' : ''}
              onClick={() =>
                onChange({ ...brush, tool: 'brush', elevationMode: 'raise', mark: 'none' })
              }
            >
              + Raise
            </button>
          </div>
          {radiusControls(true)}
        </>
      ) : null}
    </section>
  )
}
