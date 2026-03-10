import { Box } from '@mantine/core'
import type { CropRect } from '../../types/editor'

interface CropOverlayProps {
  rect: CropRect
  containerWidth: number
  containerHeight: number
  onHandleMouseDown: (e: React.MouseEvent, handle: 'tl' | 'tr' | 'bl' | 'br' | 'move') => void
}

const HANDLE_SIZE = 10

export function CropOverlay({ rect, containerWidth, containerHeight, onHandleMouseDown }: CropOverlayProps) {
  const { x, y, width, height } = rect

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    background: 'white',
    border: '2px solid #228be6',
    borderRadius: 2
  }

  return (
    <>
      {/* Darkened overlay outside the crop rect - 4 rectangles */}
      {/* Top */}
      <Box style={{ position: 'absolute', top: 0, left: 0, width: containerWidth, height: y, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
      {/* Bottom */}
      <Box style={{ position: 'absolute', top: y + height, left: 0, width: containerWidth, height: containerHeight - y - height, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
      {/* Left */}
      <Box style={{ position: 'absolute', top: y, left: 0, width: x, height: height, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
      {/* Right */}
      <Box style={{ position: 'absolute', top: y, left: x + width, width: containerWidth - x - width, height: height, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }} />

      {/* Crop rect border */}
      <Box
        style={{
          position: 'absolute',
          top: y,
          left: x,
          width,
          height,
          border: '2px solid #228be6',
          cursor: 'move',
          boxSizing: 'border-box'
        }}
        onMouseDown={(e) => { e.stopPropagation(); onHandleMouseDown(e, 'move') }}
      />

      {/* Corner handles */}
      <Box style={{ ...handleStyle, top: y - HANDLE_SIZE / 2, left: x - HANDLE_SIZE / 2, cursor: 'nw-resize' }}
        onMouseDown={(e) => { e.stopPropagation(); onHandleMouseDown(e, 'tl') }} />
      <Box style={{ ...handleStyle, top: y - HANDLE_SIZE / 2, left: x + width - HANDLE_SIZE / 2, cursor: 'ne-resize' }}
        onMouseDown={(e) => { e.stopPropagation(); onHandleMouseDown(e, 'tr') }} />
      <Box style={{ ...handleStyle, top: y + height - HANDLE_SIZE / 2, left: x - HANDLE_SIZE / 2, cursor: 'sw-resize' }}
        onMouseDown={(e) => { e.stopPropagation(); onHandleMouseDown(e, 'bl') }} />
      <Box style={{ ...handleStyle, top: y + height - HANDLE_SIZE / 2, left: x + width - HANDLE_SIZE / 2, cursor: 'se-resize' }}
        onMouseDown={(e) => { e.stopPropagation(); onHandleMouseDown(e, 'br') }} />
    </>
  )
}
