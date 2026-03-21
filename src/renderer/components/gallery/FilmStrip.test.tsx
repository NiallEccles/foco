import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/helpers/testUtils'
import { FilmStrip } from './FilmStrip'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useSettingsStore } from '../../stores/settingsStore'
// thumbnailStore not needed here

// Mock virtualizer — jsdom has no layout so getVirtualItems() would be empty
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn((options: { count: number; estimateSize: () => number }) => ({
    getVirtualItems: () =>
      Array.from({ length: options.count }, (_, i) => ({
        index: i,
        start: i * options.estimateSize(),
        size: options.estimateSize(),
        key: i,
      })),
    getTotalSize: () => options.count * options.estimateSize(),
    scrollToIndex: vi.fn(),
  })),
}))

// Mock Thumbnail to avoid IPC/thumbnail loading in component tests
vi.mock('./Thumbnail', () => ({
  Thumbnail: ({ image, isSelected, index, onClick }: {
    image: { name: string; path: string }
    isSelected: boolean
    index: number
    onClick: (i: number) => void
  }) => (
    <div
      data-testid={`thumb-${image.name}`}
      data-selected={isSelected}
      onClick={() => onClick(index)}
    >
      {image.name}
    </div>
  ),
}))

const IMG_A = { name: 'a.jpg', path: '/folder/a.jpg', size: 1, mtime: '' }
const IMG_B = { name: 'b.jpg', path: '/folder/b.jpg', size: 1, mtime: '' }
const IMG_C_DEL = { name: 'c.jpg', path: '/folder/_deleted/c.jpg', size: 1, mtime: '' }

beforeEach(() => {
  useWorkspaceStore.setState({
    folderPath: '/folder',
    images: [IMG_A, IMG_B],
    deletedImages: [IMG_C_DEL],
    currentIndex: 0,
    deletedIndex: 0,
    isLoading: false,
    viewMode: 'browse',
  })
  useSettingsStore.setState({ filmStripOrientation: 'bottom', exifPanelOpen: false, showHistogram: false, showShortcuts: false, recentFolders: [] })
})

describe('FilmStrip', () => {
  it('renders thumbnails for images in browse mode', () => {
    renderWithProviders(<FilmStrip />)
    expect(screen.getByTestId('thumb-a.jpg')).toBeInTheDocument()
    expect(screen.getByTestId('thumb-b.jpg')).toBeInTheDocument()
  })

  it('marks the current image as selected', () => {
    useWorkspaceStore.setState({ currentIndex: 1 })
    renderWithProviders(<FilmStrip />)
    expect(screen.getByTestId('thumb-b.jpg')).toHaveAttribute('data-selected', 'true')
    expect(screen.getByTestId('thumb-a.jpg')).toHaveAttribute('data-selected', 'false')
  })

  it('clicking a thumbnail updates currentIndex', () => {
    renderWithProviders(<FilmStrip />)
    fireEvent.click(screen.getByTestId('thumb-b.jpg'))
    expect(useWorkspaceStore.getState().currentIndex).toBe(1)
  })

  it('does not render deleted images in browse mode', () => {
    renderWithProviders(<FilmStrip />)
    expect(screen.queryByTestId('thumb-c.jpg')).not.toBeInTheDocument()
  })

  it('renders deleted images in deleted mode', () => {
    useWorkspaceStore.setState({ viewMode: 'deleted' })
    renderWithProviders(<FilmStrip />)
    expect(screen.getByTestId('thumb-c.jpg')).toBeInTheDocument()
    expect(screen.queryByTestId('thumb-a.jpg')).not.toBeInTheDocument()
  })

  it('renders no thumbnails when images list is empty', () => {
    useWorkspaceStore.setState({ images: [] })
    renderWithProviders(<FilmStrip />)
    expect(screen.queryAllByTestId(/^thumb-/)).toHaveLength(0)
  })

  it('renders no thumbnails when folderPath is null', () => {
    useWorkspaceStore.setState({ folderPath: null })
    renderWithProviders(<FilmStrip />)
    expect(screen.queryAllByTestId(/^thumb-/)).toHaveLength(0)
  })
})
