import { useWorkspaceStore } from '../stores/workspaceStore'

export function useImageNavigation() {
  const { currentIndex, images, nextImage, prevImage, setCurrentIndex } = useWorkspaceStore()

  return {
    currentIndex,
    total: images.length,
    hasNext: currentIndex < images.length - 1,
    hasPrev: currentIndex > 0,
    nextImage,
    prevImage,
    goTo: setCurrentIndex
  }
}
