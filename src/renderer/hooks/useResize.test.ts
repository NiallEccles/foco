import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResize } from './useResize'

describe('useResize', () => {
  it('initial dims match provided width/height', () => {
    const { result } = renderHook(() => useResize(800, 600))
    expect(result.current.dims.width).toBe(800)
    expect(result.current.dims.height).toBe(600)
  })

  it('initial mode is pixels with keepAspectRatio true', () => {
    const { result } = renderHook(() => useResize(800, 600))
    expect(result.current.dims.mode).toBe('pixels')
    expect(result.current.dims.keepAspectRatio).toBe(true)
  })

  describe('setWidth', () => {
    it('updates width and recalculates height when aspect lock is on', () => {
      const { result } = renderHook(() => useResize(800, 400)) // aspect = 2
      act(() => result.current.setWidth(400))
      expect(result.current.dims.width).toBe(400)
      expect(result.current.dims.height).toBe(200) // 400 / 2
    })

    it('updates width only when aspect lock is off', () => {
      const { result } = renderHook(() => useResize(800, 400))
      act(() => result.current.toggleAspectRatio()) // turn off lock
      act(() => result.current.setWidth(400))
      expect(result.current.dims.width).toBe(400)
      expect(result.current.dims.height).toBe(400) // unchanged
    })
  })

  describe('setHeight', () => {
    it('updates height and recalculates width when aspect lock is on', () => {
      const { result } = renderHook(() => useResize(800, 400)) // aspect = 2
      act(() => result.current.setHeight(200))
      expect(result.current.dims.height).toBe(200)
      expect(result.current.dims.width).toBe(400) // 200 * 2
    })

    it('updates height only when aspect lock is off', () => {
      const { result } = renderHook(() => useResize(800, 400))
      act(() => result.current.toggleAspectRatio())
      act(() => result.current.setHeight(200))
      expect(result.current.dims.height).toBe(200)
      expect(result.current.dims.width).toBe(800)
    })
  })

  describe('toggleAspectRatio', () => {
    it('switches keepAspectRatio off', () => {
      const { result } = renderHook(() => useResize(100, 100))
      act(() => result.current.toggleAspectRatio())
      expect(result.current.dims.keepAspectRatio).toBe(false)
    })

    it('switches keepAspectRatio back on', () => {
      const { result } = renderHook(() => useResize(100, 100))
      act(() => result.current.toggleAspectRatio())
      act(() => result.current.toggleAspectRatio())
      expect(result.current.dims.keepAspectRatio).toBe(true)
    })
  })

  describe('setMode', () => {
    it('switching to percent resets width/height to 100/100', () => {
      const { result } = renderHook(() => useResize(800, 600))
      act(() => result.current.setMode('percent'))
      expect(result.current.dims.mode).toBe('percent')
      expect(result.current.dims.width).toBe(100)
      expect(result.current.dims.height).toBe(100)
    })

    it('switching back to pixels restores initial dimensions', () => {
      const { result } = renderHook(() => useResize(800, 600))
      act(() => result.current.setMode('percent'))
      act(() => result.current.setMode('pixels'))
      expect(result.current.dims.mode).toBe('pixels')
      expect(result.current.dims.width).toBe(800)
      expect(result.current.dims.height).toBe(600)
    })
  })

  describe('getFinalDimensions', () => {
    it('returns pixel values directly in pixel mode', () => {
      const { result } = renderHook(() => useResize(800, 600))
      act(() => result.current.setWidth(400))
      const final = result.current.getFinalDimensions()
      expect(final.width).toBe(400)
    })

    it('converts percent to pixels in percent mode', () => {
      const { result } = renderHook(() => useResize(800, 600))
      act(() => result.current.setMode('percent'))
      // Disable aspect ratio to set both dimensions independently
      act(() => result.current.toggleAspectRatio())
      act(() => result.current.setWidth(50))
      act(() => result.current.setHeight(50))
      const final = result.current.getFinalDimensions()
      expect(final.width).toBe(400)  // 50% of 800
      expect(final.height).toBe(300) // 50% of 600
    })

    it('rounds to integer pixels', () => {
      const { result } = renderHook(() => useResize(800, 600))
      act(() => result.current.setMode('percent'))
      act(() => result.current.setWidth(33))
      const final = result.current.getFinalDimensions()
      expect(Number.isInteger(final.width)).toBe(true)
      expect(Number.isInteger(final.height)).toBe(true)
    })
  })
})
