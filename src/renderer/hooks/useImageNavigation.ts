import { useWorkspaceStore } from '../stores/workspaceStore'

export function useImageNavigation() {
  const {
    currentIndex, images, nextImage, prevImage, setCurrentIndex,
    deletedIndex, deletedImages, nextDeletedImage, prevDeletedImage, setDeletedIndex,
    viewMode
  } = useWorkspaceStore()

  const isDeleted = viewMode === 'deleted'
  const activeIndex = isDeleted ? deletedIndex : currentIndex
  const activeImages = isDeleted ? deletedImages : images

  return {
    currentIndex: activeIndex,
    total: activeImages.length,
    hasNext: activeIndex < activeImages.length - 1,
    hasPrev: activeIndex > 0,
    nextImage: isDeleted ? nextDeletedImage : nextImage,
    prevImage: isDeleted ? prevDeletedImage : prevImage,
    goTo: isDeleted ? setDeletedIndex : setCurrentIndex
  }
}
