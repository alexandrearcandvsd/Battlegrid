// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Building } from '../types/building'
import { BuildingsPanel } from './BuildingsPanel'

const selected: Building = {
  id: 'b1',
  type: 'hospital',
  anchor: { col: 2, row: 2 },
  rotation: 0,
  state: 'intact',
}

afterEach(cleanup)

describe('BuildingsPanel', () => {
  it('lists the new table structures', () => {
    render(
      <BuildingsPanel
        armed={null}
        onArm={vi.fn()}
        selected={null}
        placedCount={0}
        onRotate={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onStateChange={vi.fn()}
        onLabelChange={vi.fn()}
        onDeselect={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /Hospital/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Government/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Infantry Barracks/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Vehicle Garage/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Repair Bay/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Power Plant/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Rail Station/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Water Tower/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /School/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Refinery/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Aerospace Hangar/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Dam/ })).toBeTruthy()
  })

  it('shows construction type, height, and CF on the selected structure', () => {
    const onStateChange = vi.fn()
    render(
      <BuildingsPanel
        armed={null}
        onArm={vi.fn()}
        selected={selected}
        placedCount={1}
        onRotate={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onStateChange={onStateChange}
        onLabelChange={vi.fn()}
        onDeselect={vi.fn()}
      />,
    )
    expect(screen.getByText(/Medium/)).toBeTruthy()
    expect(screen.getByText(/H2/)).toBeTruthy()
    expect(screen.getByText(/CF 35/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Burning' }))
    expect(onStateChange).toHaveBeenCalledWith('burning')
    expect(screen.getByRole('button', { name: 'Lightly damaged' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Collapsed' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Rubble' })).toBeTruthy()
  })
})
