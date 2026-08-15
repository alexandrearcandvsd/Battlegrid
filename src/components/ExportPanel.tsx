import {
  HEX_NUMBERING_MODES,
  PAGE_ORIENTATIONS,
  PAPER_SIZES,
  PNG_SCALES,
  PRINT_SCALES,
  type ExportSettings,
} from '../types/export'
import { HEX_NUMBERING_LABELS } from '../lib/hexNumbering'
import { exportRasterPreview } from '../lib/printLayout'

const PAPER_LABELS = {
  letter: 'US Letter',
  tabloid: 'Tabloid',
  a4: 'A4',
  a3: 'A3',
  a2: 'A2',
  a1: 'A1',
} as const

const PNG_LABELS = {
  1: '1× draft',
  2: '2× standard',
  3: '3× high',
  4: '4× print',
  10: '10× fine print',
} as const

function formatPixels(value: number) {
  return value.toLocaleString('en-US')
}

interface Props {
  settings: ExportSettings
  buildingCount: number
  mapWidth: number
  mapHeight: number
  onChange: (settings: ExportSettings) => void
  onDownloadPng: () => void
  onDownloadSvg: () => void
  onDownloadPdf: () => void
  onPrint: () => void
}

export function ExportPanel({
  settings,
  buildingCount,
  mapWidth,
  mapHeight,
  onChange,
  onDownloadPng,
  onDownloadSvg,
  onDownloadPdf,
  onPrint,
}: Props) {
  const update = <Key extends keyof ExportSettings>(key: Key, value: ExportSettings[Key]) =>
    onChange({ ...settings, [key]: value })
  const raster = exportRasterPreview(settings, { width: mapWidth, height: mapHeight })
  const rasterLabel = `${formatPixels(raster.width)} × ${formatPixels(raster.height)} px`
  const pageLabel =
    raster.mapPages > 1 ? `each of ${raster.mapPages} map pages` : 'the map page'

  return (
    <section className="panel-section">
      <div className="section-heading">
        <span className="eyebrow">Table export</span>
        <span className="status-dot">Print</span>
      </div>
      <p className="export-lead">
        Tabletop scale prints 1.25 in hexes for miniatures. Print at 100% / actual size. SVG stays
        editable.
      </p>

      <div className="field-row">
        <div>
          <label className="field-label" htmlFor="export-paper">
            Paper
          </label>
          <select
            id="export-paper"
            className="panel-select"
            value={settings.paper}
            onChange={(event) => update('paper', event.target.value as ExportSettings['paper'])}
          >
            {PAPER_SIZES.map((size) => (
              <option key={size} value={size}>
                {PAPER_LABELS[size]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="export-orientation">
            Orientation
          </label>
          <select
            id="export-orientation"
            className="panel-select"
            value={settings.orientation}
            onChange={(event) =>
              update('orientation', event.target.value as ExportSettings['orientation'])
            }
          >
            {PAGE_ORIENTATIONS.map((orientation) => (
              <option key={orientation} value={orientation}>
                {orientation === 'landscape' ? 'Landscape' : 'Portrait'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div>
          <label className="field-label" htmlFor="export-png-scale">
            PNG resolution
          </label>
          <select
            id="export-png-scale"
            className="panel-select"
            value={settings.pngScale}
            onChange={(event) =>
              update('pngScale', Number(event.target.value) as ExportSettings['pngScale'])
            }
          >
            {PNG_SCALES.map((scale) => (
              <option key={scale} value={scale}>
                {PNG_LABELS[scale]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="export-numbering">
            Hex numbers
          </label>
          <select
            id="export-numbering"
            className="panel-select"
            value={settings.numbering}
            onChange={(event) =>
              update('numbering', event.target.value as ExportSettings['numbering'])
            }
          >
            {HEX_NUMBERING_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {HEX_NUMBERING_LABELS[mode]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {settings.pngScale === 10 && (
        <p className="export-scale-note" role="status">
          10× fine print rasterizes {pageLabel} at {rasterLabel}
          {raster.dpi ? ` (~${raster.dpi} dpi)` : ''}. PNG and PDF can take a while and use a lot of
          memory. SVG is unchanged.
        </p>
      )}

      <div className="field-row">
        <div>
          <label className="field-label" htmlFor="export-print-scale">
            Hex size
          </label>
          <select
            id="export-print-scale"
            className="panel-select"
            value={settings.printScale}
            onChange={(event) =>
              update('printScale', event.target.value as ExportSettings['printScale'])
            }
          >
            {PRINT_SCALES.map((scale) => (
              <option key={scale} value={scale}>
                {scale === 'tabletop' ? 'Tabletop · 1.25 in' : 'Fit to page'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="export-sheet-layout">
            Sheet layout
          </label>
          <select
            id="export-sheet-layout"
            className="panel-select"
            value={settings.sheetLayout}
            onChange={(event) =>
              update('sheetLayout', event.target.value as ExportSettings['sheetLayout'])
            }
          >
            <option value="standard">Standard</option>
            <option value="compact">Compact</option>
          </select>
        </div>
      </div>

      {settings.printScale === 'tabletop' && (
        <p className="export-hex-note">
          Hexes print at 1.25 in (31.75 mm) flat-to-flat, the CGL / FASA tabletop size. Print at
          100% / actual size — do not scale to fit. This map is {raster.mapPages} map{' '}
          {raster.mapPages === 1 ? 'page' : 'pages'}
          {raster.mapPages > 1 ? '; tabloid, A3, A2, or A1 means fewer sheets' : ''}.
        </p>
      )}

      <p className="field-label export-group-label">On the map</p>
      <div className="toggle-row export-toggles">
        <label>
          <input
            type="checkbox"
            checked={settings.includeElevation}
            onChange={(event) => update('includeElevation', event.target.checked)}
          />
          <span>Elevation</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.includeBuildings}
            onChange={(event) => update('includeBuildings', event.target.checked)}
          />
          <span>Buildings</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.includeFeatures}
            onChange={(event) => update('includeFeatures', event.target.checked)}
          />
          <span>Hex marks</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.includeAnnotations}
            onChange={(event) => update('includeAnnotations', event.target.checked)}
          />
          <span>Notes</span>
        </label>
      </div>

      <p className="field-label export-group-label">On the sheet</p>
      <div className="toggle-row export-toggles">
        <label>
          <input
            type="checkbox"
            checked={settings.includeChrome}
            onChange={(event) => update('includeChrome', event.target.checked)}
          />
          <span>Page layout</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.includeLegend}
            onChange={(event) => update('includeLegend', event.target.checked)}
            disabled={!settings.includeChrome}
          />
          <span>Terrain legend</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.includeElevationKey}
            onChange={(event) => update('includeElevationKey', event.target.checked)}
            disabled={!settings.includeChrome}
          />
          <span>Elevation key</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.includeBuildingSheet}
            onChange={(event) => update('includeBuildingSheet', event.target.checked)}
          />
          <span>Building sheet{buildingCount > 0 ? ` (${buildingCount})` : ''}</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.terrainMarks}
            onChange={(event) => update('terrainMarks', event.target.checked)}
          />
          <span>Terrain marks</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.grayscale}
            onChange={(event) => update('grayscale', event.target.checked)}
          />
          <span>Grayscale</span>
        </label>
      </div>

      <div className="export-actions">
        <button className="primary-button" type="button" onClick={onDownloadPng}>
          Download PNG
        </button>
        <div className="export-actions-row">
          <button type="button" onClick={onDownloadSvg}>
            Download SVG
          </button>
          <button type="button" onClick={onDownloadPdf}>
            Download PDF
          </button>
          <button type="button" onClick={onPrint}>
            Print
          </button>
        </div>
      </div>
    </section>
  )
}
