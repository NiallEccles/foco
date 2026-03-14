import { useState, useCallback, useRef } from 'react'
import type { CropRect } from '../types/editor'

interface UseCropOptions {
  imageWidth: number
  imageHeight: number
  displayWidth: number
  displayHeight: number
  // imageRef is used to get the image's exact bounding rect, avoiding container offset errors
  imageRef: React.RefObject<HTMLImageElement>
  onCropChange: (rect: CropRect | null) => void
}

type Handle = 'tl' | 'tr' | 'bl' | 'br' | 'move' | null

export function useCrop({ imageWidth, imageHeight, displayWidth, displayHeight, imageRef, onCropChange }: UseCropOptions) {
  // getBoundingClientRect() returns CSS pixels (per spec); naturalWidth/Height are actual pixel dimensions.
  // scaleX = naturalWidth / cssDisplayWidth is therefore correct on all DPR screens without additional handling.
  const scaleX = displayWidth > 0 ? imageWidth / displayWidth : 1
  const scaleY = displayHeight > 0 ? imageHeight / displayHeight : 1

  // rect is stored in IMAGE (natural) coordinates exclusively.
  // This is the single source of truth — the backend also works in image coordinates.
  const [rect, setRect] = useState<CropRect | null>(null)
  const isDragging = useRef(false)
  const activeHandle = useRef<Handle>(null)
  // startPos is always raw client coordinates for consistent delta computation across all handle types
  const startPos = useRef({ x: 0, y: 0 })
  // startRect is in image coordinates
  const startRect = useRef<CropRect | null>(null)

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

  // Single correct conversion from image coords to display coords.
  // No double-scaling: rect is already in image coords, so we divide by scale exactly once.
  const toDisplayRect = (r: CropRect) => ({
    x: r.x / scaleX,
    y: r.y / scaleY,
    width: r.width / scaleX,
    height: r.height / scaleY
  })

  const onHandleMouseDown = useCallback(
    (e: React.MouseEvent, handle: Handle) => {
      e.preventDefault()
      e.stopPropagation()
      isDragging.current = true
      activeHandle.current = handle
      // Store raw client coordinates — consistent with onCanvasMouseDown
      startPos.current = { x: e.clientX, y: e.clientY }
      startRect.current = rect ? { ...rect } : null
    },
    [rect]
  )

  const onCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (displayWidth === 0 || displayHeight === 0) return
      // Use image element bounds so (0,0) is the image's top-left, regardless of container centering
      const imgBounds = imageRef.current?.getBoundingClientRect()
      if (!imgBounds) return

      const dispX = clamp(e.clientX - imgBounds.left, 0, imgBounds.width)
      const dispY = clamp(e.clientY - imgBounds.top, 0, imgBounds.height)

      // Convert display position to image coordinates at point of capture
      const imageX = dispX * scaleX
      const imageY = dispY * scaleY

      isDragging.current = true
      activeHandle.current = 'tl'
      startPos.current = { x: e.clientX, y: e.clientY }
      const newRect: CropRect = { x: imageX, y: imageY, width: 0, height: 0 }
      startRect.current = newRect
      setRect(newRect)
    },
    [displayWidth, displayHeight, scaleX, scaleY, imageRef]
  )

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging.current || !startRect.current) return
      const imgBounds = imageRef.current?.getBoundingClientRect()
      if (!imgBounds) return

      // Delta in display pixels, converted to image pixels for consistent image-space math
      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y
      const dxImg = dx * scaleX
      const dyImg = dy * scaleY

      // Minimum crop size: 10 display pixels expressed in image pixels
      const minW = 10 * scaleX
      const minH = 10 * scaleY

      setRect((prev) => {
        if (!prev) return prev
        let { x, y, width, height } = prev

        if (activeHandle.current === 'tl') {
          // Drawing a new rect: re-derive both endpoints from the original start position
          const startDispX = startPos.current.x - imgBounds.left
          const startDispY = startPos.current.y - imgBounds.top
          const curDispX = clamp(e.clientX - imgBounds.left, 0, imgBounds.width)
          const curDispY = clamp(e.clientY - imgBounds.top, 0, imgBounds.height)
          const startImgX = startDispX * scaleX
          const startImgY = startDispY * scaleY
          const curImgX = curDispX * scaleX
          const curImgY = curDispY * scaleY
          x = Math.min(startImgX, curImgX)
          y = Math.min(startImgY, curImgY)
          width = Math.abs(curImgX - startImgX)
          height = Math.abs(curImgY - startImgY)
        } else if (activeHandle.current === 'move') {
          x = clamp(startRect.current!.x + dxImg, 0, imageWidth - startRect.current!.width)
          y = clamp(startRect.current!.y + dyImg, 0, imageHeight - startRect.current!.height)
          width = startRect.current!.width
          height = startRect.current!.height
        } else if (activeHandle.current === 'br') {
          width = clamp(startRect.current!.width + dxImg, minW, imageWidth - x)
          height = clamp(startRect.current!.height + dyImg, minH, imageHeight - y)
        } else if (activeHandle.current === 'tr') {
          width = clamp(startRect.current!.width + dxImg, minW, imageWidth - x)
          const newY = clamp(startRect.current!.y + dyImg, 0, startRect.current!.y + startRect.current!.height - minH)
          height = startRect.current!.height + (startRect.current!.y - newY)
          y = newY
        } else if (activeHandle.current === 'bl') {
          const newX = clamp(startRect.current!.x + dxImg, 0, startRect.current!.x + startRect.current!.width - minW)
          width = startRect.current!.width + (startRect.current!.x - newX)
          x = newX
          height = clamp(startRect.current!.height + dyImg, minH, imageHeight - y)
        }

        const updated = { x, y, width, height }
        // rect is already in image coordinates — pass rounded values to the store/backend
        onCropChange({
          x: Math.round(updated.x),
          y: Math.round(updated.y),
          width: Math.round(updated.width),
          height: Math.round(updated.height)
        })
        return updated
      })
    },
    [imageWidth, imageHeight, scaleX, scaleY, onCropChange, imageRef]
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
    // displayRect is the single correct conversion: image coords → display coords
    displayRect: (displayWidth === 0 || displayHeight === 0) ? null : (rect ? toDisplayRect(rect) : null),
    rawRect: rect,
    onCanvasMouseDown,
    onMouseMove,
    onMouseUp,
    onHandleMouseDown,
    clearRect
  }
}
