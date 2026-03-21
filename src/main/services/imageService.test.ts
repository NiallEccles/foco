import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import sharp from 'sharp'
import { createTempDir, cleanupTempDir } from '../../../test/helpers/tempDir'
import { FIXTURES_DIR } from '../../../test/setup/globalSetup'
import { applyOperations, getImageMetadata } from './imageService'

let tmpDir: string
let sampleJpg: string

beforeAll(async () => {
  tmpDir = await createTempDir()
  sampleJpg = join(tmpDir, 'source.jpg')
  await fs.copyFile(join(FIXTURES_DIR, 'sample.jpg'), sampleJpg)
})

afterAll(() => cleanupTempDir(tmpDir))

describe('getImageMetadata', () => {
  it('returns correct width and height for a JPEG', async () => {
    const meta = await getImageMetadata(sampleJpg)
    expect(meta.width).toBe(100)
    expect(meta.height).toBe(100)
  })

  it('throws a descriptive error for non-existent file', async () => {
    await expect(getImageMetadata(join(tmpDir, 'ghost.jpg'))).rejects.toThrow()
  })
})

describe('applyOperations — crop', () => {
  it('extracts the specified region and writes a new file', async () => {
    const dest = join(tmpDir, 'cropped.jpg')
    await applyOperations(sampleJpg, dest, [
      { type: 'crop', rect: { x: 10, y: 10, width: 50, height: 40 } },
    ])
    const meta = await sharp(dest).metadata()
    expect(meta.width).toBe(50)
    expect(meta.height).toBe(40)
  })

  it('clamps negative x/y to 0', async () => {
    const dest = join(tmpDir, 'crop-negative.jpg')
    await applyOperations(sampleJpg, dest, [
      { type: 'crop', rect: { x: -5, y: -5, width: 30, height: 30 } },
    ])
    // Should not throw — sharp clamps x/y via Math.max(0, …) in the service
    const meta = await sharp(dest).metadata()
    expect(meta.width).toBe(30)
    expect(meta.height).toBe(30)
  })
})

describe('applyOperations — resize', () => {
  it('resizes to exact pixel dimensions', async () => {
    const dest = join(tmpDir, 'resized.jpg')
    await applyOperations(sampleJpg, dest, [
      { type: 'resize', width: 64, height: 48 },
    ])
    const meta = await sharp(dest).metadata()
    expect(meta.width).toBe(64)
    expect(meta.height).toBe(48)
  })

  it('writes a valid image file to the destination', async () => {
    const dest = join(tmpDir, 'valid-output.jpg')
    await applyOperations(sampleJpg, dest, [
      { type: 'resize', width: 20, height: 20 },
    ])
    await expect(fs.access(dest)).resolves.toBeUndefined()
    const meta = await sharp(dest).metadata()
    expect(meta.format).toBeTruthy()
  })
})

describe('applyOperations — chained operations', () => {
  it('applies crop then resize in order', async () => {
    const dest = join(tmpDir, 'chained.jpg')
    await applyOperations(sampleJpg, dest, [
      { type: 'crop', rect: { x: 0, y: 0, width: 80, height: 80 } },
      { type: 'resize', width: 40, height: 40 },
    ])
    const meta = await sharp(dest).metadata()
    expect(meta.width).toBe(40)
    expect(meta.height).toBe(40)
  })
})

describe('applyOperations — save to alternate path', () => {
  it('does not modify the source file', async () => {
    const dest = join(tmpDir, 'save-alt.jpg')
    const { size: srcSizeBefore } = await fs.stat(sampleJpg)
    await applyOperations(sampleJpg, dest, [
      { type: 'resize', width: 50, height: 50 },
    ])
    const { size: srcSizeAfter } = await fs.stat(sampleJpg)
    expect(srcSizeAfter).toBe(srcSizeBefore) // source untouched
    const meta = await sharp(dest).metadata()
    expect(meta.width).toBe(50)
  })
})
