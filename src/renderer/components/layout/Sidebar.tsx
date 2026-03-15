import { Stack, Button, Text, Badge, Divider, Group } from '@mantine/core'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { RecentFolders } from '../sidebar/RecentFolders'

export function Sidebar() {
  const { folderPath, images, deletedImages, openFolder, viewMode, enterDeletedView, exitDeletedView } = useWorkspaceStore()
  const { filmStripOrientation } = useSettingsStore();

  const folderName = folderPath ? folderPath.split('/').pop() || folderPath : null

  return (
    <Stack p="md" gap="sm" style={{ height: '100%' }}>
      <Button onClick={openFolder} variant="filled" fullWidth disabled={viewMode === 'deleted'}>
        Open Folder
      </Button>

      <RecentFolders />

      {folderPath && (
        <>
          <Divider />
          <Stack gap={4}>
            <Text size="sm" fw={600} truncate>
              {folderName}
            </Text>
            <Text size="xs" c="dimmed">
              {folderPath}
            </Text>
          </Stack>

          <Group justify="space-between">
            <Text size="sm">Images</Text>
            <Badge size="sm" color="blue">
              {images.length}
            </Badge>
          </Group>

          {viewMode === 'deleted' ? (
            <Button
              variant="light"
              color="gray"
              size="xs"
              fullWidth
              onClick={exitDeletedView}
            >
              ← Back to Images
            </Button>
          ) : (
            deletedImages.length > 0 && (
              <Button
                variant="subtle"
                color="orange"
                size="xs"
                fullWidth
                justify="space-between"
                rightSection={
                  <Badge size="sm" color="orange" variant="filled">
                    {deletedImages.length}
                  </Badge>
                }
                onClick={enterDeletedView}
              >
                Deleted
              </Button>
            )
          )}
        </>
      )}

      <Stack gap={4} style={{ marginTop: 'auto' }}>
        <Divider />
        <Text size="xs" c="dimmed">
          Shortcuts:
        </Text>
        {viewMode === 'deleted' ? (
          <>
            {["left", "right"].includes(filmStripOrientation) && <Text size="xs" c="dimmed">↑ / ↓ — switch image</Text>}
            {["bottom"].includes(filmStripOrientation) && <Text size="xs" c="dimmed">← / → — switch image</Text>}
            <Text size="xs" c="dimmed">r — restore</Text>
            <Text size="xs" c="dimmed">Esc — back to browse</Text>
          </>
        ) : (
          <>
            {["left", "right"].includes(filmStripOrientation) && <Text size="xs" c="dimmed">↑ / ↓ — switch image</Text>}
            {["bottom"].includes(filmStripOrientation) && <Text size="xs" c="dimmed">← / → — switch image</Text>}
            <Text size="xs" c="dimmed">d / Del — soft delete</Text>
          </>
        )}
      </Stack>
    </Stack>
  )
}
