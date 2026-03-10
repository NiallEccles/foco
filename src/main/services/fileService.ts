import { promises as fs } from 'fs'
import { join, basename } from 'path'
import { isSupportedImage } from '../utils/supportedFormats'
import type { ImageFile } from '../../preload/types'

export async function listImages(dirPath: string): Promise<ImageFile[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  const images: ImageFile[] = []

  for (const entry of entries) {
    if (!entry.isFile()) continue
    if (!isSupportedImage(entry.name)) continue
    if (entry.name.startsWith('.')) continue

    const filePath = join(dirPath, entry.name)
    try {
      const stat = await fs.stat(filePath)
      images.push({
        name: entry.name,
        path: filePath,
        size: stat.size,
        mtime: stat.mtime.toISOString()
      })
    } catch {
      // skip unreadable files
    }
  }

  return images.sort((a, b) => a.name.localeCompare(b.name))
}

const DELETED_FOLDER = '_deleted'

export async function softDelete(imagePath: string, folderPath: string): Promise<void> {
  const deletedDir = join(folderPath, DELETED_FOLDER)
  await fs.mkdir(deletedDir, { recursive: true })
  const dest = join(deletedDir, basename(imagePath))
  await fs.rename(imagePath, dest)
}

export async function restoreImage(deletedPath: string, folderPath: string): Promise<string> {
  const dest = join(folderPath, basename(deletedPath))
  await fs.rename(deletedPath, dest)
  return dest
}

export async function listDeletedImages(folderPath: string): Promise<ImageFile[]> {
  const deletedDir = join(folderPath, DELETED_FOLDER)
  try {
    return await listImages(deletedDir)
  } catch {
    return []
  }
}
