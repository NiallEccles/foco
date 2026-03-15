import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FilmStripOrientation = 'bottom' | 'left' | 'right'

const MAX_RECENT = 8

interface SettingsState {
  filmStripOrientation: FilmStripOrientation
  setFilmStripOrientation: (orientation: FilmStripOrientation) => void
  exifPanelOpen: boolean
  toggleExifPanel: () => void
  recentFolders: string[]
  addRecentFolder: (path: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      filmStripOrientation: 'bottom',
      setFilmStripOrientation: (orientation) => set({ filmStripOrientation: orientation }),
      exifPanelOpen: false,
      toggleExifPanel: () => set((s) => ({ exifPanelOpen: !s.exifPanelOpen })),
      recentFolders: [],
      addRecentFolder: (path) =>
        set((s) => ({
          recentFolders: [path, ...s.recentFolders.filter((p) => p !== path)].slice(0, MAX_RECENT)
        }))
    }),
    { name: 'foco-settings' }
  )
)
