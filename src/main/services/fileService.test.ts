import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { createTempDir, cleanupTempDir } from '../../../test/helpers/tempDir'
import { FIXTURES_DIR } from '../../../test/setup/globalSetup'
import { listImages, softDelete, restoreImage, listDeletedImages } from './fileService'

let tmpDir: string

beforeAll(async () => {
  tmpDir = await createTempDir()
  // Copy fixture images into temp dir so they are writable
  await fs.copyFile(join(FIXTURES_DIR, 'sample.jpg'), join(tmpDir, 'a.jpg'))
  await fs.copyFile(join(FIXTURES_DIR, 'sample.jpg'), join(tmpDir, 'b.jpg'))
  await fs.copyFile(join(FIXTURES_DIR, 'sample.png'), join(tmpDir, 'c.png'))
})

afterEach(async () => {
  // Remove _deleted folder between tests to keep state clean
  await fs.rm(join(tmpDir, '_deleted'), { recursive: true, force: true })
})

describe('listImages', () => {
  it('returns only supported image files', async () => {
    const images = await listImages(tmpDir)
    const names = images.map((i) => i.name)
    expect(names).toContain('a.jpg')
    expect(names).toContain('b.jpg')
    expect(names).toContain('c.png')
  })

  it('returns images sorted by name', async () => {
    const images = await listImages(tmpDir)
    const names = images.map((i) => i.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })

  it('returns ImageFile with name, path, size, mtime fields', async () => {
    const images = await listImages(tmpDir)
    expect(images.length).toBeGreaterThan(0)
    const img = images[0]
    expect(img).toMatchObject({
      name: expect.any(String),
      path: expect.any(String),
      size: expect.any(Number),
      mtime: expect.any(String),
    })
    expect(img.path).toContain(img.name)
  })

  it('excludes files in _deleted subfolder', async () => {
    const deletedDir = join(tmpDir, '_deleted')
    await fs.mkdir(deletedDir, { recursive: true })
    await fs.copyFile(join(FIXTURES_DIR, 'sample.jpg'), join(deletedDir, 'deleted.jpg'))
    const images = await listImages(tmpDir)
    const names = images.map((i) => i.name)
    expect(names).not.toContain('deleted.jpg')
  })

  it('excludes hidden files', async () => {
    await fs.writeFile(join(tmpDir, '.hidden.jpg'), '')
    const images = await listImages(tmpDir)
    const names = images.map((i) => i.name)
    expect(names).not.toContain('.hidden.jpg')
    await fs.unlink(join(tmpDir, '.hidden.jpg'))
  })

  it('excludes non-image files', async () => {
    await fs.writeFile(join(tmpDir, 'readme.txt'), 'text')
    const images = await listImages(tmpDir)
    const names = images.map((i) => i.name)
    expect(names).not.toContain('readme.txt')
    await fs.unlink(join(tmpDir, 'readme.txt'))
  })
})

describe('softDelete', () => {
  it('moves file to _deleted subfolder', async () => {
    const srcPath = join(tmpDir, 'a.jpg')
    await softDelete(srcPath, tmpDir)
    await expect(fs.access(srcPath)).rejects.toThrow()
    await expect(fs.access(join(tmpDir, '_deleted', 'a.jpg'))).resolves.toBeUndefined()
    // Restore for other tests
    await restoreImage(join(tmpDir, '_deleted', 'a.jpg'), tmpDir)
  })

  it('creates _deleted folder if it does not exist', async () => {
    await fs.rm(join(tmpDir, '_deleted'), { recursive: true, force: true })
    await softDelete(join(tmpDir, 'b.jpg'), tmpDir)
    await expect(fs.access(join(tmpDir, '_deleted', 'b.jpg'))).resolves.toBeUndefined()
    await restoreImage(join(tmpDir, '_deleted', 'b.jpg'), tmpDir)
  })
})

describe('restoreImage', () => {
  it('moves file back to original folder', async () => {
    await softDelete(join(tmpDir, 'a.jpg'), tmpDir)
    await restoreImage(join(tmpDir, '_deleted', 'a.jpg'), tmpDir)
    await expect(fs.access(join(tmpDir, 'a.jpg'))).resolves.toBeUndefined()
    await expect(fs.access(join(tmpDir, '_deleted', 'a.jpg'))).rejects.toThrow()
  })

  it('returns the restored file path', async () => {
    await softDelete(join(tmpDir, 'a.jpg'), tmpDir)
    const restoredPath = await restoreImage(join(tmpDir, '_deleted', 'a.jpg'), tmpDir)
    expect(restoredPath).toBe(join(tmpDir, 'a.jpg'))
  })
})

describe('listDeletedImages', () => {
  it('returns images in _deleted subfolder', async () => {
    await softDelete(join(tmpDir, 'a.jpg'), tmpDir)
    const deleted = await listDeletedImages(tmpDir)
    expect(deleted.map((i) => i.name)).toContain('a.jpg')
    await restoreImage(join(tmpDir, '_deleted', 'a.jpg'), tmpDir)
  })

  it('returns empty array when _deleted folder does not exist', async () => {
    await fs.rm(join(tmpDir, '_deleted'), { recursive: true, force: true })
    const deleted = await listDeletedImages(tmpDir)
    expect(deleted).toEqual([])
  })
})
