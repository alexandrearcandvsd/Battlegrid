import { describe, expect, it } from 'vitest'
import type { GeneratorSettings } from '../types/map'
import { deleteAnnotation, setAnnotation } from './annotationCommands'
import { generateMap } from './generator'

const settings: GeneratorSettings = {
  biome: 'temperate-grasslands',
  width: 8,
  height: 8,
  seed: 'NOTES-TEST',
  terrain: { woods: 0, water: 0, rough: 0 },
  elevation: 0,
  symmetric: false,
  river: false,
}

describe('annotation commands', () => {
  it('sets, replaces, and clears notes on a hex', () => {
    let map = generateMap(settings)
    map = setAnnotation(map, { col: 2, row: 3 }, 'Objective A')
    expect(map.annotations).toHaveLength(1)
    expect(map.annotations[0]).toMatchObject({ col: 2, row: 3, text: 'Objective A' })

    map = setAnnotation(map, { col: 2, row: 3 }, ' Objective B ')
    expect(map.annotations).toHaveLength(1)
    expect(map.annotations[0].text).toBe('Objective B')

    map = setAnnotation(map, { col: 2, row: 3 }, '   ')
    expect(map.annotations).toHaveLength(0)
  })

  it('deletes notes by id', () => {
    let map = generateMap(settings)
    map = setAnnotation(map, { col: 1, row: 1 }, 'Alpha')
    map = setAnnotation(map, { col: 4, row: 4 }, 'Beta')
    map = deleteAnnotation(map, map.annotations[0].id)
    expect(map.annotations).toHaveLength(1)
    expect(map.annotations[0].text).toBe('Beta')
  })
})
