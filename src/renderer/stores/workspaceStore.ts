import { create } from 'zustand'
import type { ImageFile } from '../types/image'
import { api } from '../services/api'
import { useSettingsStore } from './settingsStore'

interface WorkspaceState {
  folderPath: string | null
  images: ImageFile[]
  deletedImages: ImageFile[]
  currentIndex: number
  isLoading: boolean
  viewMode: 'browse' | 'deleted'
  deletedIndex: number

  openFolder: () => Promise<void>
  openFolderPath: (folderPath: string) => Promise<void>
  setCurrentIndex: (index: number) => void
  nextImage: () => void
  prevImage: () => void
  softDeleteCurrent: () => Promise<void>
  restoreImage: (deletedPath: string) => Promise<void>
  refreshDeleted: () => Promise<void>
  enterDeletedView: () => Promise<void>
  exitDeletedView: () => void
  setDeletedIndex: (index: number) => void
  nextDeletedImage: () => void
  prevDeletedImage: () => void
  restoreCurrentDeleted: () => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  folderPath: null,
  images: [],
  deletedImages: [],
  currentIndex: 0,
  isLoading: false,
  viewMode: 'browse',
  deletedIndex: 0,

  openFolder: async () => {
    set({ isLoading: true })
    const result = await api.openFolder()
    if (result) {
      useSettingsStore.getState().addRecentFolder(result.folderPath)
      const deleted = await api.listDeleted(result.folderPath)
      set({
        folderPath: result.folderPath,
        images: result.images,
        deletedImages: deleted,
        currentIndex: 0,
        isLoading: false
      })
    } else {
      set({ isLoading: false })
    }
  },

  openFolderPath: async (folderPath) => {
    set({ isLoading: true })
    try {
      const [images, deleted] = await Promise.all([
        api.listImages(folderPath),
        api.listDeleted(folderPath)
      ])
      useSettingsStore.getState().addRecentFolder(folderPath)
      set({ folderPath, images, deletedImages: deleted, currentIndex: 0, isLoading: false, viewMode: 'browse' })
    } catch {
      set({ isLoading: false })
    }
  },

  setCurrentIndex: (index) => {
    const { images } = get()
    if (index >= 0 && index < images.length) {
      set({ currentIndex: index })
    }
  },

  nextImage: () => {
    const { currentIndex, images } = get()
    if (currentIndex < images.length - 1) {
      set({ currentIndex: currentIndex + 1 })
    }
  },

  prevImage: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 })
    }
  },

  softDeleteCurrent: async () => {
    const { folderPath, images, currentIndex } = get()
    if (!folderPath || images.length === 0) return

    const imageToDelete = images[currentIndex]
    const newImages = images.filter((_, i) => i !== currentIndex)
    const newIndex = Math.min(currentIndex, newImages.length - 1)

    // Optimistic update
    set({ images: newImages, currentIndex: Math.max(0, newIndex) })

    try {
      await api.softDelete(imageToDelete.path, folderPath)
      // Refresh deleted list
      const deleted = await api.listDeleted(folderPath)
      set({ deletedImages: deleted })
    } catch (err) {
      // Rollback on failure
      set({ images, currentIndex })
      console.error('Failed to delete image:', err)
    }
  },

  restoreImage: async (deletedPath: string) => {
    const { folderPath } = get()
    if (!folderPath) return

    try {
      const restoredPath = await api.restoreImage(deletedPath, folderPath)
      const images = await api.listImages(folderPath)
      const deleted = await api.listDeleted(folderPath)
      const newIndex = images.findIndex((img) => img.path === restoredPath)
      set({
        images,
        deletedImages: deleted,
        currentIndex: newIndex >= 0 ? newIndex : 0
      })
    } catch (err) {
      console.error('Failed to restore image:', err)
    }
  },

  refreshDeleted: async () => {
    const { folderPath } = get()
    if (!folderPath) return
    const deleted = await api.listDeleted(folderPath)
    set({ deletedImages: deleted })
  },

  enterDeletedView: async () => {
    const { folderPath } = get()
    if (!folderPath) return
    const deleted = await api.listDeleted(folderPath)
    set({ deletedImages: deleted, viewMode: 'deleted', deletedIndex: 0 })
  },

  exitDeletedView: () => {
    set({ viewMode: 'browse' })
  },

  setDeletedIndex: (index) => {
    const { deletedImages } = get()
    if (index >= 0 && index < deletedImages.length) {
      set({ deletedIndex: index })
    }
  },

  nextDeletedImage: () => {
    const { deletedIndex, deletedImages } = get()
    if (deletedIndex < deletedImages.length - 1) {
      set({ deletedIndex: deletedIndex + 1 })
    }
  },

  prevDeletedImage: () => {
    const { deletedIndex } = get()
    if (deletedIndex > 0) {
      set({ deletedIndex: deletedIndex - 1 })
    }
  },

  restoreCurrentDeleted: async () => {
    const { folderPath, deletedImages, deletedIndex } = get()
    if (!folderPath || deletedImages.length === 0) return

    const imageToRestore = deletedImages[deletedIndex]
    const newDeletedImages = deletedImages.filter((_, i) => i !== deletedIndex)
    const newDeletedIndex = Math.min(deletedIndex, Math.max(0, newDeletedImages.length - 1))

    // Optimistic update
    set({ deletedImages: newDeletedImages, deletedIndex: newDeletedIndex })

    try {
      await api.restoreImage(imageToRestore.path, folderPath)
      const images = await api.listImages(folderPath)
      const deleted = await api.listDeleted(folderPath)
      set({ images, deletedImages: deleted })

      if (deleted.length === 0) {
        set({ viewMode: 'browse' })
      }
    } catch (err) {
      // Rollback on failure
      set({ deletedImages, deletedIndex })
      console.error('Failed to restore image:', err)
    }
  }
}))
