// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import {
  BUILDING_IMAGE_MAX_DATA_URL,
  BUILDING_IMAGE_MAX_FILE_BYTES,
  isAcceptedImageFile,
  isBuildingImageDataUrl,
  readBuildingImage,
  scaleToMaxEdge,
} from './buildingImage'

const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('buildingImage', () => {
  it('accepts PNG, JPEG, and WebP files', () => {
    expect(isAcceptedImageFile(new File([], 'house.png', { type: 'image/png' }))).toBe(true)
    expect(isAcceptedImageFile(new File([], 'house.jpg', { type: 'image/jpeg' }))).toBe(true)
    expect(isAcceptedImageFile(new File([], 'house.webp', { type: 'image/webp' }))).toBe(true)
    expect(isAcceptedImageFile(new File([], 'house.png', { type: '' }))).toBe(true)
    expect(isAcceptedImageFile(new File([], 'house.gif', { type: 'image/gif' }))).toBe(false)
    expect(isAcceptedImageFile(new File([], 'house.svg', { type: 'image/svg+xml' }))).toBe(false)
  })

  it('accepts only compact raster data URLs', () => {
    expect(isBuildingImageDataUrl(TINY_PNG)).toBe(true)
    expect(isBuildingImageDataUrl('javascript:alert(1)')).toBe(false)
    expect(isBuildingImageDataUrl('blob:https://example.test/1')).toBe(false)
    expect(isBuildingImageDataUrl('https://example.test/house.png')).toBe(false)
    expect(isBuildingImageDataUrl('data:image/svg+xml;base64,PHN2Zz4=')).toBe(false)
    expect(isBuildingImageDataUrl(`data:image/png;base64,${'A'.repeat(BUILDING_IMAGE_MAX_DATA_URL)}`)).toBe(
      false,
    )
  })

  it('scales the long edge down and leaves smaller images alone', () => {
    expect(scaleToMaxEdge(100, 80)).toEqual({ width: 100, height: 80 })
    expect(scaleToMaxEdge(512, 512)).toEqual({ width: 512, height: 512 })
    expect(scaleToMaxEdge(1024, 512)).toEqual({ width: 512, height: 256 })
    expect(scaleToMaxEdge(256, 1024, 256)).toEqual({ width: 64, height: 256 })
    expect(() => scaleToMaxEdge(0, 10)).toThrow(/read the image/)
  })

  it('rejects oversized or unsupported files before decode', async () => {
    await expect(
      readBuildingImage(new File(['x'], 'house.gif', { type: 'image/gif' })),
    ).rejects.toThrow(/PNG, JPEG, or WebP/)
    await expect(
      readBuildingImage(
        new File([new Uint8Array(BUILDING_IMAGE_MAX_FILE_BYTES + 1)], 'house.png', {
          type: 'image/png',
        }),
      ),
    ).rejects.toThrow(/too large/)
  })
})
