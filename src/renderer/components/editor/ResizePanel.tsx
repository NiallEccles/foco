import { Stack, NumberInput, Group, Switch, SegmentedControl, Text, Divider } from '@mantine/core'
import { useResize } from '../../hooks/useResize'
import { useEditorStore } from '../../stores/editorStore'
import { useEffect } from 'react'

interface ResizePanelProps {
  initialWidth: number
  initialHeight: number
}

export function ResizePanel({ initialWidth, initialHeight }: ResizePanelProps) {
  const { setResizeDimensions } = useEditorStore()
  const { dims, setWidth, setHeight, toggleAspectRatio, setMode, getFinalDimensions } = useResize(
    initialWidth,
    initialHeight
  )

  useEffect(() => {
    const final = getFinalDimensions()
    setResizeDimensions({ ...dims, width: final.width, height: final.height })
  }, [dims])

  const final = getFinalDimensions()

  return (
    <Stack gap="sm" p="sm">
      <SegmentedControl
        size="xs"
        value={dims.mode}
        onChange={(v) => setMode(v as 'pixels' | 'percent')}
        data={[
          { label: 'Pixels', value: 'pixels' },
          { label: 'Percent', value: 'percent' }
        ]}
      />

      <Group gap="xs" align="flex-end">
        <NumberInput
          label="Width"
          size="sm"
          value={dims.width}
          onChange={(v) => setWidth(Number(v))}
          min={1}
          max={dims.mode === 'percent' ? 400 : initialWidth * 4}
          suffix={dims.mode === 'percent' ? '%' : 'px'}
          style={{ width: 100 }}
        />
        <NumberInput
          label="Height"
          size="sm"
          value={dims.height}
          onChange={(v) => setHeight(Number(v))}
          min={1}
          max={dims.mode === 'percent' ? 400 : initialHeight * 4}
          suffix={dims.mode === 'percent' ? '%' : 'px'}
          style={{ width: 100 }}
        />
      </Group>

      <Switch
        size="sm"
        label="Lock aspect ratio"
        checked={dims.keepAspectRatio}
        onChange={toggleAspectRatio}
      />

      {dims.mode === 'percent' && (
        <>
          <Divider />
          <Text size="xs" c="dimmed">
            Output: {final.width} × {final.height} px
          </Text>
        </>
      )}
    </Stack>
  )
}
