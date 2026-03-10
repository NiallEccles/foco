import { create } from 'zustand'
import type { ImageFile } from '../types/image'
import { api } from '../services/api'

interface WorkspaceState {
  folderPath: string | null
  images: ImageFile[]
  deletedImages: ImageFile[]
  currentIndex: number
  isLoading: boolean

  openFolder: () => Promise<void>
  setCurrentIndex: (index: number) => void
  nextImage: () => void
  prevImage: () => void
  softDeleteCurrent: () => Promise<void>
  restoreImage: (deletedPath: string) => Promise<void>
  refreshDeleted: () => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  folderPath: null,
  images: [],
  deletedImages: [],
  currentIndex: 0,
  isLoading: false,

  openFolder: async () => {
    set({ isLoading: true })
    const result = await api.openFolder()
    if (result) {
      set({
        folderPath: result.folderPath,
        images: result.images,
        currentIndex: 0,
        isLoading: false
      })
    } else {
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
  }
}))
