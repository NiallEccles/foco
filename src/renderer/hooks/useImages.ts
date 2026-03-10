import { useWorkspaceStore } from '../stores/workspaceStore'

export function useImages() {
  const { images, currentIndex, folderPath, isLoading } = useWorkspaceStore()

  const currentImage = images[currentIndex] ?? null

  return {
    images,
    currentImage,
    currentIndex,
    folderPath,
    isLoading,
    total: images.length
  }
}
