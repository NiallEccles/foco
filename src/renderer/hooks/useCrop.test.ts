import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCrop } from './useCrop'
import type { CropRect } from '../types/editor'

// Helper: build a mock imageRef with a bounding rect
function makeMockImageRef(bounds: DOMRect) {
  return {
    current: {
      getBoundingClientRect: () => bounds,
    } as unknown as HTMLImageElement,
  }
}

// Simulate a mousedown event at a client position
function mouseDown(x: number, y: number): React.MouseEvent<HTMLDivElement> {
  return {
    clientX: x,
    clientY: y,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as React.MouseEvent<HTMLDivElement>
}

function mouseMove(x: number, y: number): React.MouseEvent<HTMLDivElement> {
  return { clientX: x, clientY: y } as React.MouseEvent<HTMLDivElement>
}

const DISPLAY_W = 100
const DISPLAY_H = 100
const IMG_W = 400
const IMG_H = 400
// scaleX = 400/100 = 4, scaleY = 400/100 = 4

// Image occupies (left=0, top=0, width=100, height=100) in viewport
const IMAGE_BOUNDS = new DOMRect(0, 0, DISPLAY_W, DISPLAY_H)

describe('useCrop', () => {
  let onCropChange: ReturnType<typeof vi.fn>
  let imageRef: ReturnType<typeof makeMockImageRef>

  beforeEach(() => {
    onCropChange = vi.fn()
    imageRef = makeMockImageRef(IMAGE_BOUNDS)
  })

  function renderUseCrop(overrides?: Partial<Parameters<typeof useCrop>[0]>) {
    return renderHook(() =>
      useCrop({
        imageWidth: IMG_W,
        imageHeight: IMG_H,
        displayWidth: DISPLAY_W,
        displayHeight: DISPLAY_H,
        imageRef,
        onCropChange,
        ...overrides,
      })
    )
  }

  it('initial rawRect is null', () => {
    const { result } = renderUseCrop()
    expect(result.current.rawRect).toBeNull()
  })

  it('initial displayRect is null', () => {
    const { result } = renderUseCrop()
    expect(result.current.displayRect).toBeNull()
  })

  it('displayRect is null when displayWidth is 0', () => {
    const { result } = renderUseCrop({ displayWidth: 0 })
    expect(result.current.displayRect).toBeNull()
  })

  it('mouseDown starts a new rect at the clicked image position', () => {
    const { result } = renderUseCrop()
    act(() => {
      result.current.onCanvasMouseDown(mouseDown(10, 20))
    })
    // rawRect should be in image coordinates: x=10*4=40, y=20*4=80, w=0, h=0
    expect(result.current.rawRect).toMatchObject({ x: 40, y: 80, width: 0, height: 0 })
  })

  it('mouseMove expands rect in image coordinates', () => {
    const { result } = renderUseCrop()
    act(() => result.current.onCanvasMouseDown(mouseDown(0, 0)))
    act(() => result.current.onMouseMove(mouseMove(25, 25)))
    // 25 display px * scale 4 = 100 image px
    expect(result.current.rawRect?.width).toBeCloseTo(100)
    expect(result.current.rawRect?.height).toBeCloseTo(100)
  })

  it('displayRect is the correct scaled-down version of rawRect', () => {
    const { result } = renderUseCrop()
    act(() => result.current.onCanvasMouseDown(mouseDown(0, 0)))
    act(() => result.current.onMouseMove(mouseMove(50, 50)))
    // rawRect width = 50*4 = 200, displayRect width = 200/4 = 50
    expect(result.current.displayRect?.width).toBeCloseTo(50)
    expect(result.current.displayRect?.height).toBeCloseTo(50)
  })

  it('single scale factor: no double-scaling regression', () => {
    // Regression: verifies that coords are only scaled once.
    // With scaleX=4: a 25-display-px drag should yield 100 raw image pixels,
    // and displayRect should show 25px — not 100px (which would be double-scale).
    const { result } = renderUseCrop()
    act(() => result.current.onCanvasMouseDown(mouseDown(0, 0)))
    act(() => result.current.onMouseMove(mouseMove(25, 0)))
    const raw = result.current.rawRect?.width ?? 0
    const display = result.current.displayRect?.width ?? 0
    expect(raw).toBeGreaterThan(display) // raw is in image pixels (larger)
    expect(display).toBeCloseTo(25) // display coords correct (no double-scale)
  })

  it('mouseUp stops dragging (subsequent moves do not update rect)', () => {
    const { result } = renderUseCrop()
    act(() => result.current.onCanvasMouseDown(mouseDown(0, 0)))
    act(() => result.current.onMouseMove(mouseMove(20, 20)))
    act(() => result.current.onMouseUp())
    const widthBefore = result.current.rawRect?.width
    act(() => result.current.onMouseMove(mouseMove(50, 50)))
    expect(result.current.rawRect?.width).toBe(widthBefore)
  })

  it('clearRect resets rawRect to null and calls onCropChange(null)', () => {
    const { result } = renderUseCrop()
    act(() => result.current.onCanvasMouseDown(mouseDown(0, 0)))
    act(() => result.current.onMouseMove(mouseMove(30, 30)))
    act(() => result.current.clearRect())
    expect(result.current.rawRect).toBeNull()
    expect(onCropChange).toHaveBeenLastCalledWith(null)
  })

  it('onCropChange is called with rounded image-coordinate values during move', () => {
    const { result } = renderUseCrop()
    act(() => result.current.onCanvasMouseDown(mouseDown(0, 0)))
    act(() => result.current.onMouseMove(mouseMove(10, 10)))
    const lastCall = onCropChange.mock.calls[onCropChange.mock.calls.length - 1][0] as CropRect
    // All values should be integers (Math.round applied)
    expect(lastCall.x).toBe(Math.round(lastCall.x))
    expect(lastCall.y).toBe(Math.round(lastCall.y))
    expect(lastCall.width).toBe(Math.round(lastCall.width))
    expect(lastCall.height).toBe(Math.round(lastCall.height))
  })

  describe('br handle resize', () => {
    it('expands rect from bottom-right handle', () => {
      const { result } = renderUseCrop()
      // Set an existing rect
      act(() => result.current.onCanvasMouseDown(mouseDown(0, 0)))
      act(() => result.current.onMouseMove(mouseMove(20, 20)))
      act(() => result.current.onMouseUp())

      const startWidth = result.current.rawRect?.width ?? 0
      act(() =>
        result.current.onHandleMouseDown(
          mouseDown(20, 20) as React.MouseEvent,
          'br'
        )
      )
      act(() => result.current.onMouseMove(mouseMove(30, 30)))
      expect(result.current.rawRect?.width).toBeGreaterThan(startWidth)
    })
  })

  describe('move handle', () => {
    it('translates rect without changing dimensions', () => {
      const { result } = renderUseCrop()
      act(() => result.current.onCanvasMouseDown(mouseDown(10, 10)))
      act(() => result.current.onMouseMove(mouseMove(30, 30)))
      act(() => result.current.onMouseUp())

      const { width: w, height: h } = result.current.rawRect!
      act(() =>
        result.current.onHandleMouseDown(mouseDown(20, 20) as React.MouseEvent, 'move')
      )
      act(() => result.current.onMouseMove(mouseMove(25, 25)))
      expect(result.current.rawRect?.width).toBeCloseTo(w)
      expect(result.current.rawRect?.height).toBeCloseTo(h)
    })
  })
})
