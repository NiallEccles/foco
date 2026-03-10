import { Group, Button, SegmentedControl } from '@mantine/core'
import { useEditorStore } from '../../stores/editorStore'
import type { EditorTool } from '../../types/editor'

interface EditorToolbarProps {
  onApply: () => Promise<void>
  onApplyAs: () => Promise<void>
  onCancel: () => void
  isApplying: boolean
}

export function EditorToolbar({ onApply, onApplyAs, onCancel, isApplying }: EditorToolbarProps) {
  const { activeTool, setTool, isDirty } = useEditorStore()

  return (
    <Group
      justify="space-between"
      p="sm"
      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
    >
      <SegmentedControl
        size="sm"
        value={activeTool ?? 'crop'}
        onChange={(v) => setTool(v as EditorTool)}
        data={[
          { label: 'Crop', value: 'crop' },
          { label: 'Resize', value: 'resize' }
        ]}
      />

      <Group gap="xs">
        <Button variant="subtle" onClick={onCancel} disabled={isApplying}>
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={onApplyAs}
          disabled={!isDirty || isApplying}
          loading={isApplying}
        >
          Save As…
        </Button>
        <Button
          onClick={onApply}
          disabled={!isDirty || isApplying}
          loading={isApplying}
        >
          Save
        </Button>
      </Group>
    </Group>
  )
}
