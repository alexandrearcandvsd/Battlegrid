import { offsetToAxial } from './hex'
import { HEX_NUMBERING_MODES, type HexNumberingMode } from '../types/export'

export const HEX_NUMBERING_LABELS: Record<HexNumberingMode, string> = {
  off: 'Off',
  offset: '0101',
  rowcol: '1,1',
  axial: 'q,r',
}

export function formatHexNumber(col: number, row: number, mode: HexNumberingMode): string {
  if (mode === 'off') return ''
  if (mode === 'offset') {
    return `${String(col + 1).padStart(2, '0')}${String(row + 1).padStart(2, '0')}`
  }
  if (mode === 'rowcol') return `${row + 1},${col + 1}`
  const axial = offsetToAxial(col, row)
  return `${axial.q},${axial.r}`
}

export function nextHexNumbering(mode: HexNumberingMode): HexNumberingMode {
  const index = HEX_NUMBERING_MODES.indexOf(mode)
  return HEX_NUMBERING_MODES[(index + 1) % HEX_NUMBERING_MODES.length]
}
