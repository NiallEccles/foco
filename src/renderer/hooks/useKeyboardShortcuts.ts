import { useHotkeys } from 'react-hotkeys-hook'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { useEditorStore } from '../stores/editorStore'
import { useViewerStore } from '../stores/viewerStore'
import { useSettingsStore } from '../stores/settingsStore'

export function useKeyboardShortcuts() {
  const { nextImage, prevImage, softDeleteCurrent, nextDeletedImage, prevDeletedImage, restoreCurrentDeleted, exitDeletedView, enterDeletedView, viewMode } = useWorkspaceStore()
  const { isEditing, enterEditMode, exitEditMode } = useEditorStore()
  const { requestReset, requestZoomIn, requestZoomOut } = useViewerStore()
  const { filmStripOrientation, toggleExifPanel, toggleHistogram, toggleShortcuts } = useSettingsStore()

  const isDeleted = viewMode === 'deleted'
  const isVertical = ['left', 'right'].includes(filmStripOrientation)

  useHotkeys(isVertical ? 'down, j' : 'right, j', () => {
    if (isEditing) return
    if (isDeleted) nextDeletedImage()
    else nextImage()
  }, { preventDefault: true }, [isEditing, isDeleted])

  useHotkeys(isVertical ? 'up, k' : 'left, k', () => {
    if (isEditing) return
    if (isDeleted) prevDeletedImage()
    else prevImage()
  }, { preventDefault: true }, [isEditing, isDeleted])

  useHotkeys('space', () => {
    if (!isEditing && !isDeleted) nextImage()
  }, { preventDefault: true }, [isEditing, isDeleted])

  useHotkeys('d, delete', () => {
    if (!isEditing && !isDeleted) softDeleteCurrent()
  }, { preventDefault: true }, [isEditing, isDeleted])

  useHotkeys('r', () => {
    if (!isEditing && isDeleted) restoreCurrentDeleted()
  }, { preventDefault: true }, [isEditing, isDeleted])

  useHotkeys('v', () => {
    if (!isEditing && !isDeleted) enterDeletedView()
  }, { preventDefault: true }, [isEditing, isDeleted])

  useHotkeys('e', () => { if (!isEditing && !isDeleted) enterEditMode('crop') }, { preventDefault: true }, [isEditing, isDeleted])

  useHotkeys('escape', () => {
    if (isEditing) exitEditMode()
    else if (isDeleted) exitDeletedView()
  }, { preventDefault: true }, [isEditing, isDeleted])

  useHotkeys('0', () => { if (!isEditing) requestReset() }, { preventDefault: true })

  useHotkeys('equal, shift+equal', () => { if (!isEditing) requestZoomIn() }, { preventDefault: true }, [isEditing])
  useHotkeys('minus', () => { if (!isEditing) requestZoomOut() }, { preventDefault: true }, [isEditing])

  useHotkeys('i', () => { if (!isEditing) toggleExifPanel() }, { preventDefault: true }, [isEditing])
  useHotkeys('h', () => { if (!isEditing) toggleHistogram() }, { preventDefault: true }, [isEditing])
  useHotkeys('f', () => { window.api.toggleFullscreen() }, { preventDefault: true })
  useHotkeys('shift+slash', () => { toggleShortcuts() }, { preventDefault: true })
}
