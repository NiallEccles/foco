import { contextBridge, ipcRenderer } from 'electron'
import type { FocoAPI, ImageOperation } from './types'

const api: FocoAPI = {
  openFolder: () => ipcRenderer.invoke('open-folder'),
  listImages: (folderPath) => ipcRenderer.invoke('list-images', folderPath),
  softDelete: (imagePath, folderPath) => ipcRenderer.invoke('soft-delete', imagePath, folderPath),
  restoreImage: (deletedPath, folderPath) => ipcRenderer.invoke('restore-image', deletedPath, folderPath),
  listDeleted: (folderPath) => ipcRenderer.invoke('list-deleted', folderPath),
  saveImage: (sourcePath: string, operations: ImageOperation[]) =>
    ipcRenderer.invoke('save-image', sourcePath, operations),
  saveImageAs: (sourcePath: string, operations: ImageOperation[]) =>
    ipcRenderer.invoke('save-image-as', sourcePath, operations),
  getImageMetadata: (imagePath: string) => ipcRenderer.invoke('get-image-metadata', imagePath),
  getThumbnail: (imagePath: string, folderPath: string) =>
    ipcRenderer.invoke('get-thumbnail', imagePath, folderPath)
}

contextBridge.exposeInMainWorld('api', api)
