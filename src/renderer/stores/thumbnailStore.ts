import { create } from 'zustand'
import { api } from '../services/api'

const MAX_CONCURRENT = 4

interface QueueItem {
  imagePath: string
  folderPath: string
}

interface ThumbnailState {
  cache: Map<string, string> // imagePath → safe-file thumbnail URL
  pending: Set<string> // image paths currently in-flight
  queue: QueueItem[]
  requestThumbnail: (imagePath: string, folderPath: string) => void
  _processQueue: () => void
}

export const useThumbnailStore = create<ThumbnailState>((set, get) => ({
  cache: new Map(),
  pending: new Set(),
  queue: [],

  requestThumbnail(imagePath, folderPath) {
    const { cache, pending, queue } = get()
    if (cache.has(imagePath) || pending.has(imagePath)) return
    if (queue.some((item) => item.imagePath === imagePath)) return

    set({ queue: [...queue, { imagePath, folderPath }] })
    get()._processQueue()
  },

  _processQueue() {
    const { pending, queue } = get()
    if (pending.size >= MAX_CONCURRENT || queue.length === 0) return

    const next = queue[0]
    const newPending = new Set(pending)
    newPending.add(next.imagePath)
    set({ queue: queue.slice(1), pending: newPending })

    api
      .getThumbnail(next.imagePath, next.folderPath)
      .then((thumbPath) => {
        const { pending: p, cache: c } = get()
        const newCache = new Map(c)
        newCache.set(next.imagePath, `safe-file://${thumbPath}`)
        const newP = new Set(p)
        newP.delete(next.imagePath)
        set({ cache: newCache, pending: newP })
        get()._processQueue()
      })
      .catch(() => {
        const { pending: p } = get()
        const newP = new Set(p)
        newP.delete(next.imagePath)
        set({ pending: newP })
        get()._processQueue()
      })
  }
}))
