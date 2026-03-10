import { useHotkeys } from 'react-hotkeys-hook'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { useEditorStore } from '../stores/editorStore'

export function useKeyboardShortcuts() {
  const { nextImage, prevImage, softDeleteCurrent } = useWorkspaceStore()
  const { isEditing, enterEditMode, exitEditMode } = useEditorStore()

  useHotkeys('right, j', () => { if (!isEditing) nextImage() }, { preventDefault: true })
  useHotkeys('left, k', () => { if (!isEditing) prevImage() }, { preventDefault: true })
  useHotkeys('d, delete', () => { if (!isEditing) softDeleteCurrent() }, { preventDefault: true })
  useHotkeys('e', () => { if (!isEditing) enterEditMode('crop') }, { preventDefault: true })
  useHotkeys('escape', () => { if (isEditing) exitEditMode() }, { preventDefault: true })
}
