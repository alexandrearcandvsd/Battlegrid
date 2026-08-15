export function shade(hex: string, amount: number): string {
  // amount in [-1, 1]: negative darkens toward black, positive lightens toward white
  const value = parseInt(hex.slice(1), 16)
  const channel = (shift: number) => (value >> shift) & 255
  const target = amount < 0 ? 0 : 255
  const weight = Math.min(1, Math.abs(amount))
  const mix = (component: number) =>
    Math.round(component + (target - component) * weight)
  return `rgb(${mix(channel(16))}, ${mix(channel(8))}, ${mix(channel(0))})`
}

function parseHex(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const light = (max + min) / 2
  if (max === min) return [0, 0, light]
  const delta = max - min
  const sat = light > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let hue = 0
  if (max === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6
  else if (max === green) hue = ((blue - red) / delta + 2) / 6
  else hue = ((red - green) / delta + 4) / 6
  return [hue * 360, sat, light]
}

function hslToRgb(hue: number, sat: number, light: number): [number, number, number] {
  const h = (((hue % 360) + 360) % 360) / 360
  const s = Math.max(0, Math.min(1, sat))
  const l = Math.max(0, Math.min(1, light))
  if (s === 0) {
    const value = Math.round(l * 255)
    return [value, value, value]
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tone = t
    if (tone < 0) tone += 1
    if (tone > 1) tone -= 1
    if (tone < 1 / 6) return p + (q - p) * 6 * tone
    if (tone < 1 / 2) return q
    if (tone < 2 / 3) return p + (q - p) * (2 / 3 - tone) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ]
}

/** Shift a #rrggbb color in HSL. Used by regional colorways. */
export function shiftHex(hex: string, hueDeg: number, satMul = 1, lightMul = 1): string {
  const [h, s, l] = rgbToHsl(...parseHex(hex))
  return toHex(...hslToRgb(h + hueDeg, s * satMul, l * lightMul))
}

/** Shift a #rrggbb or rgba() color. Leaves unmatched strings unchanged. */
export function shiftCssColor(color: string, hueDeg: number, satMul = 1, lightMul = 1): string {
  if (color.startsWith('#')) return shiftHex(color, hueDeg, satMul, lightMul)
  const match = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/)
  if (!match) return color
  const shifted = shiftHex(
    toHex(Math.round(Number(match[1])), Math.round(Number(match[2])), Math.round(Number(match[3]))),
    hueDeg,
    satMul,
    lightMul,
  )
  const [r, g, b] = parseHex(shifted)
  return match[4] === undefined ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${match[4]})`
}
