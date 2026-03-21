import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from './settingsStore'

const initialState = {
  filmStripOrientation: 'bottom' as const,
  exifPanelOpen: false,
  showHistogram: false,
  showShortcuts: false,
  recentFolders: [],
}

beforeEach(() => {
  useSettingsStore.setState(initialState)
  localStorage.clear()
})

describe('initial state', () => {
  it('filmStripOrientation defaults to bottom', () => {
    expect(useSettingsStore.getState().filmStripOrientation).toBe('bottom')
  })

  it('exifPanelOpen defaults to false', () => {
    expect(useSettingsStore.getState().exifPanelOpen).toBe(false)
  })

  it('showHistogram defaults to false', () => {
    expect(useSettingsStore.getState().showHistogram).toBe(false)
  })

  it('recentFolders defaults to empty array', () => {
    expect(useSettingsStore.getState().recentFolders).toEqual([])
  })
})

describe('setFilmStripOrientation', () => {
  it('updates orientation to left', () => {
    useSettingsStore.getState().setFilmStripOrientation('left')
    expect(useSettingsStore.getState().filmStripOrientation).toBe('left')
  })

  it('updates orientation to right', () => {
    useSettingsStore.getState().setFilmStripOrientation('right')
    expect(useSettingsStore.getState().filmStripOrientation).toBe('right')
  })
})

describe('toggleExifPanel', () => {
  it('flips exifPanelOpen from false to true', () => {
    useSettingsStore.getState().toggleExifPanel()
    expect(useSettingsStore.getState().exifPanelOpen).toBe(true)
  })

  it('flips exifPanelOpen from true to false', () => {
    useSettingsStore.setState({ exifPanelOpen: true })
    useSettingsStore.getState().toggleExifPanel()
    expect(useSettingsStore.getState().exifPanelOpen).toBe(false)
  })
})

describe('toggleHistogram', () => {
  it('flips showHistogram', () => {
    useSettingsStore.getState().toggleHistogram()
    expect(useSettingsStore.getState().showHistogram).toBe(true)
    useSettingsStore.getState().toggleHistogram()
    expect(useSettingsStore.getState().showHistogram).toBe(false)
  })
})

describe('toggleShortcuts', () => {
  it('flips showShortcuts', () => {
    useSettingsStore.getState().toggleShortcuts()
    expect(useSettingsStore.getState().showShortcuts).toBe(true)
    useSettingsStore.getState().toggleShortcuts()
    expect(useSettingsStore.getState().showShortcuts).toBe(false)
  })
})

describe('addRecentFolder', () => {
  it('prepends new folder to the list', () => {
    useSettingsStore.getState().addRecentFolder('/photos/2024')
    expect(useSettingsStore.getState().recentFolders[0]).toBe('/photos/2024')
  })

  it('de-duplicates: moves existing entry to front', () => {
    useSettingsStore.getState().addRecentFolder('/a')
    useSettingsStore.getState().addRecentFolder('/b')
    useSettingsStore.getState().addRecentFolder('/a')
    const folders = useSettingsStore.getState().recentFolders
    expect(folders[0]).toBe('/a')
    expect(folders.filter((f) => f === '/a').length).toBe(1)
  })

  it('caps list at 8 entries', () => {
    for (let i = 0; i < 10; i++) {
      useSettingsStore.getState().addRecentFolder(`/folder-${i}`)
    }
    expect(useSettingsStore.getState().recentFolders.length).toBe(8)
  })
})
