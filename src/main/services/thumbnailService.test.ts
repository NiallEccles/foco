import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import sharp from 'sharp'
import { createTempDir, cleanupTempDir } from '../../../test/helpers/tempDir'
import { FIXTURES_DIR } from '../../../test/setup/globalSetup'
import { getThumbnailPath } from './thumbnailService'

let tmpDir: string
let sourceImg: string

beforeAll(async () => {
  tmpDir = await createTempDir()
  sourceImg = join(tmpDir, 'photo.jpg')
  await fs.copyFile(join(FIXTURES_DIR, 'sample.jpg'), sourceImg)
})

afterEach(async () => {
  // Remove cache dir so each test starts fresh
  await fs.rm(join(tmpDir, '.foco-cache'), { recursive: true, force: true })
})

afterAll(() => cleanupTempDir(tmpDir))

describe('getThumbnailPath', () => {
  it('generates a thumbnail file for a valid image', async () => {
    const thumbPath = await getThumbnailPath(sourceImg, tmpDir)
    await expect(fs.access(thumbPath)).resolves.toBeUndefined()
  })

  it('thumbnail is a 160×160 JPEG (cover fit)', async () => {
    const thumbPath = await getThumbnailPath(sourceImg, tmpDir)
    const meta = await sharp(thumbPath).metadata()
    expect(meta.width).toBe(160)
    expect(meta.height).toBe(160)
    expect(meta.format).toBe('jpeg')
  })

  it('returns cached thumbnail on second call without regenerating', async () => {
    const thumbPath = await getThumbnailPath(sourceImg, tmpDir)
    const { mtimeMs: mtime1 } = await fs.stat(thumbPath)

    // Small delay so mtime would differ if file were re-written
    await new Promise((r) => setTimeout(r, 20))

    const thumbPath2 = await getThumbnailPath(sourceImg, tmpDir)
    const { mtimeMs: mtime2 } = await fs.stat(thumbPath2)

    expect(thumbPath2).toBe(thumbPath)
    expect(mtime2).toBe(mtime1) // file was NOT re-written
  })

  it('regenerates thumbnail when source is newer than cache', async () => {
    const thumbPath = await getThumbnailPath(sourceImg, tmpDir)
    const { mtimeMs: cachedMtime } = await fs.stat(thumbPath)

    // Make source appear 10 seconds newer than the existing thumbnail
    const newer = new Date(cachedMtime + 10_000)
    await fs.utimes(sourceImg, newer, newer)

    // Small delay to ensure regenerated file gets a different mtime
    await new Promise((r) => setTimeout(r, 50))

    const thumbPath2 = await getThumbnailPath(sourceImg, tmpDir)
    const { mtimeMs: newMtime } = await fs.stat(thumbPath2)

    expect(thumbPath2).toBe(thumbPath) // same path
    expect(newMtime).toBeGreaterThan(cachedMtime) // file was re-written
  })

  it('creates the cache directory if it does not exist', async () => {
    const thumbPath = await getThumbnailPath(sourceImg, tmpDir)
    // Path contains .foco-cache/thumbnails/
    expect(thumbPath).toContain('.foco-cache')
    expect(thumbPath).toContain('thumbnails')
  })

  it('thumbnail filename is derived from source image name', async () => {
    const thumbPath = await getThumbnailPath(sourceImg, tmpDir)
    expect(thumbPath).toContain('photo.thumb.jpg')
  })
})
