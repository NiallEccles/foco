import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Box, Center, Text, Loader } from '@mantine/core'
import type { ImageFile } from '../../types/image'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useViewerStore } from '../../stores/viewerStore'
import { useCanvasTransform } from '../../hooks/useCanvasTransform'

interface ImageViewerProps {
  image: ImageFile | null
}

export function ImageViewer({ image }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const fitScaleRef = useRef(1)

  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [loadedPath, setLoadedPath] = useState<string | null>(null)

  const { images, currentIndex } = useWorkspaceStore()
  const { setZoomPercent } = useViewerStore()
  const resetRequestCount = useViewerStore((s) => s.resetRequestCount)

  const {
    imageRef,
    hookScale,
    isDragging,
    resetTransform,
    onFitScaleUpdate,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleDoubleClick
  } = useCanvasTransform(containerRef, fitScaleRef)

  // Container resize observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setContainerSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Compute fitScale and re-apply transform when container or image size changes.
  // useLayoutEffect ensures the transform is applied before the browser paints,
  // preventing a flash of the un-scaled image.
  useLayoutEffect(() => {
    const { w: cw, h: ch } = containerSize
    const { w: nw, h: nh } = naturalSize
    if (!cw || !ch || !nw || !nh) return
    fitScaleRef.current = Math.min(cw / nw, ch / nh, 1)
    onFitScaleUpdate()
  }, [containerSize, naturalSize, onFitScaleUpdate])

  // Update zoom indicator whenever hookScale or image dimensions change
  useEffect(() => {
    const { w: nw, h: nh } = naturalSize
    const { w: cw, h: ch } = containerSize
    if (!nw || !nh || !cw || !ch) return
    const fitScale = Math.min(cw / nw, ch / nh, 1)
    setZoomPercent(Math.round(fitScale * hookScale * 100))
  }, [hookScale, naturalSize, containerSize, setZoomPercent])

  // Reset on image path change
  useEffect(() => {
    if (!image) return
    setNaturalSize({ w: 0, h: 0 })
    setLoadedPath(null)
    setZoomPercent(100)
    resetTransform()
  }, [image?.path]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset via keyboard shortcut (triggered from useKeyboardShortcuts via viewerStore)
  useEffect(() => {
    if (resetRequestCount === 0) return
    resetTransform()
    const { w: nw, h: nh } = naturalSize
    const { w: cw, h: ch } = containerSize
    if (nw && nh && cw && ch) {
      setZoomPercent(Math.round(Math.min(cw / nw, ch / nh, 1) * 100))
    }
  }, [resetRequestCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-fetch adjacent images into browser cache
  useEffect(() => {
    const adjacent = [images[currentIndex - 1], images[currentIndex + 1]].filter(Boolean)
    adjacent.forEach((img) => {
      const preload = new Image()
      preload.src = `safe-file://${img.path}`
    })
  }, [currentIndex, images])

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
      if (image) setLoadedPath(image.path)
    },
    [image]
  )

  if (!image) {
    return (
      <Center className="h-full">
        <Text c="dimmed">No image selected</Text>
      </Center>
    )
  }

  const isLoading = loadedPath !== image.path
  const cursor = isDragging ? 'grabbing' : hookScale > 1 ? 'grab' : 'default'

  return (
    <Box
      ref={containerRef}
      className="h-full w-full overflow-hidden flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
      style={{
        background: 'var(--mantine-color-dark-8, #1a1a1a)',
        cursor,
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {isLoading && (
        <Center style={{ position: 'absolute', inset: 0 }}>
          <Loader color="gray" size="sm" />
        </Center>
      )}
      <img
        ref={imageRef}
        src={`safe-file://${image.path}`}
        alt={image.name}
        onLoad={handleLoad}
        style={{
          display: 'block',
          opacity: isLoading ? 0 : 1,
          willChange: 'transform',
          userSelect: 'none',
          pointerEvents: 'none'
        }}
        draggable={false}
      />
    </Box>
  )
}
