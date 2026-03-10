import { Stack, Button, Text, Badge, Divider, Group } from '@mantine/core'
import { useWorkspaceStore } from '../../stores/workspaceStore'

export function Sidebar() {
  const { folderPath, images, deletedImages, openFolder } = useWorkspaceStore()

  const folderName = folderPath ? folderPath.split('/').pop() || folderPath : null

  return (
    <Stack p="md" gap="sm" style={{ height: '100%' }}>
      <Button onClick={openFolder} variant="filled" fullWidth>
        Open Folder
      </Button>

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

          {deletedImages.length > 0 && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Deleted
              </Text>
              <Badge size="sm" color="orange">
                {deletedImages.length}
              </Badge>
            </Group>
          )}
        </>
      )}

      <Stack gap={4} style={{ marginTop: 'auto' }}>
        <Divider />
        <Text size="xs" c="dimmed">
          Shortcuts:
        </Text>
        <Text size="xs" c="dimmed">
          ← / k — previous
        </Text>
        <Text size="xs" c="dimmed">
          → / j — next
        </Text>
        <Text size="xs" c="dimmed">
          d / Del — soft delete
        </Text>
      </Stack>
    </Stack>
  )
}
