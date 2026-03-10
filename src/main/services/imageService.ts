import sharp from 'sharp'
import type { CropRect } from './types'

export interface CropOperation {
  type: 'crop'
  rect: CropRect
}

export interface ResizeOperation {
  type: 'resize'
  width: number
  height: number
}

export type ImageOperation = CropOperation | ResizeOperation

export async function applyOperations(
  sourcePath: string,
  destPath: string,
  operations: ImageOperation[]
): Promise<void> {
  let pipeline = sharp(sourcePath)

  for (const op of operations) {
    if (op.type === 'crop') {
      pipeline = pipeline.extract({
        left: Math.max(0, op.rect.x),
        top: Math.max(0, op.rect.y),
        width: op.rect.width,
        height: op.rect.height
      })
    } else if (op.type === 'resize') {
      pipeline = pipeline.resize(op.width, op.height, { fit: 'fill' })
    }
  }

  await pipeline.toFile(destPath)
}

export async function getImageMetadata(imagePath: string): Promise<{ width: number; height: number }> {
  const meta = await sharp(imagePath).metadata()
  return { width: meta.width ?? 0, height: meta.height ?? 0 }
}
