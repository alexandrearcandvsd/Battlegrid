// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GeneratorSettings } from '../types/map'
import { GeneratorPanel } from './GeneratorPanel'

const settings: GeneratorSettings = {
  biome: 'temperate-grasslands',
  width: 18,
  height: 14,
  seed: 'PANEL-TEST',
  terrain: { woods: 28, water: 13, rough: 21 },
  elevation: 3,
  symmetric: true,
  river: true,
}

function renderPanel(overrides: Partial<GeneratorSettings> = {}) {
  const props = {
    settings: { ...settings, ...overrides },
    onChange: vi.fn(),
    onBiomeChange: vi.fn(),
    onGenerate: vi.fn(),
    onResize: vi.fn(),
    onRegenerateUnprotected: vi.fn(),
    onClearProtections: vi.fn(),
    onRandomizeSeed: vi.fn(),
    protectedCount: 0,
  }
  render(<GeneratorPanel {...props} />)
  return props
}

afterEach(cleanup)

describe('GeneratorPanel', () => {
  it('lists all thirty biomes and reports the selection', () => {
    const props = renderPanel()
    const select = screen.getByRole('combobox', { name: 'Biome' })
    expect(select.querySelectorAll('option')).toHaveLength(30)
    fireEvent.change(select, { target: { value: 'volcanic' } })
    expect(props.onBiomeChange).toHaveBeenCalledWith('volcanic')
  })

  it('applies a map-size template', () => {
    const props = renderPanel()
    fireEvent.change(screen.getByRole('combobox', { name: 'Map size' }), {
      target: { value: 'mapsheet' },
    })
    expect(props.onChange).toHaveBeenCalledWith({ ...settings, width: 16, height: 17 })
  })

  it('offers a double-blind mapsheet size', () => {
    const props = renderPanel()
    fireEvent.change(screen.getByRole('combobox', { name: 'Map size' }), {
      target: { value: 'double-blind' },
    })
    expect(props.onChange).toHaveBeenCalledWith({ ...settings, width: 32, height: 34 })
  })

  it('reports a regional colorway without regenerating terrain', () => {
    const props = renderPanel()
    fireEvent.change(screen.getByRole('combobox', { name: 'Colorway' }), {
      target: { value: 'arid' },
    })
    expect(props.onChange).toHaveBeenCalledWith({ ...settings, colorway: 'arid' })
  })

  it('applies a terrain preset', () => {
    const props = renderPanel()
    fireEvent.change(screen.getByRole('combobox', { name: 'Terrain preset' }), {
      target: { value: 'open-plains' },
    })
    expect(props.onChange).toHaveBeenCalledWith({
      ...settings,
      terrain: { woods: 8, water: 8, rough: 12 },
    })
  })

  it('resolves the balanced preset to the active biome defaults', () => {
    const props = renderPanel({ terrain: { woods: 5, water: 5, rough: 5 } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Terrain preset' }), {
      target: { value: 'balanced' },
    })
    expect(props.onChange).toHaveBeenCalledWith({
      ...settings,
      terrain: { woods: 28, water: 13, rough: 21 },
    })
  })

  it('toggles symmetric terrain and river crossing', () => {
    const props = renderPanel()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Symmetric terrain' }))
    expect(props.onChange).toHaveBeenCalledWith({ ...settings, symmetric: false })
    fireEvent.click(screen.getByRole('checkbox', { name: 'River crossing' }))
    expect(props.onChange).toHaveBeenCalledWith({ ...settings, river: false })
  })

  it('applies a tidal terrain preset', () => {
    const props = renderPanel()
    fireEvent.change(screen.getByRole('combobox', { name: 'Terrain preset' }), {
      target: { value: 'tidal' },
    })
    expect(props.onChange).toHaveBeenCalledWith({
      ...settings,
      terrain: { woods: 12, water: 32, rough: 16 },
    })
  })

  it('reports a countryside road chance from the slider', () => {
    const props = renderPanel()
    const slider = screen.getByRole('slider', { name: 'Road' })
    expect(slider).toHaveProperty('value', '100')
    fireEvent.change(slider, { target: { value: '25' } })
    expect(props.onChange).toHaveBeenCalledWith({ ...settings, roadChance: 25 })
  })

  it('toggles the extra countryside road network', () => {
    const props = renderPanel()
    fireEvent.click(screen.getByRole('checkbox', { name: /Road network/ }))
    expect(props.onChange).toHaveBeenCalledWith({ ...settings, roadNetwork: true })
  })

  it('disables the road slider on biomes that do not generate a countryside road', () => {
    renderPanel({ biome: 'hot-desert' })
    expect(screen.getByRole('slider', { name: 'Road' })).toHaveProperty('disabled', true)
    cleanup()
    renderPanel({ biome: 'canyon-road' })
    expect(screen.getByRole('slider', { name: 'Road' })).toHaveProperty('disabled', true)
  })

  it('shows district density for industrial wasteland', () => {
    const props = renderPanel({ biome: 'industrial-wasteland', urbanPreset: 'industrial' })
    fireEvent.change(screen.getByRole('combobox', { name: 'District density' }), {
      target: { value: 'city-center' },
    })
    expect(props.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ urbanPreset: 'city-center' }),
    )
  })

  it('lists ruins and military urban presets', () => {
    renderPanel({ biome: 'urban', urbanPreset: 'settlement' })
    const density = screen.getByRole('combobox', { name: 'Urban density' })
    expect(density.textContent).toContain('Post-apocalyptic ruins')
    expect(density.textContent).toContain('Military base')
  })

  it('shows the urban density select only for district biomes', () => {
    renderPanel()
    expect(screen.queryByRole('combobox', { name: 'Urban density' })).toBeNull()

    const props = renderPanel({ biome: 'urban', urbanPreset: 'settlement' })
    const select = screen.getByRole('combobox', { name: 'Urban density' })
    fireEvent.change(select, { target: { value: 'city-center' } })
    expect(props.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ urbanPreset: 'city-center' }),
    )
  })
})
