import sharp from 'sharp'
import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const FIXTURES_DIR = join(__dirname, '..', 'fixtures')

export async function setup() {
  await fs.mkdir(FIXTURES_DIR, { recursive: true })

  // 100×100 JPEG for general image tests
  await sharp({
    create: { width: 100, height: 100, channels: 3, background: { r: 128, g: 64, b: 32 } }
  })
    .jpeg({ quality: 80 })
    .toFile(join(FIXTURES_DIR, 'sample.jpg'))

  // 100×100 PNG for format/no-EXIF tests
  await sharp({
    create: { width: 100, height: 100, channels: 3, background: { r: 64, g: 128, b: 200 } }
  })
    .png()
    .toFile(join(FIXTURES_DIR, 'sample.png'))
}
