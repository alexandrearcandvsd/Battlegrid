import type { BiomeId } from '../types/biome'
import {
  COLORWAY_LABELS,
  COLORWAYS,
  MAX_MAP_HEIGHT,
  MAX_MAP_WIDTH,
  MIN_MAP_SIZE,
  type GeneratorSettings,
} from '../types/map'
import { getBiome, listBiomes } from '../lib/biomes'
import {
  MAP_TEMPLATES,
  TERRAIN_PRESETS,
  URBAN_PRESETS,
  matchMapTemplate,
  matchTerrainPreset,
} from '../lib/presets'

interface Props {
  settings: GeneratorSettings
  onChange: (settings: GeneratorSettings) => void
  onBiomeChange: (biome: BiomeId) => void
  onGenerate: () => void
  onResize: () => void
  onRegenerateUnprotected: () => void
  onClearProtections: () => void
  onRandomizeSeed: () => void
  protectedCount: number
}

export function GeneratorPanel({
  settings,
  onChange,
  onBiomeChange,
  onGenerate,
  onResize,
  onRegenerateUnprotected,
  onClearProtections,
  onRandomizeSeed,
  protectedCount,
}: Props) {
  const update = <Key extends keyof GeneratorSettings>(
    key: Key,
    value: GeneratorSettings[Key],
  ) => onChange({ ...settings, [key]: value })

  const updateTerrain = (key: keyof GeneratorSettings['terrain'], value: number) =>
    onChange({ ...settings, terrain: { ...settings.terrain, [key]: value } })

  return (
    <section className="panel-section">
      <div className="section-heading">
        <span className="eyebrow">Generator</span>
        <span className="status-dot">Seeded</span>
      </div>

      <label className="field-label" htmlFor="biome">
        Biome
      </label>
      <select
        id="biome"
        className="panel-select"
        value={settings.biome}
        onChange={(event) => onBiomeChange(event.target.value as BiomeId)}
      >
        {listBiomes().map((biome) => (
          <option key={biome.id} value={biome.id}>
            {biome.label}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor="colorway">
        Colorway
      </label>
      <select
        id="colorway"
        className="panel-select"
        value={settings.colorway ?? 'default'}
        onChange={(event) => update('colorway', event.target.value as GeneratorSettings['colorway'])}
      >
        {COLORWAYS.map((colorway) => (
          <option key={colorway} value={colorway}>
            {COLORWAY_LABELS[colorway]}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor="map-size">
        Map size
      </label>
      <select
        id="map-size"
        className="panel-select"
        value={matchMapTemplate(settings.width, settings.height)}
        onChange={(event) => {
          const template = MAP_TEMPLATES.find((entry) => entry.id === event.target.value)
          if (template) {
            onChange({ ...settings, width: template.width, height: template.height })
          }
        }}
      >
        <option value="custom" disabled>
          Custom
        </option>
        {MAP_TEMPLATES.map((template) => (
          <option key={template.id} value={template.id}>
            {template.label}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor="terrain-preset">
        Terrain preset
      </label>
      <select
        id="terrain-preset"
        className="panel-select"
        value={matchTerrainPreset(settings.terrain, getBiome(settings.biome).generation.defaults)}
        onChange={(event) => {
          const preset = TERRAIN_PRESETS.find((entry) => entry.id === event.target.value)
          if (!preset) return
          const defaults = getBiome(settings.biome).generation.defaults
          const terrain = preset.terrain ?? {
            woods: defaults.woods,
            water: defaults.water,
            rough: defaults.rough,
          }
          onChange({ ...settings, terrain })
        }}
      >
        <option value="custom" disabled>
          Custom
        </option>
        {TERRAIN_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>

      <div className="toggle-row">
        <label>
          <input
            type="checkbox"
            checked={settings.symmetric}
            onChange={(event) => update('symmetric', event.target.checked)}
          />
          <span>Symmetric terrain</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.river}
            onChange={(event) => update('river', event.target.checked)}
          />
          <span>River crossing</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={Boolean(settings.roadNetwork)}
            disabled={getBiome(settings.biome).generation.road === 'none'}
            onChange={(event) => update('roadNetwork', event.target.checked)}
          />
          <span>Road network</span>
        </label>
      </div>

      {getBiome(settings.biome).generation.districts && (
        <>
          <label className="field-label" htmlFor="urban-preset">
            {settings.biome === 'urban' ? 'Urban density' : 'District density'}
          </label>
          <select
            id="urban-preset"
            className="panel-select"
            value={settings.urbanPreset ?? 'settlement'}
            onChange={(event) => update('urbanPreset', event.target.value)}
          >
            {URBAN_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </>
      )}

      <label className="field-label" htmlFor="seed">
        Operation seed
      </label>
      <div className="input-action">
        <input
          id="seed"
          value={settings.seed}
          onChange={(event) => update('seed', event.target.value)}
          spellCheck={false}
        />
        <button
          className="icon-button"
          onClick={onRandomizeSeed}
          title="Random seed"
          aria-label="Random seed"
        >
          ↻
        </button>
      </div>

      <div className="field-row">
        <label>
          <span>Columns</span>
          <input
            type="number"
            min={MIN_MAP_SIZE}
            max={MAX_MAP_WIDTH}
            value={settings.width}
            onChange={(event) => update('width', Number(event.target.value))}
          />
        </label>
        <label>
          <span>Rows</span>
          <input
            type="number"
            min={MIN_MAP_SIZE}
            max={MAX_MAP_HEIGHT}
            value={settings.height}
            onChange={(event) => update('height', Number(event.target.value))}
          />
        </label>
      </div>

      <div className="range-list">
        {(
          [
            ['woods', 'Woods'],
            ['water', 'Water'],
            ['rough', 'Rough'],
          ] as const
        ).map(([key, label]) => (
          <label className="range-field" key={key}>
            <span>{label}</span>
            <input
              type="range"
              min={0}
              max={45}
              value={settings.terrain[key]}
              onChange={(event) => updateTerrain(key, Number(event.target.value))}
            />
            <output>{settings.terrain[key]}%</output>
          </label>
        ))}
        <label className="range-field">
          <span>Road</span>
          <input
            type="range"
            min={0}
            max={100}
            aria-label="Road"
            disabled={getBiome(settings.biome).generation.road === 'none'}
            value={settings.roadChance ?? 100}
            onChange={(event) => update('roadChance', Number(event.target.value))}
          />
          <output>{settings.roadChance ?? 100}%</output>
        </label>
        <label className="range-field">
          <span>Relief</span>
          <input
            type="range"
            min={0}
            max={4}
            value={settings.elevation}
            onChange={(event) => update('elevation', Number(event.target.value))}
          />
          <output>{settings.elevation}</output>
        </label>
      </div>

      <button className="primary-button" onClick={onGenerate}>
        <span>Generate battlefield</span>
        <span>⌘ G</span>
      </button>
      <div className="generator-secondary-actions">
        <button onClick={onResize}>Resize, keep map</button>
        <button onClick={onRegenerateUnprotected}>
          Regenerate unprotected
        </button>
      </div>
      <button
        className="protection-button"
        onClick={onClearProtections}
        disabled={protectedCount === 0}
      >
        Clear {protectedCount} protected hex{protectedCount === 1 ? '' : 'es'}
      </button>
    </section>
  )
}
