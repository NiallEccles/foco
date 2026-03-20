import { Modal, Table, Text, Stack, Kbd } from '@mantine/core'
import { useSettingsStore } from '../../stores/settingsStore'

interface ShortcutRow {
  keys: string[]
  description: string
}

interface Section {
  title: string
  rows: ShortcutRow[]
}

const SECTIONS: Section[] = [
  {
    title: 'Navigation',
    rows: [
      { keys: ['→', 'j'], description: 'Next image' },
      { keys: ['←', 'k'], description: 'Previous image' },
      { keys: ['Space'], description: 'Keep & next' },
    ]
  },
  {
    title: 'Image Actions',
    rows: [
      { keys: ['d', 'Del'], description: 'Soft delete' },
      { keys: ['e'], description: 'Crop & edit' },
      { keys: ['v'], description: 'View deleted folder' },
    ]
  },
  {
    title: 'Deleted View',
    rows: [
      { keys: ['r'], description: 'Restore image' },
      { keys: ['Esc'], description: 'Exit deleted view' },
    ]
  },
  {
    title: 'Zoom & View',
    rows: [
      { keys: ['+', '='], description: 'Zoom in' },
      { keys: ['-'], description: 'Zoom out' },
      { keys: ['0'], description: 'Reset zoom' },
      { keys: ['i'], description: 'Toggle EXIF panel' },
      { keys: ['h'], description: 'Toggle histogram' },
      { keys: ['f'], description: 'Toggle fullscreen' },
    ]
  },
  {
    title: 'Editor',
    rows: [
      { keys: ['Esc'], description: 'Cancel / exit editor' },
    ]
  },
  {
    title: 'Global',
    rows: [
      { keys: ['?'], description: 'Show this shortcuts list' },
    ]
  },
]

export function ShortcutsModal() {
  const { showShortcuts, toggleShortcuts } = useSettingsStore()

  return (
    <Modal
      opened={showShortcuts}
      onClose={toggleShortcuts}
      title={<Text fw={600}>Keyboard Shortcuts</Text>}
      size="sm"
    >
      <Stack gap="md">
        {SECTIONS.map((section) => (
          <Stack key={section.title} gap={4}>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              {section.title}
            </Text>
            <Table verticalSpacing={4} horizontalSpacing="xs">
              <Table.Tbody>
                {section.rows.map((row) => (
                  <Table.Tr key={row.description}>
                    <Table.Td style={{ width: 120 }}>
                      <span style={{ display: 'flex', gap: 4 }}>
                        {row.keys.map((k) => (
                          <Kbd key={k} size="xs">{k}</Kbd>
                        ))}
                      </span>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{row.description}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        ))}
      </Stack>
    </Modal>
  )
}
