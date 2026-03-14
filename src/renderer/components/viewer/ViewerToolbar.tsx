import { Group, Button, Text, SegmentedControl } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { KeyboardHint } from '../common/KeyboardHint'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore, type FilmStripOrientation } from '../../stores/settingsStore'
import { useViewerStore } from '../../stores/viewerStore'
import type { ImageFile } from '../../types/image'
import { PanelBottom, PanelRight, PanelLeft, Info } from 'lucide-react'

interface ViewerToolbarProps {
  currentImage: ImageFile | null
}

export function ViewerToolbar({ currentImage }: ViewerToolbarProps) {
  const { nextImage, softDeleteCurrent, restoreImage, folderPath, viewMode, restoreCurrentDeleted } = useWorkspaceStore()
  const { enterEditMode } = useEditorStore()
  const { filmStripOrientation, setFilmStripOrientation, exifPanelOpen, toggleExifPanel } = useSettingsStore()
  const { zoomPercent, requestReset } = useViewerStore()

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
      justify="space-between"
      gap="sm"
      p="sm"
      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
    >
      <Group gap="sm">
        {viewMode === 'deleted' ? (
          <Button color="green" variant="light" onClick={restoreCurrentDeleted} disabled={!currentImage} title="Restore (r)">
            Restore <KeyboardHint keys={['r']} />
          </Button>
        ) : (
          <>
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
          </>
        )}
      </Group>

      <Group gap="xs">
        <Button
          variant="subtle"
          size="compact-xs"
          onClick={requestReset}
          title="Reset zoom (0)"
          disabled={!currentImage}
          style={{ fontVariantNumeric: 'tabular-nums', minWidth: 52 }}
        >
          {zoomPercent}% <KeyboardHint keys={['0']} />
        </Button>

        <Button
          variant={exifPanelOpen ? 'light' : 'subtle'}
          size="compact-xs"
          onClick={toggleExifPanel}
          disabled={!currentImage}
          title="Image info (i)"
        >
          <Info size={14} />
        </Button>
      </Group>

      <SegmentedControl
        size="xs"
        value={filmStripOrientation}
        onChange={(v) => setFilmStripOrientation(v as FilmStripOrientation)}
        data={[
          { label: <PanelLeft size={16} className='flex' />, value: 'left' },
          { label: <PanelBottom size={16} className='flex' />, value: 'bottom' },
          { label: <PanelRight size={16} className='flex' />, value: 'right' }
        ]}
      />
    </Group>
  )
}
