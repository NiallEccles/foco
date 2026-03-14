import { useState, useEffect } from 'react'
import type { ExifData } from '../../preload/types'

const cache = new Map<string, ExifData | null>()

export function useExif(imagePath: string | null): { exif: ExifData | null; loading: boolean } {
  const [exif, setExif] = useState<ExifData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!imagePath) {
      setExif(null)
      return
    }

    if (cache.has(imagePath)) {
      setExif(cache.get(imagePath) ?? null)
      return
    }

    setLoading(true)
    window.api.getExifData(imagePath).then((data) => {
      cache.set(imagePath, data)
      setExif(data)
      setLoading(false)
    })
  }, [imagePath])

  return { exif, loading }
}
