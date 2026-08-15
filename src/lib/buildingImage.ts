export const BUILDING_IMAGE_MAX_EDGE = 512
export const BUILDING_IMAGE_MAX_FILE_BYTES = 8 * 1024 * 1024
export const BUILDING_IMAGE_MAX_DATA_URL = 800_000

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/pjpeg'])

const DATA_URL_PATTERN = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/]+={0,2}$/

export function isAcceptedImageFile(file: File): boolean {
  if (ACCEPTED_TYPES.has(file.type)) return true
  return /\.(png|jpe?g|webp)$/i.test(file.name)
}

export function isBuildingImageDataUrl(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 32 &&
    value.length <= BUILDING_IMAGE_MAX_DATA_URL &&
    DATA_URL_PATTERN.test(value)
  )
}

export function scaleToMaxEdge(
  width: number,
  height: number,
  maxEdge = BUILDING_IMAGE_MAX_EDGE,
): { width: number; height: number } {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    throw new Error('Could not read the image.')
  }
  const edge = Math.max(width, height)
  if (edge <= maxEdge) {
    return { width: Math.round(width), height: Math.round(height) }
  }
  const scale = maxEdge / edge
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

type ImageSource = CanvasImageSource & { width: number; height: number; close?: () => void }

async function loadImageSource(file: File): Promise<ImageSource> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file)
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read the image.'))
    }
    image.src = url
  })
}

function drawPng(source: CanvasImageSource, width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not read the image.')
  context.drawImage(source, 0, 0, width, height)
  return canvas.toDataURL('image/png')
}

export async function readBuildingImage(file: File): Promise<string> {
  if (file.size > BUILDING_IMAGE_MAX_FILE_BYTES) {
    throw new Error('Image is too large (max 8 MB).')
  }
  if (!isAcceptedImageFile(file)) {
    throw new Error('Use a PNG, JPEG, or WebP image.')
  }
  const source = await loadImageSource(file)
  try {
    let edge = BUILDING_IMAGE_MAX_EDGE
    while (edge >= 128) {
      const size = scaleToMaxEdge(source.width, source.height, edge)
      const dataUrl = drawPng(source, size.width, size.height)
      if (isBuildingImageDataUrl(dataUrl)) return dataUrl
      edge = Math.floor(edge * 0.75)
    }
    throw new Error('Image is still too large after resize.')
  } finally {
    source.close?.()
  }
}
