/** Convert millimetres to PDF user-space points (1/72 inch). */
export function mmToPdfPoints(mm: number) {
  return Math.round(((mm * 72) / 25.4) * 100) / 100
}

export interface PdfImagePage {
  widthMm: number
  heightMm: number
  jpeg: Uint8Array
}

function jpegDimensions(bytes: Uint8Array) {
  let index = 2
  while (index + 8 < bytes.length && bytes[index] === 0xff) {
    const marker = bytes[index + 1]
    const length = (bytes[index + 2] << 8) | bytes[index + 3]
    const sof =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    if (sof) {
      return {
        height: (bytes[index + 5] << 8) | bytes[index + 6],
        width: (bytes[index + 7] << 8) | bytes[index + 8],
      }
    }
    index += 2 + length
  }
  return { width: 1, height: 1 }
}

function concat(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const output = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.length
  }
  return output
}

/** Assemble a multi-page PDF that paints one JPEG per page at the given paper size. */
export function buildPdfFromJpegs(pages: PdfImagePage[]): Uint8Array {
  if (pages.length === 0) throw new Error('PDF export needs at least one page.')

  const encoder = new TextEncoder()
  const chunks: Uint8Array[] = []
  let offset = 0
  const write = (part: string | Uint8Array) => {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part
    chunks.push(bytes)
    offset += bytes.length
  }

  write('%PDF-1.4\n%\x80\x80\x80\x80\n')

  const objectCount = 2 + pages.length * 3
  const xref: number[] = [0]

  const begin = (id: number) => {
    xref[id] = offset
    write(`${id} 0 obj\n`)
  }
  const end = () => write('\nendobj\n')

  begin(1)
  write('<< /Type /Catalog /Pages 2 0 R >>')
  end()

  const pageIds = pages.map((_, index) => 3 + index * 3)
  begin(2)
  write(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`)
  end()

  pages.forEach((page, index) => {
    const pageId = 3 + index * 3
    const contentId = pageId + 1
    const imageId = pageId + 2
    const width = mmToPdfPoints(page.widthMm)
    const height = mmToPdfPoints(page.heightMm)
    const pixels = jpegDimensions(page.jpeg)

    begin(pageId)
    write(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    )
    end()

    const content = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`
    begin(contentId)
    write(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream`)
    end()

    begin(imageId)
    write(
      `<< /Type /XObject /Subtype /Image /Width ${pixels.width} /Height ${pixels.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`,
    )
    write(page.jpeg)
    write('\nendstream')
    end()
  })

  const xrefOffset = offset
  write(`xref\n0 ${objectCount + 1}\n`)
  write('0000000000 65535 f \n')
  for (let id = 1; id <= objectCount; id += 1) {
    write(`${String(xref[id]).padStart(10, '0')} 00000 n \n`)
  }
  write(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`)
  return concat(chunks)
}
