import { promises as fs } from 'fs'
import { join } from 'path'
import os from 'os'

export async function createTempDir(): Promise<string> {
  return fs.mkdtemp(join(os.tmpdir(), 'foco-test-'))
}

export async function cleanupTempDir(dir: string): Promise<void> {
  await fs.rm(dir, { recursive: true, force: true })
}
