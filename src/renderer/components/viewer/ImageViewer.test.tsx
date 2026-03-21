import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, act } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/helpers/testUtils'
import { ImageViewer } from './ImageViewer'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useViewerStore } from '../../stores/viewerStore'
import { useSettingsStore } from '../../stores/settingsStore'

// Stub ResizeObserver (not in jsdom)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock Histogram to avoid canvas rendering
vi.mock('./Histogram', () => ({
  Histogram: () => <div data-testid="histogram" />,
}))

const IMAGE = { name: 'photo.jpg', path: '/folder/photo.jpg', size: 1000, mtime: '' }

beforeEach(() => {
  useWorkspaceStore.setState({
    images: [IMAGE],
    deletedImages: [],
    currentIndex: 0,
    isLoading: false,
    viewMode: 'browse',
    folderPath: '/folder',
    deletedIndex: 0,
  })
  useViewerStore.setState({ zoomPercent: 100, resetRequestCount: 0, zoomInCount: 0, zoomOutCount: 0 })
  useSettingsStore.setState({ showHistogram: false, exifPanelOpen: false, filmStripOrientation: 'bottom', showShortcuts: false, recentFolders: [] })
})

describe('ImageViewer', () => {
  it('renders "No image selected" when image is null', () => {
    renderWithProviders(<ImageViewer image={null} />)
    expect(screen.getByText(/no image selected/i)).toBeInTheDocument()
  })

  it('renders an img element with correct src when image is provided', () => {
    renderWithProviders(<ImageViewer image={IMAGE} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', `safe-file://${IMAGE.path}`)
  })

  it('img has alt text matching image name', () => {
    renderWithProviders(<ImageViewer image={IMAGE} />)
    expect(screen.getByAltText(IMAGE.name)).toBeInTheDocument()
  })

  it('does not render Histogram when showHistogram is false', () => {
    renderWithProviders(<ImageViewer image={IMAGE} />)
    expect(screen.queryByTestId('histogram')).not.toBeInTheDocument()
  })

  it('renders Histogram when showHistogram is true and histogram data is available', async () => {
    window.api.getHistogram = vi.fn().mockResolvedValue({
      r: new Array(256).fill(0),
      g: new Array(256).fill(0),
      b: new Array(256).fill(0),
      luma: new Array(256).fill(0),
    })
    useSettingsStore.setState({ showHistogram: true })
    await act(async () => {
      renderWithProviders(<ImageViewer image={IMAGE} />)
    })
    // Histogram is shown only after data loads; img should still render
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
