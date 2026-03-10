import { useRef, useEffect, useState, useCallback } from 'react'
import { Box, LoadingOverlay, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useEditorStore } from '../../stores/editorStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { CropOverlay } from './CropOverlay'
import { ResizePanel } from './ResizePanel'
import { EditorToolbar } from './EditorToolbar'
import { useCrop } from '../../hooks/useCrop'
import { api } from '../../services/api'
import type { ImageFile } from '../../types/image'
import type { ImageOperation } from '../../../preload/types'

interface EditorCanvasProps {
  image: ImageFile
}

export function EditorCanvas({ image }: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })
  const [isApplying, setIsApplying] = useState(false)

  const { activeTool, cropRect, resizeDimensions, setCropRect, setOriginalDimensions, exitEditMode } = useEditorStore()
  const { images, currentIndex } = useWorkspaceStore()

  // Measure the displayed image size for crop overlay
  useEffect(() => {
    const measure = () => {
      if (imgRef.current) {
        const r = imgRef.current.getBoundingClientRect()
        setDisplaySize({ width: r.width, height: r.height })
      }
    }
    const observer = new ResizeObserver(measure)
    if (imgRef.current) observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [image.path])

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      const natural = { width: imgRef.current.naturalWidth, height: imgRef.current.naturalHeight }
      setNaturalSize(natural)
      setOriginalDimensions(natural.width, natural.height)
      const r = imgRef.current.getBoundingClientRect()
      setDisplaySize({ width: r.width, height: r.height })
    }
  }, [setOriginalDimensions])

  const { displayRect, onCanvasMouseDown, onMouseMove, onMouseUp, onHandleMouseDown } = useCrop({
    imageWidth: naturalSize.width,
    imageHeight: naturalSize.height,
    displayWidth: displaySize.width,
    displayHeight: displaySize.height,
    onCropChange: setCropRect
  })

  // Get image position relative to container
  const getImageOffset = () => {
    if (!containerRef.current || !imgRef.current) return { x: 0, y: 0 }
    const containerRect = containerRef.current.getBoundingClientRect()
    const imgRect = imgRef.current.getBoundingClientRect()
    return { x: imgRect.left - containerRect.left, y: imgRect.top - containerRect.top }
  }

  const buildOperations = (): ImageOperation[] => {
    const ops: ImageOperation[] = []
    if (activeTool === 'crop' && cropRect) {
      ops.push({ type: 'crop', rect: cropRect })
    } else if (activeTool === 'resize' && resizeDimensions) {
      ops.push({ type: 'resize', width: resizeDimensions.width, height: resizeDimensions.height })
    }
    return ops
  }

  const handleApply = async () => {
    const ops = buildOperations()
    if (ops.length === 0) return
    setIsApplying(true)
    try {
      await api.saveImage(image.path, ops)
      notifications.show({ title: 'Saved', message: image.name, color: 'green', autoClose: 3000 })
      exitEditMode()
    } catch (err) {
      notifications.show({ title: 'Save failed', message: String(err), color: 'red' })
    } finally {
      setIsApplying(false)
    }
  }

  const handleApplyAs = async () => {
    const ops = buildOperations()
    if (ops.length === 0) return
    setIsApplying(true)
    try {
      const savedPath = await api.saveImageAs(image.path, ops)
      if (savedPath) {
        notifications.show({ title: 'Saved', message: savedPath, color: 'green', autoClose: 3000 })
        exitEditMode()
      }
    } catch (err) {
      notifications.show({ title: 'Save failed', message: String(err), color: 'red' })
    } finally {
      setIsApplying(false)
    }
  }

  const imgOffset = getImageOffset()

  // Suppress unused variable warning - currentIndex is available for future use
  void images
  void currentIndex

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Image area */}
      <Box
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          background: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: activeTool === 'crop' ? 'crosshair' : 'default'
        }}
        onMouseDown={activeTool === 'crop' ? onCanvasMouseDown : undefined}
        onMouseMove={activeTool === 'crop' ? onMouseMove : undefined}
        onMouseUp={activeTool === 'crop' ? onMouseUp : undefined}
        onMouseLeave={activeTool === 'crop' ? onMouseUp : undefined}
      >
        <LoadingOverlay visible={isApplying} />
        <img
          ref={imgRef}
          src={`safe-file://${image.path}`}
          alt={image.name}
          onLoad={handleImageLoad}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
          draggable={false}
        />

        {/* Crop overlay - positioned over the actual image, not the whole container */}
        {activeTool === 'crop' && displayRect && displayRect.width > 5 && displayRect.height > 5 && (
          <Box
            style={{
              position: 'absolute',
              top: imgOffset.y,
              left: imgOffset.x,
              width: displaySize.width,
              height: displaySize.height,
              pointerEvents: 'none'
            }}
          >
            <Box style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'all' }}>
              <CropOverlay
                rect={displayRect}
                containerWidth={displaySize.width}
                containerHeight={displaySize.height}
                onHandleMouseDown={onHandleMouseDown}
              />
            </Box>
          </Box>
        )}

        {activeTool === 'crop' && !displayRect && (
          <Box
            style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: 4,
              pointerEvents: 'none'
            }}
          >
            <Text size="sm">Click and drag to select crop area</Text>
          </Box>
        )}
      </Box>

      {/* Resize panel - shown inline below image when resize tool is active */}
      {activeTool === 'resize' && naturalSize.width > 0 && (
        <Box style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
          <ResizePanel initialWidth={naturalSize.width} initialHeight={naturalSize.height} />
        </Box>
      )}

      {/* Editor toolbar */}
      <EditorToolbar
        onApply={handleApply}
        onApplyAs={handleApplyAs}
        onCancel={exitEditMode}
        isApplying={isApplying}
      />
    </Box>
  )
}
