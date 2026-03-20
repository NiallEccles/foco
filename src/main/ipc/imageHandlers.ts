import { ipcMain, dialog } from 'electron'
import { applyOperations, getImageMetadata } from '../services/imageService'
import type { ImageOperation } from '../services/imageService'
import { getExifData } from '../services/exifService'
import { getHistogram } from '../services/histogramService'

export function registerImageHandlers(): void {
  ipcMain.handle(
    'save-image',
    async (_event, sourcePath: string, operations: ImageOperation[]) => {
      await applyOperations(sourcePath, sourcePath, operations)
    }
  )

  ipcMain.handle(
    'save-image-as',
    async (_event, sourcePath: string, operations: ImageOperation[]) => {
      const result = await dialog.showSaveDialog({
        defaultPath: sourcePath,
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }
        ]
      })
      if (result.canceled || !result.filePath) return null
      await applyOperations(sourcePath, result.filePath, operations)
      return result.filePath
    }
  )

  ipcMain.handle('get-image-metadata', async (_event, imagePath: string) => {
    return getImageMetadata(imagePath)
  })

  ipcMain.handle('get-exif-data', async (_event, imagePath: string) => {
    return getExifData(imagePath)
  })

  ipcMain.handle('get-histogram', async (_event, imagePath: string) => {
    return getHistogram(imagePath)
  })
}
