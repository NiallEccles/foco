import { useState, useCallback, useRef } from 'react'
import type { CropRect } from '../types/editor'

interface UseCropOptions {
  imageWidth: number
  imageHeight: number
  displayWidth: number
  displayHeight: number
  onCropChange: (rect: CropRect | null) => void
}

type Handle = 'tl' | 'tr' | 'bl' | 'br' | 'move' | null

export function useCrop({ imageWidth, imageHeight, displayWidth, displayHeight, onCropChange }: UseCropOptions) {
  const scaleX = imageWidth / displayWidth
  const scaleY = imageHeight / displayHeight

  const [rect, setRect] = useState<CropRect | null>(null)
  const isDragging = useRef(false)
  const activeHandle = useRef<Handle>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const startRect = useRef<CropRect | null>(null)

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

  const toDisplayRect = (r: CropRect) => ({
    x: r.x / scaleX,
    y: r.y / scaleY,
    width: r.width / scaleX,
    height: r.height / scaleY
  })

  const toImageRect = useCallback((r: CropRect): CropRect => ({
    x: Math.round(r.x * scaleX),
    y: Math.round(r.y * scaleY),
    width: Math.round(r.width * scaleX),
    height: Math.round(r.height * scaleY)
  }), [scaleX, scaleY])

  const onMouseDown = useCallback(
    (e: React.MouseEvent, handle: Handle) => {
      e.preventDefault()
      isDragging.current = true
      activeHandle.current = handle
      startPos.current = { x: e.clientX, y: e.clientY }
      startRect.current = rect ? { ...rect } : null
    },
    [rect]
  )

  const onCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bounds = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - bounds.left
      const y = e.clientY - bounds.top
      isDragging.current = true
      activeHandle.current = 'tl'
      startPos.current = { x, y }
      const newRect: CropRect = { x, y, width: 0, height: 0 }
      startRect.current = newRect
      setRect(newRect)
    },
    []
  )

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging.current || !startRect.current) return
      const bounds = e.currentTarget.getBoundingClientRect()
      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y

      setRect((prev) => {
        if (!prev) return prev
        let { x, y, width, height } = activeHandle.current === 'move' ? startRect.current! : prev

        if (activeHandle.current === 'tl') {
          // new rect from initial canvas click
          const startX = startPos.current.x - bounds.left
          const startY = startPos.current.y - bounds.top
          const curX = clamp(e.clientX - bounds.left, 0, displayWidth)
          const curY = clamp(e.clientY - bounds.top, 0, displayHeight)
          x = Math.min(startX, curX)
          y = Math.min(startY, curY)
          width = Math.abs(curX - startX)
          height = Math.abs(curY - startY)
        } else if (activeHandle.current === 'move') {
          x = clamp(startRect.current!.x + dx, 0, displayWidth - width)
          y = clamp(startRect.current!.y + dy, 0, displayHeight - height)
        } else if (activeHandle.current === 'br') {
          width = clamp(startRect.current!.width + dx, 10, displayWidth - x)
          height = clamp(startRect.current!.height + dy, 10, displayHeight - y)
        } else if (activeHandle.current === 'tr') {
          width = clamp(startRect.current!.width + dx, 10, displayWidth - x)
          const newY = clamp(startRect.current!.y + dy, 0, y + height - 10)
          height = height + (y - newY)
          y = newY
        } else if (activeHandle.current === 'bl') {
          const newX = clamp(startRect.current!.x + dx, 0, x + width - 10)
          width = width + (x - newX)
          x = newX
          height = clamp(startRect.current!.height + dy, 10, displayHeight - y)
        }

        const updated = { x, y, width, height }
        const imageRect = toImageRect(updated)
        onCropChange(imageRect)
        return updated
      })
    },
    [displayWidth, displayHeight, onCropChange, toImageRect]
  )

  const onMouseUp = useCallback(() => {
    isDragging.current = false
    activeHandle.current = null
  }, [])

  const clearRect = useCallback(() => {
    setRect(null)
    onCropChange(null)
  }, [onCropChange])

  return {
    displayRect: rect ? toDisplayRect(rect) : null,
    rawRect: rect,
    onCanvasMouseDown,
    onMouseMove,
    onMouseUp,
    onHandleMouseDown: onMouseDown,
    clearRect
  }
}
