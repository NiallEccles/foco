import { useState, useCallback } from 'react'
import { Box, Center, Text } from '@mantine/core'
import type { ImageFile } from '../../types/image'

interface ImageViewerProps {
  image: ImageFile | null
}

export function ImageViewer({ image }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [fitMode, setFitMode] = useState<'fit' | '1:1'>('fit')

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((z) => {
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      return Math.min(Math.max(z * delta, 0.1), 10)
    })
  }, [])

  const handleDoubleClick = useCallback(() => {
    if (fitMode === 'fit') {
      setZoom(1)
      setFitMode('1:1')
    } else {
      setZoom(1)
      setFitMode('fit')
    }
  }, [fitMode])

  if (!image) {
    return (
      <Center className="h-full">
        <Text c="dimmed">No image selected</Text>
      </Center>
    )
  }

  return (
    <Box
      className="h-full w-full overflow-hidden flex items-center justify-center"
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      style={{ background: 'var(--mantine-color-dark-8, #1a1a1a)', cursor: 'zoom-in' }}
    >
      <img
        src={`safe-file://${image.path}`}
        alt={image.name}
        style={{
          maxWidth: fitMode === 'fit' ? '100%' : 'none',
          maxHeight: fitMode === 'fit' ? '100%' : 'none',
          transform: fitMode === '1:1' ? `scale(${zoom})` : 'none',
          objectFit: 'contain',
          transition: 'transform 0.1s ease',
          userSelect: 'none',
          display: 'block'
        }}
        draggable={false}
      />
    </Box>
  )
}
