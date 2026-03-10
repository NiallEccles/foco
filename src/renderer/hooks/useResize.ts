import { useState, useCallback } from 'react'
import type { ResizeDimensions } from '../types/editor'

export function useResize(initialWidth: number, initialHeight: number) {
  const [dims, setDims] = useState<ResizeDimensions>({
    width: initialWidth,
    height: initialHeight,
    keepAspectRatio: true,
    mode: 'pixels'
  })

  const aspectRatio = initialWidth > 0 ? initialWidth / initialHeight : 1

  const setWidth = useCallback(
    (w: number) => {
      setDims((prev) => ({
        ...prev,
        width: w,
        height: prev.keepAspectRatio ? Math.round(w / aspectRatio) : prev.height
      }))
    },
    [aspectRatio]
  )

  const setHeight = useCallback(
    (h: number) => {
      setDims((prev) => ({
        ...prev,
        height: h,
        width: prev.keepAspectRatio ? Math.round(h * aspectRatio) : prev.width
      }))
    },
    [aspectRatio]
  )

  const toggleAspectRatio = useCallback(() => {
    setDims((prev) => ({ ...prev, keepAspectRatio: !prev.keepAspectRatio }))
  }, [])

  const setMode = useCallback(
    (mode: 'pixels' | 'percent') => {
      if (mode === 'percent') {
        setDims((prev) => ({
          ...prev,
          mode,
          width: 100,
          height: 100
        }))
      } else {
        setDims((prev) => ({
          ...prev,
          mode,
          width: initialWidth,
          height: initialHeight
        }))
      }
    },
    [initialWidth, initialHeight]
  )

  const getFinalDimensions = useCallback((): { width: number; height: number } => {
    if (dims.mode === 'percent') {
      return {
        width: Math.round((initialWidth * dims.width) / 100),
        height: Math.round((initialHeight * dims.height) / 100)
      }
    }
    return { width: dims.width, height: dims.height }
  }, [dims, initialWidth, initialHeight])

  return { dims, setWidth, setHeight, toggleAspectRatio, setMode, getFinalDimensions }
}
