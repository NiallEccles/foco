import type { FocoAPI } from '../../preload/types'

declare global {
  interface Window {
    api: FocoAPI
  }
}

export const api = window.api
