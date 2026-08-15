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
  onDeselect,
}: Props) {
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
