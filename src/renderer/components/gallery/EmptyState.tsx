import { Stack, Text, Button } from '@mantine/core'
import { useWorkspaceStore } from '../../stores/workspaceStore'

export function EmptyState() {
  const openFolder = useWorkspaceStore((s) => s.openFolder)

  return (
    <Stack align="center" justify="center" className="h-full" gap="md">
      <Text size="xl" fw={600} c="dimmed">
        No folder open
      </Text>
      <Text size="sm" c="dimmed">
        Open a folder to start triaging your photos
      </Text>
      <Button onClick={openFolder} size="md">
        Open Folder
      </Button>
      <Text size="xs" c="dimmed">
        Supported formats: JPG, PNG, WebP, TIFF, AVIF, BMP, GIF
      </Text>
    </Stack>
  )
}
