import { describe, expect, it } from 'vitest'
import { formatHexNumber, nextHexNumbering } from './hexNumbering'

describe('hex numbering', () => {
  it('formats BattleTech offset coordinates as 0101-style ids', () => {
    expect(formatHexNumber(0, 0, 'offset')).toBe('0101')
    expect(formatHexNumber(9, 11, 'offset')).toBe('1012')
  })

  it('formats 1-based row,column pairs', () => {
    expect(formatHexNumber(0, 0, 'rowcol')).toBe('1,1')
    expect(formatHexNumber(4, 2, 'rowcol')).toBe('3,5')
  })

  it('formats odd-r axial q,r pairs', () => {
    expect(formatHexNumber(0, 0, 'axial')).toBe('0,0')
    expect(formatHexNumber(1, 1, 'axial')).toBe('1,1')
    expect(formatHexNumber(0, 1, 'axial')).toBe('0,1')
  })

  it('returns an empty label when numbering is off', () => {
    expect(formatHexNumber(3, 4, 'off')).toBe('')
  })

  it('cycles numbering modes including off', () => {
    expect(nextHexNumbering('off')).toBe('offset')
    expect(nextHexNumbering('offset')).toBe('rowcol')
    expect(nextHexNumbering('rowcol')).toBe('axial')
    expect(nextHexNumbering('axial')).toBe('off')
  })
})
