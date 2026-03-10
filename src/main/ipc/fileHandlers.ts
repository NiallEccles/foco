import { ipcMain, dialog } from 'electron'
import { listImages, softDelete, restoreImage, listDeletedImages } from '../services/fileService'

export function registerFileHandlers(): void {
  ipcMain.handle('open-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const folderPath = result.filePaths[0]
    const images = await listImages(folderPath)
    return { folderPath, images }
  })

  ipcMain.handle('list-images', async (_event, folderPath: string) => {
    return listImages(folderPath)
  })

  ipcMain.handle('soft-delete', async (_event, imagePath: string, folderPath: string) => {
    await softDelete(imagePath, folderPath)
  })

  ipcMain.handle('restore-image', async (_event, deletedPath: string, folderPath: string) => {
    return restoreImage(deletedPath, folderPath)
  })

  ipcMain.handle('list-deleted', async (_event, folderPath: string) => {
    return listDeletedImages(folderPath)
  })
}
