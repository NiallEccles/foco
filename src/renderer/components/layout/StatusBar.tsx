import { Group, Text } from '@mantine/core'
import { useImages } from '../../hooks/useImages'

export function StatusBar() {
  const { currentImage, currentIndex, total } = useImages()

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <Group
      justify="space-between"
      px="sm"
      py={4}
      style={{
        borderTop: '1px solid var(--mantine-color-default-border)',
        fontSize: 12,
        background: 'var(--mantine-color-body)'
      }}
    >
      <Text size="xs" c="dimmed">
        {total > 0 ? `${currentIndex + 1} / ${total}` : 'No images'}
      </Text>
      {currentImage && (
        <Group gap="md">
          <Text size="xs" c="dimmed">
            {currentImage.name}
          </Text>
          <Text size="xs" c="dimmed">
            {formatSize(currentImage.size)}
          </Text>
        </Group>
      )}
    </Group>
  )
}
