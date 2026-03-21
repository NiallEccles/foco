import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Polyfill ResizeObserver (not in jsdom, required by Mantine ScrollArea)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Polyfill window.matchMedia (not available in jsdom, required by Mantine)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Build a mock API object
function makeMockFns() {
  return {
    windowMinimize: vi.fn(),
    windowMaximize: vi.fn(),
    windowClose: vi.fn(),
    toggleFullscreen: vi.fn(),
    getPlatform: vi.fn(() => 'darwin'),
    openFolder: vi.fn().mockResolvedValue(null),
    listImages: vi.fn().mockResolvedValue([]),
    softDelete: vi.fn().mockResolvedValue(undefined),
    restoreImage: vi.fn().mockResolvedValue(''),
    listDeleted: vi.fn().mockResolvedValue([]),
    saveImage: vi.fn().mockResolvedValue(undefined),
    saveImageAs: vi.fn().mockResolvedValue(null),
    getImageMetadata: vi.fn().mockResolvedValue({ width: 0, height: 0 }),
    getThumbnail: vi.fn().mockResolvedValue(''),
    getExifData: vi.fn().mockResolvedValue(null),
    getHistogram: vi.fn().mockResolvedValue({ r: [], g: [], b: [], luma: [] }),
    openExternal: vi.fn(),
  }
}

// Assign window.api IMMEDIATELY (top-level) so api.ts captures a valid object on first import.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).api = makeMockFns()

beforeEach(() => {
  // Reset all function properties in-place (keep the same object reference so api.ts import cache is unaffected)
  const fresh = makeMockFns()
  for (const key of Object.keys(fresh) as (keyof ReturnType<typeof makeMockFns>)[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;((window as any).api as any)[key] = fresh[key]
  }
})
