import { promises as fs } from 'fs'
import { join, parse } from 'path'
import sharp from 'sharp'

const CACHE_DIR = '.foco-cache'
const THUMB_DIR = 'thumbnails'
const THUMB_SIZE = 160 // 2× for retina
const THUMB_QUALITY = 75

async function ensureCacheDir(folderPath: string): Promise<string> {
  const cacheDir = join(folderPath, CACHE_DIR, THUMB_DIR)
  await fs.mkdir(cacheDir, { recursive: true })
  return cacheDir
}

export async function getThumbnailPath(imagePath: string, folderPath: string): Promise<string> {
  const cacheDir = await ensureCacheDir(folderPath)
  const { name } = parse(imagePath)
  const thumbPath = join(cacheDir, `${name}.thumb.jpg`)

  try {
    const [thumbStat, srcStat] = await Promise.all([fs.stat(thumbPath), fs.stat(imagePath)])
    if (thumbStat.mtimeMs >= srcStat.mtimeMs) {
      return thumbPath
    }
  } catch {
    // Cache miss — generate below
  }

  await sharp(imagePath)
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: THUMB_QUALITY })
    .toFile(thumbPath)

  return thumbPath
}
