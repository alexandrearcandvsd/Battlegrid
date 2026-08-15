// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)
afterEach(() => localStorage.clear())

describe('App', () => {
  it('re-themes the map and reseeds sliders when the biome changes', async () => {
    render(<App />)
    const biomeSelect = screen.getByRole('combobox', { name: 'Biome' }) as HTMLSelectElement
    const relief = screen.getByRole('slider', { name: /Relief/ }) as HTMLInputElement
    expect(relief.value).toBe('3')

    fireEvent.change(biomeSelect, { target: { value: 'hot-desert' } })

    expect(biomeSelect.value).toBe('hot-desert')
    expect(relief.value).toBe('4')

    // The open map carries the new biome once autosave settles.
    await new Promise((resolve) => setTimeout(resolve, 300))
    const saved = JSON.parse(localStorage.getItem('battlegrid.current-map.v1')!)
    expect(saved.biome).toBe('hot-desert')
  })

  it('keeps the biome selector in sync when a re-theme is undone', () => {
    render(<App />)
    const biomeSelect = screen.getByRole('combobox', { name: 'Biome' }) as HTMLSelectElement
    fireEvent.change(biomeSelect, { target: { value: 'volcanic' } })
    expect(biomeSelect.value).toBe('volcanic')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(biomeSelect.value).toBe('temperate-grasslands')
  })

  it('splits the editor into generate, terrain, structures, and export tabs', () => {
    render(<App />)
    const generateTab = screen.getByRole('tab', { name: 'Generate' })
    const terrainTab = screen.getByRole('tab', { name: 'Terrain' })
    const structuresTab = screen.getByRole('tab', { name: 'Structures' })
    const exportTab = screen.getByRole('tab', { name: 'Export' })

    expect(generateTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByLabelText('Operation seed')).toBeTruthy()

    fireEvent.click(terrainTab)
    expect(terrainTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: 'Fill region' })).toBeTruthy()
    expect(screen.queryByLabelText('Operation seed')).toBeNull()

    fireEvent.click(structuresTab)
    expect(structuresTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: /Residential House/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Fill region' })).toBeNull()

    fireEvent.click(exportTab)
    expect(exportTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: 'Download PNG' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download SVG' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Print' })).toBeTruthy()

    fireEvent.click(generateTab)
    expect(screen.getByLabelText('Operation seed')).toBeTruthy()
  })

  it('keeps legend and zoom on the map while terrain tools are open', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Terrain' }))
    expect(screen.getByRole('button', { name: 'Fill region' })).toBeTruthy()

    const stage = container.querySelector('.map-stage')
    expect(stage?.querySelector('.zoom-slider')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Legend' }))
    expect(stage?.querySelector('.map-legend')).toBeTruthy()
  })

  it('blocks terrain painting while the terrain layer is locked', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Terrain' }))
    fireEvent.click(screen.getByRole('button', { name: 'terrain lock' }))

    fireEvent.pointerDown(container.querySelectorAll('.hex-cell')[10], { button: 0 })

    expect(screen.getByText('Terrain layer is locked')).toBeTruthy()
  })

  it('stamps a structure from the structures tab and opens its edit view', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Structures' }))
    fireEvent.click(screen.getByRole('button', { name: /Residential House/ }))

    // Stamp at a few candidate spots; river/water cells reject houses.
    const cells = container.querySelectorAll('.hex-cell')
    for (const index of [10, 60, 120, 200]) {
      fireEvent.pointerDown(cells[index], { button: 0 })
    }

    expect(screen.getByText(/^\d+ placed$/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Rotate/ })).toBeTruthy()
    expect(screen.getByLabelText('Label')).toBeTruthy()
  })

  it('exposes labeled landmarks and controls', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Map actions' })).toBeTruthy()
    expect(screen.getByRole('tablist', { name: 'Editor panels' })).toBeTruthy()
    expect(screen.getByLabelText('Map name')).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Biome' })).toBeTruthy()
    expect(screen.getByRole('application', { name: /hex battle map/i })).toBeTruthy()
  })

  it('runs generate, terrain, and export in one session', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Generate battlefield/ }))
    expect(screen.getByText(/Generated from/)).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'Terrain' }))
    fireEvent.pointerDown(container.querySelectorAll('.hex-cell')[8], { button: 0 })

    fireEvent.click(screen.getByRole('tab', { name: 'Export' }))
    expect(screen.getByRole('button', { name: 'Download SVG' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeTruthy()
    expect(screen.getByLabelText('Hex numbers')).toBeTruthy()
  })
})
