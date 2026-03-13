import { useRef, useState, useCallback, useEffect, MutableRefObject, RefObject } from 'react'

const MIN_HOOK_SCALE = 1.0
const MAX_HOOK_SCALE = 20.0
const ZOOM_FACTOR = 0.1

export function useCanvasTransform(
  containerRef: RefObject<HTMLDivElement | null>,
  fitScaleRef: MutableRefObject<number>
) {
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Refs for hot-path — no React re-render per wheel/drag event
  const hookScaleRef = useRef(1)
  const txRef = useRef(0)
  const tyRef = useRef(0)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  // React state only for zoom indicator + cursor
  const [hookScale, setHookScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)

  const applyTransform = useCallback((hs: number, tx: number, ty: number) => {
    if (!imageRef.current) return
    const s = hs * fitScaleRef.current
    imageRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`
  }, [fitScaleRef])

  // Called by ImageViewer when fitScale updates (container resize) — re-applies with same hookScale/translate
  const onFitScaleUpdate = useCallback(() => {
    applyTransform(hookScaleRef.current, txRef.current, tyRef.current)
  }, [applyTransform])

  const resetTransform = useCallback(() => {
    hookScaleRef.current = 1
    txRef.current = 0
    tyRef.current = 0
    isDraggingRef.current = false
    applyTransform(1, 0, 0)
    setHookScale(1)
    setIsDragging(false)
  }, [applyTransform])

  // Wheel: registered with passive:false so preventDefault works
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      const rect = el.getBoundingClientRect()
      const cursorX = e.clientX - rect.left - rect.width / 2
      const cursorY = e.clientY - rect.top - rect.height / 2

      const oldHS = hookScaleRef.current
      const fitScale = fitScaleRef.current
      const oldEffective = oldHS * fitScale

      const factor = e.deltaY > 0 ? 1 - ZOOM_FACTOR : 1 + ZOOM_FACTOR
      const newHS = Math.min(Math.max(oldHS * factor, MIN_HOOK_SCALE), MAX_HOOK_SCALE)
      const newEffective = newHS * fitScale

      let newTx: number
      let newTy: number

      if (newHS <= MIN_HOOK_SCALE) {
        newTx = 0
        newTy = 0
      } else {
        // Cursor-anchored zoom: keep the image point under the cursor fixed
        newTx = cursorX - (cursorX - txRef.current) * (newEffective / oldEffective)
        newTy = cursorY - (cursorY - tyRef.current) * (newEffective / oldEffective)
      }

      hookScaleRef.current = newHS
      txRef.current = newTx
      tyRef.current = newTy

      if (imageRef.current) {
        imageRef.current.style.transform = `translate(${newTx}px, ${newTy}px) scale(${newEffective})`
      }

      setHookScale(newHS)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [containerRef, fitScaleRef])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (hookScaleRef.current <= MIN_HOOK_SCALE) return
    if (e.button !== 0) return
    e.preventDefault()
    isDraggingRef.current = true
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      tx: txRef.current,
      ty: tyRef.current
    }
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    txRef.current = dragStartRef.current.tx + dx
    tyRef.current = dragStartRef.current.ty + dy
    if (imageRef.current) {
      const s = hookScaleRef.current * fitScaleRef.current
      imageRef.current.style.transform = `translate(${txRef.current}px, ${tyRef.current}px) scale(${s})`
    }
  }, [fitScaleRef])

  const stopDrag = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      setIsDragging(false)
    }
  }, [])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const fitScale = fitScaleRef.current
    if (hookScaleRef.current > MIN_HOOK_SCALE) {
      resetTransform()
      return
    }
    // Zoom to 1:1 (actual pixels), anchored at cursor
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cursorX = e.clientX - rect.left - rect.width / 2
    const cursorY = e.clientY - rect.top - rect.height / 2

    // At 1:1: effectiveScale = 1.0, so newHookScale = 1/fitScale
    // Guard: if image is already at natural size (fitScale=1), nothing to do
    if (fitScale >= 1) return

    const oldEffective = fitScale // hookScale was 1.0
    const newHS = 1 / fitScale
    const newEffective = 1.0 // 100% actual pixels

    // Anchor zoom at cursor
    const newTx = cursorX - (cursorX - 0) * (newEffective / oldEffective)
    const newTy = cursorY - (cursorY - 0) * (newEffective / oldEffective)

    hookScaleRef.current = newHS
    txRef.current = newTx
    tyRef.current = newTy

    if (imageRef.current) {
      imageRef.current.style.transform = `translate(${newTx}px, ${newTy}px) scale(${newEffective})`
    }
    setHookScale(newHS)
  }, [fitScaleRef, containerRef, resetTransform])

  return {
    imageRef,
    hookScale,
    isDragging,
    resetTransform,
    onFitScaleUpdate,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: stopDrag,
    handleMouseLeave: stopDrag,
    handleDoubleClick
  }
}
