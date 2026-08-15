// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_EXPORT_SETTINGS, type ExportSettings } from '../types/export'
import { ExportPanel } from './ExportPanel'

afterEach(cleanup)

function renderPanel(
  overrides: {
    settings?: ExportSettings
    buildingCount?: number
    onChange?: (settings: ExportSettings) => void
    onDownloadPng?: () => void
    onDownloadSvg?: () => void
    onDownloadPdf?: () => void
    onPrint?: () => void
  } = {},
) {
  return render(
    <ExportPanel
      settings={overrides.settings ?? DEFAULT_EXPORT_SETTINGS}
      buildingCount={overrides.buildingCount ?? 2}
      mapWidth={16}
      mapHeight={17}
      onChange={overrides.onChange ?? vi.fn()}
      onDownloadPng={overrides.onDownloadPng ?? vi.fn()}
      onDownloadSvg={overrides.onDownloadSvg ?? vi.fn()}
      onDownloadPdf={overrides.onDownloadPdf ?? vi.fn()}
      onPrint={overrides.onPrint ?? vi.fn()}
    />,
  )
}

describe('ExportPanel', () => {
  it('lets the user change paper, numbering, and grayscale', () => {
    const onChange = vi.fn()
    renderPanel({ onChange })

    fireEvent.change(screen.getByLabelText('Paper'), { target: { value: 'a4' } })
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, paper: 'a4' })

    fireEvent.change(screen.getByLabelText('Paper'), { target: { value: 'a2' } })
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, paper: 'a2' })

    fireEvent.change(screen.getByLabelText('Paper'), { target: { value: 'a1' } })
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, paper: 'a1' })

    fireEvent.change(screen.getByLabelText('Hex numbers'), { target: { value: 'axial' } })
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, numbering: 'axial' })

    fireEvent.click(screen.getByLabelText('Grayscale'))
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, grayscale: true })

    fireEvent.change(screen.getByLabelText('PNG resolution'), { target: { value: '10' } })
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, pngScale: 10 })

    fireEvent.change(screen.getByLabelText('Hex size'), { target: { value: 'fit' } })
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, printScale: 'fit' })
  })

  it('runs PNG, SVG, PDF, and print actions', () => {
    const onDownloadPng = vi.fn()
    const onDownloadSvg = vi.fn()
    const onDownloadPdf = vi.fn()
    const onPrint = vi.fn()
    renderPanel({
      buildingCount: 0,
      onDownloadPng,
      onDownloadSvg,
      onDownloadPdf,
      onPrint,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Download PNG' }))
    fireEvent.click(screen.getByRole('button', { name: 'Download SVG' }))
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))
    fireEvent.click(screen.getByRole('button', { name: 'Print' }))

    expect(onDownloadPng).toHaveBeenCalledOnce()
    expect(onDownloadSvg).toHaveBeenCalledOnce()
    expect(onDownloadPdf).toHaveBeenCalledOnce()
    expect(onPrint).toHaveBeenCalledOnce()
    expect(screen.getByText('Building sheet')).toBeTruthy()
  })

  it('lets the user pick a compact sheet layout', () => {
    const onChange = vi.fn()
    renderPanel({ onChange })
    fireEvent.change(screen.getByLabelText('Sheet layout'), { target: { value: 'compact' } })
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, sheetLayout: 'compact' })
  })

  it('lets the user omit elevation, buildings, hex marks, and notes from the map', () => {
    const onChange = vi.fn()
    renderPanel({ onChange })

    fireEvent.click(screen.getByLabelText('Elevation'))
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, includeElevation: false })

    fireEvent.click(screen.getByLabelText('Buildings'))
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, includeBuildings: false })

    fireEvent.click(screen.getByLabelText('Hex marks'))
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, includeFeatures: false })

    fireEvent.click(screen.getByLabelText('Notes'))
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_EXPORT_SETTINGS, includeAnnotations: false })
  })

  it('warns about time, memory, and pixel size when 10× is selected', () => {
    renderPanel({ settings: { ...DEFAULT_EXPORT_SETTINGS, pngScale: 10 } })
    const note = screen.getByRole('status')
    expect(note.textContent).toContain('10,560 × 8,160 px')
    expect(note.textContent).toMatch(/each of \d+ map pages/)
    expect(note.textContent).toContain('960 dpi')
    expect(note.textContent).toContain('take a while')
    expect(note.textContent).toContain('memory')
    expect(note.textContent).toContain('SVG is unchanged')
  })

  it('hides the 10× warning at standard resolution', () => {
    renderPanel()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('explains tabletop hex size and page count', () => {
    renderPanel()
    expect(screen.getByText(/1\.25 in \(31\.75 mm\)/)).toBeTruthy()
    expect(screen.getAllByText(/Print at 100%/).length).toBeGreaterThan(0)
  })
})
