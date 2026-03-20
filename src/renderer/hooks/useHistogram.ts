import { useState, useEffect, useRef } from 'react'
import type { HistogramData } from '../../preload/types'

const cache = new Map<string, HistogramData>()

export function useHistogram(imagePath: string | null) {
  const [histogram, setHistogram] = useState<HistogramData | null>(null)
  const [loading, setLoading] = useState(false)
  const currentPath = useRef<string | null>(null)

  useEffect(() => {
    if (!imagePath) {
      setHistogram(null)
      return
    }

    if (cache.has(imagePath)) {
      setHistogram(cache.get(imagePath)!)
      return
    }

    currentPath.current = imagePath
    setLoading(true)

    window.api.getHistogram(imagePath).then((data) => {
      if (currentPath.current !== imagePath) return
      cache.set(imagePath, data)
      setHistogram(data)
      setLoading(false)
    }).catch(() => {
      if (currentPath.current === imagePath) setLoading(false)
    })
  }, [imagePath])

  return { histogram, loading }
}
