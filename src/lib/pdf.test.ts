import { describe, expect, it } from 'vitest'
import { paperDimensions } from './printLayout'
import { buildPdfFromJpegs, mmToPdfPoints } from './pdf'

/** Minimal 1×1 JPEG so DCTDecode streams are structurally valid. */
const JPEG = Uint8Array.from(
  atob(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==',
  ),
  (char) => char.charCodeAt(0),
)

function pdfText(bytes: Uint8Array) {
  return new TextDecoder('latin1').decode(bytes)
}

describe('PDF assembly', () => {
  it('converts millimetres to PDF points', () => {
    expect(mmToPdfPoints(25.4)).toBe(72)
    expect(mmToPdfPoints(215.9)).toBe(612)
    expect(mmToPdfPoints(279.4)).toBe(792)
  })

  it('builds a PDF with letter, A4, and tabloid page boxes', () => {
    for (const paper of ['letter', 'a4', 'tabloid'] as const) {
      const size = paperDimensions(paper, 'landscape')
      const pdf = buildPdfFromJpegs([{ widthMm: size.width, heightMm: size.height, jpeg: JPEG }])
      const text = pdfText(pdf)
      expect(text.startsWith('%PDF-')).toBe(true)
      expect(text).toContain('%%EOF')
      expect(text).toContain('/Type /Page')
      expect(text).toContain('/Filter /DCTDecode')
      expect(text).toContain(
        `/MediaBox [0 0 ${mmToPdfPoints(size.width)} ${mmToPdfPoints(size.height)}]`,
      )
    }
  })

  it('writes one PDF page per print sheet', () => {
    const letter = paperDimensions('letter', 'landscape')
    const pdf = buildPdfFromJpegs([
      { widthMm: letter.width, heightMm: letter.height, jpeg: JPEG },
      { widthMm: letter.width, heightMm: letter.height, jpeg: JPEG },
    ])
    const text = pdfText(pdf)
    expect(text).toContain('/Count 2')
    expect(text.match(/\/Type \/Page[^s]/g)?.length).toBe(2)
  })

  it('embeds the JPEG bytes unaltered', () => {
    const size = paperDimensions('a4', 'portrait')
    const pdf = buildPdfFromJpegs([{ widthMm: size.width, heightMm: size.height, jpeg: JPEG }])
    const haystack = pdfText(pdf)
    const needle = pdfText(JPEG)
    expect(haystack).toContain(needle)
  })
})
