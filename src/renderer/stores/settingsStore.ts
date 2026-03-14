import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FilmStripOrientation = 'bottom' | 'left' | 'right'

interface SettingsState {
  filmStripOrientation: FilmStripOrientation
  setFilmStripOrientation: (orientation: FilmStripOrientation) => void
  exifPanelOpen: boolean
  toggleExifPanel: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      filmStripOrientation: 'bottom',
      setFilmStripOrientation: (orientation) => set({ filmStripOrientation: orientation }),
      exifPanelOpen: false,
      toggleExifPanel: () => set((s) => ({ exifPanelOpen: !s.exifPanelOpen }))
    }),
    { name: 'foco-settings' }
  )
)
