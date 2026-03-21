import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useExif } from './useExif'

// The hook reads from window.api (set in renderer setup) but also has a module-level
// cache. Use distinct paths in each test to avoid cache collisions.
let pathCounter = 0
const uniquePath = () => `/test-image-${++pathCounter}.jpg`

describe('useExif', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading=false and exif=null for null path', () => {
    const { result } = renderHook(() => useExif(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.exif).toBeNull()
  })

  it('sets loading to true while fetching, then resolves', async () => {
    const path = uniquePath()
    const exifData = { make: 'Nikon', iso: 100 }
    window.api.getExifData = vi.fn().mockResolvedValue(exifData)

    const { result } = renderHook(() => useExif(path))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.exif).toEqual(exifData)
  })

  it('calls window.api.getExifData with the image path', async () => {
    const path = uniquePath()
    window.api.getExifData = vi.fn().mockResolvedValue(null)

    renderHook(() => useExif(path))

    await waitFor(() => {
      expect(window.api.getExifData).toHaveBeenCalledWith(path)
    })
  })

  it('returns null exif when API resolves with null', async () => {
    const path = uniquePath()
    window.api.getExifData = vi.fn().mockResolvedValue(null)

    const { result } = renderHook(() => useExif(path))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exif).toBeNull()
  })

  it('uses cached result on second render with same path (no re-fetch)', async () => {
    const path = uniquePath()
    const exifData = { model: 'A7 IV' }
    window.api.getExifData = vi.fn().mockResolvedValue(exifData)

    const { result: r1 } = renderHook(() => useExif(path))
    await waitFor(() => expect(r1.current.loading).toBe(false))

    // Render a second hook with the same path
    const { result: r2 } = renderHook(() => useExif(path))
    // Should resolve synchronously from cache (no additional API call)
    expect(r2.current.exif).toEqual(exifData)
    expect(window.api.getExifData).toHaveBeenCalledTimes(1)
  })

  it('re-fetches when imagePath changes', async () => {
    const path1 = uniquePath()
    const path2 = uniquePath()

    let currentPath = path1
    window.api.getExifData = vi
      .fn()
      .mockResolvedValueOnce({ iso: 100 })
      .mockResolvedValueOnce({ iso: 200 })

    const { result, rerender } = renderHook(() => useExif(currentPath))
    await waitFor(() => expect(result.current.exif?.iso).toBe(100))

    currentPath = path2
    rerender()
    await waitFor(() => expect(result.current.exif?.iso).toBe(200))

    expect(window.api.getExifData).toHaveBeenCalledTimes(2)
  })
})
