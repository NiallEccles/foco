import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../services/api', () => ({
  api: {
    openFolder: vi.fn(),
    listImages: vi.fn(),
    softDelete: vi.fn(),
    restoreImage: vi.fn(),
    listDeleted: vi.fn(),
  },
}))

import { api } from '../services/api'
import { useWorkspaceStore } from './workspaceStore'
import { useSettingsStore } from './settingsStore'

const mockApi = api as {
  openFolder: ReturnType<typeof vi.fn>
  listImages: ReturnType<typeof vi.fn>
  softDelete: ReturnType<typeof vi.fn>
  restoreImage: ReturnType<typeof vi.fn>
  listDeleted: ReturnType<typeof vi.fn>
}

const IMAGE_A = { name: 'a.jpg', path: '/folder/a.jpg', size: 1000, mtime: '2024-01-01T00:00:00Z' }
const IMAGE_B = { name: 'b.jpg', path: '/folder/b.jpg', size: 2000, mtime: '2024-01-01T00:00:00Z' }
const IMAGE_C = { name: 'c.jpg', path: '/folder/_deleted/c.jpg', size: 500, mtime: '2024-01-01T00:00:00Z' }

const initialWorkspaceState = {
  folderPath: null,
  images: [],
  deletedImages: [],
  currentIndex: 0,
  isLoading: false,
  viewMode: 'browse' as const,
  deletedIndex: 0,
}

beforeEach(() => {
  vi.clearAllMocks()
  useWorkspaceStore.setState(initialWorkspaceState)
  useSettingsStore.setState({ recentFolders: [] })
})

describe('initial state', () => {
  it('has no folder, empty images, index 0, browse mode', () => {
    const state = useWorkspaceStore.getState()
    expect(state.folderPath).toBeNull()
    expect(state.images).toEqual([])
    expect(state.currentIndex).toBe(0)
    expect(state.viewMode).toBe('browse')
  })
})

describe('setCurrentIndex', () => {
  it('updates index when within bounds', () => {
    useWorkspaceStore.setState({ images: [IMAGE_A, IMAGE_B] })
    useWorkspaceStore.getState().setCurrentIndex(1)
    expect(useWorkspaceStore.getState().currentIndex).toBe(1)
  })

  it('ignores out-of-bounds index', () => {
    useWorkspaceStore.setState({ images: [IMAGE_A] })
    useWorkspaceStore.getState().setCurrentIndex(5)
    expect(useWorkspaceStore.getState().currentIndex).toBe(0)
  })

  it('ignores negative index', () => {
    useWorkspaceStore.setState({ images: [IMAGE_A, IMAGE_B] })
    useWorkspaceStore.getState().setCurrentIndex(-1)
    expect(useWorkspaceStore.getState().currentIndex).toBe(0)
  })
})

describe('nextImage / prevImage', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({ images: [IMAGE_A, IMAGE_B], currentIndex: 0 })
  })

  it('nextImage increments index', () => {
    useWorkspaceStore.getState().nextImage()
    expect(useWorkspaceStore.getState().currentIndex).toBe(1)
  })

  it('nextImage does not go past end', () => {
    useWorkspaceStore.setState({ currentIndex: 1 })
    useWorkspaceStore.getState().nextImage()
    expect(useWorkspaceStore.getState().currentIndex).toBe(1)
  })

  it('prevImage decrements index', () => {
    useWorkspaceStore.setState({ currentIndex: 1 })
    useWorkspaceStore.getState().prevImage()
    expect(useWorkspaceStore.getState().currentIndex).toBe(0)
  })

  it('prevImage does not go below 0', () => {
    useWorkspaceStore.getState().prevImage()
    expect(useWorkspaceStore.getState().currentIndex).toBe(0)
  })
})

describe('openFolder', () => {
  it('does nothing when dialog is cancelled', async () => {
    mockApi.openFolder.mockResolvedValue(null)
    await useWorkspaceStore.getState().openFolder()
    expect(useWorkspaceStore.getState().folderPath).toBeNull()
  })

  it('loads folder and images on success', async () => {
    mockApi.openFolder.mockResolvedValue({ folderPath: '/folder', images: [IMAGE_A, IMAGE_B] })
    mockApi.listDeleted.mockResolvedValue([IMAGE_C])
    await useWorkspaceStore.getState().openFolder()
    const state = useWorkspaceStore.getState()
    expect(state.folderPath).toBe('/folder')
    expect(state.images).toHaveLength(2)
    expect(state.currentIndex).toBe(0)
    expect(state.deletedImages).toHaveLength(1)
  })

  it('adds folder to recent folders', async () => {
    mockApi.openFolder.mockResolvedValue({ folderPath: '/new-folder', images: [] })
    mockApi.listDeleted.mockResolvedValue([])
    await useWorkspaceStore.getState().openFolder()
    expect(useSettingsStore.getState().recentFolders).toContain('/new-folder')
  })
})

describe('softDeleteCurrent', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      folderPath: '/folder',
      images: [IMAGE_A, IMAGE_B],
      currentIndex: 0,
    })
    mockApi.softDelete.mockResolvedValue(undefined)
    mockApi.listDeleted.mockResolvedValue([IMAGE_C])
  })

  it('optimistically removes image from list', async () => {
    await useWorkspaceStore.getState().softDeleteCurrent()
    expect(useWorkspaceStore.getState().images).toHaveLength(1)
    expect(useWorkspaceStore.getState().images[0].name).toBe('b.jpg')
  })

  it('calls api.softDelete with correct args', async () => {
    await useWorkspaceStore.getState().softDeleteCurrent()
    expect(mockApi.softDelete).toHaveBeenCalledWith(IMAGE_A.path, '/folder')
  })

  it('adjusts currentIndex when deleting last image', async () => {
    useWorkspaceStore.setState({ images: [IMAGE_A, IMAGE_B], currentIndex: 1 })
    await useWorkspaceStore.getState().softDeleteCurrent()
    expect(useWorkspaceStore.getState().currentIndex).toBe(0)
  })

  it('rolls back on API failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockApi.softDelete.mockRejectedValue(new Error('FS error'))
    await useWorkspaceStore.getState().softDeleteCurrent()
    expect(consoleSpy).toHaveBeenCalledWith('Failed to delete image:', expect.any(Error))
    expect(useWorkspaceStore.getState().images).toHaveLength(2)
    expect(useWorkspaceStore.getState().currentIndex).toBe(0)
    consoleSpy.mockRestore()
  })
})

describe('enterDeletedView / exitDeletedView', () => {
  it('sets viewMode to deleted and loads deleted images', async () => {
    useWorkspaceStore.setState({ folderPath: '/folder' })
    mockApi.listDeleted.mockResolvedValue([IMAGE_C])
    await useWorkspaceStore.getState().enterDeletedView()
    expect(useWorkspaceStore.getState().viewMode).toBe('deleted')
    expect(useWorkspaceStore.getState().deletedImages).toHaveLength(1)
    expect(useWorkspaceStore.getState().deletedIndex).toBe(0)
  })

  it('exitDeletedView sets viewMode back to browse', () => {
    useWorkspaceStore.setState({ viewMode: 'deleted' })
    useWorkspaceStore.getState().exitDeletedView()
    expect(useWorkspaceStore.getState().viewMode).toBe('browse')
  })
})

describe('nextDeletedImage / prevDeletedImage', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({ deletedImages: [IMAGE_C, IMAGE_A], deletedIndex: 0 })
  })

  it('increments deletedIndex', () => {
    useWorkspaceStore.getState().nextDeletedImage()
    expect(useWorkspaceStore.getState().deletedIndex).toBe(1)
  })

  it('does not go past end', () => {
    useWorkspaceStore.setState({ deletedIndex: 1 })
    useWorkspaceStore.getState().nextDeletedImage()
    expect(useWorkspaceStore.getState().deletedIndex).toBe(1)
  })

  it('decrements deletedIndex', () => {
    useWorkspaceStore.setState({ deletedIndex: 1 })
    useWorkspaceStore.getState().prevDeletedImage()
    expect(useWorkspaceStore.getState().deletedIndex).toBe(0)
  })

  it('does not go below 0', () => {
    useWorkspaceStore.getState().prevDeletedImage()
    expect(useWorkspaceStore.getState().deletedIndex).toBe(0)
  })
})
