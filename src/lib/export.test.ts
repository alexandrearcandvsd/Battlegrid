// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { DEFAULT_EXPORT_SETTINGS } from '../types/export'
import { canvasFilterForPage, prepareSvgExport } from './export'

describe('SVG export preparation', () => {
  it('uses the view box as explicit export dimensions', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '-20 -10 640 480')
    svg.innerHTML = '<polygon points="0,0 10,0 5,10" />'

    const prepared = prepareSvgExport(svg)

    expect(prepared).toMatchObject({ width: 640, height: 480, x: -20, y: -10 })
    expect(prepared.source).toContain('width="640"')
    expect(prepared.source).toContain('height="480"')
    expect(prepared.source).toContain('xmlns="http://www.w3.org/2000/svg"')
  })

  it('strips the pan and zoom transform so the export fits the map', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '-50 -50 740 580')
    svg.innerHTML =
      '<g class="map-content" style="transform: translate(12px, 34px) scale(2.2)"><rect width="10" height="10" /></g>'

    const prepared = prepareSvgExport(svg)

    expect(prepared.source).not.toContain('translate(12px')
    expect(prepared.source).toContain('map-content')
  })

  it('embeds the app stylesheet so class-based styling survives', () => {
    const style = document.createElement('style')
    style.textContent = '.road-mark path { fill: none; stroke: rgb(1, 2, 3); }'
    document.head.appendChild(style)
    try {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('viewBox', '0 0 100 100')
      svg.innerHTML = '<path class="road-mark" d="M 0 0 L 10 10" />'

      const prepared = prepareSvgExport(svg)

      expect(prepared.source).toContain('<style')
      expect(prepared.source).toContain('rgb(1, 2, 3)')
    } finally {
      style.remove()
    }
  })

  it('strips editor-only affordances from the export', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 100 100')
    svg.innerHTML = `
      <g class="hex-cell hovered"><polygon points="0,0 10,0 5,10" /></g>
      <rect class="building-selection" width="4" height="4" />
      <g class="building-ghost"><rect width="4" height="4" /></g>
      <path class="protected-mark" d="M 0 0 l 2 2" />
      <g class="selection-overlay"><polygon class="selected-cell" /></g>
      <rect class="marquee-rect" width="8" height="8" />
      <path class="lasso-path" d="M 0 0 L 4 4" />
    `

    const prepared = prepareSvgExport(svg)

    expect(prepared.source).not.toContain('building-selection')
    expect(prepared.source).not.toContain('building-ghost')
    expect(prepared.source).not.toContain('protected-mark')
    expect(prepared.source).not.toContain('hovered')
    expect(prepared.source).not.toContain('selection-overlay')
    expect(prepared.source).not.toContain('marquee-rect')
    expect(prepared.source).not.toContain('lasso-path')
  })

  it('keeps map layers when export layer toggles are on', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 100 100')
    svg.innerHTML = `
      <polygon class="hex-elevation-texture" />
      <g class="elevation-rims"></g>
      <g class="building-layer"><g class="building"></g></g>
      <g class="feature-mark crater-mark"></g>
      <text class="hex-note">LZ</text>
    `

    const prepared = prepareSvgExport(svg, DEFAULT_EXPORT_SETTINGS)

    expect(prepared.source).toContain('hex-elevation-texture')
    expect(prepared.source).toContain('elevation-rims')
    expect(prepared.source).toContain('building-layer')
    expect(prepared.source).toContain('feature-mark')
    expect(prepared.source).toContain('hex-note')
  })

  it('strips map layers the user turned off', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 100 100')
    svg.innerHTML = `
      <polygon class="hex-shape" />
      <polygon class="hex-elevation-texture" />
      <polygon class="snow-overlay" />
      <g class="elevation-badge"></g>
      <g class="elevation-rims"></g>
      <g class="building-layer"><g class="building"></g></g>
      <g class="feature-mark crater-mark"></g>
      <text class="hex-note">LZ</text>
    `

    const prepared = prepareSvgExport(svg, {
      ...DEFAULT_EXPORT_SETTINGS,
      includeElevation: false,
      includeBuildings: false,
      includeFeatures: false,
      includeAnnotations: false,
    })

    expect(prepared.source).toContain('hex-shape')
    expect(prepared.source).not.toContain('hex-elevation-texture')
    expect(prepared.source).not.toContain('snow-overlay')
    expect(prepared.source).not.toContain('elevation-badge')
    expect(prepared.source).not.toContain('elevation-rims')
    expect(prepared.source).not.toContain('building-layer')
    expect(prepared.source).not.toContain('feature-mark')
    expect(prepared.source).not.toContain('hex-note')
  })
})

describe('raster grayscale detection', () => {
  it('leaves PNG and PDF in color when the page only defines an unused grayscale filter', () => {
    const svg = `<svg><defs><filter id="print-grayscale"></filter></defs><g>map</g></svg>`
    expect(canvasFilterForPage(svg)).toBe('none')
  })

  it('rasterizes grayscale only when the print filter is actually applied', () => {
    const svg = `<svg><g filter="url(#print-grayscale)">map</g></svg>`
    expect(canvasFilterForPage(svg)).toBe('grayscale(1) contrast(1.15)')
  })
})
