import { useRef } from 'react'
import { BUILDING_TYPES, BUILDING_TYPE_IDS } from '../lib/buildings'
import {
  BUILDING_STATES,
  BUILDING_STATE_LABELS,
  CONSTRUCTION_LABELS,
  type Building,
  type BuildingCategory,
  type BuildingType,
} from '../types/building'

interface Props {
  armed: BuildingType | null
  onArm: (type: BuildingType | null) => void
  selected: Building | null
  placedCount: number
  onRotate: () => void
  onDuplicate: () => void
  onDelete: () => void
  onStateChange: (state: Building['state']) => void
  onLabelChange: (label: string) => void
  onPickImage: (file: File) => void
  onClearImage: () => void
  onApplyImageToType: () => void
  onDeselect: () => void
}

export function BuildingsPanel({
  armed,
  onArm,
  selected,
  placedCount,
  onRotate,
  onDuplicate,
  onDelete,
  onStateChange,
  onLabelChange,
  onPickImage,
  onClearImage,
  onApplyImageToType,
  onDeselect,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedDefinition = selected ? BUILDING_TYPES[selected.type] : null
  const categories: BuildingCategory[] = ['civilian', 'industrial', 'military', 'infrastructure']
  const categoryLabels: Record<BuildingCategory, string> = {
    civilian: 'Civilian',
    industrial: 'Industrial',
    military: 'Military',
    infrastructure: 'Infrastructure',
  }
  return (
    <section className="panel-section">
      <div className="section-heading">
        <span className="eyebrow">Structures</span>
        <span>{placedCount} placed</span>
      </div>

      {!selected && (
        <div className="building-catalog">
          {categories.map((category) => (
            <div key={category} className="building-category">
              <span className="field-label">{categoryLabels[category]}</span>
              <div className="building-grid">
                {BUILDING_TYPE_IDS.filter((type) => BUILDING_TYPES[type].category === category).map(
                  (type) => {
                    const definition = BUILDING_TYPES[type]
                    return (
                      <button
                        key={type}
                        className={`building-button ${armed === type ? 'active' : ''}`}
                        title={`${definition.label} — height ${definition.height}, CF ${definition.constructionFactor}`}
                        onClick={() => onArm(armed === type ? null : type)}
                      >
                        <span>{definition.label}</span>
                        <kbd>
                          CF {definition.constructionFactor} · H{definition.height}
                        </kbd>
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && selectedDefinition && (
        <div className="building-edit">
          <div className="building-edit-heading">{selectedDefinition.label}</div>
          <p className="building-meta">
            {CONSTRUCTION_LABELS[selectedDefinition.constructionType]} · H{selectedDefinition.height} · CF{' '}
            {selectedDefinition.constructionFactor}
          </p>
          <label className="field-label" htmlFor="building-label">
            Label
          </label>
          <input
            key={selected.id}
            id="building-label"
            defaultValue={selected.label ?? ''}
            placeholder="e.g. Supply Depot"
            onBlur={(event) => onLabelChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur()
            }}
          />
          <span className="field-label">Graphic</span>
          <p className="building-graphic-status">
            {selected.image ? 'Custom image' : 'Default stamp'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="building-graphic-input"
            aria-label="Choose a building graphic file"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) onPickImage(file)
            }}
          />
          <div className="segmented">
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              Replace graphic
            </button>
            <button type="button" onClick={onClearImage} disabled={!selected.image}>
              Restore default
            </button>
          </div>
          <button type="button" className="protection-button" onClick={onApplyImageToType}>
            Use for every {selectedDefinition.label}
          </button>
          <p className="building-note">PNG, JPEG, or WebP. Clipped to the stamp and stored in the map file.</p>
          <div className="segmented">
            <button onClick={onRotate} title="Rotate 60° (R)">
              Rotate
            </button>
            <button onClick={onDuplicate} title="Duplicate (D)">
              Duplicate
            </button>
          </div>
          <div className="segmented feature-marks">
            {BUILDING_STATES.map((state) => (
              <button
                key={state}
                className={
                  selected.state === state ||
                  (state === 'heavilyDamaged' && selected.state === 'damaged')
                    ? 'active'
                    : ''
                }
                onClick={() => onStateChange(state)}
              >
                {BUILDING_STATE_LABELS[state]}
              </button>
            ))}
          </div>
          <button className="protection-button" onClick={onDelete} title="Delete (Del)">
            Delete structure
          </button>
          <button className="protection-button" onClick={onDeselect} title="Done (Esc)">
            Done
          </button>
          <p className="building-note">Click an empty hex to move the selected structure.</p>
        </div>
      )}
    </section>
  )
}
