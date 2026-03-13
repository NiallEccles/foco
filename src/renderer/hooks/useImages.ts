import { useWorkspaceStore } from '../stores/workspaceStore'

export function useImages() {
  const { images, deletedImages, currentIndex, deletedIndex, folderPath, isLoading, viewMode } = useWorkspaceStore()

  const activeImages = viewMode === 'deleted' ? deletedImages : images
  const activeIndex = viewMode === 'deleted' ? deletedIndex : currentIndex
  const currentImage = activeImages[activeIndex] ?? null

  return {
    images,
    currentImage,
    currentIndex: activeIndex,
    folderPath,
    isLoading,
    total: activeImages.length,
    viewMode
  }
}
