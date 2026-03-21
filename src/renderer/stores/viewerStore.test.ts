import { describe, it, expect, beforeEach } from 'vitest'
import { useViewerStore } from './viewerStore'

beforeEach(() => {
  useViewerStore.setState({
    zoomPercent: 100,
    resetRequestCount: 0,
    zoomInCount: 0,
    zoomOutCount: 0,
  })
})

describe('initial state', () => {
  it('zoom is 100', () => {
    expect(useViewerStore.getState().zoomPercent).toBe(100)
  })

  it('all counters start at 0', () => {
    const { resetRequestCount, zoomInCount, zoomOutCount } = useViewerStore.getState()
    expect(resetRequestCount).toBe(0)
    expect(zoomInCount).toBe(0)
    expect(zoomOutCount).toBe(0)
  })
})

describe('setZoomPercent', () => {
  it('updates zoomPercent', () => {
    useViewerStore.getState().setZoomPercent(200)
    expect(useViewerStore.getState().zoomPercent).toBe(200)
  })

  it('accepts fractional values', () => {
    useViewerStore.getState().setZoomPercent(33)
    expect(useViewerStore.getState().zoomPercent).toBe(33)
  })
})

describe('requestReset', () => {
  it('increments resetRequestCount', () => {
    useViewerStore.getState().requestReset()
    expect(useViewerStore.getState().resetRequestCount).toBe(1)
    useViewerStore.getState().requestReset()
    expect(useViewerStore.getState().resetRequestCount).toBe(2)
  })
})

describe('requestZoomIn', () => {
  it('increments zoomInCount', () => {
    useViewerStore.getState().requestZoomIn()
    expect(useViewerStore.getState().zoomInCount).toBe(1)
  })
})

describe('requestZoomOut', () => {
  it('increments zoomOutCount', () => {
    useViewerStore.getState().requestZoomOut()
    expect(useViewerStore.getState().zoomOutCount).toBe(1)
  })
})
