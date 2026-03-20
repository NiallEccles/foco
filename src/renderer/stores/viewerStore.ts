import { create } from 'zustand'

interface ViewerState {
  zoomPercent: number
  setZoomPercent: (z: number) => void
  resetRequestCount: number
  requestReset: () => void
  zoomInCount: number
  requestZoomIn: () => void
  zoomOutCount: number
  requestZoomOut: () => void
}

export const useViewerStore = create<ViewerState>()((set) => ({
  zoomPercent: 100,
  setZoomPercent: (z) => set({ zoomPercent: z }),
  resetRequestCount: 0,
  requestReset: () => set((s) => ({ resetRequestCount: s.resetRequestCount + 1 })),
  zoomInCount: 0,
  requestZoomIn: () => set((s) => ({ zoomInCount: s.zoomInCount + 1 })),
  zoomOutCount: 0,
  requestZoomOut: () => set((s) => ({ zoomOutCount: s.zoomOutCount + 1 })),
}))
