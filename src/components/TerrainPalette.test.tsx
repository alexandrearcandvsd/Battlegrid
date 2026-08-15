// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getBiome } from '../lib/biomes'
import type { BrushSettings } from '../types/map'
import { TerrainPalette } from './TerrainPalette'

const biome = getBiome('temperate-grasslands')

const brush: BrushSettings = {
  terrain: 'woods',
  size: 1,
  tool: 'brush',
  elevationMode: 'paint',
  targetElevation: 1,
  mark: 'none',
}

afterEach(cleanup)

describe('TerrainPalette', () => {
  it('splits tools, feature marks, and elevation into sub-tabs', () => {
    render(<TerrainPalette brush={brush} biome={biome} onChange={vi.fn()} />)

    const toolsTab = screen.getByRole('tab', { name: 'Tools' })
    const marksTab = screen.getByRole('tab', { name: 'Marks' })
    const elevationTab = screen.getByRole('tab', { name: 'Elevation' })
    expect(toolsTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: 'Fill region' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Ice' })).toBeNull()
    expect(screen.queryByRole('slider', { name: 'Elevation level' })).toBeNull()

    fireEvent.click(marksTab)
    expect(marksTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: 'Ice' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Fill region' })).toBeNull()
    expect(screen.queryByRole('slider', { name: 'Elevation level' })).toBeNull()

    fireEvent.click(elevationTab)
    expect(elevationTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('slider', { name: 'Elevation level' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Ice' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Fill region' })).toBeNull()

    fireEvent.click(toolsTab)
    expect(screen.getByRole('button', { name: 'Fill region' })).toBeTruthy()
  })

  it('offers the natural-world feature marks', () => {
    render(<TerrainPalette brush={brush} biome={biome} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Marks' }))
    expect(screen.getByRole('button', { name: 'Ice' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Crevasse' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Dry wash' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Canopy gap' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Beach' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cliff' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Wall' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Spore field' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Crystal' })).toBeTruthy()
  })

  it('selects the region fill tool', () => {
    const onChange = vi.fn()
    render(<TerrainPalette brush={brush} biome={biome} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Fill region' }))
    expect(onChange).toHaveBeenCalledWith({
      ...brush,
      tool: 'fill',
      elevationMode: 'paint',
    })
  })

  it('selects scatter, rubble, and path brushes', () => {
    const onChange = vi.fn()
    render(<TerrainPalette brush={brush} biome={biome} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Scatter' }))
    expect(onChange).toHaveBeenCalledWith({ ...brush, tool: 'scatter' })
    fireEvent.click(screen.getByRole('button', { name: 'Rubble' }))
    expect(onChange).toHaveBeenCalledWith({ ...brush, tool: 'rubble' })
    fireEvent.click(screen.getByRole('button', { name: 'Path' }))
    expect(onChange).toHaveBeenCalledWith({ ...brush, tool: 'path' })
  })

  it('switches to direct elevation painting', () => {
    const onChange = vi.fn()
    render(<TerrainPalette brush={brush} biome={biome} onChange={onChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Elevation' }))
    fireEvent.change(screen.getByRole('slider', { name: 'Elevation level' }), {
      target: { value: '4' },
    })
    expect(onChange).toHaveBeenCalledWith({
      ...brush,
      tool: 'brush',
      elevationMode: 'set',
      targetElevation: 4,
    })
  })

  it('groups the native tile and its biome reskins under category tabs', () => {
    render(<TerrainPalette brush={brush} biome={getBiome('volcanic')} onChange={vi.fn()} />)

    // The brush's terrain (woods) opens its own category.
    const woodsTab = screen.getByRole('tab', { name: 'Light Woods' })
    expect(woodsTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: /Scorched Scrub/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Pine Woods/ })).toBeTruthy()

    // Switching categories reveals that terrain's native tile and reskins.
    fireEvent.click(screen.getByRole('tab', { name: 'Water' }))
    expect(screen.getByRole('button', { name: /Sulfur Pool/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Oasis/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Glacial Lake/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Marsh Water/ })).toBeTruthy()
  })

  it('paints reskins from the category tab and clears them with the native tile', () => {
    const onChange = vi.fn()
    render(<TerrainPalette brush={brush} biome={biome} onChange={onChange} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Heavy Woods' }))
    fireEvent.click(screen.getByRole('button', { name: /Oasis Grove/ }))
    expect(onChange).toHaveBeenCalledWith({
      ...brush,
      terrain: 'heavyWoods',
      skin: 'hot-desert:heavyWoods',
      tool: 'brush',
      elevationMode: 'paint',
      mark: 'none',
    })

    // The native tile clears the skin again.
    fireEvent.click(screen.getByRole('button', { name: /Heavy Woods/ }))
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ terrain: 'heavyWoods', skin: undefined }),
    )
  })
})
