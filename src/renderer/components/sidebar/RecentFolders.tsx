import { useState } from 'react'
import { Stack, Text, UnstyledButton, Collapse, Group } from '@mantine/core'
import { useSettingsStore } from '../../stores/settingsStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'

export function RecentFolders() {
  const [open, setOpen] = useState(true)
  const recentFolders = useSettingsStore((s) => s.recentFolders)
  const openFolderPath = useWorkspaceStore((s) => s.openFolderPath)
  const currentFolderPath = useWorkspaceStore((s) => s.folderPath)
  const viewMode = useWorkspaceStore((s) => s.viewMode)

  if (recentFolders.length === 0) return null

  return (
    <Stack gap={4}>
      <UnstyledButton onClick={() => setOpen((o) => !o)}>
        <Group justify="space-between">
          <Text size="xs" c="dimmed" fw={500}>
            Recent
          </Text>
          <Text size="xs" c="dimmed">
            {open ? '▾' : '▸'}
          </Text>
        </Group>
      </UnstyledButton>

      <Collapse in={open}>
        <Stack gap={2}>
          {recentFolders.map((folderPath) => {
            const name = folderPath.split('/').pop() || folderPath
            const isCurrent = folderPath === currentFolderPath
            return (
              <UnstyledButton
                key={folderPath}
                disabled={viewMode === 'deleted'}
                onClick={() => openFolderPath(folderPath)}
                style={{ borderRadius: 4, padding: '3px 6px' }}
                styles={{
                  root: {
                    '&:hover': { background: 'var(--mantine-color-default-hover)' },
                    opacity: viewMode === 'deleted' ? 0.4 : 1
                  }
                }}
              >
                <Text
                  size="xs"
                  fw={isCurrent ? 600 : 400}
                  truncate
                  title={folderPath}
                >
                  {name}
                </Text>
              </UnstyledButton>
            )
          })}
        </Stack>
      </Collapse>
    </Stack>
  )
}
