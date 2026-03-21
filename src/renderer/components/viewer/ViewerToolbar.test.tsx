import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, act } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/helpers/testUtils'
import { ViewerToolbar } from './ViewerToolbar'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useViewerStore } from '../../stores/viewerStore'

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn(), hide: vi.fn() },
  Notifications: () => null,
}))

const IMAGE = { name: 'photo.jpg', path: '/folder/photo.jpg', size: 1000, mtime: '' }

beforeEach(() => {
  useWorkspaceStore.setState({
    folderPath: '/folder',
    images: [IMAGE],
    deletedImages: [],
    currentIndex: 0,
    isLoading: false,
    viewMode: 'browse',
    deletedIndex: 0,
  })
  useEditorStore.setState({
    isEditing: false,
    activeTool: null,
    cropRect: null,
    resizeDimensions: null,
    isDirty: false,
    originalWidth: 0,
    originalHeight: 0,
  })
  useSettingsStore.setState({
    filmStripOrientation: 'bottom',
    exifPanelOpen: false,
    showHistogram: false,
    showShortcuts: false,
    recentFolders: [],
  })
  useViewerStore.setState({ zoomPercent: 100, resetRequestCount: 0, zoomInCount: 0, zoomOutCount: 0 })
  vi.clearAllMocks()
})

describe('ViewerToolbar — browse mode', () => {
  it('renders Delete button', () => {
    renderWithProviders(<ViewerToolbar currentImage={IMAGE} />)
    expect(screen.getByTitle(/delete/i)).toBeInTheDocument()
  })

  it('renders Edit button', () => {
    renderWithProviders(<ViewerToolbar currentImage={IMAGE} />)
    expect(screen.getByTitle(/edit/i)).toBeInTheDocument()
  })

  it('clicking Edit enters edit mode in editorStore', () => {
    renderWithProviders(<ViewerToolbar currentImage={IMAGE} />)
    fireEvent.click(screen.getByTitle(/edit/i))
    expect(useEditorStore.getState().isEditing).toBe(true)
    expect(useEditorStore.getState().activeTool).toBe('crop')
  })

  it('clicking Delete calls softDeleteCurrent on workspaceStore', async () => {
    window.api.softDelete = vi.fn().mockResolvedValue(undefined)
    window.api.listDeleted = vi.fn().mockResolvedValue([])
    renderWithProviders(<ViewerToolbar currentImage={IMAGE} />)
    await act(async () => {
      fireEvent.click(screen.getByTitle(/delete/i))
    })
    expect(useWorkspaceStore.getState().images).toHaveLength(0)
  })

  it('shows zoom percent', () => {
    useViewerStore.setState({ zoomPercent: 75 })
    renderWithProviders(<ViewerToolbar currentImage={IMAGE} />)
    expect(screen.getByText(/75%/)).toBeInTheDocument()
  })

  it('clicking zoom button calls requestReset', () => {
    renderWithProviders(<ViewerToolbar currentImage={IMAGE} />)
    fireEvent.click(screen.getByTitle(/reset zoom/i))
    expect(useViewerStore.getState().resetRequestCount).toBe(1)
  })

  it('EXIF toggle button calls toggleExifPanel', () => {
    renderWithProviders(<ViewerToolbar currentImage={IMAGE} />)
    fireEvent.click(screen.getByTitle(/image info/i))
    expect(useSettingsStore.getState().exifPanelOpen).toBe(true)
  })
})

describe('ViewerToolbar — deleted mode', () => {
  it('renders Restore button instead of Delete/Edit', () => {
    useWorkspaceStore.setState({ viewMode: 'deleted' })
    renderWithProviders(<ViewerToolbar currentImage={IMAGE} />)
    expect(screen.getByTitle(/restore/i)).toBeInTheDocument()
    expect(screen.queryByTitle(/delete/i)).not.toBeInTheDocument()
  })
})

describe('ViewerToolbar — no image', () => {
  it('buttons are disabled when currentImage is null', () => {
    renderWithProviders(<ViewerToolbar currentImage={null} />)
    const deleteBtn = screen.queryByTitle(/delete/i)
    if (deleteBtn) {
      expect(deleteBtn).toBeDisabled()
    }
  })
})
