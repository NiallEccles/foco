import { Group, Button, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { KeyboardHint } from '../common/KeyboardHint'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useEditorStore } from '../../stores/editorStore'
import type { ImageFile } from '../../types/image'

interface ViewerToolbarProps {
  currentImage: ImageFile | null
}

export function ViewerToolbar({ currentImage }: ViewerToolbarProps) {
  const { nextImage, softDeleteCurrent, restoreImage, folderPath } = useWorkspaceStore()
  const { enterEditMode } = useEditorStore()

  const handleDelete = async () => {
    if (!currentImage || !folderPath) return
    const deletedPath = `${folderPath}/_deleted/${currentImage.name}`
    await softDeleteCurrent()

    notifications.show({
      id: `deleted-${currentImage.path}`,
      title: 'Moved to deleted',
      message: (
        <Group gap="xs">
          <Text size="sm">{currentImage.name}</Text>
          <Button
            size="compact-xs"
            variant="subtle"
            onClick={async () => {
              await restoreImage(deletedPath)
              notifications.hide(`deleted-${currentImage.path}`)
            }}
          >
            Restore
          </Button>
        </Group>
      ),
      autoClose: 5000,
      color: 'orange'
    })
  }

  return (
    <Group
      justify="center"
      gap="sm"
      p="sm"
      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
    >
      <Button variant="subtle" onClick={nextImage} disabled={!currentImage} title="Keep & Next (→ or j)">
        Keep &amp; Next <KeyboardHint keys={['→']} />
      </Button>

      <Button
        variant="light"
        onClick={() => enterEditMode('crop')}
        disabled={!currentImage}
        title="Edit (e)"
      >
        Edit <KeyboardHint keys={['e']} />
      </Button>

      <Button color="red" variant="light" onClick={handleDelete} disabled={!currentImage} title="Delete (d)">
        Delete <KeyboardHint keys={['d']} />
      </Button>
    </Group>
  )
}
