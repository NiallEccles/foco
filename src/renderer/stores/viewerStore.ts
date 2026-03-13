import { create } from 'zustand'

interface ViewerState {
  zoomPercent: number
  setZoomPercent: (z: number) => void
  resetRequestCount: number
  requestReset: () => void
}

export const useViewerStore = create<ViewerState>()((set) => ({
  zoomPercent: 100,
  setZoomPercent: (z) => set({ zoomPercent: z }),
  resetRequestCount: 0,
  requestReset: () => set((s) => ({ resetRequestCount: s.resetRequestCount + 1 }))
}))
