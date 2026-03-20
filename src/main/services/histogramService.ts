import sharp from 'sharp'

export interface HistogramData {
  r: number[]
  g: number[]
  b: number[]
  luma: number[]
}

export async function getHistogram(imagePath: string): Promise<HistogramData> {
  const { data, info } = await sharp(imagePath)
    .resize(200, 200, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const r = new Array(256).fill(0)
  const g = new Array(256).fill(0)
  const b = new Array(256).fill(0)
  const luma = new Array(256).fill(0)

  const ch = info.channels
  for (let i = 0; i < data.length; i += ch) {
    const rv = data[i]
    const gv = data[i + 1]
    const bv = data[i + 2]
    r[rv]++
    g[gv]++
    b[bv]++
    luma[Math.round(0.299 * rv + 0.587 * gv + 0.114 * bv)]++
  }

  return { r, g, b, luma }
}
